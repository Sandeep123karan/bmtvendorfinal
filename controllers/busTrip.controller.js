const BusTrip = require("../models/BusTrip.model");
const Bus = require("../models/Bus.model");
const BusSeatLayout = require("../models/BusSeatLayout.model");


/* ==========================================
   HELPER
========================================== */

const parseArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {}

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};


const parsePoints = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {}
  }

  return [];
};


/* ==========================================
   GENERATE TRIP CODE
========================================== */

const generateTripCode = () => {
  return `TRIP-${Date.now()}-${Math.floor(
    Math.random() * 1000
  )}`;
};


/* ==========================================
   CREATE BUS TRIP
========================================== */

exports.createBusTrip = async (req, res) => {
  try {
    const d = req.body;


    /* ---------- BUS CHECK ---------- */

    const bus = await Bus.findOne({
      _id: d.busId,
      vendor: req.vendor._id,
    });

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }


    /* ---------- SEAT LAYOUT CHECK ---------- */

    const seatLayout = await BusSeatLayout.findOne({
      bus: bus._id,
      vendor: req.vendor._id,
      isActive: true,
    });

    if (!seatLayout) {
      return res.status(400).json({
        success: false,
        message:
          "Please create seat layout before creating a trip",
      });
    }


    /* ---------- DUPLICATE TRIP CHECK ---------- */

    const existingTrip = await BusTrip.findOne({
      bus: bus._id,
      travelDate: new Date(d.travelDate),
      departureTime: d.departureTime,
      status: {
        $ne: "CANCELLED",
      },
    });

    if (existingTrip) {
      return res.status(400).json({
        success: false,
        message:
          "A trip already exists for this bus on this date and departure time",
      });
    }


    /* ---------- PARSE DATA ---------- */

    const viaCities = parseArray(d.viaCities);

    const boardingPoints = parsePoints(
      d.boardingPoints
    );

    const droppingPoints = parsePoints(
      d.droppingPoints
    );


    /* ---------- PRICE ---------- */

    const basePrice = Number(
      d.basePrice || bus.price || 0
    );

    const tax = Number(d.tax || 0);

    const discount = Number(d.discount || 0);

    const finalPrice =
      basePrice + tax - discount;


    /* ---------- SEAT DATA ---------- */

    const totalSeats = seatLayout.seats.length;

    const layoutBlockedSeats = seatLayout.seats
      .filter(
        (seat) =>
          seat.isBlocked === true ||
          seat.status === "BLOCKED"
      )
      .map((seat) => seat.seatNumber);

    const blockedSeats = [
      ...new Set([
        ...layoutBlockedSeats,
        ...parseArray(d.blockedSeats),
      ]),
    ];

    const availableSeats =
      totalSeats - blockedSeats.length;


    /* ---------- CREATE ---------- */

    const trip = await BusTrip.create({
      bus: bus._id,

      vendor: req.vendor._id,

      seatLayout: seatLayout._id,

      tripCode: generateTripCode(),

      tripName:
        d.tripName ||
        `${bus.fromCity} to ${bus.toCity}`,

      fromCity:
        d.fromCity || bus.fromCity,

      toCity:
        d.toCity || bus.toCity,

      viaCities,

      travelDate: d.travelDate,

      departureTime:
        d.departureTime || bus.departureTime,

      arrivalDate:
        d.arrivalDate || null,

      arrivalTime:
        d.arrivalTime || bus.arrivalTime,

      reportingTime:
        d.reportingTime || bus.reportingTime || "",

      journeyDuration:
        d.journeyDuration ||
        bus.journeyDuration ||
        "",

      boardingPoints:
        boardingPoints.length
          ? boardingPoints
          : bus.boardingPoints,

      droppingPoints:
        droppingPoints.length
          ? droppingPoints
          : bus.droppingPoints,

      basePrice,

      tax,

      discount,

      finalPrice,

      totalSeats,

      availableSeats,

      bookedSeats: [],

      blockedSeats,

      status: "SCHEDULED",

      isActive: true,

      notes: d.notes || "",
    });


    return res.status(201).json({
      success: true,
      message: "Bus trip created successfully",
      trip,
    });

  } catch (error) {
    console.error("createBusTrip error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   GET VENDOR TRIPS
========================================== */

exports.getVendorTrips = async (req, res) => {
  try {
    const {
      busId,
      status,
      travelDate,
    } = req.query;

    const query = {
      vendor: req.vendor._id,
    };


    if (busId) {
      query.bus = busId;
    }

    if (status) {
      query.status = status;
    }

    if (travelDate) {
      const startDate = new Date(travelDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(travelDate);
      endDate.setHours(23, 59, 59, 999);

      query.travelDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }


    const trips = await BusTrip.find(query)
      .populate(
        "bus",
        "busName busNumber busType image"
      )
      .sort({
        travelDate: -1,
        departureTime: 1,
      });


    return res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   GET SINGLE TRIP
========================================== */

exports.getTripById = async (req, res) => {
  try {
    const trip = await BusTrip.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    })
      .populate(
        "bus",
        "busName busNumber busType amenities image"
      )
      .populate("seatLayout");


    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }


    return res.status(200).json({
      success: true,
      trip,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   UPDATE TRIP
========================================== */

exports.updateTrip = async (req, res) => {
  try {
    const trip = await BusTrip.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });


    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }


    if (
      ["STARTED", "COMPLETED"].includes(
        trip.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Started or completed trip cannot be edited",
      });
    }


    const d = req.body;


    /* ---------- BASIC FIELDS ---------- */

    const allowedFields = [
      "tripName",
      "fromCity",
      "toCity",
      "travelDate",
      "departureTime",
      "arrivalDate",
      "arrivalTime",
      "reportingTime",
      "journeyDuration",
      "status",
      "isActive",
      "notes",
    ];


    allowedFields.forEach((field) => {
      if (d[field] !== undefined) {
        trip[field] = d[field];
      }
    });


    if (d.viaCities !== undefined) {
      trip.viaCities = parseArray(d.viaCities);
    }


    if (d.boardingPoints !== undefined) {
      trip.boardingPoints =
        parsePoints(d.boardingPoints);
    }


    if (d.droppingPoints !== undefined) {
      trip.droppingPoints =
        parsePoints(d.droppingPoints);
    }


    /* ---------- PRICING ---------- */

    if (d.basePrice !== undefined) {
      trip.basePrice = Number(d.basePrice);
    }

    if (d.tax !== undefined) {
      trip.tax = Number(d.tax);
    }

    if (d.discount !== undefined) {
      trip.discount = Number(d.discount);
    }

    trip.finalPrice =
      Number(trip.basePrice || 0) +
      Number(trip.tax || 0) -
      Number(trip.discount || 0);


    await trip.save();


    return res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      trip,
    });

  } catch (error) {
    console.error("updateTrip error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   CANCEL TRIP
========================================== */

exports.cancelTrip = async (req, res) => {
  try {
    const trip = await BusTrip.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });


    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }


    if (trip.bookedSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Trip has bookings. Handle cancellation/refund first.",
      });
    }


    trip.status = "CANCELLED";

    trip.isActive = false;

    trip.cancellationReason =
      req.body.cancellationReason ||
      "Cancelled by vendor";


    await trip.save();


    return res.status(200).json({
      success: true,
      message: "Trip cancelled successfully",
      trip,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   DELETE TRIP
========================================== */

exports.deleteTrip = async (req, res) => {
  try {
    const trip = await BusTrip.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });


    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }


    if (trip.bookedSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete trip because seats are already booked",
      });
    }


    await trip.deleteOne();


    return res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};