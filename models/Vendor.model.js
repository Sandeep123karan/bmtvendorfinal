// models/Vendor.model.js

const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    // ===========================
    // Basic Details
    // ===========================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true, 
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

 service: {
  type: String,
  enum: [
   

    // Hotels & Stay
    "hotel",
    "homestay",
    "resort",
    "villa",
    "apartment",
    "guesthouse",
    "hostel",
    "camp",
    "farmhouse",

    // Transport
    "cab",
   
    "bus",
   

    // Holiday
    "holiday-package",
    

   

    // Religious
    "BMT Darshan",
   

    // Visa
    "visa",

    // Insurance
    "travel-insurance",



    // Cruise
    "cruise",



  


  
    "vacation-home",

    // Misc
    "other"
  ],
  required: true,
},

    // ===========================
    // Company Details
    // ===========================
    companyName: {
      type: String,
      default: "",
      trim: true,
    },

    gstNumber: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    panNumber: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    // ===========================
    // Aadhaar
    // ===========================
    aadharNumber: {
      type: String,
      default: "",
      trim: true,
    },

    aadharFront: {
      type: String,
      default: "",
    },

    aadharBack: {
      type: String,
      default: "",
    },

    // ===========================
    // PAN
    // ===========================
    panCardNumber: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    panCard: {
      type: String,
      default: "",
    },

    // ===========================
    // GST
    // ===========================
    gstRegistrationNumber: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    gstCertificate: {
      type: String,
      default: "",
    },

    // ===========================
    // Bank Details
    // ===========================
    accountHolderName: {
      type: String,
      default: "",
    },

    bankName: {
      type: String,
      default: "",
    },

    accountNumber: {
      type: String,
      default: "",
    },

    ifscCode: {
      type: String,
      default: "",
      uppercase: true,
    },

    cancelledCheque: {
      type: String,
      default: "",
    },

    passbookImage: {
      type: String,
      default: "",
    },

    // ===========================
    // Verification
    // ===========================
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    // ===========================
    // Admin Approval
    // ===========================
    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    // ===========================
    // Profile
    // ===========================
    profileImage: {
      type: String,
      default: "",
    },

    // ===========================
    // Account
    // ===========================
    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: Date,

    refreshToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vendor", vendorSchema);