// const Resort = require("../models/Resort.model");
// const ResortRoom = require("../models/ResortRoom.model");
// const ResortRoomUnit = require("../models/ResortRoomUnit.model");


// /* ==========================================================
//                     CREATE ROOM UNIT
// ========================================================== */

// exports.createRoomUnit = async (req, res) => {
//   try {
//     const {
//       resortId,
//       roomCategoryId,
//       roomNumber,
//       floor,
//       building,
//       notes,
//     } = req.body;


//     // ==========================================
//     // VALIDATION
//     // ==========================================

//     if (!resortId || !roomCategoryId || !roomNumber) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "resortId, roomCategoryId and roomNumber are required.",
//       });
//     }


//     // ==========================================
//     // CHECK RESORT OWNERSHIP
//     // ==========================================

//     const resort = await Resort.findOne({
//       _id: resortId,
//       vendor: req.vendor._id,
//     });

//     if (!resort) {
//       return res.status(404).json({
//         success: false,
//         message: "Resort not found or access denied.",
//       });
//     }


//     // ==========================================
//     // CHECK ROOM CATEGORY
//     // Must belong to same resort
//     // ==========================================

//     const roomCategory = await ResortRoom.findOne({
//       _id: roomCategoryId,
//       resort: resortId,
//       vendor: req.vendor._id,
//     });

//     if (!roomCategory) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Room category not found or does not belong to this resort.",
//       });
//     }


//     // ==========================================
//     // CHECK DUPLICATE ROOM NUMBER
//     // ==========================================

//     const existingUnit = await ResortRoomUnit.findOne({
//       resort: resortId,
//       roomNumber: roomNumber.trim().toUpperCase(),
//     });

//     if (existingUnit) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "This room number already exists in this resort.",
//       });
//     }


//     // ==========================================
//     // CREATE ROOM UNIT
//     // ==========================================

//     const roomUnit = await ResortRoomUnit.create({
//       vendor: req.vendor._id,
//       resort: resortId,
//       roomCategory: roomCategoryId,

//       roomNumber: roomNumber.trim().toUpperCase(),

//       floor: floor || "",
//       building: building || "",
//       notes: notes || "",

//       status: "AVAILABLE",
//       isActive: true,
//     });


//     return res.status(201).json({
//       success: true,
//       message: "Room unit created successfully.",
//       roomUnit,
//     });

//   } catch (error) {
//     console.error("Create Room Unit Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================================
//                 GET ALL ROOM UNITS OF RESORT
// ========================================================== */

// exports.getRoomUnits = async (req, res) => {
//   try {
//     const { resortId } = req.params;


//     const resort = await Resort.findOne({
//       _id: resortId,
//       vendor: req.vendor._id,
//     });

//     if (!resort) {
//       return res.status(404).json({
//         success: false,
//         message: "Resort not found or access denied.",
//       });
//     }


//     const roomUnits = await ResortRoomUnit.find({
//       resort: resortId,
//       vendor: req.vendor._id,
//     })
//       .populate("roomCategory", "name basePrice maxAdults maxChildren")
//       .sort({
//         roomNumber: 1,
//       });


//     return res.status(200).json({
//       success: true,
//       total: roomUnits.length,
//       roomUnits,
//     });

//   } catch (error) {
//     console.error("Get Room Units Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================================
//                 GET ROOM UNITS BY CATEGORY
// ========================================================== */

// exports.getRoomUnitsByCategory = async (req, res) => {
//   try {
//     const { roomCategoryId } = req.params;


//     const roomUnits = await ResortRoomUnit.find({
//       roomCategory: roomCategoryId,
//       vendor: req.vendor._id,
//     }).sort({
//       roomNumber: 1,
//     });


//     return res.status(200).json({
//       success: true,
//       total: roomUnits.length,
//       roomUnits,
//     });

//   } catch (error) {
//     console.error("Get Room Units By Category Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================================
//                     UPDATE ROOM UNIT
// ========================================================== */

// exports.updateRoomUnit = async (req, res) => {
//   try {
//     const roomUnit = await ResortRoomUnit.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });

//     if (!roomUnit) {
//       return res.status(404).json({
//         success: false,
//         message: "Room unit not found or access denied.",
//       });
//     }


//     const allowedFields = [
//       "floor",
//       "building",
//       "status",
//       "isActive",
//       "notes",
//     ];


//     allowedFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         roomUnit[field] = req.body[field];
//       }
//     });


//     // Room number update separately
//     if (req.body.roomNumber !== undefined) {
//       roomUnit.roomNumber = req.body.roomNumber
//         .trim()
//         .toUpperCase();
//     }


//     await roomUnit.save();


//     return res.status(200).json({
//       success: true,
//       message: "Room unit updated successfully.",
//       roomUnit,
//     });

//   } catch (error) {
//     console.error("Update Room Unit Error:", error);

//     // Duplicate room number
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "This room number already exists in this resort.",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================================
//                     DELETE ROOM UNIT
// ========================================================== */

// exports.deleteRoomUnit = async (req, res) => {
//   try {
//     const roomUnit = await ResortRoomUnit.findOneAndDelete({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });


//     if (!roomUnit) {
//       return res.status(404).json({
//         success: false,
//         message: "Room unit not found or access denied.",
//       });
//     }


//     return res.status(200).json({
//       success: true,
//       message: "Room unit deleted successfully.",
//     });

//   } catch (error) {
//     console.error("Delete Room Unit Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


const mongoose = require("mongoose");

const Resort = require("../models/Resort.model");
const ResortRoom = require("../models/ResortRoom.model");
const ResortRoomUnit = require("../models/ResortRoomUnit.model");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getVendorId = (req) => req.vendor?._id;

/* ==========================================================
   CREATE ROOM UNIT
   POST /api/resort-room-units
========================================================== */

exports.createRoomUnit = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const {
      resortId,
      roomCategoryId,
      roomNumber,
      floor,
      building,
      notes,
    } = req.body;

    if (!resortId || !roomCategoryId || !roomNumber?.trim()) {
      return res.status(400).json({
        success: false,
        message: "resortId, roomCategoryId and roomNumber are required.",
      });
    }

    if (!isValidId(resortId) || !isValidId(roomCategoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resortId or roomCategoryId.",
      });
    }

    const normalizedRoomNumber = roomNumber.trim().toUpperCase();

    const resort = await Resort.findOne({
      _id: resortId,
      vendor: vendorId,
    });

    if (!resort) {
      return res.status(404).json({
        success: false,
        message: "Resort not found or access denied.",
      });
    }

    const roomCategory = await ResortRoom.findOne({
      _id: roomCategoryId,
      resort: resortId,
      vendor: vendorId,
    });

    if (!roomCategory) {
      return res.status(404).json({
        success: false,
        message: "Room category not found in this resort.",
      });
    }

    const existingUnit = await ResortRoomUnit.findOne({
      resort: resortId,
      roomNumber: normalizedRoomNumber,
    });

    if (existingUnit) {
      return res.status(409).json({
        success: false,
        message: "This room number already exists in this resort.",
      });
    }

    const roomUnit = await ResortRoomUnit.create({
      vendor: vendorId,
      resort: resortId,
      roomCategory: roomCategoryId,
      roomNumber: normalizedRoomNumber,
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

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This room number already exists in this resort.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create room unit.",
      error: error.message,
    });
  }
};

/* ==========================================================
   GET ALL ROOM UNITS OF A RESORT
   GET /api/resort-room-units/resort/:resortId
========================================================== */

exports.getRoomUnits = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    const { resortId } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    if (!isValidId(resortId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resortId.",
      });
    }

    const resort = await Resort.findOne({
      _id: resortId,
      vendor: vendorId,
    }).select("_id name resortName");

    if (!resort) {
      return res.status(404).json({
        success: false,
        message: "Resort not found or access denied.",
      });
    }

    const roomUnits = await ResortRoomUnit.find({
      resort: resortId,
      vendor: vendorId,
    })
      .populate("roomCategory", "name title basePrice maxAdults maxChildren")
      .sort({ roomNumber: 1 });

    return res.status(200).json({
      success: true,
      total: roomUnits.length,
      resort,
      roomUnits,
    });
  } catch (error) {
    console.error("Get Room Units Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch room units.",
      error: error.message,
    });
  }
};

/* ==========================================================
   GET ROOM UNITS BY CATEGORY
   GET /api/resort-room-units/category/:roomCategoryId
========================================================== */

exports.getRoomUnitsByCategory = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    const { roomCategoryId } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    if (!isValidId(roomCategoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid roomCategoryId.",
      });
    }

    const roomCategory = await ResortRoom.findOne({
      _id: roomCategoryId,
      vendor: vendorId,
    }).select("_id name title resort");

    if (!roomCategory) {
      return res.status(404).json({
        success: false,
        message: "Room category not found or access denied.",
      });
    }

    const roomUnits = await ResortRoomUnit.find({
      roomCategory: roomCategoryId,
      vendor: vendorId,
    })
      .populate("roomCategory", "name title basePrice maxAdults maxChildren")
      .sort({ roomNumber: 1 });

    return res.status(200).json({
      success: true,
      total: roomUnits.length,
      roomCategory,
      roomUnits,
    });
  } catch (error) {
    console.error("Get Room Units By Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch room units.",
      error: error.message,
    });
  }
};

/* ==========================================================
   UPDATE ROOM UNIT
   PUT /api/resort-room-units/:id
========================================================== */

exports.updateRoomUnit = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    const { id } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room unit ID.",
      });
    }

    const roomUnit = await ResortRoomUnit.findOne({
      _id: id,
      vendor: vendorId,
    });

    if (!roomUnit) {
      return res.status(404).json({
        success: false,
        message: "Room unit not found or access denied.",
      });
    }

    const { floor, building, status, isActive, notes, roomNumber } = req.body;

    const allowedStatuses = [
      "AVAILABLE",
      "OCCUPIED",
      "BLOCKED",
      "MAINTENANCE",
      "CLEANING",
      "INACTIVE",
    ];

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room status.",
        allowedStatuses,
      });
    }

    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    if (roomNumber !== undefined) {
      if (typeof roomNumber !== "string" || !roomNumber.trim()) {
        return res.status(400).json({
          success: false,
          message: "roomNumber cannot be empty.",
        });
      }

      const normalizedRoomNumber = roomNumber.trim().toUpperCase();

      const duplicate = await ResortRoomUnit.findOne({
        _id: { $ne: roomUnit._id },
        resort: roomUnit.resort,
        roomNumber: normalizedRoomNumber,
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "This room number already exists in this resort.",
        });
      }

      roomUnit.roomNumber = normalizedRoomNumber;
    }

    if (floor !== undefined) roomUnit.floor = floor;
    if (building !== undefined) roomUnit.building = building;
    if (status !== undefined) roomUnit.status = status;
    if (isActive !== undefined) roomUnit.isActive = isActive;
    if (notes !== undefined) roomUnit.notes = notes;

    await roomUnit.save();

    return res.status(200).json({
      success: true,
      message: "Room unit updated successfully.",
      roomUnit,
    });
  } catch (error) {
    console.error("Update Room Unit Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This room number already exists in this resort.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update room unit.",
      error: error.message,
    });
  }
};

/* ==========================================================
   DELETE ROOM UNIT
   DELETE /api/resort-room-units/:id
========================================================== */

exports.deleteRoomUnit = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    const { id } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room unit ID.",
      });
    }

    const roomUnit = await ResortRoomUnit.findOneAndDelete({
      _id: id,
      vendor: vendorId,
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
      deletedRoomUnitId: roomUnit._id,
    });
  } catch (error) {
    console.error("Delete Room Unit Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete room unit.",
      error: error.message,
    });
  }
};
