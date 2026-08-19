const express = require("express");

const router = express.Router();

const protect = require(
  "../middleware/auth.middleware"
);

const {
  getApartmentInventory,
  blockApartmentDates,
  unblockApartmentDates,
  getDateAvailability,
} = require(
  "../controllers/ApartmentInventory.controller"
);


router.use(protect);


// ==========================================
// INVENTORY CALENDAR
// ==========================================

router.get(
  "/:apartmentId",
  getApartmentInventory
);


// ==========================================
// BLOCK DATES
// ==========================================

router.post(
  "/:apartmentId/block",
  blockApartmentDates
);


// ==========================================
// UNBLOCK DATES
// ==========================================

router.post(
  "/:apartmentId/unblock",
  unblockApartmentDates
);


// ==========================================
// SINGLE DATE
// ==========================================

router.get(
  "/:apartmentId/date/:date",
  getDateAvailability
);


module.exports = router;