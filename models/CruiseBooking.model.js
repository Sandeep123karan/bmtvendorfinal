const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    age: {
      type: Number,
      min: 0,
      default: null,
    },

    gender: {
      type: String,
      enum: [
        "male",
        "female",
        "other",
      ],
      default: "other",
    },

    nationality: {
      type: String,
      trim: true,
      default: "",
    },

    passportNumber: {
      type: String,
      trim: true,
      default: "",
    },

    passportExpiryDate: {
      type: Date,
      default: null,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const cruiseBookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    sailingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CruiseSailing",
      required: true,
      index: true,
    },

    shipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CruiseShip",
      required: true,
      index: true,
    },

    cabinId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CruiseCabin",
      required: true,
      index: true,
    },

    pricingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CruisePricing",
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
      trim: true,
      lowercase: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    passengers: {
      type: [passengerSchema],
      required: true,
      validate: {
        validator: function (value) {
          return value && value.length > 0;
        },
        message:
          "At least one passenger is required.",
      },
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      default: "INR",
    },

    baseAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    taxAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    portCharges: {
      type: Number,
      min: 0,
      default: 0,
    },

    serviceCharges: {
      type: Number,
      min: 0,
      default: 0,
    },

    discountAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "paid",
        "failed",
        "refunded",
        "partially-refunded",
      ],
      default: "pending",
      index: true,
    },

    bookingStatus: {
      type: String,
      enum: [
        "pending",
        "reserved",
        "confirmed",
        "cancelled",
        "completed",
      ],
      default: "pending",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "razorpay",
        "card",
        "upi",
        "netbanking",
        "wallet",
        "cash",
        "other",
      ],
      default: "razorpay",
    },

    paymentId: {
      type: String,
      trim: true,
      default: "",
    },

    paymentOrderId: {
      type: String,
      trim: true,
      default: "",
    },

    paymentSignature: {
      type: String,
      trim: true,
      default: "",
    },

    specialRequests: {
      type: String,
      trim: true,
      default: "",
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

cruiseBookingSchema.index({
  customerId: 1,
  createdAt: -1,
});

cruiseBookingSchema.index({
  vendorId: 1,
  createdAt: -1,
});

cruiseBookingSchema.index({
  sailingId: 1,
  bookingStatus: 1,
});

cruiseBookingSchema.index({
  paymentStatus: 1,
  bookingStatus: 1,
});

cruiseBookingSchema.pre(
  "validate",
  function () {
    const baseAmount = Number(
      this.baseAmount || 0
    );

    const taxAmount = Number(
      this.taxAmount || 0
    );

    const portCharges = Number(
      this.portCharges || 0
    );

    const serviceCharges = Number(
      this.serviceCharges || 0
    );

    const discountAmount = Number(
      this.discountAmount || 0
    );

    const calculatedTotal =
      baseAmount +
      taxAmount +
      portCharges +
      serviceCharges -
      discountAmount;

    this.totalAmount = Math.max(
      0,
      calculatedTotal
    );

    if (
      this.bookingStatus === "confirmed" &&
      !this.confirmedAt
    ) {
      this.confirmedAt = new Date();
    }

    if (
      this.bookingStatus === "cancelled" &&
      !this.cancelledAt
    ) {
      this.cancelledAt = new Date();
    }

    if (
      this.bookingStatus === "completed" &&
      !this.completedAt
    ) {
      this.completedAt = new Date();
    }
  }
);

module.exports = mongoose.model(
  "CruiseBooking",
  cruiseBookingSchema
);