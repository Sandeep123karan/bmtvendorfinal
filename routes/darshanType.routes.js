const express = require("express");
const multer = require("multer");

const router = express.Router();

const protect = require(
  "../middleware/auth.middleware"
);

const {
  createDarshanType,
  getMyDarshanTypes,
  getDarshanTypeById,
  updateDarshanType,
  deleteDarshanType,
} = require(
  "../controllers/darshanType.controller"
);

// =====================================================
// MULTER
// =====================================================

const storage =
  multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize:
      10 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {
    if (
      file.mimetype.startsWith(
        "image/"
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files are allowed"
        ),
        false
      );
    }
  },
});

// =====================================================
// CREATE
// POST /api/vendor/darshan-types
// =====================================================

router.post(
  "/",
  protect,
  upload.single("image"),
  createDarshanType
);

// =====================================================
// GET MY TYPES
// GET /api/vendor/darshan-types/my-types
// =====================================================

router.get(
  "/my-types",
  protect,
  getMyDarshanTypes
);

// =====================================================
// GET SINGLE
// GET /api/vendor/darshan-types/:id
// =====================================================

router.get(
  "/:id",
  protect,
  getDarshanTypeById
);

// =====================================================
// UPDATE
// PUT /api/vendor/darshan-types/:id
// =====================================================

router.put(
  "/:id",
  protect,
  upload.single("image"),
  updateDarshanType
);

// =====================================================
// DELETE
// DELETE /api/vendor/darshan-types/:id
// =====================================================

router.delete(
  "/:id",
  protect,
  deleteDarshanType
);

module.exports = router;