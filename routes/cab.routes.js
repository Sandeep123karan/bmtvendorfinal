const router = require("express").Router();

const protect = require("../middleware/auth.middleware");
const upload = require("../utils/upload");

const {
  addCab,
  getVendorCabs,
  getCabById,
  updateCab,
  deleteCab,
  toggleCabStatus,
  searchCabs,
} = require("../controllers/cab.controller");

/* =========================================================
   MULTER IMAGE FIELDS
========================================================= */

const cabUpload = upload.fields([
  { name: "image", maxCount: 1 },       // Main cab image
  { name: "gallery", maxCount: 10 },    // Cab gallery
]);

/* =========================================================
   PUBLIC ROUTES
   IMPORTANT: /search must come before /:id
========================================================= */

// Search cabs for user panel
router.get("/search", searchCabs);

/* =========================================================
   VENDOR ROUTES
========================================================= */

// Add new cab
router.post("/", protect, cabUpload, addCab);

// Get logged-in vendor's all cabs
router.get("/vendor/my-cabs", protect, getVendorCabs);

// Get single cab of logged-in vendor
router.get("/vendor/:id", protect, getCabById);

// Update cab
router.put("/vendor/:id", protect, cabUpload, updateCab);

// Delete cab
router.delete("/vendor/:id", protect, deleteCab);

// Activate / Deactivate cab
router.patch("/vendor/:id/toggle-status", protect, toggleCabStatus);

module.exports = router;