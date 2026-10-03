const mongoose = require("mongoose");

const nightClubEventTableSchema = new mongoose.Schema(
  {
    // ==========================================
    // REFERENCES
    // ==========================================

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

    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NightClubTable",
      required: true,
      index: true,
    },

    // ==========================================
    // TABLE DETAILS FOR THIS EVENT
    // ==========================================

    tableNumber: {
      type: String,
      required: true,
    },

    tableType: {
      type: String,
      enum: [
        "regular",
        "premium",
        "vip",
        "private",
        "booth",
        "sofa",
      ],
      default: "regular",
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    // ==========================================
    // EVENT PRICE
    // ==========================================

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // ==========================================
    // AVAILABILITY
    // ==========================================

    status: {
      type: String,
      enum: [
        "available",
        "reserved",
        "booked",
        "blocked",
        "maintenance",
      ],
      default: "available",
      index: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ==========================================
    // BOOKING
    // ==========================================

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NightClubEventBooking",
      default: null,
    },

    reservedUntil: {
      type: Date,
      default: null,
    },

    bookedAt: {
      type: Date,
      default: null,
    },

    // ==========================================
    // EVENT-SPECIFIC DETAILS
    // ==========================================

    minimumPersons: {
      type: Number,
      default: 1,
      min: 1,
    },

    maximumPersons: {
      type: Number,
      default: 0,
      min: 0,
    },

    complimentaryDrinks: {
      type: Number,
      default: 0,
      min: 0,
    },

    complimentaryFood: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// ONE TABLE CAN ONLY BE ADDED ONCE
// TO ONE EVENT
// ==========================================

nightClubEventTableSchema.index(
  {
    eventId: 1,
    tableId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "NightClubEventTable",
  nightClubEventTableSchema
);