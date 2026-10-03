const mongoose = require("mongoose");

const tourScheduleSchema = new mongoose.Schema(
  {
    // ==========================================================
    // VENDOR
    // ==========================================================
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    // ==========================================================
    // TOUR
    // ==========================================================
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
      index: true,
    },

    // ==========================================================
    // DEPARTURE / RETURN
    // ==========================================================
    departureDate: {
      type: Date,
      required: true,
    },

    returnDate: {
      type: Date,
      required: true,
    },

    // ==========================================================
    // SEATS
    // ==========================================================
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================================
    // PRICING
    // ==========================================================
    pricing: {
      adult: {
        type: Number,
        required: true,
        min: 0,
      },

      child: {
        type: Number,
        default: 0,
        min: 0,
      },

      infant: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // ==========================================================
    // STATUS
    // ==========================================================
    status: {
      type: String,
      enum: [
        "DRAFT",
        "OPEN",
        "FULL",
        "CLOSED",
        "CANCELLED",
        "COMPLETED",
      ],
      default: "DRAFT",
      index: true,
    },

    // ==========================================================
    // VENDOR NOTE
    // ==========================================================
    vendorNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);


// ==========================================================
// VALIDATION
// ==========================================================

tourScheduleSchema.pre("validate", function (next) {
  if (
    this.returnDate &&
    this.departureDate &&
    this.returnDate < this.departureDate
  ) {
    return next(
      new Error("Return date cannot be before departure date")
    );
  }

  if (this.availableSeats > this.totalSeats) {
    return next(
      new Error("Available seats cannot exceed total seats")
    );
  }

  
});


// ==========================================================
// INDEXES
// ==========================================================

tourScheduleSchema.index({
  tourId: 1,
  departureDate: 1,
});

tourScheduleSchema.index({
  vendorId: 1,
  departureDate: 1,
});

module.exports = mongoose.model(
  "TourSchedule",
  tourScheduleSchema
);