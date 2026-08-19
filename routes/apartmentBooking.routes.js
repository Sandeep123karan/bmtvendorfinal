const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createBooking,
  getVendorBookings,
  getBookingById,
} = require("../controllers/ApartmentBooking.controller");


// CREATE BOOKING
router.post(
  "/",
  protect,
  createBooking
);


// GET VENDOR BOOKINGS
router.get(
  "/vendor/my-bookings",
  protect,
  getVendorBookings
);


// GET SINGLE BOOKING
router.get(
  "/vendor/:id",
  protect,
  getBookingById
);


module.exports = router;