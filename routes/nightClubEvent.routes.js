const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");

const {
  createNightClubEvent,
  getMyNightClubEvents,
  getNightClubEvent,
  updateNightClubEvent,
  submitNightClubEvent,
  publishNightClubEvent,
  unpublishNightClubEvent,
  deleteNightClubEvent,
} = require("../controllers/nightClubEvent.controller");

// =====================================================
// CREATE EVENT
// =====================================================

router.post(
  "/",
  protect,
  upload.fields([
    {
      name: "bannerImage",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 10,
    },
    {
      name: "videos",
      maxCount: 5,
    },
  ]),
  createNightClubEvent
);

// =====================================================
// GET MY EVENTS
// =====================================================

router.get(
  "/my-events",
  protect,
  getMyNightClubEvents
);

// =====================================================
// GET SINGLE EVENT
// =====================================================

router.get(
  "/:id",
  protect,
  getNightClubEvent
);

// =====================================================
// UPDATE
// =====================================================

router.put(
  "/:id",
  protect,
  upload.fields([
    {
      name: "bannerImage",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 10,
    },
    {
      name: "videos",
      maxCount: 5,
    },
  ]),
  updateNightClubEvent
);

// =====================================================
// SUBMIT
// =====================================================

router.patch(
  "/:id/submit",
  protect,
  submitNightClubEvent
);

// =====================================================
// PUBLISH
// =====================================================

router.patch(
  "/:id/publish",
  protect,
  publishNightClubEvent
);

// =====================================================
// UNPUBLISH
// =====================================================

router.patch(
  "/:id/unpublish",
  protect,
  unpublishNightClubEvent
);

// =====================================================
// DELETE
// =====================================================

router.delete(
  "/:id",
  protect,
  deleteNightClubEvent
);

module.exports = router;