const mongoose = require("mongoose");


/* ==========================================================
                    RESORT IMAGE SCHEMA
========================================================== */

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);


/* ==========================================================
                    RESORT SCHEMA
========================================================== */

const resortSchema = new mongoose.Schema(
  {
    // ==========================================
    // RESORT OWNER
    // Automatically comes from JWT
    // req.vendor._id
    // ==========================================

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },


    // ==========================================
    // BASIC INFORMATION
    // ==========================================

    name: {
      type: String,
      required: [true, "Resort name is required"],
      trim: true,
    },

    propertyType: {
      type: String,
      enum: [
        "resort",
        "luxury-resort",
        "beach-resort",
        "hill-resort",
        "eco-resort",
        "farm-resort",
        "spa-resort",
        "other",
      ],
      default: "resort",
      lowercase: true,
      trim: true,
    },

    starRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },

    shortDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },


    // ==========================================
    // CONTACT DETAILS
    // ==========================================

    contact: {
      phone: {
        type: String,
        default: "",
        trim: true,
      },

      alternatePhone: {
        type: String,
        default: "",
        trim: true,
      },

      email: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
      },
    },


    // ==========================================
    // LOCATION
    // ==========================================

    address: {
      addressLine: {
        type: String,
        default: "",
        trim: true,
      },

      landmark: {
        type: String,
        default: "",
        trim: true,
      },

      city: {
        type: String,
        default: "",
        trim: true,
      },

      state: {
        type: String,
        default: "",
        trim: true,
      },

      country: {
        type: String,
        default: "India",
        trim: true,
      },

      pincode: {
        type: String,
        default: "",
        trim: true,
      },

      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },
    },


    // ==========================================
    // CHECK-IN / CHECK-OUT
    // ==========================================

    checkInTime: {
      type: String,
      default: "14:00",
      trim: true,
    },

    checkOutTime: {
      type: String,
      default: "11:00",
      trim: true,
    },


    // ==========================================
    // AMENITIES
    // ==========================================

    amenities: {
      type: [String],
      default: [],
    },


    // ==========================================
    // RESORT IMAGES
    // ==========================================

    images: {
      type: [imageSchema],
      default: [],
    },

    coverImage: {
      url: {
        type: String,
        default: "",
        trim: true,
      },

      publicId: {
        type: String,
        default: "",
        trim: true,
      },
    },


    // ==========================================
    // POLICIES
    // ==========================================

    policies: {
      cancellationPolicy: {
        type: String,
        default: "",
      },

      childPolicy: {
        type: String,
        default: "",
      },

      petPolicy: {
        type: String,
        default: "",
      },

      smokingPolicy: {
        type: String,
        default: "",
      },

      idProofRequired: {
        type: Boolean,
        default: true,
      },
    },


    // ==========================================
    // ADMIN / RESORT APPROVAL STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING",
        "APPROVED",
        "REJECTED",
        "INACTIVE",
      ],
      default: "DRAFT",
      index: true,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },


    // ==========================================
    // ACTIVE STATUS
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


/* ==========================================================
                    INDEXES
========================================================== */

// Vendor ke resorts fast fetch karne ke liye
resortSchema.index({
  vendor: 1,
  createdAt: -1,
});

// Resort status wise filtering ke liye
resortSchema.index({
  vendor: 1,
  status: 1,
});


/* ==========================================================
                    MODEL
========================================================== */

module.exports = mongoose.model("Resort", resortSchema);