const Vendor = require("../models/Vendor.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


/* ==========================================================
                    HELPER FUNCTIONS
========================================================== */

// Convert value to array
const parseArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      // normal comma separated string
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};


// Convert object/string JSON
const parseObject = (value, fallback = {}) => {
  if (!value) return fallback;

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};


// Boolean helper
const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return String(value).toLowerCase() === "true";
};


/* ==========================================================
                    VENDOR SIGNUP
       SINGLE REGISTER PAGE - MULTIPLE SERVICES
       NO FIELD MANDATORY
========================================================== */

exports.signup = async (req, res) => {
  try {
    const body = req.body || {};


    /* ======================================================
                    BASIC VALUES
    ====================================================== */

    const name = body.name?.trim() || "";

    const email = body.email
      ? body.email.toLowerCase().trim()
      : "";

    const phone = body.phone?.trim() || "";

    const password = body.password || "";


    /* ======================================================
                    SERVICES

      Supports:
      services: ["hotel", "car-rental", "bus"]

      OR

      services: '["hotel","car-rental","bus"]'

      OR

      services: "hotel,car-rental,bus"

      OR old service: "hotel"
    ====================================================== */

    let services = parseArray(body.services);

    // Backward compatibility with old `service`
    if (services.length === 0 && body.service) {
      services = [body.service];
    }

    // Remove empty + duplicate services
    services = [
      ...new Set(
        services
          .map((item) => String(item).trim())
          .filter(Boolean)
      ),
    ];


    /* ======================================================
                    EMAIL CHECK
      Only check if email is actually provided
    ====================================================== */

    if (email) {
      const emailExists = await Vendor.findOne({ email });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already registered.",
        });
      }
    }


    /* ======================================================
                    PHONE CHECK
      Only check if phone is actually provided
    ====================================================== */

    if (phone) {
      const phoneExists = await Vendor.findOne({ phone });

      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: "Phone number already registered.",
        });
      }
    }


    /* ======================================================
                    PASSWORD
      Optional according to your requirement.

      If password comes, hash it.
      If empty, store empty string.
    ====================================================== */

    let hashedPassword = "";

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters.",
        });
      }

      hashedPassword = await bcrypt.hash(password, 10);
    }


    /* ======================================================
                    SERVICE DETAILS

      JSON can come from frontend as:
      carRentalDetails: {...}
      busDetails: {...}
      stayDetails: {...}
    ====================================================== */

    const carRentalInput = parseObject(
      body.carRentalDetails,
      {}
    );

    const busInput = parseObject(
      body.busDetails,
      {}
    );

    const stayInput = parseObject(
      body.stayDetails,
      {}
    );


    /* ======================================================
                    CREATE VENDOR
    ====================================================== */

    const vendor = await Vendor.create({

      // ==========================================
      // BASIC
      // ==========================================

      name,

      email,

      phone,

      password: hashedPassword,

      profileImage: body.profileImage || "",


      // ==========================================
      // SERVICES
      // ==========================================

      services,

      // Old code compatibility
      service: body.service || services[0] || "",


      // ==========================================
      // COMPANY DETAILS
      // ==========================================

      companyName: body.companyName || "",

      businessName: body.businessName || "",

      legalBusinessName:
        body.legalBusinessName || "",

      businessType: body.businessType || "",


      // ==========================================
      // BUSINESS CONTACT
      // ==========================================

      businessEmail:
        body.businessEmail || "",

      businessPhone:
        body.businessPhone || "",

      alternatePhone:
        body.alternatePhone || "",

      website:
        body.website || "",


      // ==========================================
      // ADDRESS
      // ==========================================

      address:
        body.address || "",

      addressLine1:
        body.addressLine1 || "",

      addressLine2:
        body.addressLine2 || "",

      landmark:
        body.landmark || "",

      city:
        body.city || "",

      state:
        body.state || "",

      country:
        body.country || "India",

      pincode:
        body.pincode || "",


      // ==========================================
      // GST
      // ==========================================

      gstNumber:
        body.gstNumber || "",

      gstRegistrationNumber:
        body.gstRegistrationNumber || "",

      gstCertificate:
        body.gstCertificate || "",


      // ==========================================
      // PAN
      // ==========================================

      panNumber:
        body.panNumber || "",

      panCardNumber:
        body.panCardNumber || "",

      panCard:
        body.panCard || "",


      // ==========================================
      // AADHAAR
      // ==========================================

      aadharNumber:
        body.aadharNumber || "",

      aadharFront:
        body.aadharFront || "",

      aadharBack:
        body.aadharBack || "",


      // ==========================================
      // BANK DETAILS
      // ==========================================

      accountHolderName:
        body.accountHolderName || "",

      bankName:
        body.bankName || "",

      branchName:
        body.branchName || "",

      accountNumber:
        body.accountNumber || "",

      confirmAccountNumber:
        body.confirmAccountNumber || "",

      ifscCode:
        body.ifscCode || "",

      cancelledCheque:
        body.cancelledCheque || "",

      passbookImage:
        body.passbookImage || "",


      // ==========================================
      // CAR RENTAL DETAILS
      // ==========================================

      carRentalDetails: {

        businessModel:
          carRentalInput.businessModel ||
          body.carRentalBusinessModel ||
          "",

        totalVehicles: Number(
          carRentalInput.totalVehicles ??
          body.totalVehicles ??
          0
        ),

        vehicleTypes: parseArray(
          carRentalInput.vehicleTypes ||
          body.vehicleTypes
        ),

        serviceCities: parseArray(
          carRentalInput.serviceCities ||
          body.serviceCities
        ),

        airportPickupAvailable: parseBoolean(
          carRentalInput.airportPickupAvailable ??
          body.airportPickupAvailable
        ),

        outstationAvailable: parseBoolean(
          carRentalInput.outstationAvailable ??
          body.outstationAvailable
        ),

        localRentalAvailable: parseBoolean(
          carRentalInput.localRentalAvailable ??
          body.localRentalAvailable
        ),

        driverProvided: parseBoolean(
          carRentalInput.driverProvided ??
          body.driverProvided
        ),

        selfDriveAvailable: parseBoolean(
          carRentalInput.selfDriveAvailable ??
          body.selfDriveAvailable
        ),

        transportLicenseNumber:
          carRentalInput.transportLicenseNumber ||
          body.transportLicenseNumber ||
          "",

        licenseDocument:
          carRentalInput.licenseDocument ||
          body.licenseDocument ||
          "",
      },


      // ==========================================
      // BUS DETAILS
      // ==========================================

      busDetails: {

        operatorName:
          busInput.operatorName ||
          body.operatorName ||
          "",

        totalBuses: Number(
          busInput.totalBuses ??
          body.totalBuses ??
          0
        ),

        busTypes: parseArray(
          busInput.busTypes ||
          body.busTypes
        ),

        operatingCities: parseArray(
          busInput.operatingCities ||
          body.busOperatingCities
        ),

        routes: parseArray(
          busInput.routes ||
          body.busRoutes
        ),

        transportPermitNumber:
          busInput.transportPermitNumber ||
          body.transportPermitNumber ||
          "",

        transportPermitDocument:
          busInput.transportPermitDocument ||
          body.transportPermitDocument ||
          "",

        operatorLicenseNumber:
          busInput.operatorLicenseNumber ||
          body.operatorLicenseNumber ||
          "",

        operatorLicenseDocument:
          busInput.operatorLicenseDocument ||
          body.operatorLicenseDocument ||
          "",
      },


      // ==========================================
      // HOTEL / STAY DETAILS
      // ==========================================

      stayDetails: {

        totalProperties: Number(
          stayInput.totalProperties ??
          body.totalProperties ??
          0
        ),

        propertyTypes: parseArray(
          stayInput.propertyTypes ||
          body.propertyTypes
        ),

        operatingCities: parseArray(
          stayInput.operatingCities ||
          body.stayOperatingCities
        ),
      },


      // ==========================================
      // VERIFICATION / APPROVAL
      // ==========================================

      isEmailVerified: false,

      isPhoneVerified: false,

      status: "PENDING",

      isApproved: false,

      isActive: true,
    });


    /* ======================================================
                    RESPONSE
    ====================================================== */

    return res.status(201).json({
      success: true,

      message:
        "Vendor registration successful. Your account is waiting for admin approval.",

      vendor: {
        id: vendor._id,

        name: vendor.name,

        email: vendor.email,

        phone: vendor.phone,

        service: vendor.service,

        services: vendor.services,

        companyName: vendor.companyName,

        businessName: vendor.businessName,

        status: vendor.status,

        isApproved: vendor.isApproved,

        createdAt: vendor.createdAt,
      },
    });

  } catch (error) {

    console.error(
      "❌ Vendor Signup Error:",
      error
    );

    // Mongo duplicate error fallback
    if (error.code === 11000) {

      const field = Object.keys(
        error.keyPattern || {}
      )[0] || "field";

      return res.status(400).json({
        success: false,
        message: `${field} already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Vendor registration failed.",
    });
  }
};


/* ==========================================================
                    VENDOR LOGIN
========================================================== */

exports.login = async (req, res) => {
  try {

    const email = req.body.email
      ? req.body.email.toLowerCase().trim()
      : "";

    const password = req.body.password || "";


    // Login ke liye email/password required rahenge
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required for login.",
      });
    }


    const vendor = await Vendor.findOne({ email });


    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }


    // Password empty account
    if (!vendor.password) {
      return res.status(400).json({
        success: false,
        message:
          "Password is not set for this vendor account.",
      });
    }


    /* ---------------- PENDING ---------------- */

    if (vendor.status === "PENDING") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is under review. Please wait for admin approval.",
      });
    }


    /* ---------------- REJECTED ---------------- */

    if (vendor.status === "REJECTED") {
      return res.status(403).json({
        success: false,
        message:
          vendor.rejectionReason ||
          "Your account has been rejected by admin.",
      });
    }


    /* ---------------- APPROVED CHECK ---------------- */

    if (
      vendor.status !== "APPROVED" ||
      !vendor.isApproved
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your vendor account is not approved.",
      });
    }


    /* ---------------- ACTIVE CHECK ---------------- */

    if (!vendor.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled.",
      });
    }


    /* ---------------- PASSWORD CHECK ---------------- */

    const isMatch = await bcrypt.compare(
      password,
      vendor.password
    );


    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }


    /* ---------------- JWT ---------------- */

    const token = jwt.sign(
      {
        id: vendor._id,
        email: vendor.email,

        // old code
        service: vendor.service,

        // new multiple services
        services: vendor.services,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );


    /* ---------------- LAST LOGIN ---------------- */

    vendor.lastLogin = new Date();

    await vendor.save();


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
        services: vendor.services,

        companyName: vendor.companyName,
        businessName: vendor.businessName,

        profileImage: vendor.profileImage,

        status: vendor.status,
        isApproved: vendor.isApproved,
      },
    });

  } catch (error) {

    console.error(
      "❌ Vendor Login Error:",
      error
    );

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
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });


    return res.status(200).json({
      success: true,
      total: vendors.length,
      vendors,
    });

  } catch (error) {

    console.error(
      "❌ Get Pending Vendors Error:",
      error
    );

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

    const vendor = await Vendor.findById(
      req.params.id
    );


    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }


    vendor.status = "APPROVED";
    vendor.isApproved = true;
    vendor.approvedAt = new Date();
    vendor.rejectionReason = "";


    if (req.admin?._id) {
      vendor.approvedBy = req.admin._id;
    }


    await vendor.save();


    return res.status(200).json({
      success: true,
      message: "Vendor approved successfully.",
      vendor,
    });

  } catch (error) {

    console.error(
      "❌ Approve Vendor Error:",
      error
    );

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


    const vendor = await Vendor.findById(
      req.params.id
    );


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

    console.error(
      "❌ Reject Vendor Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    GET VENDOR PROFILE
========================================================== */

exports.getVendorProfile = async (req, res) => {
  try {

    const vendor = await Vendor.findById(
      req.vendor._id
    ).select("-password -refreshToken");


    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }


    return res.status(200).json({
      success: true,
      message:
        "Vendor profile fetched successfully.",
      vendor,
    });

  } catch (error) {

    console.error(
      "❌ Get Vendor Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};