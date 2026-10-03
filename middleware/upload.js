const multer = require("multer");

// =========================================================
// MEMORY STORAGE
// =========================================================

const storage = multer.memoryStorage();

// =========================================================
// MULTER CONFIGURATION
// =========================================================

const upload = multer({
  storage,

  limits: {
    // Maximum size of each file = 20 MB
    fileSize: 20 * 1024 * 1024,

    // Maximum total files in one request
    files: 31,
  },

  fileFilter: (req, file, cb) => {
    // =====================================================
    // ALLOWED IMAGES
    // =====================================================

    const allowedImages = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    // =====================================================
    // ALLOWED VIDEOS
    // =====================================================

    const allowedVideos = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    // =====================================================
    // IMAGE OR VIDEO
    // =====================================================

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

module.exports = upload;