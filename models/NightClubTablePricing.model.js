const mongoose = require("mongoose");

const nightClubTablePricingSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    nightClubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NightClub",
      required: true,
      index: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NightClubEvent",
      required: true,
      index: true,
    },

    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NightClubTable",
      required: true,
      index: true,
    },

    // =========================
    // PRICING
    // =========================

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    minimumSpend: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // =========================
    // PERSON LIMIT
    // =========================

    minimumPersons: {
      type: Number,
      default: 1,
      min: 1,
    },

    maximumPersons: {
      type: Number,
      required: true,
      min: 1,
    },

    // =========================
    // AVAILABILITY
    // =========================

    totalQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    availableQuantity: {
      type: Number,
      default: 1,
      min: 0,
    },

    bookedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // STATUS
    // =========================

    isActive: {
      type: Boolean,
      default: true,
    },

    isBookable: {
      type: Boolean,
      default: true,
    },

    isSoldOut: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

nightClubTablePricingSchema.index({
  eventId: 1,
  tableId: 1,
});

module.exports = mongoose.model(
  "NightClubTablePricing",
  nightClubTablePricingSchema
);