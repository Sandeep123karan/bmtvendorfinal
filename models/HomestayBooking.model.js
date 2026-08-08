const mongoose = require("mongoose");

/* ============================================================
   HOMESTAY BOOKING MODEL
   ============================================================ */

const homestayBookingSchema = new mongoose.Schema(
  {
    /* ==========================================================
       BOOKING IDENTIFICATION
    ========================================================== */

    bookingId: {
      type: String,
      unique: true,
      index: true,
    },

    /* ==========================================================
       USER / CUSTOMER
    ========================================================== */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    guestName: {
      type: String,
      required: true,
      trim: true,
    },

    guestEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    guestPhone: {
      type: String,
      required: true,
      trim: true,
    },

    alternatePhone: {
      type: String,
      default: "",
      trim: true,
    },

    /* ==========================================================
       PROPERTY
    ========================================================== */

    homestay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homestay",
      required: true,
      index: true,
    },

    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HomestayUnit",
      required: true,
      index: true,
    },

    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HomestayInventory",
      default: null,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    /* ==========================================================
       STAY DETAILS
    ========================================================== */

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

    unitsBooked: {
      type: Number,
      default: 1,
      min: 1,
    },

    /* ==========================================================
       GUEST DETAILS
    ========================================================== */

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

    infants: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalGuests: {
      type: Number,
      default: 0,
      min: 1,
    },

    guestNames: {
      type: [String],
      default: [],
    },

    specialRequest: {
      type: String,
      default: "",
      trim: true,
    },

    /* ==========================================================
       PRICE BREAKDOWN
    ========================================================== */

    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    roomAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    extraGuestAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    extraBedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    mealAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    couponDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ==========================================================
       TAX / SERVICE CHARGE
    ========================================================== */

    taxPercentage: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    serviceChargePercentage: {
      type: Number,
      default: 0,
      min: 0,
    },

    serviceChargeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ==========================================================
       COUPON
    ========================================================== */

    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HomestayCoupon",
      default: null,
    },

    couponCode: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    /* ==========================================================
       FINAL AMOUNT
    ========================================================== */

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    /* ==========================================================
       PAYMENT
    ========================================================== */

    paymentMethod: {
      type: String,
      enum: [
        "ONLINE",
        "UPI",
        "CARD",
        "NET_BANKING",
        "PAY_AT_PROPERTY",
        "COD",
      ],
      default: "ONLINE",
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUND_PENDING",
        "PARTIAL_REFUND",
        "REFUNDED",
      ],
      default: "PENDING",
      index: true,
    },

    paymentId: {
      type: String,
      default: "",
      index: true,
    },

    transactionId: {
      type: String,
      default: "",
    },

    /* ==========================================================
       RAZORPAY
    ========================================================== */

    razorpayOrderId: {
      type: String,
      default: "",
      index: true,
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

    /* ==========================================================
       BOOKING STATUS
    ========================================================== */

    bookingStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CANCELLED",
        "REJECTED",
        "CHECKED_IN",
        "CHECKED_OUT",
        "NO_SHOW",
        "COMPLETED",
      ],
      default: "PENDING",
      index: true,
    },

    /* ==========================================================
       VENDOR CONFIRMATION
    ========================================================== */

    vendorConfirmation: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    vendorConfirmedAt: {
      type: Date,
      default: null,
    },

    vendorRejectionReason: {
      type: String,
      default: "",
    },

    /* ==========================================================
       CANCELLATION
    ========================================================== */

    cancellationRequested: {
      type: Boolean,
      default: false,
    },

    cancelledBy: {
      type: String,
      enum: [
        "USER",
        "VENDOR",
        "ADMIN",
        null,
      ],
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
    },

    cancellationAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundStatus: {
      type: String,
      enum: [
        "NOT_APPLICABLE",
        "PENDING",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
      ],
      default: "NOT_APPLICABLE",
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    refundTransactionId: {
      type: String,
      default: "",
    },

    /* ==========================================================
       CHECK-IN
    ========================================================== */

    actualCheckInAt: {
      type: Date,
      default: null,
    },

    actualCheckOutAt: {
      type: Date,
      default: null,
    },

    checkInBy: {
      type: String,
      default: "",
    },

    checkOutBy: {
      type: String,
      default: "",
    },

    /* ==========================================================
       ADMIN COMMISSION
    ========================================================== */

    adminCommissionType: {
      type: String,
      enum: [
        "PERCENTAGE",
        "FIXED",
      ],
      default: "PERCENTAGE",
    },

    adminCommissionPercentage: {
      type: Number,
      default: 0,
      min: 0,
    },

    adminCommissionAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    vendorAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ==========================================================
       SETTLEMENT
    ========================================================== */

    settlementStatus: {
      type: String,
      enum: [
        "PENDING",
        "PROCESSING",
        "SETTLED",
        "FAILED",
      ],
      default: "PENDING",
      index: true,
    },

    settlementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HomestaySettlement",
      default: null,
    },

    settledAt: {
      type: Date,
      default: null,
    },

    /* ==========================================================
       DOCUMENTS / INVOICE
    ========================================================== */

    invoiceNumber: {
      type: String,
      default: "",
    },

    invoiceUrl: {
      type: String,
      default: "",
    },

    /* ==========================================================
       BOOKING SOURCE
    ========================================================== */

    bookingSource: {
      type: String,
      enum: [
        "WEBSITE",
        "MOBILE_APP",
        "ADMIN",
        "VENDOR",
        "API",
      ],
      default: "WEBSITE",
    },

    /* ==========================================================
       NOTES
    ========================================================== */

    adminNotes: {
      type: String,
      default: "",
    },

    vendorNotes: {
      type: String,
      default: "",
    },

    customerNotes: {
      type: String,
      default: "",
    },

    /* ==========================================================
       REVIEW
    ========================================================== */

    reviewSubmitted: {
      type: Boolean,
      default: false,
    },

    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HomestayReview",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


/* ============================================================
   INDEXES
============================================================ */

homestayBookingSchema.index({
  vendor: 1,
  bookingStatus: 1,
});

homestayBookingSchema.index({
  homestay: 1,
  checkInDate: 1,
  checkOutDate: 1,
});

homestayBookingSchema.index({
  unit: 1,
  checkInDate: 1,
  checkOutDate: 1,
});

homestayBookingSchema.index({
  user: 1,
  createdAt: -1,
});

homestayBookingSchema.index({
  paymentStatus: 1,
  bookingStatus: 1,
});

homestayBookingSchema.index({
  settlementStatus: 1,
});


/* ============================================================
   BOOKING ID GENERATOR
============================================================ */

homestayBookingSchema.pre(
  "validate",
  function () {
    if (!this.bookingId) {
      const timestamp =
        Date.now().toString();

      const random =
        Math.floor(
          1000 +
          Math.random() * 9000
        );

      this.bookingId =
        `BMT-HS-${timestamp.slice(-8)}-${random}`;
    }
  }
);


/* ============================================================
   VALIDATION
============================================================ */

homestayBookingSchema.pre(
  "validate",
  function () {
    if (
      this.checkInDate &&
      this.checkOutDate
    ) {
      const checkIn =
        new Date(
          this.checkInDate
        );

      const checkOut =
        new Date(
          this.checkOutDate
        );

      if (checkOut <= checkIn) {
        throw new Error(
          "Check-out date must be after check-in date."
        );
      }

      const difference =
        checkOut.getTime() -
        checkIn.getTime();

      this.nights =
        Math.ceil(
          difference /
          (1000 * 60 * 60 * 24)
        );
    }

    this.totalGuests =
      (this.adults || 0) +
      (this.children || 0) +
      (this.infants || 0);
  }
);


/* ============================================================
   EXPORT
============================================================ */

module.exports =
  mongoose.model(
    "HomestayBooking",
    homestayBookingSchema
  );