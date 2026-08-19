const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const palaceRoomCategorySchema = new mongoose.Schema(
  {
    // ==========================================
    // OWNER / PROPERTY
    // ==========================================
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    palace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Palace",
      required: true,
      index: true,
    },

    // ==========================================
    // ROOM BASIC DETAILS
    // ==========================================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    roomType: {
      type: String,
      enum: [
        "DELUXE",
        "PREMIUM",
        "ROYAL",
        "HERITAGE",
        "SUITE",
        "MAHARAJA_SUITE",
        "VILLA",
        "OTHER",
      ],
      default: "DELUXE",
    },

    roomSize: {
      type: Number,
      default: 0,
      min: 0,
    },

    roomSizeUnit: {
      type: String,
      enum: ["SQFT", "SQM"],
      default: "SQFT",
    },

    // ==========================================
    // BED CONFIGURATION
    // ==========================================
    bedType: {
      type: String,
      default: "",
    },

    bedCount: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ==========================================
    // GUEST CAPACITY
    // ==========================================
    includedAdults: {
      type: Number,
      default: 2,
      min: 1,
    },

    maxAdults: {
      type: Number,
      default: 2,
      min: 1,
    },

    maxChildren: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxGuests: {
      type: Number,
      default: 2,
      min: 1,
    },

    maxExtraMattress: {
      type: Number,
      default: 0,
      min: 0,
    },

    extraMattressAllowed: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // ROOM INVENTORY
    // Total physical rooms of this category
    // ==========================================
    totalUnits: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    // ==========================================
    // AMENITIES
    // ==========================================
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],

    // ==========================================
    // MEDIA
    // ==========================================
    images: [imageSchema],

    coverImage: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    // ==========================================
    // STATUS
    // ==========================================
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


// One vendor + palace room category query fast
palaceRoomCategorySchema.index({
  vendor: 1,
  palace: 1,
  createdAt: -1,
});


module.exports = mongoose.model(
  "PalaceRoomCategory",
  palaceRoomCategorySchema
);