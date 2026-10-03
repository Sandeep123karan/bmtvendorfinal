const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const tourSchema = new mongoose.Schema(
  {
    // =========================
    // VENDOR
    // =========================
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    // =========================
    // BASIC INFORMATION
    // =========================
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    shortDescription: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // LOCATION
    // =========================
    location: {
      city: {
        type: String,
        required: true,
        trim: true,
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

    // =========================
    // DURATION
    // =========================
    duration: {
      value: {
        type: Number,
        required: true,
        min: 1,
      },

      unit: {
        type: String,
        enum: ["hours", "days"],
        required: true,
      },
    },

    // =========================
    // IMAGES
    // =========================
    images: {
      type: [String],
      default: [],
    },

    // =========================
    // INCLUSIONS / EXCLUSIONS
    // =========================
    inclusions: {
      type: [String],
      default: [],
    },

    exclusions: {
      type: [String],
      default: [],
    },

    // =========================
    // ITINERARY
    // =========================
    itinerary: {
      type: [itinerarySchema],
      default: [],
    },

    // =========================
    // PRICING
    // =========================
    pricing: {
      adult: {
        type: Number,
        required: true,
        min: 0,
      },

      child: {
        type: Number,
        default: 0,
        min: 0,
      },

      infant: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // =========================
    // CAPACITY
    // =========================
    maxGuests: {
      type: Number,
      required: true,
      min: 1,
    },

    // =========================
    // MEETING POINT
    // =========================
    meetingPoint: {
      type: String,
      trim: true,
    },

    // =========================
    // CANCELLATION POLICY
    // =========================
    cancellationPolicy: {
      type: String,
      trim: true,
    },

    // =========================
    // TERMS
    // =========================
    termsAndConditions: {
      type: String,
      trim: true,
    },

    // =========================
    // STATUS
    // =========================
    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED"],
      default: "DRAFT",
    },

    // =========================
    // ACTIVE / INACTIVE
    // =========================
    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tour", tourSchema);