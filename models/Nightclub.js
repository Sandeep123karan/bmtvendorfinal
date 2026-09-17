const mongoose = require("mongoose");

const nightclubSchema = new mongoose.Schema(
  {
    // ==========================================
    // VENDOR OWNER
    // ==========================================
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    // ==========================================
    // BASIC NIGHTCLUB DETAILS
    // ==========================================
    clubName: {
      type: String,
      required: true,
      trim: true,
    },

    legalBusinessName: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // CONTACT DETAILS
    // ==========================================
    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    alternatePhone: {
      type: String,
      default: "",
      trim: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // ADDRESS / LOCATION
    // ==========================================
    address: {
      type: String,
      required: true,
      trim: true,
    },

    landmark: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    // ==========================================
    // BUSINESS DETAILS
    // ==========================================
    businessType: {
      type: String,
      enum: [
        "individual",
        "proprietorship",
        "partnership",
        "private-limited",
        "public-limited",
        "llp",
        "other",
      ],
      default: "individual",
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

    // ==========================================
    // CLUB FEATURES
    // ==========================================
    clubType: {
      type: String,
      enum: [
        "nightclub",
        "lounge",
        "pub",
        "bar",
        "discotheque",
        "live-music",
        "other",
      ],
      default: "nightclub",
    },

    capacity: {
      type: Number,
      default: 0,
      min: 0,
    },

    danceFloorAvailable: {
      type: Boolean,
      default: false,
    },

    liveMusicAvailable: {
      type: Boolean,
      default: false,
    },

    djAvailable: {
      type: Boolean,
      default: false,
    },

    vipAvailable: {
      type: Boolean,
      default: false,
    },

    privatePartyAvailable: {
      type: Boolean,
      default: false,
    },

    foodAvailable: {
      type: Boolean,
      default: false,
    },

    parkingAvailable: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // OPENING HOURS
    // ==========================================
    openingTime: {
      type: String,
      default: "",
    },

    closingTime: {
      type: String,
      default: "",
    },

    openDays: [
      {
        type: String,
      },
    ],

    // ==========================================
    // PRICING
    // ==========================================
    entryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    coupleEntryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    stagEntryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // IMAGES
    // ==========================================
    images: [
      {
        type: String,
      },
    ],

    coverImage: {
      type: String,
      default: "",
    },

    // ==========================================
    // LICENSE / DOCUMENTS
    // ==========================================
    licenseNumber: {
      type: String,
      default: "",
      trim: true,
    },

    licenseDocument: {
      type: String,
      default: "",
    },

    // ==========================================
    // BANK DETAILS
    // ==========================================
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
      trim: true,
    },

    // ==========================================
    // STATUS
    // ==========================================
    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    rejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

nightclubSchema.index({
  vendor: 1,
  status: 1,
});

nightclubSchema.index({
  city: 1,
  state: 1,
});

module.exports = mongoose.model("Nightclub", nightclubSchema);