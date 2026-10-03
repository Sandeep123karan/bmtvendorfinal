const mongoose = require("mongoose");

const nightClubEventBookingSchema = new mongoose.Schema(
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
    // VENDOR / CLUB / EVENT
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

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NightClubEvent",
      required: true,
      index: true,
    },

    // =====================================================
    // TICKET
    // =====================================================

    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NightClubEventTicket",
      required: true,
    },

    ticketName: {
      type: String,
      required: true,
      trim: true,
    },

    ticketType: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    personsPerTicket: {
      type: Number,
      default: 1,
      min: 1,
    },

    totalPersons: {
      type: Number,
      required: true,
      min: 1,
    },

    // =====================================================
    // PRICE
    // =====================================================

    pricePerTicket: {
      type: Number,
      required: true,
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
      uppercase: true,
    },

    // =====================================================
    // BOOKING
    // =====================================================

    bookingId: {
      type: String,
      unique: true,
      index: true,
    },

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
      index: true,
    },

    razorpayOrderId: {
      type: String,
      default: "",
      index: true,
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    paymentExpiresAt: {
      type: Date,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    // =====================================================
    // CONFIRMATION
    // =====================================================

    confirmedAt: {
      type: Date,
      default: null,
    },

    // =====================================================
    // QR / ENTRY
    // =====================================================

    qrCode: {
      type: String,
      default: "",
    },

    qrGeneratedAt: {
      type: Date,
      default: null,
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

nightClubEventBookingSchema.index({
  userId: 1,
  eventId: 1,
});

nightClubEventBookingSchema.index({
  vendorId: 1,
  eventId: 1,
});

nightClubEventBookingSchema.index({
  eventId: 1,
  bookingStatus: 1,
});

nightClubEventBookingSchema.index({
  razorpayOrderId: 1,
});

module.exports = mongoose.model(
  "NightClubEventBooking",
  nightClubEventBookingSchema
);