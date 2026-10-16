
// const router  = require("express").Router();
// const protect = require("../middleware/auth.middleware");
// const upload  = require("../utils/upload");

// const {
//   addBus,
//   getVendorBuses,
//   getBusById,
//   updateBus,
//   deleteBus,
//   searchBuses,
//   toggleBusStatus,
// } = require("../controllers/bus.controller");

// /* =========================================================
//    MULTER FIELDS — all image / document types supported
// ========================================================= */
// const busImageFields = upload.fields([
//   { name: "image",              maxCount: 1  }, // main image (required on add)
//   { name: "frontImage",         maxCount: 1  },
//   { name: "backImage",          maxCount: 1  },
//   { name: "seatLayoutImage",    maxCount: 1  },
//   { name: "insideImages",       maxCount: 5  },
//   { name: "gallery",            maxCount: 10 },

//   // crew
//   { name: "driverPhoto",        maxCount: 1  },
//   { name: "driverLicenseImage", maxCount: 1  },
//   { name: "helperPhoto",        maxCount: 1  },
//   { name: "helperIdImage",      maxCount: 1  },

//   // vehicle documents
//   { name: "rcImage",            maxCount: 1  },
//   { name: "insuranceImage",     maxCount: 1  },
//   { name: "permitImage",        maxCount: 1  },
//   { name: "fitnessImage",       maxCount: 1  },
// ]);

// /* =========================================================
//    PUBLIC ROUTES
//    (must come BEFORE "/:id" or "/search" is captured by it)
// ========================================================= */

// // User search  →  /api/buses/search?fromCity=Mumbai&toCity=Pune&travelDate=2025-01-01
// router.get("/search", searchBuses);

// /* =========================================================
//    VENDOR ROUTES  (protected)
// ========================================================= */

// // Add new bus
// router.post("/", protect, busImageFields, addBus);

// // Get all buses of logged-in vendor
// router.get("/vendor", protect, getVendorBuses);

// // Get single bus
// router.get("/:id", protect, getBusById);

// // Update bus
// router.put("/:id", protect, busImageFields, updateBus);

// // Delete bus
// router.delete("/:id", protect, deleteBus);

// // Toggle active/inactive
// router.patch("/:id/toggle", protect, toggleBusStatus);

// module.exports = router;

const router  = require("express").Router();
const protect = require("../middleware/auth.middleware");
const upload  = require("../utils/upload");

const {
  addBus,
  getVendorBuses,
  getBusById,
  updateBus,
  deleteBus,
  searchBuses,
  toggleBusStatus,
} = require("../controllers/bus.controller");

/* =========================================================
   MULTER FIELDS — all image / document types supported
========================================================= */
const busImageFields = upload.fields([
  { name: "image",              maxCount: 1  }, // main image (required on add)
  { name: "frontImage",         maxCount: 1  },
  { name: "backImage",          maxCount: 1  },
  { name: "seatLayoutImage",    maxCount: 1  },
  { name: "insideImages",       maxCount: 5  },
  { name: "gallery",            maxCount: 10 },

  // crew
  { name: "driverPhoto",        maxCount: 1  },
  { name: "driverLicenseImage", maxCount: 1  },
  { name: "helperPhoto",        maxCount: 1  },
  { name: "helperIdImage",      maxCount: 1  },

  // vehicle documents
  { name: "rcImage",            maxCount: 1  },
  { name: "insuranceImage",     maxCount: 1  },
  { name: "permitImage",        maxCount: 1  },
  { name: "fitnessImage",       maxCount: 1  },
]);

/* =========================================================
   PUBLIC ROUTES
   (must come BEFORE "/:id" or "/search" is captured by it)
========================================================= */

// User search  →  /api/buses/search?fromCity=Mumbai&toCity=Pune&travelDate=2025-01-01
router.get("/search", searchBuses);

/* =========================================================
   VENDOR ROUTES  (protected)
========================================================= */

// Add new bus
router.post("/", protect, busImageFields, addBus);

// Get all buses of logged-in vendor
router.get("/vendor", protect, getVendorBuses);

// Get single bus
router.get("/:id", protect, getBusById);

// Update bus
router.put("/:id", protect, busImageFields, updateBus);

// Delete bus
router.delete("/:id", protect, deleteBus);

// Toggle active/inactive
router.patch("/:id/toggle", protect, toggleBusStatus);

module.exports = router;