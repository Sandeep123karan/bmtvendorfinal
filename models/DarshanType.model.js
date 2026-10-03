const mongoose = require("mongoose");

const darshanTypeSchema = new mongoose.Schema(
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
    // DARSHAN / TEMPLE
    // =====================================================

    darshanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Darshan",
      required: true,
      index: true,
    },

    // =====================================================
    // BASIC DETAILS
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    shortDescription: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // DARSHAN TYPE
    // =====================================================

    type: {
      type: String,
      enum: [
        "general",
        "vip",
        "special",
        "sheeghra",
        "aarti",
        "paid",
        "free",
        "other",
      ],
      required: true,
    },

    // =====================================================
    // IMAGE
    // =====================================================

    image: {
      type: String,
      default: "",
    },

    // =====================================================
    // CAPACITY
    // =====================================================

    dailyCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },

    perSlotCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxPersonsPerBooking: {
      type: Number,
      default: 10,
      min: 1,
    },

    // =====================================================
    // PRICING
    // =====================================================

    adultPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    childPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    seniorCitizenPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // =====================================================
    // AGE
    // =====================================================

    minimumAge: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // BOOKING
    // =====================================================

    bookingAllowed: {
      type: Boolean,
      default: true,
    },

    advanceBookingDays: {
      type: Number,
      default: 30,
      min: 0,
    },

    // =====================================================
    // STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "draft",
        "active",
        "inactive",
      ],
      default: "draft",
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
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
// INDEX
// =====================================================

darshanTypeSchema.index({
  vendorId: 1,
  darshanId: 1,
});

module.exports = mongoose.model(
  "DarshanType",
  darshanTypeSchema
);