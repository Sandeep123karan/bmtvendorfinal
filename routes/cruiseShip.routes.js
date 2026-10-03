const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");

const {
  createShip,
  getShips,
  getShipById,
  updateShip,
  deleteShip,
} = require("../controllers/cruiseShip.controller");


const cruiseShipUpload = upload.fields([
  {
    name: "logo",
    maxCount: 1,
  },

  {
    name: "coverImage",
    maxCount: 1,
  },

  {
    name: "images",
    maxCount: 20,
  },

  {
    name: "videos",
    maxCount: 10,
  },
]);



router.use(protect);


router.post(
  "/",
  cruiseShipUpload,
  createShip
);


router.get(
  "/",
  getShips
);


router.get(
  "/:id",
  getShipById
);


router.put(
  "/:id",
  cruiseShipUpload,
  updateShip
);


router.delete(
  "/:id",
  deleteShip
);

module.exports = router;