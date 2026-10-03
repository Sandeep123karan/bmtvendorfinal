const mongoose = require("mongoose");
const streamifier = require("streamifier");

const CruiseCabin = require("../models/CruiseCabin.model");
const CruiseShip = require("../models/CruiseShip.model");
const Vendor = require("../models/Vendor.model");

const cloudinary = require("../config/cloudinary");

// =========================================================
// GET LOGGED-IN VENDOR ID
// =========================================================

const getVendorId = (req) => {
  return (
    req.vendor?._id ||
    req.vendor?.id ||
    req.user?._id ||
    req.user?.id ||
    req.vendorId ||
    null
  );
};

// =========================================================
// CHECK CRUISE VENDOR
// =========================================================

const getCruiseVendor = async (req) => {
  const vendorId = getVendorId(req);

  if (!vendorId) {
    return {
      error: {
        status: 401,
        code: "UNAUTHORIZED",
        message: "Vendor authentication required.",
      },
    };
  }

  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    return {
      error: {
        status: 401,
        code: "INVALID_VENDOR_ID",
        message: "Invalid vendor ID.",
      },
    };
  }

  const vendor = await Vendor.findById(vendorId);

  if (!vendor) {
    return {
      error: {
        status: 404,
        code: "VENDOR_NOT_FOUND",
        message: "Vendor not found.",
      },
    };
  }

  const vertical = String(
    vendor.selectedVertical ||
      vendor.vertical ||
      ""
  )
    .trim()
    .toLowerCase();

  if (vertical !== "cruise") {
    return {
      error: {
        status: 403,
        code: "CRUISE_ACCESS_REQUIRED",
        message:
          "This account is not configured as a cruise vendor.",
      },
    };
  }

  return {
    vendor,
    vendorId,
  };
};

// =========================================================
// CLOUDINARY UPLOAD
// =========================================================

const uploadOneFile = async (
  file,
  folder = "cruise/cabins"
) => {
  if (!file || !file.buffer) {
    return "";
  }

  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          if (!result?.secure_url) {
            return reject(
              new Error(
                "Cloudinary upload failed."
              )
            );
          }

          resolve(result.secure_url);
        }
      );

    streamifier
      .createReadStream(file.buffer)
      .pipe(uploadStream);
  });
};

// =========================================================
// MULTIPLE CLOUDINARY UPLOADS
// =========================================================

const uploadMultipleFiles = async (
  files = [],
  folder = "cruise/cabins"
) => {
  if (
    !Array.isArray(files) ||
    files.length === 0
  ) {
    return [];
  }

  const urls = [];

  for (const file of files) {
    const url = await uploadOneFile(
      file,
      folder
    );

    if (url) {
      urls.push(url);
    }
  }

  return urls;
};

// =========================================================
// PARSE ARRAY
// =========================================================
//
// Supports:
//
// amenities=Pool
// amenities=Gym
//
// OR
//
// amenities=["Pool","Gym"]
//
// OR
//
// amenities=Pool,Gym,Spa
// =========================================================

const parseArrayField = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        String(item).trim()
      )
      .filter(Boolean);
  }

  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) =>
            String(item).trim()
          )
          .filter(Boolean);
      }
    } catch (error) {
      // Continue with comma-separated format
    }

    return value
      .split(",")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  }

  return [];
};

// =========================================================
// NUMBER HELPER
// =========================================================

const toNumberOrNull = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

// =========================================================
// VALIDATE SHIP OWNERSHIP
// =========================================================

const getVendorShip = async (
  shipId,
  vendorId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      shipId
    )
  ) {
    return {
      error: {
        status: 400,
        code: "INVALID_SHIP_ID",
        message: "Invalid cruise ship ID.",
      },
    };
  }

  const ship =
    await CruiseShip.findOne({
      _id: shipId,
      vendorId,
    });

  if (!ship) {
    return {
      error: {
        status: 404,
        code: "SHIP_NOT_FOUND",
        message:
          "Cruise ship not found or does not belong to this vendor.",
      },
    };
  }

  return { ship };
};

// =========================================================
// CREATE CABIN
// =========================================================
// POST /api/cruise-cabins
// Content-Type: multipart/form-data
// =========================================================

exports.createCabin = async (
  req,
  res
) => {
  try {
    // =====================================================
    // CHECK VENDOR
    // =====================================================

    const vendorResult =
      await getCruiseVendor(req);

    if (vendorResult.error) {
      return res
        .status(
          vendorResult.error.status
        )
        .json({
          success: false,
          code:
            vendorResult.error.code,
          message:
            vendorResult.error.message,
        });
    }

    const { vendorId } =
      vendorResult;

    // =====================================================
    // BODY
    // =====================================================

    const {
      shipId,
      cabinName,
      cabinNumber,
      cabinType,
      deckNumber,
      deckName,
      maxGuests,
      maxAdults,
      maxChildren,
      bedType,
      numberOfBeds,
      cabinSize,
      cabinSizeUnit,
      description,
      amenities,
      basePrice,
      currency,
      status,
      available,
    } = req.body || {};

    // =====================================================
    // REQUIRED FIELDS
    // =====================================================

    if (!shipId) {
      return res.status(400).json({
        success: false,
        code: "SHIP_ID_REQUIRED",
        message:
          "Cruise ship ID is required.",
      });
    }

    if (
      !cabinName ||
      !String(cabinName).trim()
    ) {
      return res.status(400).json({
        success: false,
        code: "CABIN_NAME_REQUIRED",
        message:
          "Cabin name is required.",
      });
    }

    if (!cabinType) {
      return res.status(400).json({
        success: false,
        code: "CABIN_TYPE_REQUIRED",
        message:
          "Cabin type is required.",
      });
    }

    if (
      maxGuests === undefined ||
      maxGuests === ""
    ) {
      return res.status(400).json({
        success: false,
        code: "MAX_GUESTS_REQUIRED",
        message:
          "Maximum guests is required.",
      });
    }

    // =====================================================
    // CHECK SHIP OWNERSHIP
    // =====================================================

    const shipResult =
      await getVendorShip(
        shipId,
        vendorId
      );

    if (shipResult.error) {
      return res
        .status(
          shipResult.error.status
        )
        .json({
          success: false,
          code:
            shipResult.error.code,
          message:
            shipResult.error.message,
        });
    }

    // =====================================================
    // CLEAN CABIN NAME
    // =====================================================

    const cleanCabinName =
      String(cabinName).trim();

    const cleanCabinNumber =
      cabinNumber
        ? String(
            cabinNumber
          ).trim()
        : "";

    // =====================================================
    // DUPLICATE CABIN CHECK
    // =====================================================

    const duplicateQuery = {
      vendorId,
      shipId,
      cabinName:
        cleanCabinName,
    };

    if (cleanCabinNumber) {
      duplicateQuery.cabinNumber =
        cleanCabinNumber;
    }

    const existingCabin =
      await CruiseCabin.findOne(
        duplicateQuery
      );

    if (existingCabin) {
      return res.status(409).json({
        success: false,
        code: "CABIN_ALREADY_EXISTS",
        message:
          "A cabin with this name/number already exists for this ship.",
      });
    }

    // =====================================================
    // FILES
    // =====================================================

    const coverImageFile =
      req.files?.coverImage?.[0] ||
      null;

    const imageFiles =
      req.files?.images || [];

    // =====================================================
    // CLOUDINARY COVER
    // =====================================================

    const coverImageUrl =
      await uploadOneFile(
        coverImageFile,
        "cruise/cabins/covers"
      );

    // =====================================================
    // CLOUDINARY IMAGES
    // =====================================================

    const imageUrls =
      await uploadMultipleFiles(
        imageFiles,
        "cruise/cabins/images"
      );

    // =====================================================
    // CREATE CABIN
    // =====================================================

    const cabin =
      await CruiseCabin.create({
        vendorId,

        shipId,

        cabinName:
          cleanCabinName,

        cabinNumber:
          cleanCabinNumber,

        cabinType,

        deckNumber:
          toNumberOrNull(
            deckNumber
          ),

        deckName: deckName
          ? String(
              deckName
            ).trim()
          : "",

        maxGuests:
          toNumberOrNull(
            maxGuests
          ),

        maxAdults:
          toNumberOrNull(
            maxAdults
          ) ?? 0,

        maxChildren:
          toNumberOrNull(
            maxChildren
          ) ?? 0,

        bedType:
          bedType || "double",

        numberOfBeds:
          toNumberOrNull(
            numberOfBeds
          ) ?? 1,

        cabinSize:
          toNumberOrNull(
            cabinSize
          ),

        cabinSizeUnit:
          cabinSizeUnit || "sqm",

        description:
          description
            ? String(
                description
              ).trim()
            : "",

        amenities:
          parseArrayField(
            amenities
          ),

        basePrice:
          toNumberOrNull(
            basePrice
          ) ?? 0,

        currency:
          currency
            ? String(
                currency
              ).trim()
            : "INR",

        coverImage:
          coverImageUrl,

        images:
          imageUrls,

        status:
          status || "draft",

        available:
          available === undefined
            ? true
            : String(
                available
              ).toLowerCase() ===
              "true",
      });

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(201).json({
      success: true,
      message:
        "Cruise cabin created successfully.",
      cabin,
    });
  } catch (error) {
    console.error(
      "Create Cruise Cabin Error:",
      error
    );

    return res.status(500).json({
      success: false,
      code:
        "CREATE_CRUISE_CABIN_FAILED",
      message:
        error.message ||
        "Failed to create cruise cabin.",
    });
  }
};

// =========================================================
// GET ALL CABINS
// =========================================================
// GET /api/cruise-cabins
// Optional:
// ?shipId=SHIP_ID
// =========================================================

exports.getCabins = async (
  req,
  res
) => {
  try {
    const vendorResult =
      await getCruiseVendor(req);

    if (vendorResult.error) {
      return res
        .status(
          vendorResult.error.status
        )
        .json({
          success: false,
          code:
            vendorResult.error.code,
          message:
            vendorResult.error.message,
        });
    }

    const { vendorId } =
      vendorResult;

    const filter = {
      vendorId,
    };

    // =====================================================
    // OPTIONAL SHIP FILTER
    // =====================================================

    if (req.query.shipId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.query.shipId
        )
      ) {
        return res.status(400).json({
          success: false,
          code:
            "INVALID_SHIP_ID",
          message:
            "Invalid cruise ship ID.",
        });
      }

      filter.shipId =
        req.query.shipId;
    }

    // =====================================================
    // FETCH
    // =====================================================

    const cabins =
      await CruiseCabin.find(filter)
        .populate(
          "shipId",
          "shipName cruiseLineName cruiseType"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: cabins.length,
      cabins,
    });
  } catch (error) {
    console.error(
      "Get Cruise Cabins Error:",
      error
    );

    return res.status(500).json({
      success: false,
      code:
        "GET_CRUISE_CABINS_FAILED",
      message:
        error.message ||
        "Failed to fetch cruise cabins.",
    });
  }
};

// =========================================================
// GET SINGLE CABIN
// =========================================================
// GET /api/cruise-cabins/:id
// =========================================================

exports.getCabinById = async (
  req,
  res
) => {
  try {
    const vendorResult =
      await getCruiseVendor(req);

    if (vendorResult.error) {
      return res
        .status(
          vendorResult.error.status
        )
        .json({
          success: false,
          code:
            vendorResult.error.code,
          message:
            vendorResult.error.message,
        });
    }

    const { vendorId } =
      vendorResult;

    const { id } =
      req.params;

    // =====================================================
    // VALIDATE CABIN ID
    // =====================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        code: "INVALID_CABIN_ID",
        message:
          "Invalid cabin ID.",
      });
    }

    // =====================================================
    // FIND CABIN
    // =====================================================

    const cabin =
      await CruiseCabin.findOne({
        _id: id,
        vendorId,
      }).populate(
        "shipId",
        "shipName cruiseLineName cruiseType"
      );

    if (!cabin) {
      return res.status(404).json({
        success: false,
        code: "CABIN_NOT_FOUND",
        message:
          "Cruise cabin not found.",
      });
    }

    return res.status(200).json({
      success: true,
      cabin,
    });
  } catch (error) {
    console.error(
      "Get Cruise Cabin Error:",
      error
    );

    return res.status(500).json({
      success: false,
      code:
        "GET_CRUISE_CABIN_FAILED",
      message:
        error.message ||
        "Failed to fetch cruise cabin.",
    });
  }
};

// =========================================================
// UPDATE CABIN
// =========================================================
// PUT /api/cruise-cabins/:id
// =========================================================

exports.updateCabin = async (
  req,
  res
) => {
  try {
    const vendorResult =
      await getCruiseVendor(req);

    if (vendorResult.error) {
      return res
        .status(
          vendorResult.error.status
        )
        .json({
          success: false,
          code:
            vendorResult.error.code,
          message:
            vendorResult.error.message,
        });
    }

    const { vendorId } =
      vendorResult;

    const { id } =
      req.params;

    // =====================================================
    // VALIDATE CABIN ID
    // =====================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        code: "INVALID_CABIN_ID",
        message:
          "Invalid cabin ID.",
      });
    }

    // =====================================================
    // FIND EXISTING CABIN
    // =====================================================

    const cabin =
      await CruiseCabin.findOne({
        _id: id,
        vendorId,
      });

    if (!cabin) {
      return res.status(404).json({
        success: false,
        code: "CABIN_NOT_FOUND",
        message:
          "Cruise cabin not found.",
      });
    }

    // =====================================================
    // BODY
    // =====================================================

    const {
      shipId,
      cabinName,
      cabinNumber,
      cabinType,
      deckNumber,
      deckName,
      maxGuests,
      maxAdults,
      maxChildren,
      bedType,
      numberOfBeds,
      cabinSize,
      cabinSizeUnit,
      description,
      amenities,
      basePrice,
      currency,
      status,
      available,
    } = req.body || {};

    // =====================================================
    // SHIP CHANGE
    // =====================================================

    if (
      shipId !== undefined &&
      String(shipId) !==
        String(cabin.shipId)
    ) {
      const shipResult =
        await getVendorShip(
          shipId,
          vendorId
        );

      if (shipResult.error) {
        return res
          .status(
            shipResult.error.status
          )
          .json({
            success: false,
            code:
              shipResult.error.code,
            message:
              shipResult.error.message,
          });
      }

      cabin.shipId =
        shipId;
    }

    // =====================================================
    // CABIN NAME
    // =====================================================

    if (
      cabinName !== undefined
    ) {
      const cleanName =
        String(
          cabinName
        ).trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          code:
            "CABIN_NAME_REQUIRED",
          message:
            "Cabin name is required.",
        });
      }

      cabin.cabinName =
        cleanName;
    }

    // =====================================================
    // CABIN NUMBER
    // =====================================================

    if (
      cabinNumber !== undefined
    ) {
      cabin.cabinNumber =
        String(
          cabinNumber
        ).trim();
    }

    // =====================================================
    // DUPLICATE CHECK
    // =====================================================

    const duplicate =
      await CruiseCabin.findOne({
        vendorId,

        shipId:
          cabin.shipId,

        cabinName:
          cabin.cabinName,

        _id: {
          $ne: cabin._id,
        },
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        code:
          "CABIN_ALREADY_EXISTS",
        message:
          "Another cabin with this name already exists for this ship.",
      });
    }

    // =====================================================
    // BASIC FIELDS
    // =====================================================

    if (
      cabinType !== undefined
    ) {
      cabin.cabinType =
        cabinType;
    }

    if (
      deckNumber !== undefined
    ) {
      cabin.deckNumber =
        toNumberOrNull(
          deckNumber
        );
    }

    if (
      deckName !== undefined
    ) {
      cabin.deckName =
        String(
          deckName
        ).trim();
    }

    // =====================================================
    // CAPACITY
    // =====================================================

    if (
      maxGuests !== undefined
    ) {
      const guests =
        toNumberOrNull(
          maxGuests
        );

      if (
        guests === null ||
        guests < 1
      ) {
        return res.status(400).json({
          success: false,
          code:
            "INVALID_MAX_GUESTS",
          message:
            "Maximum guests must be at least 1.",
        });
      }

      cabin.maxGuests =
        guests;
    }

    if (
      maxAdults !== undefined
    ) {
      cabin.maxAdults =
        toNumberOrNull(
          maxAdults
        ) ?? 0;
    }

    if (
      maxChildren !== undefined
    ) {
      cabin.maxChildren =
        toNumberOrNull(
          maxChildren
        ) ?? 0;
    }

    // =====================================================
    // BED DETAILS
    // =====================================================

    if (
      bedType !== undefined
    ) {
      cabin.bedType =
        bedType;
    }

    if (
      numberOfBeds !== undefined
    ) {
      cabin.numberOfBeds =
        toNumberOrNull(
          numberOfBeds
        ) ?? 0;
    }

    // =====================================================
    // SIZE
    // =====================================================

    if (
      cabinSize !== undefined
    ) {
      cabin.cabinSize =
        toNumberOrNull(
          cabinSize
        );
    }

    if (
      cabinSizeUnit !== undefined
    ) {
      cabin.cabinSizeUnit =
        cabinSizeUnit;
    }

    // =====================================================
    // DESCRIPTION
    // =====================================================

    if (
      description !== undefined
    ) {
      cabin.description =
        String(
          description
        ).trim();
    }

    // =====================================================
    // AMENITIES
    // =====================================================

    if (
      amenities !== undefined
    ) {
      cabin.amenities =
        parseArrayField(
          amenities
        );
    }

    // =====================================================
    // PRICE
    // =====================================================

    if (
      basePrice !== undefined
    ) {
      const price =
        toNumberOrNull(
          basePrice
        );

      if (
        price !== null &&
        price < 0
      ) {
        return res.status(400).json({
          success: false,
          code:
            "INVALID_BASE_PRICE",
          message:
            "Base price cannot be negative.",
        });
      }

      cabin.basePrice =
        price ?? 0;
    }

    if (
      currency !== undefined
    ) {
      cabin.currency =
        String(
          currency
        ).trim();
    }

    // =====================================================
    // STATUS
    // =====================================================

    if (
      status !== undefined
    ) {
      cabin.status =
        status;
    }

    if (
      available !== undefined
    ) {
      cabin.available =
        String(
          available
        ).toLowerCase() ===
        "true";
    }

    // =====================================================
    // FILES
    // =====================================================

    const coverImageFile =
      req.files?.coverImage?.[0] ||
      null;

    const imageFiles =
      req.files?.images || [];

    // =====================================================
    // NEW COVER IMAGE
    // =====================================================

    if (coverImageFile) {
      const coverUrl =
        await uploadOneFile(
          coverImageFile,
          "cruise/cabins/covers"
        );

      cabin.coverImage =
        coverUrl;
    }

    // =====================================================
    // NEW CABIN IMAGES
    // =====================================================

    if (imageFiles.length > 0) {
      const newImageUrls =
        await uploadMultipleFiles(
          imageFiles,
          "cruise/cabins/images"
        );

      cabin.images = [
        ...(cabin.images || []),
        ...newImageUrls,
      ];
    }

    // =====================================================
    // SAVE
    // =====================================================

    await cabin.save();

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      message:
        "Cruise cabin updated successfully.",
      cabin,
    });
  } catch (error) {
    console.error(
      "Update Cruise Cabin Error:",
      error
    );

    return res.status(500).json({
      success: false,
      code:
        "UPDATE_CRUISE_CABIN_FAILED",
      message:
        error.message ||
        "Failed to update cruise cabin.",
    });
  }
};

// =========================================================
// DELETE CABIN
// =========================================================
// DELETE /api/cruise-cabins/:id
// =========================================================

exports.deleteCabin = async (
  req,
  res
) => {
  try {
    const vendorResult =
      await getCruiseVendor(req);

    if (vendorResult.error) {
      return res
        .status(
          vendorResult.error.status
        )
        .json({
          success: false,
          code:
            vendorResult.error.code,
          message:
            vendorResult.error.message,
        });
    }

    const { vendorId } =
      vendorResult;

    const { id } =
      req.params;

    // =====================================================
    // VALIDATE ID
    // =====================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        code: "INVALID_CABIN_ID",
        message:
          "Invalid cabin ID.",
      });
    }

    // =====================================================
    // DELETE OWN CABIN ONLY
    // =====================================================

    const cabin =
      await CruiseCabin.findOneAndDelete({
        _id: id,
        vendorId,
      });

    if (!cabin) {
      return res.status(404).json({
        success: false,
        code: "CABIN_NOT_FOUND",
        message:
          "Cruise cabin not found.",
      });
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      message:
        "Cruise cabin deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Cruise Cabin Error:",
      error
    );

    return res.status(500).json({
      success: false,
      code:
        "DELETE_CRUISE_CABIN_FAILED",
      message:
        error.message ||
        "Failed to delete cruise cabin.",
    });
  }
};