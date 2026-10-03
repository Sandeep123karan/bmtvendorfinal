const express = require("express");
const multer = require("multer");

const router = express.Router();

const protect = require(
  "../middleware/auth.middleware"
);

const {
  createDarshan,
  getMyDarshans,
  getDarshanById,
  updateDarshan,
  deleteDarshan,
} = require(
  "../controllers/darshan.controller"
);

// =====================================================
// MULTER
// =====================================================

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/")
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
// CREATE DARSHAN
// =====================================================

router.post(
  "/",
  protect,
  upload.fields([
    {
      name: "mainImage",
      maxCount: 1,
    },
    {
      name: "galleryImages",
      maxCount: 10,
    },
  ]),
  createDarshan
);

// =====================================================
// GET MY DARSHANS
// =====================================================

router.get(
  "/my-darshans",
  protect,
  getMyDarshans
);

// =====================================================
// GET SINGLE
// =====================================================

router.get(
  "/:id",
  protect,
  getDarshanById
);

// =====================================================
// UPDATE
// =====================================================

router.put(
  "/:id",
  protect,
  upload.fields([
    {
      name: "mainImage",
      maxCount: 1,
    },
    {
      name: "galleryImages",
      maxCount: 10,
    },
  ]),
  updateDarshan
);

// =====================================================
// DELETE
// =====================================================

router.delete(
  "/:id",
  protect,
  deleteDarshan
);

module.exports = router;