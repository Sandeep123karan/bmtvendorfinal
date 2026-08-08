const Vendor = require("../models/Vendor.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
/* ==========================================================
                    VENDOR SIGNUP
========================================================== */

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      service,
      companyName,
      gstNumber,
      panNumber,
      address,
      city,
      state,
      pincode,
    } = req.body;

    /* ---------------- Validation ---------------- */

    if (!name || !email || !phone || !password || !service) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory.",
      });
    }

    /* ---------------- Email Exists ---------------- */

    const emailExists = await Vendor.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    /* ---------------- Phone Exists ---------------- */

    const phoneExists = await Vendor.findOne({ phone });

    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered.",
      });
    }

    /* ---------------- Password ---------------- */

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    /* ---------------- Create Vendor ---------------- */

    const vendor = await Vendor.create({
      name,
      email,
      phone,
      password: hashedPassword,

      service,

      companyName,

      gstNumber,

      panNumber,

      address,

      city,

      state,

      pincode,

      status: "PENDING",

      isApproved: false,

      isEmailVerified: false,

      isPhoneVerified: false,
    });

    return res.status(201).json({
      success: true,

      message:
        "Signup successful. Your account is waiting for admin approval.",

      vendor: {
        id: vendor._id,

        name: vendor.name,

        email: vendor.email,

        phone: vendor.phone,

        service: vendor.service,

        status: vendor.status,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};/* ==========================================================
                    VENDOR LOGIN
========================================================== */

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* ---------------- Validation ---------------- */

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    /* ---------------- Find Vendor ---------------- */

    const vendor = await Vendor.findOne({
      email: email.toLowerCase(),
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    /* ---------------- Pending Approval ---------------- */

    if (vendor.status === "PENDING") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is under review. Please wait for admin approval.",
      });
    }

    /* ---------------- Rejected ---------------- */

    if (vendor.status === "REJECTED") {
      return res.status(403).json({
        success: false,
        message:
          vendor.rejectionReason ||
          "Your account has been rejected by admin.",
      });
    }

    /* ---------------- Account Active ---------------- */

    if (!vendor.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled.",
      });
    }

    /* ---------------- Password ---------------- */

    const isMatch = await bcrypt.compare(
      password,
      vendor.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    /* ---------------- JWT ---------------- */

    const token = jwt.sign(
      {
        id: vendor._id,
        email: vendor.email,
        service: vendor.service,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    /* ---------------- Update Last Login ---------------- */

    vendor.lastLogin = new Date();

    await vendor.save();

    /* ---------------- Response ---------------- */

    return res.status(200).json({
      success: true,

      message: "Login successful.",

      token,

      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        service: vendor.service,
        companyName: vendor.companyName,
        profileImage: vendor.profileImage,
        status: vendor.status,
        isApproved: vendor.isApproved,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* ==========================================================
                GET ALL PENDING VENDORS
========================================================== */

exports.getPendingVendors = async (req, res) => {
  try {

    const vendors = await Vendor.find({
      status: "PENDING",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: vendors.length,
      vendors,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


/* ==========================================================
                  APPROVE VENDOR
========================================================== */

exports.approveVendor = async (req, res) => {

  try {

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {

      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });

    }

    if (vendor.status === "APPROVED") {

      return res.status(400).json({
        success: false,
        message: "Vendor already approved.",
      });

    }

    vendor.status = "APPROVED";

    vendor.isApproved = true;

    vendor.approvedAt = new Date();

    if (req.admin) {
      vendor.approvedBy = req.admin._id;
    }

    await vendor.save();

    return res.status(200).json({

      success: true,

      message: "Vendor approved successfully.",

      vendor,

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};


/* ==========================================================
                  REJECT VENDOR
========================================================== */

exports.rejectVendor = async (req, res) => {

  try {

    const { rejectionReason } = req.body;

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {

      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });

    }

    vendor.status = "REJECTED";

    vendor.isApproved = false;

    vendor.rejectionReason =
      rejectionReason || "Rejected by admin.";

    await vendor.save();

    return res.status(200).json({

      success: true,

      message: "Vendor rejected successfully.",

      vendor,

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};/* ==========================================================
                  GET VENDOR PROFILE
========================================================== */

// exports.getVendorProfile = async (req, res) => {
//   try {
//     const vendor = await Vendor.findById(req.vendor._id).select(
//       "-password -refreshToken"
//     );

//     if (!vendor) {
//       return res.status(404).json({
//         success: false,
//         message: "Vendor not found.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Vendor profile fetched successfully.",
//       vendor,
//     });
//   } catch (error) {
//     console.error("Get Vendor Profile Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


exports.getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id)
      .select("-password -refreshToken");

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor profile fetched successfully",
      vendor,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// const Vendor = require("../models/Vendor.model");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const uploadToCloudinary = require("../utils/uploadToCloudinary");

// /* ==========================================================
//                     VENDOR SIGNUP
// ========================================================== */

// exports.signup = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       phone,
//       password,
//       service,

//       companyName,
//       gstNumber,
//       panNumber,

//       address,
//       city,
//       state,
//       pincode,

//       aadharNumber,

//       accountHolderName,
//       bankName,
//       accountNumber,
//       ifscCode,
//     } = req.body;

//     /* =====================================================
//                     REQUIRED VALIDATION
//     ====================================================== */

//     if (
//       !name ||
//       !email ||
//       !phone ||
//       !password ||
//       !service
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Name, Email, Phone, Password and Service are required.",
//       });
//     }

//     /* =====================================================
//                     EMAIL VALIDATION
//     ====================================================== */

//     const emailRegex =
//       /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email format.",
//       });
//     }

//     /* =====================================================
//                     PHONE VALIDATION
//     ====================================================== */

//     if (!/^[6-9]\d{9}$/.test(phone)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid phone number.",
//       });
//     }

//     /* =====================================================
//                     PASSWORD VALIDATION
//     ====================================================== */

//     if (password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Password must be at least 6 characters.",
//       });
//     }

//     /* =====================================================
//                     CHECK EMAIL
//     ====================================================== */

//     const emailExist = await Vendor.findOne({
//       email: email.toLowerCase(),
//     });

//     if (emailExist) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already registered.",
//       });
//     }

//     /* =====================================================
//                     CHECK PHONE
//     ====================================================== */

//     const phoneExist = await Vendor.findOne({
//       phone,
//     });

//     if (phoneExist) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Phone number already registered.",
//       });
//     }

//     /* =====================================================
//                     HASH PASSWORD
//     ====================================================== */

//     const hashedPassword = await bcrypt.hash(
//       password,
//       10
//     );

//     /* =====================================================
//               IMAGE VARIABLES (Cloudinary)
//     ====================================================== */

//     let profileImage = "";

//     let aadharFront = "";

//     let aadharBack = "";

//     let panCard = "";

//     let gstCertificate = "";

//     let cancelledCheque = "";

//     let passbookImage = "";

//     // ==========================================
//     // PART-2 se yahin se continue hoga...
//     // Cloudinary Upload Logic
//     // ==========================================

//   } catch (error) {
//     console.log("Signup Error :", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };/* =====================================================
//             PROFILE IMAGE
// ===================================================== */

// if (req.files?.profileImage?.[0]) {
//   profileImage = await uploadToCloudinary(
//     req.files.profileImage[0].buffer,
//     "vendors/profile"
//   );
// }

// /* =====================================================
//             AADHAAR FRONT
// ===================================================== */

// if (req.files?.aadharFront?.[0]) {
//   aadharFront = await uploadToCloudinary(
//     req.files.aadharFront[0].buffer,
//     "vendors/aadhar"
//   );
// }

// /* =====================================================
//             AADHAAR BACK
// ===================================================== */

// if (req.files?.aadharBack?.[0]) {
//   aadharBack = await uploadToCloudinary(
//     req.files.aadharBack[0].buffer,
//     "vendors/aadhar"
//   );
// }

// /* =====================================================
//             PAN CARD
// ===================================================== */

// if (req.files?.panCard?.[0]) {
//   panCard = await uploadToCloudinary(
//     req.files.panCard[0].buffer,
//     "vendors/pan"
//   );
// }

// /* =====================================================
//             GST CERTIFICATE
// ===================================================== */

// if (req.files?.gstCertificate?.[0]) {
//   gstCertificate = await uploadToCloudinary(
//     req.files.gstCertificate[0].buffer,
//     "vendors/gst"
//   );
// }

// /* =====================================================
//             CANCELLED CHEQUE
// ===================================================== */

// if (req.files?.cancelledCheque?.[0]) {
//   cancelledCheque = await uploadToCloudinary(
//     req.files.cancelledCheque[0].buffer,
//     "vendors/bank"
//   );
// }

// /* =====================================================
//             PASSBOOK IMAGE
// ===================================================== */

// if (req.files?.passbookImage?.[0]) {
//   passbookImage = await uploadToCloudinary(
//     req.files.passbookImage[0].buffer,
//     "vendors/bank"
//   );
// }

// /* =====================================================
//         PART-3 SE CONTINUE HOGA...
//         Vendor Create + JWT + Response
// ===================================================== */
