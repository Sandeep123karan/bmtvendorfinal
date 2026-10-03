const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createSailing,
  getSailings,
  getSailingById,
  updateSailing,
  deleteSailing,
} = require("../controllers/cruiseSailing.controller");

router.post(
  "/",
  protect,
  createSailing
);

router.get(
  "/",
  protect,
  getSailings
);

router.get(
  "/:id",
  protect,
  getSailingById
);

router.put(
  "/:id",
  protect,
  updateSailing
);

router.delete(
  "/:id",
  protect,
  deleteSailing
);

module.exports = router;