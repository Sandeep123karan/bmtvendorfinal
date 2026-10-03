const multer = require("multer");

// =========================================================
// MEMORY STORAGE
// =========================================================

const storage = multer.memoryStorage();

// =========================================================
// DEFAULT UPLOAD (purana, baaki routes ke liye - same rahega)
// Images + videos, max 20 MB each, max 31 files
// =========================================================

const allowedImages = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const allowedVideos = ["video/mp4", "video/webm", "video/quicktime"];

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 31,
  },
  fileFilter: (req, file, cb) => {
    if (
      allowedImages.includes(file.mimetype) ||
      allowedVideos.includes(file.mimetype)
    ) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Only JPEG, JPG, PNG, WEBP images and MP4, WEBM, MOV videos are allowed."
      ),
      false
    );
  },
});

// =========================================================
// ONBOARDING UPLOAD (single file, field name: "file")
// Images + videos + PDF. Per-type size check controller me.
// =========================================================

const onboardingAllowed = [...allowedImages, ...allowedVideos, "application/pdf"];

const onboardingUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024, files: 1 }, // 100 MB = video max
  fileFilter: (req, file, cb) => {
    if (onboardingAllowed.includes(file.mimetype)) return cb(null, true);

    return cb(
      new Error(
        "Only JPG, PNG, WEBP images, MP4/WEBM/MOV videos and PDF files are allowed."
      ),
      false
    );
  },
}).single("file");

module.exports = upload; // default export same
module.exports.onboardingUpload = onboardingUpload;