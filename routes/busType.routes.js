const router = require("express").Router();
const protect = require("../middleware/auth.middleware");

const {
  createBusType,
  getVendorBusTypes,
  getBusTypeById,
  updateBusType,
  deleteBusType,
} = require("../controllers/busType.controller");

router.post("/", protect, createBusType);
router.get("/vendor", protect, getVendorBusTypes);
router.get("/:id", protect, getBusTypeById);
router.put("/:id", protect, updateBusType);
router.delete("/:id", protect, deleteBusType);

module.exports = router;
