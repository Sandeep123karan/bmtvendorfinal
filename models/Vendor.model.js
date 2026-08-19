const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC ACCOUNT DETAILS
    // ==========================================

    name: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
      sparse: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
      sparse: true,
    },

    password: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    // ==========================================
    // SELECT BUSINESS / SERVICES
    // Ek vendor multiple services select kar sakta hai
    // ==========================================

    services: [
      {
        type: String,
        enum: [
          // STAY
          "hotel",
          "homestay",
          "resort",
          "villa",
          "apartment",
          "guesthouse",
          "hostel",
          "camp",
          "farmhouse",
          "vacation-home",
          "palace",
          "motel",

          // TRANSPORT
          "cab",
          "car-rental",
          "bike-rental",
          "bus",

          // HOLIDAY
          "holiday-package",

          // RELIGIOUS
          "BMT Darshan",

          // OTHER TRAVEL SERVICES
          "visa",
          "travel-insurance",
          "cruise",

          "other",
        ],
      },
    ],

    // Old code compatibility
    // Agar existing controller `service` use kar raha hai
    service: {
      type: String,
      default: "",
    },

    // ==========================================
    // COMPANY / BUSINESS DETAILS
    // ==========================================

    companyName: {
      type: String,
      default: "",
      trim: true,
    },

    businessName: {
      type: String,
      default: "",
      trim: true,
    },

    legalBusinessName: {
      type: String,
      default: "",
      trim: true,
    },

    businessType: {
      type: String,
      enum: [
        "",
        "individual",
        "proprietorship",
        "partnership",
        "private-limited",
        "public-limited",
        "llp",
        "other",
      ],
      default: "",
    },

    // ==========================================
    // BUSINESS CONTACT
    // ==========================================

    businessEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    businessPhone: {
      type: String,
      default: "",
      trim: true,
    },

    alternatePhone: {
      type: String,
      default: "",
      trim: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // ADDRESS
    // ==========================================

    address: {
      type: String,
      default: "",
    },

    addressLine1: {
      type: String,
      default: "",
    },

    addressLine2: {
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

    // ==========================================
    // TAX DETAILS
    // ==========================================

    gstNumber: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    gstRegistrationNumber: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    gstCertificate: {
      type: String,
      default: "",
    },

    panNumber: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    panCardNumber: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    panCard: {
      type: String,
      default: "",
    },

    // ==========================================
    // AADHAAR
    // ==========================================

    aadharNumber: {
      type: String,
      default: "",
      trim: true,
    },

    aadharFront: {
      type: String,
      default: "",
    },

    aadharBack: {
      type: String,
      default: "",
    },

    // ==========================================
    // BANK DETAILS
    // ==========================================

    accountHolderName: {
      type: String,
      default: "",
    },

    bankName: {
      type: String,
      default: "",
    },

    branchName: {
      type: String,
      default: "",
    },

    accountNumber: {
      type: String,
      default: "",
    },

    confirmAccountNumber: {
      type: String,
      default: "",
    },

    ifscCode: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    cancelledCheque: {
      type: String,
      default: "",
    },

    passbookImage: {
      type: String,
      default: "",
    },

    // ==========================================
    // CAR RENTAL / CAB DETAILS
    // ==========================================

    carRentalDetails: {
      businessModel: {
        type: String,
        default: "",
      },

      totalVehicles: {
        type: Number,
        default: 0,
      },

      vehicleTypes: [
        {
          type: String,
        },
      ],

      serviceCities: [
        {
          type: String,
        },
      ],

      airportPickupAvailable: {
        type: Boolean,
        default: false,
      },

      outstationAvailable: {
        type: Boolean,
        default: false,
      },

      localRentalAvailable: {
        type: Boolean,
        default: false,
      },

      driverProvided: {
        type: Boolean,
        default: false,
      },

      selfDriveAvailable: {
        type: Boolean,
        default: false,
      },

      transportLicenseNumber: {
        type: String,
        default: "",
      },

      licenseDocument: {
        type: String,
        default: "",
      },
    },

    // ==========================================
    // BUS OPERATOR DETAILS
    // ==========================================

    busDetails: {
      operatorName: {
        type: String,
        default: "",
      },

      totalBuses: {
        type: Number,
        default: 0,
      },

      busTypes: [
        {
          type: String,
        },
      ],

      operatingCities: [
        {
          type: String,
        },
      ],

      routes: [
        {
          type: String,
        },
      ],

      transportPermitNumber: {
        type: String,
        default: "",
      },

      transportPermitDocument: {
        type: String,
        default: "",
      },

      operatorLicenseNumber: {
        type: String,
        default: "",
      },

      operatorLicenseDocument: {
        type: String,
        default: "",
      },
    },

    // ==========================================
    // HOTEL / STAY BUSINESS DETAILS
    // ==========================================

    stayDetails: {
      totalProperties: {
        type: Number,
        default: 0,
      },

      propertyTypes: [
        {
          type: String,
        },
      ],

      operatingCities: [
        {
          type: String,
        },
      ],
    },

    // ==========================================
    // VERIFICATION
    // ==========================================

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // ADMIN APPROVAL
    // ==========================================

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    // ==========================================
    // ACCOUNT STATUS
    // ==========================================

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    refreshToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);


// ==========================================
// INDEXES
// sparse = empty email/phone par duplicate issue nahi
// ==========================================

vendorSchema.index(
  { email: 1 },
  {
    unique: true,
    sparse: true,
  }
);

vendorSchema.index(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
  }
);

vendorSchema.index({
  services: 1,
});


module.exports = mongoose.model("Vendor", vendorSchema);