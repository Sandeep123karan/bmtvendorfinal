const Resort = require("../models/Resort.model");
const ResortRoom = require("../models/ResortRoom.model");
const ResortRoomUnit = require("../models/ResortRoomUnit.model");


/* ==========================================================
                    CREATE ROOM UNIT
========================================================== */

exports.createRoomUnit = async (req, res) => {
  try {
    const {
      resortId,
      roomCategoryId,
      roomNumber,
      floor,
      building,
      notes,
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!resortId || !roomCategoryId || !roomNumber) {
      return res.status(400).json({
        success: false,
        message:
          "resortId, roomCategoryId and roomNumber are required.",
      });
    }


    // ==========================================
    // CHECK RESORT OWNERSHIP
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
    // CHECK ROOM CATEGORY
    // Must belong to same resort
    // ==========================================

    const roomCategory = await ResortRoom.findOne({
      _id: roomCategoryId,
      resort: resortId,
      vendor: req.vendor._id,
    });

    if (!roomCategory) {
      return res.status(404).json({
        success: false,
        message:
          "Room category not found or does not belong to this resort.",
      });
    }


    // ==========================================
    // CHECK DUPLICATE ROOM NUMBER
    // ==========================================

    const existingUnit = await ResortRoomUnit.findOne({
      resort: resortId,
      roomNumber: roomNumber.trim().toUpperCase(),
    });

    if (existingUnit) {
      return res.status(400).json({
        success: false,
        message:
          "This room number already exists in this resort.",
      });
    }


    // ==========================================
    // CREATE ROOM UNIT
    // ==========================================

    const roomUnit = await ResortRoomUnit.create({
      vendor: req.vendor._id,
      resort: resortId,
      roomCategory: roomCategoryId,

      roomNumber: roomNumber.trim().toUpperCase(),

      floor: floor || "",
      building: building || "",
      notes: notes || "",

      status: "AVAILABLE",
      isActive: true,
    });


    return res.status(201).json({
      success: true,
      message: "Room unit created successfully.",
      roomUnit,
    });

  } catch (error) {
    console.error("Create Room Unit Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                GET ALL ROOM UNITS OF RESORT
========================================================== */

exports.getRoomUnits = async (req, res) => {
  try {
    const { resortId } = req.params;


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


    const roomUnits = await ResortRoomUnit.find({
      resort: resortId,
      vendor: req.vendor._id,
    })
      .populate("roomCategory", "name basePrice maxAdults maxChildren")
      .sort({
        roomNumber: 1,
      });


    return res.status(200).json({
      success: true,
      total: roomUnits.length,
      roomUnits,
    });

  } catch (error) {
    console.error("Get Room Units Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                GET ROOM UNITS BY CATEGORY
========================================================== */

exports.getRoomUnitsByCategory = async (req, res) => {
  try {
    const { roomCategoryId } = req.params;


    const roomUnits = await ResortRoomUnit.find({
      roomCategory: roomCategoryId,
      vendor: req.vendor._id,
    }).sort({
      roomNumber: 1,
    });


    return res.status(200).json({
      success: true,
      total: roomUnits.length,
      roomUnits,
    });

  } catch (error) {
    console.error("Get Room Units By Category Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    UPDATE ROOM UNIT
========================================================== */

exports.updateRoomUnit = async (req, res) => {
  try {
    const roomUnit = await ResortRoomUnit.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!roomUnit) {
      return res.status(404).json({
        success: false,
        message: "Room unit not found or access denied.",
      });
    }


    const allowedFields = [
      "floor",
      "building",
      "status",
      "isActive",
      "notes",
    ];


    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        roomUnit[field] = req.body[field];
      }
    });


    // Room number update separately
    if (req.body.roomNumber !== undefined) {
      roomUnit.roomNumber = req.body.roomNumber
        .trim()
        .toUpperCase();
    }


    await roomUnit.save();


    return res.status(200).json({
      success: true,
      message: "Room unit updated successfully.",
      roomUnit,
    });

  } catch (error) {
    console.error("Update Room Unit Error:", error);

    // Duplicate room number
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "This room number already exists in this resort.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    DELETE ROOM UNIT
========================================================== */

exports.deleteRoomUnit = async (req, res) => {
  try {
    const roomUnit = await ResortRoomUnit.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor._id,
    });


    if (!roomUnit) {
      return res.status(404).json({
        success: false,
        message: "Room unit not found or access denied.",
      });
    }


    return res.status(200).json({
      success: true,
      message: "Room unit deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Room Unit Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};