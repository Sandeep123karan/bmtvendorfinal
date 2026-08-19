const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema(
  {
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
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      default: null,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      default: "OTHER",
    },
  },
  { _id: false }
);


const resortBookingSchema = new mongoose.Schema(
  {
    // ==========================================
    // BOOKING NUMBER
    // ==========================================

    bookingId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },


    // ==========================================
    // VENDOR / RESORT
    // ==========================================

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    resort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resort",
      required: true,
      index: true,
    },


    // ==========================================
    // ROOM DETAILS
    // ==========================================

    roomCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResortRoom",
      required: true,
    },

    ratePlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResortRatePlan",
      required: true,
    },

    roomUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResortRoomUnit",
      default: null,
    },


    // ==========================================
    // STAY DATES
    // ==========================================

    checkIn: {
      type: Date,
      required: true,
      index: true,
    },

    checkOut: {
      type: Date,
      required: true,
      index: true,
    },

    totalNights: {
      type: Number,
      required: true,
      min: 1,
    },


    // ==========================================
    // GUEST COUNT
    // ==========================================

    rooms: {
      type: Number,
      default: 1,
      min: 1,
    },

    adults: {
      type: Number,
      required: true,
      min: 1,
    },

    children: {
      type: Number,
      default: 0,
      min: 0,
    },


    // ==========================================
    // LEAD GUEST
    // ==========================================

    leadGuest: {
      type: guestSchema,
      required: true,
    },

    additionalGuests: {
      type: [guestSchema],
      default: [],
    },


    // ==========================================
    // PRICE BREAKDOWN
    // ==========================================

    pricing: {
      roomPrice: {
        type: Number,
        default: 0,
      },

      extraAdultAmount: {
        type: Number,
        default: 0,
      },

      extraChildAmount: {
        type: Number,
        default: 0,
      },

      gstAmount: {
        type: Number,
        default: 0,
      },

      discountAmount: {
        type: Number,
        default: 0,
      },

      totalAmount: {
        type: Number,
        required: true,
      },
    },


    // ==========================================
    // BOOKING STATUS
    // ==========================================

    bookingStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CHECKED_IN",
        "CHECKED_OUT",
        "CANCELLED",
        "NO_SHOW",
      ],
      default: "PENDING",
      index: true,
    },


    // ==========================================
    // PAYMENT
    // ==========================================

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PARTIAL",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],
      default: "PENDING",
    },

    paymentMethod: {
      type: String,
      enum: [
        "ONLINE",
        "CASH",
        "CARD",
        "UPI",
        "BANK_TRANSFER",
      ],
      default: "ONLINE",
    },

    paidAmount: {
      type: Number,
      default: 0,
    },


    // ==========================================
    // PAYMENT GATEWAY
    // ==========================================

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


    // ==========================================
    // BOOKING SOURCE
    // ==========================================

    bookingSource: {
      type: String,
      enum: [
        "VENDOR_PANEL",
        "WEBSITE",
        "MOBILE_APP",
        "ADMIN",
        "OFFLINE",
      ],
      default: "VENDOR_PANEL",
    },


    // ==========================================
    // SPECIAL REQUEST
    // ==========================================

    specialRequest: {
      type: String,
      default: "",
      trim: true,
    },

    internalNotes: {
      type: String,
      default: "",
      trim: true,
    },


    // ==========================================
    // CANCELLATION
    // ==========================================

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
    },

    cancelledBy: {
      type: String,
      enum: ["USER", "VENDOR", "ADMIN", ""],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);


// ==========================================
// SEARCH / DASHBOARD INDEXES
// ==========================================

resortBookingSchema.index({
  vendor: 1,
  bookingStatus: 1,
  checkIn: 1,
});

resortBookingSchema.index({
  resort: 1,
  checkIn: 1,
  checkOut: 1,
});


module.exports = mongoose.model(
  "ResortBooking",
  resortBookingSchema
);