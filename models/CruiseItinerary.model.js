const mongoose = require("mongoose");

const cruiseItinerarySchema = new mongoose.Schema(
  {
    // =====================================================
    // VENDOR
    // =====================================================

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    // =====================================================
    // CRUISE SHIP
    // =====================================================

    shipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CruiseShip",
      required: true,
      index: true,
    },

    // =====================================================
    // BASIC ITINERARY DETAILS
    // =====================================================

    itineraryName: {
      type: String,
      required: true,
      trim: true,
    },

    itineraryCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // =====================================================
    // DURATION
    // =====================================================

    durationDays: {
      type: Number,
      min: 1,
      required: true,
    },

    durationNights: {
      type: Number,
      min: 0,
      required: true,
    },

    // =====================================================
    // START / END PORT
    // =====================================================

    departurePort: {
      name: {
        type: String,
        trim: true,
        required: true,
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
        trim: true,
        required: true,
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

    // =====================================================
    // DAILY ROUTE / STOPS
    // =====================================================

    stops: [
      {
        day: {
          type: Number,
          required: true,
          min: 1,
        },

        portName: {
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

        portCode: {
          type: String,
          trim: true,
          uppercase: true,
          default: "",
        },

        arrivalTime: {
          type: String,
          trim: true,
          default: "",
        },

        departureTime: {
          type: String,
          trim: true,
          default: "",
        },

        stayDuration: {
          type: String,
          trim: true,
          default: "",
        },

        description: {
          type: String,
          trim: true,
          default: "",
        },

        activities: {
          type: [String],
          default: [],
        },
      },
    ],

    // =====================================================
    // DESTINATIONS
    // =====================================================

    destinations: {
      type: [String],
      default: [],
    },

    // =====================================================
    // ACTIVITIES
    // =====================================================

    activities: {
      type: [String],
      default: [],
    },

    // =====================================================
    // INCLUDED / EXCLUDED
    // =====================================================

    inclusions: {
      type: [String],
      default: [],
    },

    exclusions: {
      type: [String],
      default: [],
    },

    // =====================================================
    // ITINERARY MEDIA
    // =====================================================

    coverImage: {
      type: String,
      trim: true,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    // =====================================================
    // SCHEDULE
    // =====================================================

    departureDate: {
      type: Date,
      default: null,
    },

    returnDate: {
      type: Date,
      default: null,
    },

    // =====================================================
    // STATUS
    // =====================================================

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

// =========================================================
// INDEXES
// =========================================================

cruiseItinerarySchema.index({
  vendorId: 1,
  shipId: 1,
});

cruiseItinerarySchema.index({
  vendorId: 1,
  status: 1,
});

cruiseItinerarySchema.index({
  shipId: 1,
  itineraryCode: 1,
});

// =========================================================
// EXPORT
// =========================================================

module.exports = mongoose.model(
  "CruiseItinerary",
  cruiseItinerarySchema
);