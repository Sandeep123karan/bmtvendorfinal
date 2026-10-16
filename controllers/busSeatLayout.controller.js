// const Bus = require("../models/Bus.model");
// const BusSeatLayout = require("../models/BusSeatLayout.model");

// /* =========================================================
//    CREATE / UPDATE BUS SEAT LAYOUT
// ========================================================= */

// exports.saveSeatLayout = async (req, res) => {
//   try {
//     const {
//       busId,
//       layoutType,
//       totalRows,
//       totalColumns,
//       hasUpperDeck,
//       lowerDeckSeats,
//       upperDeckSeats,
//     } = req.body;

//     // Check bus belongs to logged-in vendor
//     const bus = await Bus.findOne({
//       _id: busId,
//       vendor: req.vendor._id,
//     });

//     if (!bus) {
//       return res.status(404).json({
//         success: false,
//         message: "Bus not found or you do not have permission",
//       });
//     }

//     // Parse seats if coming from FormData
//     let parsedLowerSeats = lowerDeckSeats || [];
//     let parsedUpperSeats = upperDeckSeats || [];

//     if (typeof parsedLowerSeats === "string") {
//       try {
//         parsedLowerSeats = JSON.parse(parsedLowerSeats);
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid lowerDeckSeats format",
//         });
//       }
//     }

//     if (typeof parsedUpperSeats === "string") {
//       try {
//         parsedUpperSeats = JSON.parse(parsedUpperSeats);
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid upperDeckSeats format",
//         });
//       }
//     }

//     const totalSeats =
//       parsedLowerSeats.length + parsedUpperSeats.length;

//     if (
//       bus.totalSeats &&
//       totalSeats > Number(bus.totalSeats)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: `Layout has ${totalSeats} seats but bus maximum is ${bus.totalSeats}`,
//       });
//     }

//     const layout = await BusSeatLayout.findOneAndUpdate(
//       {
//         bus: busId,
//         vendor: req.vendor._id,
//       },
//       {
//         bus: busId,
//         vendor: req.vendor._id,

//         layoutType:
//           layoutType || "2X2_SEATER",

//         totalRows:
//           Number(totalRows) || 0,

//         totalColumns:
//           Number(totalColumns) || 0,

//         hasUpperDeck:
//           hasUpperDeck === true ||
//           hasUpperDeck === "true",

//         lowerDeckSeats: parsedLowerSeats,
//         upperDeckSeats: parsedUpperSeats,
//       },
//       {
//         new: true,
//         upsert: true,
//         runValidators: true,
//       }
//     );

//     // Sync seat count with Bus
//     bus.availableSeats = totalSeats;
//     await bus.save();

//     return res.status(200).json({
//       success: true,
//       message: "Bus seat layout saved successfully",
//       data: layout,
//     });
//   } catch (error) {
//     console.error("saveSeatLayout error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* =========================================================
//    GET SEAT LAYOUT BY BUS
// ========================================================= */

// exports.getSeatLayoutByBus = async (req, res) => {
//   try {
//     const layout = await BusSeatLayout.findOne({
//       bus: req.params.busId,
//       vendor: req.vendor._id,
//     });

//     if (!layout) {
//       return res.status(404).json({
//         success: false,
//         message: "Seat layout not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: layout,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* =========================================================
//    GET PUBLIC SEAT LAYOUT
// ========================================================= */

// exports.getPublicSeatLayout = async (req, res) => {
//   try {
//     const layout = await BusSeatLayout.findOne({
//       bus: req.params.busId,
//       isActive: true,
//     }).populate(
//       "bus",
//       "busName busNumber totalSeats status isActive"
//     );

//     if (!layout) {
//       return res.status(404).json({
//         success: false,
//         message: "Seat layout not found",
//       });
//     }

//     if (
//       layout.bus.status !== "approved" ||
//       !layout.bus.isActive
//     ) {
//       return res.status(404).json({
//         success: false,
//         message: "Bus is not available",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: layout,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* =========================================================
//    BLOCK / UNBLOCK SINGLE SEAT
// ========================================================= */

// exports.toggleSeatStatus = async (req, res) => {
//   try {
//     const {
//       busId,
//       seatId,
//       deck,
//       status,
//     } = req.body;

//     if (!["LOWER", "UPPER"].includes(deck)) {
//       return res.status(400).json({
//         success: false,
//         message: "deck must be LOWER or UPPER",
//       });
//     }

//     if (
//       !["AVAILABLE", "BLOCKED", "MAINTENANCE"]
//         .includes(status)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid status. Use AVAILABLE, BLOCKED or MAINTENANCE",
//       });
//     }

//     const layout = await BusSeatLayout.findOne({
//       bus: busId,
//       vendor: req.vendor._id,
//     });

//     if (!layout) {
//       return res.status(404).json({
//         success: false,
//         message: "Seat layout not found",
//       });
//     }

//     const seats =
//       deck === "LOWER"
//         ? layout.lowerDeckSeats
//         : layout.upperDeckSeats;

//     const seat = seats.id(seatId);

//     if (!seat) {
//       return res.status(404).json({
//         success: false,
//         message: "Seat not found",
//       });
//     }

//     seat.status = status;

//     await layout.save();

//     return res.status(200).json({
//       success: true,
//       message: `Seat status changed to ${status}`,
//       data: layout,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


const mongoose = require("mongoose");
const Bus = require("../models/Bus.model");
const BusType = require("../models/BusType.model");

/* =========================================================
   HELPERS
========================================================= */

const getVendorId = (req) =>
  req.vendor?._id || req.vendor?.id || req.user?.vendorId;

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const parseArray = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      throw new Error(`${fieldName} must be valid JSON`);
    }
  }

  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }

  return value;
};

const getSeatCount = (grid = []) =>
  grid.filter(
    (cell) =>
      cell.isSeat === true ||
      cell.cellType === "SEAT"
  ).length;


/* =========================================================
   CREATE / UPDATE BUS SEAT LAYOUT
   POST /api/bus-seat-layouts
========================================================= */

exports.saveSeatLayout = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    const {
      busId,
      bus,
      name,
      vehicleMake,
      otherInfo,
      seatingType,
      isAc,
      layoutType,
      totalRows,
      totalColumns,
      gridRows,
      gridCols,
      hasUpperDeck,
    } = req.body;

    const targetBusId = busId || bus;

    if (!targetBusId || !isValidObjectId(targetBusId)) {
      return res.status(400).json({
        success: false,
        message: "Valid busId is required",
      });
    }

    // Confirm that this bus belongs to the logged-in vendor.
    const busDoc = await Bus.findOne({
      _id: targetBusId,
      vendor: vendorId,
    });

    if (!busDoc) {
      return res.status(404).json({
        success: false,
        message: "Bus not found or you do not have permission",
      });
    }

    // Support both the current BusType grid payload
    // and the older lowerDeckSeats/upperDeckSeats payload.
    let lowerGrid = parseArray(
      req.body.lowerDeckGrid ?? req.body.lowerDeckSeats,
      "lowerDeckGrid"
    );

    let upperGrid = parseArray(
      req.body.upperDeckGrid ?? req.body.upperDeckSeats,
      "upperDeckGrid"
    );

    // Convert old seat arrays to grid cells when needed.
    const normalizeGrid = (items) =>
      items.map((item, index) => ({
        row: Number(item.row ?? 0),
        col: Number(item.col ?? index),
        isSeat:
          item.isSeat !== undefined
            ? Boolean(item.isSeat)
            : true,
        cellType: item.cellType || "SEAT",
        seatNumber: item.seatNumber || "",
        seatType: item.seatType || "SEATER",
        berthType: item.berthType || "",
        category: item.category || "REGULAR",
        price: Number(item.price || 0),
      }));

    lowerGrid = normalizeGrid(lowerGrid);
    upperGrid = normalizeGrid(upperGrid);

    const upperDeckEnabled =
      hasUpperDeck === true ||
      hasUpperDeck === "true";

    if (!upperDeckEnabled) {
      upperGrid = [];
    }

    const totalSeats =
      getSeatCount(lowerGrid) + getSeatCount(upperGrid);

    if (busDoc.totalSeats && totalSeats > Number(busDoc.totalSeats)) {
      return res.status(400).json({
        success: false,
        message: `Layout has ${totalSeats} seats but bus maximum is ${busDoc.totalSeats}`,
      });
    }

    const updateData = {
      vendor: vendorId,
      bus: targetBusId,
      name: name || layoutType || "Bus Seat Layout",
      vehicleMake: vehicleMake || "",
      otherInfo: otherInfo || "",
      seatingType: seatingType || layoutType || "2+2",
      isAc:
        isAc === true ||
        isAc === "true",
      hasUpperDeck: upperDeckEnabled,
      gridRows: Number(gridRows ?? totalRows ?? 0),
      gridCols: Number(gridCols ?? totalColumns ?? 0),
      lowerDeckGrid: lowerGrid,
      upperDeckGrid: upperGrid,
      totalSeats,
      lowerSeatsCount: getSeatCount(lowerGrid),
      upperSeatsCount: getSeatCount(upperGrid),
      displayName:
        req.body.displayName ||
        `${vehicleMake || ""} ${name || layoutType || "Bus Seat Layout"}`.trim(),
    };

    const layout = await BusType.findOneAndUpdate(
      {
        bus: targetBusId,
        vendor: vendorId,
      },
      { $set: updateData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Bus seat layout saved successfully",
      data: layout,
      layout,
    });
  } catch (error) {
    console.error("saveSeatLayout error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   GET VENDOR SEAT LAYOUT BY BUS
   GET /api/bus-seat-layouts/bus/:busId
========================================================= */

exports.getSeatLayoutByBus = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    const { busId } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    if (!isValidObjectId(busId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid busId",
      });
    }

    const layout = await BusType.findOne({
      bus: busId,
      vendor: vendorId,
    });

    if (!layout) {
      return res.status(404).json({
        success: false,
        message: "Seat layout not found for this bus",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Seat layout fetched successfully",
      data: layout,
      layout,
    });
  } catch (error) {
    console.error("getSeatLayoutByBus error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   GET PUBLIC SEAT LAYOUT
   GET /api/bus-seat-layouts/public/:busId
========================================================= */

exports.getPublicSeatLayout = async (req, res) => {
  try {
    const { busId } = req.params;

    if (!isValidObjectId(busId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid busId",
      });
    }

    const layout = await BusType.findOne({
      bus: busId,
      isActive: true,
    }).populate(
      "bus",
      "busName busNumber totalSeats status isActive"
    );

    if (!layout) {
      return res.status(404).json({
        success: false,
        message: "Seat layout not found",
      });
    }

    if (!layout.bus) {
      return res.status(404).json({
        success: false,
        message: "Associated bus not found",
      });
    }

    // Adjust these values if your Bus model uses
    // different approval status names.
    if (
      layout.bus.status !== "approved" ||
      layout.bus.isActive !== true
    ) {
      return res.status(404).json({
        success: false,
        message: "Bus is not available",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Public seat layout fetched successfully",
      data: layout,
      layout,
    });
  } catch (error) {
    console.error("getPublicSeatLayout error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   BLOCK / UNBLOCK SINGLE SEAT
   PATCH /api/bus-seat-layouts/seat-status
========================================================= */

exports.toggleSeatStatus = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    const { busId, seatId, deck, status } = req.body;

    if (!busId || !isValidObjectId(busId)) {
      return res.status(400).json({
        success: false,
        message: "Valid busId is required",
      });
    }

    if (!["LOWER", "UPPER"].includes(deck)) {
      return res.status(400).json({
        success: false,
        message: "deck must be LOWER or UPPER",
      });
    }

    if (!["AVAILABLE", "BLOCKED", "MAINTENANCE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use AVAILABLE, BLOCKED or MAINTENANCE",
      });
    }

    if (!seatId) {
      return res.status(400).json({
        success: false,
        message: "seatId is required",
      });
    }

    const layout = await BusType.findOne({
      bus: busId,
      vendor: vendorId,
    });

    if (!layout) {
      return res.status(404).json({
        success: false,
        message: "Seat layout not found",
      });
    }

    const gridField =
      deck === "LOWER" ? "lowerDeckGrid" : "upperDeckGrid";

    const grid = layout[gridField];

    // The current BusType schema uses seatNumber, not a
    // Mongoose subdocument seat ID. Accept either identifier.
    const seat = grid.find(
      (item) =>
        String(item._id) === String(seatId) ||
        String(item.seatNumber) === String(seatId)
    );

    if (!seat || !seat.isSeat) {
      return res.status(404).json({
        success: false,
        message: "Seat not found",
      });
    }

    // This requires the BusType cell schema to define a
    // `status` field. If it doesn't, add that field first.
    seat.status = status;

    await layout.save();

    return res.status(200).json({
      success: true,
      message: `Seat status changed to ${status}`,
      data: layout,
    });
  } catch (error) {
    console.error("toggleSeatStatus error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
