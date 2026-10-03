// const express = require("express");

// const router = express.Router();

// const userAuth = require("../middleware/userAuth.middleware");
// const vendorAuth = require("../middleware/auth.middleware");

// const {
//   // USER
//   createDarshanBooking,
//   getMyDarshanBookings,
//   getDarshanBookingById,
//   cancelDarshanBooking,

//   // VENDOR
//   getVendorDarshanBookings,
//   getVendorDarshanBookingById,
//   updateVendorDarshanBookingStatus,
//   checkInDarshanBooking,
//   rejectDarshanBookingEntry,
//   getVendorDarshanBookingSummary,
// } = require("../controllers/darshanBooking.controller");

// // =====================================================
// // USER ROUTES
// // =====================================================

// router.post(
//   "/",
//   userAuth,
//   createDarshanBooking
// );

// router.get(
//   "/my-bookings",
//   userAuth,
//   getMyDarshanBookings
// );

// router.get(
//   "/:id",
//   userAuth,
//   getDarshanBookingById
// );

// router.patch(
//   "/:id/cancel",
//   userAuth,
//   cancelDarshanBooking
// );

// // =====================================================
// // VENDOR ROUTES
// // =====================================================

// router.get(
//   "/vendor/summary",
//   vendorAuth,
//   getVendorDarshanBookingSummary
// );

// router.get(
//   "/vendor",
//   vendorAuth,
//   getVendorDarshanBookings
// );

// router.get(
//   "/vendor/:id",
//   vendorAuth,
//   getVendorDarshanBookingById
// );

// router.patch(
//   "/vendor/:id/status",
//   vendorAuth,
//   updateVendorDarshanBookingStatus
// );

// router.patch(
//   "/vendor/:id/check-in",
//   vendorAuth,
//   checkInDarshanBooking
// );

// router.patch(
//   "/vendor/:id/reject-entry",
//   vendorAuth,
//   rejectDarshanBookingEntry
// );

// module.exports = router;

const express = require("express");
const router = express.Router();

const userAuth = require("../middleware/userAuth.middleware");
const vendorAuth = require("../middleware/auth.middleware");

const {
  createDarshanBooking,
  getMyDarshanBookings,
  getDarshanBookingById,
  cancelDarshanBooking,
  getVendorDarshanBookings,
  getVendorDarshanBookingById,
  updateVendorDarshanBookingStatus,
  checkInDarshanBooking,
  rejectDarshanBookingEntry,
  getVendorDarshanBookingSummary,
} = require("../controllers/darshanBooking.controller");

// ---------- USER (static paths) ----------
router.post("/", userAuth, createDarshanBooking);
router.get("/my-bookings", userAuth, getMyDarshanBookings);

// ---------- VENDOR (/:id se PEHLE) ----------
router.get("/vendor/summary", vendorAuth, getVendorDarshanBookingSummary);
router.get("/vendor", vendorAuth, getVendorDarshanBookings);
router.get("/vendor/:id", vendorAuth, getVendorDarshanBookingById);
router.patch("/vendor/:id/status", vendorAuth, updateVendorDarshanBookingStatus);
router.patch("/vendor/:id/check-in", vendorAuth, checkInDarshanBooking);
router.patch("/vendor/:id/reject-entry", vendorAuth, rejectDarshanBookingEntry);

// ---------- USER (dynamic, sabse last) ----------
router.get("/:id", userAuth, getDarshanBookingById);
router.patch("/:id/cancel", userAuth, cancelDarshanBooking);

module.exports = router;