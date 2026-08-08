const express = require("express");

const router = express.Router();

/* ============================================================
   MIDDLEWARE
============================================================ */

const protect = require("../middleware/auth.middleware");
const upload = require("../utils/upload");


/* ============================================================
   CONTROLLER
============================================================ */

const {
  createHomestay,
  getMyHomestays,
  getSingleHomestay,
  updateHomestay,
  deleteHomestay,

  submitForApproval,

  updateAmenities,
  updatePolicies,

  deletePropertyImage,
  deleteCoverImage,

  toggleHomestayStatus,
} = require("../controllers/homestay.controller");


/* ============================================================
   ALL HOMESTAY ROUTES REQUIRE VENDOR LOGIN
============================================================ */

router.use(protect);


/* ============================================================
   CREATE HOMESTAY
============================================================ */

/*
POST /api/homestays

Form-data:

propertyName
propertyType
description
shortDescription

hostName
hostPhone
hostEmail

state
city
area
address
landmark
pincode

latitude
longitude

propertyLogo       -> single image
coverImage         -> single image
propertyImages     -> multiple images
videos             -> multiple videos

amenities
propertyHighlights
etc...
*/

router.post(
  "/",
  upload.fields([
    {
      name: "propertyLogo",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "propertyImages",
      maxCount: 20,
    },
    {
      name: "videos",
      maxCount: 5,
    },
  ]),
  createHomestay
);


/* ============================================================
   GET MY HOMESTAYS
============================================================ */

/*
GET /api/homestays/my

Optional query:

?page=1
&limit=10
&status=APPROVED
&city=Manali
&propertyType=villa
&search=mountain
*/

router.get(
  "/my",
  getMyHomestays
);


/* ============================================================
   GET SINGLE HOMESTAY
============================================================ */

/*
GET /api/homestays/:id
*/

router.get(
  "/:id",
  getSingleHomestay
);


/* ============================================================
   UPDATE HOMESTAY
============================================================ */

/*
PUT /api/homestays/:id

Can update:

Basic information
Host information
Location
Amenities
Policies
Business information
SEO
etc.

Can also upload new:

propertyLogo
coverImage
propertyImages
videos
*/

router.put(
  "/:id",
  upload.fields([
    {
      name: "propertyLogo",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "propertyImages",
      maxCount: 20,
    },
    {
      name: "videos",
      maxCount: 5,
    },
  ]),
  updateHomestay
);


/* ============================================================
   DELETE HOMESTAY
============================================================ */

/*
DELETE /api/homestays/:id
*/

router.delete(
  "/:id",
  deleteHomestay
);


/* ============================================================
   SUBMIT FOR ADMIN APPROVAL
============================================================ */

/*
POST /api/homestays/:id/submit

DRAFT
  ↓
PENDING
  ↓
Admin Approval
*/

router.post(
  "/:id/submit",
  submitForApproval
);


/* ============================================================
   AMENITIES
============================================================ */

/*
PUT /api/homestays/:id/amenities

Update:

amenities
propertyHighlights
outdoorFacilities
indoorFacilities
safetyFacilities
familyFacilities

plus common boolean amenities.
*/

router.put(
  "/:id/amenities",
  updateAmenities
);


/* ============================================================
   POLICIES
============================================================ */

/*
PUT /api/homestays/:id/policies

Update:

Check-in
Check-out
Couple policy
Pet policy
Smoking
Alcohol
Child policy
Cancellation
House rules
Payment policy
*/

router.put(
  "/:id/policies",
  updatePolicies
);


/* ============================================================
   DELETE PROPERTY IMAGE
============================================================ */

/*
DELETE /api/homestays/:id/images

Body:

{
  "imageUrl": "https://..."
}
*/

router.delete(
  "/:id/images",
  deletePropertyImage
);


/* ============================================================
   DELETE COVER IMAGE
============================================================ */

/*
DELETE /api/homestays/:id/cover-image
*/

router.delete(
  "/:id/cover-image",
  deleteCoverImage
);


/* ============================================================
   ACTIVATE / DEACTIVATE HOMESTAY
============================================================ */

/*
PATCH /api/homestays/:id/toggle-status
*/

router.patch(
  "/:id/toggle-status",
  toggleHomestayStatus
);


/* ============================================================
   EXPORT
============================================================ */

module.exports = router;