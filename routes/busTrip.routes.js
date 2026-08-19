const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");


const {
  createBusTrip,
  getVendorTrips,
  getTripById,
  updateTrip,
  cancelTrip,
  deleteTrip,
} = require("../controllers/busTrip.controller");


/* CREATE TRIP */
router.post(
  "/",
  protect,
  createBusTrip
);


/* GET VENDOR TRIPS */
router.get(
  "/vendor",
  protect,
  getVendorTrips
);


/* GET SINGLE TRIP */
router.get(
  "/:id",
  protect,
  getTripById
);


/* UPDATE TRIP */
router.put(
  "/:id",
  protect,
  updateTrip
);


/* CANCEL TRIP */
router.patch(
  "/:id/cancel",
  protect,
  cancelTrip
);


/* DELETE TRIP */
router.delete(
  "/:id",
  protect,
  deleteTrip
);


module.exports = router;