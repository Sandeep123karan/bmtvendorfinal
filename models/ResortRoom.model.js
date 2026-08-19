const mongoose = require("mongoose");

const resortRoomSchema = new mongoose.Schema(
  {
    // ==========================================
    // RESORT
    // ==========================================
    resort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resort",
      required: true,
      index: true,
    },

    // Owner vendor for security and faster queries
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
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

    roomSize: {
      type: Number,
      default: 0,
    },

    roomSizeUnit: {
      type: String,
      enum: ["sqft", "sqm"],
      default: "sqft",
    },

    // ==========================================
    // BED DETAILS
    // ==========================================
    bedType: {
      type: String,
      default: "",
    },

    numberOfBeds: {
      type: Number,
      default: 1,
    },

    // ==========================================
    // GUEST CAPACITY
    // ==========================================
    maxAdults: {
      type: Number,
      default: 2,
    },

    maxChildren: {
      type: Number,
      default: 0,
    },

    maxGuests: {
      type: Number,
      default: 2,
    },

    // ==========================================
    // PRICING
    // Basic/default price
    // Date-wise pricing next module mein
    // ==========================================
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    extraAdultPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    extraChildPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // MEAL PLAN
    // ==========================================
    mealPlans: [
      {
        name: {
          type: String,
          enum: ["ROOM_ONLY", "BREAKFAST", "HALF_BOARD", "FULL_BOARD"],
        },

        price: {
          type: Number,
          default: 0,
        },
      },
    ],

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
    // ROOM IMAGES
    // ==========================================
    images: [
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
    ],

    // ==========================================
    // STATUS
    // ==========================================
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
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


// ==========================================
// Same resort mein same room name duplicate nahi
// ==========================================

resortRoomSchema.index(
  {
    resort: 1,
    name: 1,
  },
  {
    unique: true,
  }
);


module.exports = mongoose.model("ResortRoom", resortRoomSchema);