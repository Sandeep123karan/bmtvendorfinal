const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

/* ==========================================================
   UPLOAD DIRECTORY
========================================================== */

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

/* ==========================================================
   FILE EXTENSIONS
========================================================== */

const EXT = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",

  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",

  "application/pdf": ".pdf",
};

/* ==========================================================
   FILE SIZE LIMITS

   Images/PDF = 5 MB
   Videos     = 100 MB
========================================================== */

const maxMB = (mime) => {
  if (mime.startsWith("video/")) {
    return 100;
  }

  return 5;
};

/* ==========================================================
   OPTIONAL CLOUDINARY
========================================================== */

let cloudinary = null;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  try {
    cloudinary = require("cloudinary").v2;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log("☁️ Cloudinary upload enabled");
  } catch (error) {
    console.warn(
      "⚠️ Cloudinary package not installed. Using local storage."
    );

    cloudinary = null;
  }
} else {
  console.log("📁 Cloudinary env not found. Using local storage.");
}

/* ==========================================================
   CLOUDINARY UPLOAD
========================================================== */

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "bmt-connect/onboarding",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });
};

/* ==========================================================
   LOCAL DISK UPLOAD
========================================================== */

const uploadToDisk = (file, req) => {
  fs.mkdirSync(UPLOAD_DIR, {
    recursive: true,
  });

  const extension = EXT[file.mimetype] || "";

  const filename =
    `${Date.now()}-` +
    `${crypto.randomBytes(6).toString("hex")}` +
    extension;

  const filePath = path.join(
    UPLOAD_DIR,
    filename
  );

  fs.writeFileSync(
    filePath,
    file.buffer
  );

  const baseUrl = (
    process.env.PUBLIC_URL ||
    `${req.protocol}://${req.get("host")}`
  ).replace(/\/$/, "");

  return `${baseUrl}/uploads/${filename}`;
};

/* ==========================================================
   POST /api/upload

   multipart/form-data
   field name: file
========================================================== */

exports.uploadFile = async (req, res) => {
  try {
    /* ------------------------------------------------------
       CHECK FILE
    ------------------------------------------------------ */

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        code: "FILE_MISSING",
        message: "No file received. Field name must be 'file'.",
      });
    }

    /* ------------------------------------------------------
       CHECK FILE SIZE
    ------------------------------------------------------ */

    const limit = maxMB(file.mimetype);

    if (file.size > limit * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        code: "FILE_TOO_LARGE",
        message: `${file.originalname} is too large. Maximum allowed size is ${limit} MB.`,
      });
    }

    /* ------------------------------------------------------
       UPLOAD
    ------------------------------------------------------ */

    let url;

    if (cloudinary) {
      url = await uploadToCloudinary(file);
    } else {
      url = uploadToDisk(file, req);
    }

    /* ------------------------------------------------------
       RESPONSE
    ------------------------------------------------------ */

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully.",
      url,

      file: {
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
      },
    });
  } catch (error) {
    console.error("❌ Upload error:", error);

    return res.status(500).json({
      success: false,
      code: "UPLOAD_FAILED",
      message: error.message || "Upload failed.",
    });
  }
};