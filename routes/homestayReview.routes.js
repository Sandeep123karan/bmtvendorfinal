const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createReview,
  getHomestayReviews,
  getReviewById,
  getMyReviews,
  markHelpful,
  getVendorReviews,
  replyToReview,
  getAdminReviews,
  approveReview,
  rejectReview,
  hideReview,
} = require("../controllers/homestayReview.controller");


/* ============================================================
   USER
============================================================ */

// Create Review
router.post(
  "/",
  protect,
  createReview
);

// My Reviews
router.get(
  "/my-reviews",
  protect,
  getMyReviews
);

// Homestay Reviews
router.get(
  "/homestay/:homestayId",
  getHomestayReviews
);

// Single Review
router.get(
  "/:reviewId",
  getReviewById
);

// Helpful
router.post(
  "/:reviewId/helpful",
  protect,
  markHelpful
);


/* ============================================================
   VENDOR
============================================================ */

// Vendor Reviews
router.get(
  "/vendor",
  protect,
  getVendorReviews
);

// Vendor Reply
router.put(
  "/:reviewId/reply",
  protect,
  replyToReview
);


/* ============================================================
   ADMIN
============================================================ */

// All Reviews
router.get(
  "/admin",
  protect,
  getAdminReviews
);

// Approve
router.put(
  "/admin/:reviewId/approve",
  protect,
  approveReview
);

// Reject
router.put(
  "/admin/:reviewId/reject",
  protect,
  rejectReview
);

// Hide
router.put(
  "/admin/:reviewId/hide",
  protect,
  hideReview
);


module.exports = router;