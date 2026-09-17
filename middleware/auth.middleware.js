

// const jwt = require("jsonwebtoken");
// const Vendor = require("../models/Vendor.model");

// const protect = async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer ")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "Not authorized, token missing",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // 🔥 IMPORTANT: decoded.id hona hi chahiye
//     const vendor = await Vendor.findById(decoded.id).select("-password");

//     if (!vendor) {
//       return res.status(401).json({
//         success: false,
//         message: "Vendor not found",
//       });
//     }

//     req.vendor = vendor;
//     next();
//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message: "Token invalid",
//     });
//   }
// };

// module.exports = protect;


const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor.model");

/* ==========================================================
   PROTECT MIDDLEWARE

   Ye middleware:
   - Bearer token read karega
   - JWT verify karega
   - Vendor ko fresh DB se fetch karega
   - role / permissions / vertical / staySubtype DB se lega
   - blocked / suspended / inactive account ko reject karega
   - req.vendor me authenticated vendor attach karega
========================================================== */

const protect = async (req, res, next) => {
  try {
    /* ======================================================
       TOKEN READ
    ====================================================== */

    const authorization =
      req.headers.authorization || "";

    if (
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required. Token missing.",
      });
    }

    const token =
      authorization
        .slice(7)
        .trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token missing.",
      });
    }

    /* ======================================================
       JWT SECRET
    ====================================================== */

    if (!process.env.JWT_SECRET) {
      console.error(
        "❌ JWT_SECRET missing in .env"
      );

      return res.status(500).json({
        success: false,
        message:
          "Server authentication configuration error.",
      });
    }

    /* ======================================================
       VERIFY TOKEN
    ====================================================== */

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }

    /* ======================================================
       FETCH FRESH USER FROM DATABASE

       IMPORTANT:
       Role/permission/token claim ko trust nahi karna.
       Fresh DB value use hogi.
    ====================================================== */

    const vendor =
      await Vendor.findById(
        decoded.id
      ).select(
        "-password -refreshToken"
      );

    if (!vendor) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor account not found.",
      });
    }

    /* ======================================================
       ACCOUNT ACTIVE CHECK
    ====================================================== */

    if (!vendor.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled.",
      });
    }

    /* ======================================================
       ACCOUNT STATUS CHECK
    ====================================================== */

    if (
      [
        "blocked",
        "suspended",
        "locked",
      ].includes(
        vendor.accountStatus
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is currently unavailable.",
      });
    }

    /* ======================================================
       TEMP LOCK CHECK
    ====================================================== */

    if (
      vendor.lockedUntil &&
      new Date(
        vendor.lockedUntil
      ) > new Date()
    ) {
      return res.status(423).json({
        success: false,
        message:
          "Your account is temporarily locked.",
      });
    }

    /* ======================================================
       LEGACY SUSPENDED STATUS
    ====================================================== */

    if (
      vendor.status ===
      "SUSPENDED"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your vendor account has been suspended.",
      });
    }

    /* ======================================================
       IMPORTANT:

       PENDING ko block NAHI karna.

       PENDING vendor ko onboarding ke liye
       login/access milna chahiye.

       REJECTED ko bhi completely block nahi karna,
       taki user details fix karke re-submit kar sake.
    ====================================================== */

    /* ======================================================
       ATTACH AUTHENTICATED VENDOR
    ====================================================== */

    req.vendor = vendor;

    /*
      Compatibility:
      Agar kisi old/new controller me req.user use ho.
    */

    req.user = vendor;

    next();
  } catch (error) {
    console.error(
      "❌ Auth Middleware Error:",
      error.message
    );

    /* ======================================================
       EXPIRED TOKEN
    ====================================================== */

    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        code:
          "TOKEN_EXPIRED",
        message:
          "Session expired. Please sign in again.",
      });
    }

    /* ======================================================
       INVALID TOKEN
    ====================================================== */

    if (
      error.name ===
      "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        code:
          "INVALID_TOKEN",
        message:
          "Invalid authentication token.",
      });
    }

    /* ======================================================
       TOKEN NOT ACTIVE YET
    ====================================================== */

    if (
      error.name ===
      "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        code:
          "TOKEN_NOT_ACTIVE",
        message:
          "Authentication token is not active yet.",
      });
    }

    /* ======================================================
       FALLBACK
    ====================================================== */

    return res.status(401).json({
      success: false,
      message:
        "Authentication failed.",
    });
  }
};

module.exports = protect;