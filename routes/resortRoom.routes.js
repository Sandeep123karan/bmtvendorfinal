const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createRoom,
  getResortRooms,
  getSingleRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/resortRoom.controller");


router.use(protect);


// Create Room Category
router.post("/", createRoom);


// Get all room categories of one resort
router.get("/resort/:resortId", getResortRooms);


// Get single room category
router.get("/:id", getSingleRoom);


// Update room category
router.put("/:id", updateRoom);


// Delete room category
router.delete("/:id", deleteRoom);


module.exports = router;