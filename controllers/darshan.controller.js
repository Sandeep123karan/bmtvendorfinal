const Darshan = require("../models/Darshan.model");
const cloudinary = require("../config/cloudinary");

// =====================================================
// GET VENDOR ID
// =====================================================

const getVendorId = (req) => {
  return (
    req.vendor?._id ||
    req.user?.vendorId ||
    req.user?._id ||
    req.vendor?.id ||
    req.user?.id
  );
};

// =====================================================
// CREATE SLUG
// =====================================================

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// =====================================================
// UPLOAD IMAGE TO CLOUDINARY
// =====================================================

const uploadToCloudinary = (
  file,
  folder = "darshans"
) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });
};

// =====================================================
// CREATE DARSHAN
// =====================================================

exports.createDarshan = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    // =================================================
    // BASIC REQUIRED FIELDS
    // =================================================

    const {
      name,
      description,
      shortDescription,
      templeName,
      deityName,
      deityType,
      address,
      landmark,
      city,
      state,
      country,
      pincode,
      latitude,
      longitude,
      openingTime,
      closingTime,
      morningDarshanStart,
      morningDarshanEnd,
      eveningDarshanStart,
      eveningDarshanEnd,
      dailyCapacity,
      basePrice,
      currency,
      wheelchairAccessible,
      parkingAvailable,
      cloakRoomAvailable,
      prasadAvailable,
      ageRestriction,
      dressCode,
      entryPolicy,
      cancellationPolicy,
      phone,
      email,
      website,
    } = req.body;

    if (
      !name ||
      !templeName ||
      !address ||
      !city ||
      !state
    ) {
      return res.status(400).json({
        success: false,
        message:
          "name, templeName, address, city and state are required",
      });
    }

    // =================================================
    // CHECK EXISTING
    // =================================================

    const existing = await Darshan.findOne({
      vendorId,
      name: name.trim(),
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "Darshan with this name already exists",
      });
    }

    // =================================================
    // SLUG
    // =================================================

    let slug = generateSlug(name);

    const slugExists = await Darshan.findOne({
      slug,
    });

    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }

    // =================================================
    // MAIN IMAGE
    // =================================================

    let mainImage = "";

    if (
      req.files &&
      req.files.mainImage &&
      req.files.mainImage.length > 0
    ) {
      mainImage = await uploadToCloudinary(
        req.files.mainImage[0],
        "darshans/main"
      );
    }

    // =================================================
    // GALLERY IMAGES
    // =================================================

    let galleryImages = [];

    if (
      req.files &&
      req.files.galleryImages &&
      req.files.galleryImages.length > 0
    ) {
      galleryImages = await Promise.all(
        req.files.galleryImages.map((file) =>
          uploadToCloudinary(
            file,
            "darshans/gallery"
          )
        )
      );
    }

    // =================================================
    // ARRAY FIELDS
    // =================================================

    let operatingDays = [];
    let darshanTypes = [];

    if (req.body.operatingDays) {
      operatingDays = Array.isArray(
        req.body.operatingDays
      )
        ? req.body.operatingDays
        : req.body.operatingDays
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (req.body.darshanTypes) {
      darshanTypes = Array.isArray(
        req.body.darshanTypes
      )
        ? req.body.darshanTypes
        : req.body.darshanTypes
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    // =================================================
    // CREATE
    // =================================================

    const darshan = await Darshan.create({
      vendorId,

      name: name.trim(),
      slug,

      description: description || "",
      shortDescription: shortDescription || "",

      templeName: templeName.trim(),
      deityName: deityName || "",
      deityType: deityType || "",

      address: address.trim(),
      landmark: landmark || "",
      city: city.trim(),
      state: state.trim(),
      country: country || "India",
      pincode: pincode || "",

      latitude: latitude
        ? Number(latitude)
        : null,

      longitude: longitude
        ? Number(longitude)
        : null,

      mainImage,
      galleryImages,

      openingTime: openingTime || "",
      closingTime: closingTime || "",

      morningDarshanStart:
        morningDarshanStart || "",

      morningDarshanEnd:
        morningDarshanEnd || "",

      eveningDarshanStart:
        eveningDarshanStart || "",

      eveningDarshanEnd:
        eveningDarshanEnd || "",

      operatingDays,
      darshanTypes,

      dailyCapacity: Number(
        dailyCapacity || 0
      ),

      basePrice: Number(
        basePrice || 0
      ),

      currency: currency || "INR",

      wheelchairAccessible:
        wheelchairAccessible === "true" ||
        wheelchairAccessible === true,

      parkingAvailable:
        parkingAvailable === "true" ||
        parkingAvailable === true,

      cloakRoomAvailable:
        cloakRoomAvailable === "true" ||
        cloakRoomAvailable === true,

      prasadAvailable:
        prasadAvailable === "true" ||
        prasadAvailable === true,

      ageRestriction: Number(
        ageRestriction || 0
      ),

      dressCode: dressCode || "",
      entryPolicy: entryPolicy || "",
      cancellationPolicy:
        cancellationPolicy || "",

      phone: phone || "",
      email: email || "",
      website: website || "",

      status: "draft",
      isPublished: false,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message:
        "Darshan created successfully",
      data: darshan,
    });
  } catch (error) {
    console.error(
      "CREATE DARSHAN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET MY DARSHANS
// =====================================================

exports.getMyDarshans = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const darshans = await Darshan.find({
      vendorId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: darshans.length,
      data: darshans,
    });
  } catch (error) {
    console.error(
      "GET MY DARSHANS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE DARSHAN
// =====================================================

exports.getDarshanById = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    const darshan = await Darshan.findOne({
      _id: req.params.id,
      vendorId,
    });

    if (!darshan) {
      return res.status(404).json({
        success: false,
        message: "Darshan not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: darshan,
    });
  } catch (error) {
    console.error(
      "GET DARSHAN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE DARSHAN
// =====================================================

exports.updateDarshan = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    const darshan = await Darshan.findOne({
      _id: req.params.id,
      vendorId,
    });

    if (!darshan) {
      return res.status(404).json({
        success: false,
        message: "Darshan not found",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "shortDescription",
      "templeName",
      "deityName",
      "deityType",
      "address",
      "landmark",
      "city",
      "state",
      "country",
      "pincode",
      "latitude",
      "longitude",
      "openingTime",
      "closingTime",
      "morningDarshanStart",
      "morningDarshanEnd",
      "eveningDarshanStart",
      "eveningDarshanEnd",
      "dailyCapacity",
      "basePrice",
      "currency",
      "wheelchairAccessible",
      "parkingAvailable",
      "cloakRoomAvailable",
      "prasadAvailable",
      "ageRestriction",
      "dressCode",
      "entryPolicy",
      "cancellationPolicy",
      "phone",
      "email",
      "website",
    ];

    allowedFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        darshan[field] =
          req.body[field];
      }
    });

    // =================================================
    // ARRAY FIELDS
    // =================================================

    if (req.body.operatingDays) {
      darshan.operatingDays =
        Array.isArray(
          req.body.operatingDays
        )
          ? req.body.operatingDays
          : req.body.operatingDays
              .split(",")
              .map((item) =>
                item.trim()
              )
              .filter(Boolean);
    }

    if (req.body.darshanTypes) {
      darshan.darshanTypes =
        Array.isArray(
          req.body.darshanTypes
        )
          ? req.body.darshanTypes
          : req.body.darshanTypes
              .split(",")
              .map((item) =>
                item.trim()
              )
              .filter(Boolean);
    }

    // =================================================
    // NEW MAIN IMAGE
    // =================================================

    if (
      req.files &&
      req.files.mainImage &&
      req.files.mainImage.length > 0
    ) {
      darshan.mainImage =
        await uploadToCloudinary(
          req.files.mainImage[0],
          "darshans/main"
        );
    }

    // =================================================
    // NEW GALLERY IMAGES
    // =================================================

    if (
      req.files &&
      req.files.galleryImages &&
      req.files.galleryImages.length > 0
    ) {
      const newImages =
        await Promise.all(
          req.files.galleryImages.map(
            (file) =>
              uploadToCloudinary(
                file,
                "darshans/gallery"
              )
          )
        );

      darshan.galleryImages = [
        ...darshan.galleryImages,
        ...newImages,
      ];
    }

    // =================================================
    // SLUG UPDATE
    // =================================================

    if (req.body.name) {
      let newSlug =
        generateSlug(req.body.name);

      const slugExists =
        await Darshan.findOne({
          slug: newSlug,
          _id: {
            $ne: darshan._id,
          },
        });

      if (slugExists) {
        newSlug = `${newSlug}-${Date.now()}`;
      }

      darshan.slug = newSlug;
    }

    // =================================================
    // RE-SUBMIT FOR REVIEW
    // =================================================

    darshan.status = "pending";
    darshan.isPublished = false;

    await darshan.save();

    return res.status(200).json({
      success: true,
      message:
        "Darshan updated and sent for review",
      data: darshan,
    });
  } catch (error) {
    console.error(
      "UPDATE DARSHAN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE DARSHAN
// =====================================================

exports.deleteDarshan = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    const darshan = await Darshan.findOne({
      _id: req.params.id,
      vendorId,
    });

    if (!darshan) {
      return res.status(404).json({
        success: false,
        message: "Darshan not found",
      });
    }

    await Darshan.deleteOne({
      _id: darshan._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Darshan deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE DARSHAN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};