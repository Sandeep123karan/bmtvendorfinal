const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const BmtPartnerAccount = require(
  "../models/BmtPartnerAccount.model"
);

/* =====================================================
   JWT
===================================================== */

function createToken(partner) {
  return jwt.sign(
    {
      id: partner._id,
      partnerId: partner._id,
      email: partner.email,
      role: partner.role,
      vertical: partner.vertical,
      service: partner.service,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

/* =====================================================
   REGISTER
===================================================== */

exports.register = async (req, res) => {
  try {
    const {
      email,
      businessEmail,
      country,
      countryCode,
      phone,
      password,
      selectedVertical,
      vertical,
      service,
    } = req.body;

    const finalEmail = String(
      businessEmail || email || ""
    )
      .trim()
      .toLowerCase();

    /* VALIDATION */

    if (!finalEmail) {
      return res.status(400).json({
        success: false,
        message: "Business email is required.",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });
    }

    /* CHECK EMAIL */

    const existingAccount =
      await BmtPartnerAccount.findOne({
        email: finalEmail,
      });

    if (existingAccount) {
      return res.status(409).json({
        success: false,
        message:
          "An account already exists with this email. Please sign in.",
      });
    }

    /* HASH PASSWORD */

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const finalVertical =
      selectedVertical ||
      vertical ||
      service ||
      "";

    /* CREATE ACCOUNT */

    const partner =
      await BmtPartnerAccount.create({
        email: finalEmail,

        businessEmail: finalEmail,

        country: country || "",

        countryCode:
          countryCode || "",

        phone: String(phone).trim(),

        password: hashedPassword,

        selectedVertical:
          finalVertical,

        vertical:
          finalVertical,

        service:
          finalVertical,

        role: "owner",

        accountStatus: "active",

        onboardingStatus:
          "not_started",

        onboardingComplete: false,
      });

    /*
      IMPORTANT

      REGISTER KE BAAD JWT NAHI DENA.

      Account create hoga,
      user ko signin karna padega.
    */

    return res.status(201).json({
      success: true,

      message:
        "Account created successfully. Please sign in.",

      accountCreated: true,

      email: partner.email,
    });
  } catch (error) {
    console.error(
      "BMT REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Unable to create account.",
    });
  }
};

/* =====================================================
   LOGIN
===================================================== */

exports.login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();

    /*
      select("+password") important hai,
      kyunki model me password select:false hai.
    */

    const partner =
      await BmtPartnerAccount
        .findOne({
          email: normalizedEmail,
        })
        .select("+password");

    /* WRONG EMAIL */

    if (!partner) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    /* BLOCKED ACCOUNT */

    if (
      partner.accountStatus ===
        "blocked" ||
      partner.accountStatus ===
        "suspended"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not active.",
      });
    }

    /* CHECK PASSWORD */

    const passwordMatched =
      await bcrypt.compare(
        password,
        partner.password
      );

    /* WRONG PASSWORD */

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    /*
      EMAIL + PASSWORD DONO SAHI.
      ABHI TOKEN BANEGA.
    */

    partner.lastLoginAt =
      new Date();

    await partner.save();

    const token =
      createToken(partner);

    return res.status(200).json({
      success: true,

      message:
        "Login successful.",

      token,

      onboardingComplete:
        partner.onboardingComplete,

      onboardingStatus:
        partner.onboardingStatus,

      partner: {
        id: partner._id,

        email:
          partner.email,

        businessEmail:
          partner.businessEmail,

        country:
          partner.country,

        countryCode:
          partner.countryCode,

        phone:
          partner.phone,

        selectedVertical:
          partner.selectedVertical,

        vertical:
          partner.vertical,

        service:
          partner.service,

        role:
          partner.role,

        accountStatus:
          partner.accountStatus,

        onboardingStatus:
          partner.onboardingStatus,

        onboardingComplete:
          partner.onboardingComplete,
      },
    });
  } catch (error) {
    console.error(
      "BMT LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Unable to sign in.",
    });
  }
};

/* =====================================================
   CURRENT LOGGED-IN PARTNER
===================================================== */

exports.me = async (req, res) => {
  try {
    const partner =
      await BmtPartnerAccount.findById(
        req.partnerId
      );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message:
          "Partner account not found.",
      });
    }

    return res.json({
      success: true,

      partner,

      onboardingStatus:
        partner.onboardingStatus,

      onboardingComplete:
        partner.onboardingComplete,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Unable to load account.",
    });
  }
};