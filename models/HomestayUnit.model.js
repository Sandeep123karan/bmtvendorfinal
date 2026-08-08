const mongoose = require("mongoose");

/* ============================================================
   HOMESTAY UNIT MODEL
   ------------------------------------------------------------
   One Homestay can have multiple Units.

   Example:

   Mountain View Homestay
        |
        |-- Deluxe Mountain Room
        |-- Family Room
        |-- Premium Room
        |-- Entire Property
============================================================ */

const homestayUnitSchema = new mongoose.Schema(
  {
    /* ==========================================================
       RELATIONSHIPS
    ========================================================== */

    homestay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homestay",
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
       BASIC UNIT INFORMATION
    ========================================================== */

    unitName: {
      type: String,
      required: true,
      trim: true,
    },

    unitType: {
      type: String,
      enum: [
        "private-room",
        "shared-room",
        "entire-property",
        "villa",
        "cottage",
        "apartment",
        "suite",
        "studio",
        "dormitory",
      ],
      required: true,
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
      maxlength: 500,
    },


    /* ==========================================================
       ROOM / UNIT SIZE
    ========================================================== */

    roomSize: {
      type: Number,
      default: 0,
      min: 0,
    },

    roomSizeUnit: {
      type: String,
      enum: [
        "sqft",
        "sqm",
      ],
      default: "sqft",
    },

    floorNumber: {
      type: String,
      default: "",
      trim: true,
    },

    viewType: {
      type: String,
      enum: [
        "mountain-view",
        "garden-view",
        "city-view",
        "pool-view",
        "sea-view",
        "river-view",
        "valley-view",
        "street-view",
        "no-view",
      ],
      default: "no-view",
    },


    /* ==========================================================
       CAPACITY
    ========================================================== */

    maxGuests: {
      type: Number,
      required: true,
      min: 1,
    },

    adults: {
      type: Number,
      default: 1,
      min: 1,
    },

    children: {
      type: Number,
      default: 0,
      min: 0,
    },


    /* ==========================================================
       BEDROOM / BED
    ========================================================== */

    bedrooms: {
      type: Number,
      default: 1,
      min: 0,
    },

    beds: {
      type: Number,
      default: 1,
      min: 1,
    },

    bedType: {
      type: String,
      enum: [
        "single",
        "twin",
        "double",
        "queen",
        "king",
        "super-king",
        "bunk-bed",
        "sofa-bed",
        "floor-mattress",
        "multiple",
      ],
      default: "double",
    },

    extraBedAvailable: {
      type: Boolean,
      default: false,
    },

    extraBedCharge: {
      type: Number,
      default: 0,
      min: 0,
    },


    /* ==========================================================
       BATHROOM
    ========================================================== */

    bathrooms: {
      type: Number,
      default: 1,
      min: 1,
    },

    bathroomType: {
      type: String,
      enum: [
        "private",
        "shared",
        "attached",
        "common",
      ],
      default: "private",
    },

    bathtub: {
      type: Boolean,
      default: false,
    },

    shower: {
      type: Boolean,
      default: true,
    },

    hotWater: {
      type: Boolean,
      default: true,
    },

    toiletries: {
      type: Boolean,
      default: true,
    },

    hairDryer: {
      type: Boolean,
      default: false,
    },


    /* ==========================================================
       UNIT AMENITIES
    ========================================================== */

    amenities: {
      type: [String],
      default: [],
    },

    wifi: {
      type: Boolean,
      default: true,
    },

    airConditioning: {
      type: Boolean,
      default: false,
    },

    heater: {
      type: Boolean,
      default: false,
    },

    tv: {
      type: Boolean,
      default: false,
    },

    smartTv: {
      type: Boolean,
      default: false,
    },

    balcony: {
      type: Boolean,
      default: false,
    },

    terrace: {
      type: Boolean,
      default: false,
    },

    kitchen: {
      type: Boolean,
      default: false,
    },

    kitchenette: {
      type: Boolean,
      default: false,
    },

    refrigerator: {
      type: Boolean,
      default: false,
    },

    minibar: {
      type: Boolean,
      default: false,
    },

    wardrobe: {
      type: Boolean,
      default: true,
    },

    workDesk: {
      type: Boolean,
      default: false,
    },

    washingMachine: {
      type: Boolean,
      default: false,
    },

    iron: {
      type: Boolean,
      default: false,
    },


    /* ==========================================================
       MEALS
    ========================================================== */

    breakfastIncluded: {
      type: Boolean,
      default: false,
    },

    lunchIncluded: {
      type: Boolean,
      default: false,
    },

    dinnerIncluded: {
      type: Boolean,
      default: false,
    },

    mealPlan: {
      type: String,
      enum: [
        "room-only",
        "breakfast",
        "half-board",
        "full-board",
      ],
      default: "room-only",
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

    extraGuestPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    serviceChargePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },


    /* ==========================================================
       DISCOUNT
    ========================================================== */

    discountType: {
      type: String,
      enum: [
        "percentage",
        "flat",
        "none",
      ],
      default: "none",
    },

    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    offerPrice: {
      type: Number,
      default: 0,
      min: 0,
    },


    /* ==========================================================
       INVENTORY CONFIGURATION
       ----------------------------------------------------------
       Actual date-wise availability will be handled by
       HomestayInventory.model.js.
    ========================================================== */

    totalUnits: {
      type: Number,
      required: true,
      min: 1,
    },

    inventoryType: {
      type: String,
      enum: [
        "individual-units",
        "shared-inventory",
      ],
      default: "individual-units",
    },


    /* ==========================================================
       BOOKING CONFIGURATION
    ========================================================== */

    instantBooking: {
      type: Boolean,
      default: true,
    },

    bookingConfirmationRequired: {
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
      default: 0,
      min: 0,
    },


    /* ==========================================================
       CANCELLATION
    ========================================================== */

    refundable: {
      type: Boolean,
      default: true,
    },

    freeCancellation: {
      type: Boolean,
      default: false,
    },

    cancellationDeadlineHours: {
      type: Number,
      default: 24,
      min: 0,
    },

    cancellationPolicy: {
      type: String,
      default: "",
      trim: true,
    },


    /* ==========================================================
       MEDIA
    ========================================================== */

    coverImage: {
      type: String,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    videos: {
      type: [String],
      default: [],
    },


    /* ==========================================================
       HOUSE / UNIT RULES
    ========================================================== */

    smokingAllowed: {
      type: Boolean,
      default: false,
    },

    petsAllowed: {
      type: Boolean,
      default: false,
    },

    childrenAllowed: {
      type: Boolean,
      default: true,
    },

    partiesAllowed: {
      type: Boolean,
      default: false,
    },

    localIdAllowed: {
      type: Boolean,
      default: true,
    },

    coupleFriendly: {
      type: Boolean,
      default: true,
    },

    houseRules: {
      type: [String],
      default: [],
    },


    /* ==========================================================
       STATUS
    ========================================================== */

    status: {
      type: String,
      enum: [
        "DRAFT",
        "ACTIVE",
        "INACTIVE",
        "SOLD_OUT",
        "SUSPENDED",
      ],
      default: "DRAFT",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },


    /* ==========================================================
       SORTING / DISPLAY
    ========================================================== */

    displayOrder: {
      type: Number,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


/* ============================================================
   INDEXES
============================================================ */

homestayUnitSchema.index({
  homestay: 1,
  status: 1,
});

homestayUnitSchema.index({
  vendor: 1,
  status: 1,
});

homestayUnitSchema.index({
  basePrice: 1,
});

homestayUnitSchema.index({
  maxGuests: 1,
});


/* ============================================================
   EXPORT
============================================================ */

module.exports = mongoose.model(
  "HomestayUnit",
  homestayUnitSchema
);