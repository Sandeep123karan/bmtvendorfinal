const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");

const {
  createRoomCategory,
  getRoomCategoriesByPalace,
  getRoomCategoryById,
  updateRoomCategory,
  deleteRoomCategory,
  toggleRoomCategory,
} = require("../controllers/palaceRoomCategoryController");


router.use(protect);


// CREATE
router.post(
  "/",
  upload.any(),
  createRoomCategory
);


// GET ALL ROOMS OF A PALACE
router.get(
  "/palace/:palaceId",
  getRoomCategoriesByPalace
);


// GET SINGLE
router.get(
  "/:id",
  getRoomCategoryById
);


// UPDATE
router.put(
  "/:id",
  upload.any(),
  updateRoomCategory
);


// TOGGLE
router.patch(
  "/:id/toggle",
  toggleRoomCategory
);


// DELETE
router.delete(
  "/:id",
  deleteRoomCategory
);


module.exports = router;