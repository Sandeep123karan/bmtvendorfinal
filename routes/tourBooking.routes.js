const express = require("express");

const router = express.Router();

// ==========================================================
// MIDDLEWARE
// ==========================================================

const protect = require("../middleware/auth.middleware");
const userAuth = require("../middleware/userAuth.middleware");

// ==========================================================
// CONTROLLER
// ==========================================================

const {
  // Customer
  createBooking,
  getCustomerBookings,
  getCustomerBookingById,
  cancelCustomerBooking,

  // Vendor
  getVendorBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  updateVendorNote,
  deleteBooking,
} = require("../controllers/tourBooking.controller");


// ==========================================================
// CUSTOMER ROUTES
// ==========================================================

// CREATE TOUR BOOKING
// POST /api/customer/tour-bookings

router.post(
  "/customer",
  userAuth,
  createBooking
);


// GET MY ALL TOUR BOOKINGS
// GET /api/customer/tour-bookings/customer

router.get(
  "/customer",
  userAuth,
  getCustomerBookings
);


// GET MY SINGLE TOUR BOOKING
// GET /api/customer/tour-bookings/customer/:id

router.get(
  "/customer/:id",
  userAuth,
  getCustomerBookingById
);


// CANCEL MY TOUR BOOKING
// PATCH /api/customer/tour-bookings/customer/:id/cancel

router.patch(
  "/customer/:id/cancel",
  userAuth,
  cancelCustomerBooking
);


// ==========================================================
// VENDOR ROUTES
// ==========================================================

// GET ALL VENDOR BOOKINGS
// GET /api/vendor/tour-bookings

router.get(
  "/",
  protect,
  getVendorBookings
);


// GET SINGLE VENDOR BOOKING
// GET /api/vendor/tour-bookings/:id

router.get(
  "/:id",
  protect,
  getBookingById
);


// UPDATE BOOKING STATUS
// PATCH /api/vendor/tour-bookings/:id/status

router.patch(
  "/:id/status",
  protect,
  updateBookingStatus
);


// UPDATE PAYMENT STATUS
// PATCH /api/vendor/tour-bookings/:id/payment-status

router.patch(
  "/:id/payment-status",
  protect,
  updatePaymentStatus
);


// UPDATE VENDOR NOTE
// PATCH /api/vendor/tour-bookings/:id/note

router.patch(
  "/:id/note",
  protect,
  updateVendorNote
);


// DELETE BOOKING
// DELETE /api/vendor/tour-bookings/:id

router.delete(
  "/:id",
  protect,
  deleteBooking
);


// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;