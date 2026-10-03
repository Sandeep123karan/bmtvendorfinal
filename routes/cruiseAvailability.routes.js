const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createAvailability,
  getAvailabilities,
  getAvailabilityById,
  updateAvailability,
  deleteAvailability,
} = require("../controllers/cruiseAvailability.controller");

router.post(
  "/",
  protect,
  createAvailability
);

router.get(
  "/",
  protect,
  getAvailabilities
);

router.get(
  "/:id",
  protect,
  getAvailabilityById
);

router.put(
  "/:id",
  protect,
  updateAvailability
);

router.delete(
  "/:id",
  protect,
  deleteAvailability
);

module.exports = router;