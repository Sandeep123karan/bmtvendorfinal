// const BusType = require("../models/BusType.model");

// /* =========================================================
//    CREATE BUS TYPE
// ========================================================= */
// exports.createBusType = async (req, res) => {
//   try {
//     const {
//       name,
//       vehicleMake,
//       otherInfo,
//       seatingType,
//       isAc,
//       hasUpperDeck,
//       gridRows,
//       gridCols,
//       lowerDeckGrid,
//       upperDeckGrid,
//     } = req.body;

//     if (!name) {
//       return res.status(400).json({
//         success: false,
//         message: "Bus type name is required",
//       });
//     }

//     const lowerSeats = (lowerDeckGrid || []).filter(
//       (c) => c.isSeat && c.seatNumber
//     );
//     const upperSeats = (upperDeckGrid || []).filter(
//       (c) => c.isSeat && c.seatNumber
//     );
//     const totalSeats = lowerSeats.length + upperSeats.length;

//     const dynamicName = `${vehicleMake || "Bus"} ${name} ${
//       otherInfo || ""
//     } ${isAc ? "AC" : "Non-AC"}`.trim();

//     const busType = await BusType.create({
//       vendor: req.vendor._id,
//       name,
//       vehicleMake: vehicleMake || "Leyland",
//       otherInfo: otherInfo || "Air Suspension",
//       seatingType: seatingType || "2+1",
//       isAc: isAc !== undefined ? Boolean(isAc) : true,
//       displayName: dynamicName,
//       hasUpperDeck: Boolean(hasUpperDeck),
//       gridRows: Number(gridRows) || 5,
//       gridCols: Number(gridCols) || 15,
//       totalSeats,
//       lowerSeatsCount: lowerSeats.length,
//       upperSeatsCount: upperSeats.length,
//       lowerDeckGrid: lowerDeckGrid || [],
//       upperDeckGrid: upperDeckGrid || [],
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Bus type created successfully",
//       busType,
//     });
//   } catch (error) {
//     console.error("createBusType error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* =========================================================
//    GET ALL BUS TYPES OF LOGGED-IN VENDOR
// ========================================================= */
// exports.getVendorBusTypes = async (req, res) => {
//   try {
//     const busTypes = await BusType.find({ vendor: req.vendor._id }).sort({
//       createdAt: -1,
//     });

//     return res.status(200).json({
//       success: true,
//       count: busTypes.length,
//       busTypes,
//     });
//   } catch (error) {
//     console.error("getVendorBusTypes error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* =========================================================
//    GET SINGLE BUS TYPE BY ID
// ========================================================= */
// exports.getBusTypeById = async (req, res) => {
//   try {
//     const busType = await BusType.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });

//     if (!busType) {
//       return res.status(404).json({
//         success: false,
//         message: "Bus type not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       busType,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* =========================================================
//    UPDATE BUS TYPE
// ========================================================= */
// exports.updateBusType = async (req, res) => {
//   try {
//     const busType = await BusType.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });

//     if (!busType) {
//       return res.status(404).json({
//         success: false,
//         message: "Bus type not found",
//       });
//     }

//     const {
//       name,
//       vehicleMake,
//       otherInfo,
//       seatingType,
//       isAc,
//       hasUpperDeck,
//       gridRows,
//       gridCols,
//       lowerDeckGrid,
//       upperDeckGrid,
//       isActive,
//     } = req.body;

//     if (name !== undefined) busType.name = name;
//     if (vehicleMake !== undefined) busType.vehicleMake = vehicleMake;
//     if (otherInfo !== undefined) busType.otherInfo = otherInfo;
//     if (seatingType !== undefined) busType.seatingType = seatingType;
//     if (isAc !== undefined) busType.isAc = Boolean(isAc);
//     if (hasUpperDeck !== undefined) busType.hasUpperDeck = Boolean(hasUpperDeck);
//     if (gridRows !== undefined) busType.gridRows = Number(gridRows);
//     if (gridCols !== undefined) busType.gridCols = Number(gridCols);
//     if (isActive !== undefined) busType.isActive = Boolean(isActive);

//     if (lowerDeckGrid !== undefined) busType.lowerDeckGrid = lowerDeckGrid;
//     if (upperDeckGrid !== undefined) busType.upperDeckGrid = upperDeckGrid;

//     const lowerSeats = (busType.lowerDeckGrid || []).filter(
//       (c) => c.isSeat && c.seatNumber
//     );
//     const upperSeats = (busType.upperDeckGrid || []).filter(
//       (c) => c.isSeat && c.seatNumber
//     );
//     busType.lowerSeatsCount = lowerSeats.length;
//     busType.upperSeatsCount = upperSeats.length;
//     busType.totalSeats = lowerSeats.length + upperSeats.length;

//     busType.displayName = `${busType.vehicleMake} ${busType.name} ${
//       busType.otherInfo
//     } ${busType.isAc ? "AC" : "Non-AC"}`.trim();

//     await busType.save();

//     return res.status(200).json({
//       success: true,
//       message: "Bus type updated successfully",
//       busType,
//     });
//   } catch (error) {
//     console.error("updateBusType error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* =========================================================
//    DELETE BUS TYPE
// ========================================================= */
// exports.deleteBusType = async (req, res) => {
//   try {
//     const busType = await BusType.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });

//     if (!busType) {
//       return res.status(404).json({
//         success: false,
//         message: "Bus type not found",
//       });
//     }

//     await busType.deleteOne();

//     return res.status(200).json({
//       success: true,
//       message: "Bus type deleted successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
const mongoose = require("mongoose");
const BusType = require("../models/BusType.model");
const Bus = require("../models/Bus.model");

/* =========================================================
   CONSTANTS + HELPERS
========================================================= */
const SEAT_TYPES = ["SEATER", "SLEEPER", "SEMI_SLEEPER"];
const SPECIAL_TYPES = ["DRIVER", "CONDUCTOR", "ENTRANCE", "EXIT"];
const CATEGORIES = ["REGULAR", "LADIES", "SENIOR", "VIP", "CREW"];

const MAX_ROWS = 50;
const MAX_COLS = 20;

const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

const handleError = (res, error, label) => {
  console.error(`${label} error:`, error);

  if (error.code === 11000) {
    return sendError(res, 409, "This bus already has a bus type / layout");
  }
  if (error.name === "ValidationError") {
    return sendError(res, 400, error.message);
  }
  if (error.name === "CastError") {
    return sendError(res, 400, "Invalid id");
  }
  return sendError(res, 500, error.message);
};

const toBool = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "string") return value === "true" || value === "1";
  return Boolean(value);
};

const clampInt = (value, min, max, fallback) => {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const buildDisplayName = ({ vehicleMake, name, otherInfo, isAc }) =>
  `${vehicleMake || "Bus"} ${name || ""} ${otherInfo || ""} ${
    isAc ? "AC" : "Non-AC"
  }`
    .replace(/\s+/g, " ")
    .trim();

// Accepts an array OR a JSON string. Returns null when it cannot be parsed.
const parseGrid = (value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : null;
    } catch (_) {
      return null;
    }
  }
  return null;
};

const sanitizeGrid = (grid, rows, cols, deckLabel) => {
  const byPosition = new Map();

  for (const raw of grid) {
    if (!raw || typeof raw !== "object") continue;

    const row = Number(raw.row);
    const col = Number(raw.col);

    if (
      !Number.isInteger(row) ||
      !Number.isInteger(col) ||
      row < 0 ||
      col < 0 ||
      row >= rows ||
      col >= cols
    ) {
      continue;
    }

    const isSeat = toBool(raw.isSeat, false);

    if (isSeat) {
      const seatNumber = String(raw.seatNumber ?? "").trim();
      if (!seatNumber) {
        return {
          error: `Every seat on the ${deckLabel} deck needs a seat number (row ${
            row + 1
          }, position ${col + 1})`,
        };
      }

      const price = Number(raw.price);

      byPosition.set(`${row}-${col}`, {
        row,
        col,
        isSeat: true,
        cellType: "SEAT",
        seatNumber,
        seatType: SEAT_TYPES.includes(raw.seatType) ? raw.seatType : "SEATER",
        berthType: "",
        category: CATEGORIES.includes(raw.category) ? raw.category : "REGULAR",
        price: Number.isFinite(price) && price > 0 ? price : 0,
      });
    } else if (SPECIAL_TYPES.includes(raw.cellType)) {
      byPosition.set(`${row}-${col}`, {
        row,
        col,
        isSeat: false,
        cellType: raw.cellType,
        seatNumber: "",
        seatType: "EMPTY",
        berthType: "",
        category: "",
        price: 0,
      });
    }
  }

  const cells = [...byPosition.values()].sort(
    (a, b) => a.row - b.row || a.col - b.col
  );
  return { cells };
};

const prepareLayout = ({
  rows,
  cols,
  hasUpperDeck,
  lowerDeckGrid,
  upperDeckGrid,
}) => {
  const lowerParsed = parseGrid(lowerDeckGrid);
  const upperParsed = parseGrid(upperDeckGrid);

  if (lowerParsed === null) return { error: "Invalid lowerDeckGrid format" };
  if (upperParsed === null) return { error: "Invalid upperDeckGrid format" };

  const lowerResult = sanitizeGrid(lowerParsed, rows, cols, "lower");
  if (lowerResult.error) return { error: lowerResult.error };

  let upper = [];
  if (hasUpperDeck) {
    const upperResult = sanitizeGrid(upperParsed, rows, cols, "upper");
    if (upperResult.error) return { error: upperResult.error };
    upper = upperResult.cells;
  }

  const lower = lowerResult.cells;
  const lowerSeats = lower.filter((c) => c.isSeat);
  const upperSeats = upper.filter((c) => c.isSeat);

  const seen = new Set();
  for (const seat of [...lowerSeats, ...upperSeats]) {
    if (seen.has(seat.seatNumber)) {
      return { error: `Duplicate seat number "${seat.seatNumber}"` };
    }
    seen.add(seat.seatNumber);
  }

  return {
    lower,
    upper,
    lowerCount: lowerSeats.length,
    upperCount: upperSeats.length,
    totalSeats: lowerSeats.length + upperSeats.length,
  };
};

/* =========================================================
   CREATE BUS TYPE  (for one specific bus)
   body.bus = Bus _id (required)
========================================================= */
exports.createBusType = async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.name || "").trim();

    if (!name) return sendError(res, 400, "Bus type name is required");

    if (!body.bus || !mongoose.isValidObjectId(body.bus)) {
      return sendError(res, 400, "Please select the bus for this bus type");
    }

    // the bus must belong to the logged-in vendor
    const bus = await Bus.findOne({ _id: body.bus, vendor: req.vendor._id });
    if (!bus) return sendError(res, 404, "Bus not found");

    // one bus = one layout
    if (await BusType.findOne({ bus: bus._id })) {
      return sendError(
        res,
        409,
        `Bus ${bus.busNumber} already has a bus type. Edit it instead.`
      );
    }

    const rows = clampInt(body.gridRows, 1, MAX_ROWS, 12);
    const cols = clampInt(body.gridCols, 1, MAX_COLS, 4);
    const hasUpperDeck = toBool(body.hasUpperDeck, false);
    const isAc = toBool(body.isAc, true);

    const layout = prepareLayout({
      rows,
      cols,
      hasUpperDeck,
      lowerDeckGrid: body.lowerDeckGrid,
      upperDeckGrid: body.upperDeckGrid,
    });

    if (layout.error) return sendError(res, 400, layout.error);
    if (layout.totalSeats === 0) {
      return sendError(res, 400, "Add at least one passenger seat");
    }

    const vehicleMake = body.vehicleMake || "Leyland";
    const otherInfo = body.otherInfo || "Air Suspension";

    const busType = await BusType.create({
      vendor: req.vendor._id,
      bus: bus._id,
      name,
      vehicleMake,
      otherInfo,
      seatingType: body.seatingType || "2+1",
      isAc,
      displayName: buildDisplayName({ vehicleMake, name, otherInfo, isAc }),
      hasUpperDeck,
      gridRows: rows,
      gridCols: cols,
      totalSeats: layout.totalSeats,
      lowerSeatsCount: layout.lowerCount,
      upperSeatsCount: layout.upperCount,
      lowerDeckGrid: layout.lower,
      upperDeckGrid: layout.upper,
    });

    return res.status(201).json({
      success: true,
      message: "Bus type created successfully",
      busType,
    });
  } catch (error) {
    return handleError(res, error, "createBusType");
  }
};

/* =========================================================
   GET ALL BUS TYPES OF LOGGED-IN VENDOR
========================================================= */
exports.getVendorBusTypes = async (req, res) => {
  try {
    const busTypes = await BusType.find({ vendor: req.vendor._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: busTypes.length,
      busTypes,
    });
  } catch (error) {
    return handleError(res, error, "getVendorBusTypes");
  }
};

/* =========================================================
   GET BUS TYPE OF ONE BUS   (GET /bus-types/bus/:busId)
========================================================= */
exports.getBusTypeByBus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.busId)) {
      return sendError(res, 404, "Bus type not found");
    }

    const busType = await BusType.findOne({
      bus: req.params.busId,
      vendor: req.vendor._id,
    });

    if (!busType) return sendError(res, 404, "No bus type for this bus yet");

    return res.status(200).json({ success: true, busType });
  } catch (error) {
    return handleError(res, error, "getBusTypeByBus");
  }
};

/* =========================================================
   GET SINGLE BUS TYPE BY ID
========================================================= */
exports.getBusTypeById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 404, "Bus type not found");
    }

    const busType = await BusType.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!busType) return sendError(res, 404, "Bus type not found");

    return res.status(200).json({ success: true, busType });
  } catch (error) {
    return handleError(res, error, "getBusTypeById");
  }
};

/* =========================================================
   UPDATE BUS TYPE  (the linked bus can NOT be changed)
========================================================= */
exports.updateBusType = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 404, "Bus type not found");
    }

    const busType = await BusType.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!busType) return sendError(res, 404, "Bus type not found");

    const body = req.body || {};
    const current = busType.toObject();

    let name = current.name;
    if (body.name !== undefined) {
      name = String(body.name).trim();
      if (!name) return sendError(res, 400, "Bus type name is required");
    }

    const vehicleMake =
      body.vehicleMake !== undefined ? body.vehicleMake : current.vehicleMake;
    const otherInfo =
      body.otherInfo !== undefined ? body.otherInfo : current.otherInfo;
    const seatingType =
      body.seatingType !== undefined ? body.seatingType : current.seatingType;
    const isAc = toBool(body.isAc, current.isAc);
    const hasUpperDeck = toBool(body.hasUpperDeck, current.hasUpperDeck);
    const isActive = toBool(body.isActive, current.isActive);

    const rows = clampInt(body.gridRows, 1, MAX_ROWS, current.gridRows);
    const cols = clampInt(body.gridCols, 1, MAX_COLS, current.gridCols);

    const layout = prepareLayout({
      rows,
      cols,
      hasUpperDeck,
      lowerDeckGrid:
        body.lowerDeckGrid !== undefined
          ? body.lowerDeckGrid
          : current.lowerDeckGrid,
      upperDeckGrid:
        body.upperDeckGrid !== undefined
          ? body.upperDeckGrid
          : current.upperDeckGrid,
    });

    if (layout.error) return sendError(res, 400, layout.error);
    if (layout.totalSeats === 0) {
      return sendError(res, 400, "Add at least one passenger seat");
    }

    busType.name = name;
    busType.vehicleMake = vehicleMake;
    busType.otherInfo = otherInfo;
    busType.seatingType = seatingType;
    busType.isAc = isAc;
    busType.isActive = isActive;
    busType.hasUpperDeck = hasUpperDeck;
    busType.gridRows = rows;
    busType.gridCols = cols;
    busType.lowerDeckGrid = layout.lower;
    busType.upperDeckGrid = layout.upper;
    busType.lowerSeatsCount = layout.lowerCount;
    busType.upperSeatsCount = layout.upperCount;
    busType.totalSeats = layout.totalSeats;
    busType.displayName = buildDisplayName({
      vehicleMake,
      name,
      otherInfo,
      isAc,
    });

    await busType.save();

    return res.status(200).json({
      success: true,
      message: "Bus type updated successfully",
      busType,
    });
  } catch (error) {
    return handleError(res, error, "updateBusType");
  }
};

/* =========================================================
   DELETE BUS TYPE
========================================================= */
exports.deleteBusType = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 404, "Bus type not found");
    }

    const busType = await BusType.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!busType) return sendError(res, 404, "Bus type not found");

    await busType.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Bus type deleted successfully",
    });
  } catch (error) {
    return handleError(res, error, "deleteBusType");
  }
};