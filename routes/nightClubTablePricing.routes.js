const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createTablePricing,
  getEventTablePricing,
  getTablePricingById,
  updateTablePricing,
  toggleTablePricing,
  deleteTablePricing,
} = require("../controllers/nightClubTablePricing.controller");

const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
});

// CREATE
router.post(
  "/",
  protect,
  upload.none(),
  createTablePricing
);

// GET EVENT TABLE PRICING
router.get(
  "/event/:eventId",
  protect,
  getEventTablePricing
);

// GET SINGLE
router.get(
  "/:id",
  protect,
  getTablePricingById
);

// UPDATE
router.put(
  "/:id",
  protect,
  upload.none(),
  updateTablePricing
);

// TOGGLE
router.patch(
  "/:id/toggle",
  protect,
  toggleTablePricing
);

// DELETE
router.delete(
  "/:id",
  protect,
  deleteTablePricing
);

module.exports = router;