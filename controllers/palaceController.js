const Palace = require("../models/palaceModel");


/* ==========================================
   HELPER: SAFE JSON PARSE
========================================== */
const parseJSON = (value, fallback) => {
  try {
    if (!value) return fallback;

    return typeof value === "string"
      ? JSON.parse(value)
      : value;
  } catch (error) {
    return fallback;
  }
};


/* ==========================================
   HELPER: BOOLEAN
========================================== */
const toBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return fallback;
};


/* ==========================================
   CREATE PALACE
========================================== */
exports.createPalace = async (req, res) => {
  try {
    const b = req.body;

    const images = [];

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push({
          url: file.path || file.url || "",
          publicId: file.filename || file.public_id || "",
        });
      });
    }

    const palace = await Palace.create({
      vendor: req.vendor._id,

      // BASIC
      propertyName: b.propertyName,
      propertyType: b.propertyType || "heritage-palace",
      shortDescription: b.shortDescription || "",
      description: b.description || "",
      starRating: Number(b.starRating || 3),

      // CONTACT
      contact: {
        phone: b.phone || "",
        alternatePhone: b.alternatePhone || "",
        email: b.email || "",
      },

      // LOCATION
      address: {
        addressLine: b.addressLine || b.fullAddress || "",
        landmark: b.landmark || "",
        city: b.city || "",
        state: b.state || "",
        country: b.country || "India",
        pincode: b.pincode || "",
        latitude: b.latitude ? Number(b.latitude) : null,
        longitude: b.longitude ? Number(b.longitude) : null,
      },

      // PROPERTY
      totalRooms: Number(b.totalRooms || 0),
      heritageCertified: toBoolean(b.heritageCertified),
      weddingAllowed: toBoolean(b.weddingAllowed),
      eventAllowed: toBoolean(b.eventAllowed),

      // CHECK IN
      checkInTime: b.checkInTime || "14:00",
      checkOutTime: b.checkOutTime || "11:00",

      // AMENITIES
      amenities: parseJSON(b.amenities, []),

      // IMAGES
      images,
      coverImage: images[0] || {
        url: "",
        publicId: "",
      },

      // POLICIES
      policies: parseJSON(b.policies, {
        cancellationPolicy: "",
        childPolicy: "",
        petPolicy: "",
        smokingPolicy: "",
        unmarriedCouplesAllowed: false,
        localIdAllowed: false,
        idProofRequired: true,
      }),

      status: "DRAFT",
    });

    return res.status(201).json({
      success: true,
      message: "Palace created successfully",
      data: palace,
    });

  } catch (error) {
    console.error("CREATE PALACE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   GET MY PALACES
========================================== */
exports.getMyPalaces = async (req, res) => {
  try {
    const palaces = await Palace.find({
      vendor: req.vendor._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: palaces.length,
      data: palaces,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   GET SINGLE PALACE
========================================== */
exports.getPalaceById = async (req, res) => {
  try {
    const palace = await Palace.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!palace) {
      return res.status(404).json({
        success: false,
        message: "Palace not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: palace,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   UPDATE PALACE
========================================== */
exports.updatePalace = async (req, res) => {
  try {
    const b = req.body;

    const palace = await Palace.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!palace) {
      return res.status(404).json({
        success: false,
        message: "Palace not found",
      });
    }

    // Upload / merge new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: file.path || file.url || "",
        publicId: file.filename || file.public_id || "",
      }));

      palace.images = [
        ...(palace.images || []),
        ...newImages,
      ];

      if (!palace.coverImage?.url && newImages.length > 0) {
        palace.coverImage = newImages[0];
      }
    }

    // BASIC
    if (b.propertyName !== undefined)
      palace.propertyName = b.propertyName;

    if (b.propertyType !== undefined)
      palace.propertyType = b.propertyType;

    if (b.shortDescription !== undefined)
      palace.shortDescription = b.shortDescription;

    if (b.description !== undefined)
      palace.description = b.description;

    if (b.starRating !== undefined)
      palace.starRating = Number(b.starRating);

    // CONTACT
    if (b.phone !== undefined)
      palace.contact.phone = b.phone;

    if (b.alternatePhone !== undefined)
      palace.contact.alternatePhone = b.alternatePhone;

    if (b.email !== undefined)
      palace.contact.email = b.email;

    // LOCATION
    if (b.addressLine !== undefined)
      palace.address.addressLine = b.addressLine;

    if (b.fullAddress !== undefined)
      palace.address.addressLine = b.fullAddress;

    if (b.landmark !== undefined)
      palace.address.landmark = b.landmark;

    if (b.city !== undefined)
      palace.address.city = b.city;

    if (b.state !== undefined)
      palace.address.state = b.state;

    if (b.country !== undefined)
      palace.address.country = b.country;

    if (b.pincode !== undefined)
      palace.address.pincode = b.pincode;

    if (b.latitude !== undefined)
      palace.address.latitude = Number(b.latitude);

    if (b.longitude !== undefined)
      palace.address.longitude = Number(b.longitude);

    // PROPERTY
    if (b.totalRooms !== undefined)
      palace.totalRooms = Number(b.totalRooms);

    if (b.heritageCertified !== undefined)
      palace.heritageCertified = toBoolean(b.heritageCertified);

    if (b.weddingAllowed !== undefined)
      palace.weddingAllowed = toBoolean(b.weddingAllowed);

    if (b.eventAllowed !== undefined)
      palace.eventAllowed = toBoolean(b.eventAllowed);

    // TIME
    if (b.checkInTime !== undefined)
      palace.checkInTime = b.checkInTime;

    if (b.checkOutTime !== undefined)
      palace.checkOutTime = b.checkOutTime;

    // JSON
    if (b.amenities !== undefined)
      palace.amenities = parseJSON(
        b.amenities,
        palace.amenities
      );

    if (b.policies !== undefined)
      palace.policies = parseJSON(
        b.policies,
        palace.policies
      );

    await palace.save();

    return res.status(200).json({
      success: true,
      message: "Palace updated successfully",
      data: palace,
    });

  } catch (error) {
    console.error("UPDATE PALACE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   DELETE PALACE
========================================== */
exports.deletePalace = async (req, res) => {
  try {
    const palace = await Palace.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!palace) {
      return res.status(404).json({
        success: false,
        message: "Palace not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Palace deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   ACTIVE / INACTIVE
========================================== */
exports.togglePalaceStatus = async (req, res) => {
  try {
    const palace = await Palace.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!palace) {
      return res.status(404).json({
        success: false,
        message: "Palace not found",
      });
    }

    if (
      palace.status !== "APPROVED" &&
      palace.status !== "INACTIVE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only approved palace listings can be activated or deactivated.",
      });
    }

    palace.status =
      palace.status === "APPROVED"
        ? "INACTIVE"
        : "APPROVED";

    palace.isActive =
      palace.status === "APPROVED";

    await palace.save();

    return res.status(200).json({
      success: true,
      message: "Palace status updated successfully",
      data: palace,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};