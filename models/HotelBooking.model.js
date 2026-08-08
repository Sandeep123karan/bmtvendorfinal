// models/HotelBooking.model.js

const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: Number,

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    phone: String,

    email: String,

    idProofType: {
      type: String,
      enum: [
        "AADHAR",
        "PAN",
        "PASSPORT",
        "DRIVING_LICENSE",
        "VOTER_ID",
        "OTHER",
      ],
      required: true,
    },

    idProofNumber: {
      type: String,
      required: true,
      trim: true,
    },

    idProofFront: {
      type: String,
      required: true,
    },

    idProofBack: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const hotelBookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },

    // User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Vendor
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    // Hotel
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    // Room (_id from Hotel.rooms)
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // Snapshot
    hotelName: {
      type: String,
      required: true,
    },

    roomName: {
      type: String,
      required: true,
    },

    roomType: {
      type: String,
      required: true,
    },

    hotelAddress: String,

    hotelCity: String,

    hotelState: String,

    hotelImage: String,

    // Booking Date
    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    totalNights: {
      type: Number,
      required: true,
    },

    // Rooms
    roomsBooked: {
      type: Number,
      default: 1,
      min: 1,
    },

    adults: {
      type: Number,
      default: 1,
    },

    children: {
      type: Number,
      default: 0,
    },

    // Primary Guest
    guestName: {
      type: String,
      required: true,
    },

    guestPhone: {
      type: String,
      required: true,
    },

    guestEmail: {
      type: String,
      default: "",
    },

    specialRequest: {
      type: String,
      default: "",
    },

    // All Guests
    guests: {
      type: [guestSchema],
      default: [],
    },

    // Pricing Snapshot
    pricePerNight: {
      type: Number,
      required: true,
    },

    roomPrice: {
      type: Number,
      required: true,
    },

    tax: {
      type: Number,
      default: 0,
    },

    serviceCharge: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    // Payment
    paymentMethod: {
      type: String,
      enum: ["ONLINE", "COD"],
      default: "ONLINE",
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],
      default: "PENDING",
    },

    razorpayOrderId: String,

    razorpayPaymentId: String,

    razorpaySignature: String,

    paidAt: Date,

    // Booking Status
    bookingStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "REJECTED",
        "CHECKED_IN",
        "CHECKED_OUT",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    cancellationReason: String,

    cancelledBy: {
      type: String,
      enum: ["USER", "VENDOR", "ADMIN"],
    },

    cancelledAt: Date,

    confirmedAt: Date,

    checkedInAt: Date,

    checkedOutAt: Date,

    completedAt: Date,

    // Review
    isReviewed: {
      type: Boolean,
      default: false,
    },

    // Vendor Notes
    vendorRemark: String,

    adminRemark: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "HotelBooking",
  hotelBookingSchema
);