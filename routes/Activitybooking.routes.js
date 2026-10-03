const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");        // VENDOR
const userAuth = require("../middleware/userAuth.middleware");   // CUSTOMER

const {
  getPublicActivities,
  getPublicActivityDetails,
  createActivityBooking,
  getMyActivityBookings,
  getMyActivityBookingById,
  cancelMyActivityBooking,
  getVendorActivityBookings,
  getVendorActivityBookingById,
  confirmActivityBooking,
  rejectActivityBooking,
  cancelActivityBookingByVendor,
  completeActivityBooking,
} = require("../controllers/activityBooking.controller");

// ---------- PUBLIC ----------
router.get("/public/activities", getPublicActivities);
router.get("/public/activities/:idOrSlug", getPublicActivityDetails);

// ---------- VENDOR ----------
router.get("/vendor", protect, getVendorActivityBookings);
router.get("/vendor/:id", protect, getVendorActivityBookingById);
router.patch("/vendor/:id/confirm", protect, confirmActivityBooking);
router.patch("/vendor/:id/reject", protect, rejectActivityBooking);
router.patch("/vendor/:id/cancel", protect, cancelActivityBookingByVendor);
router.patch("/vendor/:id/complete", protect, completeActivityBooking);

// ---------- USER ----------
router.get("/my", userAuth, getMyActivityBookings);
router.get("/my/:id", userAuth, getMyActivityBookingById);
router.patch("/my/:id/cancel", userAuth, cancelMyActivityBooking);
router.post("/", userAuth, createActivityBooking);

module.exports = router;