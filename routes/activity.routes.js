const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const upload = require("../middleware/upload");

const {
  createActivity,
  getVendorActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  toggleActivity,
} = require("../controllers/activity.controller");

// =====================================================
// CREATE ACTIVITY
// =====================================================

router.post(
  "/",
  protect,
  upload.array("images", 10),
  createActivity
);

// =====================================================
// GET VENDOR ACTIVITIES
// =====================================================

router.get(
  "/",
  protect,
  getVendorActivities
);

// =====================================================
// GET SINGLE ACTIVITY
// =====================================================

router.get(
  "/:id",
  protect,
  getActivityById
);

// =====================================================
// UPDATE ACTIVITY
// =====================================================

router.put(
  "/:id",
  protect,
  upload.array("images", 10),
  updateActivity
);

// =====================================================
// DELETE ACTIVITY
// =====================================================

router.delete(
  "/:id",
  protect,
  deleteActivity
);

// =====================================================
// TOGGLE ACTIVE / INACTIVE
// =====================================================

router.patch(
  "/:id/toggle",
  protect,
  toggleActivity
);

module.exports = router;