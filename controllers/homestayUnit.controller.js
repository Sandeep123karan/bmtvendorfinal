const mongoose = require("mongoose");

const Homestay = require("../models/Homestay.model");
const HomestayUnit = require("../models/HomestayUnit.model");
const cloudinary = require("../config/cloudinary");


/* ============================================================
   HELPERS
============================================================ */

const parseArray = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      return [value];
    } catch (error) {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};


const toBoolean = (
  value,
  defaultValue = false
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  if (
    value === true ||
    value === "true" ||
    value === "1" ||
    value === 1
  ) {
    return true;
  }

  if (
    value === false ||
    value === "false" ||
    value === "0" ||
    value === 0
  ) {
    return false;
  }

  return defaultValue;
};


const toNumber = (
  value,
  defaultValue = 0
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  const number = Number(value);

  return Number.isNaN(number)
    ? defaultValue
    : number;
};


const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


/* ============================================================
   CLOUDINARY UPLOAD
============================================================ */

const uploadMany = async (
  files = [],
  folder
) => {
  const urls = [];

  for (const file of files) {
    const result =
      await cloudinary.uploader.upload(
        file.path,
        {
          folder,
          resource_type: "auto",
        }
      );

    urls.push(result.secure_url);
  }

  return urls;
};


/* ============================================================
   CLOUDINARY DELETE
============================================================ */

const deleteFromCloudinary = async (
  imageUrl
) => {
  try {
    if (!imageUrl) return;

    const parts = imageUrl.split("/");

    const uploadIndex =
      parts.indexOf("upload");

    if (uploadIndex === -1) return;

    let publicPath = parts
      .slice(uploadIndex + 1)
      .join("/");

    publicPath =
      publicPath.replace(
        /^v\d+\//,
        ""
      );

    publicPath =
      publicPath.replace(
        /\.[^/.]+$/,
        ""
      );

    await cloudinary.uploader.destroy(
      publicPath,
      {
        resource_type: "image",
      }
    );
  } catch (error) {
    console.error(
      "Cloudinary Delete Error:",
      error.message
    );
  }
};


/* ============================================================
   FIND VENDOR HOMESTAY
============================================================ */

const findVendorHomestay = async (
  homestayId,
  vendorId
) => {
  return Homestay.findOne({
    _id: homestayId,
    vendor: vendorId,
  });
};


/* ============================================================
   FIND VENDOR UNIT
============================================================ */

const findVendorUnit = async (
  unitId,
  vendorId
) => {
  return HomestayUnit.findOne({
    _id: unitId,
    vendor: vendorId,
  });
};


/* ============================================================
   CREATE UNIT
============================================================ */

exports.createUnit = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    const {
      homestayId,

      unitName,
      unitType,
      description,
      shortDescription,

      roomSize,
      roomSizeUnit,
      floorNumber,
      viewType,

      maxGuests,
      adults,
      children,

      bedrooms,
      beds,
      bedType,
      extraBedAvailable,
      extraBedCharge,

      bathrooms,
      bathroomType,

      basePrice,
      weekendPrice,
      holidayPrice,
      extraGuestPrice,

      taxPercentage,
      serviceChargePercentage,

      discountType,
      discountValue,
      offerPrice,

      totalUnits,

      inventoryType,

      instantBooking,
      bookingConfirmationRequired,

      minimumStay,
      maximumStay,

      refundable,
      freeCancellation,
      cancellationDeadlineHours,
      cancellationPolicy,

      smokingAllowed,
      petsAllowed,
      childrenAllowed,
      partiesAllowed,
      localIdAllowed,
      coupleFriendly,

      mealPlan,
    } = req.body;


    /* ========================================================
       VALIDATION
    ======================================================== */

    if (!homestayId) {
      return res.status(400).json({
        success: false,
        message:
          "Homestay ID is required.",
      });
    }


    if (
      !isValidObjectId(homestayId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid homestay ID.",
      });
    }


    if (!unitName) {
      return res.status(400).json({
        success: false,
        message:
          "Unit name is required.",
      });
    }


    if (!unitType) {
      return res.status(400).json({
        success: false,
        message:
          "Unit type is required.",
      });
    }


    if (
      maxGuests === undefined ||
      maxGuests === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum guests is required.",
      });
    }


    if (
      basePrice === undefined ||
      basePrice === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Base price is required.",
      });
    }


    if (
      totalUnits === undefined ||
      totalUnits === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Total units is required.",
      });
    }


    /* ========================================================
       CHECK HOMESTAY OWNERSHIP
    ======================================================== */

    const homestay =
      await findVendorHomestay(
        homestayId,
        vendorId
      );

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message:
          "Homestay not found or you don't have access to it.",
      });
    }


    /* ========================================================
       DUPLICATE UNIT CHECK
    ======================================================== */

    const existingUnit =
      await HomestayUnit.findOne({
        homestay: homestayId,
        vendor: vendorId,
        unitName: unitName.trim(),
      });

    if (existingUnit) {
      return res.status(409).json({
        success: false,
        message:
          "A unit with this name already exists in this homestay.",
      });
    }


    /* ========================================================
       FILE UPLOAD
    ======================================================== */

    let coverImage = "";
    let images = [];
    let videos = [];


    if (
      req.files?.coverImage?.length
    ) {
      const uploaded =
        await uploadMany(
          req.files.coverImage,
          "homestays/units/cover"
        );

      coverImage =
        uploaded[0] || "";
    }


    if (
      req.files?.images?.length
    ) {
      images =
        await uploadMany(
          req.files.images,
          "homestays/units/images"
        );
    }


    if (
      req.files?.videos?.length
    ) {
      videos =
        await uploadMany(
          req.files.videos,
          "homestays/units/videos"
        );
    }


    /* ========================================================
       CREATE UNIT
    ======================================================== */

    const unit =
      await HomestayUnit.create({

        /* Relations */

        homestay: homestayId,

        vendor: vendorId,


        /* Basic */

        unitName:
          unitName.trim(),

        unitType,

        description:
          description || "",

        shortDescription:
          shortDescription || "",


        /* Size */

        roomSize:
          toNumber(roomSize, 0),

        roomSizeUnit:
          roomSizeUnit || "sqft",

        floorNumber:
          floorNumber || "",

        viewType:
          viewType || "no-view",


        /* Capacity */

        maxGuests:
          toNumber(maxGuests, 1),

        adults:
          toNumber(adults, 1),

        children:
          toNumber(children, 0),


        /* Beds */

        bedrooms:
          toNumber(bedrooms, 1),

        beds:
          toNumber(beds, 1),

        bedType:
          bedType || "double",

        extraBedAvailable:
          toBoolean(
            extraBedAvailable
          ),

        extraBedCharge:
          toNumber(
            extraBedCharge,
            0
          ),


        /* Bathroom */

        bathrooms:
          toNumber(bathrooms, 1),

        bathroomType:
          bathroomType || "private",


        /* Amenities */

        amenities:
          parseArray(
            req.body.amenities
          ),

        wifi:
          toBoolean(
            req.body.wifi,
            true
          ),

        airConditioning:
          toBoolean(
            req.body.airConditioning
          ),

        heater:
          toBoolean(
            req.body.heater
          ),

        tv:
          toBoolean(
            req.body.tv
          ),

        smartTv:
          toBoolean(
            req.body.smartTv
          ),

        balcony:
          toBoolean(
            req.body.balcony
          ),

        terrace:
          toBoolean(
            req.body.terrace
          ),

        kitchen:
          toBoolean(
            req.body.kitchen
          ),

        kitchenette:
          toBoolean(
            req.body.kitchenette
          ),

        refrigerator:
          toBoolean(
            req.body.refrigerator
          ),

        minibar:
          toBoolean(
            req.body.minibar
          ),

        wardrobe:
          toBoolean(
            req.body.wardrobe,
            true
          ),

        workDesk:
          toBoolean(
            req.body.workDesk
          ),

        washingMachine:
          toBoolean(
            req.body.washingMachine
          ),

        iron:
          toBoolean(
            req.body.iron
          ),


        /* Bathroom Features */

        bathtub:
          toBoolean(
            req.body.bathtub
          ),

        shower:
          toBoolean(
            req.body.shower,
            true
          ),

        hotWater:
          toBoolean(
            req.body.hotWater,
            true
          ),

        toiletries:
          toBoolean(
            req.body.toiletries,
            true
          ),

        hairDryer:
          toBoolean(
            req.body.hairDryer
          ),


        /* Meals */

        breakfastIncluded:
          toBoolean(
            req.body.breakfastIncluded
          ),

        lunchIncluded:
          toBoolean(
            req.body.lunchIncluded
          ),

        dinnerIncluded:
          toBoolean(
            req.body.dinnerIncluded
          ),

        mealPlan:
          mealPlan || "room-only",


        /* Pricing */

        basePrice:
          toNumber(
            basePrice,
            0
          ),

        weekendPrice:
          toNumber(
            weekendPrice,
            0
          ),

        holidayPrice:
          toNumber(
            holidayPrice,
            0
          ),

        extraGuestPrice:
          toNumber(
            extraGuestPrice,
            0
          ),

        taxPercentage:
          toNumber(
            taxPercentage,
            0
          ),

        serviceChargePercentage:
          toNumber(
            serviceChargePercentage,
            0
          ),


        /* Discount */

        discountType:
          discountType || "none",

        discountValue:
          toNumber(
            discountValue,
            0
          ),

        offerPrice:
          toNumber(
            offerPrice,
            0
          ),


        /* Inventory */

        totalUnits:
          toNumber(
            totalUnits,
            1
          ),

        inventoryType:
          inventoryType ||
          "individual-units",


        /* Booking */

        instantBooking:
          toBoolean(
            instantBooking,
            true
          ),

        bookingConfirmationRequired:
          toBoolean(
            bookingConfirmationRequired
          ),

        minimumStay:
          toNumber(
            minimumStay,
            1
          ),

        maximumStay:
          toNumber(
            maximumStay,
            0
          ),


        /* Cancellation */

        refundable:
          toBoolean(
            refundable,
            true
          ),

        freeCancellation:
          toBoolean(
            freeCancellation
          ),

        cancellationDeadlineHours:
          toNumber(
            cancellationDeadlineHours,
            24
          ),

        cancellationPolicy:
          cancellationPolicy || "",


        /* Media */

        coverImage,

        images,

        videos,


        /* Rules */

        smokingAllowed:
          toBoolean(
            smokingAllowed
          ),

        petsAllowed:
          toBoolean(
            petsAllowed
          ),

        childrenAllowed:
          toBoolean(
            childrenAllowed,
            true
          ),

        partiesAllowed:
          toBoolean(
            partiesAllowed
          ),

        localIdAllowed:
          toBoolean(
            localIdAllowed,
            true
          ),

        coupleFriendly:
          toBoolean(
            coupleFriendly,
            true
          ),

        houseRules:
          parseArray(
            req.body.houseRules
          ),


        /* Status */

        status: "DRAFT",

        isActive: true,
      });


    /* ========================================================
       RESPONSE
    ======================================================== */

    return res.status(201).json({
      success: true,

      message:
        "Homestay unit created successfully.",

      unit,
    });

  } catch (error) {
    console.error(
      "Create Homestay Unit Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create homestay unit.",
      error: error.message,
    });
  }
};


/* ============================================================
   GET ALL UNITS OF A HOMESTAY
============================================================ */

exports.getHomestayUnits = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    const {
      homestayId,
      status,
      page = 1,
      limit = 20,
    } = req.query;


    if (!homestayId) {
      return res.status(400).json({
        success: false,
        message:
          "Homestay ID is required.",
      });
    }


    if (
      !isValidObjectId(homestayId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid homestay ID.",
      });
    }


    /* ========================================================
       OWNERSHIP
    ======================================================== */

    const homestay =
      await findVendorHomestay(
        homestayId,
        vendorId
      );

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message:
          "Homestay not found.",
      });
    }


    const pageNumber =
      Math.max(
        Number(page) || 1,
        1
      );

    const limitNumber =
      Math.min(
        Math.max(
          Number(limit) || 20,
          1
        ),
        100
      );

    const skip =
      (pageNumber - 1) *
      limitNumber;


    const filter = {
      homestay: homestayId,
      vendor: vendorId,
    };


    if (status) {
      filter.status =
        status.toUpperCase();
    }


    const [
      units,
      total,
    ] = await Promise.all([
      HomestayUnit.find(filter)
        .sort({
          displayOrder: 1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      HomestayUnit.countDocuments(
        filter
      ),
    ]);


    return res.status(200).json({
      success: true,

      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages:
          Math.ceil(
            total /
              limitNumber
          ),
      },

      units,
    });

  } catch (error) {
    console.error(
      "Get Homestay Units Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch homestay units.",
      error: error.message,
    });
  }
};


/* ============================================================
   GET SINGLE UNIT
============================================================ */

exports.getSingleUnit = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    if (
      !isValidObjectId(
        req.params.unitId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid unit ID.",
      });
    }


    const unit =
      await HomestayUnit.findOne({
        _id: req.params.unitId,
        vendor: vendorId,
      }).populate(
        "homestay",
        "propertyName city state propertyType"
      );


    if (!unit) {
      return res.status(404).json({
        success: false,
        message:
          "Homestay unit not found.",
      });
    }


    return res.status(200).json({
      success: true,
      unit,
    });

  } catch (error) {
    console.error(
      "Get Single Unit Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch unit.",
      error: error.message,
    });
  }
};


/* ============================================================
   UPDATE UNIT
============================================================ */

exports.updateUnit = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    const unit =
      await findVendorUnit(
        req.params.unitId,
        vendorId
      );


    if (!unit) {
      return res.status(404).json({
        success: false,
        message:
          "Homestay unit not found.",
      });
    }


    /* ========================================================
       PROTECTED FIELDS
    ======================================================== */

    delete req.body.vendor;
    delete req.body.homestay;
    delete req.body.status;


    /* ========================================================
       STRING FIELDS
    ======================================================== */

    const stringFields = [
      "unitName",
      "unitType",
      "description",
      "shortDescription",
      "roomSizeUnit",
      "floorNumber",
      "viewType",
      "bedType",
      "bathroomType",
      "mealPlan",
      "inventoryType",
      "discountType",
      "cancellationPolicy",
    ];


    stringFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          unit[field] =
            req.body[field];
        }
      }
    );


    /* ========================================================
       NUMBER FIELDS
    ======================================================== */

    const numberFields = [
      "roomSize",

      "maxGuests",
      "adults",
      "children",

      "bedrooms",
      "beds",
      "extraBedCharge",

      "bathrooms",

      "basePrice",
      "weekendPrice",
      "holidayPrice",
      "extraGuestPrice",

      "taxPercentage",
      "serviceChargePercentage",

      "discountValue",
      "offerPrice",

      "totalUnits",

      "minimumStay",
      "maximumStay",

      "cancellationDeadlineHours",

      "displayOrder",
    ];


    numberFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined &&
          req.body[field] !== ""
        ) {
          unit[field] =
            toNumber(
              req.body[field],
              unit[field]
            );
        }
      }
    );


    /* ========================================================
       ARRAY FIELDS
    ======================================================== */

    if (
      req.body.amenities !==
      undefined
    ) {
      unit.amenities =
        parseArray(
          req.body.amenities
        );
    }


    if (
      req.body.houseRules !==
      undefined
    ) {
      unit.houseRules =
        parseArray(
          req.body.houseRules
        );
    }


    /* ========================================================
       BOOLEAN FIELDS
    ======================================================== */

    const booleanFields = [
      "extraBedAvailable",

      "bathtub",
      "shower",
      "hotWater",
      "toiletries",
      "hairDryer",

      "wifi",
      "airConditioning",
      "heater",
      "tv",
      "smartTv",
      "balcony",
      "terrace",
      "kitchen",
      "kitchenette",
      "refrigerator",
      "minibar",
      "wardrobe",
      "workDesk",
      "washingMachine",
      "iron",

      "breakfastIncluded",
      "lunchIncluded",
      "dinnerIncluded",

      "instantBooking",
      "bookingConfirmationRequired",

      "refundable",
      "freeCancellation",

      "smokingAllowed",
      "petsAllowed",
      "childrenAllowed",
      "partiesAllowed",
      "localIdAllowed",
      "coupleFriendly",

      "featured",
      "isActive",
    ];


    booleanFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          unit[field] =
            toBoolean(
              req.body[field]
            );
        }
      }
    );


    /* ========================================================
       IMAGE UPLOAD
    ======================================================== */

    if (
      req.files?.coverImage
        ?.length
    ) {
      const uploaded =
        await uploadMany(
          req.files.coverImage,
          "homestays/units/cover"
        );

      if (uploaded[0]) {
        unit.coverImage =
          uploaded[0];
      }
    }


    if (
      req.files?.images?.length
    ) {
      const uploaded =
        await uploadMany(
          req.files.images,
          "homestays/units/images"
        );

      unit.images.push(
        ...uploaded
      );
    }


    if (
      req.files?.videos?.length
    ) {
      const uploaded =
        await uploadMany(
          req.files.videos,
          "homestays/units/videos"
        );

      unit.videos.push(
        ...uploaded
      );
    }


    await unit.save();


    return res.status(200).json({
      success: true,

      message:
        "Homestay unit updated successfully.",

      unit,
    });

  } catch (error) {
    console.error(
      "Update Homestay Unit Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update homestay unit.",
      error: error.message,
    });
  }
};


/* ============================================================
   DELETE UNIT
============================================================ */

exports.deleteUnit = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    const unit =
      await findVendorUnit(
        req.params.unitId,
        vendorId
      );


    if (!unit) {
      return res.status(404).json({
        success: false,
        message:
          "Homestay unit not found.",
      });
    }


    /* ========================================================
       DELETE CLOUDINARY IMAGES
    ======================================================== */

    if (unit.coverImage) {
      await deleteFromCloudinary(
        unit.coverImage
      );
    }


    for (
      const image of unit.images
    ) {
      await deleteFromCloudinary(
        image
      );
    }


    /* ========================================================
       DELETE UNIT
    ======================================================== */

    await HomestayUnit.deleteOne({
      _id: unit._id,
    });


    return res.status(200).json({
      success: true,

      message:
        "Homestay unit deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete Homestay Unit Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete homestay unit.",
      error: error.message,
    });
  }
};


/* ============================================================
   ACTIVATE / DEACTIVATE UNIT
============================================================ */

exports.toggleUnitStatus = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    const unit =
      await findVendorUnit(
        req.params.unitId,
        vendorId
      );


    if (!unit) {
      return res.status(404).json({
        success: false,
        message:
          "Homestay unit not found.",
      });
    }


    unit.isActive =
      !unit.isActive;


    unit.status =
      unit.isActive
        ? "ACTIVE"
        : "INACTIVE";


    await unit.save();


    return res.status(200).json({
      success: true,

      message: unit.isActive
        ? "Unit activated successfully."
        : "Unit deactivated successfully.",

      isActive:
        unit.isActive,

      status:
        unit.status,
    });

  } catch (error) {
    console.error(
      "Toggle Unit Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update unit status.",
      error: error.message,
    });
  }
};


/* ============================================================
   DELETE UNIT IMAGE
============================================================ */

exports.deleteUnitImage = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    const {
      imageUrl,
    } = req.body;


    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message:
          "Image URL is required.",
      });
    }


    const unit =
      await findVendorUnit(
        req.params.unitId,
        vendorId
      );


    if (!unit) {
      return res.status(404).json({
        success: false,
        message:
          "Homestay unit not found.",
      });
    }


    if (
      !unit.images.includes(
        imageUrl
      )
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Image does not belong to this unit.",
      });
    }


    unit.images =
      unit.images.filter(
        (image) =>
          image !== imageUrl
      );


    await unit.save();


    await deleteFromCloudinary(
      imageUrl
    );


    return res.status(200).json({
      success: true,

      message:
        "Unit image deleted successfully.",

      images:
        unit.images,
    });

  } catch (error) {
    console.error(
      "Delete Unit Image Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete unit image.",
      error: error.message,
    });
  }
};


/* ============================================================
   SET UNIT ACTIVE
============================================================ */

exports.activateUnit = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    const unit =
      await findVendorUnit(
        req.params.unitId,
        vendorId
      );


    if (!unit) {
      return res.status(404).json({
        success: false,
        message:
          "Homestay unit not found.",
      });
    }


    unit.isActive = true;
    unit.status = "ACTIVE";


    await unit.save();


    return res.status(200).json({
      success: true,

      message:
        "Unit activated successfully.",

      unit,
    });

  } catch (error) {
    console.error(
      "Activate Unit Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to activate unit.",
      error: error.message,
    });
  }
};


/* ============================================================
   SET UNIT INACTIVE
============================================================ */

exports.deactivateUnit = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    const unit =
      await findVendorUnit(
        req.params.unitId,
        vendorId
      );


    if (!unit) {
      return res.status(404).json({
        success: false,
        message:
          "Homestay unit not found.",
      });
    }


    unit.isActive = false;
    unit.status = "INACTIVE";


    await unit.save();


    return res.status(200).json({
      success: true,

      message:
        "Unit deactivated successfully.",

      unit,
    });

  } catch (error) {
    console.error(
      "Deactivate Unit Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to deactivate unit.",
      error: error.message,
    });
  }
};