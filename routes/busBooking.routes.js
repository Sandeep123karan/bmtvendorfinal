// const express = require("express");
// const router = express.Router();

// const protect = require("../middleware/auth.middleware");

// const {
//   createBusBooking,
//   getAllBusBookings,
//   getVendorBusBookings,
//   getBusBookingById,
//   confirmBusBooking,
//   cancelBusBooking,
// } = require("../controllers/BusBooking.controller");


// /* =========================================================
//    PUBLIC / USER BOOKING
// ========================================================= */

// // Create Bus Booking
// router.post("/", createBusBooking);


// /* =========================================================
//    VENDOR ROUTES
// ========================================================= */

// // Get logged-in vendor bookings
// router.get(
//   "/vendor/my-bookings",
//   protect,
//   getVendorBusBookings
// );

// // Get single booking
// router.get(
//   "/:id",
//   protect,
//   getBusBookingById
// );

// // Confirm booking
// router.patch(
//   "/:id/confirm",
//   protect,
//   confirmBusBooking
// );

// // Cancel booking
// router.patch(
//   "/:id/cancel",
//   protect,
//   cancelBusBooking
// );


// /* =========================================================
//    ADMIN / ALL BOOKINGS
//    फिलहाल बिना middleware रखा है
// ========================================================= */

// // Get all bookings
// router.get("/", getAllBusBookings);


// module.exports = router;


const express = require("express");
const router = express.Router();

const vendorAuth = require("../middleware/auth.middleware");
const userAuth = require("../middleware/userAuth.middleware");

const {
  createBusBooking,
  getAllBusBookings,
  getVendorBusBookings,
  getBusBookingById,
  confirmBusBooking,
  cancelBusBooking,
} = require("../controllers/BusBooking.controller");

/* CUSTOMER */
router.post("/", userAuth, createBusBooking);

/* VENDOR */
router.get("/vendor/my-bookings", vendorAuth, getVendorBusBookings);
router.get("/:id", vendorAuth, getBusBookingById);
router.patch("/:id/confirm", vendorAuth, confirmBusBooking);
router.patch("/:id/cancel", vendorAuth, cancelBusBooking);



module.exports = router;
