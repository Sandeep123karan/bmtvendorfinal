const jwt = require("jsonwebtoken");
const User = require("../models/User.model");


const generateToken = (id) => {
  return jwt.sign(
    {
      id,
      role: "user",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


/* ==========================================================
   REGISTER
========================================================== */

exports.registerUser = async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone,
      password,
      confirmPassword,
    } = req.body;


    if (
      !fullname ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }


    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }


    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });


    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }


    const user = await User.create({
      fullname: fullname.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      provider: "local",
      role: "user",
      isActive: true,
    });


    const token = generateToken(user._id);


    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        provider: user.provider,
      },
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
   LOGIN
========================================================== */

exports.loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;


    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }


    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");


    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }


    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }


    const isMatch = await user.matchPassword(
      password
    );


    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }


    const token = generateToken(user._id);


    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        provider: user.provider,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
   PROFILE
========================================================== */

exports.getUserProfile = async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
};