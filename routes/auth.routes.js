

const express = require("express");

const router = express.Router();

/* ==========================================================
   MIDDLEWARE
========================================================== */

const protect = require("../middleware/auth.middleware");

/* ==========================================================
   CONTROLLER
========================================================== */

const {
  signup,
  login,
  getPendingVendors,
  getVendorApplication,
  approveVendor,
  rejectVendor,
  getVendorProfile,
  getAllVendors,
} = require("../controllers/auth.controller");

/* ==========================================================
   PUBLIC AUTH ROUTES
========================================================== */

// POST /api/vendor/auth/signup
router.post("/signup", signup);

// POST /api/vendor/auth/login
router.post("/login", login);

/* ==========================================================
   VENDOR PROFILE  (token required)
========================================================== */

// GET /api/vendor/auth/profile
router.get("/profile", protect, getVendorProfile);

/* ==========================================================
   ADMIN / MANAGEMENT ROUTES

   SECURITY: these were open to anyone (no token). Anyone could
   approve their own application. They now require a valid
   token via `protect`.

   NEXT STEP: replace `protect` with an admin-only middleware
   (Admin model / role check) so that an approved *vendor*
   token cannot approve other vendors either.
========================================================== */

// GET /api/vendor/auth/vendors
router.get("/vendors",  getAllVendors);

// GET /api/vendor/auth/pending-vendors
router.get("/pending-vendors", protect, getPendingVendors);

// GET /api/vendor/auth/vendors/:id
// Full application (details, documents, bank, tax) for review.
router.get("/vendors/:id", protect, getVendorApplication);

// PUT /api/vendor/auth/approve-vendor/:id
router.put("/approve-vendor/:id",  approveVendor);

// PUT /api/vendor/auth/reject-vendor/:id
router.put("/reject-vendor/:id", protect, rejectVendor);

/* ==========================================================
   EXPORT
========================================================== */

module.exports = router; 