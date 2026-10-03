const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

/* ==========================================================
   USER AUTH MIDDLEWARE
   ==========================================================
   
   CUSTOMER / USER KE LIYE:

   1. Bearer token read karega
   2. JWT verify karega
   3. JWT ka user ID nikalega
   4. User collection se fresh user fetch karega
   5. User active hai ya nahi check karega
   6. req.user me authenticated USER attach karega

   IMPORTANT:
   Ye middleware VENDOR ke liye nahi hai.
   Vendor ke liye auth.middleware.js use hoga.
========================================================== */

const userAuth = async (req, res, next) => {
  try {
    /* ======================================================
       1. READ AUTHORIZATION HEADER
    ====================================================== */

    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "TOKEN_MISSING",
        message: "Authentication required. Token missing.",
      });
    }

    /* ======================================================
       2. EXTRACT TOKEN
    ====================================================== */

    const token = authorization
      .slice(7)
      .trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        code: "TOKEN_MISSING",
        message: "Authentication token missing.",
      });
    }

    /* ======================================================
       3. CHECK JWT SECRET
    ====================================================== */

    if (!process.env.JWT_SECRET) {
      console.error(
        "❌ JWT_SECRET is missing in .env"
      );

      return res.status(500).json({
        success: false,
        code: "JWT_SECRET_MISSING",
        message: "Server authentication configuration error.",
      });
    }

    /* ======================================================
       4. VERIFY JWT
    ====================================================== */

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    /* ======================================================
       5. CHECK USER ID
    ====================================================== */

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid authentication token.",
      });
    }

    /* ======================================================
       6. USER ROLE CHECK
       
       Register/Login ke time hum token me:
       
       {
         id: user._id,
         role: "user"
       }
       
       bhejenge.
    ====================================================== */

    if (decoded.role && decoded.role !== "user") {
      return res.status(403).json({
        success: false,
        code: "USER_AUTH_REQUIRED",
        message: "User authentication required.",
      });
    }

    /* ======================================================
       7. FETCH USER FROM DATABASE
       
       JWT me sirf ID trust nahi karenge.
       Fresh user DB se fetch karenge.
    ====================================================== */

    const user = await User.findById(
      decoded.id
    ).select(
      "-password -refreshToken"
    );

    /* ======================================================
       8. USER NOT FOUND
    ====================================================== */

    if (!user) {
      return res.status(401).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User account not found.",
      });
    }

    /* ======================================================
       9. USER ACTIVE CHECK
    ====================================================== */

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        code: "USER_INACTIVE",
        message: "Your account has been disabled.",
      });
    }

    /* ======================================================
       10. ATTACH USER TO REQUEST
       
       Ab controllers me:
       
       req.user._id
       req.user.email
       req.user.phone
       req.user.fullname
       
       available hoga.
    ====================================================== */

    req.user = user;

    /* ======================================================
       11. CONTINUE
    ====================================================== */

    next();

  } catch (error) {

    console.error(
      "❌ USER AUTH ERROR:",
      error.message
    );

    /* ======================================================
       TOKEN EXPIRED
    ====================================================== */

    if (
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Session expired. Please login again.",
      });
    }

    /* ======================================================
       INVALID TOKEN
    ====================================================== */

    if (
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid authentication token.",
      });
    }

    /* ======================================================
       TOKEN NOT ACTIVE
    ====================================================== */

    if (
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        code: "TOKEN_NOT_ACTIVE",
        message: "Authentication token is not active yet.",
      });
    }

    /* ======================================================
       FALLBACK
    ====================================================== */

    return res.status(401).json({
      success: false,
      code: "AUTH_FAILED",
      message: "Authentication failed.",
    });
  }
};


/* ==========================================================
   EXPORT
========================================================== */

module.exports = userAuth;