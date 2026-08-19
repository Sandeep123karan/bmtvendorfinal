const Cab = require("../models/Cab.model");
const cloudinary = require("../config/cloudinary");

/* =========================================================
   HELPERS
========================================================= */

// Parse comma separated array OR JSON array
const parseArray = (field) => {
  if (!field) return [];

  if (Array.isArray(field)) return field;

  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      // Normal comma-separated string
    }

    return field
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};


// Parse object from JSON
const parseObject = (field, defaultValue = {}) => {
  if (!field) return defaultValue;

  if (typeof field === "object" && !Array.isArray(field)) {
    return field;
  }

  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch (error) {
      return defaultValue;
    }
  }

  return defaultValue;
};


// Convert to number safely
const toNumber = (value, defaultValue = 0) => {
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


// Convert to boolean
const toBoolean = (value, defaultValue = false) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  return (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1"
  );
};


// Upload file to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
  });

  return result.secure_url;
};


/* =========================================================
   PRICE CALCULATION
========================================================= */

const calculateCabPrice = (data) => {
  const baseFare = toNumber(data.baseFare);

  const distanceKm = toNumber(data.distanceKm);

  const minimumKm = toNumber(data.minimumKm);

  const pricePerKm = toNumber(data.pricePerKm);

  const extraKmCharge = toNumber(data.extraKmCharge);

  const driverAllowance = toNumber(data.driverAllowance);

  const nightCharge = toNumber(data.nightCharge);

  const airportParkingCharge = toNumber(
    data.airportParkingCharge
  );

  const tollCharge = toNumber(data.tollCharge);

  const discount = toNumber(data.discount);

  const gstPercentage = toNumber(data.gstPercentage);

  /*
    Distance calculation
  */

  let distanceAmount = 0;

  if (distanceKm > 0) {
    distanceAmount = distanceKm * pricePerKm;
  }

  /*
    Minimum KM rule
  */

  if (minimumKm > 0 && distanceKm < minimumKm) {
    distanceAmount = minimumKm * pricePerKm;
  }

  /*
    Extra KM
  */

  let extraAmount = 0;

  if (
    minimumKm > 0 &&
    distanceKm > minimumKm &&
    extraKmCharge > 0
  ) {
    extraAmount =
      (distanceKm - minimumKm) *
      extraKmCharge;
  }

  /*
    Subtotal
  */

  const subtotal =
    baseFare +
    distanceAmount +
    extraAmount +
    driverAllowance +
    nightCharge +
    airportParkingCharge +
    tollCharge;

  /*
    Discount
  */

  const taxableAmount = Math.max(
    subtotal - discount,
    0
  );

  /*
    GST
  */

  const gstAmount =
    (taxableAmount * gstPercentage) / 100;

  /*
    Final price
  */

  const finalPrice =
    taxableAmount + gstAmount;

  return {
    baseFare,
    distanceAmount,
    extraAmount,
    subtotal,
    discount,
    taxableAmount,
    gstPercentage,
    gstAmount,
    finalPrice,
  };
};


/* =========================================================
   ADD CAB
   POST /api/vendor/cabs
========================================================= */

exports.addCab = async (req, res) => {
  try {
    const d = req.body;

    /*
      Parse nested data
    */

    const driver = parseObject(
      d.driver,
      {
        name: "",
        phone: "",
        alternatePhone: "",
        licenseNumber: "",
        experienceYears: 0,
      }
    );

    const documents = parseObject(
      d.documents,
      {
        rcNumber: "",
        insuranceNumber: "",
        insuranceExpiry: null,
        permitNumber: "",
        permitExpiry: null,
        fitnessExpiry: null,
      }
    );

    /*
      Calculate price
    */

    const pricing = calculateCabPrice(d);

    /*
      Main image
    */

    let image = "";

    if (req.files?.image?.[0]) {
      image = await uploadToCloudinary(
        req.files.image[0].path,
        "vendor_cabs/main"
      );
    }

    /*
      Gallery
    */

    const gallery = [];

    if (req.files?.gallery?.length) {
      if (req.files.gallery.length > 10) {
        return res.status(400).json({
          success: false,
          message: "Maximum 10 gallery images allowed",
        });
      }

      for (const file of req.files.gallery) {
        const uploadedUrl =
          await uploadToCloudinary(
            file.path,
            "vendor_cabs/gallery"
          );

        gallery.push(uploadedUrl);
      }
    }

    /*
      Create cab
    */

    const cab = await Cab.create({
      vendor: req.vendor._id,

      /* BASIC */

      cabId: d.cabId || `CAB-${Date.now()}`,

      cabType: d.cabType || "Sedan",

      carName: d.carName || "",

      vehicleNumber: d.vehicleNumber,

      brand: d.brand || "",

      model: d.model || "",

      modelYear: toNumber(
        d.modelYear,
        null
      ),

      vehicleColor: d.vehicleColor || "",

      /* OWNER */

      operatorName: d.operatorName || "",

      vendorName:
        d.vendorName ||
        req.vendor.name ||
        "",

      cabOwnerName: d.cabOwnerName || "",

      email: d.email || "",

      phone: d.phone || "",

      alternatePhone:
        d.alternatePhone || "",

      /* TRIP */

      tripType:
        d.tripType || "ONE_WAY",

      /* ROUTE */

      fromCity: d.fromCity || "",

      toCity: d.toCity || "",

      pickupLocation:
        d.pickupLocation || "",

      dropLocation:
        d.dropLocation || "",

      viaCities: parseArray(
        d.viaCities
      ),

      /* DATE TIME */

      pickupDate:
        d.pickupDate || null,

      pickupTime:
        d.pickupTime || "",

      dropDate:
        d.dropDate || null,

      dropTime:
        d.dropTime || "",

      estimatedDuration:
        d.estimatedDuration || "",

      distanceKm: toNumber(
        d.distanceKm
      ),

      /* SEATS */

      totalSeats: toNumber(
        d.totalSeats,
        4
      ),

      availableSeats: toNumber(
        d.availableSeats,
        toNumber(d.totalSeats, 4)
      ),

      luggageCapacity: toNumber(
        d.luggageCapacity
      ),

      /* PRICING */

      baseFare: pricing.baseFare,

      pricePerKm: toNumber(
        d.pricePerKm
      ),

      minimumKm: toNumber(
        d.minimumKm
      ),

      extraKmCharge: toNumber(
        d.extraKmCharge
      ),

      driverAllowance: toNumber(
        d.driverAllowance
      ),

      nightCharge: toNumber(
        d.nightCharge
      ),

      airportParkingCharge: toNumber(
        d.airportParkingCharge
      ),

      tollIncluded: toBoolean(
        d.tollIncluded
      ),

      tollCharge: toNumber(
        d.tollCharge
      ),

      gstPercentage:
        pricing.gstPercentage,

      gstAmount:
        pricing.gstAmount,

      discount:
        pricing.discount,

      finalPrice:
        pricing.finalPrice,

      // Main searchable/display price
      price:
        pricing.finalPrice,

      currency:
        d.currency || "INR",

      /* DRIVER */

      driver: {
        name:
          driver.name ||
          d.driverName ||
          "",

        phone:
          driver.phone ||
          d.driverPhone ||
          "",

        alternatePhone:
          driver.alternatePhone ||
          d.driverAlternatePhone ||
          "",

        licenseNumber:
          driver.licenseNumber ||
          d.driverLicenseNumber ||
          "",

        experienceYears: toNumber(
          driver.experienceYears ||
          d.driverExperience
        ),
      },

      /* DOCUMENTS */

      documents: {
        rcNumber:
          documents.rcNumber ||
          d.rcNumber ||
          "",

        insuranceNumber:
          documents.insuranceNumber ||
          d.insuranceNumber ||
          "",

        insuranceExpiry:
          documents.insuranceExpiry ||
          d.insuranceExpiry ||
          null,

        permitNumber:
          documents.permitNumber ||
          d.permitNumber ||
          "",

        permitExpiry:
          documents.permitExpiry ||
          d.permitExpiry ||
          null,

        fitnessExpiry:
          documents.fitnessExpiry ||
          d.fitnessExpiry ||
          null,
      },

      /* AMENITIES */

      amenities: parseArray(
        d.amenities
      ),

      /* IMAGES */

      image,

      gallery,

      /* POLICIES */

      cancellationPolicy:
        d.cancellationPolicy || "",

      termsAndConditions:
        d.termsAndConditions || "",

      /* STATUS */

      status: "PENDING",

      isActive: true,
    });


    return res.status(201).json({
      success: true,
      message:
        "Cab added successfully. Waiting for admin approval.",
      data: cab,
    });

  } catch (error) {

    console.error(
      "ADD CAB ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to add cab",
    });
  }
};


/* =========================================================
   GET VENDOR CABS
   GET /api/vendor/cabs
========================================================= */

exports.getVendorCabs = async (
  req,
  res
) => {
  try {

    const {
      status,
      isActive,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      vendor: req.vendor._id,
    };

    if (status) {
      query.status =
        status.toUpperCase();
    }

    if (
      isActive !== undefined
    ) {
      query.isActive =
        toBoolean(isActive);
    }

    const skip =
      (Number(page) - 1) *
      Number(limit);

    const [cabs, total] =
      await Promise.all([
        Cab.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),

        Cab.countDocuments(query),
      ]);


    return res.status(200).json({
      success: true,

      total,

      page: Number(page),

      limit: Number(limit),

      totalPages:
        Math.ceil(
          total / Number(limit)
        ),

      data: cabs,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   GET SINGLE CAB
   GET /api/vendor/cabs/:id
========================================================= */

exports.getCabById = async (
  req,
  res
) => {
  try {

    const cab =
      await Cab.findOne({
        _id: req.params.id,
        vendor: req.vendor._id,
      });

    if (!cab) {
      return res.status(404).json({
        success: false,
        message: "Cab not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: cab,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   UPDATE CAB
   PUT /api/vendor/cabs/:id
========================================================= */

exports.updateCab = async (
  req,
  res
) => {
  try {

    const d = req.body;

    const cab =
      await Cab.findOne({
        _id: req.params.id,
        vendor: req.vendor._id,
      });

    if (!cab) {
      return res.status(404).json({
        success: false,
        message: "Cab not found",
      });
    }


    /*
      BASIC FIELDS
    */

    const allowedFields = [
      "cabType",
      "carName",
      "vehicleNumber",
      "brand",
      "model",
      "modelYear",
      "vehicleColor",
      "operatorName",
      "vendorName",
      "cabOwnerName",
      "email",
      "phone",
      "alternatePhone",
      "tripType",
      "fromCity",
      "toCity",
      "pickupLocation",
      "dropLocation",
      "pickupDate",
      "pickupTime",
      "dropDate",
      "dropTime",
      "estimatedDuration",
      "distanceKm",
      "totalSeats",
      "availableSeats",
      "luggageCapacity",
      "baseFare",
      "pricePerKm",
      "minimumKm",
      "extraKmCharge",
      "driverAllowance",
      "nightCharge",
      "airportParkingCharge",
      "tollCharge",
      "gstPercentage",
      "discount",
      "currency",
      "cancellationPolicy",
      "termsAndConditions",
    ];


    allowedFields.forEach((field) => {

      if (
        d[field] !== undefined &&
        d[field] !== ""
      ) {

        if (
          [
            "modelYear",
            "distanceKm",
            "totalSeats",
            "availableSeats",
            "luggageCapacity",
            "baseFare",
            "pricePerKm",
            "minimumKm",
            "extraKmCharge",
            "driverAllowance",
            "nightCharge",
            "airportParkingCharge",
            "tollCharge",
            "gstPercentage",
            "discount",
          ].includes(field)
        ) {

          cab[field] =
            toNumber(d[field]);

        } else {

          cab[field] = d[field];

        }
      }
    });


    /*
      BOOLEAN
    */

    if (
      d.tollIncluded !== undefined
    ) {
      cab.tollIncluded =
        toBoolean(
          d.tollIncluded
        );
    }


    /*
      ARRAYS
    */

    if (d.amenities !== undefined) {
      cab.amenities =
        parseArray(d.amenities);
    }

    if (d.viaCities !== undefined) {
      cab.viaCities =
        parseArray(d.viaCities);
    }


    /*
      DRIVER
    */

    if (d.driver) {

      const driver =
        parseObject(d.driver);

      cab.driver = {
        ...cab.driver.toObject(),
        ...driver,
      };

    }


    /*
      DOCUMENTS
    */

    if (d.documents) {

      const documents =
        parseObject(d.documents);

      cab.documents = {
        ...cab.documents.toObject(),
        ...documents,
      };

    }


    /*
      OLD STYLE DRIVER FIELDS
    */

    if (d.driverName !== undefined) {
      cab.driver.name =
        d.driverName;
    }

    if (d.driverPhone !== undefined) {
      cab.driver.phone =
        d.driverPhone;
    }

    if (
      d.driverLicenseNumber !==
      undefined
    ) {
      cab.driver.licenseNumber =
        d.driverLicenseNumber;
    }


    /*
      OLD STYLE DOCUMENT FIELDS
    */

    if (d.rcNumber !== undefined) {
      cab.documents.rcNumber =
        d.rcNumber;
    }

    if (
      d.insuranceNumber !== undefined
    ) {
      cab.documents.insuranceNumber =
        d.insuranceNumber;
    }

    if (
      d.insuranceExpiry !== undefined
    ) {
      cab.documents.insuranceExpiry =
        d.insuranceExpiry || null;
    }


    /*
      RECALCULATE PRICE
    */

    const pricing =
      calculateCabPrice(cab);

    cab.gstAmount =
      pricing.gstAmount;

    cab.finalPrice =
      pricing.finalPrice;

    cab.price =
      pricing.finalPrice;


    /*
      MAIN IMAGE
    */

    if (req.files?.image?.[0]) {

      cab.image =
        await uploadToCloudinary(
          req.files.image[0].path,
          "vendor_cabs/main"
        );

    }


    /*
      GALLERY
    */

    if (
      req.files?.gallery?.length
    ) {

      if (
        req.files.gallery.length > 10
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Maximum 10 gallery images allowed",
        });
      }

      const gallery = [];

      for (
        const file of req.files.gallery
      ) {

        const url =
          await uploadToCloudinary(
            file.path,
            "vendor_cabs/gallery"
          );

        gallery.push(url);
      }

      cab.gallery = gallery;
    }


    await cab.save();


    return res.status(200).json({
      success: true,
      message:
        "Cab updated successfully",
      data: cab,
    });

  } catch (error) {

    console.error(
      "UPDATE CAB ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   DELETE CAB
   DELETE /api/vendor/cabs/:id
========================================================= */

exports.deleteCab = async (
  req,
  res
) => {
  try {

    const cab =
      await Cab.findOneAndDelete({
        _id: req.params.id,
        vendor: req.vendor._id,
      });

    if (!cab) {
      return res.status(404).json({
        success: false,
        message: "Cab not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Cab deleted successfully",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   TOGGLE CAB ACTIVE STATUS
   PATCH /api/vendor/cabs/:id/toggle
========================================================= */

exports.toggleCabStatus = async (
  req,
  res
) => {
  try {

    const cab =
      await Cab.findOne({
        _id: req.params.id,
        vendor: req.vendor._id,
      });

    if (!cab) {
      return res.status(404).json({
        success: false,
        message: "Cab not found",
      });
    }

    cab.isActive =
      !cab.isActive;

    await cab.save();

    return res.status(200).json({
      success: true,

      message: cab.isActive
        ? "Cab activated successfully"
        : "Cab deactivated successfully",

      isActive: cab.isActive,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   PUBLIC CAB SEARCH
   MakeMyTrip Style

   GET /api/cabs/search
   ?fromCity=Delhi
   &toCity=Jaipur
   &tripType=ONE_WAY
========================================================= */

exports.searchCabs = async (
  req,
  res
) => {
  try {

    const {
      fromCity,
      toCity,
      tripType,
      cabType,
      pickupDate,
    } = req.query;


    const query = {
      status: "APPROVED",
      isActive: true,
    };


    if (fromCity) {
      query.fromCity =
        new RegExp(
          fromCity,
          "i"
        );
    }


    if (toCity) {
      query.toCity =
        new RegExp(
          toCity,
          "i"
        );
    }


    if (tripType) {
      query.tripType =
        tripType.toUpperCase();
    }


    if (cabType) {
      query.cabType =
        new RegExp(
          cabType,
          "i"
        );
    }


    if (pickupDate) {

      const startDate =
        new Date(pickupDate);

      const endDate =
        new Date(pickupDate);

      endDate.setHours(
        23,
        59,
        59,
        999
      );

      query.pickupDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }


    const cabs =
      await Cab.find(query)
        .select(
          "-documents -driver.licenseNumber"
        )
        .populate(
          "vendor",
          "name companyName"
        )
        .sort({
          finalPrice: 1,
        });


    return res.status(200).json({
      success: true,
      count: cabs.length,
      data: cabs,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* =========================================================
   GET SINGLE CAB - VENDOR
========================================================= */

exports.getCabById = async (req, res) => {
  try {
    const cab = await Cab.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!cab) {
      return res.status(404).json({
        success: false,
        message: "Cab not found",
      });
    }

    res.status(200).json({
      success: true,
      cab,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/* =========================================================
   TOGGLE CAB ACTIVE / INACTIVE - VENDOR
========================================================= */

exports.toggleCabStatus = async (req, res) => {
  try {
    const cab = await Cab.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!cab) {
      return res.status(404).json({
        success: false,
        message: "Cab not found",
      });
    }

    cab.isActive = !cab.isActive;

    await cab.save();

    res.status(200).json({
      success: true,
      message: cab.isActive
        ? "Cab activated successfully"
        : "Cab deactivated successfully",
      isActive: cab.isActive,
      cab,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/* =========================================================
   PUBLIC CAB SEARCH - USER PANEL
   MakeMyTrip style basic search
========================================================= */

exports.searchCabs = async (req, res) => {
  try {
    const {
      fromCity,
      toCity,
      cabType,
      seats,
      minPrice,
      maxPrice,
    } = req.query;

    const query = {
      isActive: true,
    };

    // From City
    if (fromCity) {
      query.fromCity = new RegExp(fromCity, "i");
    }

    // To City
    if (toCity) {
      query.toCity = new RegExp(toCity, "i");
    }

    // Cab Type
    if (cabType) {
      query.cabType = new RegExp(cabType, "i");
    }

    // Minimum Seats
    if (seats) {
      query.availableSeats = {
        $gte: Number(seats),
      };
    }

    // Price Filter
    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    const cabs = await Cab.find(query)
      .populate("vendor", "name companyName phone email")
      .sort({
        price: 1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: cabs.length,
      cabs,
    });
  } catch (err) {
    console.error("searchCabs error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};