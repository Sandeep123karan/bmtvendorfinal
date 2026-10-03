const express = require("express");
const multer = require("multer");

const router = express.Router();

const protect = require("../middleware/auth.middleware");


const {
  createCabin,
  getCabins,
  getCabinById,
  updateCabin,
  deleteCabin,
} = require("../controllers/cruiseCabin.controller");


const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 10,
  },

  fileFilter: (req, file, cb) => {
    const allowedImages = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (allowedImages.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Only JPEG, JPG, PNG and WEBP images are allowed."
      ),
      false
    );
  },
});


router.post(
  "/",
  protect,
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  createCabin
);


router.get(
  "/",
  protect,
  getCabins
);


router.get(
  "/:id",
  protect,
  getCabinById
);


router.put(
  "/:id",
  protect,
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  updateCabin
);

router.delete(
  "/:id",
  protect,
  deleteCabin
);


module.exports = router;