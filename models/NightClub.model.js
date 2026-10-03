const mongoose = require("mongoose");

const nightClubSchema = new mongoose.Schema(
  {
    // =====================================================
    // VENDOR
    // =====================================================

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    // =====================================================
    // BASIC INFORMATION
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    venueType: {
      type: String,
      enum: [
        "nightclub",
        "lounge",
        "pub",
        "bar",
        "rooftop",
        "club",
        "other",
      ],
      default: "nightclub",
      index: true,
    },

    // =====================================================
    // LOCATION
    // =====================================================

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    pincode: {
      type: String,
      default: "",
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

    // =====================================================
    // CONTACT
    // =====================================================

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    instagram: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // MEDIA
    // =====================================================

    // Main logo
    logo: {
      type: String,
      default: "",
    },

    // Main/cover image
    coverImage: {
      type: String,
      default: "",
    },

    // Multiple club photos
    images: [
      {
        type: String,
      },
    ],

    // Club videos / venue videos
    videos: [
      {
        type: String,
      },
    ],

    // =====================================================
    // CAPACITY
    // =====================================================

    totalCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // MUSIC
    // =====================================================

    musicGenres: [
      {
        type: String,
        trim: true,
      },
    ],

    residentDJs: [
      {
        type: String,
        trim: true,
      },
    ],

    liveDJAvailable: {
      type: Boolean,
      default: false,
    },

    liveBandAvailable: {
      type: Boolean,
      default: false,
    },

    danceFloorAvailable: {
      type: Boolean,
      default: true,
    },

    // =====================================================
    // ENTRY
    // =====================================================

    minimumAge: {
      type: Number,
      default: 18,
      min: 18,
    },

    dressCodeRequired: {
      type: Boolean,
      default: false,
    },

    dressCode: {
      type: String,
      default: "",
      trim: true,
    },

    stagAllowed: {
      type: Boolean,
      default: true,
    },

    coupleEntryAvailable: {
      type: Boolean,
      default: true,
    },

    // =====================================================
    // TIMINGS
    // =====================================================

    operatingDays: [
      {
        type: String,
        trim: true,
      },
    ],

    openingTime: {
      type: String,
      default: "",
    },

    closingTime: {
      type: String,
      default: "",
    },

    lastEntryTime: {
      type: String,
      default: "",
    },

    // =====================================================
    // FACILITIES
    // =====================================================

    alcoholAvailable: {
      type: Boolean,
      default: false,
    },

    parkingAvailable: {
      type: Boolean,
      default: false,
    },

    valetAvailable: {
      type: Boolean,
      default: false,
    },

    vipSectionAvailable: {
      type: Boolean,
      default: false,
    },

    privateBoothAvailable: {
      type: Boolean,
      default: false,
    },

    smokingAreaAvailable: {
      type: Boolean,
      default: false,
    },

    wheelchairAccessible: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // LICENSE / SAFETY DOCUMENTS
    // =====================================================

    alcoholLicenseNumber: {
      type: String,
      default: "",
      trim: true,
    },

    alcoholLicenseDocument: {
      type: String,
      default: "",
    },

    exciseLicenseNumber: {
      type: String,
      default: "",
      trim: true,
    },

    exciseLicenseDocument: {
      type: String,
      default: "",
    },

    fireNOCNumber: {
      type: String,
      default: "",
      trim: true,
    },

    fireNOCDocument: {
      type: String,
      default: "",
    },

    // =====================================================
    // POLICIES
    // =====================================================

    cancellationPolicy: {
      type: String,
      default: "",
    },

    refundPolicy: {
      type: String,
      default: "",
    },

    entryPolicy: {
      type: String,
      default: "",
    },

    prohibitedItems: [
      {
        type: String,
        trim: true,
      },
    ],

    // =====================================================
    // STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "inactive",
      ],
      default: "draft",
      index: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

nightClubSchema.index({
  vendorId: 1,
  city: 1,
});

nightClubSchema.index({
  city: 1,
  status: 1,
  isPublished: 1,
});

// =====================================================
// MODEL
// =====================================================

module.exports = mongoose.model(
  "NightClub",
  nightClubSchema
);