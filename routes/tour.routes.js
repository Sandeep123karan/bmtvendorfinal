const express = require("express");

const router = express.Router();

// ==========================================================
// MIDDLEWARE
// ==========================================================
const protect = require("../middleware/auth.middleware");

// ==========================================================
// CONTROLLER
// ==========================================================
const {
  createTour,
  getVendorTours,
  getTourById,
  updateTour,
  deleteTour,
  toggleTourStatus,
} = require("../controllers/tour.controller");

// ==========================================================
// CREATE TOUR
// POST /api/vendor/tours
// ==========================================================
router.post(
  "/",
  protect,
  createTour
);

// ==========================================================
// GET ALL VENDOR TOURS
// GET /api/vendor/tours
// ==========================================================
router.get(
  "/",
  protect,
  getVendorTours
);

// ==========================================================
// GET SINGLE TOUR
// GET /api/vendor/tours/:id
// ==========================================================
router.get(
  "/:id",
  protect,
  getTourById
);

// ==========================================================
// UPDATE TOUR
// PUT /api/vendor/tours/:id
// ==========================================================
router.put(
  "/:id",
  protect,
  updateTour
);

// ==========================================================
// DELETE TOUR
// DELETE /api/vendor/tours/:id
// ==========================================================
router.delete(
  "/:id",
  protect,
  deleteTour
);

// ==========================================================
// TOGGLE ACTIVE / INACTIVE
// PATCH /api/vendor/tours/:id/toggle-status
// ==========================================================
router.patch(
  "/:id/toggle-status",
  protect,
  toggleTourStatus
);

module.exports = router;