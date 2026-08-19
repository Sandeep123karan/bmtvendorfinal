const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  saveSeatLayout,
  getSeatLayoutByBus,
  getPublicSeatLayout,
  toggleSeatStatus,
} = require("../controllers/busSeatLayout.controller");


/* ==========================================
   PUBLIC
========================================== */

// IMPORTANT: public route first
router.get(
  "/public/:busId",
  getPublicSeatLayout
);


/* ==========================================
   VENDOR
========================================== */

// Create or update layout
router.post(
  "/",
  protect,
  saveSeatLayout
);

// Get own bus layout
router.get(
  "/bus/:busId",
  protect,
  getSeatLayoutByBus
);

// Block / unblock / maintenance
router.patch(
  "/seat-status",
  protect,
  toggleSeatStatus
);


module.exports = router;