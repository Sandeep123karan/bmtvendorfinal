const express = require("express");

const router = express.Router();

const userAuth = require(
  "../middleware/userAuth.middleware"
);

const {
  createNightClubEventBooking,
  getMyNightClubEventBookings,
  getNightClubEventBookingById,
  cancelNightClubEventBooking,
} = require(
  "../controllers/nightclubEventBooking.controller"
);

// =====================================================
// CREATE BOOKING
// =====================================================

router.post(
  "/",
  userAuth,
  createNightClubEventBooking
);

// =====================================================
// MY BOOKINGS
// =====================================================

router.get(
  "/my-bookings",
  userAuth,
  getMyNightClubEventBookings
);

// =====================================================
// SINGLE BOOKING
// =====================================================

router.get(
  "/:id",
  userAuth,
  getNightClubEventBookingById
);

// =====================================================
// CANCEL BOOKING
// =====================================================

router.patch(
  "/:id/cancel",
  userAuth,
  cancelNightClubEventBooking
);

module.exports = router;