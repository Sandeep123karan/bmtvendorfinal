const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");

const {
  createPalace,
  getMyPalaces,
  getPalaceById,
  updatePalace,
  deletePalace,
  togglePalaceStatus,
} = require("../controllers/palaceController");


/* ==========================================
   APPLY VENDOR AUTH
========================================== */

router.use(protect);


/* ==========================================
   CREATE PALACE
   POST /api/palaces
========================================== */

router.post(
  "/",
  upload.any(),
  createPalace
);


/* ==========================================
   GET LOGGED-IN VENDOR PALACES
   GET /api/palaces
========================================== */

router.get(
  "/",
  getMyPalaces
);


/* ==========================================
   GET SINGLE PALACE
   GET /api/palaces/:id
========================================== */

router.get(
  "/:id",
  getPalaceById
);


/* ==========================================
   UPDATE PALACE
   PUT /api/palaces/:id
========================================== */

router.put(
  "/:id",
  upload.any(),
  updatePalace
);


/* ==========================================
   TOGGLE ACTIVE / INACTIVE
   PATCH /api/palaces/:id/toggle
========================================== */

router.patch(
  "/:id/toggle",
  togglePalaceStatus
);


/* ==========================================
   DELETE PALACE
   DELETE /api/palaces/:id
========================================== */

router.delete(
  "/:id",
  deletePalace
);


module.exports = router;