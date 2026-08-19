const mongoose = require("mongoose");

const cabBookingSchema = new mongoose.Schema(
  {
    /* ================= BOOKING ID ================= */

    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /* ================= CAB + VENDOR ================= */

    cab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cab",
      required: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    /* ================= USER ================= */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* ================= CUSTOMER DETAILS ================= */

    customer: {
      name: {
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
        default: "",
        trim: true,
      },
    },

    /* ================= TRIP DETAILS ================= */

    tripType: {
      type: String,
      enum: ["ONE_WAY", "ROUND_TRIP", "LOCAL"],
      default: "ONE_WAY",
    },

    fromCity: {
      type: String,
      default: "",
    },

    toCity: {
      type: String,
      default: "",
    },

    pickupAddress: {
      type: String,
      default: "",
    },

    dropAddress: {
      type: String,
      default: "",
    },

    pickupDate: {
      type: Date,
      default: null,
      index: true,
    },

    pickupTime: {
      type: String,
      default: "",
    },

    returnDate: {
      type: Date,
      default: null,
    },

    returnTime: {
      type: String,
      default: "",
    },

    /* ================= TRAVELLERS ================= */

    passengers: [
      {
        name: {
          type: String,
          default: "",
        },

        age: {
          type: Number,
          default: null,
        },

        gender: {
          type: String,
          enum: ["MALE", "FEMALE", "OTHER", ""],
          default: "",
        },
      },
    ],

    totalPassengers: {
      type: Number,
      default: 1,
    },

    /* ================= PRICE ================= */

    pricing: {
      baseFare: {
        type: Number,
        default: 0,
      },

      driverAllowance: {
        type: Number,
        default: 0,
      },

      tollCharges: {
        type: Number,
        default: 0,
      },

      stateTax: {
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

      discount: {
        type: Number,
        default: 0,
      },

      totalAmount: {
        type: Number,
        default: 0,
      },

      currency: {
        type: String,
        default: "INR",
      },
    },

    /* ================= PAYMENT ================= */

    paymentMethod: {
      type: String,
      enum: ["ONLINE", "PAY_LATER", "CASH"],
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

    /* ================= BOOKING STATUS ================= */

    bookingStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "DRIVER_ASSIGNED",
        "STARTED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
      index: true,
    },

    /* ================= DRIVER ASSIGNMENT ================= */

    driverDetails: {
      name: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      vehicleNumber: {
        type: String,
        default: "",
      },

      assignedAt: {
        type: Date,
        default: null,
      },
    },

    /* ================= CANCELLATION ================= */

    cancellationReason: {
      type: String,
      default: "",
    },

    cancelledBy: {
      type: String,
      enum: ["USER", "VENDOR", "ADMIN", ""],
      default: "",
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    /* ================= NOTES ================= */

    specialRequests: {
      type: String,
      default: "",
    },

    vendorNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);


/* ================= INDEXES ================= */

cabBookingSchema.index({
  vendor: 1,
  bookingStatus: 1,
  createdAt: -1,
});

cabBookingSchema.index({
  cab: 1,
  pickupDate: 1,
});


module.exports = mongoose.model(
  "CabBooking",
  cabBookingSchema
);