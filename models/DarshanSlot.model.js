const mongoose = require("mongoose");

const darshanSlotSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    darshanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Darshan",
      required: true,
      index: true,
    },

    darshanTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DarshanType",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    availableCapacity: {
      type: Number,
      required: true,
      min: 0,
    },

    bookedCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxPersonsPerBooking: {
      type: Number,
      default: 10,
      min: 1,
    },

    adultPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    childPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    seniorCitizenPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

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

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

darshanSlotSchema.index({
  darshanId: 1,
  darshanTypeId: 1,
});

module.exports = mongoose.model(
  "DarshanSlot",
  darshanSlotSchema
);