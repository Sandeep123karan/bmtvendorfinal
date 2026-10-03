const mongoose = require("mongoose");

const cellSchema = new mongoose.Schema(
  {
    row: { type: Number, required: true },
    col: { type: Number, required: true },
    seatNumber: { type: String, default: "" },
    seatType: {
      type: String,
      enum: ["SEATER", "SLEEPER", "EMPTY"],
      default: "SEATER",
    },
    berthType: {
      type: String,
      enum: ["SINGLE", "DOUBLE", ""],
      default: "",
    },
    category: {
      type: String,
      enum: ["REGULAR", "LADIES", "SENIOR", "VIP", "CREW", ""],
      default: "REGULAR",
    },
    isSeat: { type: Boolean, default: true },
  },
  { _id: false }
);

const busTypeSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleMake: {
      type: String,
      default: "Leyland",
      trim: true,
    },
    otherInfo: {
      type: String,
      default: "Air Suspension",
      trim: true,
    },
    seatingType: {
      type: String,
      default: "2+1",
      trim: true,
    },
    isAc: {
      type: Boolean,
      default: true,
    },
    displayName: {
      type: String,
      default: "",
      trim: true,
    },
    hasUpperDeck: {
      type: Boolean,
      default: false,
    },
    gridRows: {
      type: Number,
      default: 5,
    },
    gridCols: {
      type: Number,
      default: 15,
    },
    totalSeats: {
      type: Number,
      default: 0,
    },
    lowerSeatsCount: {
      type: Number,
      default: 0,
    },
    upperSeatsCount: {
      type: Number,
      default: 0,
    },
    lowerDeckGrid: [cellSchema],
    upperDeckGrid: [cellSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

busTypeSchema.index({ vendor: 1, name: 1 });

module.exports = mongoose.model("BusType", busTypeSchema);
