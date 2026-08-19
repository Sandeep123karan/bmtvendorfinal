const mongoose = require("mongoose");

const resortInventorySchema = new mongoose.Schema(
  {
    // ==========================================
    // OWNER
    // ==========================================
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    // ==========================================
    // RESORT
    // ==========================================
    resort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resort",
      required: true,
      index: true,
    },

    // ==========================================
    // ROOM CATEGORY
    // Example: Deluxe Room
    // ==========================================
    roomCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResortRoom",
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

    availableRooms: {
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

    // ==========================================
    // INVENTORY STATUS
    // ==========================================
    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "SOLD_OUT",
        "BLOCKED",
        "CLOSED",
      ],
      default: "AVAILABLE",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


// ==========================================
// ONE INVENTORY RECORD
// PER ROOM CATEGORY + DATE
// ==========================================

resortInventorySchema.index(
  {
    resort: 1,
    roomCategory: 1,
    date: 1,
  },
  {
    unique: true,
  }
);


// ==========================================
// FAST DATE-WISE SEARCH
// ==========================================

resortInventorySchema.index({
  resort: 1,
  date: 1,
});


module.exports = mongoose.model(
  "ResortInventory",
  resortInventorySchema
);