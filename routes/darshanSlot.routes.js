const express = require("express");
const multer = require("multer");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createDarshanSlot,
  getMyDarshanSlots,
  getDarshanSlotById,
  updateDarshanSlot,
  deleteDarshanSlot,
} = require("../controllers/darshanSlot.controller");

// =====================================================
// MULTER
// =====================================================

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(
        new Error("Only image files are allowed"),
        false
      );
    }
  },
});

// =====================================================
// CREATE SLOT
// =====================================================

router.post(
  "/",
  protect,
  upload.none(),
  createDarshanSlot
);

// =====================================================
// GET MY SLOTS
// =====================================================

router.get(
  "/my-slots",
  protect,
  getMyDarshanSlots
);

// =====================================================
// GET SINGLE SLOT
// =====================================================

router.get(
  "/:id",
  protect,
  getDarshanSlotById
);

// =====================================================
// UPDATE SLOT
// =====================================================

router.put(
  "/:id",
  protect,
  upload.none(),
  updateDarshanSlot
);

// =====================================================
// DELETE SLOT
// =====================================================

router.delete(
  "/:id",
  protect,
  deleteDarshanSlot
);

module.exports = router;