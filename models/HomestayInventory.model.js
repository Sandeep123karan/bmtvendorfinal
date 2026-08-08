// models/HomestayInventory.model.js

const mongoose = require("mongoose");

/* ============================================================
   HOMESTAY INVENTORY MODEL

   One document = One Unit + One Date

   Example:

   Deluxe Mountain Room
   15 Aug 2026
   totalUnits     = 3
   availableUnits = 2
   bookedUnits    = 1
============================================================ */

const homestayInventorySchema = new mongoose.Schema(
  {
    /* ==========================================================
       RELATIONS
    ========================================================== */

    homestay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homestay",
      required: true,
      index: true,
    },

    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HomestayUnit",
      required: true,
      index: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },


    /* ==========================================================
       DATE
    ========================================================== */

    date: {
      type: Date,
      required: true,
      index: true,
    },


    /* ==========================================================
       INVENTORY
    ========================================================== */

    totalUnits: {
      type: Number,
      required: true,
      min: 0,
    },

    availableUnits: {
      type: Number,
      required: true,
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


    /* ==========================================================
       PRICING
    ========================================================== */

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    weekendPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    holidayPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    specialPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    extraGuestPrice: {
      type: Number,
      default: 0,
      min: 0,
    },


    /* ==========================================================
       DISCOUNT
    ========================================================== */

    discountType: {
      type: String,
      enum: [
        "none",
        "percentage",
        "flat",
      ],
      default: "none",
    },

    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },


    /* ==========================================================
       TAX
    ========================================================== */

    taxPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    serviceChargePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    serviceChargeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },


    /* ==========================================================
       DAY TYPE
    ========================================================== */

    dayType: {
      type: String,
      enum: [
        "weekday",
        "weekend",
        "holiday",
      ],
      default: "weekday",
    },


    /* ==========================================================
       AVAILABILITY
    ========================================================== */

    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    blockReason: {
      type: String,
      default: "",
      trim: true,
    },


    /* ==========================================================
       MINIMUM / MAXIMUM STAY
    ========================================================== */

    minimumStay: {
      type: Number,
      default: 1,
      min: 1,
    },

    maximumStay: {
      type: Number,
      default: 0,
      min: 0,
    },


    /* ==========================================================
       CHECK-IN / CHECK-OUT RESTRICTIONS
    ========================================================== */

    checkInAllowed: {
      type: Boolean,
      default: true,
    },

    checkOutAllowed: {
      type: Boolean,
      default: true,
    },


    /* ==========================================================
       BOOKING RESTRICTIONS
    ========================================================== */

    stopSell: {
      type: Boolean,
      default: false,
    },

    closedForBooking: {
      type: Boolean,
      default: false,
    },


    /* ==========================================================
       BOOKING COUNTER
    ========================================================== */

    totalBookings: {
      type: Number,
      default: 0,
      min: 0,
    },


    /* ==========================================================
       LAST UPDATE
    ========================================================== */

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


/* ============================================================
   IMPORTANT UNIQUE INDEX

   Same unit cannot have duplicate inventory for same date.
============================================================ */

homestayInventorySchema.index(
  {
    unit: 1,
    date: 1,
  },
  {
    unique: true,
  }
);


/* ============================================================
   SEARCH INDEXES
============================================================ */

homestayInventorySchema.index({
  homestay: 1,
  date: 1,
});

homestayInventorySchema.index({
  vendor: 1,
  date: 1,
});

homestayInventorySchema.index({
  unit: 1,
  date: 1,
  isAvailable: 1,
});


/* ============================================================
   PRE-SAVE INVENTORY VALIDATION
============================================================ */

homestayInventorySchema.pre(
  "save",
  function (next) {
    const calculatedAvailable =
      this.totalUnits -
      this.bookedUnits -
      this.blockedUnits;

    this.availableUnits =
      Math.max(
        calculatedAvailable,
        0
      );

    if (
      this.availableUnits <= 0
    ) {
      this.isAvailable = false;
    } else {
      this.isAvailable = true;
    }

    if (
      this.isBlocked ||
      this.stopSell ||
      this.closedForBooking
    ) {
      this.isAvailable = false;
    }

    this.lastUpdatedAt =
      new Date();

    
  }
);


/* ============================================================
   EXPORT
============================================================ */

module.exports =
  mongoose.model(
    "HomestayInventory",
    homestayInventorySchema
  );