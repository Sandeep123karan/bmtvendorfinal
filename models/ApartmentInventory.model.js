const mongoose = require("mongoose");

const apartmentInventorySchema = new mongoose.Schema(
  {
    // ==========================================
    // PROPERTY
    // ==========================================

    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorApartment",
      required: true,
      index: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    // ==========================================
    // DATE
    // One inventory record per apartment per date
    // ==========================================

    date: {
      type: Date,
      required: true,
      index: true,
    },

    // ==========================================
    // INVENTORY
    // ==========================================

    totalUnits: {
      type: Number,
      default: 1,
      min: 0,
    },

    bookedUnits: {
      type: Number,
      default: 0,
      min: 0,
    },

    blockedUnits: {
      type: Number,
      default: 0,
      min: 0,
    },

    availableUnits: {
      type: Number,
      default: 1,
      min: 0,
    },

    // ==========================================
    // STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "BOOKED",
        "BLOCKED",
        "SOLD_OUT",
      ],
      default: "AVAILABLE",
    },

    // ==========================================
    // BLOCK DETAILS
    // Vendor can block apartment manually
    // ==========================================

    blockReason: {
      type: String,
      default: "",
    },

    // ==========================================
    // BOOKING REFERENCE
    // Later ApartmentBooking model connect hoga
    // ==========================================

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApartmentBooking",
      default: null,
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


// ==========================================
// IMPORTANT
// Same apartment + same date only once
// ==========================================

apartmentInventorySchema.index(
  {
    apartment: 1,
    date: 1,
  },
  {
    unique: true,
  }
);


// Vendor calendar query fast
apartmentInventorySchema.index({
  vendor: 1,
  date: 1,
});


module.exports = mongoose.model(
  "ApartmentInventory",
  apartmentInventorySchema
);