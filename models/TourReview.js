const mongoose = require("mongoose");

const tourReviewSchema = new mongoose.Schema(
  {
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
      index: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TourBooking",
      required: true,
      index: true,
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    review: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    vendorReply: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    vendorReplyAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One customer can review a booking only once
tourReviewSchema.index(
  { bookingId: 1, customerId: 1 },
  { unique: true }
);

module.exports = mongoose.model("TourReview", tourReviewSchema);