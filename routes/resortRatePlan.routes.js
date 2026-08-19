const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createRatePlan,
  getRatePlans,
  updateRatePlan,
  deleteRatePlan,
} = require("../controllers/resortRatePlan.controller");

router.use(protect);

router.post("/", createRatePlan);

router.get(
  "/room-category/:roomCategoryId",
  getRatePlans
);

router.put("/:id", updateRatePlan);

router.delete("/:id", deleteRatePlan);

module.exports = router;