const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
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

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    activityType: {
      type: String,
      enum: [
        "SIGHTSEEING",
        "ADVENTURE",
        "WATER_ACTIVITY",
        "CULTURAL",
        "ENTERTAINMENT",
        "FOOD",
        "WILDLIFE",
        "SPORTS",
        "WELLNESS",
        "OTHER",
      ],
      default: "OTHER",
      index: true,
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    highlights: [
      {
        type: String,
        trim: true,
      },
    ],

    // =====================================================
    // LOCATION
    // =====================================================

    location: {
      city: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      state: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        trim: true,
        default: "India",
      },

      address: {
        type: String,
        trim: true,
      },

      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },
    },

    // =====================================================
    // DURATION
    // =====================================================

    duration: {
      value: {
        type: Number,
        min: 0,
        default: 0,
      },

      unit: {
        type: String,
        enum: ["hours", "days"],
        default: "hours",
      },
    },

    // =====================================================
    // IMAGES
    // Cloudinary URLs
    // =====================================================

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    thumbnail: {
      type: String,
      trim: true,
    },

    // =====================================================
    // PRICING
    // =====================================================

    pricing: {
      adult: {
        type: Number,
        min: 0,
        default: 0,
      },

      child: {
        type: Number,
        min: 0,
        default: 0,
      },

      infant: {
        type: Number,
        min: 0,
        default: 0,
      },
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
    },

    // =====================================================
    // CAPACITY
    // =====================================================

    maxGuests: {
      type: Number,
      min: 1,
      default: 1,
    },

    // =====================================================
    // MEETING / PICKUP
    // =====================================================

    meetingPoint: {
      type: String,
      trim: true,
    },

    pickupAvailable: {
      type: Boolean,
      default: false,
    },

    pickupDetails: {
      type: String,
      trim: true,
    },

    // =====================================================
    // BOOKING SETTINGS
    // =====================================================

    instantConfirmation: {
      type: Boolean,
      default: true,
    },

    bookingCutoffHours: {
      type: Number,
      min: 0,
      default: 2,
    },

    // =====================================================
    // AGE
    // =====================================================

    minAge: {
      type: Number,
      min: 0,
      default: 0,
    },

    maxAge: {
      type: Number,
      min: 0,
    },

    // =====================================================
    // LANGUAGES
    // =====================================================

    languages: [
      {
        type: String,
        trim: true,
      },
    ],

    // =====================================================
    // INCLUSIONS / EXCLUSIONS
    // =====================================================

    inclusions: [
      {
        type: String,
        trim: true,
      },
    ],

    exclusions: [
      {
        type: String,
        trim: true,
      },
    ],

    requirements: [
      {
        type: String,
        trim: true,
      },
    ],

    // =====================================================
    // POLICIES
    // =====================================================

    cancellationPolicy: {
      type: String,
      trim: true,
    },

    termsAndConditions: {
      type: String,
      trim: true,
    },

    // =====================================================
    // STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING",
        "APPROVED",
        "REJECTED",
      ],
      default: "DRAFT",
      index: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

activitySchema.index({
  vendorId: 1,
  createdAt: -1,
});

activitySchema.index({
  vendorId: 1,
  status: 1,
});

activitySchema.index({
  vendorId: 1,
  category: 1,
});

activitySchema.index({
  "location.city": 1,
  category: 1,
});

module.exports =
  mongoose.models.Activity ||
  mongoose.model("Activity", activitySchema);