const mongoose = require("mongoose");

const resortPricingSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    resort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resort",
      required: true,
      index: true,
    },

    roomCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResortRoom",
      required: true,
      index: true,
    },

    ratePlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResortRatePlan",
      required: true,
      index: true,
    },

    // ==========================================
    // DATE
    // ==========================================
    date: {
      type: Date,
      required: true,
      index: true,
    },

    // ==========================================
    // PRICE FOR THIS DATE
    // ==========================================
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    extraAdultPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    extraChildPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // MINIMUM STAY OVERRIDE
    // ==========================================
    minStay: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ==========================================
    // STATUS
    // ==========================================
    isAvailable: {
      type: Boolean,
      default: true,
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


// One price per rate plan per date
resortPricingSchema.index(
  {
    ratePlan: 1,
    date: 1,
  },
  {
    unique: true,
  }
);


// Fast search
resortPricingSchema.index({
  resort: 1,
  roomCategory: 1,
  date: 1,
});


module.exports = mongoose.model(
  "ResortPricing",
  resortPricingSchema
);