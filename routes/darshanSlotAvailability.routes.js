// const express = require("express");
// const multer = require("multer");

// const router = express.Router();

// const protect = require("../middleware/auth.middleware");

// const {
//   createDarshanSlotAvailability,
//   getMyDarshanSlotAvailabilities,
//   getDarshanSlotAvailabilityById,
// } = require("../controllers/darshanSlotAvailability.controller");

// // No file upload required, only form-data fields
// const upload = multer();

// // =====================================================
// // CREATE
// // =====================================================

// router.post(
//   "/",
//   protect,
//   upload.none(),
//   createDarshanSlotAvailability
// );

// // =====================================================
// // GET MY AVAILABILITY
// // =====================================================

// router.get(
//   "/my-availability",
//   protect,
//   getMyDarshanSlotAvailabilities
// );

// // =====================================================
// // GET SINGLE
// // =====================================================

// router.get(
//   "/:id",
//   protect,
//   getDarshanSlotAvailabilityById
// );

// module.exports = router;
const express = require("express");
const multer = require("multer");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createDarshanSlotAvailability,
  getMyDarshanSlotAvailabilities,
  getDarshanSlotAvailabilityById,
  updateDarshanSlotAvailability,
  deleteDarshanSlotAvailability,
} = require("../controllers/darshanSlotAvailability.controller");

// Sirf text fields (form-data ya JSON), koi file upload nahi.
// upload.none() non-multipart (JSON) request ko seedha aage bhej deta hai.
const upload = multer();

// =====================================================
// CREATE
// POST /api/vendor/darshan-slot-availability
// =====================================================

router.post("/", protect, upload.none(), createDarshanSlotAvailability);

// =====================================================
// LIST (isko "/:id" se PEHLE rakhna zaroori hai)
// GET /api/vendor/darshan-slot-availability/my-availability
// =====================================================

router.get("/my-availability", protect, getMyDarshanSlotAvailabilities);

// =====================================================
// GET ONE
// GET /api/vendor/darshan-slot-availability/:id
// =====================================================

router.get("/:id", protect, getDarshanSlotAvailabilityById);

// =====================================================
// UPDATE
// PUT /api/vendor/darshan-slot-availability/:id
// =====================================================

router.put("/:id", protect, upload.none(), updateDarshanSlotAvailability);

// =====================================================
// DELETE
// DELETE /api/vendor/darshan-slot-availability/:id
// =====================================================

router.delete("/:id", protect, deleteDarshanSlotAvailability);

module.exports = router;