// routes/HotelRoom.routes.js

const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createRoom,
  getHotelRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  updateRoomInventory,
  deleteRoomImage,
} = require("../controllers/HotelRoom.controller");


/* ============================================================
   ALL ROUTES REQUIRE VENDOR AUTHENTICATION
============================================================ */

router.use(protect);


/* ============================================================
   CREATE ROOM
   POST /api/hotel-rooms
============================================================ */

router.post(
  "/",
  createRoom
);


/* ============================================================
   GET ALL ROOMS OF A HOTEL
   GET /api/hotel-rooms/hotel/:hotelId
============================================================ */

router.get(
  "/hotel/:hotelId",
  getHotelRooms
);


/* ============================================================
   GET SINGLE ROOM
   GET /api/hotel-rooms/:roomId
============================================================ */

router.get(
  "/:roomId",
  getRoomById
);


/* ============================================================
   UPDATE ROOM
   PUT /api/hotel-rooms/:roomId
============================================================ */

router.put(
  "/:roomId",
  updateRoom
);


/* ============================================================
   DELETE ROOM
   DELETE /api/hotel-rooms/:roomId
============================================================ */

router.delete(
  "/:roomId",
  deleteRoom
);


/* ============================================================
   UPDATE ROOM STATUS
   PUT /api/hotel-rooms/:roomId/status
============================================================ */

router.put(
  "/:roomId/status",
  updateRoomStatus
);


/* ============================================================
   UPDATE ROOM INVENTORY
   PUT /api/hotel-rooms/:roomId/inventory
============================================================ */

router.put(
  "/:roomId/inventory",
  updateRoomInventory
);


/* ============================================================
   DELETE ROOM IMAGE
   PUT /api/hotel-rooms/:roomId/images/delete
============================================================ */

router.put(
  "/:roomId/images/delete",
  deleteRoomImage
);


/* ============================================================
   EXPORT
============================================================ */

module.exports = router;