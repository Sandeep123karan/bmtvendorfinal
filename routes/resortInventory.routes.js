
const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createInventory,
  getResortInventory,
  getRoomCategoryInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
} = require("../controllers/resortInventory.controller");

router.use(protect);

// CREATE inventory
router.post("/", createInventory);

// GET inventory by resort
router.get("/resort/:resortId", getResortInventory);

// GET inventory by room category
router.get(
  "/room-category/:roomCategoryId",
  getRoomCategoryInventory
);

// GET single inventory record
router.get("/:inventoryId", getInventoryById);

// UPDATE inventory
router.put("/:inventoryId", updateInventory);

// DELETE inventory
router.delete("/:inventoryId", deleteInventory);

module.exports = router;
