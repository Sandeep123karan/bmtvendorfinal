const mongoose = require("mongoose");

const tourBookingSchema = new mongoose.Schema(
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
    // TOUR
    // =========================
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
      index: true,
    },

    // =========================
    // CUSTOMER
    // =========================
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // TRAVEL DATE
    // =========================
    bookingDate: {
      type: Date,
      required: true,
    },

    // =========================
    // GUESTS
    // =========================
    guests: {
      adults: {
        type: Number,
        default: 1,
        min: 0,
      },

      children: {
        type: Number,
        default: 0,
        min: 0,
      },

      infants: {
        type: Number,
        default: 0,
        min: 0,
      },

      total: {
        type: Number,
        default: 1,
        min: 1,
      },
    },

    // =========================
    // PRICING
    // =========================
    pricing: {
      adultPrice: {
        type: Number,
        default: 0,
      },

      childPrice: {
        type: Number,
        default: 0,
      },

      infantPrice: {
        type: Number,
        default: 0,
      },

      subtotal: {
        type: Number,
        default: 0,
      },

      discount: {
        type: Number,
        default: 0,
      },

      tax: {
        type: Number,
        default: 0,
      },

      totalAmount: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    // =========================
    // PAYMENT
    // =========================
    paymentMethod: {
      type: String,
      enum: ["ONLINE", "CASH", "UPI", "CARD", "OTHER"],
      default: "ONLINE",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    razorpayOrderId: {
      type: String,
      trim: true,
    },

    razorpayPaymentId: {
      type: String,
      trim: true,
    },

    // =========================
    // BOOKING STATUS
    // =========================
    bookingStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CANCELLED",
        "COMPLETED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    // =========================
    // VENDOR NOTE
    // =========================
    vendorNote: {
      type: String,
      trim: true,
    },

    // =========================
    // CUSTOMER NOTE
    // =========================
    customerNote: {
      type: String,
      trim: true,
    },

    // =========================
    // CANCELLATION
    // =========================
    cancellationReason: {
      type: String,
      trim: true,
    },

    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "TourBooking",
  tourBookingSchema
);