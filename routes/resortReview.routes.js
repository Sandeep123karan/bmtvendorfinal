const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createReview,
  getVendorReviews,
  getReviewById,
  replyToReview,
  getReviewSummary,
} = require("../controllers/resortReview.controller");


/* ==========================================
   PUBLIC / USER SIDE
   Later user authentication laga sakte hain
========================================== */

router.post("/", createReview);


/* ==========================================
   VENDOR PANEL
========================================== */

router.use(protect);


// Review list
router.get("/", getVendorReviews);


// Resort review statistics
router.get(
  "/summary/:resortId",
  getReviewSummary
);


// Single review
router.get("/:id", getReviewById);


// Vendor reply
router.put("/:id/reply", replyToReview);


module.exports = router;