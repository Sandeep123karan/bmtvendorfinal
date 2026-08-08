// routes/homestayBooking.routes.js

const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createBooking,

  getMyBookings,
  getMyBookingById,

  getVendorBookings,
  getVendorBookingById,

  confirmBooking,
  rejectBooking,

  cancelBooking,

  checkIn,
  checkOut,

  completeBooking,
} = require("../controllers/homestayBooking.controller");


/* ============================================================
   USER / CUSTOMER BOOKING
============================================================ */

/*
   Create Homestay Booking

   POST
   /api/homestay-bookings
*/
router.post(
  "/",
  protect,
  createBooking
);


/*
   Get My Bookings

   GET
   /api/homestay-bookings/my-bookings
*/
router.get(
  "/my-bookings",
  protect,
  getMyBookings
);


/*
   Get Single My Booking

   GET
   /api/homestay-bookings/my-bookings/:bookingId
*/
router.get(
  "/my-bookings/:bookingId",
  protect,
  getMyBookingById
);


/*
   Cancel Booking

   PUT
   /api/homestay-bookings/:bookingId/cancel
*/
router.put(
  "/:bookingId/cancel",
  protect,
  cancelBooking
);


/* ============================================================
   VENDOR BOOKING MANAGEMENT
============================================================ */

/*
   Get Vendor Bookings

   GET
   /api/homestay-bookings/vendor
*/
router.get(
  "/vendor",
  protect,
  getVendorBookings
);


/*
   Get Vendor Single Booking

   GET
   /api/homestay-bookings/vendor/:bookingId
*/
router.get(
  "/vendor/:bookingId",
  protect,
  getVendorBookingById
);


/*
   Confirm Booking

   PUT
   /api/homestay-bookings/vendor/:bookingId/confirm
*/
router.put(
  "/vendor/:bookingId/confirm",
  protect,
  confirmBooking
);


/*
   Reject Booking

   PUT
   /api/homestay-bookings/vendor/:bookingId/reject
*/
router.put(
  "/vendor/:bookingId/reject",
  protect,
  rejectBooking
);


/*
   Check-In Guest

   PUT
   /api/homestay-bookings/vendor/:bookingId/check-in
*/
router.put(
  "/vendor/:bookingId/check-in",
  protect,
  checkIn
);


/*
   Check-Out Guest

   PUT
   /api/homestay-bookings/vendor/:bookingId/check-out
*/
router.put(
  "/vendor/:bookingId/check-out",
  protect,
  checkOut
);


/*
   Complete Booking

   PUT
   /api/homestay-bookings/vendor/:bookingId/complete
*/
router.put(
  "/vendor/:bookingId/complete",
  protect,
  completeBooking
);


/* ============================================================
   EXPORT
============================================================ */

module.exports = router;