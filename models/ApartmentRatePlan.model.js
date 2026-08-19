const mongoose = require("mongoose");

const apartmentRatePlanSchema = new mongoose.Schema(
  {
    // ==========================================
    // OWNER / SECURITY
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

    // ==========================================
    // BASIC RATE PLAN
    // ==========================================

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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

    // ==========================================
    // PRICING
    // ==========================================

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    weekendPrice: {
      type: Number,
      default: 0,
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
    // Later GST calculation mein use hoga
    // ==========================================

    gstPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ==========================================
    // REFUND POLICY
    // ==========================================

    refundable: {
      type: Boolean,
      default: true,
    },

    cancellationHours: {
      type: Number,
      default: 24,
      min: 0,
    },

    cancellationChargeType: {
      type: String,
      enum: [
        "NONE",
        "PERCENTAGE",
        "FIXED",
        "ONE_NIGHT",
      ],
      default: "NONE",
    },

    cancellationChargeValue: {
      type: Number,
      default: 0,
      min: 0,
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

    minAdvanceBookingHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxAdvanceBookingDays: {
      type: Number,
      default: 365,
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


// Same apartment mein same rate code duplicate nahi hoga
apartmentRatePlanSchema.index(
  {
    apartment: 1,
    code: 1,
  },
  {
    unique: true,
  }
);


apartmentRatePlanSchema.index({
  vendor: 1,
  apartment: 1,
  isActive: 1,
});


module.exports = mongoose.model(
  "ApartmentRatePlan",
  apartmentRatePlanSchema
);