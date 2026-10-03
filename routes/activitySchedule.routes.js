const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createActivitySchedule,
  getVendorActivitySchedules,
  getActivityScheduleById,
  updateActivitySchedule,
  deleteActivitySchedule,
  toggleActivitySchedule,
} = require("../controllers/activitySchedule.controller");

// Create
router.post(
  "/",
  protect,
  createActivitySchedule
);

// Get all vendor schedules
router.get(
  "/",
  protect,
  getVendorActivitySchedules
);

// Get single schedule
router.get(
  "/:id",
  protect,
  getActivityScheduleById
);

// Update
router.put(
  "/:id",
  protect,
  updateActivitySchedule
);

// Delete
router.delete(
  "/:id",
  protect,
  deleteActivitySchedule
);

// Toggle
router.patch(
  "/:id/toggle",
  protect,
  toggleActivitySchedule
);

module.exports = router;