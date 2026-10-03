const mongoose = require("mongoose");

const activityScheduleSchema = new mongoose.Schema(
  {
    // ==========================================
    // VENDOR
    // ==========================================

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    // ==========================================
    // ACTIVITY
    // ==========================================

    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
      index: true,
    },

    // ==========================================
    // DATE
    // ==========================================

    date: {
      type: Date,
      required: true,
      index: true,
    },

    // ==========================================
    // TIME
    // ==========================================

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      trim: true,
    },

    // ==========================================
    // INVENTORY
    // ==========================================

    totalSlots: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    bookedSlots: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ==========================================
    // PRICING
    // ==========================================

    pricing: {
      adult: {
        type: Number,
        min: 0,
      },

      child: {
        type: Number,
        min: 0,
      },

      infant: {
        type: Number,
        min: 0,
      },
    },

    // ==========================================
    // STATUS
    // ==========================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// UNIQUE SLOT
// Same activity + date + startTime
// cannot be created twice
// ==========================================

activityScheduleSchema.index(
  {
    activityId: 1,
    date: 1,
    startTime: 1,
  },
  {
    unique: true,
  }
);

// ==========================================
// VENDOR DATE SEARCH
// ==========================================

activityScheduleSchema.index({
  vendorId: 1,
  date: -1,
});

module.exports =
  mongoose.models.ActivitySchedule ||
  mongoose.model(
    "ActivitySchedule",
    activityScheduleSchema
  );