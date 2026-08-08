const express = require("express");

const router = express.Router();

/* ============================================================
   MIDDLEWARE
============================================================ */

const protect = require("../middleware/auth.middleware");


/* ============================================================
   CONTROLLER
============================================================ */

const {
  createInventory,
  createInventoryRange,
  getInventory,
  getSingleInventory,
  updateInventory,

  blockInventory,
  unblockInventory,

  stopSellInventory,
  resumeSellInventory,

  deleteInventory,
} = require("../controllers/homestayInventory.controller");


/* ============================================================
   ALL ROUTES REQUIRE VENDOR LOGIN
============================================================ */

router.use(protect);


/* ============================================================
   CREATE / UPDATE SINGLE DATE INVENTORY
============================================================ */

/*
POST /api/homestay-inventory

Body:

{
  "homestayId": "HOMESTAY_ID",
  "unitId": "UNIT_ID",
  "date": "2026-08-15",
  "basePrice": 2500,
  "weekendPrice": 3000,
  "holidayPrice": 3500,
  "specialPrice": 0,
  "extraGuestPrice": 500,
  "discountType": "percentage",
  "discountValue": 10,
  "taxPercentage": 12,
  "serviceChargePercentage": 0
}
*/

router.post(
  "/",
  createInventory
);


/* ============================================================
   CREATE / UPDATE INVENTORY FOR DATE RANGE
============================================================ */

/*
POST /api/homestay-inventory/range

Example:

2026-08-01
       ↓
2026-08-31

Creates/updates inventory for every date.
*/

router.post(
  "/range",
  createInventoryRange
);


/* ============================================================
   GET INVENTORY
============================================================ */

/*
GET /api/homestay-inventory

Examples:

All inventory:

GET /api/homestay-inventory


By homestay:

GET /api/homestay-inventory?homestayId=XXXX


By unit:

GET /api/homestay-inventory?unitId=XXXX


Date range:

GET /api/homestay-inventory
    ?unitId=XXXX
    &startDate=2026-08-01
    &endDate=2026-08-31
*/

router.get(
  "/",
  getInventory
);


/* ============================================================
   GET SINGLE INVENTORY
============================================================ */

/*
GET /api/homestay-inventory/:inventoryId
*/

router.get(
  "/:inventoryId",
  getSingleInventory
);


/* ============================================================
   UPDATE INVENTORY
============================================================ */

/*
PUT /api/homestay-inventory/:inventoryId

Can update:

- Price
- Discount
- Tax
- Blocked units
- Minimum stay
- Maximum stay
- Stop sell
- Booking restrictions
*/

router.put(
  "/:inventoryId",
  updateInventory
);


/* ============================================================
   BLOCK DATE
============================================================ */

/*
PATCH /api/homestay-inventory/:inventoryId/block
*/

router.patch(
  "/:inventoryId/block",
  blockInventory
);


/* ============================================================
   UNBLOCK DATE
============================================================ */

/*
PATCH /api/homestay-inventory/:inventoryId/unblock
*/

router.patch(
  "/:inventoryId/unblock",
  unblockInventory
);


/* ============================================================
   STOP SELL
============================================================ */

/*
PATCH /api/homestay-inventory/:inventoryId/stop-sell
*/

router.patch(
  "/:inventoryId/stop-sell",
  stopSellInventory
);


/* ============================================================
   RESUME SELL
============================================================ */

/*
PATCH /api/homestay-inventory/:inventoryId/resume-sell
*/

router.patch(
  "/:inventoryId/resume-sell",
  resumeSellInventory
);


/* ============================================================
   DELETE INVENTORY
============================================================ */

/*
DELETE /api/homestay-inventory/:inventoryId
*/

router.delete(
  "/:inventoryId",
  deleteInventory
);


/* ============================================================
   EXPORT
============================================================ */

module.exports = router;