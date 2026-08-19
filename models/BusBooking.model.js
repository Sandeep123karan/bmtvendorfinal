const mongoose = require("mongoose");


/* =========================================================
   PASSENGER SCHEMA
========================================================= */

const passengerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },

    seatNo: {
      type: String,
      required: true,
      trim: true,
    },

    seatPrice: {
      type: Number,
      default: 0,
    },

    idType: {
      type: String,
      default: "",
    },

    idNumber: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);


/* =========================================================
   BOARDING / DROPPING POINT SNAPSHOT
========================================================= */

const pointSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    landmark: {
      type: String,
      default: "",
    },

    time: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);


/* =========================================================
   BUS BOOKING SCHEMA
========================================================= */

const busBookingSchema = new mongoose.Schema(
  {
    /* ================= BOOKING ID ================= */

    bookingId: {
      type: String,
      unique: true,
      index: true,
    },

    pnr: {
      type: String,
      unique: true,
      index: true,
    },


    /* ================= REFERENCES ================= */

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
      index: true,
    },

    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusTrip",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },


    /* ================= JOURNEY DETAILS ================= */

    fromCity: {
      type: String,
      required: true,
    },

    toCity: {
      type: String,
      required: true,
    },

    travelDate: {
      type: Date,
      required: true,
    },

    departureDateTime: {
      type: Date,
      default: null,
    },

    arrivalDateTime: {
      type: Date,
      default: null,
    },


    /* ================= CONTACT DETAILS ================= */

    contactName: {
      type: String,
      required: true,
      trim: true,
    },

    contactEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },


    /* ================= PASSENGERS ================= */

    passengers: {
      type: [passengerSchema],
      required: true,
      validate: {
        validator: function (value) {
          return value && value.length > 0;
        },
        message: "At least one passenger is required",
      },
    },

    seatNumbers: {
      type: [String],
      required: true,
    },


    /* ================= BOARDING ================= */

    boardingPoint: {
      type: pointSchema,
      default: () => ({}),
    },


    /* ================= DROPPING ================= */

    droppingPoint: {
      type: pointSchema,
      default: () => ({}),
    },


    /* ================= PRICE BREAKUP ================= */

    pricing: {
      baseFare: {
        type: Number,
        default: 0,
      },

      seatFare: {
        type: Number,
        default: 0,
      },

      taxAmount: {
        type: Number,
        default: 0,
      },

      serviceFee: {
        type: Number,
        default: 0,
      },

      discount: {
        type: Number,
        default: 0,
      },

      couponDiscount: {
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


    /* ================= PAYMENT ================= */

    paymentMethod: {
      type: String,
      enum: ["ONLINE", "COD", "PAY_AT_BUS"],
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
      index: true,
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
        "CANCELLED",
        "COMPLETED",
        "FAILED",
      ],
      default: "PENDING",
      index: true,
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


    /* ================= REFUND ================= */

    refundAmount: {
      type: Number,
      default: 0,
    },

    refundStatus: {
      type: String,
      enum: ["NOT_REQUIRED", "PENDING", "PROCESSING", "REFUNDED", "FAILED"],
      default: "NOT_REQUIRED",
    },

    refundId: {
      type: String,
      default: "",
    },


    /* ================= OTHER ================= */

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


/* =========================================================
   IMPORTANT INDEXES
========================================================= */

busBookingSchema.index({
  vendor: 1,
  createdAt: -1,
});

busBookingSchema.index({
  trip: 1,
  bookingStatus: 1,
});

busBookingSchema.index({
  travelDate: 1,
  bookingStatus: 1,
});


/* =========================================================
   AUTO BOOKING ID + PNR
========================================================= */

busBookingSchema.pre("validate", function (next) {
  if (!this.bookingId) {
    this.bookingId =
      "BUS" +
      Date.now() +
      Math.floor(Math.random() * 1000);
  }

  if (!this.pnr) {
    this.pnr =
      "BMT" +
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
  }

  next();
});


module.exports = mongoose.model(
  "BusBooking",
  busBookingSchema
);