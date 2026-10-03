const express = require("express");
const multer = require("multer");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createItinerary,
  getItineraries,
  getItineraryById,
  updateItinerary,
  deleteItinerary,
} = require("../controllers/cruiseItinerary.controller");

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 11,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
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
  createItinerary
);

router.get(
  "/",
  protect,
  getItineraries
);

router.get(
  "/:id",
  protect,
  getItineraryById
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
  updateItinerary
);

router.delete(
  "/:id",
  protect,
  deleteItinerary
);

module.exports = router;