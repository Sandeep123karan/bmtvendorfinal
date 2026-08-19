const Resort = require("../models/Resort.model");
const ResortRoom = require("../models/ResortRoom.model");
const ResortRoomUnit = require("../models/ResortRoomUnit.model");
const ResortInventory = require("../models/ResortInventory.model");


// ==========================================================
// CREATE / UPDATE INVENTORY
// ==========================================================

exports.upsertInventory = async (req, res) => {
  try {
    const {
      resortId,
      roomCategoryId,
      date,
      blockedRooms = 0,
      maintenanceRooms = 0,
      status = "AVAILABLE",
      notes = "",
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!resortId || !roomCategoryId || !date) {
      return res.status(400).json({
        success: false,
        message:
          "resortId, roomCategoryId and date are required.",
      });
    }


    // Normalize date to midnight
    const inventoryDate = new Date(date);
    inventoryDate.setHours(0, 0, 0, 0);


    if (Number.isNaN(inventoryDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date.",
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
    // TOTAL ACTIVE ROOM UNITS
    // Example: Deluxe has Room 101, 102, 103
    // totalRooms = 3
    // ==========================================

    const totalRooms = await ResortRoomUnit.countDocuments({
      resort: resortId,
      roomCategory: roomCategoryId,
      vendor: req.vendor._id,
      isActive: true,
      status: {
        $nin: ["INACTIVE"],
      },
    });


    const safeBlockedRooms = Number(blockedRooms);
    const safeMaintenanceRooms = Number(maintenanceRooms);


    if (
      safeBlockedRooms < 0 ||
      safeMaintenanceRooms < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Blocked and maintenance rooms cannot be negative.",
      });
    }


    // ==========================================
    // CHECK EXISTING INVENTORY
    // ==========================================

    let inventory = await ResortInventory.findOne({
      resort: resortId,
      roomCategory: roomCategoryId,
      date: inventoryDate,
    });


    const alreadyBookedRooms = inventory
      ? inventory.bookedRooms
      : 0;


    // ==========================================
    // CALCULATE AVAILABLE
    // ==========================================

    const availableRooms =
      totalRooms -
      alreadyBookedRooms -
      safeBlockedRooms -
      safeMaintenanceRooms;


    if (availableRooms < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Room count cannot be less than already booked, blocked and maintenance rooms.",
      });
    }


    // ==========================================
    // UPDATE OR CREATE
    // ==========================================

    inventory = await ResortInventory.findOneAndUpdate(
      {
        resort: resortId,
        roomCategory: roomCategoryId,
        date: inventoryDate,
      },
      {
        $set: {
          vendor: req.vendor._id,
          totalRooms,
          availableRooms,
          blockedRooms: safeBlockedRooms,
          maintenanceRooms: safeMaintenanceRooms,
          status:
            availableRooms === 0 && status === "AVAILABLE"
              ? "SOLD_OUT"
              : status,
          notes,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );


    return res.status(200).json({
      success: true,
      message: "Inventory saved successfully.",
      inventory,
    });

  } catch (error) {
    console.error("Upsert Inventory Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "Inventory already exists for this room category and date.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================================
// GET INVENTORY OF ONE RESORT
// ==========================================================

exports.getResortInventory = async (req, res) => {
  try {
    const { resortId } = req.params;
    const { startDate, endDate, roomCategoryId } = req.query;


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


    const filter = {
      resort: resortId,
      vendor: req.vendor._id,
    };


    // ==========================================
    // FILTER BY ROOM CATEGORY
    // ==========================================

    if (roomCategoryId) {
      filter.roomCategory = roomCategoryId;
    }


    // ==========================================
    // FILTER BY DATE RANGE
    // ==========================================

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.date.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }


    const inventory = await ResortInventory.find(filter)
      .populate(
        "roomCategory",
        "name basePrice maxAdults maxChildren"
      )
      .sort({
        date: 1,
      });


    return res.status(200).json({
      success: true,
      total: inventory.length,
      inventory,
    });

  } catch (error) {
    console.error("Get Resort Inventory Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================================
// GET INVENTORY BY ROOM CATEGORY
// ==========================================================

exports.getRoomCategoryInventory = async (req, res) => {
  try {
    const { roomCategoryId } = req.params;
    const { startDate, endDate } = req.query;


    const roomCategory = await ResortRoom.findOne({
      _id: roomCategoryId,
      vendor: req.vendor._id,
    });

    if (!roomCategory) {
      return res.status(404).json({
        success: false,
        message: "Room category not found or access denied.",
      });
    }


    const filter = {
      roomCategory: roomCategoryId,
      vendor: req.vendor._id,
    };


    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }


    const inventory = await ResortInventory.find(filter)
      .sort({ date: 1 });


    return res.status(200).json({
      success: true,
      total: inventory.length,
      inventory,
    });

  } catch (error) {
    console.error(
      "Get Room Category Inventory Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};