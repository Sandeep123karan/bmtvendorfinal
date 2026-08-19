const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  signup,
  login,
  getPendingVendors,
  approveVendor,
  rejectVendor,
  getVendorProfile,
} = require("../controllers/auth.controller");


/* ==========================================
   VENDOR AUTH / REGISTRATION
========================================== */

/*
  Common Registration for:
  - Car Rental Vendor
  - Bus Operator
  - Other Vendor Services

  POST /api/vendor/auth/signup
*/
router.post("/signup", signup);


/*
  Vendor Login

  POST /api/vendor/auth/login
*/
router.post("/login", login);


/* ==========================================
   VENDOR PROFILE
========================================== */

/*
  Get logged-in vendor profile

  GET /api/vendor/auth/profile
*/
router.get("/profile", protect, getVendorProfile);


/* ==========================================
   ADMIN - VENDOR APPROVAL
========================================== */

/*
  Get all pending vendors

  GET /api/vendor/auth/pending-vendors
*/
router.get("/pending-vendors", getPendingVendors);


/*
  Approve vendor

  PUT /api/vendor/auth/approve-vendor/:id
*/
router.put("/approve-vendor/:id", approveVendor);


/*
  Reject vendor

  PUT /api/vendor/auth/reject-vendor/:id
*/
router.put("/reject-vendor/:id", rejectVendor);


module.exports = router;