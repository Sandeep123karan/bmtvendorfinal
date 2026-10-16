// const BusBooking = require("../models/BusBooking.model");
// const Bus = require("../models/Bus.model");

// /* =========================================================
//    CREATE BUS BOOKING
// ========================================================= */

// exports.createBusBooking = async (req, res) => {
//   try {
//     const {
//       busId,
//       user,
//       customer,
//       passengers,
//       boardingPoint,
//       droppingPoint,
//       journeyDate,
//       seatNumbers,
//       paymentMethod,
//       specialRequests,
//     } = req.body;

//     if (!busId) {
//       return res.status(400).json({
//         success: false,
//         message: "Bus ID is required",
//       });
//     }

//     if (!customer?.name || !customer?.phone) {
//       return res.status(400).json({
//         success: false,
//         message: "Customer name and phone are required",
//       });
//     }

//     if (!seatNumbers || seatNumbers.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Please select at least one seat",
//       });
//     }

//     const bus = await Bus.findById(busId);

//     if (!bus) {
//       return res.status(404).json({
//         success: false,
//         message: "Bus not found",
//       });
//     }

//     if (bus.status !== "approved" || !bus.isActive) {
//       return res.status(400).json({
//         success: false,
//         message: "Bus is not available for booking",
//       });
//     }

//     // Check already booked seats
//     const alreadyBooked = seatNumbers.filter((seat) =>
//       bus.bookedSeats.includes(seat)
//     );

//     if (alreadyBooked.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: `Seats already booked: ${alreadyBooked.join(", ")}`,
//       });
//     }

//     // Check blocked seats
//     const blockedSeats = seatNumbers.filter((seat) =>
//       bus.blockedSeats.includes(seat)
//     );

//     if (blockedSeats.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: `Seats blocked: ${blockedSeats.join(", ")}`,
//       });
//     }

//     // Calculate amount
//     let totalAmount = 0;

//     seatNumbers.forEach((seatNo) => {
//       const seat = bus.seatPrice.find(
//         (item) => item.seatNo === seatNo
//       );

//       totalAmount += seat
//         ? Number(seat.price || 0)
//         : Number(bus.price || 0);
//     });

//     const bookingId = `BUS${Date.now()}${Math.floor(
//       Math.random() * 1000
//     )}`;

//     const booking = await BusBooking.create({
//       bookingId,
//       bus: bus._id,
//       vendor: bus.vendor,

//       user: user || null,

//       customer: {
//         name: customer.name,
//         email: customer.email || "",
//         phone: customer.phone,
//       },

//       passengers: passengers || [],

//       fromCity: bus.fromCity,
//       toCity: bus.toCity,

//       journeyDate: journeyDate || bus.travelDate,

//       boardingPoint: boardingPoint || {},
//       droppingPoint: droppingPoint || {},

//       seatNumbers,

//       totalSeatsBooked: seatNumbers.length,

//       pricing: {
//         baseFare: totalAmount,
//         totalAmount,
//         currency: "INR",
//       },

//       paymentMethod: paymentMethod || "ONLINE",

//       paymentStatus: "PENDING",

//       bookingStatus: "PENDING",

//       specialRequests: specialRequests || "",
//     });

//     // Block/book seats temporarily
//     bus.bookedSeats.push(...seatNumbers);

//     bus.availableSeats = Math.max(
//       0,
//       bus.availableSeats - seatNumbers.length
//     );

//     await bus.save();

//     res.status(201).json({
//       success: true,
//       message: "Bus booking created successfully",
//       booking,
//     });
//   } catch (error) {
//     console.error("createBusBooking error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* =========================================================
//    GET ALL BUS BOOKINGS - ADMIN
// ========================================================= */

// exports.getAllBusBookings = async (req, res) => {
//   try {
//     const bookings = await BusBooking.find()
//       .populate("bus")
//       .populate("vendor", "name email phone")
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       count: bookings.length,
//       bookings,
//     });
//   } catch (error) {
//     console.error("getAllBusBookings error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* =========================================================
//    GET VENDOR BUS BOOKINGS
// ========================================================= */

// exports.getVendorBusBookings = async (req, res) => {
//   try {
//     const bookings = await BusBooking.find({
//       vendor: req.vendor._id,
//     })
//       .populate("bus")
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       count: bookings.length,
//       bookings,
//     });
//   } catch (error) {
//     console.error("getVendorBusBookings error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* =========================================================
//    GET SINGLE BUS BOOKING
// ========================================================= */

// exports.getBusBookingById = async (req, res) => {
//   try {
//     const booking = await BusBooking.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     })
//       .populate("bus")
//       .populate("vendor", "name email phone");

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     res.json({
//       success: true,
//       booking,
//     });
//   } catch (error) {
//     console.error("getBusBookingById error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* =========================================================
//    CONFIRM BUS BOOKING
// ========================================================= */

// exports.confirmBusBooking = async (req, res) => {
//   try {
//     const booking = await BusBooking.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     if (booking.bookingStatus === "CANCELLED") {
//       return res.status(400).json({
//         success: false,
//         message: "Cancelled booking cannot be confirmed",
//       });
//     }

//     booking.bookingStatus = "CONFIRMED";

//     await booking.save();

//     res.json({
//       success: true,
//       message: "Bus booking confirmed successfully",
//       booking,
//     });
//   } catch (error) {
//     console.error("confirmBusBooking error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* =========================================================
//    CANCEL BUS BOOKING
// ========================================================= */

// exports.cancelBusBooking = async (req, res) => {
//   try {
//     const { cancellationReason } = req.body;

//     const booking = await BusBooking.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     if (booking.bookingStatus === "CANCELLED") {
//       return res.status(400).json({
//         success: false,
//         message: "Booking is already cancelled",
//       });
//     }

//     booking.bookingStatus = "CANCELLED";
//     booking.cancellationReason =
//       cancellationReason || "Cancelled by vendor";

//     booking.cancelledAt = new Date();
//     booking.cancelledBy = "VENDOR";

//     await booking.save();

//     // Release seats
//     const bus = await Bus.findById(booking.bus);

//     if (bus) {
//       bus.bookedSeats = bus.bookedSeats.filter(
//         (seat) => !booking.seatNumbers.includes(seat)
//       );

//       bus.availableSeats += booking.seatNumbers.length;

//       if (bus.availableSeats > bus.totalSeats) {
//         bus.availableSeats = bus.totalSeats;
//       }

//       await bus.save();
//     }

//     res.json({
//       success: true,
//       message: "Bus booking cancelled successfully",
//       booking,
//     });
//   } catch (error) {
//     console.error("cancelBusBooking error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


const mongoose = require("mongoose");
const BusBooking = require("../models/BusBooking.model");
const Bus = require("../models/Bus.model");
const BusTrip = require("../models/BusTrip.model");

/* ========================= HELPERS ========================= */

const getVendorId = (req) => req.vendor?._id || req.vendor?.id;

const getTripId = (req) => req.params.tripId || req.body.tripId;

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const errorResponse = (res, status, message) =>
  res.status(status).json({ success: false, message });

/* ========================= CREATE BOOKING ========================= */

exports.createBusBooking = async (req, res) => {
  let lockedTrip = null;
  let lockedSeats = [];

  try {
    const {
      busId,
      tripId: bodyTripId,
      passengers,
      boardingPoint,
      droppingPoint,
      journeyDate,
      travelDate,
      seatNumbers,
      paymentMethod = "ONLINE",
      specialRequests = "",
    } = req.body;

    const tripId = bodyTripId;

    if (!busId || !tripId) {
      return errorResponse(res, 400, "Bus ID and Trip ID are required");
    }

    if (!isValidId(busId) || !isValidId(tripId)) {
      return errorResponse(res, 400, "Invalid Bus ID or Trip ID");
    }

    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return errorResponse(res, 400, "Please select at least one seat");
    }

    if (new Set(seatNumbers).size !== seatNumbers.length) {
      return errorResponse(res, 400, "Duplicate seat numbers are not allowed");
    }

    if (!Array.isArray(passengers) || passengers.length !== seatNumbers.length) {
      return errorResponse(
        res,
        400,
        "Provide exactly one passenger for each selected seat"
      );
    }

    const customer = {
      name: req.user?.fullname || req.body.customer?.name || "",
      email: req.user?.email || req.body.customer?.email || "",
      phone: req.user?.phone || req.body.customer?.phone || "",
    };

    if (!customer.name.trim() || !customer.phone.trim()) {
      return errorResponse(res, 400, "Customer name and phone are required");
    }

    if (!["ONLINE", "COD", "PAY_AT_BUS"].includes(paymentMethod)) {
      return errorResponse(res, 400, "Invalid payment method");
    }

    for (const passenger of passengers) {
      if (
        !passenger.name?.trim() ||
        !Number.isFinite(Number(passenger.age)) ||
        Number(passenger.age) < 0 ||
        !["MALE", "FEMALE", "OTHER"].includes(passenger.gender) ||
        !passenger.seatNo
      ) {
        return errorResponse(res, 400, "Invalid passenger details");
      }
    }

    const passengerSeats = passengers.map((p) => String(p.seatNo));
    const requestedSeats = seatNumbers.map(String);

    if (
      new Set(passengerSeats).size !== passengerSeats.length ||
      requestedSeats.some((seat) => !passengerSeats.includes(seat)) ||
      passengerSeats.some((seat) => !requestedSeats.includes(seat))
    ) {
      return errorResponse(
        res,
        400,
        "Passenger seat numbers must match the selected seats"
      );
    }

    const [bus, trip] = await Promise.all([
      Bus.findById(busId),
      BusTrip.findById(tripId),
    ]);

    if (!bus) return errorResponse(res, 404, "Bus not found");
    if (!trip) return errorResponse(res, 404, "Bus trip not found");

    if (String(trip.bus) !== String(bus._id)) {
      return errorResponse(res, 400, "Selected trip does not belong to this bus");
    }

    if (bus.status !== "approved" || bus.isActive !== true) {
      return errorResponse(res, 400, "Bus is not available for booking");
    }

    if (trip.status !== "SCHEDULED" || trip.isActive === false) {
      return errorResponse(res, 400, "This trip is not open for booking");
    }

    const tripDate = new Date(trip.travelDate);
    if (
      Number.isNaN(tripDate.getTime()) ||
      tripDate < new Date(new Date().setHours(0, 0, 0, 0))
    ) {
      return errorResponse(res, 400, "This trip date is not available");
    }

    // If the trip model has blockedSeats, prevent booking those seats too.
    const blockedSeats = (trip.blockedSeats || []).map(String);
    const blockedRequested = requestedSeats.filter((s) => blockedSeats.includes(s));

    if (blockedRequested.length) {
      return errorResponse(
        res,
        400,
        `Seats blocked: ${blockedRequested.join(", ")}`
      );
    }

    // Calculate fare from server-side bus pricing, never from client prices.
    const seatPrices = new Map(
      (bus.seatPrice || []).map((s) => [
        String(s.seatNo),
        Number(s.price || 0),
      ])
    );

    const defaultFare = Number(trip.basePrice ?? bus.finalPrice ?? bus.price ?? 0);

    const fareBySeat = {};
    for (const seat of requestedSeats) {
      const fare = seatPrices.has(seat) ? seatPrices.get(seat) : defaultFare;

      if (!Number.isFinite(fare) || fare < 0) {
        return errorResponse(res, 400, `Invalid fare for seat ${seat}`);
      }

      fareBySeat[seat] = fare;
    }

    const totalAmount = requestedSeats.reduce(
      (sum, seat) => sum + fareBySeat[seat],
      0
    );

    // Atomically reserve seats on THIS trip to reduce double-booking risk.
    const updatedTrip = await BusTrip.findOneAndUpdate(
      {
        _id: trip._id,
        bus: bus._id,
        status: "SCHEDULED",
        bookedSeats: { $nin: requestedSeats },
        blockedSeats: { $nin: requestedSeats },
        availableSeats: { $gte: requestedSeats.length },
      },
      {
        $addToSet: { bookedSeats: { $each: requestedSeats } },
        $inc: { availableSeats: -requestedSeats.length },
      },
      { new: true }
    );

    if (!updatedTrip) {
      return errorResponse(
        res,
        409,
        "One or more seats are no longer available. Refresh and select again."
      );
    }

    lockedTrip = updatedTrip;
    lockedSeats = requestedSeats;

    const bookingPassengers = passengers.map((p) => ({
      name: p.name.trim(),
      age: Number(p.age),
      gender: p.gender,
      seatNo: String(p.seatNo),
      seatPrice: fareBySeat[String(p.seatNo)],
      idType: p.idType || "",
      idNumber: p.idNumber || "",
    }));

    const booking = await BusBooking.create({
      vendor: trip.vendor || bus.vendor,
      bus: bus._id,
      trip: trip._id,
      user: req.user?._id || null,

      fromCity: trip.fromCity || bus.fromCity,
      toCity: trip.toCity || bus.toCity,
      travelDate: travelDate || journeyDate || trip.travelDate,

      departureDateTime: trip.departureDateTime || null,
      arrivalDateTime: trip.arrivalDateTime || null,

      contactName: customer.name,
      contactEmail: customer.email,
      contactPhone: customer.phone,

      passengers: bookingPassengers,
      seatNumbers: requestedSeats,

      boardingPoint: boardingPoint || {},
      droppingPoint: droppingPoint || {},

      pricing: {
        baseFare: totalAmount,
        seatFare: totalAmount,
        taxAmount: 0,
        serviceFee: 0,
        discount: 0,
        couponDiscount: 0,
        totalAmount,
        currency: "INR",
      },

      paymentMethod,
      paymentStatus: "PENDING",
      bookingStatus: "PENDING",
      specialRequests,
    });

    lockedTrip = null; // Booking saved; do not roll back seats.
    lockedSeats = [];

    return res.status(201).json({
      success: true,
      message: "Bus booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("createBusBooking error:", error);

    // Release reserved seats if creating the booking failed.
    if (lockedTrip && lockedSeats.length) {
      try {
        await BusTrip.updateOne(
          { _id: lockedTrip._id },
          {
            $pull: { bookedSeats: { $in: lockedSeats } },
            $inc: { availableSeats: lockedSeats.length },
          }
        );
      } catch (rollbackError) {
        console.error("Seat rollback failed:", rollbackError);
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create bus booking",
    });
  }
};

/* ========================= GET ALL BOOKINGS (ADMIN) ========================= */

exports.getAllBusBookings = async (req, res) => {
  try {
    const bookings = await BusBooking.find()
      .populate("bus")
      .populate("trip")
      .populate("vendor", "name email phone")
      .populate("user", "fullname email phone")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("getAllBusBookings error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ========================= VENDOR BOOKINGS ========================= */

exports.getVendorBusBookings = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return errorResponse(res, 401, "Vendor authentication required");

    const bookings = await BusBooking.find({ vendor: vendorId })
      .populate("bus")
      .populate("trip")
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("getVendorBusBookings error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ========================= GET SINGLE BOOKING ========================= */

exports.getBusBookingById = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return errorResponse(res, 401, "Vendor authentication required");

    const booking = await BusBooking.findOne({
      _id: req.params.id,
      vendor: vendorId,
    })
      .populate("bus")
      .populate("trip")
      .populate("vendor", "name email phone")
      .populate("user", "fullname email phone");

    if (!booking) return errorResponse(res, 404, "Booking not found");

    return res.json({ success: true, booking });
  } catch (error) {
    console.error("getBusBookingById error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ========================= CONFIRM BOOKING ========================= */

exports.confirmBusBooking = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return errorResponse(res, 401, "Vendor authentication required");

    const booking = await BusBooking.findOne({
      _id: req.params.id,
      vendor: vendorId,
    });

    if (!booking) return errorResponse(res, 404, "Booking not found");
    if (booking.bookingStatus === "CANCELLED") {
      return errorResponse(res, 400, "Cancelled booking cannot be confirmed");
    }
    if (booking.bookingStatus === "FAILED") {
      return errorResponse(res, 400, "Failed booking cannot be confirmed");
    }

    booking.bookingStatus = "CONFIRMED";
    await booking.save();

    return res.json({
      success: true,
      message: "Bus booking confirmed successfully",
      booking,
    });
  } catch (error) {
    console.error("confirmBusBooking error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ========================= CANCEL BOOKING ========================= */

exports.cancelBusBooking = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return errorResponse(res, 401, "Vendor authentication required");

    const { cancellationReason } = req.body;

    // Atomic status change prevents two cancellation requests releasing seats twice.
    const booking = await BusBooking.findOneAndUpdate(
      {
        _id: req.params.id,
        vendor: vendorId,
        bookingStatus: { $ne: "CANCELLED" },
      },
      {
        $set: {
          bookingStatus: "CANCELLED",
          cancellationReason: cancellationReason || "Cancelled by vendor",
          cancelledAt: new Date(),
          cancelledBy: "VENDOR",
        },
      },
      { new: true }
    );

    if (!booking) {
      const existing = await BusBooking.findOne({
        _id: req.params.id,
        vendor: vendorId,
      });

      if (!existing) return errorResponse(res, 404, "Booking not found");
      return errorResponse(res, 400, "Booking is already cancelled");
    }

    // Release seats on the associated trip, not on the fleet bus document.
    const trip = await BusTrip.findById(booking.trip);

    if (trip) {
      const seatsToRelease = booking.seatNumbers.filter((seat) =>
        (trip.bookedSeats || []).map(String).includes(String(seat))
      );

      if (seatsToRelease.length) {
        await BusTrip.updateOne(
          { _id: trip._id },
          {
            $pull: { bookedSeats: { $in: seatsToRelease } },
            $inc: { availableSeats: seatsToRelease.length },
          }
        );
      }
    }

    return res.json({
      success: true,
      message: "Bus booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("cancelBusBooking error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
