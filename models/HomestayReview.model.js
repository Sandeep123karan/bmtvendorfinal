// models/HomestayReview.model.js

const mongoose = require("mongoose");

/* ============================================================
   HOMESTAY REVIEW MODEL
============================================================ */

const homestayReviewSchema = new mongoose.Schema(
  {
    /* ==========================================================
       USER / GUEST
    ========================================================== */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    guestName: {
      type: String,
      required: true,
      trim: true,
    },

    guestImage: {
      type: String,
      default: "",
    },


    /* ==========================================================
       BOOKING REFERENCE
       One booking = one review
    ========================================================== */

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HomestayBooking",
      required: true,
      unique: true,
      index: true,
    },


    /* ==========================================================
       HOMESTAY
    ========================================================== */

    homestay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homestay",
      required: true,
      index: true,
    },

    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HomestayUnit",
      default: null,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },


    /* ==========================================================
       OVERALL RATING
    ========================================================== */

    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },


    /* ==========================================================
       DETAILED RATINGS
    ========================================================== */

    cleanlinessRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    locationRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    hospitalityRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    facilitiesRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    valueForMoneyRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    foodRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },


    /* ==========================================================
       REVIEW CONTENT
    ========================================================== */

    title: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    reviewText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },


    /* ==========================================================
       GOOD / BAD EXPERIENCE
    ========================================================== */

    likedThings: {
      type: [String],
      default: [],
    },

    dislikedThings: {
      type: [String],
      default: [],
    },


    /* ==========================================================
       REVIEW PHOTOS / VIDEOS
    ========================================================== */

    images: {
      type: [String],
      default: [],
    },

    videos: {
      type: [String],
      default: [],
    },


    /* ==========================================================
       STAY INFORMATION
    ========================================================== */

    stayType: {
      type: String,
      enum: [
        "SOLO",
        "COUPLE",
        "FAMILY",
        "FRIENDS",
        "BUSINESS",
        "GROUP",
        "OTHER",
      ],
      default: "OTHER",
    },

    tripType: {
      type: String,
      enum: [
        "LEISURE",
        "BUSINESS",
        "FAMILY",
        "ROMANTIC",
        "ADVENTURE",
        "OTHER",
      ],
      default: "OTHER",
    },

    nightsStayed: {
      type: Number,
      default: 0,
      min: 0,
    },


    /* ==========================================================
       HOST RESPONSE
    ========================================================== */

    hostResponse: {
      type: String,
      default: "",
      maxlength: 2000,
    },

    hostRespondedAt: {
      type: Date,
      default: null,
    },

    hostRespondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },


    /* ==========================================================
       HELPFUL VOTES
    ========================================================== */

    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    notHelpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    helpfulUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],


    /* ==========================================================
       VERIFIED STAY
    ========================================================== */

    isVerifiedStay: {
      type: Boolean,
      default: false,
    },


    /* ==========================================================
       ADMIN MODERATION
    ========================================================== */

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

    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    moderatedAt: {
      type: Date,
      default: null,
    },


    /* ==========================================================
       REPORT / FLAG
    ========================================================== */

    isReported: {
      type: Boolean,
      default: false,
    },

    reportReason: {
      type: String,
      default: "",
    },

    reportedAt: {
      type: Date,
      default: null,
    },


    /* ==========================================================
       DISPLAY
    ========================================================== */

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);


/* ============================================================
   INDEXES
============================================================ */

homestayReviewSchema.index({
  homestay: 1,
  status: 1,
  createdAt: -1,
});

homestayReviewSchema.index({
  vendor: 1,
  status: 1,
});

homestayReviewSchema.index({
  overallRating: -1,
});

homestayReviewSchema.index({
  isFeatured: 1,
  status: 1,
});

homestayReviewSchema.index({
  isVerifiedStay: 1,
  status: 1,
});


/* ============================================================
   PRE SAVE
   Calculate verified stay automatically
============================================================ */

homestayReviewSchema.pre(
  "save",
  function (next) {
    if (this.booking) {
      this.isVerifiedStay = true;
    }

    next();
  }
);


/* ============================================================
   EXPORT
============================================================ */

module.exports = mongoose.model(
  "HomestayReview",
  homestayReviewSchema
);