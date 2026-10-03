const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createSchedule,
  getVendorSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} = require("../controllers/tourSchedule.controller");


// ==========================================================
// TOUR SCHEDULE ROUTES
// ==========================================================

// Create schedule
router.post(
  "/",
  protect,
  createSchedule
);

// Get vendor schedules
router.get(
  "/",
  protect,
  getVendorSchedules
);

// Get single schedule
router.get(
  "/:id",
  protect,
  getScheduleById
);

// Update schedule
router.put(
  "/:id",
  protect,
  updateSchedule
);

// Delete schedule
router.delete(
  "/:id",
  protect,
  deleteSchedule
);


module.exports = router;