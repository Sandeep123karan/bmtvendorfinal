const Palace = require("../models/palaceModel");
const PalaceRoomCategory = require(
  "../models/palaceRoomCategoryModel"
);
const PalaceRoomUnit = require(
  "../models/palaceRoomUnitModel"
);


/* ==========================================
   CREATE ROOM UNIT
========================================== */

exports.createRoomUnit = async (req, res) => {
  try {
    const {
      palaceId,
      roomCategoryId,
      roomNumber,
      floor,
      wing,
      notes,
    } = req.body;


    // Vendor palace check
    const palace = await Palace.findOne({
      _id: palaceId,
      vendor: req.vendor._id,
    });

    if (!palace) {
      return res.status(404).json({
        success: false,
        message: "Palace not found or access denied",
      });
    }


    // Room category check
    const roomCategory =
      await PalaceRoomCategory.findOne({
        _id: roomCategoryId,
        palace: palaceId,
        vendor: req.vendor._id,
      });

    if (!roomCategory) {
      return res.status(404).json({
        success: false,
        message:
          "Room category not found for this palace",
      });
    }


    // Duplicate room number check
    const existingRoom =
      await PalaceRoomUnit.findOne({
        palace: palaceId,
        roomNumber: roomNumber.trim(),
      });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message:
          `Room number ${roomNumber} already exists`,
      });
    }


    const roomUnit =
      await PalaceRoomUnit.create({
        vendor: req.vendor._id,
        palace: palaceId,
        roomCategory: roomCategoryId,

        roomNumber: roomNumber.trim(),
        floor: floor || "",
        wing: wing || "",
        notes: notes || "",
      });


    return res.status(201).json({
      success: true,
      message: "Palace room unit created successfully",
      data: roomUnit,
    });

  } catch (error) {
    console.error(
      "CREATE PALACE ROOM UNIT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   GET ROOM UNITS BY PALACE
========================================== */

exports.getRoomUnitsByPalace = async (
  req,
  res
) => {
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


    const rooms =
      await PalaceRoomUnit.find({
        palace: req.params.palaceId,
        vendor: req.vendor._id,
      })
        .populate(
          "roomCategory",
          "name roomType"
        )
        .sort({
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
   GET ROOM UNITS BY CATEGORY
========================================== */

exports.getRoomUnitsByCategory = async (
  req,
  res
) => {
  try {
    const rooms =
      await PalaceRoomUnit.find({
        roomCategory:
          req.params.roomCategoryId,
        vendor: req.vendor._id,
      }).sort({
        roomNumber: 1,
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
   GET SINGLE ROOM UNIT
========================================== */

exports.getRoomUnitById = async (
  req,
  res
) => {
  try {
    const room =
      await PalaceRoomUnit.findOne({
        _id: req.params.id,
        vendor: req.vendor._id,
      })
        .populate("palace", "propertyName")
        .populate(
          "roomCategory",
          "name roomType"
        );


    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room unit not found",
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
   UPDATE ROOM UNIT
========================================== */

exports.updateRoomUnit = async (
  req,
  res
) => {
  try {
    const room =
      await PalaceRoomUnit.findOne({
        _id: req.params.id,
        vendor: req.vendor._id,
      });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room unit not found",
      });
    }


    const allowedFields = [
      "roomNumber",
      "floor",
      "wing",
      "notes",
    ];


    allowedFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        room[field] = req.body[field];
      }
    });


    await room.save();


    return res.status(200).json({
      success: true,
      message:
        "Room unit updated successfully",
      data: room,
    });

  } catch (error) {

    // Duplicate room number
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "Room number already exists in this palace",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   UPDATE ROOM STATUS
========================================== */

exports.updateRoomStatus = async (
  req,
  res
) => {
  try {
    const allowedStatuses = [
      "AVAILABLE",
      "OCCUPIED",
      "RESERVED",
      "MAINTENANCE",
      "OUT_OF_SERVICE",
      "BLOCKED",
    ];


    const { status } = req.body;


    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room status",
      });
    }


    const room =
      await PalaceRoomUnit.findOneAndUpdate(
        {
          _id: req.params.id,
          vendor: req.vendor._id,
        },
        {
          status,
        },
        {
          new: true,
        }
      );


    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room unit not found",
      });
    }


    return res.status(200).json({
      success: true,
      message:
        "Room status updated successfully",
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
   UPDATE HOUSEKEEPING STATUS
========================================== */

exports.updateHousekeepingStatus =
  async (req, res) => {
    try {
      const allowedStatuses = [
        "CLEAN",
        "DIRTY",
        "INSPECTED",
        "CLEANING_IN_PROGRESS",
      ];


      const { housekeepingStatus } =
        req.body;


      if (
        !allowedStatuses.includes(
          housekeepingStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid housekeeping status",
        });
      }


      const room =
        await PalaceRoomUnit.findOneAndUpdate(
          {
            _id: req.params.id,
            vendor: req.vendor._id,
          },
          {
            housekeepingStatus,
          },
          {
            new: true,
          }
        );


      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room unit not found",
        });
      }


      return res.status(200).json({
        success: true,
        message:
          "Housekeeping status updated successfully",
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
   DELETE ROOM UNIT
========================================== */

exports.deleteRoomUnit = async (
  req,
  res
) => {
  try {
    const room =
      await PalaceRoomUnit.findOneAndDelete({
        _id: req.params.id,
        vendor: req.vendor._id,
      });


    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room unit not found",
      });
    }


    return res.status(200).json({
      success: true,
      message:
        "Room unit deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};