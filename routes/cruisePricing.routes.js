const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createPricing,
  getPricings,
  getPricingById,
  updatePricing,
  deletePricing,
} = require("../controllers/cruisePricing.controller");

router.post(
  "/",
  protect,
  createPricing
);

router.get(
  "/",
  protect,
  getPricings
);

router.get(
  "/:id",
  protect,
  getPricingById
);

router.put(
  "/:id",
  protect,
  updatePricing
);

router.delete(
  "/:id",
  protect,
  deletePricing
);

module.exports = router;