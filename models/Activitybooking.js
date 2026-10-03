const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema(
  {
    status: String,
    by: { type: String, enum: ["USER", "VENDOR", "SYSTEM"] },
    note: { type: String, trim: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const activityBookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true, required: true, index: true },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true, index: true },
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: "ActivitySchedule", required: true, index: true },

    guests: {
      adults: { type: Number, min: 1, required: true },
      children: { type: Number, min: 0, default: 0 },
      infants: { type: Number, min: 0, default: 0 },
    },

    // adults + children (infants slot nahi lete)
    slotsBooked: { type: Number, min: 1, required: true },

    leadTraveller: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },

    specialRequest: { type: String, trim: true, maxlength: 500 },

    priceSnapshot: {
      adult: { type: Number, default: 0 },
      child: { type: Number, default: 0 },
      infant: { type: Number, default: 0 },
    },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },

    activitySnapshot: {
      title: String,
      thumbnail: String,
      city: String,
      meetingPoint: String,
      cancellationPolicy: String,
    },
    activityDate: { type: Date, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String },
    startsAt: { type: Date, required: true, index: true },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUND_PENDING", "REFUNDED"],
      default: "PENDING",
      index: true,
    },
    paymentId: { type: String, trim: true },

    cancelledBy: { type: String, enum: ["USER", "VENDOR", "SYSTEM"] },
    cancellationReason: { type: String, trim: true },
    cancelledAt: Date,
    confirmedAt: Date,
    completedAt: Date,

    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

activityBookingSchema.index({ userId: 1, createdAt: -1 });
activityBookingSchema.index({ vendorId: 1, createdAt: -1 });
activityBookingSchema.index({ vendorId: 1, status: 1 });
activityBookingSchema.index({ scheduleId: 1, status: 1 });

module.exports =
  mongoose.models.ActivityBooking ||
  mongoose.model("ActivityBooking", activityBookingSchema);