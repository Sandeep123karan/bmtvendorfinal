const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");

const {
  createNightClub,
  getMyNightClubs,
  getNightClubById,
  updateNightClub,
  deleteNightClub,
  removeNightClubMedia,
  submitNightClub,
  publishNightClub,
  unpublishNightClub,
} = require("../controllers/nightclub.controller");

// shared multer config for create + update
const clubUploads = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
  { name: "images", maxCount: 10 },
  { name: "videos", maxCount: 5 },
  { name: "alcoholLicenseDocument", maxCount: 1 },
  { name: "exciseLicenseDocument", maxCount: 1 },
  { name: "fireNOCDocument", maxCount: 1 },
]);

// CREATE      POST   /api/vendor/nightclubs
router.post("/", protect, clubUploads, createNightClub);

// LIST        GET    /api/vendor/nightclubs   (and /my-club)
router.get("/", protect, getMyNightClubs);
router.get("/my-club", protect, getMyNightClubs);

// ACTIONS (specific paths first, before "/:id")
router.patch("/:id/submit", protect, submitNightClub);
router.patch("/:id/publish", protect, publishNightClub);
router.patch("/:id/unpublish", protect, unpublishNightClub);
router.patch("/:id/remove-media", protect, removeNightClubMedia);

// READ ONE    GET    /api/vendor/nightclubs/:id
router.get("/:id", protect, getNightClubById);

// UPDATE      PUT    /api/vendor/nightclubs/:id
router.put("/:id", protect, clubUploads, updateNightClub);

// DELETE      DELETE /api/vendor/nightclubs/:id
router.delete("/:id", protect, deleteNightClub);

module.exports = router;