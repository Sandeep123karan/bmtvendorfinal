const mongoose = require("mongoose");

const palaceRoomUnitSchema = new mongoose.Schema(
  {
    // ==========================================
    // VENDOR
    // ==========================================
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

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
    // ==========================================
    roomCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PalaceRoomCategory",
      required: true,
      index: true,
    },

    // ==========================================
    // ROOM DETAILS
    // ==========================================
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },

    floor: {
      type: String,
      default: "",
      trim: true,
    },

    wing: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // ROOM STATUS
    // ==========================================
    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "OCCUPIED",
        "RESERVED",
        "MAINTENANCE",
        "OUT_OF_SERVICE",
        "BLOCKED",
      ],
      default: "AVAILABLE",
      index: true,
    },

    // ==========================================
    // HOUSEKEEPING
    // ==========================================
    housekeepingStatus: {
      type: String,
      enum: [
        "CLEAN",
        "DIRTY",
        "INSPECTED",
        "CLEANING_IN_PROGRESS",
      ],
      default: "CLEAN",
    },

    // ==========================================
    // ACTIVE STATUS
    // ==========================================
    isActive: {
      type: Boolean,
      default: true,
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


// Same room number duplicate nahi hoga same palace mein
palaceRoomUnitSchema.index(
  {
    palace: 1,
    roomNumber: 1,
  },
  {
    unique: true,
  }
);


// Vendor wise query
palaceRoomUnitSchema.index({
  vendor: 1,
  palace: 1,
  roomCategory: 1,
});


module.exports = mongoose.model(
  "PalaceRoomUnit",
  palaceRoomUnitSchema
);