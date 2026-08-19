const mongoose = require("mongoose");

const cabSchema = new mongoose.Schema(
  {
    /* =========================================
       VENDOR
    ========================================= */
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    /* =========================================
       BASIC VEHICLE DETAILS
    ========================================= */
    cabId: {
      type: String,
      default: "",
    },

    cabType: {
      type: String,
      enum: [
        "Mini",
        "Sedan",
        "SUV",
        "Premium Sedan",
        "Premium SUV",
        "Luxury",
        "Tempo Traveller",
        "Electric",
      ],
      default: "Sedan",
    },

    carName: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    brand: {
      type: String,
      default: "",
    },

    model: {
      type: String,
      default: "",
    },

    modelYear: {
      type: Number,
      default: null,
    },

    vehicleColor: {
      type: String,
      default: "",
    },

    /* =========================================
       OPERATOR / CAB OWNER
    ========================================= */
    operatorName: {
      type: String,
      default: "",
    },

    vendorName: {
      type: String,
      default: "",
    },

    cabOwnerName: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    alternatePhone: {
      type: String,
      default: "",
    },

    /* =========================================
       TRIP TYPE
    ========================================= */
    tripType: {
      type: String,
      enum: [
        "ONE_WAY",
        "ROUND_TRIP",
        "AIRPORT",
        "LOCAL",
        "OUTSTATION",
      ],
      default: "ONE_WAY",
    },

    /* =========================================
       ROUTE
    ========================================= */
    fromCity: {
      type: String,
      default: "",
      index: true,
    },

    toCity: {
      type: String,
      default: "",
      index: true,
    },

    pickupLocation: {
      type: String,
      default: "",
    },

    dropLocation: {
      type: String,
      default: "",
    },

    viaCities: {
      type: [String],
      default: [],
    },

    /* =========================================
       PICKUP / DROP DATE TIME
    ========================================= */
    pickupDate: {
      type: Date,
      default: null,
      index: true,
    },

    pickupTime: {
      type: String,
      default: "",
    },

    dropDate: {
      type: Date,
      default: null,
    },

    dropTime: {
      type: String,
      default: "",
    },

    estimatedDuration: {
      type: String,
      default: "",
    },

    distanceKm: {
      type: Number,
      default: 0,
    },

    /* =========================================
       SEATING + LUGGAGE
    ========================================= */
    totalSeats: {
      type: Number,
      default: 4,
    },

    availableSeats: {
      type: Number,
      default: 4,
    },

    luggageCapacity: {
      type: Number,
      default: 0,
    },

    /* =========================================
       PRICING
    ========================================= */
    baseFare: {
      type: Number,
      default: 0,
    },

    pricePerKm: {
      type: Number,
      default: 0,
    },

    minimumKm: {
      type: Number,
      default: 0,
    },

    extraKmCharge: {
      type: Number,
      default: 0,
    },

    driverAllowance: {
      type: Number,
      default: 0,
    },

    nightCharge: {
      type: Number,
      default: 0,
    },

    airportParkingCharge: {
      type: Number,
      default: 0,
    },

    tollIncluded: {
      type: Boolean,
      default: false,
    },

    tollCharge: {
      type: Number,
      default: 0,
    },

    gstPercentage: {
      type: Number,
      default: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    finalPrice: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    /* =========================================
       DRIVER DETAILS
    ========================================= */
    driver: {
      name: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      alternatePhone: {
        type: String,
        default: "",
      },

      licenseNumber: {
        type: String,
        default: "",
      },

      experienceYears: {
        type: Number,
        default: 0,
      },
    },

    /* =========================================
       VEHICLE DOCUMENTS
    ========================================= */
    documents: {
      rcNumber: {
        type: String,
        default: "",
      },

      insuranceNumber: {
        type: String,
        default: "",
      },

      insuranceExpiry: {
        type: Date,
        default: null,
      },

      permitNumber: {
        type: String,
        default: "",
      },

      permitExpiry: {
        type: Date,
        default: null,
      },

      fitnessExpiry: {
        type: Date,
        default: null,
      },
    },

    /* =========================================
       AMENITIES
    ========================================= */
    amenities: {
      type: [String],
      default: [],
    },

    /* =========================================
       IMAGES
    ========================================= */
    image: {
      type: String,
      default: "",
    },

    gallery: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 10;
        },
        message: "Maximum 10 gallery images allowed",
      },
    },

    /* =========================================
       POLICIES
    ========================================= */
    cancellationPolicy: {
      type: String,
      default: "",
    },

    termsAndConditions: {
      type: String,
      default: "",
    },

    /* =========================================
       RATING
    ========================================= */
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    /* =========================================
       ADMIN APPROVAL
    ========================================= */
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    /* =========================================
       ACTIVE
    ========================================= */
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


/* =========================================
   INDEX FOR CAB SEARCH
========================================= */

cabSchema.index({
  fromCity: 1,
  toCity: 1,
  tripType: 1,
  status: 1,
  isActive: 1,
});


module.exports = mongoose.model("Cab", cabSchema);