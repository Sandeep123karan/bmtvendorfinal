const mongoose = require("mongoose");

const cruiseCabinSchema = new mongoose.Schema(
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
    // CRUISE SHIP
    // =====================================================

    shipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CruiseShip",
      required: true,
      index: true,
    },

    // =====================================================
    // BASIC CABIN DETAILS
    // =====================================================

    cabinName: {
      type: String,
      required: true,
      trim: true,
    },

    cabinNumber: {
      type: String,
      trim: true,
      default: "",
    },

    cabinType: {
      type: String,
      enum: [
        "interior",
        "ocean-view",
        "balcony",
        "suite",
        "family",
        "penthouse",
        "other",
      ],
      required: true,
    },

    // =====================================================
    // LOCATION
    // =====================================================

    deckNumber: {
      type: Number,
      min: 0,
      default: null,
    },

    deckName: {
      type: String,
      trim: true,
      default: "",
    },

    // =====================================================
    // CAPACITY
    // =====================================================

    maxGuests: {
      type: Number,
      min: 1,
      required: true,
    },

    maxAdults: {
      type: Number,
      min: 0,
      default: 0,
    },

    maxChildren: {
      type: Number,
      min: 0,
      default: 0,
    },

    // =====================================================
    // BED DETAILS
    // =====================================================

    bedType: {
      type: String,
      enum: [
        "single",
        "twin",
        "double",
        "queen",
        "king",
        "bunk",
        "sofa-bed",
        "multiple",
        "other",
      ],
      default: "double",
    },

    numberOfBeds: {
      type: Number,
      min: 0,
      default: 1,
    },

    // =====================================================
    // CABIN SIZE
    // =====================================================

    cabinSize: {
      type: Number,
      min: 0,
      default: null,
    },

    cabinSizeUnit: {
      type: String,
      enum: ["sqm", "sqft"],
      default: "sqm",
    },

    // =====================================================
    // DESCRIPTION
    // =====================================================

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
    // PRICING
    // =====================================================

    basePrice: {
      type: Number,
      min: 0,
      default: 0,
    },

    currency: {
      type: String,
      trim: true,
      default: "INR",
    },

    // =====================================================
    // MEDIA
    // =====================================================

    coverImage: {
      type: String,
      trim: true,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    // =====================================================
    // AVAILABILITY / STATUS
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

    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// INDEXES
// =========================================================

cruiseCabinSchema.index({
  vendorId: 1,
  shipId: 1,
});

cruiseCabinSchema.index({
  shipId: 1,
  cabinType: 1,
});

cruiseCabinSchema.index({
  vendorId: 1,
  status: 1,
});

// =========================================================
// EXPORT
// =========================================================

module.exports = mongoose.model(
  "CruiseCabin",
  cruiseCabinSchema
);