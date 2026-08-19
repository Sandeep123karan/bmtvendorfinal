const Resort = require("../models/Resort.model");
const ResortRoom = require("../models/ResortRoom.model");


/* ==========================================================
                CREATE ROOM CATEGORY
========================================================== */

exports.createRoom = async (req, res) => {
  try {
    const {
      resortId,
      name,
      description,
      roomSize,
      roomSizeUnit,
      bedType,
      numberOfBeds,
      maxAdults,
      maxChildren,
      maxGuests,
      basePrice,
      extraAdultPrice,
      extraChildPrice,
      mealPlans,
      amenities,
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!resortId || !name || basePrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "resortId, name and basePrice are required.",
      });
    }


    // ==========================================
    // CHECK RESORT OWNERSHIP
    // Vendor can only add room to own resort
    // ==========================================

    const resort = await Resort.findOne({
      _id: resortId,
      vendor: req.vendor._id,
    });

    if (!resort) {
      return res.status(404).json({
        success: false,
        message: "Resort not found or access denied.",
      });
    }


    // ==========================================
    // CHECK DUPLICATE ROOM CATEGORY
    // ==========================================

    const existingRoom = await ResortRoom.findOne({
      resort: resortId,
      name: name.trim(),
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "This room category already exists in this resort.",
      });
    }


    // ==========================================
    // CREATE ROOM
    // ==========================================

    const room = await ResortRoom.create({
      resort: resortId,
      vendor: req.vendor._id,

      name: name.trim(),
      description: description || "",

      roomSize: roomSize || 0,
      roomSizeUnit: roomSizeUnit || "sqft",

      bedType: bedType || "",
      numberOfBeds: numberOfBeds || 1,

      maxAdults: maxAdults || 2,
      maxChildren: maxChildren || 0,
      maxGuests: maxGuests || 2,

      basePrice,

      extraAdultPrice: extraAdultPrice || 0,
      extraChildPrice: extraChildPrice || 0,

      mealPlans: mealPlans || [],
      amenities: amenities || [],
    });


    return res.status(201).json({
      success: true,
      message: "Room category created successfully.",
      room,
    });

  } catch (error) {
    console.error("Create Room Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                GET ROOMS OF A RESORT
========================================================== */

exports.getResortRooms = async (req, res) => {
  try {
    const { resortId } = req.params;


    // Security check
    const resort = await Resort.findOne({
      _id: resortId,
      vendor: req.vendor._id,
    });

    if (!resort) {
      return res.status(404).json({
        success: false,
        message: "Resort not found or access denied.",
      });
    }


    const rooms = await ResortRoom.find({
      resort: resortId,
      vendor: req.vendor._id,
    }).sort({ createdAt: -1 });


    return res.status(200).json({
      success: true,
      total: rooms.length,
      rooms,
    });

  } catch (error) {
    console.error("Get Resort Rooms Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                GET SINGLE ROOM CATEGORY
========================================================== */

exports.getSingleRoom = async (req, res) => {
  try {
    const room = await ResortRoom.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room category not found or access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                UPDATE ROOM CATEGORY
========================================================== */

exports.updateRoom = async (req, res) => {
  try {
    const room = await ResortRoom.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room category not found or access denied.",
      });
    }


    const allowedFields = [
      "name",
      "description",
      "roomSize",
      "roomSizeUnit",
      "bedType",
      "numberOfBeds",
      "maxAdults",
      "maxChildren",
      "maxGuests",
      "basePrice",
      "extraAdultPrice",
      "extraChildPrice",
      "mealPlans",
      "amenities",
      "status",
      "isActive",
    ];


    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        room[field] = req.body[field];
      }
    });


    await room.save();


    return res.status(200).json({
      success: true,
      message: "Room category updated successfully.",
      room,
    });

  } catch (error) {
    console.error("Update Room Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                DELETE ROOM CATEGORY
========================================================== */

exports.deleteRoom = async (req, res) => {
  try {
    const room = await ResortRoom.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room category not found or access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Room category deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Room Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};