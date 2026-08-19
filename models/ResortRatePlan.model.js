const mongoose = require("mongoose");

const resortRatePlanSchema = new mongoose.Schema(
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

    // ==========================================
    // RESORT
    // ==========================================
    resort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resort",
      required: true,
      index: true,
    },

    // ==========================================
    // ROOM CATEGORY
    // ==========================================
    roomCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResortRoom",
      required: true,
      index: true,
    },

    // ==========================================
    // RATE PLAN DETAILS
    // ==========================================
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // MEAL PLAN
    // ==========================================
    mealPlan: {
      type: String,
      enum: [
        "ROOM_ONLY",
        "BREAKFAST",
        "HALF_BOARD",
        "FULL_BOARD",
      ],
      default: "ROOM_ONLY",
    },

    // ==========================================
    // DEFAULT PRICING
    // ==========================================
    basePrice: {
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
    // TAX
    // ==========================================
    gstPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ==========================================
    // CANCELLATION
    // ==========================================
    cancellationPolicy: {
      type: String,
      default: "",
    },

    refundable: {
      type: Boolean,
      default: true,
    },

    // ==========================================
    // BOOKING RULES
    // ==========================================
    minStay: {
      type: Number,
      default: 1,
      min: 1,
    },

    maxStay: {
      type: Number,
      default: 30,
      min: 1,
    },

    // ==========================================
    // STATUS
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


// Same room mein same rate plan duplicate nahi hoga
resortRatePlanSchema.index(
  {
    roomCategory: 1,
    name: 1,
  },
  {
    unique: true,
  }
);


module.exports = mongoose.model(
  "ResortRatePlan",
  resortRatePlanSchema
);