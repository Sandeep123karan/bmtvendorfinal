const Palace = require("../models/palaceModel");
const PalaceRoomCategory = require("../models/palaceRoomCategoryModel");
const PalaceInventory = require("../models/palaceInventoryModel");


/* ==========================================
   HELPER - DATE NORMALIZE
========================================== */

const normalizeDate = (date) => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return null;
  }

  d.setHours(0, 0, 0, 0);

  return d;
};


/* ==========================================
   CALCULATE AVAILABLE ROOMS
========================================== */

const calculateAvailableRooms = (inventory) => {
  const usedRooms =
    Number(inventory.bookedRooms || 0) +
    Number(inventory.blockedRooms || 0) +
    Number(inventory.maintenanceRooms || 0);

  return Math.max(
    Number(inventory.totalRooms || 0) - usedRooms,
    0
  );
};


/* ==========================================
   CREATE / UPDATE SINGLE DAY INVENTORY
========================================== */

exports.upsertInventory = async (req, res) => {
  try {
    const {
      palaceId,
      roomCategoryId,
      date,
      totalRooms,
      bookedRooms,
      blockedRooms,
      maintenanceRooms,
      stopSell,
      closedToArrival,
      closedToDeparture,
      minimumStay,
      maximumStay,
      notes,
    } = req.body;


    if (!palaceId || !roomCategoryId || !date) {
      return res.status(400).json({
        success: false,
        message:
          "palaceId, roomCategoryId and date are required",
      });
    }


    const inventoryDate = normalizeDate(date);

    if (!inventoryDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }


    // Palace check
    const palace = await Palace.findById(palaceId);

    if (!palace) {
      return res.status(404).json({
        success: false,
        message: "Palace not found",
      });
    }


    // Category palace ke andar honi chahiye
    const roomCategory =
      await PalaceRoomCategory.findOne({
        _id: roomCategoryId,
        palace: palaceId,
      });


    if (!roomCategory) {
      return res.status(404).json({
        success: false,
        message:
          "Room category not found for this palace",
      });
    }


    let inventory =
      await PalaceInventory.findOne({
        palace: palaceId,
        roomCategory: roomCategoryId,
        date: inventoryDate,
      });


    if (!inventory) {
      inventory = new PalaceInventory({
        palace: palaceId,
        roomCategory: roomCategoryId,
        date: inventoryDate,

        totalRooms:
          Number(totalRooms) || 0,

        bookedRooms:
          Number(bookedRooms) || 0,

        blockedRooms:
          Number(blockedRooms) || 0,

        maintenanceRooms:
          Number(maintenanceRooms) || 0,

        stopSell:
          stopSell === true ||
          stopSell === "true",

        closedToArrival:
          closedToArrival === true ||
          closedToArrival === "true",

        closedToDeparture:
          closedToDeparture === true ||
          closedToDeparture === "true",

        minimumStay:
          Number(minimumStay) || 1,

        maximumStay:
          Number(maximumStay) || 30,

        notes: notes || "",
      });
    } else {
      // Sirf provided fields update karo

      if (totalRooms !== undefined) {
        inventory.totalRooms =
          Number(totalRooms);
      }

      if (bookedRooms !== undefined) {
        inventory.bookedRooms =
          Number(bookedRooms);
      }

      if (blockedRooms !== undefined) {
        inventory.blockedRooms =
          Number(blockedRooms);
      }

      if (maintenanceRooms !== undefined) {
        inventory.maintenanceRooms =
          Number(maintenanceRooms);
      }

      if (stopSell !== undefined) {
        inventory.stopSell =
          stopSell === true ||
          stopSell === "true";
      }

      if (closedToArrival !== undefined) {
        inventory.closedToArrival =
          closedToArrival === true ||
          closedToArrival === "true";
      }

      if (closedToDeparture !== undefined) {
        inventory.closedToDeparture =
          closedToDeparture === true ||
          closedToDeparture === "true";
      }

      if (minimumStay !== undefined) {
        inventory.minimumStay =
          Number(minimumStay);
      }

      if (maximumStay !== undefined) {
        inventory.maximumStay =
          Number(maximumStay);
      }

      if (notes !== undefined) {
        inventory.notes = notes;
      }
    }


    // Validation
    const usedRooms =
      Number(inventory.bookedRooms || 0) +
      Number(inventory.blockedRooms || 0) +
      Number(inventory.maintenanceRooms || 0);


    if (usedRooms > inventory.totalRooms) {
      return res.status(400).json({
        success: false,
        message:
          "Booked + blocked + maintenance rooms cannot exceed total rooms",
      });
    }


    if (
      Number(inventory.minimumStay) >
      Number(inventory.maximumStay)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum stay cannot be greater than maximum stay",
      });
    }


    inventory.availableRooms =
      calculateAvailableRooms(inventory);


    await inventory.save();


    return res.status(200).json({
      success: true,
      message:
        "Palace inventory saved successfully",
      data: inventory,
    });

  } catch (error) {
    console.error(
      "PALACE INVENTORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   GET INVENTORY
========================================== */

exports.getInventory = async (req, res) => {
  try {
    const {
      palaceId,
      roomCategoryId,
      startDate,
      endDate,
    } = req.query;


    const filter = {};


    if (palaceId) {
      filter.palace = palaceId;
    }


    if (roomCategoryId) {
      filter.roomCategory = roomCategoryId;
    }


    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        const start =
          normalizeDate(startDate);

        if (start) {
          filter.date.$gte = start;
        }
      }

      if (endDate) {
        const end =
          normalizeDate(endDate);

        if (end) {
          filter.date.$lte = end;
        }
      }
    }


    const inventory =
      await PalaceInventory.find(filter)
        .populate(
          "palace",
          "propertyName city state"
        )
        .populate(
          "roomCategory"
        )
        .sort({
          date: 1,
        });


    return res.json({
      success: true,
      count: inventory.length,
      data: inventory,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   GET SINGLE INVENTORY
========================================== */

exports.getInventoryById = async (
  req,
  res
) => {
  try {
    const inventory =
      await PalaceInventory.findById(
        req.params.id
      )
        .populate(
          "palace",
          "propertyName"
        )
        .populate("roomCategory");


    if (!inventory) {
      return res.status(404).json({
        success: false,
        message:
          "Inventory not found",
      });
    }


    return res.json({
      success: true,
      data: inventory,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   DELETE INVENTORY
========================================== */

exports.deleteInventory = async (
  req,
  res
) => {
  try {
    const inventory =
      await PalaceInventory.findByIdAndDelete(
        req.params.id
      );


    if (!inventory) {
      return res.status(404).json({
        success: false,
        message:
          "Inventory not found",
      });
    }


    return res.json({
      success: true,
      message:
        "Inventory deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};