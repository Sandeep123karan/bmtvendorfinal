const mongoose = require("mongoose");

const { Schema } = mongoose;

/* =========================================================
   CONSTANTS
========================================================= */

const MAIN_VERTICALS = [
  "",
  "stay",
  "bus",
  "cab",
  "packages",
  "activities",
  "events",
  "darshan",
  "cruise",
];

const STAY_SUBTYPES = [
  "",
  "hotel",
  "resort",
  "homestay",
  "villa",
  "apartment",
  "guesthouse",
  "hostel",
  "motel",
  "vacation-home",
  "palace",
  "campsite",
  "farmhouse",
  "bnb",
  "lodge",
  "inn",
  "serviced-apartment",
  "holiday-park",
  "unique-stay",
  "other",
];

const VENDOR_ROLES = [
  "owner",
  "general_manager",
  "operations_manager",
  "booking_manager",
  "reservation_executive",
  "front_desk",
  "property_manager",
  "housekeeping",
  "finance_manager",
  "accountant",
  "sales_manager",
  "marketing_manager",
  "bus_operations_manager",
  "fleet_manager",
  "transport_coordinator",
  "tour_manager",
  "activity_manager",
  "event_manager",
  "cruise_operations_manager",
  "darshan_operations_manager",
  "customer_support",
  "read_only",
  "custom",
];

/* =========================================================
   PERMISSION SCOPE
========================================================= */

const permissionScopeSchema = new Schema(
  {
    scopeType: {
      type: String,
      enum: [
        "all",
        "vertical",
        "property",
        "branch",
        "assigned",
      ],
      default: "all",
    },

    verticals: [
      {
        type: String,
        enum: MAIN_VERTICALS,
      },
    ],

    properties: [
      {
        type: Schema.Types.ObjectId,
      },
    ],

    branches: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
  },
  {
    _id: false,
  }
);

/* =========================================================
   LOGIN SESSION HISTORY
========================================================= */

const loginHistorySchema = new Schema(
  {
    loginAt: {
      type: Date,
      default: Date.now,
    },

    ip: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },

    deviceId: {
      type: String,
      default: "",
    },

    successful: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  }
);

/* =========================================================
   STAY CONTACT
========================================================= */

const stayContactSchema = new Schema(
  {
    contactType: {
      type: String,
      enum: [
        "primary",
        "reservation",
        "operations",
        "finance",
        "owner",
        "manager",
        "emergency",
        "other",
      ],
      default: "primary",
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    designation: {
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

    countryCode: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    whatsapp: {
      type: String,
      default: "",
      trim: true,
    },

    preferredLanguage: {
      type: String,
      default: "en",
    },
  },
  {
    _id: true,
  }
);

/* =========================================================
   NEARBY LANDMARK
========================================================= */

const landmarkSchema = new Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    distance: {
      type: Number,
      default: null,
    },

    distanceUnit: {
      type: String,
      enum: ["m", "km", "mile"],
      default: "km",
    },
  },
  {
    _id: true,
  }
);

/* =========================================================
   EXTERNAL PROPERTY ID
========================================================= */

const externalPropertySchema = new Schema(
  {
    provider: {
      type: String,
      default: "",
      trim: true,
    },

    propertyId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
);

/* =========================================================
   MAIN VENDOR SCHEMA
========================================================= */

const vendorSchema = new Schema(
  {
    /* =====================================================
       ACCOUNT
    ===================================================== */

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
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    password: {
      type: String,
      default: "",
      select: false,
    },

    profileImage: {
      type: String,
      default: "",
    },

    /* =====================================================
       ROLE / STAFF / RBAC
    ===================================================== */

    role: {
      type: String,
      enum: VENDOR_ROLES,
      default: "owner",
      index: true,
    },

    isOwnerAccount: {
      type: Boolean,
      default: true,
    },

    ownerVendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
      index: true,
    },

    permissions: [
      {
        type: String,
        trim: true,
      },
    ],

    permissionScope: {
      type: permissionScopeSchema,
      default: () => ({
        scopeType: "all",
        verticals: [],
        properties: [],
        branches: [],
      }),
    },

    canViewFinancialData: {
      type: Boolean,
      default: false,
    },

    canManageStaff: {
      type: Boolean,
      default: false,
    },

    approvalLimits: {
      refundAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      discountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      payoutAmount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    /* =====================================================
       BMT CONNECT MAIN VERTICAL
    ===================================================== */

    vertical: {
      type: String,
      enum: MAIN_VERTICALS,
      default: "",
      index: true,
    },

    selectedVertical: {
      type: String,
      enum: MAIN_VERTICALS,
      default: "",
      index: true,
    },

    /*
      Stay parent vertical ke andar selected subtype.

      Example:
      vertical: "stay"
      staySubtype: "hotel"

      OR

      vertical: "stay"
      staySubtype: "resort"
    */

    staySubtype: {
      type: String,
      enum: STAY_SUBTYPES,
      default: "",
      index: true,
    },

    /* =====================================================
       LEGACY / MULTIPLE SERVICES

       Existing routes break na hon isliye preserve.
    ===================================================== */

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
          "campsite",
          "farmhouse",
          "vacation-home",
          "palace",
          "motel",
          "bnb",
          "lodge",
          "inn",
          "serviced-apartment",

          // TRANSPORT
          "cab",
          "car-rental",
          "bike-rental",
          "bus",

          // TOURS
          "holiday-package",
          "packages",

          // ACTIVITIES
          "activities",

          // EVENTS
          "events",
          "night-club",

          // RELIGIOUS
          "BMT Darshan",
          "darshan",

          // CRUISE
          "cruise",

          // OLD / LEGACY
          "visa",
          "travel-insurance",

          "other",
        ],
      },
    ],

    service: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       COMPANY / BUSINESS
    ===================================================== */

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
        "individual-owner",
        "sole-proprietorship",
        "proprietorship",
        "partnership",
        "company",
        "corporation",
        "private-limited",
        "public-limited",
        "llp",
        "agency",
        "tour-operator",
        "dmc",
        "hotel-property-group",
        "transport-operator",
        "bus-operator",
        "fleet-owner",
        "activity-operator",
        "event-organizer",
        "cruise-operator",
        "religious-darshan-operator",
        "non-profit",
        "government",
        "other",
      ],

      default: "",
    },

    businessRegistrationNumber: {
      type: String,
      default: "",
      trim: true,
    },

    businessLicenseNumber: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       BUSINESS CONTACT
    ===================================================== */

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

    whatsappNumber: {
      type: String,
      default: "",
      trim: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    preferredLanguage: {
      type: String,
      default: "en",
    },

    preferredCurrency: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    timezone: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       ADDRESS
    ===================================================== */

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

    locality: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    district: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    province: {
      type: String,
      default: "",
    },

    region: {
      type: String,
      default: "",
    },

    country: {
      type: String,
      default: "",
    },

    countryCode: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    pincode: {
      type: String,
      default: "",
    },

    /* =====================================================
       TAX - GLOBAL READY
    ===================================================== */

    taxType: {
      type: String,

      enum: [
        "",
        "gst",
        "vat",
        "sales-tax",
        "service-tax",
        "other",
        "not-registered",
      ],

      default: "",
    },

    taxRegistrationNumber: {
      type: String,
      default: "",
      trim: true,
    },

    taxCertificate: {
      type: String,
      default: "",
    },

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

    /* =====================================================
       GOVERNMENT ID / AADHAAR LEGACY
    ===================================================== */

    governmentIdType: {
      type: String,
      default: "",
    },

    governmentIdNumber: {
      type: String,
      default: "",
    },

    governmentIdFront: {
      type: String,
      default: "",
    },

    governmentIdBack: {
      type: String,
      default: "",
    },

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

    /* =====================================================
       BANK / PAYOUT
    ===================================================== */

    bankCountry: {
      type: String,
      default: "",
    },

    bankCurrency: {
      type: String,
      default: "",
      uppercase: true,
    },

    settlementCurrency: {
      type: String,
      default: "",
      uppercase: true,
    },

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

    iban: {
      type: String,
      default: "",
    },

    swiftCode: {
      type: String,
      default: "",
      uppercase: true,
    },

    routingNumber: {
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

    /* =====================================================
       CAB / CAR RENTAL
    ===================================================== */

    carRentalDetails: {
      businessModel: {
        type: String,
        default: "",
      },

      totalVehicles: {
        type: Number,
        default: 0,
        min: 0,
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

    /* =====================================================
       BUS
    ===================================================== */

    busDetails: {
      operatorName: {
        type: String,
        default: "",
      },

      totalBuses: {
        type: Number,
        default: 0,
        min: 0,
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

    /* =====================================================
       COMPLETE STAY / PROPERTY REGISTRATION

       NOTE:
       Rooms, rate plans, date inventory & bookings
       separate collections/models me hi rahenge.
    ===================================================== */

    stayDetails: {
      /* -------------------------
         PROPERTY IDENTITY
      ------------------------- */

      propertyName: {
        type: String,
        default: "",
        trim: true,
      },

      legalPropertyName: {
        type: String,
        default: "",
        trim: true,
      },

      displayName: {
        type: String,
        default: "",
        trim: true,
      },

      propertyType: {
        type: String,
        enum: STAY_SUBTYPES,
        default: "",
      },

      propertySubType: {
        type: String,
        default: "",
      },

      totalProperties: {
        type: Number,
        default: 1,
        min: 0,
      },

      propertyTypes: [
        {
          type: String,
        },
      ],

      chainType: {
        type: String,
        enum: [
          "",
          "independent",
          "chain",
          "group",
        ],
        default: "independent",
      },

      chainName: {
        type: String,
        default: "",
      },

      brandName: {
        type: String,
        default: "",
      },

      shortDescription: {
        type: String,
        default: "",
      },

      description: {
        type: String,
        default: "",
      },

      website: {
        type: String,
        default: "",
      },

      /* -------------------------
         CONTACTS
      ------------------------- */

      contacts: [
        stayContactSchema,
      ],

      /* -------------------------
         LOCATION
      ------------------------- */

      addressLine1: {
        type: String,
        default: "",
      },

      addressLine2: {
        type: String,
        default: "",
      },

      locality: {
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

      district: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      province: {
        type: String,
        default: "",
      },

      region: {
        type: String,
        default: "",
      },

      postalCode: {
        type: String,
        default: "",
      },

      country: {
        type: String,
        default: "",
      },

      countryCode: {
        type: String,
        default: "",
        uppercase: true,
      },

      timezone: {
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

      mapPlaceId: {
        type: String,
        default: "",
      },

      operatingCities: [
        {
          type: String,
        },
      ],

      /* -------------------------
         CLASSIFICATION
      ------------------------- */

      classification: {
        type: String,

        enum: [
          "",
          "unrated",
          "budget",
          "1-star",
          "2-star",
          "3-star",
          "4-star",
          "5-star",
          "luxury",
          "premium",
          "boutique",
        ],

        default: "",
      },

      starRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },

      officialStarRating: {
        type: Number,
        min: 0,
        max: 5,
        default: null,
      },

      ratingAuthority: {
        type: String,
        default: "",
      },

      classificationCertificate: {
        type: String,
        default: "",
      },

      classificationCertificateNumber: {
        type: String,
        default: "",
      },

      classificationCertificateExpiry: {
        type: Date,
        default: null,
      },

      /* -------------------------
         PROPERTY SIZE
      ------------------------- */

      totalRooms: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalUnits: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalBeds: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalFloors: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalBuildings: {
        type: Number,
        default: 1,
        min: 0,
      },

      maximumGuests: {
        type: Number,
        default: 0,
        min: 0,
      },

      yearBuilt: {
        type: Number,
        default: null,
      },

      lastRenovatedYear: {
        type: Number,
        default: null,
      },

      propertyArea: {
        type: Number,
        default: null,
      },

      propertyAreaUnit: {
        type: String,

        enum: [
          "",
          "sq-ft",
          "sq-m",
          "acre",
          "hectare",
        ],

        default: "",
      },

      /* -------------------------
         CHECK-IN / CHECK-OUT
      ------------------------- */

      checkInFrom: {
        type: String,
        default: "14:00",
      },

      checkInUntil: {
        type: String,
        default: "",
      },

      checkOutFrom: {
        type: String,
        default: "",
      },

      checkOutUntil: {
        type: String,
        default: "11:00",
      },

      frontDesk24Hours: {
        type: Boolean,
        default: false,
      },

      selfCheckIn: {
        type: Boolean,
        default: false,
      },

      earlyCheckInAvailable: {
        type: Boolean,
        default: false,
      },

      lateCheckOutAvailable: {
        type: Boolean,
        default: false,
      },

      earlyCheckInFee: {
        type: Number,
        default: 0,
        min: 0,
      },

      lateCheckOutFee: {
        type: Number,
        default: 0,
        min: 0,
      },

      checkInInstructions: {
        type: String,
        default: "",
      },

      arrivalInstructions: {
        type: String,
        default: "",
      },

      /* -------------------------
         AMENITIES
      ------------------------- */

      amenities: [
        {
          type: String,
        },
      ],

      customAmenities: [
        {
          type: String,
        },
      ],

      wifiAvailable: {
        type: Boolean,
        default: false,
      },

      freeWifi: {
        type: Boolean,
        default: false,
      },

      wifiAreas: [
        {
          type: String,
        },
      ],

      parkingAvailable: {
        type: Boolean,
        default: false,
      },

      parkingType: {
        type: String,

        enum: [
          "",
          "private",
          "public",
          "street",
          "valet",
        ],

        default: "",
      },

      parkingFree: {
        type: Boolean,
        default: false,
      },

      parkingReservationRequired: {
        type: Boolean,
        default: false,
      },

      parkingPrice: {
        type: Number,
        default: 0,
      },

      restaurantAvailable: {
        type: Boolean,
        default: false,
      },

      roomServiceAvailable: {
        type: Boolean,
        default: false,
      },

      swimmingPoolAvailable: {
        type: Boolean,
        default: false,
      },

      gymAvailable: {
        type: Boolean,
        default: false,
      },

      spaAvailable: {
        type: Boolean,
        default: false,
      },

      airportTransferAvailable: {
        type: Boolean,
        default: false,
      },

      shuttleAvailable: {
        type: Boolean,
        default: false,
      },

      elevatorAvailable: {
        type: Boolean,
        default: false,
      },

      wheelchairAccessible: {
        type: Boolean,
        default: false,
      },

      accessibleParking: {
        type: Boolean,
        default: false,
      },

      accessibleRooms: {
        type: Boolean,
        default: false,
      },

      /* -------------------------
         MEALS
      ------------------------- */

      breakfastAvailable: {
        type: Boolean,
        default: false,
      },

      breakfastIncluded: {
        type: Boolean,
        default: false,
      },

      breakfastTypes: [
        {
          type: String,
        },
      ],

      breakfastPriceAdult: {
        type: Number,
        default: 0,
      },

      breakfastPriceChild: {
        type: Number,
        default: 0,
      },

      lunchAvailable: {
        type: Boolean,
        default: false,
      },

      dinnerAvailable: {
        type: Boolean,
        default: false,
      },

      mealPlans: [
        {
          type: String,

          enum: [
            "room-only",
            "breakfast",
            "half-board",
            "full-board",
            "all-inclusive",
          ],
        },
      ],

      /* -------------------------
         CHILDREN / BEDS
      ------------------------- */

      childrenAllowed: {
        type: Boolean,
        default: true,
      },

      childrenStayFree: {
        type: Boolean,
        default: false,
      },

      freeChildStayMaxAge: {
        type: Number,
        default: null,
      },

      childMaxAge: {
        type: Number,
        default: 17,
      },

      cribAvailable: {
        type: Boolean,
        default: false,
      },

      cribPrice: {
        type: Number,
        default: 0,
      },

      extraBedAvailable: {
        type: Boolean,
        default: false,
      },

      extraBedAdultPrice: {
        type: Number,
        default: 0,
      },

      extraBedChildPrice: {
        type: Number,
        default: 0,
      },

      /* -------------------------
         PET
      ------------------------- */

      petsAllowed: {
        type: Boolean,
        default: false,
      },

      petsOnRequest: {
        type: Boolean,
        default: false,
      },

      petFeeType: {
        type: String,

        enum: [
          "",
          "free",
          "per-pet",
          "per-night",
          "per-stay",
        ],

        default: "",
      },

      petFee: {
        type: Number,
        default: 0,
      },

      petPolicy: {
        type: String,
        default: "",
      },

      /* -------------------------
         HOUSE RULES
      ------------------------- */

      smokingAllowed: {
        type: Boolean,
        default: false,
      },

      partiesAllowed: {
        type: Boolean,
        default: false,
      },

      quietHoursEnabled: {
        type: Boolean,
        default: false,
      },

      quietHoursFrom: {
        type: String,
        default: "",
      },

      quietHoursUntil: {
        type: String,
        default: "",
      },

      minimumCheckInAge: {
        type: Number,
        default: null,
      },

      /* -------------------------
         BOOKING POLICIES
      ------------------------- */

      cancellationPolicy: {
        type: String,
        default: "",
      },

      noShowPolicy: {
        type: String,
        default: "",
      },

      modificationPolicy: {
        type: String,
        default: "",
      },

      paymentPolicy: {
        type: String,
        default: "",
      },

      damageDepositRequired: {
        type: Boolean,
        default: false,
      },

      damageDepositAmount: {
        type: Number,
        default: 0,
      },

      damageDepositCurrency: {
        type: String,
        default: "",
        uppercase: true,
      },

      /* -------------------------
         SAFETY
      ------------------------- */

      cctvAvailable: {
        type: Boolean,
        default: false,
      },

      security24Hours: {
        type: Boolean,
        default: false,
      },

      smokeDetector: {
        type: Boolean,
        default: false,
      },

      fireExtinguisher: {
        type: Boolean,
        default: false,
      },

      firstAidKit: {
        type: Boolean,
        default: false,
      },

      emergencyExit: {
        type: Boolean,
        default: false,
      },

      carbonMonoxideDetector: {
        type: Boolean,
        default: false,
      },

      roomSafeAvailable: {
        type: Boolean,
        default: false,
      },

      /* -------------------------
         LANGUAGES
      ------------------------- */

      staffLanguages: [
        {
          type: String,
        },
      ],

      /* -------------------------
         LICENSING
      ------------------------- */

      legallyRegistered: {
        type: Boolean,
        default: false,
      },

      propertyRegistrationNumber: {
        type: String,
        default: "",
      },

      businessLicenseNumber: {
        type: String,
        default: "",
      },

      tourismLicenseNumber: {
        type: String,
        default: "",
      },

      fireSafetyCertificateNumber: {
        type: String,
        default: "",
      },

      foodLicenseNumber: {
        type: String,
        default: "",
      },

      propertyRegistrationDocument: {
        type: String,
        default: "",
      },

      businessLicenseDocument: {
        type: String,
        default: "",
      },

      tourismLicenseDocument: {
        type: String,
        default: "",
      },

      fireSafetyDocument: {
        type: String,
        default: "",
      },

      foodLicenseDocument: {
        type: String,
        default: "",
      },

      otherLicenseDetails: {
        type: String,
        default: "",
      },

      /* -------------------------
         MEDIA
      ------------------------- */

      logo: {
        type: String,
        default: "",
      },

      coverImage: {
        type: String,
        default: "",
      },

      propertyImages: [
        {
          type: String,
        },
      ],

      exteriorImages: [
        {
          type: String,
        },
      ],

      lobbyImages: [
        {
          type: String,
        },
      ],

      facilityImages: [
        {
          type: String,
        },
      ],

      restaurantImages: [
        {
          type: String,
        },
      ],

      poolImages: [
        {
          type: String,
        },
      ],

      videos: [
        {
          type: String,
        },
      ],

      /* -------------------------
         LANDMARKS
      ------------------------- */

      nearbyLandmarks: [
        landmarkSchema,
      ],

      nearestAirportName: {
        type: String,
        default: "",
      },

      nearestAirportDistance: {
        type: Number,
        default: null,
      },

      nearestRailwayStationName: {
        type: String,
        default: "",
      },

      nearestRailwayStationDistance: {
        type: Number,
        default: null,
      },

      /* -------------------------
         CURRENCY
      ------------------------- */

      propertyCurrency: {
        type: String,
        default: "",
        uppercase: true,
      },

      settlementCurrency: {
        type: String,
        default: "",
        uppercase: true,
      },

      /* -------------------------
         BOOKING METHOD
      ------------------------- */

      instantBook: {
        type: Boolean,
        default: true,
      },

      requestToBook: {
        type: Boolean,
        default: false,
      },

      /* -------------------------
         COMMERCIAL
      ------------------------- */

      commissionModel: {
        type: String,

        enum: [
          "",
          "percentage",
          "fixed",
          "hybrid",
        ],

        default: "",
      },

      commissionRate: {
        type: Number,
        default: 0,
        min: 0,
      },

      /* -------------------------
         SUSTAINABILITY
      ------------------------- */

      recyclingProgram: {
        type: Boolean,
        default: false,
      },

      reducedSingleUsePlastic: {
        type: Boolean,
        default: false,
      },

      renewableEnergy: {
        type: Boolean,
        default: false,
      },

      waterSavingProgram: {
        type: Boolean,
        default: false,
      },

      localSourcing: {
        type: Boolean,
        default: false,
      },

      sustainabilityCertification: {
        type: String,
        default: "",
      },

      /* -------------------------
         MARKETPLACE STATUS
      ------------------------- */

      isPublished: {
        type: Boolean,
        default: false,
      },

      isTemporarilyClosed: {
        type: Boolean,
        default: false,
      },

      temporarilyClosedUntil: {
        type: Date,
        default: null,
      },

      /* -------------------------
         EXTERNAL CHANNEL IDS
      ------------------------- */

      externalPropertyIds: [
        externalPropertySchema,
      ],
    },

    /* =====================================================
       NIGHTCLUB LEGACY
    ===================================================== */

    nightClubDetails: {
      venueName: {
        type: String,
        default: "",
        trim: true,
      },

      venueType: {
        type: String,

        enum: [
          "",
          "indoor",
          "outdoor",
          "rooftop",
          "beach",
          "banquet",
          "other",
        ],

        default: "",
      },

      totalCapacity: {
        type: Number,
        default: 0,
      },

      operatingCities: [
        {
          type: String,
        },
      ],

      musicGenres: [
        {
          type: String,
        },
      ],

      ageLimit: {
        type: Number,
        default: 18,
      },

      entryFeeType: {
        type: String,

        enum: [
          "",
          "free",
          "cover-charge",
          "ticketed",
          "couple-entry",
        ],

        default: "",
      },

      averageEntryFee: {
        type: Number,
        default: 0,
      },

      dressCodeRequired: {
        type: Boolean,
        default: false,
      },

      dressCodeDetails: {
        type: String,
        default: "",
      },

      operatingDays: [
        {
          type: String,
        },
      ],

      openingTime: {
        type: String,
        default: "",
      },

      closingTime: {
        type: String,
        default: "",
      },

      alcoholServed: {
        type: Boolean,
        default: false,
      },

      alcoholLicenseNumber: {
        type: String,
        default: "",
      },

      alcoholLicenseDocument: {
        type: String,
        default: "",
      },

      excisePermitNumber: {
        type: String,
        default: "",
      },

      excisePermitDocument: {
        type: String,
        default: "",
      },

      fireSafetyCertificate: {
        type: String,
        default: "",
      },

      parkingAvailable: {
        type: Boolean,
        default: false,
      },

      valetAvailable: {
        type: Boolean,
        default: false,
      },

      vipSectionAvailable: {
        type: Boolean,
        default: false,
      },

      privateBoothsAvailable: {
        type: Boolean,
        default: false,
      },

      danceFloorAvailable: {
        type: Boolean,
        default: true,
      },

      liveDjAvailable: {
        type: Boolean,
        default: false,
      },

      liveBandAvailable: {
        type: Boolean,
        default: false,
      },

      smokingAreaAvailable: {
        type: Boolean,
        default: false,
      },

      stagPolicy: {
        type: String,

        enum: [
          "",
          "allowed",
          "not-allowed",
          "with-conditions",
        ],

        default: "",
      },

      venueImages: [
        {
          type: String,
        },
      ],
    },

    /* =====================================================
       ONBOARDING
    ===================================================== */

    onboardingStatus: {
      type: String,

      enum: [
        "not_started",
        "in_progress",
        "submitted",
        "under_review",
        "verification_required",
        "approved",
        "rejected",
        "active",
      ],

      default: "not_started",
      index: true,
    },

    onboardingComplete: {
      type: Boolean,
      default: false,
      index: true,
    },

    onboardingStep: {
      type: Number,
      default: 1,
      min: 1,
    },

    onboardingProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    onboardingSubmittedAt: {
      type: Date,
      default: null,
    },

    onboardingApprovedAt: {
      type: Date,
      default: null,
    },

    onboardingRejectedAt: {
      type: Date,
      default: null,
    },

    onboardingRejectionReason: {
      type: String,
      default: "",
    },

    missingOnboardingFields: [
      {
        type: String,
      },
    ],

    /* =====================================================
       VERIFICATION
    ===================================================== */

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    kycStatus: {
      type: String,

      enum: [
        "not_started",
        "pending",
        "under_review",
        "verified",
        "rejected",
        "additional_information_required",
      ],

      default: "not_started",
    },

    /* =====================================================
       ADMIN APPROVAL

       Account login approval aur property approval
       eventually separate flows rehne chahiye.
       Legacy compatibility ke liye ye fields preserve.
    ===================================================== */

    status: {
      type: String,

      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "SUSPENDED",
      ],

      default: "PENDING",
      index: true,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
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

    /* =====================================================
       ACCOUNT STATUS
    ===================================================== */

    accountStatus: {
      type: String,

      enum: [
        "active",
        "suspended",
        "blocked",
        "locked",
      ],

      default: "active",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /* =====================================================
       SECURITY
    ===================================================== */

    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    loginAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    lockedUntil: {
      type: Date,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    lastLoginIp: {
      type: String,
      default: "",
    },

    lastLoginUserAgent: {
      type: String,
      default: "",
    },

    loginHistory: [
      loginHistorySchema,
    ],

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    refreshToken: {
      type: String,
      default: "",
      select: false,
    },

    /* =====================================================
       AUDIT
    ===================================================== */

    createdBy: {
      type: Schema.Types.ObjectId,
      default: null,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

/* =========================================================
   INDEXES
========================================================= */

/*
  email/phone field par unique:true nahi diya hai.
  Index ek hi jagah define kar rahe hain,
  duplicate index warning avoid karne ke liye.
*/

vendorSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

vendorSchema.index(
  {
    phone: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

vendorSchema.index({
  services: 1,
});

vendorSchema.index({
  vertical: 1,
  staySubtype: 1,
});

vendorSchema.index({
  ownerVendor: 1,
  role: 1,
});

vendorSchema.index({
  onboardingStatus: 1,
  onboardingComplete: 1,
});

vendorSchema.index({
  status: 1,
  isActive: 1,
});

vendorSchema.index({
  "stayDetails.countryCode": 1,
  "stayDetails.city": 1,
});

vendorSchema.index({
  "stayDetails.propertyName": "text",
  businessName: "text",
  companyName: "text",
  city: "text",
});

/* =========================================================
   PRE-VALIDATION

   Stay subtype consistency.
========================================================= */

// vendorSchema.pre("validate", function (next) {
  

//   if (
//     this.vertical &&
//     this.vertical !== "stay"
//   ) {
//     this.staySubtype = "";
//   }

  

//   if (
//     this.vertical === "stay" &&
//     !this.staySubtype &&
//     this.stayDetails?.propertyType
//   ) {
//     this.staySubtype =
//       this.stayDetails.propertyType;
//   }


//   if (
//     this.vertical === "stay" &&
//     this.staySubtype &&
//     this.stayDetails &&
//     !this.stayDetails.propertyType
//   ) {
//     this.stayDetails.propertyType =
//       this.staySubtype;
//   }

//   next();
// });


vendorSchema.pre("validate", function () {
  if (
    this.vertical &&
    this.vertical !== "stay"
  ) {
    this.staySubtype = "";
  }

  if (
    this.vertical === "stay" &&
    !this.staySubtype &&
    this.stayDetails?.propertyType
  ) {
    this.staySubtype =
      this.stayDetails.propertyType;
  }

  if (
    this.vertical === "stay" &&
    this.staySubtype &&
    this.stayDetails &&
    !this.stayDetails.propertyType
  ) {
    this.stayDetails.propertyType =
      this.staySubtype;
  }
});

/* =========================================================
   METHODS
========================================================= */

vendorSchema.methods.hasPermission =
  function (permission) {
    /*
      Owner account ko apne vendor account ke andar
      complete access milta hai.

      Platform Admin is model se handle nahi karna.
      Platform Admin ka separate Admin model/middleware
      hona chahiye.
    */

    if (
      this.role === "owner" &&
      this.isOwnerAccount
    ) {
      return true;
    }

    return (
      Array.isArray(
        this.permissions
      ) &&
      this.permissions.includes(
        permission
      )
    );
  };

vendorSchema.methods.canAccessVertical =
  function (vertical) {
    if (!vertical) {
      return false;
    }

    if (
      this.vertical === vertical ||
      this.selectedVertical === vertical
    ) {
      return true;
    }

    return (
      this.permissionScope
        ?.verticals || []
    ).includes(vertical);
  };

vendorSchema.methods.canAccessStaySubtype =
  function (subtype) {
    return (
      this.vertical === "stay" &&
      this.staySubtype === subtype
    );
  };

/* =========================================================
   EXPORT
========================================================= */

module.exports =
  mongoose.model(
    "Vendor",
    vendorSchema
  );