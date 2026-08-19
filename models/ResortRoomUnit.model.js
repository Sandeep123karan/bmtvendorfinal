const mongoose = require("mongoose");

const resortRoomUnitSchema = new mongoose.Schema(
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
    // ROOM IDENTIFICATION
    // ==========================================
    roomNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    floor: {
      type: String,
      default: "",
      trim: true,
    },

    building: {
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
        "BLOCKED",
        "MAINTENANCE",
        "CLEANING",
        "INACTIVE",
      ],
      default: "AVAILABLE",
      index: true,
    },

    // ==========================================
    // ROOM ACTIVE
    // ==========================================
    isActive: {
      type: Boolean,
      default: true,
    },

    // ==========================================
    // NOTES
    // ==========================================
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
// Same resort mein same room number unique
// ==========================================

resortRoomUnitSchema.index(
  {
    resort: 1,
    roomNumber: 1,
  },
  {
    unique: true,
  }
);


// ==========================================
// Fast inventory queries
// ==========================================

resortRoomUnitSchema.index({
  resort: 1,
  roomCategory: 1,
  status: 1,
});


module.exports = mongoose.model(
  "ResortRoomUnit",
  resortRoomUnitSchema
);