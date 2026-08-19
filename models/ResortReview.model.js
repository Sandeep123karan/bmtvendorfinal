const mongoose = require("mongoose");

const resortReviewSchema = new mongoose.Schema(
  {
    // ==========================================
    // RESORT
    // ==========================================

    resort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resort",
      required: true,
      index: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    // ==========================================
    // BOOKING
    // One booking = one review
    // ==========================================

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResortBooking",
      required: true,
      unique: true,
      index: true,
    },

    // ==========================================
    // USER DETAILS
    // फिलहाल guest snapshot store कर रहे हैं
    // बाद में User model connect कर सकते हो
    // ==========================================

    guest: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // ==========================================
    // OVERALL RATING
    // ==========================================

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // ==========================================
    // DETAILED RATINGS
    // ==========================================

    ratings: {
      cleanliness: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },

      service: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },

      location: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },

      valueForMoney: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },

      roomQuality: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },

      food: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
    },

    // ==========================================
    // REVIEW CONTENT
    // ==========================================

    title: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    pros: {
      type: [String],
      default: [],
    },

    cons: {
      type: [String],
      default: [],
    },

    // ==========================================
    // IMAGES
    // ==========================================

    images: [
      {
        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
          default: "",
        },
      },
    ],

    // ==========================================
    // VENDOR RESPONSE
    // ==========================================

    vendorReply: {
      message: {
        type: String,
        default: "",
        trim: true,
        maxlength: 2000,
      },

      repliedAt: {
        type: Date,
        default: null,
      },
    },

    // ==========================================
    // STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "HIDDEN",
      ],
      default: "PENDING",
      index: true,
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    isVerifiedStay: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


// ==========================================
// FAST REVIEW SEARCH
// ==========================================

resortReviewSchema.index({
  resort: 1,
  status: 1,
  createdAt: -1,
});

resortReviewSchema.index({
  vendor: 1,
  status: 1,
  createdAt: -1,
});


module.exports = mongoose.model(
  "ResortReview",
  resortReviewSchema
);