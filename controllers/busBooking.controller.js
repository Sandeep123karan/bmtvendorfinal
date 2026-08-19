const BusBooking = require("../models/BusBooking.model");
const Bus = require("../models/Bus.model");

/* =========================================================
   CREATE BUS BOOKING
========================================================= */

exports.createBusBooking = async (req, res) => {
  try {
    const {
      busId,
      user,
      customer,
      passengers,
      boardingPoint,
      droppingPoint,
      journeyDate,
      seatNumbers,
      paymentMethod,
      specialRequests,
    } = req.body;

    if (!busId) {
      return res.status(400).json({
        success: false,
        message: "Bus ID is required",
      });
    }

    if (!customer?.name || !customer?.phone) {
      return res.status(400).json({
        success: false,
        message: "Customer name and phone are required",
      });
    }

    if (!seatNumbers || seatNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one seat",
      });
    }

    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    if (bus.status !== "approved" || !bus.isActive) {
      return res.status(400).json({
        success: false,
        message: "Bus is not available for booking",
      });
    }

    // Check already booked seats
    const alreadyBooked = seatNumbers.filter((seat) =>
      bus.bookedSeats.includes(seat)
    );

    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats already booked: ${alreadyBooked.join(", ")}`,
      });
    }

    // Check blocked seats
    const blockedSeats = seatNumbers.filter((seat) =>
      bus.blockedSeats.includes(seat)
    );

    if (blockedSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats blocked: ${blockedSeats.join(", ")}`,
      });
    }

    // Calculate amount
    let totalAmount = 0;

    seatNumbers.forEach((seatNo) => {
      const seat = bus.seatPrice.find(
        (item) => item.seatNo === seatNo
      );

      totalAmount += seat
        ? Number(seat.price || 0)
        : Number(bus.price || 0);
    });

    const bookingId = `BUS${Date.now()}${Math.floor(
      Math.random() * 1000
    )}`;

    const booking = await BusBooking.create({
      bookingId,
      bus: bus._id,
      vendor: bus.vendor,

      user: user || null,

      customer: {
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone,
      },

      passengers: passengers || [],

      fromCity: bus.fromCity,
      toCity: bus.toCity,

      journeyDate: journeyDate || bus.travelDate,

      boardingPoint: boardingPoint || {},
      droppingPoint: droppingPoint || {},

      seatNumbers,

      totalSeatsBooked: seatNumbers.length,

      pricing: {
        baseFare: totalAmount,
        totalAmount,
        currency: "INR",
      },

      paymentMethod: paymentMethod || "ONLINE",

      paymentStatus: "PENDING",

      bookingStatus: "PENDING",

      specialRequests: specialRequests || "",
    });

    // Block/book seats temporarily
    bus.bookedSeats.push(...seatNumbers);

    bus.availableSeats = Math.max(
      0,
      bus.availableSeats - seatNumbers.length
    );

    await bus.save();

    res.status(201).json({
      success: true,
      message: "Bus booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("createBusBooking error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   GET ALL BUS BOOKINGS - ADMIN
========================================================= */

exports.getAllBusBookings = async (req, res) => {
  try {
    const bookings = await BusBooking.find()
      .populate("bus")
      .populate("vendor", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("getAllBusBookings error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   GET VENDOR BUS BOOKINGS
========================================================= */

exports.getVendorBusBookings = async (req, res) => {
  try {
    const bookings = await BusBooking.find({
      vendor: req.vendor._id,
    })
      .populate("bus")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("getVendorBusBookings error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   GET SINGLE BUS BOOKING
========================================================= */

exports.getBusBookingById = async (req, res) => {
  try {
    const booking = await BusBooking.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    })
      .populate("bus")
      .populate("vendor", "name email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("getBusBookingById error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   CONFIRM BUS BOOKING
========================================================= */

exports.confirmBusBooking = async (req, res) => {
  try {
    const booking = await BusBooking.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.bookingStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled booking cannot be confirmed",
      });
    }

    booking.bookingStatus = "CONFIRMED";

    await booking.save();

    res.json({
      success: true,
      message: "Bus booking confirmed successfully",
      booking,
    });
  } catch (error) {
    console.error("confirmBusBooking error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   CANCEL BUS BOOKING
========================================================= */

exports.cancelBusBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await BusBooking.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.bookingStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    booking.bookingStatus = "CANCELLED";
    booking.cancellationReason =
      cancellationReason || "Cancelled by vendor";

    booking.cancelledAt = new Date();
    booking.cancelledBy = "VENDOR";

    await booking.save();

    // Release seats
    const bus = await Bus.findById(booking.bus);

    if (bus) {
      bus.bookedSeats = bus.bookedSeats.filter(
        (seat) => !booking.seatNumbers.includes(seat)
      );

      bus.availableSeats += booking.seatNumbers.length;

      if (bus.availableSeats > bus.totalSeats) {
        bus.availableSeats = bus.totalSeats;
      }

      await bus.save();
    }

    res.json({
      success: true,
      message: "Bus booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("cancelBusBooking error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};