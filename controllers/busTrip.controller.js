// const BusTrip = require("../models/BusTrip.model");
// const Bus = require("../models/Bus.model");
// const BusSeatLayout = require("../models/BusSeatLayout.model");


// /* ==========================================
//    HELPER
// ========================================== */

// const parseArray = (value) => {
//   if (!value) return [];

//   if (Array.isArray(value)) return value;

//   if (typeof value === "string") {
//     try {
//       const parsed = JSON.parse(value);

//       if (Array.isArray(parsed)) {
//         return parsed;
//       }
//     } catch (error) {}

//     return value
//       .split(",")
//       .map((item) => item.trim())
//       .filter(Boolean);
//   }

//   return [];
// };


// const parsePoints = (value) => {
//   if (!value) return [];

//   if (Array.isArray(value)) return value;

//   if (typeof value === "string") {
//     try {
//       const parsed = JSON.parse(value);

//       if (Array.isArray(parsed)) {
//         return parsed;
//       }
//     } catch (error) {}
//   }

//   return [];
// };


// /* ==========================================
//    GENERATE TRIP CODE
// ========================================== */

// const generateTripCode = () => {
//   return `TRIP-${Date.now()}-${Math.floor(
//     Math.random() * 1000
//   )}`;
// };


// /* ==========================================
//    CREATE BUS TRIP
// ========================================== */

// exports.createBusTrip = async (req, res) => {
//   try {
//     const d = req.body;


//     /* ---------- BUS CHECK ---------- */

//     const bus = await Bus.findOne({
//       _id: d.busId,
//       vendor: req.vendor._id,
//     });

//     if (!bus) {
//       return res.status(404).json({
//         success: false,
//         message: "Bus not found",
//       });
//     }


//     /* ---------- SEAT LAYOUT CHECK ---------- */

//     const seatLayout = await BusSeatLayout.findOne({
//       bus: bus._id,
//       vendor: req.vendor._id,
//       isActive: true,
//     });

//     if (!seatLayout) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Please create seat layout before creating a trip",
//       });
//     }


//     /* ---------- DUPLICATE TRIP CHECK ---------- */

//     const existingTrip = await BusTrip.findOne({
//       bus: bus._id,
//       travelDate: new Date(d.travelDate),
//       departureTime: d.departureTime,
//       status: {
//         $ne: "CANCELLED",
//       },
//     });

//     if (existingTrip) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "A trip already exists for this bus on this date and departure time",
//       });
//     }


//     /* ---------- PARSE DATA ---------- */

//     const viaCities = parseArray(d.viaCities);

//     const boardingPoints = parsePoints(
//       d.boardingPoints
//     );

//     const droppingPoints = parsePoints(
//       d.droppingPoints
//     );


//     /* ---------- PRICE ---------- */

//     const basePrice = Number(
//       d.basePrice || bus.price || 0
//     );

//     const tax = Number(d.tax || 0);

//     const discount = Number(d.discount || 0);

//     const finalPrice =
//       basePrice + tax - discount;


//     /* ---------- SEAT DATA ---------- */

//     const totalSeats = seatLayout.seats.length;

//     const layoutBlockedSeats = seatLayout.seats
//       .filter(
//         (seat) =>
//           seat.isBlocked === true ||
//           seat.status === "BLOCKED"
//       )
//       .map((seat) => seat.seatNumber);

//     const blockedSeats = [
//       ...new Set([
//         ...layoutBlockedSeats,
//         ...parseArray(d.blockedSeats),
//       ]),
//     ];

//     const availableSeats =
//       totalSeats - blockedSeats.length;


//     /* ---------- CREATE ---------- */

//     const trip = await BusTrip.create({
//       bus: bus._id,

//       vendor: req.vendor._id,

//       seatLayout: seatLayout._id,

//       tripCode: generateTripCode(),

//       tripName:
//         d.tripName ||
//         `${bus.fromCity} to ${bus.toCity}`,

//       fromCity:
//         d.fromCity || bus.fromCity,

//       toCity:
//         d.toCity || bus.toCity,

//       viaCities,

//       travelDate: d.travelDate,

//       departureTime:
//         d.departureTime || bus.departureTime,

//       arrivalDate:
//         d.arrivalDate || null,

//       arrivalTime:
//         d.arrivalTime || bus.arrivalTime,

//       reportingTime:
//         d.reportingTime || bus.reportingTime || "",

//       journeyDuration:
//         d.journeyDuration ||
//         bus.journeyDuration ||
//         "",

//       boardingPoints:
//         boardingPoints.length
//           ? boardingPoints
//           : bus.boardingPoints,

//       droppingPoints:
//         droppingPoints.length
//           ? droppingPoints
//           : bus.droppingPoints,

//       basePrice,

//       tax,

//       discount,

//       finalPrice,

//       totalSeats,

//       availableSeats,

//       bookedSeats: [],

//       blockedSeats,

//       status: "SCHEDULED",

//       isActive: true,

//       notes: d.notes || "",
//     });


//     return res.status(201).json({
//       success: true,
//       message: "Bus trip created successfully",
//       trip,
//     });

//   } catch (error) {
//     console.error("createBusTrip error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================
//    GET VENDOR TRIPS
// ========================================== */

// exports.getVendorTrips = async (req, res) => {
//   try {
//     const {
//       busId,
//       status,
//       travelDate,
//     } = req.query;

//     const query = {
//       vendor: req.vendor._id,
//     };


//     if (busId) {
//       query.bus = busId;
//     }

//     if (status) {
//       query.status = status;
//     }

//     if (travelDate) {
//       const startDate = new Date(travelDate);
//       startDate.setHours(0, 0, 0, 0);

//       const endDate = new Date(travelDate);
//       endDate.setHours(23, 59, 59, 999);

//       query.travelDate = {
//         $gte: startDate,
//         $lte: endDate,
//       };
//     }


//     const trips = await BusTrip.find(query)
//       .populate(
//         "bus",
//         "busName busNumber busType image"
//       )
//       .sort({
//         travelDate: -1,
//         departureTime: 1,
//       });


//     return res.status(200).json({
//       success: true,
//       count: trips.length,
//       trips,
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================
//    GET SINGLE TRIP
// ========================================== */

// exports.getTripById = async (req, res) => {
//   try {
//     const trip = await BusTrip.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     })
//       .populate(
//         "bus",
//         "busName busNumber busType amenities image"
//       )
//       .populate("seatLayout");


//     if (!trip) {
//       return res.status(404).json({
//         success: false,
//         message: "Trip not found",
//       });
//     }


//     return res.status(200).json({
//       success: true,
//       trip,
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================
//    UPDATE TRIP
// ========================================== */

// exports.updateTrip = async (req, res) => {
//   try {
//     const trip = await BusTrip.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });


//     if (!trip) {
//       return res.status(404).json({
//         success: false,
//         message: "Trip not found",
//       });
//     }


//     if (
//       ["STARTED", "COMPLETED"].includes(
//         trip.status
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Started or completed trip cannot be edited",
//       });
//     }


//     const d = req.body;


//     /* ---------- BASIC FIELDS ---------- */

//     const allowedFields = [
//       "tripName",
//       "fromCity",
//       "toCity",
//       "travelDate",
//       "departureTime",
//       "arrivalDate",
//       "arrivalTime",
//       "reportingTime",
//       "journeyDuration",
//       "status",
//       "isActive",
//       "notes",
//     ];


//     allowedFields.forEach((field) => {
//       if (d[field] !== undefined) {
//         trip[field] = d[field];
//       }
//     });


//     if (d.viaCities !== undefined) {
//       trip.viaCities = parseArray(d.viaCities);
//     }


//     if (d.boardingPoints !== undefined) {
//       trip.boardingPoints =
//         parsePoints(d.boardingPoints);
//     }


//     if (d.droppingPoints !== undefined) {
//       trip.droppingPoints =
//         parsePoints(d.droppingPoints);
//     }


//     /* ---------- PRICING ---------- */

//     if (d.basePrice !== undefined) {
//       trip.basePrice = Number(d.basePrice);
//     }

//     if (d.tax !== undefined) {
//       trip.tax = Number(d.tax);
//     }

//     if (d.discount !== undefined) {
//       trip.discount = Number(d.discount);
//     }

//     trip.finalPrice =
//       Number(trip.basePrice || 0) +
//       Number(trip.tax || 0) -
//       Number(trip.discount || 0);


//     await trip.save();


//     return res.status(200).json({
//       success: true,
//       message: "Trip updated successfully",
//       trip,
//     });

//   } catch (error) {
//     console.error("updateTrip error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================
//    CANCEL TRIP
// ========================================== */

// exports.cancelTrip = async (req, res) => {
//   try {
//     const trip = await BusTrip.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });


//     if (!trip) {
//       return res.status(404).json({
//         success: false,
//         message: "Trip not found",
//       });
//     }


//     if (trip.bookedSeats.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Trip has bookings. Handle cancellation/refund first.",
//       });
//     }


//     trip.status = "CANCELLED";

//     trip.isActive = false;

//     trip.cancellationReason =
//       req.body.cancellationReason ||
//       "Cancelled by vendor";


//     await trip.save();


//     return res.status(200).json({
//       success: true,
//       message: "Trip cancelled successfully",
//       trip,
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================
//    DELETE TRIP
// ========================================== */

// exports.deleteTrip = async (req, res) => {
//   try {
//     const trip = await BusTrip.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });


//     if (!trip) {
//       return res.status(404).json({
//         success: false,
//         message: "Trip not found",
//       });
//     }


//     if (trip.bookedSeats.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Cannot delete trip because seats are already booked",
//       });
//     }


//     await trip.deleteOne();


//     return res.status(200).json({
//       success: true,
//       message: "Trip deleted successfully",
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


const mongoose = require("mongoose");

const BusTrip = require("../models/BusTrip.model");
const Bus = require("../models/Bus.model");
const BusSeatLayout = require("../models/BusSeatLayout.model");

/* BusType (Bus Types page layout) is optional - the controller still
   works with only the old BusSeatLayout module. */
let BusType = null;

try {
  BusType = require("../models/BusType.model");
} catch (error) {
  BusType = null;
}


/* ==========================================
   CONSTANTS
========================================== */

const STATUS_ORDER = ["SCHEDULED", "BOARDING", "STARTED", "COMPLETED"];

const ALL_STATUSES = [...STATUS_ORDER, "CANCELLED"];

const DAY_MS = 24 * 60 * 60 * 1000;


/* ==========================================
   RESPONSE HELPERS
========================================== */

const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

const handleError = (res, error, label) => {
  console.error(`${label} error:`, error);

  if (error.name === "ValidationError") {
    return sendError(res, 400, error.message);
  }

  if (error.name === "CastError") {
    return sendError(res, 400, "Invalid id or value");
  }

  if (error.code === 11000) {
    return sendError(
      res,
      409,
      "Duplicate trip code. Please try again."
    );
  }

  return sendError(res, 500, error.message);
};


/* ==========================================
   PARSE HELPERS
========================================== */

const text = (value) =>
  value === undefined || value === null
    ? ""
    : String(value).trim();


/* "a, b, c"  OR  JSON array  OR  array */
const parseArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(text).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.map(text).filter(Boolean);
      }
    } catch (error) {
      /* not JSON - fall through to comma split */
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};


const cleanPoint = (point) => ({
  location: text(point?.location),
  time: text(point?.time),
  address: text(point?.address),
  landmark: text(point?.landmark),
});


/* array of objects  OR  JSON string  OR
   "Location|Time|Address|Landmark, ..." string */
const parsePoints = (value) => {
  if (!value) return [];

  let list = [];

  if (Array.isArray(value)) {
    list = value;
  } else if (typeof value === "string") {
    let parsed = null;

    try {
      parsed = JSON.parse(value);
    } catch (error) {
      parsed = null;
    }

    if (Array.isArray(parsed)) {
      list = parsed;
    } else {
      list = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const parts = item.split("|").map((part) => part.trim());

          return {
            location: parts[0] || "",
            time: parts[1] || "",
            address: parts[2] || "",
            landmark: parts[3] || "",
          };
        });
    }
  }

  return list.map(cleanPoint).filter((point) => point.location);
};


/* "2026-10-20" (or ISO) -> Date at 00:00 UTC. null when invalid. */
const parseDay = (value) => {
  if (!value) return null;

  const raw = String(value).trim();

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);

  let date;

  if (match) {
    date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`);
  } else {
    date = new Date(raw);

    if (!Number.isNaN(date.getTime())) {
      date.setUTCHours(0, 0, 0, 0);
    }
  }

  return Number.isNaN(date.getTime()) ? null : date;
};


const todayUtc = () => {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now;
};


const dayRange = (day) => ({
  $gte: day,
  $lt: new Date(day.getTime() + DAY_MS),
});


/* number >= 0 , otherwise null */
const toMoney = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : null;
};


const generateTripCode = () =>
  `TRIP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;


const pointsFromBus = (points) =>
  (points || []).map(cleanPoint).filter((point) => point.location);


/* ==========================================
   SEAT SOURCE
   1) old BusSeatLayout module   (if the bus has one)
   2) Bus Types page layout      (BusType)
   Returns null when the bus has no layout at all.
========================================== */

const resolveSeatSource = async (bus, vendorId) => {
  /* ---------- 1) BusSeatLayout ---------- */
  const layout = await BusSeatLayout.findOne({
    bus: bus._id,
    vendor: vendorId,
    isActive: true,
  });

  if (layout) {
    const seats = new Map();

    const addSeats = (list, deck) => {
      (list || []).forEach((seat) => {
        if (!seat || seat.isActive === false) return;

        const seatNumber = text(seat.seatNumber);

        if (!seatNumber || seats.has(seatNumber)) return;

        seats.set(seatNumber, {
          seatNumber,
          deck,
          seatType: seat.seatType || "SEATER",
          price: Number(seat.price) > 0 ? Number(seat.price) : 0,
          isBlocked:
            seat.status === "BLOCKED" || seat.status === "MAINTENANCE",
        });
      });
    };

    addSeats(layout.lowerDeckSeats, "LOWER");
    addSeats(layout.upperDeckSeats, "UPPER");

    if (seats.size > 0) {
      return {
        source: "SEAT_LAYOUT",
        seatLayoutId: layout._id,
        busTypeId: null,
        seats: [...seats.values()],
      };
    }
  }

  /* ---------- 2) BusType (Bus Types page) ---------- */
  if (BusType) {
    const busType = await BusType.findOne({
      bus: bus._id,
      vendor: vendorId,
      isActive: true,
    });

    if (busType) {
      const seats = new Map();

      const addCells = (grid, deck) => {
        (grid || []).forEach((cell) => {
          if (!cell || !cell.isSeat) return;

          const seatNumber = text(cell.seatNumber);

          if (!seatNumber || seats.has(seatNumber)) return;

          seats.set(seatNumber, {
            seatNumber,
            deck,
            seatType: cell.seatType || "SEATER",
            price: Number(cell.price) > 0 ? Number(cell.price) : 0,
            isBlocked: false,
          });
        });
      };

      addCells(busType.lowerDeckGrid, "LOWER");

      if (busType.hasUpperDeck) {
        addCells(busType.upperDeckGrid, "UPPER");
      }

      if (seats.size > 0) {
        return {
          source: "BUS_TYPE",
          seatLayoutId: null,
          busTypeId: busType._id,
          seats: [...seats.values()],
        };
      }
    }
  }

  return null;
};


/* ==========================================
   DUPLICATE TRIP CHECK
========================================== */

const findDuplicateTrip = (busId, day, departureTime, excludeId) => {
  const query = {
    bus: busId,
    travelDate: dayRange(day),
    departureTime,
    status: { $ne: "CANCELLED" },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return BusTrip.findOne(query);
};


/* ==========================================
   CREATE BUS TRIP
========================================== */

exports.createBusTrip = async (req, res) => {
  try {
    const d = req.body || {};

    /* ---------- BUS CHECK ---------- */

    if (!d.busId || !mongoose.isValidObjectId(d.busId)) {
      return sendError(res, 400, "Please select a bus for this trip");
    }

    const bus = await Bus.findOne({
      _id: d.busId,
      vendor: req.vendor._id,
    });

    if (!bus) {
      return sendError(res, 404, "Bus not found");
    }

    if (bus.isActive === false) {
      return sendError(
        res,
        400,
        "This bus is inactive. Activate it before scheduling a trip"
      );
    }


    /* ---------- REQUIRED FIELDS ---------- */

    const travelDay = parseDay(d.travelDate);

    if (!travelDay) {
      return sendError(res, 400, "A valid travel date is required");
    }

    if (travelDay < todayUtc()) {
      return sendError(res, 400, "Travel date cannot be in the past");
    }

    const fromCity = text(d.fromCity) || text(bus.fromCity);
    const toCity = text(d.toCity) || text(bus.toCity);
    const departureTime =
      text(d.departureTime) || text(bus.departureTime);
    const arrivalTime = text(d.arrivalTime) || text(bus.arrivalTime);

    if (!fromCity || !toCity) {
      return sendError(res, 400, "From city and to city are required");
    }

    if (!departureTime || !arrivalTime) {
      return sendError(
        res,
        400,
        "Departure time and arrival time are required"
      );
    }

    const arrivalDay = d.arrivalDate ? parseDay(d.arrivalDate) : null;

    if (d.arrivalDate && !arrivalDay) {
      return sendError(res, 400, "Arrival date is not valid");
    }


    /* ---------- PRICE ---------- */

    const basePrice =
      d.basePrice !== undefined && d.basePrice !== ""
        ? toMoney(d.basePrice)
        : toMoney(bus.price);

    const tax = d.tax !== undefined && d.tax !== "" ? toMoney(d.tax) : 0;

    const discount =
      d.discount !== undefined && d.discount !== ""
        ? toMoney(d.discount)
        : 0;

    if (basePrice === null || tax === null || discount === null) {
      return sendError(
        res,
        400,
        "Base fare, tax and discount must be valid amounts (0 or more)"
      );
    }

    const finalPrice = Math.max(0, basePrice + tax - discount);


    /* ---------- SEAT LAYOUT CHECK ---------- */

    const seatSource = await resolveSeatSource(bus, req.vendor._id);

    if (!seatSource) {
      return sendError(
        res,
        400,
        "Please create seat layout before creating a trip"
      );
    }


    /* ---------- DUPLICATE TRIP CHECK ---------- */

    const existingTrip = await findDuplicateTrip(
      bus._id,
      travelDay,
      departureTime
    );

    if (existingTrip) {
      return sendError(
        res,
        400,
        "A trip already exists for this bus on this date and departure time"
      );
    }


    /* ---------- SEAT DATA ---------- */

    const seatMap = seatSource.seats;

    const validNumbers = new Set(seatMap.map((seat) => seat.seatNumber));

    const layoutBlocked = seatMap
      .filter((seat) => seat.isBlocked)
      .map((seat) => seat.seatNumber);

    const requestedBlocked = parseArray(d.blockedSeats).filter((number) =>
      validNumbers.has(number)
    );

    const blockedSeats = [
      ...new Set([...layoutBlocked, ...requestedBlocked]),
    ];

    const blockedSet = new Set(blockedSeats);

    seatMap.forEach((seat) => {
      seat.isBlocked = blockedSet.has(seat.seatNumber);
    });

    const totalSeats = seatMap.length;

    const availableSeats = Math.max(0, totalSeats - blockedSeats.length);


    /* ---------- POINTS ---------- */

    const boardingPoints = parsePoints(d.boardingPoints);
    const droppingPoints = parsePoints(d.droppingPoints);


    /* ---------- CREATE ---------- */

    const trip = await BusTrip.create({
      bus: bus._id,

      vendor: req.vendor._id,

      seatLayout: seatSource.seatLayoutId,

      busTypeLayout: seatSource.busTypeId,

      seatLayoutSource: seatSource.source,

      tripCode: generateTripCode(),

      tripName: text(d.tripName) || `${fromCity} to ${toCity}`,

      fromCity,

      toCity,

      viaCities: parseArray(d.viaCities),

      travelDate: travelDay,

      departureTime,

      arrivalDate: arrivalDay,

      arrivalTime,

      reportingTime: text(d.reportingTime) || text(bus.reportingTime),

      journeyDuration:
        text(d.journeyDuration) || text(bus.journeyDuration),

      boardingPoints: boardingPoints.length
        ? boardingPoints
        : pointsFromBus(bus.boardingPoints),

      droppingPoints: droppingPoints.length
        ? droppingPoints
        : pointsFromBus(bus.droppingPoints),

      basePrice,

      tax,

      discount,

      finalPrice,

      seatMap,

      totalSeats,

      availableSeats,

      bookedSeats: [],

      blockedSeats,

      status: "SCHEDULED",

      isActive: true,

      notes: text(d.notes),
    });


    return res.status(201).json({
      success: true,
      message: "Bus trip created successfully",
      trip,
    });

  } catch (error) {
    return handleError(res, error, "createBusTrip");
  }
};


/* ==========================================
   GET VENDOR TRIPS
========================================== */

exports.getVendorTrips = async (req, res) => {
  try {
    const { busId, status, travelDate } = req.query;

    const query = {
      vendor: req.vendor._id,
    };

    if (busId) {
      if (!mongoose.isValidObjectId(busId)) {
        return sendError(res, 400, "Invalid bus id");
      }

      query.bus = busId;
    }

    if (status) {
      if (!ALL_STATUSES.includes(status)) {
        return sendError(res, 400, "Invalid trip status");
      }

      query.status = status;
    }

    if (travelDate) {
      const day = parseDay(travelDate);

      if (!day) {
        return sendError(res, 400, "Invalid travel date");
      }

      query.travelDate = dayRange(day);
    }

    const trips = await BusTrip.find(query)
      .select("-seatMap")
      .populate("bus", "busName busNumber busType image")
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
    return handleError(res, error, "getVendorTrips");
  }
};


/* ==========================================
   GET SINGLE TRIP
========================================== */

exports.getTripById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 404, "Trip not found");
    }

    let query = BusTrip.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    })
      .populate("bus", "busName busNumber busType amenities image")
      .populate("seatLayout");

    if (BusType) {
      query = query.populate("busTypeLayout");
    }

    const trip = await query;

    if (!trip) {
      return sendError(res, 404, "Trip not found");
    }

    return res.status(200).json({
      success: true,
      trip,
    });

  } catch (error) {
    return handleError(res, error, "getTripById");
  }
};


/* ==========================================
   UPDATE TRIP
========================================== */

exports.updateTrip = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 404, "Trip not found");
    }

    const trip = await BusTrip.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!trip) {
      return sendError(res, 404, "Trip not found");
    }

    if (["COMPLETED", "CANCELLED"].includes(trip.status)) {
      return sendError(
        res,
        400,
        "Completed or cancelled trip cannot be edited"
      );
    }

    const d = req.body || {};

    /* A started trip can only move to COMPLETED (and get notes). */
    if (trip.status === "STARTED") {
      const extra = Object.keys(d).filter(
        (key) => !["status", "notes"].includes(key)
      );

      if (extra.length > 0) {
        return sendError(
          res,
          400,
          "A started trip can only be marked completed"
        );
      }
    }


    /* ---------- STATUS ---------- */

    if (d.status !== undefined && d.status !== trip.status) {
      if (d.status === "CANCELLED") {
        return sendError(
          res,
          400,
          "Use the cancel option to cancel a trip"
        );
      }

      if (!STATUS_ORDER.includes(d.status)) {
        return sendError(res, 400, "Invalid trip status");
      }

      const currentRank = STATUS_ORDER.indexOf(trip.status);
      const nextRank = STATUS_ORDER.indexOf(d.status);

      if (currentRank >= 2 && nextRank < currentRank) {
        return sendError(
          res,
          400,
          "A started trip cannot go back to an earlier status"
        );
      }

      trip.status = d.status;
    }


    /* ---------- TEXT FIELDS ---------- */

    const requiredText = [
      "fromCity",
      "toCity",
      "departureTime",
      "arrivalTime",
    ];

    for (const field of requiredText) {
      if (d[field] !== undefined) {
        const value = text(d[field]);

        if (!value) {
          return sendError(res, 400, `${field} cannot be empty`);
        }

        trip[field] = value;
      }
    }

    ["tripName", "reportingTime", "journeyDuration", "notes"].forEach(
      (field) => {
        if (d[field] !== undefined) {
          trip[field] = text(d[field]);
        }
      }
    );

    if (d.isActive !== undefined) {
      trip.isActive =
        d.isActive === true || d.isActive === "true" || d.isActive === 1;
    }


    /* ---------- DATES ---------- */

    const previousDay = trip.travelDate
      ? trip.travelDate.getTime()
      : null;

    if (d.travelDate !== undefined) {
      const day = parseDay(d.travelDate);

      if (!day) {
        return sendError(res, 400, "A valid travel date is required");
      }

      if (day.getTime() !== previousDay) {
        if (day < todayUtc()) {
          return sendError(
            res,
            400,
            "Travel date cannot be in the past"
          );
        }

        trip.travelDate = day;
      }
    }

    if (d.arrivalDate !== undefined) {
      if (d.arrivalDate === "" || d.arrivalDate === null) {
        trip.arrivalDate = null;
      } else {
        const arrivalDay = parseDay(d.arrivalDate);

        if (!arrivalDay) {
          return sendError(res, 400, "Arrival date is not valid");
        }

        trip.arrivalDate = arrivalDay;
      }
    }

    const dateOrTimeChanged =
      trip.isModified("travelDate") || trip.isModified("departureTime");

    if (dateOrTimeChanged) {
      const duplicate = await findDuplicateTrip(
        trip.bus,
        trip.travelDate,
        trip.departureTime,
        trip._id
      );

      if (duplicate) {
        return sendError(
          res,
          400,
          "Another trip already exists for this bus on this date and departure time"
        );
      }
    }


    /* ---------- ROUTE / POINTS ---------- */

    if (d.viaCities !== undefined) {
      trip.viaCities = parseArray(d.viaCities);
    }

    if (d.boardingPoints !== undefined) {
      trip.boardingPoints = parsePoints(d.boardingPoints);
    }

    if (d.droppingPoints !== undefined) {
      trip.droppingPoints = parsePoints(d.droppingPoints);
    }


    /* ---------- PRICING ---------- */

    for (const field of ["basePrice", "tax", "discount"]) {
      if (d[field] !== undefined && d[field] !== "") {
        const amount = toMoney(d[field]);

        if (amount === null) {
          return sendError(
            res,
            400,
            `${field} must be a valid amount (0 or more)`
          );
        }

        trip[field] = amount;
      }
    }

    trip.finalPrice = Math.max(
      0,
      Number(trip.basePrice || 0) +
        Number(trip.tax || 0) -
        Number(trip.discount || 0)
    );


    /* ---------- BLOCKED SEATS ---------- */

    if (d.blockedSeats !== undefined) {
      const valid = new Set(
        (trip.seatMap || []).map((seat) => seat.seatNumber)
      );

      const booked = new Set(trip.bookedSeats || []);

      const requested = parseArray(d.blockedSeats).filter(
        (number) =>
          (valid.size === 0 || valid.has(number)) && !booked.has(number)
      );

      trip.blockedSeats = [...new Set(requested)];

      const blockedSet = new Set(trip.blockedSeats);

      (trip.seatMap || []).forEach((seat) => {
        seat.isBlocked = blockedSet.has(seat.seatNumber);
      });
    }

    trip.availableSeats = Math.max(
      0,
      Number(trip.totalSeats || 0) -
        (trip.bookedSeats || []).length -
        (trip.blockedSeats || []).length
    );


    await trip.save();

    await BusTrip.populate(trip, {
      path: "bus",
      select: "busName busNumber busType image",
    });

    return res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      trip,
    });

  } catch (error) {
    return handleError(res, error, "updateTrip");
  }
};


/* ==========================================
   CANCEL TRIP
========================================== */

exports.cancelTrip = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 404, "Trip not found");
    }

    const trip = await BusTrip.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!trip) {
      return sendError(res, 404, "Trip not found");
    }

    if (["STARTED", "COMPLETED", "CANCELLED"].includes(trip.status)) {
      return sendError(
        res,
        400,
        `A ${trip.status.toLowerCase()} trip cannot be cancelled`
      );
    }

    if ((trip.bookedSeats || []).length > 0) {
      return sendError(
        res,
        400,
        "Trip has bookings. Handle cancellation/refund first."
      );
    }

    trip.status = "CANCELLED";

    trip.isActive = false;

    trip.cancelledAt = new Date();

    trip.cancellationReason =
      text(req.body?.cancellationReason) || "Cancelled by vendor";

    await trip.save();

    return res.status(200).json({
      success: true,
      message: "Trip cancelled successfully",
      trip,
    });

  } catch (error) {
    return handleError(res, error, "cancelTrip");
  }
};


/* ==========================================
   DELETE TRIP
========================================== */

exports.deleteTrip = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 404, "Trip not found");
    }

    const trip = await BusTrip.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!trip) {
      return sendError(res, 404, "Trip not found");
    }

    if ((trip.bookedSeats || []).length > 0) {
      return sendError(
        res,
        400,
        "Cannot delete trip because seats are already booked"
      );
    }

    if (trip.status === "STARTED") {
      return sendError(res, 400, "A started trip cannot be deleted");
    }

    await trip.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });

  } catch (error) {
    return handleError(res, error, "deleteTrip");
  }
};