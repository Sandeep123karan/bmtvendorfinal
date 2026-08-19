const mongoose = require("mongoose");

const apartmentDynamicPricingSchema = new mongoose.Schema(
  {
    // ==========================================
    // OWNER
    // ==========================================

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorApartment",
      required: true,
      index: true,
    },

    ratePlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApartmentRatePlan",
      required: true,
      index: true,
    },

    // ==========================================
    // PRICING PERIOD
    // ==========================================

    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
      index: true,
    },

    // ==========================================
    // PRICING TYPE
    // ==========================================

    pricingType: {
      type: String,
      enum: [
        "DATE_RANGE",
        "WEEKEND",
        "FESTIVAL",
        "PEAK_SEASON",
        "SPECIAL_EVENT",
      ],
      default: "DATE_RANGE",
    },

    title: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // PRICE OVERRIDE
    // ==========================================

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================
    // OPTIONAL BOOKING RULE OVERRIDE
    // ==========================================

    minStay: {
      type: Number,
      default: null,
      min: 1,
    },

    maxStay: {
      type: Number,
      default: null,
      min: 1,
    },

    // ==========================================
    // STOP SELL
    // true = booking allowed nahi
    // ==========================================

    stopSell: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // PRIORITY
    // Higher priority rule wins
    // ==========================================

    priority: {
      type: Number,
      default: 1,
    },

    // ==========================================
    // STATUS
    // ==========================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
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


// Calendar lookup fast
apartmentDynamicPricingSchema.index({
  apartment: 1,
  ratePlan: 1,
  startDate: 1,
  endDate: 1,
  isActive: 1,
});


module.exports = mongoose.model(
  "ApartmentDynamicPricing",
  apartmentDynamicPricingSchema
);