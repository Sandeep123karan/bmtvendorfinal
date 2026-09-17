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
  approveVendor,
  rejectVendor,
  getVendorProfile,
  getAllVendors,
} = require("../controllers/auth.controller");

/* ==========================================================
   PUBLIC AUTH ROUTES
========================================================== */

/*
  POST
  /api/vendor/auth/signup
*/
router.post(
  "/signup",
  signup
);

/*
  POST
  /api/vendor/auth/login
*/
router.post(
  "/login",
  login
);

/* ==========================================================
   VENDOR PROFILE
========================================================== */

/*
  GET
  /api/vendor/auth/profile

  Token required.
*/
router.get(
  "/profile",
  protect,
  getVendorProfile
);

/* ==========================================================
   ADMIN / MANAGEMENT ROUTES

   IMPORTANT:
   Abhi inko kam se kam authentication ke peeche rakha hai.

   Next step me proper admin-role middleware lagayenge,
   taki normal vendor approve/reject na kar sake.
========================================================== */

/* ==============================
   GET ALL VENDORS
============================== */

router.get(
  "/vendors",

  getAllVendors
);

/* ==============================
   GET PENDING VENDORS
============================== */

router.get(
  "/pending-vendors",
  
  getPendingVendors
);

/* ==============================
   APPROVE VENDOR
============================== */

router.put(
  "/approve-vendor/:id",
 
  approveVendor
);

/* ==============================
   REJECT VENDOR
============================== */

router.put(
  "/reject-vendor/:id",
  protect,
  rejectVendor
);

/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;