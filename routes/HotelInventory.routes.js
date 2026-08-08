const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  upsertInventory,
  getRoomInventory,
  stopSell,
  deleteInventory,
} = require("../controllers/HotelInventory.controller");

router.use(protect);

router.put("/", upsertInventory);

router.get("/room/:roomId", getRoomInventory);

router.put("/:inventoryId/stop-sell", stopSell);

router.delete("/:inventoryId", deleteInventory);

module.exports = router;