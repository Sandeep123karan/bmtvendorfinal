const Homestay = require("../models/Homestay.model");
const cloudinary = require("../config/cloudinary");

/* ============================================================
   HELPERS
============================================================ */

/**
 * Convert string/array into array
 *
 * FormData se:
 * amenities = '["WiFi","Parking"]'
 *
 * ya:
 * amenities = "WiFi,Parking"
 *
 * dono handle honge.
 */
const parseArray = (value) => {
  if (value === undefined || value === null || value === "") {
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


/**
 * Convert FormData boolean values
 */
const toBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (value === true || value === "true" || value === "1" || value === 1) {
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


/**
 * Convert number safely
 */
const toNumber = (value, defaultValue = undefined) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const number = Number(value);

  return Number.isNaN(number) ? defaultValue : number;
};


/**
 * Upload multiple files to Cloudinary
 *
 * IMPORTANT:
 * This expects multer files to contain `path`.
 */
const uploadMany = async (files = [], folder) => {
  const urls = [];

  for (const file of files) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "auto",
    });

    urls.push(result.secure_url);
  }

  return urls;
};


/**
 * Delete image from Cloudinary
 *
 * URL se public_id extract karne ki koshish.
 */
const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    const parts = imageUrl.split("/");

    const uploadIndex = parts.indexOf("upload");

    if (uploadIndex === -1) return;

    let publicPath = parts.slice(uploadIndex + 1).join("/");

    // Remove transformation/version
    publicPath = publicPath.replace(/^v\d+\//, "");

    // Remove extension
    publicPath = publicPath.replace(/\.[^/.]+$/, "");

    await cloudinary.uploader.destroy(publicPath, {
      resource_type: "image",
    });
  } catch (error) {
    console.error(
      "Cloudinary delete error:",
      error.message
    );
  }
};


/**
 * Check vendor ownership
 */
const findVendorHomestay = async (homestayId, vendorId) => {
  return Homestay.findOne({
    _id: homestayId,
    vendor: vendorId,
  });
};


/* ============================================================
   CREATE HOMESTAY
============================================================ */

exports.createHomestay = async (req, res) => {
  try {
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const {
      propertyName,
      propertyType,
      description,
      shortDescription,

      hostName,
      hostPhone,
      hostEmail,
      hostDescription,
      isProfessionalHost,

      country,
      state,
      city,
      area,
      address,
      landmark,
      pincode,

      latitude,
      longitude,

      maxGuests,
      totalBedrooms,
      totalBathrooms,
      totalBeds,

      checkInTime,
      checkOutTime,

      cancellationPolicy,
      childPolicy,
      petPolicy,
      extraGuestPolicy,

      freeCancellation,
      cancellationDeadlineHours,

      paymentMethods,
      payAtProperty,

      advancePaymentRequired,
      advancePaymentPercentage,

      businessName,
      gstNumber,
      panNumber,

      checkInMethod,
      checkInInstructions,

      virtualTourLink,

      metaTitle,
      metaDescription,
    } = req.body;


    /* ========================================================
       REQUIRED VALIDATION
    ======================================================== */

    if (!propertyName) {
      return res.status(400).json({
        success: false,
        message: "Property name is required.",
      });
    }

    if (!propertyType) {
      return res.status(400).json({
        success: false,
        message: "Property type is required.",
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Property description is required.",
      });
    }

    if (!hostName) {
      return res.status(400).json({
        success: false,
        message: "Host name is required.",
      });
    }

    if (!hostPhone) {
      return res.status(400).json({
        success: false,
        message: "Host phone is required.",
      });
    }

    if (!state) {
      return res.status(400).json({
        success: false,
        message: "State is required.",
      });
    }

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required.",
      });
    }

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address is required.",
      });
    }

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: "Pincode is required.",
      });
    }


    /* ========================================================
       CHECK DUPLICATE PROPERTY
    ======================================================== */

    const existingProperty = await Homestay.findOne({
      vendor: vendorId,
      propertyName: propertyName.trim(),
      city: city.trim(),
    });

    if (existingProperty) {
      return res.status(409).json({
        success: false,
        message:
          "You already have a homestay with this name in this city.",
      });
    }


    /* ========================================================
       LOCATION
    ======================================================== */

    let location = {
      type: "Point",
      coordinates: [0, 0],
    };

    if (latitude !== undefined && longitude !== undefined) {
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (
        !Number.isNaN(lat) &&
        !Number.isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        location = {
          type: "Point",
          coordinates: [lng, lat],
        };
      }
    }


    /* ========================================================
       IMAGE UPLOADS
    ======================================================== */

    let propertyLogo = "";
    let coverImage = "";
    let propertyImages = [];
    let videos = [];

    if (req.files?.propertyLogo?.length) {
      const uploaded = await uploadMany(
        req.files.propertyLogo,
        "homestays/logo"
      );

      propertyLogo = uploaded[0] || "";
    }

    if (req.files?.coverImage?.length) {
      const uploaded = await uploadMany(
        req.files.coverImage,
        "homestays/cover"
      );

      coverImage = uploaded[0] || "";
    }

    if (req.files?.propertyImages?.length) {
      propertyImages = await uploadMany(
        req.files.propertyImages,
        "homestays/property"
      );
    }

    if (req.files?.videos?.length) {
      videos = await uploadMany(
        req.files.videos,
        "homestays/videos"
      );
    }


    /* ========================================================
       CREATE HOMESTAY
    ======================================================== */

    const homestay = await Homestay.create({
      vendor: vendorId,

      /* Basic */
      propertyName: propertyName.trim(),
      propertyType,
      description,
      shortDescription,

      /* Host */
      hostName,
      hostPhone,
      hostEmail,
      hostDescription,
      isProfessionalHost: toBoolean(
        isProfessionalHost
      ),

      /* Location */
      country: country || "India",
      state,
      city,
      area,
      address,
      landmark,
      pincode,
      location,

      /* Capacity */
      maxGuests: toNumber(maxGuests, 1),
      totalBedrooms: toNumber(totalBedrooms, 0),
      totalBathrooms: toNumber(totalBathrooms, 1),
      totalBeds: toNumber(totalBeds, 1),

      /* Amenities */
      amenities: parseArray(req.body.amenities),
      propertyHighlights: parseArray(
        req.body.propertyHighlights
      ),
      outdoorFacilities: parseArray(
        req.body.outdoorFacilities
      ),
      indoorFacilities: parseArray(
        req.body.indoorFacilities
      ),
      safetyFacilities: parseArray(
        req.body.safetyFacilities
      ),
      familyFacilities: parseArray(
        req.body.familyFacilities
      ),

      /* Common amenities */
      wifi: toBoolean(req.body.wifi, true),
      parking: toBoolean(req.body.parking),
      privateParking: toBoolean(
        req.body.privateParking
      ),
      swimmingPool: toBoolean(
        req.body.swimmingPool
      ),
      garden: toBoolean(req.body.garden),
      balcony: toBoolean(req.body.balcony),
      terrace: toBoolean(req.body.terrace),
      bonfire: toBoolean(req.body.bonfire),
      barbecue: toBoolean(req.body.barbecue),
      fireplace: toBoolean(req.body.fireplace),
      restaurant: toBoolean(req.body.restaurant),
      roomService: toBoolean(
        req.body.roomService
      ),
      laundry: toBoolean(req.body.laundry),
      powerBackup: toBoolean(
        req.body.powerBackup
      ),
      airConditioning: toBoolean(
        req.body.airConditioning
      ),
      heater: toBoolean(req.body.heater),

      /* Food */
      foodAvailable: toBoolean(
        req.body.foodAvailable
      ),
      breakfastAvailable: toBoolean(
        req.body.breakfastAvailable
      ),
      lunchAvailable: toBoolean(
        req.body.lunchAvailable
      ),
      dinnerAvailable: toBoolean(
        req.body.dinnerAvailable
      ),
      kitchenAvailable: toBoolean(
        req.body.kitchenAvailable
      ),
      mealTypes: parseArray(
        req.body.mealTypes
      ),

      /* Policies */
      checkInTime:
        checkInTime || "12:00 PM",

      checkOutTime:
        checkOutTime || "11:00 AM",

      earlyCheckInAllowed: toBoolean(
        req.body.earlyCheckInAllowed
      ),

      lateCheckOutAllowed: toBoolean(
        req.body.lateCheckOutAllowed
      ),

      coupleFriendly: toBoolean(
        req.body.coupleFriendly,
        true
      ),

      unmarriedCouplesAllowed: toBoolean(
        req.body.unmarriedCouplesAllowed,
        true
      ),

      localIdAllowed: toBoolean(
        req.body.localIdAllowed,
        true
      ),

      petsAllowed: toBoolean(
        req.body.petsAllowed
      ),

      smokingAllowed: toBoolean(
        req.body.smokingAllowed
      ),

      alcoholAllowed: toBoolean(
        req.body.alcoholAllowed
      ),

      partiesAllowed: toBoolean(
        req.body.partiesAllowed
      ),

      eventsAllowed: toBoolean(
        req.body.eventsAllowed
      ),

      childrenAllowed: toBoolean(
        req.body.childrenAllowed,
        true
      ),

      /* Rules */
      houseRules: parseArray(
        req.body.houseRules
      ),

      childPolicy,
      petPolicy,
      extraGuestPolicy,

      /* Cancellation */
      cancellationPolicy,
      freeCancellation: toBoolean(
        freeCancellation
      ),

      cancellationDeadlineHours:
        toNumber(
          cancellationDeadlineHours,
          0
        ),

      /* Payments */
      paymentMethods: parseArray(
        paymentMethods
      ),

      payAtProperty: toBoolean(
        payAtProperty
      ),

      advancePaymentRequired:
        toBoolean(
          advancePaymentRequired
        ),

      advancePaymentPercentage:
        toNumber(
          advancePaymentPercentage,
          0
        ),

      /* Business */
      businessName,
      gstNumber,
      panNumber,

      /* Media */
      propertyLogo,
      coverImage,
      propertyImages,
      videos,
      virtualTourLink,

      /* Check-in */
      checkInMethod:
        checkInMethod || "host",

      checkInInstructions,

      /* SEO */
      metaTitle,
      metaDescription,

      /*
       * New property starts as DRAFT.
       * Vendor will submit it separately.
       */
      status: "DRAFT",
      isActive: true,
    });


    return res.status(201).json({
      success: true,
      message:
        "Homestay created successfully.",
      homestay,
    });

  } catch (error) {
    console.error(
      "Create Homestay Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create homestay.",
      error: error.message,
    });
  }
};


/* ============================================================
   GET MY HOMESTAYS
============================================================ */

exports.getMyHomestays = async (req, res) => {
  try {
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      city,
      propertyType,
      search,
    } = req.query;


    const pageNumber = Math.max(
      Number(page) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(Number(limit) || 10, 1),
      100
    );

    const skip =
      (pageNumber - 1) * limitNumber;


    /* ========================================================
       FILTER
    ======================================================== */

    const filter = {
      vendor: vendorId,
    };

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (city) {
      filter.city = {
        $regex: city,
        $options: "i",
      };
    }

    if (propertyType) {
      filter.propertyType = propertyType;
    }

    if (search) {
      filter.$or = [
        {
          propertyName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          city: {
            $regex: search,
            $options: "i",
          },
        },
        {
          area: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }


    const [
      homestays,
      total,
    ] = await Promise.all([
      Homestay.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Homestay.countDocuments(filter),
    ]);


    return res.status(200).json({
      success: true,

      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(
          total / limitNumber
        ),
        hasNextPage:
          pageNumber <
          Math.ceil(total / limitNumber),
      },

      homestays,
    });

  } catch (error) {
    console.error(
      "Get My Homestays Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch homestays.",
      error: error.message,
    });
  }
};


/* ============================================================
   GET SINGLE HOMESTAY
============================================================ */

exports.getSingleHomestay = async (
  req,
  res
) => {
  try {
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const homestay =
      await Homestay.findOne({
        _id: req.params.id,
        vendor: vendorId,
      }).lean();

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: "Homestay not found.",
      });
    }

    return res.status(200).json({
      success: true,
      homestay,
    });

  } catch (error) {
    console.error(
      "Get Single Homestay Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch homestay.",
      error: error.message,
    });
  }
};


/* ============================================================
   UPDATE HOMESTAY
============================================================ */

exports.updateHomestay = async (
  req,
  res
) => {
  try {
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const homestay =
      await Homestay.findOne({
        _id: req.params.id,
        vendor: vendorId,
      });

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: "Homestay not found.",
      });
    }


    /*
     * Don't allow vendor to directly
     * approve/reject property.
     */
    const protectedFields = [
      "status",
      "approvedBy",
      "approvedAt",
      "rejectionReason",
      "featured",
      "averageRating",
      "totalReviews",
    ];

    protectedFields.forEach(
      (field) => {
        delete req.body[field];
      }
    );


    /* ========================================================
       BASIC FIELDS
    ======================================================== */

    const stringFields = [
      "propertyName",
      "propertyType",
      "description",
      "shortDescription",

      "hostName",
      "hostPhone",
      "hostEmail",
      "hostDescription",

      "country",
      "state",
      "city",
      "area",
      "address",
      "landmark",
      "pincode",

      "checkInTime",
      "checkOutTime",

      "childPolicy",
      "petPolicy",
      "extraGuestPolicy",
      "cancellationPolicy",

      "businessName",
      "gstNumber",
      "panNumber",

      "virtualTourLink",

      "checkInMethod",
      "checkInInstructions",

      "metaTitle",
      "metaDescription",
    ];


    stringFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        homestay[field] =
          req.body[field];
      }
    });


    /* ========================================================
       NUMBER FIELDS
    ======================================================== */

    const numberFields = [
      "maxGuests",
      "totalBedrooms",
      "totalBathrooms",
      "totalBeds",

      "cancellationDeadlineHours",

      "advancePaymentPercentage",
    ];


    numberFields.forEach((field) => {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== ""
      ) {
        homestay[field] =
          toNumber(req.body[field]);
      }
    });


    /* ========================================================
       ARRAY FIELDS
    ======================================================== */

    const arrayFields = [
      "amenities",
      "propertyHighlights",
      "outdoorFacilities",
      "indoorFacilities",
      "safetyFacilities",
      "familyFacilities",
      "mealTypes",
      "houseRules",
      "paymentMethods",
    ];


    arrayFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        homestay[field] =
          parseArray(req.body[field]);
      }
    });


    /* ========================================================
       BOOLEAN FIELDS
    ======================================================== */

    const booleanFields = [
      "isProfessionalHost",

      "wifi",
      "parking",
      "privateParking",
      "swimmingPool",
      "garden",
      "balcony",
      "terrace",
      "bonfire",
      "barbecue",
      "fireplace",
      "restaurant",
      "roomService",
      "laundry",
      "powerBackup",
      "airConditioning",
      "heater",

      "foodAvailable",
      "breakfastAvailable",
      "lunchAvailable",
      "dinnerAvailable",
      "kitchenAvailable",

      "earlyCheckInAllowed",
      "lateCheckOutAllowed",
      "coupleFriendly",
      "unmarriedCouplesAllowed",
      "localIdAllowed",
      "petsAllowed",
      "smokingAllowed",
      "alcoholAllowed",
      "partiesAllowed",
      "eventsAllowed",
      "childrenAllowed",

      "freeCancellation",

      "payAtProperty",
      "advancePaymentRequired",
    ];


    booleanFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        homestay[field] =
          toBoolean(req.body[field]);
      }
    });


    /* ========================================================
       LOCATION UPDATE
    ======================================================== */

    if (
      req.body.latitude !== undefined &&
      req.body.longitude !== undefined
    ) {
      const lat =
        Number(req.body.latitude);

      const lng =
        Number(req.body.longitude);

      if (
        !Number.isNaN(lat) &&
        !Number.isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        homestay.location = {
          type: "Point",
          coordinates: [lng, lat],
        };
      }
    }


    /* ========================================================
       MEDIA UPLOAD
    ======================================================== */

    if (req.files?.propertyLogo?.length) {
      const uploaded =
        await uploadMany(
          req.files.propertyLogo,
          "homestays/logo"
        );

      if (uploaded[0]) {
        homestay.propertyLogo =
          uploaded[0];
      }
    }


    if (req.files?.coverImage?.length) {
      const uploaded =
        await uploadMany(
          req.files.coverImage,
          "homestays/cover"
        );

      if (uploaded[0]) {
        homestay.coverImage =
          uploaded[0];
      }
    }


    if (req.files?.propertyImages?.length) {
      const uploaded =
        await uploadMany(
          req.files.propertyImages,
          "homestays/property"
        );

      homestay.propertyImages.push(
        ...uploaded
      );
    }


    if (req.files?.videos?.length) {
      const uploaded =
        await uploadMany(
          req.files.videos,
          "homestays/videos"
        );

      homestay.videos.push(
        ...uploaded
      );
    }


    /* ========================================================
       SAVE
    ======================================================== */

    await homestay.save();


    return res.status(200).json({
      success: true,
      message:
        "Homestay updated successfully.",
      homestay,
    });

  } catch (error) {
    console.error(
      "Update Homestay Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update homestay.",
      error: error.message,
    });
  }
};


/* ============================================================
   DELETE HOMESTAY
============================================================ */

exports.deleteHomestay = async (
  req,
  res
) => {
  try {
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const homestay =
      await Homestay.findOne({
        _id: req.params.id,
        vendor: vendorId,
      });

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: "Homestay not found.",
      });
    }


    /*
     * Don't physically delete an approved
     * property immediately.
     *
     * For production, inactive is safer.
     */
    if (
      homestay.status === "APPROVED"
    ) {
      homestay.isActive = false;
      await homestay.save();

      return res.status(200).json({
        success: true,
        message:
          "Approved homestay has been deactivated.",
      });
    }


    /* ========================================================
       Delete Cloudinary Images
    ======================================================== */

    if (homestay.propertyLogo) {
      await deleteFromCloudinary(
        homestay.propertyLogo
      );
    }

    if (homestay.coverImage) {
      await deleteFromCloudinary(
        homestay.coverImage
      );
    }

    for (
      const image of homestay.propertyImages
    ) {
      await deleteFromCloudinary(image);
    }

    for (
      const video of homestay.videos
    ) {
      /*
       * Video deletion requires
       * resource_type video.
       *
       * We don't force delete here because
       * URL may belong to another resource.
       */
      console.log(
        "Homestay video:",
        video
      );
    }


    await Homestay.deleteOne({
      _id: homestay._id,
    });


    return res.status(200).json({
      success: true,
      message:
        "Homestay deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete Homestay Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete homestay.",
      error: error.message,
    });
  }
};


/* ============================================================
   SUBMIT HOMESTAY FOR ADMIN APPROVAL
============================================================ */

exports.submitForApproval = async (
  req,
  res
) => {
  try {
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const homestay =
      await Homestay.findOne({
        _id: req.params.id,
        vendor: vendorId,
      });

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: "Homestay not found.",
      });
    }


    if (
      homestay.status === "APPROVED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This homestay is already approved.",
      });
    }


    if (
      homestay.status === "PENDING"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This homestay is already submitted for approval.",
      });
    }


    /* ========================================================
       BASIC COMPLETENESS CHECK
    ======================================================== */

    const missingFields = [];

    if (!homestay.propertyName) {
      missingFields.push(
        "propertyName"
      );
    }

    if (!homestay.propertyType) {
      missingFields.push(
        "propertyType"
      );
    }

    if (!homestay.description) {
      missingFields.push(
        "description"
      );
    }

    if (!homestay.hostName) {
      missingFields.push(
        "hostName"
      );
    }

    if (!homestay.hostPhone) {
      missingFields.push(
        "hostPhone"
      );
    }

    if (!homestay.state) {
      missingFields.push("state");
    }

    if (!homestay.city) {
      missingFields.push("city");
    }

    if (!homestay.address) {
      missingFields.push("address");
    }

    if (!homestay.pincode) {
      missingFields.push("pincode");
    }


    if (
      !homestay.coverImage &&
      homestay.propertyImages.length === 0
    ) {
      missingFields.push(
        "propertyImages"
      );
    }


    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Please complete your homestay profile before submitting.",
        missingFields,
      });
    }


    /* ========================================================
       SUBMIT
    ======================================================== */

    homestay.status = "PENDING";
    homestay.rejectionReason = "";

    await homestay.save();


    return res.status(200).json({
      success: true,
      message:
        "Homestay submitted for admin approval.",
      homestay,
    });

  } catch (error) {
    console.error(
      "Submit Homestay Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit homestay.",
      error: error.message,
    });
  }
};


/* ============================================================
   UPDATE AMENITIES
============================================================ */

exports.updateAmenities = async (
  req,
  res
) => {
  try {
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const homestay =
      await findVendorHomestay(
        req.params.id,
        vendorId
      );

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: "Homestay not found.",
      });
    }


    const arrayFields = [
      "amenities",
      "propertyHighlights",
      "outdoorFacilities",
      "indoorFacilities",
      "safetyFacilities",
      "familyFacilities",
    ];


    arrayFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        homestay[field] =
          parseArray(req.body[field]);
      }
    });


    const booleanFields = [
      "wifi",
      "parking",
      "privateParking",
      "swimmingPool",
      "garden",
      "balcony",
      "terrace",
      "bonfire",
      "barbecue",
      "fireplace",
      "restaurant",
      "roomService",
      "laundry",
      "powerBackup",
      "airConditioning",
      "heater",
      "foodAvailable",
      "breakfastAvailable",
      "lunchAvailable",
      "dinnerAvailable",
      "kitchenAvailable",
    ];


    booleanFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        homestay[field] =
          toBoolean(req.body[field]);
      }
    });


    await homestay.save();


    return res.status(200).json({
      success: true,
      message:
        "Amenities updated successfully.",
      amenities: {
        amenities: homestay.amenities,
        propertyHighlights:
          homestay.propertyHighlights,
        outdoorFacilities:
          homestay.outdoorFacilities,
        indoorFacilities:
          homestay.indoorFacilities,
        safetyFacilities:
          homestay.safetyFacilities,
        familyFacilities:
          homestay.familyFacilities,
      },
      homestay,
    });

  } catch (error) {
    console.error(
      "Update Amenities Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update amenities.",
      error: error.message,
    });
  }
};


/* ============================================================
   UPDATE POLICIES
============================================================ */

exports.updatePolicies = async (
  req,
  res
) => {
  try {
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const homestay =
      await findVendorHomestay(
        req.params.id,
        vendorId
      );

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: "Homestay not found.",
      });
    }


    const stringFields = [
      "checkInTime",
      "checkOutTime",
      "childPolicy",
      "petPolicy",
      "extraGuestPolicy",
      "cancellationPolicy",
      "checkInMethod",
      "checkInInstructions",
    ];


    stringFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        homestay[field] =
          req.body[field];
      }
    });


    const booleanFields = [
      "earlyCheckInAllowed",
      "lateCheckOutAllowed",
      "coupleFriendly",
      "unmarriedCouplesAllowed",
      "localIdAllowed",
      "petsAllowed",
      "smokingAllowed",
      "alcoholAllowed",
      "partiesAllowed",
      "eventsAllowed",
      "childrenAllowed",
      "freeCancellation",
      "payAtProperty",
      "advancePaymentRequired",
    ];


    booleanFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        homestay[field] =
          toBoolean(req.body[field]);
      }
    });


    if (
      req.body.houseRules !== undefined
    ) {
      homestay.houseRules =
        parseArray(
          req.body.houseRules
        );
    }


    if (
      req.body.cancellationDeadlineHours !==
      undefined
    ) {
      homestay.cancellationDeadlineHours =
        toNumber(
          req.body.cancellationDeadlineHours,
          0
        );
    }


    await homestay.save();


    return res.status(200).json({
      success: true,
      message:
        "Policies updated successfully.",
      homestay,
    });

  } catch (error) {
    console.error(
      "Update Policies Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update policies.",
      error: error.message,
    });
  }
};


/* ============================================================
   DELETE PROPERTY IMAGE
============================================================ */

exports.deletePropertyImage = async (
  req,
  res
) => {
  try {
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required.",
      });
    }


    const homestay =
      await findVendorHomestay(
        req.params.id,
        vendorId
      );

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: "Homestay not found.",
      });
    }


    const imageExists =
      homestay.propertyImages.includes(
        imageUrl
      );

    if (!imageExists) {
      return res.status(404).json({
        success: false,
        message:
          "Image does not belong to this homestay.",
      });
    }


    homestay.propertyImages =
      homestay.propertyImages.filter(
        (image) => image !== imageUrl
      );


    await homestay.save();

    await deleteFromCloudinary(
      imageUrl
    );


    return res.status(200).json({
      success: true,
      message:
        "Property image deleted successfully.",
      homestay,
    });

  } catch (error) {
    console.error(
      "Delete Property Image Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete property image.",
      error: error.message,
    });
  }
};


/* ============================================================
   DELETE COVER IMAGE
============================================================ */

exports.deleteCoverImage = async (
  req,
  res
) => {
  try {
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const homestay =
      await findVendorHomestay(
        req.params.id,
        vendorId
      );

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: "Homestay not found.",
      });
    }


    if (!homestay.coverImage) {
      return res.status(404).json({
        success: false,
        message:
          "Cover image not found.",
      });
    }


    const oldImage =
      homestay.coverImage;

    homestay.coverImage = "";

    await homestay.save();

    await deleteFromCloudinary(
      oldImage
    );


    return res.status(200).json({
      success: true,
      message:
        "Cover image deleted successfully.",
      homestay,
    });

  } catch (error) {
    console.error(
      "Delete Cover Image Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete cover image.",
      error: error.message,
    });
  }
};


/* ============================================================
   TOGGLE ACTIVE / INACTIVE
============================================================ */

exports.toggleHomestayStatus = async (
  req,
  res
) => {
  try {
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const homestay =
      await findVendorHomestay(
        req.params.id,
        vendorId
      );

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: "Homestay not found.",
      });
    }


    homestay.isActive =
      !homestay.isActive;

    await homestay.save();


    return res.status(200).json({
      success: true,
      message: homestay.isActive
        ? "Homestay activated successfully."
        : "Homestay deactivated successfully.",

      isActive:
        homestay.isActive,
    });

  } catch (error) {
    console.error(
      "Toggle Homestay Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update homestay status.",
      error: error.message,
    });
  }
};