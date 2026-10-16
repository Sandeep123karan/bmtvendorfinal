
const mongoose = require("mongoose");
const crypto = require("crypto");

/* =========================================================
   PASSENGER SCHEMA
========================================================= */

const passengerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Passenger name is required"],
      trim: true,
    },

    age: {
      type: Number,
      required: [true, "Passenger age is required"],
      min: [1, "Age must be at least 1"],
      max: [120, "Age cannot exceed 120"],
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: [true, "Passenger gender is required"],
    },

    seatNo: {
      type: String,
      required: [true, "Passenger seat number is required"],
      trim: true,
    },

    seatPrice: {
      type: Number,
      default: 0,
      min: [0, "Seat price cannot be negative"],
    },

    idType: {
      type: String,
      default: "",
      trim: true,
    },

    idNumber: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

/* =========================================================
   BOARDING / DROPPING POINT SCHEMA
========================================================= */

const pointSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    landmark: {
      type: String,
      default: "",
      trim: true,
    },

    time: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

/* =========================================================
   BUS BOOKING SCHEMA
========================================================= */

const busBookingSchema = new mongoose.Schema(
  {
    /* ================= BOOKING IDENTIFIERS ================= */

    bookingId: {
      type: String,
      unique: true,
      index: true,
      immutable: true,
    },

    pnr: {
      type: String,
      unique: true,
      index: true,
      immutable: true,
    },

    /* ================= REFERENCES ================= */

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor is required"],
      index: true,
    },

    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: [true, "Bus is required"],
      index: true,
    },

    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusTrip",
      required: [true, "Bus trip is required"],
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    /* ================= JOURNEY DETAILS ================= */

    fromCity: {
      type: String,
      required: [true, "Departure city is required"],
      trim: true,
    },

    toCity: {
      type: String,
      required: [true, "Destination city is required"],
      trim: true,
    },

    travelDate: {
      type: Date,
      required: [true, "Travel date is required"],
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
      required: [true, "Contact name is required"],
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
      required: [true, "Contact phone is required"],
      trim: true,
    },

    /* ================= PASSENGERS ================= */

    passengers: {
      type: [passengerSchema],
      required: [true, "Passengers are required"],
      validate: [
        {
          validator: function (value) {
            return Array.isArray(value) && value.length > 0;
          },
          message: "At least one passenger is required",
        },
        {
          validator: function (value) {
            const seats = (value || []).map((p) =>
              String(p.seatNo).trim().toUpperCase()
            );

            return new Set(seats).size === seats.length;
          },
          message: "A seat cannot be assigned to multiple passengers",
        },
        {
          validator: function (value) {
            const bookingSeats = (this.seatNumbers || [])
              .map((seat) => String(seat).trim().toUpperCase())
              .sort();

            const passengerSeats = (value || [])
              .map((p) => String(p.seatNo).trim().toUpperCase())
              .sort();

            return (
              bookingSeats.length === passengerSeats.length &&
              bookingSeats.every(
                (seat, index) => seat === passengerSeats[index]
              )
            );
          },
          message: "Passenger seats must match the booking seat numbers",
        },
      ],
    },

    seatNumbers: {
      type: [String],
      required: [true, "Seat numbers are required"],
      validate: [
        {
          validator: function (value) {
            return Array.isArray(value) && value.length > 0;
          },
          message: "Select at least one seat",
        },
        {
          validator: function (value) {
            const seats = (value || []).map((seat) =>
              String(seat).trim().toUpperCase()
            );

            return new Set(seats).size === seats.length;
          },
          message: "Duplicate seat numbers are not allowed",
        },
      ],
    },

    /* ================= BOARDING POINT ================= */

    boardingPoint: {
      type: pointSchema,
      default: () => ({}),
    },

    /* ================= DROPPING POINT ================= */

    droppingPoint: {
      type: pointSchema,
      default: () => ({}),
    },

    /* ================= PRICE BREAKUP ================= */

    pricing: {
      baseFare: {
        type: Number,
        default: 0,
        min: [0, "Base fare cannot be negative"],
      },

      seatFare: {
        type: Number,
        default: 0,
        min: [0, "Seat fare cannot be negative"],
      },

      taxAmount: {
        type: Number,
        default: 0,
        min: [0, "Tax cannot be negative"],
      },

      serviceFee: {
        type: Number,
        default: 0,
        min: [0, "Service fee cannot be negative"],
      },

      discount: {
        type: Number,
        default: 0,
        min: [0, "Discount cannot be negative"],
      },

      couponDiscount: {
        type: Number,
        default: 0,
        min: [0, "Coupon discount cannot be negative"],
      },

      totalAmount: {
        type: Number,
        required: [true, "Total booking amount is required"],
        min: [0, "Total amount cannot be negative"],
      },

      currency: {
        type: String,
        default: "INR",
        trim: true,
        uppercase: true,
      },
    },

    /* ================= PAYMENT DETAILS ================= */

    paymentMethod: {
      type: String,
      enum: ["ONLINE", "COD", "PAY_AT_BUS"],
      default: "ONLINE",
      index: true,
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
      trim: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true,
    },

    razorpaySignature: {
      type: String,
      default: "",
      trim: true,
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
      trim: true,
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
      min: [0, "Refund amount cannot be negative"],
    },

    refundStatus: {
      type: String,
      enum: [
        "NOT_REQUIRED",
        "PENDING",
        "PROCESSING",
        "REFUNDED",
        "FAILED",
      ],
      default: "NOT_REQUIRED",
    },

    refundId: {
      type: String,
      default: "",
      trim: true,
    },

    /* ================= OTHER DETAILS ================= */

    specialRequests: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

/* =========================================================
   INDEXES
========================================================= */

// Booking history for each vendor
busBookingSchema.index({
  vendor: 1,
  createdAt: -1,
});

// Bookings belonging to a particular trip
busBookingSchema.index({
  trip: 1,
  bookingStatus: 1,
});

// Travel date and booking status
busBookingSchema.index({
  travelDate: 1,
  bookingStatus: 1,
});

// User booking history
busBookingSchema.index({
  user: 1,
  createdAt: -1,
});

/* =========================================================
   AUTO-GENERATE BOOKING ID AND PNR
   Promise-based middleware: no next() callback
========================================================= */

busBookingSchema.pre("validate", function () {
  if (!this.bookingId) {
    this.bookingId =
      "BUS" +
      Date.now().toString() +
      crypto.randomBytes(4).toString("hex").toUpperCase();
  }

  if (!this.pnr) {
    this.pnr =
      "BMT" +
      crypto.randomBytes(4).toString("hex").toUpperCase();
  }
});

/* =========================================================
   EXPORT MODEL
========================================================= */

module.exports =
  mongoose.models.BusBooking ||
  mongoose.model("BusBooking", busBookingSchema);
