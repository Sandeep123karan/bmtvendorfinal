const mongoose = require("mongoose");

const darshanSlotAvailabilitySchema = new mongoose.Schema(
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
    // DARSHAN
    // =====================================================

    darshanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Darshan",
      required: true,
      index: true,
    },

    // =====================================================
    // DARSHAN TYPE
    // =====================================================

    darshanTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DarshanType",
      required: true,
      index: true,
    },

    // =====================================================
    // SLOT
    // =====================================================

    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DarshanSlot",
      required: true,
      index: true,
    },

    // =====================================================
    // DATE
    // =====================================================

    date: {
      type: Date,
      required: true,
      index: true,
    },

    // =====================================================
    // CAPACITY
    // =====================================================

    totalCapacity: {
      type: Number,
      required: true,
      min: 0,
    },

    availableCapacity: {
      type: Number,
      required: true,
      min: 0,
    },

    bookedCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // BOOKING
    // =====================================================

    maxPersonsPerBooking: {
      type: Number,
      default: 10,
      min: 1,
    },

    // =====================================================
    // PRICES
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
      uppercase: true,
    },

    // =====================================================
    // STATUS
    // =====================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isBookable: {
      type: Boolean,
      default: true,
      index: true,
    },

    isSoldOut: {
      type: Boolean,
      default: false,
      index: true,
    },

    // =====================================================
    // BLOCKING
    // =====================================================

    isBlocked: {
      type: Boolean,
      default: false,
    },

    blockedReason: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // NOTES
    // =====================================================

    notes: {
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
// DUPLICATE DATE + SLOT PREVENTION
// =====================================================

darshanSlotAvailabilitySchema.index(
  {
    slotId: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

// =====================================================
// SEARCH INDEX
// =====================================================

darshanSlotAvailabilitySchema.index({
  darshanId: 1,
  darshanTypeId: 1,
  date: 1,
});

module.exports = mongoose.model(
  "DarshanSlotAvailability",
  darshanSlotAvailabilitySchema
);