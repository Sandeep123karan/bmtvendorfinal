const mongoose = require("mongoose");

const palaceDynamicPricingSchema = new mongoose.Schema(
  {
    // ==========================================
    // PALACE
    // ==========================================
    palace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Palace",
      required: true,
      index: true,
    },

    // ==========================================
    // ROOM CATEGORY
    // Example: Royal Suite / Deluxe Room
    // ==========================================
    roomCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PalaceRoomCategory",
      required: true,
      index: true,
    },

    // ==========================================
    // RATE PLAN
    // Example: Room Only / Breakfast Included
    // ==========================================
    ratePlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PalaceRatePlan",
      required: true,
      index: true,
    },

    // ==========================================
    // DATE RANGE
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
    // PRICING MODE
    // FIXED = direct price
    // PERCENTAGE = increase/decrease from base
    // ==========================================
    pricingType: {
      type: String,
      enum: ["FIXED", "PERCENTAGE"],
      default: "FIXED",
    },

    // ==========================================
    // FIXED PRICE
    // Example: ₹12000 per night
    // ==========================================
    price: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ==========================================
    // PERCENTAGE ADJUSTMENT
    // Example:
    // 20 = +20%
    // -10 = -10%
    // ==========================================
    percentageChange: {
      type: Number,
      default: 0,
    },

    // ==========================================
    // DAYS FILTER
    // Empty [] = all days
    // ==========================================
    daysOfWeek: [
      {
        type: String,
        enum: [
          "SUNDAY",
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
        ],
      },
    ],

    // ==========================================
    // PRIORITY
    // Higher priority rule wins
    // ==========================================
    priority: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ==========================================
    // NAME / REASON
    // Example: Diwali Pricing
    // ==========================================
    title: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    // ==========================================
    // ACTIVE
    // ==========================================
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


// ==========================================
// INDEX FOR FAST DATE SEARCH
// ==========================================

palaceDynamicPricingSchema.index({
  palace: 1,
  roomCategory: 1,
  ratePlan: 1,
  startDate: 1,
  endDate: 1,
  priority: -1,
});


module.exports = mongoose.model(
  "PalaceDynamicPricing",
  palaceDynamicPricingSchema
);