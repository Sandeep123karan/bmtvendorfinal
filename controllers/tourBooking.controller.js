const mongoose = require("mongoose");

const TourBooking = require("../models/TourBooking");
const Tour = require("../models/Tour");
const User = require("../models/User.model");

// ==========================================================
// CREATE CUSTOMER BOOKING
// POST /api/customer/tour-bookings
// AUTH: USER
// ==========================================================

const createBooking = async (req, res) => {
  try {
    // ======================================================
    // LOGGED-IN USER
    // ======================================================

    const customerId = req.user?._id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // ======================================================
    // REQUEST BODY
    // ======================================================

    const {
      tourId,
      customerName,
      customerEmail,
      customerPhone,
      bookingDate,
      guests,
      pricing,
      paymentMethod,
      paymentStatus,
      razorpayOrderId,
      razorpayPaymentId,
      customerNote,
    } = req.body;

    // ======================================================
    // VALIDATE TOUR ID
    // ======================================================

    if (!tourId) {
      return res.status(400).json({
        success: false,
        message: "Tour ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Tour ID",
      });
    }

    // ======================================================
    // VALIDATE BOOKING DATE
    // ======================================================

    if (!bookingDate) {
      return res.status(400).json({
        success: false,
        message: "Booking date is required",
      });
    }

    const selectedDate = new Date(bookingDate);

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date",
      });
    }

    // ======================================================
    // GET USER
    // ======================================================

    const user = await User.findById(customerId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    // ======================================================
    // GET TOUR
    // ======================================================

    const tour = await Tour.findById(tourId);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    // ======================================================
    // CHECK TOUR ACTIVE
    // ======================================================

    if (tour.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "This tour is currently inactive",
      });
    }

    // ======================================================
    // CHECK VENDOR
    // ======================================================

    if (!tour.vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor is not assigned to this tour",
      });
    }

    // ======================================================
    // GUEST DETAILS
    // ======================================================

    const adults = Number(guests?.adults || 0);
    const children = Number(guests?.children || 0);
    const infants = Number(guests?.infants || 0);

    if (adults < 0 || children < 0 || infants < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid guest count",
      });
    }

    const totalGuests =
      adults +
      children +
      infants;

    if (totalGuests < 1) {
      return res.status(400).json({
        success: false,
        message: "At least one guest is required",
      });
    }

    // ======================================================
    // MAX GUEST CHECK
    // ======================================================

    if (
      tour.maxGuests &&
      totalGuests > Number(tour.maxGuests)
    ) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${tour.maxGuests} guests are allowed`,
      });
    }

    // ======================================================
    // TOUR PRICING
    // ======================================================

    const adultPrice = Number(
      tour.pricing?.adult || 0
    );

    const childPrice = Number(
      tour.pricing?.child || 0
    );

    const infantPrice = Number(
      tour.pricing?.infant || 0
    );

    // ======================================================
    // CALCULATE SUBTOTAL
    // ======================================================

    const subtotal =
      adults * adultPrice +
      children * childPrice +
      infants * infantPrice;

    // ======================================================
    // DISCOUNT
    // ======================================================

    const discount = Math.max(
      0,
      Number(pricing?.discount || 0)
    );

    // ======================================================
    // TAX
    // ======================================================

    const tax = Math.max(
      0,
      Number(pricing?.tax || 0)
    );

    // ======================================================
    // TOTAL
    // ======================================================

    const totalAmount = Math.max(
      0,
      subtotal - discount + tax
    );

    // ======================================================
    // CUSTOMER DETAILS
    // ======================================================

    const finalCustomerName =
      customerName?.trim() ||
      user.fullname;

    const finalCustomerEmail =
      customerEmail?.trim().toLowerCase() ||
      user.email;

    const finalCustomerPhone =
      customerPhone?.trim() ||
      user.phone;

    if (!finalCustomerName) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    if (!finalCustomerPhone) {
      return res.status(400).json({
        success: false,
        message: "Customer phone is required",
      });
    }

    // ======================================================
    // CREATE BOOKING
    // ======================================================

    const booking = await TourBooking.create({
      // Vendor comes from selected tour
      vendorId: tour.vendorId,

      // Selected tour
      tourId: tour._id,

      // Logged-in customer
      customerId: customerId,

      // Customer information
      customerName: finalCustomerName,
      customerEmail: finalCustomerEmail,
      customerPhone: finalCustomerPhone,

      // Travel date
      bookingDate: selectedDate,

      // Guests
      guests: {
        adults,
        children,
        infants,
        total: totalGuests,
      },

      // Pricing
      pricing: {
        adultPrice,
        childPrice,
        infantPrice,
        subtotal,
        discount,
        tax,
        totalAmount,
      },

      // Payment
      paymentMethod:
        paymentMethod || "ONLINE",

      paymentStatus:
        paymentStatus || "PENDING",

      razorpayOrderId:
        razorpayOrderId || undefined,

      razorpayPaymentId:
        razorpayPaymentId || undefined,

      // New booking always starts pending
      bookingStatus: "PENDING",

      // Customer note
      customerNote:
        customerNote?.trim() || "",
    });

    // ======================================================
    // POPULATE BOOKING
    // ======================================================

    const populatedBooking =
      await TourBooking.findById(booking._id)
        .populate(
          "tourId",
          "title category location duration images pricing"
        )
        .populate(
          "customerId",
          "fullname email phone image"
        );

    // ======================================================
    // SUCCESS RESPONSE
    // ======================================================

    return res.status(201).json({
      success: true,
      message: "Tour booking created successfully",
      booking: populatedBooking,
    });

  } catch (error) {
    console.error(
      "Create Tour Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create tour booking",
      error: error.message,
    });
  }
};


// ==========================================================
// GET ALL VENDOR BOOKINGS
// GET /api/vendor/tour-bookings
// AUTH: VENDOR
// ==========================================================

const getVendorBookings = async (req, res) => {
  try {
    const vendorId = req.user?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    const {
      status,
      paymentStatus,
      tourId,
      fromDate,
      toDate,
    } = req.query;

    const filter = {
      vendorId,
    };

    // ------------------------------------------------------
    // BOOKING STATUS
    // ------------------------------------------------------

    if (status) {
      filter.bookingStatus =
        status.toUpperCase();
    }

    // ------------------------------------------------------
    // PAYMENT STATUS
    // ------------------------------------------------------

    if (paymentStatus) {
      filter.paymentStatus =
        paymentStatus.toUpperCase();
    }

    // ------------------------------------------------------
    // TOUR FILTER
    // ------------------------------------------------------

    if (tourId) {
      if (!mongoose.Types.ObjectId.isValid(tourId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Tour ID",
        });
      }

      filter.tourId = tourId;
    }

    // ------------------------------------------------------
    // DATE FILTER
    // ------------------------------------------------------

    if (fromDate || toDate) {
      filter.bookingDate = {};

      if (fromDate) {
        const startDate = new Date(fromDate);

        if (Number.isNaN(startDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid fromDate",
          });
        }

        filter.bookingDate.$gte =
          startDate;
      }

      if (toDate) {
        const endDate = new Date(toDate);

        if (Number.isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid toDate",
          });
        }

        endDate.setHours(
          23,
          59,
          59,
          999
        );

        filter.bookingDate.$lte =
          endDate;
      }
    }

    // ------------------------------------------------------
    // GET BOOKINGS
    // ------------------------------------------------------

    const bookings =
      await TourBooking.find(filter)
        .populate(
          "tourId",
          "title category location duration images pricing"
        )
        .populate(
          "customerId",
          "fullname email phone image"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });

  } catch (error) {
    console.error(
      "Get Vendor Tour Bookings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tour bookings",
      error: error.message,
    });
  }
};


// ==========================================================
// GET SINGLE VENDOR BOOKING
// GET /api/vendor/tour-bookings/:id
// AUTH: VENDOR
// ==========================================================

const getBookingById = async (req, res) => {
  try {
    const vendorId = req.user?._id;
    const { id } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking =
      await TourBooking.findOne({
        _id: id,
        vendorId,
      })
        .populate(
          "tourId",
          "title category location duration images pricing"
        )
        .populate(
          "customerId",
          "fullname email phone image"
        );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });

  } catch (error) {
    console.error(
      "Get Tour Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};


// ==========================================================
// UPDATE BOOKING STATUS
// PATCH /api/vendor/tour-bookings/:id/status
// AUTH: VENDOR
// ==========================================================

const updateBookingStatus = async (req, res) => {
  try {
    const vendorId = req.user?._id;
    const { id } = req.params;
    const { bookingStatus } = req.body;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "CANCELLED",
      "COMPLETED",
      "REJECTED",
    ];

    if (!bookingStatus) {
      return res.status(400).json({
        success: false,
        message: "Booking status is required",
      });
    }

    const normalizedStatus =
      bookingStatus.toUpperCase();

    if (
      !allowedStatuses.includes(
        normalizedStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const booking =
      await TourBooking.findOne({
        _id: id,
        vendorId,
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.bookingStatus =
      normalizedStatus;

    if (
      normalizedStatus === "CANCELLED"
    ) {
      booking.cancelledAt =
        new Date();
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${normalizedStatus}`,
      booking,
    });

  } catch (error) {
    console.error(
      "Update Tour Booking Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update booking status",
      error: error.message,
    });
  }
};


// ==========================================================
// UPDATE PAYMENT STATUS
// PATCH /api/vendor/tour-bookings/:id/payment-status
// AUTH: VENDOR
// ==========================================================

const updatePaymentStatus = async (req, res) => {
  try {
    const vendorId = req.user?._id;
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const allowedStatuses = [
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
    ];

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required",
      });
    }

    const normalizedStatus =
      paymentStatus.toUpperCase();

    if (
      !allowedStatuses.includes(
        normalizedStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const booking =
      await TourBooking.findOne({
        _id: id,
        vendorId,
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.paymentStatus =
      normalizedStatus;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Payment status updated to ${normalizedStatus}`,
      booking,
    });

  } catch (error) {
    console.error(
      "Update Payment Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
};


// ==========================================================
// UPDATE VENDOR NOTE
// PATCH /api/vendor/tour-bookings/:id/note
// AUTH: VENDOR
// ==========================================================

const updateVendorNote = async (req, res) => {
  try {
    const vendorId = req.user?._id;
    const { id } = req.params;
    const { vendorNote } = req.body;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking =
      await TourBooking.findOne({
        _id: id,
        vendorId,
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.vendorNote =
      vendorNote?.trim() || "";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Vendor note updated successfully",
      booking,
    });

  } catch (error) {
    console.error(
      "Update Vendor Note Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update vendor note",
      error: error.message,
    });
  }
};


// ==========================================================
// DELETE BOOKING
// DELETE /api/vendor/tour-bookings/:id
// AUTH: VENDOR
// ==========================================================

const deleteBooking = async (req, res) => {
  try {
    const vendorId = req.user?._id;
    const { id } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking =
      await TourBooking.findOne({
        _id: id,
        vendorId,
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    await TourBooking.deleteOne({
      _id: id,
      vendorId,
    });

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });

  } catch (error) {
    console.error(
      "Delete Tour Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete booking",
      error: error.message,
    });
  }
};


// ==========================================================
// GET CUSTOMER BOOKINGS
// GET /api/customer/tour-bookings
// AUTH: USER
// ==========================================================

const getCustomerBookings = async (req, res) => {
  try {
    const customerId = req.user?._id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const bookings =
      await TourBooking.find({
        customerId,
      })
        .populate(
          "tourId",
          "title category location duration images pricing"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });

  } catch (error) {
    console.error(
      "Get Customer Tour Bookings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your bookings",
      error: error.message,
    });
  }
};


// ==========================================================
// GET CUSTOMER SINGLE BOOKING
// GET /api/customer/tour-bookings/:id
// AUTH: USER
// ==========================================================

const getCustomerBookingById = async (
  req,
  res
) => {
  try {
    const customerId = req.user?._id;
    const { id } = req.params;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking =
      await TourBooking.findOne({
        _id: id,
        customerId,
      })
        .populate(
          "tourId",
          "title category location duration images pricing"
        );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });

  } catch (error) {
    console.error(
      "Get Customer Tour Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};


// ==========================================================
// CANCEL CUSTOMER BOOKING
// PATCH /api/customer/tour-bookings/:id/cancel
// AUTH: USER
// ==========================================================

const cancelCustomerBooking = async (
  req,
  res
) => {
  try {
    const customerId = req.user?._id;
    const { id } = req.params;
    const {
      cancellationReason,
    } = req.body;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking =
      await TourBooking.findOne({
        _id: id,
        customerId,
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.bookingStatus ===
        "CANCELLED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    if (
      booking.bookingStatus ===
      "COMPLETED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Completed booking cannot be cancelled",
      });
    }

    booking.bookingStatus =
      "CANCELLED";

    booking.cancellationReason =
      cancellationReason?.trim() || "";

    booking.cancelledAt =
      new Date();

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });

  } catch (error) {
    console.error(
      "Cancel Customer Tour Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};


// ==========================================================
// EXPORTS
// ==========================================================

module.exports = {
  createBooking,

  getVendorBookings,
  getBookingById,

  updateBookingStatus,
  updatePaymentStatus,
  updateVendorNote,
  deleteBooking,

  getCustomerBookings,
  getCustomerBookingById,
  cancelCustomerBooking,
};