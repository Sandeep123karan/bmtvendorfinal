const express = require("express");

const router = express.Router();

/* ============================================================
   MIDDLEWARE
============================================================ */

const protect = require("../middleware/auth.middleware");
const upload = require("../utils/upload");


/* ============================================================
   CONTROLLERS
============================================================ */

const {
  createUnit,
  getHomestayUnits,
  getSingleUnit,
  updateUnit,
  deleteUnit,

  toggleUnitStatus,

  deleteUnitImage,

  activateUnit,
  deactivateUnit,
} = require("../controllers/homestayUnit.controller");


/* ============================================================
   ALL ROUTES REQUIRE VENDOR LOGIN
============================================================ */

router.use(protect);


/* ============================================================
   CREATE HOMESTAY UNIT
============================================================ */

/*
POST /api/homestay-units

Form-data:

homestayId
unitName
unitType
description
maxGuests
basePrice
totalUnits

Images:
coverImage
images
videos
*/

router.post(
  "/",
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 20,
    },
    {
      name: "videos",
      maxCount: 5,
    },
  ]),
  createUnit
);


/* ============================================================
   GET ALL UNITS OF HOMESTAY
============================================================ */

/*
GET /api/homestay-units?homestayId=HOMESTAY_ID

Optional:

?page=1
&limit=20
&status=ACTIVE
*/

router.get(
  "/",
  getHomestayUnits
);


/* ============================================================
   GET SINGLE UNIT
============================================================ */

/*
GET /api/homestay-units/:unitId
*/

router.get(
  "/:unitId",
  getSingleUnit
);


/* ============================================================
   UPDATE UNIT
============================================================ */

/*
PUT /api/homestay-units/:unitId

Can update:
- Unit details
- Capacity
- Beds
- Bathroom
- Amenities
- Pricing
- Booking settings
- Cancellation
- Rules
- Images
*/

router.put(
  "/:unitId",
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 20,
    },
    {
      name: "videos",
      maxCount: 5,
    },
  ]),
  updateUnit
);


/* ============================================================
   DELETE UNIT
============================================================ */

/*
DELETE /api/homestay-units/:unitId
*/

router.delete(
  "/:unitId",
  deleteUnit
);


/* ============================================================
   TOGGLE UNIT STATUS
============================================================ */

/*
PATCH /api/homestay-units/:unitId/toggle-status

ACTIVE
  ↕
INACTIVE
*/

router.patch(
  "/:unitId/toggle-status",
  toggleUnitStatus
);


/* ============================================================
   ACTIVATE UNIT
============================================================ */

/*
PATCH /api/homestay-units/:unitId/activate
*/

router.patch(
  "/:unitId/activate",
  activateUnit
);


/* ============================================================
   DEACTIVATE UNIT
============================================================ */

/*
PATCH /api/homestay-units/:unitId/deactivate
*/

router.patch(
  "/:unitId/deactivate",
  deactivateUnit
);


/* ============================================================
   DELETE UNIT IMAGE
============================================================ */

/*
DELETE /api/homestay-units/:unitId/images

Body:

{
  "imageUrl": "https://..."
}
*/

router.delete(
  "/:unitId/images",
  deleteUnitImage
);


/* ============================================================
   EXPORT
============================================================ */

module.exports = router;