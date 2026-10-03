const mongoose = require("mongoose");

const darshanBookingSchema = new mongoose.Schema(
  {
    // =====================================================
    // CUSTOMER
    // =====================================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // VENDOR / DARSHAN
    // =====================================================

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    darshanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Darshan",
      required: true,
      index: true,
    },

    darshanTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DarshanType",
      required: true,
      index: true,
    },

    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DarshanSlot",
      required: true,
      index: true,
    },

    availabilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DarshanSlotAvailability",
      required: true,
      index: true,
    },

    // =====================================================
    // BOOKING DATE
    // =====================================================

    bookingDate: {
      type: Date,
      required: true,
      index: true,
    },

    // =====================================================
    // PERSON DETAILS
    // =====================================================

    adultCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    childCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    seniorCitizenCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalPersons: {
      type: Number,
      required: true,
      min: 1,
    },

    // =====================================================
    // PRICE
    // =====================================================

    adultPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    childPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    seniorCitizenPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    adultAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    childAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    seniorCitizenAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // =====================================================
    // BOOKING ID
    // =====================================================

    bookingId: {
      type: String,
      unique: true,
      index: true,
    },

    // =====================================================
    // BOOKING STATUS
    // =====================================================

    bookingStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "refunded",
      ],
      default: "pending",
      index: true,
    },

    // =====================================================
    // PAYMENT
    // =====================================================

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "razorpay",
        "cash",
        "other",
      ],
      default: "razorpay",
    },

    paymentId: {
      type: String,
      default: "",
    },

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    // =====================================================
    // QR / ENTRY
    // =====================================================

    qrCode: {
      type: String,
      default: "",
    },

    entryStatus: {
      type: String,
      enum: [
        "not_checked",
        "checked_in",
        "rejected",
      ],
      default: "not_checked",
    },

    checkedInAt: {
      type: Date,
      default: null,
    },

    // =====================================================
    // CANCELLATION
    // =====================================================

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
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

darshanBookingSchema.index({
  userId: 1,
  bookingDate: -1,
});

darshanBookingSchema.index({
  vendorId: 1,
  bookingDate: -1,
});

darshanBookingSchema.index({
  availabilityId: 1,
  bookingStatus: 1,
});

module.exports = mongoose.model(
  "DarshanBooking",
  darshanBookingSchema
);