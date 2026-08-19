const express = require("express");

const router = express.Router();

const {
  createDynamicPricing,
  getDynamicPricing,
  getDynamicPricingById,
  updateDynamicPricing,
  toggleDynamicPricing,
  deleteDynamicPricing,
} = require(
  "../controllers/palaceDynamicPricingController"
);


// CREATE
router.post(
  "/",
  createDynamicPricing
);


// GET ALL
router.get(
  "/",
  getDynamicPricing
);


// GET SINGLE
router.get(
  "/:id",
  getDynamicPricingById
);


// UPDATE
router.put(
  "/:id",
  updateDynamicPricing
);


// TOGGLE ACTIVE
router.patch(
  "/:id/toggle",
  toggleDynamicPricing
);


// DELETE
router.delete(
  "/:id",
  deleteDynamicPricing
);


module.exports = router;