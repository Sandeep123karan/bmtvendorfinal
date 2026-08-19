const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createBooking,
  getVendorBookings,
  getBookingById,
  confirmBooking,
  assignDriver,
  startTrip,
  completeTrip,
  cancelBooking,
} = require("../controllers/cabBooking.controller");


/* ================= USER ================= */

router.post("/", createBooking);


/* ================= VENDOR ================= */

router.get(
  "/vendor/my-bookings",
  protect,
  getVendorBookings
);

router.get(
  "/vendor/:id",
  protect,
  getBookingById
);

router.patch(
  "/vendor/:id/confirm",
  protect,
  confirmBooking
);

router.patch(
  "/vendor/:id/assign-driver",
  protect,
  assignDriver
);

router.patch(
  "/vendor/:id/start-trip",
  protect,
  startTrip
);

router.patch(
  "/vendor/:id/complete-trip",
  protect,
  completeTrip
);

router.patch(
  "/vendor/:id/cancel",
  protect,
  cancelBooking
);


module.exports = router;