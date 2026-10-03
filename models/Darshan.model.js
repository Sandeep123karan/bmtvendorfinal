const mongoose = require("mongoose");

const darshanSchema = new mongoose.Schema(
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
    // BASIC DETAILS
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    shortDescription: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // TEMPLE DETAILS
    // =====================================================

    templeName: {
      type: String,
      required: true,
      trim: true,
    },

    deityName: {
      type: String,
      default: "",
      trim: true,
    },

    deityType: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // LOCATION
    // =====================================================

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

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    pincode: {
      type: String,
      default: "",
      trim: true,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    // =====================================================
    // IMAGES
    // =====================================================

    mainImage: {
      type: String,
      default: "",
    },

    galleryImages: [
      {
        type: String,
      },
    ],

    // =====================================================
    // DARSHAN TIMINGS
    // =====================================================

    openingTime: {
      type: String,
      default: "",
    },

    closingTime: {
      type: String,
      default: "",
    },

    morningDarshanStart: {
      type: String,
      default: "",
    },

    morningDarshanEnd: {
      type: String,
      default: "",
    },

    eveningDarshanStart: {
      type: String,
      default: "",
    },

    eveningDarshanEnd: {
      type: String,
      default: "",
    },

    // =====================================================
    // OPERATING DAYS
    // =====================================================

    operatingDays: [
      {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
    ],

    // =====================================================
    // DARSHAN TYPES
    // =====================================================

    darshanTypes: [
      {
        type: String,
        trim: true,
      },
    ],

    // =====================================================
    // CAPACITY
    // =====================================================

    dailyCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // BASIC PRICE
    // =====================================================

    basePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // =====================================================
    // FACILITIES
    // =====================================================

    wheelchairAccessible: {
      type: Boolean,
      default: false,
    },

    parkingAvailable: {
      type: Boolean,
      default: false,
    },

    cloakRoomAvailable: {
      type: Boolean,
      default: false,
    },

    prasadAvailable: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // POLICIES
    // =====================================================

    ageRestriction: {
      type: Number,
      default: 0,
      min: 0,
    },

    dressCode: {
      type: String,
      default: "",
    },

    entryPolicy: {
      type: String,
      default: "",
    },

    cancellationPolicy: {
      type: String,
      default: "",
    },

    // =====================================================
    // CONTACT
    // =====================================================

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "inactive",
      ],
      default: "draft",
      index: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

darshanSchema.index({
  city: 1,
  state: 1,
});

darshanSchema.index({
  vendorId: 1,
  status: 1,
});

darshanSchema.index({
  isPublished: 1,
  isActive: 1,
});

module.exports = mongoose.model(
  "Darshan",
  darshanSchema
);