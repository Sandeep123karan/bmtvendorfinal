const mongoose = require("mongoose");

const cruiseSailingSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    shipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CruiseShip",
      required: true,
      index: true,
    },

    itineraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CruiseItinerary",
      required: true,
      index: true,
    },

    sailingCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    departureDate: {
      type: Date,
      required: true,
    },

    returnDate: {
      type: Date,
      required: true,
    },

    departurePort: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        trim: true,
        default: "",
      },

      country: {
        type: String,
        trim: true,
        default: "",
      },

      code: {
        type: String,
        trim: true,
        uppercase: true,
        default: "",
      },
    },

    arrivalPort: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        trim: true,
        default: "",
      },

      country: {
        type: String,
        trim: true,
        default: "",
      },

      code: {
        type: String,
        trim: true,
        uppercase: true,
        default: "",
      },
    },

    bookingOpenDate: {
      type: Date,
      default: null,
    },

    bookingCloseDate: {
      type: Date,
      default: null,
    },

    totalCapacity: {
      type: Number,
      min: 0,
      default: 0,
    },

    availableCapacity: {
      type: Number,
      min: 0,
      default: 0,
    },

    bookingStatus: {
      type: String,
      enum: [
        "open",
        "closed",
        "sold-out",
      ],
      default: "open",
      index: true,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "active",
        "inactive",
        "cancelled",
        "completed",
      ],
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

cruiseSailingSchema.index({
  vendorId: 1,
  sailingCode: 1,
});

cruiseSailingSchema.index({
  shipId: 1,
  departureDate: 1,
});

cruiseSailingSchema.index({
  itineraryId: 1,
  departureDate: 1,
});

cruiseSailingSchema.index({
  vendorId: 1,
  status: 1,
  bookingStatus: 1,
});

module.exports = mongoose.model(
  "CruiseSailing",
  cruiseSailingSchema
);