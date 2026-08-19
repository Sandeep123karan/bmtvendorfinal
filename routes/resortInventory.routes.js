const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  upsertInventory,
  getResortInventory,
  getRoomCategoryInventory,
} = require("../controllers/resortInventory.controller");


router.use(protect);


// Create / Update date-wise inventory
router.post("/", upsertInventory);


// Get all inventory of one resort
router.get(
  "/resort/:resortId",
  getResortInventory
);


// Get inventory of one room category
router.get(
  "/room-category/:roomCategoryId",
  getRoomCategoryInventory
);


module.exports = router;