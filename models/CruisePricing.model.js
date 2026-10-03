const mongoose = require("mongoose");

const cruisePricingSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    sailingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CruiseSailing",
      required: true,
      index: true,
    },

    shipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CruiseShip",
      required: true,
      index: true,
    },

    cabinId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CruiseCabin",
      required: true,
      index: true,
    },

    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "INR",
    },

    basePrice: {
      type: Number,
      min: 0,
      required: true,
    },

    adultPrice: {
      type: Number,
      min: 0,
      required: true,
    },

    childPrice: {
      type: Number,
      min: 0,
      default: 0,
    },

    infantPrice: {
      type: Number,
      min: 0,
      default: 0,
    },

    singleSupplement: {
      type: Number,
      min: 0,
      default: 0,
    },

    taxPercentage: {
      type: Number,
      min: 0,
      default: 0,
    },

    taxAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    portCharges: {
      type: Number,
      min: 0,
      default: 0,
    },

    serviceCharges: {
      type: Number,
      min: 0,
      default: 0,
    },

    discountAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    finalPrice: {
      type: Number,
      min: 0,
      required: true,
    },

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

cruisePricingSchema.index(
  {
    vendorId: 1,
    sailingId: 1,
    cabinId: 1,
  },
  {
    unique: true,
  }
);

cruisePricingSchema.index({
  sailingId: 1,
  status: 1,
});

cruisePricingSchema.index({
  cabinId: 1,
  status: 1,
});

module.exports = mongoose.model(
  "CruisePricing",
  cruisePricingSchema
);