const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const { uploadFile } = require("../controllers/Upload.controller");

const router = express.Router();

/* ==========================================================
   ALLOWED FILE TYPES
========================================================== */

const ALLOWED_TYPES = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",

  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",

  // PDF
  "application/pdf",
];

/* ==========================================================
   MULTER CONFIGURATION

   Frontend field name:
   body.append("file", file)

   Storage:
   Memory storage -> req.file.buffer
========================================================== */

const onboardingUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
    files: 1,
  },

  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Only JPG, JPEG, PNG, WEBP images, MP4/WEBM/MOV videos and PDF files are allowed."
      ),
      false
    );
  },
}).single("file");

/* ==========================================================
   AUTHENTICATION

   Onboarding ke time vendor account approve nahi hua hota.
   Isliye yahan onboarding/partner JWT accept kiya ja raha hai.

   Supported secrets:
   1. JWT_SECRET
   2. PARTNER_JWT_SECRET
========================================================== */

// const authenticate = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization || "";

//     /* ------------------------------------------------------
//        CHECK AUTHORIZATION HEADER
//     ------------------------------------------------------ */

//     if (!authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({
//         success: false,
//         code: "TOKEN_MISSING",
//         message: "Authorization token missing.",
//       });
//     }

//     /* ------------------------------------------------------
//        GET TOKEN
//     ------------------------------------------------------ */

//     const token = authHeader.slice(7).trim();

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         code: "TOKEN_EMPTY",
//         message: "Authorization token is empty.",
//       });
//     }

//     /* ------------------------------------------------------
//        JWT SECRETS
//     ------------------------------------------------------ */

//     const secrets = [
//       process.env.JWT_SECRET,
//       process.env.PARTNER_JWT_SECRET,
//     ].filter(Boolean);

//     if (secrets.length === 0) {
//       console.error("❌ JWT_SECRET / PARTNER_JWT_SECRET missing");

//       return res.status(500).json({
//         success: false,
//         code: "JWT_SECRET_MISSING",
//         message: "JWT secret is not configured on server.",
//       });
//     }

//     /* ------------------------------------------------------
//        VERIFY TOKEN
//     ------------------------------------------------------ */

//     let decodedUser = null;

//     for (const secret of secrets) {
//       try {
//         decodedUser = jwt.verify(token, secret);
//         break;
//       } catch (error) {
//         // Try next secret
//       }
//     }

//     /* ------------------------------------------------------
//        INVALID TOKEN
//     ------------------------------------------------------ */

//     if (!decodedUser) {
//       console.error("❌ Upload token verification failed");

//       return res.status(401).json({
//         success: false,
//         code: "INVALID_TOKEN",
//         message: "Invalid or expired token.",
//       });
//     }

//     /* ------------------------------------------------------
//        SAVE USER DATA
//     ------------------------------------------------------ */

//     req.authUser = decodedUser;

//     console.log("✅ Upload token verified");
//     console.log("Upload user:", {
//       id: decodedUser.id,
//       vendorId: decodedUser.vendorId,
//       role: decodedUser.role,
//       vertical: decodedUser.vertical,
//       selectedVertical: decodedUser.selectedVertical,
//     });

   
//   } catch (error) {
//     console.error("❌ Authentication error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Authentication failed.",
//     });
//   }
// };
const authenticate = (req, res, next) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      code: "TOKEN_MISSING",
      message: "Authorization token missing",
    });
  }

  const token = header.slice(7).trim();

  const secrets = [
    process.env.JWT_SECRET,
    process.env.PARTNER_JWT_SECRET,
  ].filter(Boolean);

  for (const secret of secrets) {
    try {
      const decoded = jwt.verify(token, secret);

      req.authUser = decoded;

      console.log("✅ Upload token verified");
      console.log("Upload user:", decoded);

      console.log("🔥 ABOUT TO CALL MULTER");

      return next();
    } catch (err) {}
  }

  return res.status(401).json({
    success: false,
    code: "INVALID_TOKEN",
    message: "Invalid or expired token",
  });
};
/* ==========================================================
   MULTER ERROR HANDLER
========================================================== */

const handleUpload = (req, res, next) => {
  console.log("🔥 MULTER START");

  onboardingUpload(req, res, (err) => {
    console.log("🔥 MULTER CALLBACK");

    if (err) {
      console.error("❌ MULTER ERROR:", err);

      return res.status(400).json({
        success: false,
        message:
          err.code === "LIMIT_FILE_SIZE"
            ? "File is too large."
            : err.message || "Upload failed.",
      });
    }

    console.log("🔥 MULTER FILE:", req.file);

    next();
  });
};

/* ==========================================================
   UPLOAD ROUTE

   POST /api/upload

   Headers:
   Authorization: Bearer TOKEN

   Body:
   multipart/form-data

   Field:
   file
========================================================== */

router.post(
  "/",
  authenticate,
  handleUpload,
  uploadFile
);

/* ==========================================================
   EXPORT ROUTER
========================================================== */

module.exports = router;