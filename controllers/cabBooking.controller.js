const CabBooking = require("../models/CabBooking.model");
const Cab = require("../models/Cab.model");

/* =========================================================
   CREATE CAB BOOKING
========================================================= */
exports.createBooking = async (req, res) => {
  try {
    const {
      cabId,
      userId,
      customer,
      tripType,
      fromCity,
      toCity,
      pickupAddress,
      dropAddress,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      passengers,
      paymentMethod,
      specialRequests,
      pricing,
    } = req.body;

    // Validation
    if (!cabId) {
      return res.status(400).json({
        success: false,
        message: "Cab ID is required",
      });
    }

    const cab = await Cab.findById(cabId);

    if (!cab) {
      return res.status(404).json({
        success: false,
        message: "Cab not found",
      });
    }

    if (!cab.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cab is currently not available",
      });
    }

    // Booking ID
    const bookingId = `CAB${Date.now()}${Math.floor(
      100 + Math.random() * 900
    )}`;

    const booking = await CabBooking.create({
      bookingId,

      cab: cab._id,
      vendor: cab.vendor,

      user: userId || null,

      customer: {
        name: customer?.name || "",
        email: customer?.email || "",
        phone: customer?.phone || "",
      },

      tripType: tripType || "ONE_WAY",

      fromCity: fromCity || cab.fromCity,
      toCity: toCity || cab.toCity,

      pickupAddress: pickupAddress || "",
      dropAddress: dropAddress || "",

      pickupDate: pickupDate || null,
      pickupTime: pickupTime || "",

      returnDate: returnDate || null,
      returnTime: returnTime || "",

      passengers: passengers || [],

      totalPassengers:
        passengers?.length > 0 ? passengers.length : 1,

      pricing: {
        baseFare: pricing?.baseFare || cab.price || 0,
        driverAllowance: pricing?.driverAllowance || 0,
        tollCharges: pricing?.tollCharges || 0,
        stateTax: pricing?.stateTax || 0,
        gstPercentage: pricing?.gstPercentage || 0,
        gstAmount: pricing?.gstAmount || 0,
        discount: pricing?.discount || 0,
        totalAmount:
          pricing?.totalAmount || cab.price || 0,
        currency: "INR",
      },

      paymentMethod: paymentMethod || "ONLINE",

      bookingStatus: "PENDING",

      specialRequests: specialRequests || "",
    });

    res.status(201).json({
      success: true,
      message: "Cab booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("createBooking error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   GET LOGGED-IN VENDOR BOOKINGS
========================================================= */
exports.getVendorBookings = async (req, res) => {
  try {
    const bookings = await CabBooking.find({
      vendor: req.vendor._id,
    })
      .populate("cab")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("getVendorBookings error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   GET SINGLE BOOKING
========================================================= */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await CabBooking.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    }).populate("cab");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("getBookingById error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   CONFIRM BOOKING
========================================================= */
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await CabBooking.findOne({
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
      message: "Booking confirmed successfully",
      booking,
    });
  } catch (error) {
    console.error("confirmBooking error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   ASSIGN DRIVER
========================================================= */
exports.assignDriver = async (req, res) => {
  try {
    const {
      name,
      phone,
      vehicleNumber,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Driver name and phone are required",
      });
    }

    const booking = await CabBooking.findOne({
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
        message: "Cannot assign driver to cancelled booking",
      });
    }

    booking.driverDetails = {
      name,
      phone,
      vehicleNumber: vehicleNumber || "",
      assignedAt: new Date(),
    };

    booking.bookingStatus = "DRIVER_ASSIGNED";

    await booking.save();

    res.json({
      success: true,
      message: "Driver assigned successfully",
      booking,
    });
  } catch (error) {
    console.error("assignDriver error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   START TRIP
========================================================= */
exports.startTrip = async (req, res) => {
  try {
    const booking = await CabBooking.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.bookingStatus !== "DRIVER_ASSIGNED" &&
      booking.bookingStatus !== "CONFIRMED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Booking must be confirmed before starting trip",
      });
    }

    booking.bookingStatus = "STARTED";

    await booking.save();

    res.json({
      success: true,
      message: "Trip started successfully",
      booking,
    });
  } catch (error) {
    console.error("startTrip error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   COMPLETE TRIP
========================================================= */
exports.completeTrip = async (req, res) => {
  try {
    const booking = await CabBooking.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.bookingStatus !== "STARTED") {
      return res.status(400).json({
        success: false,
        message: "Trip must be started before completing",
      });
    }

    booking.bookingStatus = "COMPLETED";

    await booking.save();

    res.json({
      success: true,
      message: "Trip completed successfully",
      booking,
    });
  } catch (error) {
    console.error("completeTrip error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =========================================================
   CANCEL BOOKING
========================================================= */
exports.cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await CabBooking.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.bookingStatus === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Completed booking cannot be cancelled",
      });
    }

    if (booking.bookingStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Booking already cancelled",
      });
    }

    booking.bookingStatus = "CANCELLED";
    booking.cancellationReason =
      cancellationReason || "";
    booking.cancelledBy = "VENDOR";
    booking.cancelledAt = new Date();

    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("cancelBooking error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};