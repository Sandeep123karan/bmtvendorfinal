const express = require("express");

const router = express.Router();

const protect = require(
  "../middleware/auth.middleware"
);

const {
  createDynamicPricing,
  getDynamicPricing,
  updateDynamicPricing,
  deleteDynamicPricing,
  toggleDynamicPricing,
} = require(
  "../controllers/ApartmentDynamicPricing.controller"
);


router.use(protect);


// CREATE
router.post(
  "/apartment/:apartmentId/rate-plan/:ratePlanId",
  createDynamicPricing
);


// GET CALENDAR PRICING
router.get(
  "/apartment/:apartmentId/rate-plan/:ratePlanId",
  getDynamicPricing
);


// UPDATE
router.put(
  "/:pricingId",
  updateDynamicPricing
);


// DELETE
router.delete(
  "/:pricingId",
  deleteDynamicPricing
);


// ACTIVE / INACTIVE
router.patch(
  "/:pricingId/toggle",
  toggleDynamicPricing
);


module.exports = router;