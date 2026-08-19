const mongoose = require("mongoose");

const apartmentBookingSchema = new mongoose.Schema(
  {
    // ==========================================
    // BOOKING NUMBER
    // ==========================================

    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ==========================================
    // PROPERTY
    // ==========================================

    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorApartment",
      required: true,
      index: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    ratePlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApartmentRatePlan",
      required: true,
    },

    // ==========================================
    // USER / GUEST
    // User model baad mein connect kar sakta hai
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    guest: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },

      lastName: {
        type: String,
        default: "",
        trim: true,
      },

      email: {
        type: String,
        default: "",
        lowercase: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // ==========================================
    // STAY DETAILS
    // ==========================================

    checkInDate: {
      type: Date,
      required: true,
      index: true,
    },

    checkOutDate: {
      type: Date,
      required: true,
      index: true,
    },

    nights: {
      type: Number,
      required: true,
      min: 1,
    },

    adults: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    children: {
      type: Number,
      default: 0,
      min: 0,
    },

    extraMattress: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // DATE-WISE PRICE BREAKUP
    // ==========================================

    dateWisePricing: [
      {
        date: Date,

        price: Number,

        ratePlanPrice: Number,

        dynamicPricingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ApartmentDynamicPricing",
          default: null,
        },
      },
    ],

    // ==========================================
    // PRICE SUMMARY
    // ==========================================

    pricing: {
      roomAmount: {
        type: Number,
        default: 0,
      },

      extraGuestAmount: {
        type: Number,
        default: 0,
      },

      extraMattressAmount: {
        type: Number,
        default: 0,
      },

      cleaningFee: {
        type: Number,
        default: 0,
      },

      securityDeposit: {
        type: Number,
        default: 0,
      },

      discount: {
        type: Number,
        default: 0,
      },

      taxableAmount: {
        type: Number,
        default: 0,
      },

      gstPercentage: {
        type: Number,
        default: 0,
      },

      gstAmount: {
        type: Number,
        default: 0,
      },

      totalAmount: {
        type: Number,
        required: true,
      },

      currency: {
        type: String,
        default: "INR",
      },
    },

    // ==========================================
    // PAYMENT
    // ==========================================

    paymentMethod: {
      type: String,
      enum: ["ONLINE", "COD", "PAY_AT_PROPERTY"],
      default: "ONLINE",
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
        "PARTIAL_REFUND",
      ],
      default: "PENDING",
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

    paidAt: {
      type: Date,
      default: null,
    },

    // ==========================================
    // BOOKING STATUS
    // ==========================================

    bookingStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CANCELLED",
        "COMPLETED",
        "NO_SHOW",
      ],
      default: "PENDING",
      index: true,
    },

    cancellationReason: {
      type: String,
      default: "",
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancelledBy: {
      type: String,
      enum: ["USER", "VENDOR", "ADMIN", ""],
      default: "",
    },

    // ==========================================
    // CHECK-IN / OUT
    // ==========================================

    checkedInAt: {
      type: Date,
      default: null,
    },

    checkedOutAt: {
      type: Date,
      default: null,
    },

    // ==========================================
    // SPECIAL REQUEST
    // ==========================================

    specialRequests: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);


// ==========================================
// IMPORTANT INDEXES
// ==========================================

apartmentBookingSchema.index({
  apartment: 1,
  checkInDate: 1,
  checkOutDate: 1,
});

apartmentBookingSchema.index({
  vendor: 1,
  bookingStatus: 1,
  createdAt: -1,
});


module.exports = mongoose.model(
  "ApartmentBooking",
  apartmentBookingSchema
);