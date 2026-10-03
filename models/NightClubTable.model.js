const mongoose = require("mongoose");

const nightClubTableSchema = new mongoose.Schema(
  {
    // ==========================================
    // NIGHT CLUB
    // ==========================================

    nightClubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NightClub",
      required: true,
      index: true,
    },

    // ==========================================
    // TABLE BASIC DETAILS
    // ==========================================

    tableNumber: {
      type: String,
      required: true,
      trim: true,
    },

    tableName: {
      type: String,
      default: "",
      trim: true,
    },

    tableType: {
      type: String,
      enum: [
        "regular",
        "premium",
        "vip",
        "private",
        "booth",
        "sofa",
      ],
      default: "regular",
    },

    // ==========================================
    // CAPACITY
    // ==========================================

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    minimumPersons: {
      type: Number,
      default: 1,
      min: 1,
    },

    maximumPersons: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // TABLE LOCATION
    // ==========================================

    floor: {
      type: String,
      default: "",
    },

    section: {
      type: String,
      default: "",
    },

    position: {
      type: String,
      default: "",
    },

    // ==========================================
    // FACILITIES
    // ==========================================

    nearDanceFloor: {
      type: Boolean,
      default: false,
    },

    nearStage: {
      type: Boolean,
      default: false,
    },

    privateArea: {
      type: Boolean,
      default: false,
    },

    smokingAllowed: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // STATUS
    // ==========================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Vendor can temporarily disable
    // a table from inventory
    isBookable: {
      type: Boolean,
      default: true,
    },

    // ==========================================
    // DESCRIPTION
    // ==========================================

    description: {
      type: String,
      default: "",
    },

    // ==========================================
    // IMAGE
    // ==========================================

    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// UNIQUE TABLE NUMBER PER CLUB
// ==========================================

nightClubTableSchema.index(
  {
    nightClubId: 1,
    tableNumber: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "NightClubTable",
  nightClubTableSchema
);