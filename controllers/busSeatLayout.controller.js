const Bus = require("../models/Bus.model");
const BusSeatLayout = require("../models/BusSeatLayout.model");

/* =========================================================
   CREATE / UPDATE BUS SEAT LAYOUT
========================================================= */

exports.saveSeatLayout = async (req, res) => {
  try {
    const {
      busId,
      layoutType,
      totalRows,
      totalColumns,
      hasUpperDeck,
      lowerDeckSeats,
      upperDeckSeats,
    } = req.body;

    // Check bus belongs to logged-in vendor
    const bus = await Bus.findOne({
      _id: busId,
      vendor: req.vendor._id,
    });

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found or you do not have permission",
      });
    }

    // Parse seats if coming from FormData
    let parsedLowerSeats = lowerDeckSeats || [];
    let parsedUpperSeats = upperDeckSeats || [];

    if (typeof parsedLowerSeats === "string") {
      try {
        parsedLowerSeats = JSON.parse(parsedLowerSeats);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid lowerDeckSeats format",
        });
      }
    }

    if (typeof parsedUpperSeats === "string") {
      try {
        parsedUpperSeats = JSON.parse(parsedUpperSeats);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid upperDeckSeats format",
        });
      }
    }

    const totalSeats =
      parsedLowerSeats.length + parsedUpperSeats.length;

    if (
      bus.totalSeats &&
      totalSeats > Number(bus.totalSeats)
    ) {
      return res.status(400).json({
        success: false,
        message: `Layout has ${totalSeats} seats but bus maximum is ${bus.totalSeats}`,
      });
    }

    const layout = await BusSeatLayout.findOneAndUpdate(
      {
        bus: busId,
        vendor: req.vendor._id,
      },
      {
        bus: busId,
        vendor: req.vendor._id,

        layoutType:
          layoutType || "2X2_SEATER",

        totalRows:
          Number(totalRows) || 0,

        totalColumns:
          Number(totalColumns) || 0,

        hasUpperDeck:
          hasUpperDeck === true ||
          hasUpperDeck === "true",

        lowerDeckSeats: parsedLowerSeats,
        upperDeckSeats: parsedUpperSeats,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    // Sync seat count with Bus
    bus.availableSeats = totalSeats;
    await bus.save();

    return res.status(200).json({
      success: true,
      message: "Bus seat layout saved successfully",
      data: layout,
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
   GET SEAT LAYOUT BY BUS
========================================================= */

exports.getSeatLayoutByBus = async (req, res) => {
  try {
    const layout = await BusSeatLayout.findOne({
      bus: req.params.busId,
      vendor: req.vendor._id,
    });

    if (!layout) {
      return res.status(404).json({
        success: false,
        message: "Seat layout not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: layout,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   GET PUBLIC SEAT LAYOUT
========================================================= */

exports.getPublicSeatLayout = async (req, res) => {
  try {
    const layout = await BusSeatLayout.findOne({
      bus: req.params.busId,
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

    if (
      layout.bus.status !== "approved" ||
      !layout.bus.isActive
    ) {
      return res.status(404).json({
        success: false,
        message: "Bus is not available",
      });
    }

    return res.status(200).json({
      success: true,
      data: layout,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   BLOCK / UNBLOCK SINGLE SEAT
========================================================= */

exports.toggleSeatStatus = async (req, res) => {
  try {
    const {
      busId,
      seatId,
      deck,
      status,
    } = req.body;

    if (!["LOWER", "UPPER"].includes(deck)) {
      return res.status(400).json({
        success: false,
        message: "deck must be LOWER or UPPER",
      });
    }

    if (
      !["AVAILABLE", "BLOCKED", "MAINTENANCE"]
        .includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Use AVAILABLE, BLOCKED or MAINTENANCE",
      });
    }

    const layout = await BusSeatLayout.findOne({
      bus: busId,
      vendor: req.vendor._id,
    });

    if (!layout) {
      return res.status(404).json({
        success: false,
        message: "Seat layout not found",
      });
    }

    const seats =
      deck === "LOWER"
        ? layout.lowerDeckSeats
        : layout.upperDeckSeats;

    const seat = seats.id(seatId);

    if (!seat) {
      return res.status(404).json({
        success: false,
        message: "Seat not found",
      });
    }

    seat.status = status;

    await layout.save();

    return res.status(200).json({
      success: true,
      message: `Seat status changed to ${status}`,
      data: layout,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};