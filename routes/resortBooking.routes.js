const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
} = require("../controllers/resortBooking.controller");


router.use(protect);


// Create booking
router.post("/", createBooking);


// Get all bookings
router.get("/", getBookings);


// Get single booking
router.get("/:id", getBookingById);


// Update booking status
router.put("/:id/status", updateBookingStatus);


module.exports = router;