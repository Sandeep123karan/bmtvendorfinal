const express = require("express");

const router = express.Router();

const {
  createReview,
  getMyReviews,
  getMyReviewById,
  updateReview,
  deleteReview,
  getVendorReviews,
  getVendorReviewById,
  replyToReview,
} = require("../controllers/tourReview.controller");

const protect = require("../middleware/auth.middleware");

// ============================================================
// CUSTOMER ROUTES
// ============================================================

router.post("/customer", protect, createReview);

router.get("/customer", protect, getMyReviews);

router.get("/customer/:id", protect, getMyReviewById);

router.put("/customer/:id", protect, updateReview);

router.delete("/customer/:id", protect, deleteReview);

// ============================================================
// VENDOR ROUTES
// ============================================================

router.get("/vendor", protect, getVendorReviews);

router.get("/vendor/:id", protect, getVendorReviewById);

router.patch("/vendor/:id/reply", protect, replyToReview);

module.exports = router;