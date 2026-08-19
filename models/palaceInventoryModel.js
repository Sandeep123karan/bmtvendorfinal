const mongoose = require("mongoose");

const palaceInventorySchema = new mongoose.Schema(
  {
    // ==========================================
    // PALACE
    // ==========================================
    palace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Palace",
      required: true,
      index: true,
    },

    // ==========================================
    // ROOM CATEGORY
    // Inventory category-wise hoga
    // ==========================================
    roomCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PalaceRoomCategory",
      required: true,
      index: true,
    },

    // ==========================================
    // INVENTORY DATE
    // ==========================================
    date: {
      type: Date,
      required: true,
      index: true,
    },

    // ==========================================
    // ROOM COUNTS
    // ==========================================
    totalRooms: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    bookedRooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    blockedRooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    maintenanceRooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    availableRooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // SALES CONTROL
    // ==========================================
    stopSell: {
      type: Boolean,
      default: false,
    },

    closedToArrival: {
      type: Boolean,
      default: false,
    },

    closedToDeparture: {
      type: Boolean,
      default: false,
    },

    minimumStay: {
      type: Number,
      default: 1,
      min: 1,
    },

    maximumStay: {
      type: Number,
      default: 30,
      min: 1,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);


// Ek Palace + Category + Date = ek hi inventory record
palaceInventorySchema.index(
  {
    palace: 1,
    roomCategory: 1,
    date: 1,
  },
  {
    unique: true,
  }
);


module.exports = mongoose.model(
  "PalaceInventory",
  palaceInventorySchema
);