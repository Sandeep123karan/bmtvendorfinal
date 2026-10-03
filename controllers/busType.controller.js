const BusType = require("../models/BusType.model");

/* =========================================================
   CREATE BUS TYPE
========================================================= */
exports.createBusType = async (req, res) => {
  try {
    const {
      name,
      vehicleMake,
      otherInfo,
      seatingType,
      isAc,
      hasUpperDeck,
      gridRows,
      gridCols,
      lowerDeckGrid,
      upperDeckGrid,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Bus type name is required",
      });
    }

    const lowerSeats = (lowerDeckGrid || []).filter(
      (c) => c.isSeat && c.seatNumber
    );
    const upperSeats = (upperDeckGrid || []).filter(
      (c) => c.isSeat && c.seatNumber
    );
    const totalSeats = lowerSeats.length + upperSeats.length;

    const dynamicName = `${vehicleMake || "Bus"} ${name} ${
      otherInfo || ""
    } ${isAc ? "AC" : "Non-AC"}`.trim();

    const busType = await BusType.create({
      vendor: req.vendor._id,
      name,
      vehicleMake: vehicleMake || "Leyland",
      otherInfo: otherInfo || "Air Suspension",
      seatingType: seatingType || "2+1",
      isAc: isAc !== undefined ? Boolean(isAc) : true,
      displayName: dynamicName,
      hasUpperDeck: Boolean(hasUpperDeck),
      gridRows: Number(gridRows) || 5,
      gridCols: Number(gridCols) || 15,
      totalSeats,
      lowerSeatsCount: lowerSeats.length,
      upperSeatsCount: upperSeats.length,
      lowerDeckGrid: lowerDeckGrid || [],
      upperDeckGrid: upperDeckGrid || [],
    });

    return res.status(201).json({
      success: true,
      message: "Bus type created successfully",
      busType,
    });
  } catch (error) {
    console.error("createBusType error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
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
    console.error("getVendorBusTypes error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   GET SINGLE BUS TYPE BY ID
========================================================= */
exports.getBusTypeById = async (req, res) => {
  try {
    const busType = await BusType.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!busType) {
      return res.status(404).json({
        success: false,
        message: "Bus type not found",
      });
    }

    return res.status(200).json({
      success: true,
      busType,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   UPDATE BUS TYPE
========================================================= */
exports.updateBusType = async (req, res) => {
  try {
    const busType = await BusType.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!busType) {
      return res.status(404).json({
        success: false,
        message: "Bus type not found",
      });
    }

    const {
      name,
      vehicleMake,
      otherInfo,
      seatingType,
      isAc,
      hasUpperDeck,
      gridRows,
      gridCols,
      lowerDeckGrid,
      upperDeckGrid,
      isActive,
    } = req.body;

    if (name !== undefined) busType.name = name;
    if (vehicleMake !== undefined) busType.vehicleMake = vehicleMake;
    if (otherInfo !== undefined) busType.otherInfo = otherInfo;
    if (seatingType !== undefined) busType.seatingType = seatingType;
    if (isAc !== undefined) busType.isAc = Boolean(isAc);
    if (hasUpperDeck !== undefined) busType.hasUpperDeck = Boolean(hasUpperDeck);
    if (gridRows !== undefined) busType.gridRows = Number(gridRows);
    if (gridCols !== undefined) busType.gridCols = Number(gridCols);
    if (isActive !== undefined) busType.isActive = Boolean(isActive);

    if (lowerDeckGrid !== undefined) busType.lowerDeckGrid = lowerDeckGrid;
    if (upperDeckGrid !== undefined) busType.upperDeckGrid = upperDeckGrid;

    const lowerSeats = (busType.lowerDeckGrid || []).filter(
      (c) => c.isSeat && c.seatNumber
    );
    const upperSeats = (busType.upperDeckGrid || []).filter(
      (c) => c.isSeat && c.seatNumber
    );
    busType.lowerSeatsCount = lowerSeats.length;
    busType.upperSeatsCount = upperSeats.length;
    busType.totalSeats = lowerSeats.length + upperSeats.length;

    busType.displayName = `${busType.vehicleMake} ${busType.name} ${
      busType.otherInfo
    } ${busType.isAc ? "AC" : "Non-AC"}`.trim();

    await busType.save();

    return res.status(200).json({
      success: true,
      message: "Bus type updated successfully",
      busType,
    });
  } catch (error) {
    console.error("updateBusType error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   DELETE BUS TYPE
========================================================= */
exports.deleteBusType = async (req, res) => {
  try {
    const busType = await BusType.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!busType) {
      return res.status(404).json({
        success: false,
        message: "Bus type not found",
      });
    }

    await busType.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Bus type deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
