// const router = require("express").Router();
// const protect = require("../middleware/auth.middleware");

// const {
//   createBusType,
//   getVendorBusTypes,
//   getBusTypeById,
//   updateBusType,
//   deleteBusType,
// } = require("../controllers/busType.controller");

// router.post("/", protect, createBusType);
// router.get("/vendor", protect, getVendorBusTypes);
// router.get("/:id", protect, getBusTypeById);
// router.put("/:id", protect, updateBusType);
// router.delete("/:id", protect, deleteBusType);

// module.exports = router;
const router = require("express").Router();
const protect = require("../middleware/auth.middleware");

const {
  createBusType,
  getVendorBusTypes,
  getBusTypeByBus,
  getBusTypeById,
  updateBusType,
  deleteBusType,
} = require("../controllers/busType.controller");

// NOTE: "/vendor" and "/bus/:busId" must stay above "/:id".
router.post("/", protect, createBusType);
router.get("/vendor", protect, getVendorBusTypes);
router.get("/bus/:busId", protect, getBusTypeByBus);
router.get("/:id", protect, getBusTypeById);
router.put("/:id", protect, updateBusType);
router.delete("/:id", protect, deleteBusType);

module.exports = router;