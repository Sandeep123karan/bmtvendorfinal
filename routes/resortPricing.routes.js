const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  setDateWisePrice,
  getDateWisePricing,
} = require("../controllers/resortPricing.controller");

router.use(protect);

router.post("/", setDateWisePrice);

router.get(
  "/rate-plan/:ratePlanId",
  getDateWisePricing
);

module.exports = router;