const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createCruiseBooking,
  getMyCruiseBookings,
  getCruiseBookingById,
  cancelCruiseBooking,
} = require("../controllers/cruiseBooking.controller");

router.use(protect);

router.post(
  "/",
  createCruiseBooking
);

router.get(
  "/",
  getMyCruiseBookings
);

router.get(
  "/:id",
  getCruiseBookingById
);

router.patch(
  "/:id/cancel",
  cancelCruiseBooking
);

module.exports = router;