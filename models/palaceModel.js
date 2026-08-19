const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
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
  { _id: false }
);

const palaceSchema = new mongoose.Schema(
  {
    // ==========================================
    // VENDOR OWNER
    // JWT se automatically aayega
    // ==========================================
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    // ==========================================
    // BASIC PROPERTY INFORMATION
    // ==========================================
    propertyName: {
      type: String,
      required: true,
      trim: true,
    },

    propertyType: {
      type: String,
      enum: [
        "heritage-palace",
        "luxury-palace",
        "royal-palace",
        "heritage-hotel",
        "fort-palace",
        "other",
      ],
      default: "heritage-palace",
    },

    shortDescription: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    starRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },

    // ==========================================
    // CONTACT
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
        lowercase: true,
        trim: true,
      },
    },

    // ==========================================
    // LOCATION
    // ==========================================
    address: {
      addressLine: {
        type: String,
        default: "",
      },

      landmark: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
        index: true,
      },

      state: {
        type: String,
        default: "",
      },

      country: {
        type: String,
        default: "India",
      },

      pincode: {
        type: String,
        default: "",
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
    // PROPERTY DETAILS
    // ==========================================
    totalRooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    heritageCertified: {
      type: Boolean,
      default: false,
    },

    weddingAllowed: {
      type: Boolean,
      default: false,
    },

    eventAllowed: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // CHECK-IN / CHECK-OUT
    // ==========================================
    checkInTime: {
      type: String,
      default: "14:00",
    },

    checkOutTime: {
      type: String,
      default: "11:00",
    },

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
    // IMAGES
    // ==========================================
    images: [imageSchema],

    coverImage: {
      url: {
        type: String,
        default: "",
      },

      publicId: {
        type: String,
        default: "",
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

      unmarriedCouplesAllowed: {
        type: Boolean,
        default: false,
      },

      localIdAllowed: {
        type: Boolean,
        default: false,
      },

      idProofRequired: {
        type: Boolean,
        default: true,
      },
    },

    // ==========================================
    // APPROVAL
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
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


// Vendor-wise property listing
palaceSchema.index({
  vendor: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Palace", palaceSchema);