const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    // Seat identity
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },

    // LOWER / UPPER deck
    deck: {
      type: String,
      enum: ["LOWER", "UPPER"],
      default: "LOWER",
    },

    // Sleeper / Seater
    seatType: {
      type: String,
      enum: ["SEATER", "SLEEPER"],
      default: "SEATER",
    },

    // Single / Double sleeper
    berthType: {
      type: String,
      enum: ["SINGLE", "DOUBLE", ""],
      default: "",
    },

    // Position for frontend seat layout
    row: {
      type: Number,
      default: 1,
    },

    column: {
      type: Number,
      default: 1,
    },

    // Left / Right
    side: {
      type: String,
      enum: ["LEFT", "RIGHT", ""],
      default: "",
    },

    // Window / Aisle
    positionType: {
      type: String,
      enum: ["WINDOW", "AISLE", "MIDDLE", ""],
      default: "",
    },

    // Seat status
    status: {
      type: String,
      enum: ["AVAILABLE", "BLOCKED", "MAINTENANCE"],
      default: "AVAILABLE",
    },

    // Default price for this seat
    price: {
      type: Number,
      default: 0,
    },

    // Extra charge
    extraCharge: {
      type: Number,
      default: 0,
    },

    // Female-only seat if vendor wants
    genderRestriction: {
      type: String,
      enum: ["ANY", "FEMALE_ONLY"],
      default: "ANY",
    },

    // Active seat
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const busSeatLayoutSchema = new mongoose.Schema(
  {
    // Bus
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
      unique: true,
      index: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    // Bus layout
    layoutType: {
      type: String,
      enum: [
        "2X2_SEATER",
        "2X1_SEATER",
        "2X2_SLEEPER",
        "2X1_SLEEPER",
        "MIXED",
      ],
      default: "2X2_SEATER",
    },

    totalRows: {
      type: Number,
      default: 0,
    },

    totalColumns: {
      type: Number,
      default: 0,
    },

    hasUpperDeck: {
      type: Boolean,
      default: false,
    },

    lowerDeckSeats: [seatSchema],

    upperDeckSeats: [seatSchema],

    // Layout active/inactive
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "BusSeatLayout",
  busSeatLayoutSchema
);