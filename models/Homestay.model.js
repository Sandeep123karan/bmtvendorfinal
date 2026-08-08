const mongoose = require("mongoose");

/* ============================================================
   HOMESTAY MODEL
   Property / Listing Level
============================================================ */

const homestaySchema = new mongoose.Schema(
  {
    /* ==========================================================
       VENDOR
    ========================================================== */

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    /* ==========================================================
       BASIC PROPERTY INFORMATION
    ========================================================== */

    propertyName: {
      type: String,
      required: true,
      trim: true,
    },

    propertyType: {
      type: String,
      enum: [
        "homestay",
        "villa",
        "cottage",
        "farmhouse",
        "guesthouse",
        "bungalow",
        "apartment",
        "holiday-home",
        "heritage-home",
      ],
      required: true,
      default: "homestay",
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    /* ==========================================================
       HOST INFORMATION
    ========================================================== */

    hostName: {
      type: String,
      required: true,
      trim: true,
    },

    hostPhone: {
      type: String,
      required: true,
      trim: true,
    },

    hostEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    hostProfileImage: {
      type: String,
      default: "",
    },

    hostDescription: {
      type: String,
      default: "",
      trim: true,
    },

    isProfessionalHost: {
      type: Boolean,
      default: false,
    },

    /* ==========================================================
       PROPERTY LOCATION
    ========================================================== */

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    landmark: {
      type: String,
      default: "",
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    /* ==========================================================
       GEO LOCATION
       GeoJSON => [longitude, latitude]
    ========================================================== */

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    /* ==========================================================
       PROPERTY CAPACITY
    ========================================================== */

    maxGuests: {
      type: Number,
      default: 1,
      min: 1,
    },

    totalBedrooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalBathrooms: {
      type: Number,
      default: 1,
      min: 1,
    },

    totalBeds: {
      type: Number,
      default: 1,
      min: 1,
    },

    /* ==========================================================
       PROPERTY AMENITIES
    ========================================================== */

    amenities: {
      type: [String],
      default: [],
    },

    propertyHighlights: {
      type: [String],
      default: [],
    },

    outdoorFacilities: {
      type: [String],
      default: [],
    },

    indoorFacilities: {
      type: [String],
      default: [],
    },

    safetyFacilities: {
      type: [String],
      default: [],
    },

    familyFacilities: {
      type: [String],
      default: [],
    },

    /* ==========================================================
       COMMON AMENITIES
    ========================================================== */

    wifi: {
      type: Boolean,
      default: true,
    },

    parking: {
      type: Boolean,
      default: false,
    },

    privateParking: {
      type: Boolean,
      default: false,
    },

    swimmingPool: {
      type: Boolean,
      default: false,
    },

    garden: {
      type: Boolean,
      default: false,
    },

    balcony: {
      type: Boolean,
      default: false,
    },

    terrace: {
      type: Boolean,
      default: false,
    },

    bonfire: {
      type: Boolean,
      default: false,
    },

    barbecue: {
      type: Boolean,
      default: false,
    },

    fireplace: {
      type: Boolean,
      default: false,
    },

    restaurant: {
      type: Boolean,
      default: false,
    },

    roomService: {
      type: Boolean,
      default: false,
    },

    laundry: {
      type: Boolean,
      default: false,
    },

    powerBackup: {
      type: Boolean,
      default: false,
    },

    airConditioning: {
      type: Boolean,
      default: false,
    },

    heater: {
      type: Boolean,
      default: false,
    },

    /* ==========================================================
       FOOD & DINING
    ========================================================== */

    foodAvailable: {
      type: Boolean,
      default: false,
    },

    breakfastAvailable: {
      type: Boolean,
      default: false,
    },

    lunchAvailable: {
      type: Boolean,
      default: false,
    },

    dinnerAvailable: {
      type: Boolean,
      default: false,
    },

    kitchenAvailable: {
      type: Boolean,
      default: false,
    },

    mealTypes: {
      type: [String],
      default: [],
    },

    /* ==========================================================
       PROPERTY POLICIES
    ========================================================== */

    checkInTime: {
      type: String,
      default: "12:00 PM",
    },

    checkOutTime: {
      type: String,
      default: "11:00 AM",
    },

    earlyCheckInAllowed: {
      type: Boolean,
      default: false,
    },

    lateCheckOutAllowed: {
      type: Boolean,
      default: false,
    },

    coupleFriendly: {
      type: Boolean,
      default: true,
    },

    unmarriedCouplesAllowed: {
      type: Boolean,
      default: true,
    },

    localIdAllowed: {
      type: Boolean,
      default: true,
    },

    petsAllowed: {
      type: Boolean,
      default: false,
    },

    smokingAllowed: {
      type: Boolean,
      default: false,
    },

    alcoholAllowed: {
      type: Boolean,
      default: false,
    },

    partiesAllowed: {
      type: Boolean,
      default: false,
    },

    eventsAllowed: {
      type: Boolean,
      default: false,
    },

    childrenAllowed: {
      type: Boolean,
      default: true,
    },

    /* ==========================================================
       HOUSE RULES
    ========================================================== */

    houseRules: {
      type: [String],
      default: [],
    },

    childPolicy: {
      type: String,
      default: "",
      trim: true,
    },

    petPolicy: {
      type: String,
      default: "",
      trim: true,
    },

    extraGuestPolicy: {
      type: String,
      default: "",
      trim: true,
    },

    /* ==========================================================
       CANCELLATION POLICY
    ========================================================== */

    cancellationPolicy: {
      type: String,
      default: "",
      trim: true,
    },

    freeCancellation: {
      type: Boolean,
      default: false,
    },

    cancellationDeadlineHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ==========================================================
       PAYMENT OPTIONS
    ========================================================== */

    paymentMethods: {
      type: [String],
      enum: [
        "online",
        "upi",
        "card",
        "net-banking",
        "pay-at-property",
      ],
      default: ["online"],
    },

    payAtProperty: {
      type: Boolean,
      default: false,
    },

    advancePaymentRequired: {
      type: Boolean,
      default: false,
    },

    advancePaymentPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    /* ==========================================================
       BUSINESS / TAX
    ========================================================== */

    businessName: {
      type: String,
      default: "",
      trim: true,
    },

    gstNumber: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    panNumber: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    /* ==========================================================
       MEDIA
    ========================================================== */

    propertyLogo: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    propertyImages: {
      type: [String],
      default: [],
    },

    videos: {
      type: [String],
      default: [],
    },

    virtualTourLink: {
      type: String,
      default: "",
    },

    /* ==========================================================
       NEARBY PLACES
    ========================================================== */

    nearbyPlaces: [
      {
        name: {
          type: String,
          trim: true,
        },

        distance: {
          type: String,
          trim: true,
        },

        type: {
          type: String,
          trim: true,
        },
      },
    ],

    /* ==========================================================
       CHECK-IN INFORMATION
    ========================================================== */

    checkInMethod: {
      type: String,
      enum: [
        "host",
        "reception",
        "self-check-in",
        "key-box",
        "digital-lock",
      ],
      default: "host",
    },

    checkInInstructions: {
      type: String,
      default: "",
      trim: true,
    },

    /* ==========================================================
       RATING & REVIEWS
    ========================================================== */

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ==========================================================
       ADMIN APPROVAL
    ========================================================== */

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING",
        "APPROVED",
        "REJECTED",
        "SUSPENDED",
      ],
      default: "DRAFT",
      index: true,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    /* ==========================================================
       PLATFORM SETTINGS
    ========================================================== */

    featured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /* ==========================================================
       SEO
    ========================================================== */

    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    metaTitle: {
      type: String,
      default: "",
      trim: true,
    },

    metaDescription: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


/* ============================================================
   INDEXES
============================================================ */

// Nearby homestay search
homestaySchema.index({
  location: "2dsphere",
});

// Vendor dashboard/listing
homestaySchema.index({
  vendor: 1,
  status: 1,
});

// City search
homestaySchema.index({
  city: 1,
  status: 1,
  isActive: 1,
});

// Property type filtering
homestaySchema.index({
  propertyType: 1,
  status: 1,
});

// Rating sorting
homestaySchema.index({
  averageRating: -1,
});

// Featured properties
homestaySchema.index({
  featured: 1,
  status: 1,
});


/* ============================================================
   EXPORT
============================================================ */

module.exports = mongoose.model("Homestay", homestaySchema);