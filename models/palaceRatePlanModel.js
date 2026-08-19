const mongoose = require("mongoose");

const palaceRatePlanSchema = new mongoose.Schema(
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
    // PROPERTY
    // ==========================================
    palace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Palace",
      required: true,
      index: true,
    },

    // ==========================================
    // ROOM CATEGORY
    // ==========================================
    roomCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PalaceRoomCategory",
      required: true,
      index: true,
    },

    // ==========================================
    // RATE PLAN BASIC
    // ==========================================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      default: "",
    },

    // ==========================================
    // MEAL PLAN
    // ==========================================
    mealPlan: {
      type: String,
      enum: [
        "ROOM_ONLY",
        "BREAKFAST",
        "BREAKFAST_DINNER",
        "ALL_MEALS",
      ],
      default: "ROOM_ONLY",
    },

    meals: {
      breakfast: {
        type: Boolean,
        default: false,
      },

      lunch: {
        type: Boolean,
        default: false,
      },

      dinner: {
        type: Boolean,
        default: false,
      },
    },

    // ==========================================
    // PRICING
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

    extraMattressPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // TAX
    // ==========================================
    gstPercentage: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // REFUND / CANCELLATION
    // ==========================================
    isRefundable: {
      type: Boolean,
      default: true,
    },

    cancellationPolicy: {
      type: String,
      default: "",
    },

    // ==========================================
    // BOOKING RESTRICTIONS
    // ==========================================
    minimumStay: {
      type: Number,
      default: 1,
      min: 1,
    },

    maximumStay: {
      type: Number,
      default: 30,
      min: 1,
    },

    minimumAdvanceBookingHours: {
      type: Number,
      default: 0,
      min: 0,
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


// Same rate plan code same room category mein duplicate nahi hoga
palaceRatePlanSchema.index(
  {
    roomCategory: 1,
    code: 1,
  },
  {
    unique: true,
  }
);


palaceRatePlanSchema.index({
  vendor: 1,
  palace: 1,
  roomCategory: 1,
});


module.exports = mongoose.model(
  "PalaceRatePlan",
  palaceRatePlanSchema
);