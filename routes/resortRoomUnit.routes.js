// const express = require("express");

// const router = express.Router();

// const protect = require("../middleware/auth.middleware");

// const {
//   createRoomUnit,
//   getRoomUnits,
//   getRoomUnitsByCategory,
//   updateRoomUnit,
//   deleteRoomUnit,
// } = require("../controllers/resortRoomUnit.controller");


// router.use(protect);


// // Create individual room
// router.post("/", createRoomUnit);


// // Get all units of resort
// router.get("/resort/:resortId", getRoomUnits);


// // Get units by room category
// router.get(
//   "/category/:roomCategoryId",
//   getRoomUnitsByCategory
// );


// // Update unit
// router.put("/:id", updateRoomUnit);


// // Delete unit
// router.delete("/:id", deleteRoomUnit);


// module.exports = router;


const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createRoomUnit,
  getRoomUnits,
  getRoomUnitsByCategory,
  updateRoomUnit,
  deleteRoomUnit,
} = require("../controllers/resortRoomUnit.controller");

router.use(protect);

router.post("/", createRoomUnit);

router.get("/resort/:resortId", getRoomUnits);

router.get("/category/:roomCategoryId", getRoomUnitsByCategory);

router.put("/:id", updateRoomUnit);

router.delete("/:id", deleteRoomUnit);

module.exports = router;
