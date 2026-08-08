// routes/hotelBooking.routes.js

const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const upload = require("../utils/upload");

const {
  bookHotel,
  getUserHotelBookings,
  getSingleBooking,
  getVendorHotelBookings,
  confirmBooking,
  rejectBooking,
  cancelBooking,
  checkInBooking,
  checkOutBooking,
} = require("../controllers/hotelBooking.controller");

/* =====================================================
                    USER ROUTES
===================================================== */

// Book Hotel
router.post(
  "/book",
  
  upload.fields([
    { name: "idProofFront", maxCount: 10 },
    { name: "idProofBack", maxCount: 10 },
  ]),
  bookHotel
);

// My Bookings
router.get(
  "/my-bookings",
  protect,
  getUserHotelBookings
);

// Single Booking
router.get(
  "/details/:bookingId",
  protect,
  getSingleBooking
);

// Cancel Booking


/* =====================================================
                  VENDOR ROUTES
===================================================== */

// Vendor All Bookings
router.get(
  "/vendor/bookings",
  protect,
  getVendorHotelBookings
);

// Confirm Booking


// Reject Booking


// Check In


// Check Out


module.exports = router;