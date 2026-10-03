const mongoose = require("mongoose");

const nightClubEventSchema = new mongoose.Schema(
  {
    // =====================================================
    // RELATION
    // =====================================================

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    nightClubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NightClub",
      required: true,
      index: true,
    },

    // =====================================================
    // BASIC EVENT INFORMATION
    // =====================================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    eventType: {
      type: String,
      enum: [
        "party",
        "dj-night",
        "live-music",
        "bollywood-night",
        "edm-night",
        "punjabi-night",
        "hip-hop-night",
        "ladies-night",
        "couple-night",
        "special-event",
        "festival",
        "other",
      ],
      default: "party",
    },

    // =====================================================
    // EVENT DATE / TIME
    // =====================================================

    eventDate: {
      type: Date,
      required: true,
      index: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    lastEntryTime: {
      type: String,
      default: "",
    },

    // =====================================================
    // ARTIST / DJ
    // =====================================================

    artistName: {
      type: String,
      default: "",
    },

    djName: {
      type: String,
      default: "",
    },

    hostName: {
      type: String,
      default: "",
    },

    musicGenres: [
      {
        type: String,
        trim: true,
      },
    ],

    // =====================================================
    // MEDIA
    // =====================================================

    bannerImage: {
      type: String,
      default: "",
    },

    images: [
      {
        type: String,
      },
    ],

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
      required: true,
      min: 1,
    },

    availableCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // ENTRY OPTIONS
    // =====================================================

    stagEntryAvailable: {
      type: Boolean,
      default: false,
    },

    coupleEntryAvailable: {
      type: Boolean,
      default: true,
    },

    femaleEntryAvailable: {
      type: Boolean,
      default: false,
    },

    maleEntryAvailable: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // ENTRY PRICING
    // =====================================================

    stagEntryPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    coupleEntryPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    femaleEntryPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    maleEntryPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // VIP
    // =====================================================

    vipAvailable: {
      type: Boolean,
      default: false,
    },

    vipPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    vipCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // TABLE / BOOTH
    // =====================================================

    tableBookingAvailable: {
      type: Boolean,
      default: false,
    },

    boothBookingAvailable: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // AGE / ENTRY POLICY
    // =====================================================

    minimumAge: {
      type: Number,
      default: 18,
      min: 18,
    },

    dressCode: {
      type: String,
      default: "",
    },

    entryPolicy: {
      type: String,
      default: "",
    },

    // =====================================================
    // BOOKING WINDOW
    // =====================================================

    bookingStartDate: {
      type: Date,
      default: null,
    },

    bookingEndDate: {
      type: Date,
      default: null,
    },

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
        "cancelled",
        "completed",
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
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

nightClubEventSchema.index({
  nightClubId: 1,
  eventDate: 1,
});

nightClubEventSchema.index({
  vendorId: 1,
  eventDate: 1,
});

module.exports = mongoose.model(
  "NightClubEvent",
  nightClubEventSchema
);