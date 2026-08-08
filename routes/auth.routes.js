

const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware"); // apna middleware

const {
  signup,
  login,
  getPendingVendors,
  approveVendor,
  rejectVendor,
  getVendorProfile,
} = require("../controllers/auth.controller");

/* ==========================
        Vendor Auth
========================== */

router.post("/signup", signup);
router.post("/login", login);

// Vendor Profile
router.get("/profile", protect, getVendorProfile);

/* ==========================
        Admin
========================== */

router.get("/pending-vendors", getPendingVendors);
router.put("/approve-vendor/:id", approveVendor);
router.put("/reject-vendor/:id", rejectVendor);

module.exports = router;