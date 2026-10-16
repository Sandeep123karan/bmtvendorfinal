const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  getBookingOptions,
  getQuote,
  getStats,
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  assignRoomUnit,
  addPayment,
  deleteBooking,
} = require("../controllers/resortBooking.controller");

router.use(protect);

/* IMPORTANT: fixed paths must stay ABOVE "/:id" routes */

// Dropdown data (resorts / rooms / rate plans / units)
router.get("/options", getBookingOptions);

// Dashboard numbers
router.get("/stats", getStats);

// Price preview (nothing is saved)
router.post("/quote", getQuote);

// Create booking
router.post("/", createBooking);

// List bookings (filters + pagination)
router.get("/", getBookings);

// Single booking
router.get("/:id", getBookingById);

// Edit guest details / notes
router.put("/:id", updateBooking);

// Change booking status (confirm, check-in, check-out, cancel, no-show)
router.put("/:id/status", updateBookingStatus);

// Assign or clear room unit
router.patch("/:id/room-unit", assignRoomUnit);

// Record a payment
router.post("/:id/payments", addPayment);

// Delete (cancelled / no-show only)
router.delete("/:id", deleteBooking);

module.exports = router;