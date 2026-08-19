const express = require("express");

const router = express.Router();

const {
  upsertInventory,
  getInventory,
  getInventoryById,
  deleteInventory,
} = require("../controllers/palaceInventoryController");


/* CREATE / UPDATE INVENTORY */
router.post("/", upsertInventory);


/* GET INVENTORY */
router.get("/", getInventory);


/* GET SINGLE */
router.get("/:id", getInventoryById);


/* DELETE */
router.delete("/:id", deleteInventory);


module.exports = router;