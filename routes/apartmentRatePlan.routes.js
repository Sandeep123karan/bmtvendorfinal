const express = require("express");

const router = express.Router();

const protect = require(
  "../middleware/auth.middleware"
);

const {
  createRatePlan,
  getRatePlans,
  getRatePlanById,
  updateRatePlan,
  deleteRatePlan,
  toggleRatePlan,
} = require(
  "../controllers/ApartmentRatePlan.controller"
);


router.use(protect);


// ==========================================
// CREATE RATE PLAN
// ==========================================

router.post(
  "/apartment/:apartmentId",
  createRatePlan
);


// ==========================================
// GET APARTMENT RATE PLANS
// ==========================================

router.get(
  "/apartment/:apartmentId",
  getRatePlans
);


// ==========================================
// GET SINGLE
// ==========================================

router.get(
  "/:ratePlanId",
  getRatePlanById
);


// ==========================================
// UPDATE
// ==========================================

router.put(
  "/:ratePlanId",
  updateRatePlan
);


// ==========================================
// DELETE
// ==========================================

router.delete(
  "/:ratePlanId",
  deleteRatePlan
);


// ==========================================
// ACTIVATE / DEACTIVATE
// ==========================================

router.patch(
  "/:ratePlanId/toggle",
  toggleRatePlan
);


module.exports = router;