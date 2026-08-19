const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createBusBooking,
  getAllBusBookings,
  getVendorBusBookings,
  getBusBookingById,
  confirmBusBooking,
  cancelBusBooking,
} = require("../controllers/BusBooking.controller");


/* =========================================================
   PUBLIC / USER BOOKING
========================================================= */

// Create Bus Booking
router.post("/", createBusBooking);


/* =========================================================
   VENDOR ROUTES
========================================================= */

// Get logged-in vendor bookings
router.get(
  "/vendor/my-bookings",
  protect,
  getVendorBusBookings
);

// Get single booking
router.get(
  "/:id",
  protect,
  getBusBookingById
);

// Confirm booking
router.patch(
  "/:id/confirm",
  protect,
  confirmBusBooking
);

// Cancel booking
router.patch(
  "/:id/cancel",
  protect,
  cancelBusBooking
);


/* =========================================================
   ADMIN / ALL BOOKINGS
   फिलहाल बिना middleware रखा है
========================================================= */

// Get all bookings
router.get("/", getAllBusBookings);


module.exports = router;