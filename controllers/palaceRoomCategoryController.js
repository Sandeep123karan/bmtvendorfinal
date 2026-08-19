const Palace = require("../models/palaceModel");
const PalaceRoomCategory = require("../models/palaceRoomCategoryModel");


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


const toBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return fallback;
};


/* ==========================================
   CREATE ROOM CATEGORY
========================================== */

exports.createRoomCategory = async (req, res) => {
  try {
    const b = req.body;

    // Vendor owns this palace?
    const palace = await Palace.findOne({
      _id: b.palaceId,
      vendor: req.vendor._id,
    });

    if (!palace) {
      return res.status(404).json({
        success: false,
        message: "Palace not found or access denied",
      });
    }

    const includedAdults = Number(b.includedAdults || 2);
    const maxAdults = Number(b.maxAdults || 2);
    const maxChildren = Number(b.maxChildren || 0);
    const maxGuests = Number(
      b.maxGuests || maxAdults + maxChildren
    );

    if (includedAdults > maxAdults) {
      return res.status(400).json({
        success: false,
        message:
          "Included adults cannot be greater than maximum adults",
      });
    }

    const images = [];

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push({
          url: file.path || file.url || "",
          publicId: file.filename || file.public_id || "",
        });
      });
    }

    const roomCategory = await PalaceRoomCategory.create({
      vendor: req.vendor._id,
      palace: palace._id,

      name: b.name,
      description: b.description || "",
      roomType: b.roomType || "DELUXE",

      roomSize: Number(b.roomSize || 0),
      roomSizeUnit: b.roomSizeUnit || "SQFT",

      bedType: b.bedType || "",
      bedCount: Number(b.bedCount || 1),

      includedAdults,
      maxAdults,
      maxChildren,
      maxGuests,

      maxExtraMattress: Number(
        b.maxExtraMattress || 0
      ),

      extraMattressAllowed: toBoolean(
        b.extraMattressAllowed
      ),

      totalUnits: Number(b.totalUnits || 1),

      amenities: parseJSON(b.amenities, []),

      images,
      coverImage: images[0] || {
        url: "",
        publicId: "",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Room category created successfully",
      data: roomCategory,
    });

  } catch (error) {
    console.error("CREATE ROOM CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   GET ROOM CATEGORIES OF ONE PALACE
========================================== */

exports.getRoomCategoriesByPalace = async (req, res) => {
  try {
    const palace = await Palace.findOne({
      _id: req.params.palaceId,
      vendor: req.vendor._id,
    });

    if (!palace) {
      return res.status(404).json({
        success: false,
        message: "Palace not found or access denied",
      });
    }

    const rooms = await PalaceRoomCategory.find({
      palace: palace._id,
      vendor: req.vendor._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   GET SINGLE ROOM CATEGORY
========================================== */

exports.getRoomCategoryById = async (req, res) => {
  try {
    const room = await PalaceRoomCategory.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: room,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   UPDATE ROOM CATEGORY
========================================== */

exports.updateRoomCategory = async (req, res) => {
  try {
    const b = req.body;

    const room = await PalaceRoomCategory.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room category not found",
      });
    }

    // Basic fields
    const fields = [
      "name",
      "description",
      "roomType",
      "roomSizeUnit",
      "bedType",
    ];

    fields.forEach((field) => {
      if (b[field] !== undefined) {
        room[field] = b[field];
      }
    });

    // Number fields
    const numberFields = [
      "roomSize",
      "bedCount",
      "includedAdults",
      "maxAdults",
      "maxChildren",
      "maxGuests",
      "maxExtraMattress",
      "totalUnits",
    ];

    numberFields.forEach((field) => {
      if (b[field] !== undefined) {
        room[field] = Number(b[field]);
      }
    });

    if (
      room.includedAdults > room.maxAdults
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Included adults cannot be greater than maximum adults",
      });
    }

    if (b.extraMattressAllowed !== undefined) {
      room.extraMattressAllowed = toBoolean(
        b.extraMattressAllowed
      );
    }

    if (b.amenities !== undefined) {
      room.amenities = parseJSON(
        b.amenities,
        room.amenities
      );
    }

    // New images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: file.path || file.url || "",
        publicId: file.filename || file.public_id || "",
      }));

      room.images = [
        ...(room.images || []),
        ...newImages,
      ];

      if (!room.coverImage?.url) {
        room.coverImage = newImages[0];
      }
    }

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Room category updated successfully",
      data: room,
    });

  } catch (error) {
    console.error("UPDATE ROOM CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   DELETE ROOM CATEGORY
========================================== */

exports.deleteRoomCategory = async (req, res) => {
  try {
    const room = await PalaceRoomCategory.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Room category deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   TOGGLE ROOM ACTIVE / INACTIVE
========================================== */

exports.toggleRoomCategory = async (req, res) => {
  try {
    const room = await PalaceRoomCategory.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room category not found",
      });
    }

    room.isActive = !room.isActive;

    await room.save();

    return res.status(200).json({
      success: true,
      message: `Room category ${
        room.isActive ? "activated" : "deactivated"
      } successfully`,
      data: room,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};