const mongoose = require("mongoose");

const cruiseShipSchema = new mongoose.Schema(
  {
    // =====================================================
    // VENDOR
    // =====================================================

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    // =====================================================
    // BASIC SHIP DETAILS
    // =====================================================

    shipName: {
      type: String,
      required: true,
      trim: true,
    },

    cruiseLineName: {
      type: String,
      trim: true,
      default: "",
    },

    cruiseType: {
      type: String,
      enum: [
        "ocean-cruise",
        "river-cruise",
        "expedition-cruise",
        "luxury-cruise",
        "other",
      ],
      default: "ocean-cruise",
    },

    vesselType: {
      type: String,
      trim: true,
      default: "",
    },

    // =====================================================
    // IDENTIFICATION
    // =====================================================

    imoNumber: {
      type: String,
      trim: true,
      default: "",
    },

    registrationNumber: {
      type: String,
      trim: true,
      default: "",
    },

    // =====================================================
    // SHIP CAPACITY
    // =====================================================

    passengerCapacity: {
      type: Number,
      min: 0,
      default: 0,
    },

    crewCapacity: {
      type: Number,
      min: 0,
      default: 0,
    },

    numberOfCabins: {
      type: Number,
      min: 0,
      default: 0,
    },

    numberOfDecks: {
      type: Number,
      min: 0,
      default: 0,
    },

    // =====================================================
    // SHIP INFORMATION
    // =====================================================

    yearBuilt: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear(),
      default: null,
    },

    yearRefurbished: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear(),
      default: null,
    },

    shipLength: {
      type: Number,
      min: 0,
      default: null,
    },

    shipWidth: {
      type: Number,
      min: 0,
      default: null,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // =====================================================
    // AMENITIES
    // =====================================================

    amenities: {
      type: [String],
      default: [],
    },

    // =====================================================
    // MEDIA
    // =====================================================

    logo: {
      type: String,
      trim: true,
      default: "",
    },

    coverImage: {
      type: String,
      trim: true,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    videos: {
      type: [String],
      default: [],
    },

    // =====================================================
    // STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "draft",
        "active",
        "inactive",
      ],
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// INDEXES
// =========================================================

cruiseShipSchema.index({
  vendorId: 1,
  shipName: 1,
});

cruiseShipSchema.index({
  vendorId: 1,
  status: 1,
});

// =========================================================
// EXPORT
// =========================================================

module.exports = mongoose.model(
  "CruiseShip",
  cruiseShipSchema
);