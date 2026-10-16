
// const mongoose = require("mongoose");

// const busSchema = new mongoose.Schema(
//   {
//     /* ================= VENDOR REF ================= */
//     vendor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Vendor",
//       required: true,
//     },

//     /* ================= BASIC INFO ================= */
//     busId:        String,
//     busName:      { type: String, required: true },
//     busNumber:    { type: String, required: true, unique: true },
//     operatorName: String,
//     vendorName:   String,
//     busOwner:     String,

//     /* ================= OPERATOR CONTACT ================= */
//     email:    String,
//     phone:    String,
//     altPhone: String,
//     address:  String,
//     city:     String,
//     state:    String,
//     country:  String,

//     /* ================= ROUTE INFO ================= */
//     fromCity:  { type: String, required: true },
//     toCity:    { type: String, required: true },
//     viaCities: [String],
//     routeName: String,

//     /* ================= BOARDING POINTS ================= */
//     boardingPoints: [
//       {
//         location: String,
//         time:     String,
//         address:  String,
//         landmark: String,
//       },
//     ],

//     /* ================= DROPPING POINTS ================= */
//     droppingPoints: [
//       {
//         location: String,
//         time:     String,
//         address:  String,
//         landmark: String,
//       },
//     ],

//     /* ================= TIMING ================= */
//     departureTime:   String,
//     arrivalTime:     String,
//     journeyDuration: String,
//     reportingTime:   String,

//     /* ================= BUS DETAILS ================= */
//     busType: {
//       type: String,
//       enum: [
//         "AC",
//         "Non-AC",
//         "Sleeper",
//         "Seater",
//         "AC Sleeper",
//         "AC Seater",
//         "Non-AC Sleeper", // CHANGED: form offers this
//         "Non-AC Seater",  // CHANGED: form offers this
//       ],
//       required: true,
//     },
//     busCategory:    String,  // sleeper / seater
//     busModel:       String,
//     busColor:       String,
//     seatLayoutType: String,  // 2x2, 2x1, etc.
//     totalSeats:     { type: Number, required: true },
//     availableSeats: Number,
//     upperSeats:     { type: Number, default: 0 },
//     lowerSeats:     { type: Number, default: 0 },

//     /* ================= SEAT SYSTEM ================= */
//     seatNumbers:  [String],
//     bookedSeats:  [String],
//     blockedSeats: [String],
//     seatPrice: [
//       {
//         seatNo: String,
//         price:  String,
//       },
//     ],

//     /* ================= PRICING ================= */
//     basePrice:           String,
//     tax:                 String,
//     tollTax:             String,
//     discount:            String,
//     offerPrice:          String,
//     finalPrice:          String,
//     price:               { type: Number, required: true }, // main ticket price
//     agentCommission:     String,
//     agentPrice:          String,
//     vendorCost:          String,
//     vendorPaymentStatus: String,
//     profit:              String,

//     /* ================= DRIVER & CREW ================= */
//     driverName:         String,
//     driverPhone:        String,
//     driverLicense:      String,
//     driverPhoto:        String, // NEW
//     driverLicenseImage: String, // NEW
//     helperName:         String,
//     helperPhone:        String,
//     helperId:           String, // NEW
//     helperPhoto:        String, // NEW
//     helperIdImage:      String, // NEW

//     /* ================= DOCUMENTS ================= */
//     rcNumber:        String,
//     insuranceNumber: String,
//     permitNumber:    String,
//     fitnessExpiry:   String,
//     rcImage:         String, // NEW
//     insuranceImage:  String, // NEW
//     permitImage:     String, // NEW
//     fitnessImage:    String, // NEW

//     /* ================= LIVE TRACK ================= */
//     gpsDeviceId:        String,
//     liveTrackingLink:   String,
//     busCurrentLocation: String,

//     /* ================= AMENITIES ================= */
//     amenities: [String],

//     /* ================= DATES ================= */
//     travelDate:       { type: Date },   // CHANGED: no longer required (fleet registry has no travel date)
//     returnDate:       Date,
//     startBookingDate: Date,
//     endBookingDate:   Date,
//     cancelDate:       Date,
//     completedDate:    Date,
//     modifiedDate:     Date,

//     /* ================= MAP ================= */
//     routeMap: {
//       fromLat: String,
//       fromLng: String,
//       toLat:   String,
//       toLng:   String,
//     },

//     /* ================= IMAGES ================= */
//     frontImage:      String,
//     backImage:       String,
//     seatLayoutImage: String,
//     insideImages:    [String],

//     // Main image (Cloudinary URL)
//     image: {
//       type: String,
//       required: true,
//     },

//     // Gallery (Cloudinary objects)
//     gallery: [
//       {
//         public_id: String,
//         url:       String,
//       },
//     ],

//     /* ================= POLICY ================= */
//     cancellationPolicy: String,
//     rating:  String,
//     reviews: String,

//     /* ================= STATUS ================= */
//     status: {
//       type:    String,
//       default: "pending", // pending → approved → rejected
//       enum:    ["pending", "approved", "rejected"],
//     },

//     /* ================= ADMIN ================= */
//     assignUser: String,
//     notes:      String,
//     addedBy:    { type: String, default: "vendor" },

//     /* ================= ACTIVE ================= */
//     isActive: {
//       type:    Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Bus", busSchema);

const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
  {
    /* ================= VENDOR REF ================= */
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    /* ================= BASIC INFO ================= */
    busId:        String,
    busName:      { type: String, required: true },
    busNumber:    { type: String, required: true, unique: true },
    operatorName: String,
    vendorName:   String,
    busOwner:     String,

    /* ================= OPERATOR CONTACT ================= */
    email:    String,
    phone:    String,
    altPhone: String,
    address:  String,
    city:     String,
    state:    String,
    country:  String,

    /* ================= ROUTE INFO ================= */
    fromCity:  { type: String, required: true },
    toCity:    { type: String, required: true },
    viaCities: [String],
    routeName: String,

    /* ================= BOARDING POINTS ================= */
    boardingPoints: [
      {
        location: String,
        time:     String,
        address:  String,
        landmark: String,
      },
    ],

    /* ================= DROPPING POINTS ================= */
    droppingPoints: [
      {
        location: String,
        time:     String,
        address:  String,
        landmark: String,
      },
    ],

    /* ================= TIMING ================= */
    departureTime:   String,
    arrivalTime:     String,
    journeyDuration: String,
    reportingTime:   String,

    /* ================= BUS DETAILS ================= */
    busType: {
      type: String,
      enum: [
        "AC",
        "Non-AC",
        "Sleeper",
        "Seater",
        "AC Sleeper",
        "AC Seater",
        "Non-AC Sleeper", // CHANGED: form offers this
        "Non-AC Seater",  // CHANGED: form offers this
      ],
      required: true,
    },
    busCategory:    String,  // sleeper / seater
    busModel:       String,
    busColor:       String,
    seatLayoutType: String,  // 2x2, 2x1, etc.
    totalSeats:     { type: Number, required: true },
    availableSeats: Number,
    upperSeats:     { type: Number, default: 0 },
    lowerSeats:     { type: Number, default: 0 },

    /* ================= SEAT SYSTEM ================= */
    seatNumbers:  [String],
    bookedSeats:  [String],
    blockedSeats: [String],
    seatPrice: [
      {
        seatNo: String,
        price:  String,
      },
    ],

    /* ================= PRICING ================= */
    basePrice:           String,
    tax:                 String,
    tollTax:             String,
    discount:            String,
    offerPrice:          String,
    finalPrice:          String,
    price:               { type: Number, required: true }, // main ticket price
    agentCommission:     String,
    agentPrice:          String,
    vendorCost:          String,
    vendorPaymentStatus: String,
    profit:              String,

    /* ================= DRIVER & CREW ================= */
    driverName:         String,
    driverPhone:        String,
    driverLicense:      String,
    driverPhoto:        String, // NEW
    driverLicenseImage: String, // NEW
    helperName:         String,
    helperPhone:        String,
    helperId:           String, // NEW
    helperPhoto:        String, // NEW
    helperIdImage:      String, // NEW

    /* ================= DOCUMENTS ================= */
    rcNumber:        String,
    insuranceNumber: String,
    permitNumber:    String,
    fitnessExpiry:   String,
    rcImage:         String, // NEW
    insuranceImage:  String, // NEW
    permitImage:     String, // NEW
    fitnessImage:    String, // NEW

    /* ================= LIVE TRACK ================= */
    gpsDeviceId:        String,
    liveTrackingLink:   String,
    busCurrentLocation: String,

    /* ================= AMENITIES ================= */
    amenities: [String],

    /* ================= DATES ================= */
    travelDate:       { type: Date },   // CHANGED: no longer required (fleet registry has no travel date)
    returnDate:       Date,
    startBookingDate: Date,
    endBookingDate:   Date,
    cancelDate:       Date,
    completedDate:    Date,
    modifiedDate:     Date,

    /* ================= MAP ================= */
    routeMap: {
      fromLat: String,
      fromLng: String,
      toLat:   String,
      toLng:   String,
    },

    /* ================= IMAGES ================= */
    frontImage:      String,
    backImage:       String,
    seatLayoutImage: String,
    insideImages:    [String],

    // Main image (Cloudinary URL)
    image: {
      type: String,
      required: true,
    },

    // Gallery (Cloudinary objects)
    gallery: [
      {
        public_id: String,
        url:       String,
      },
    ],

    /* ================= POLICY ================= */
    cancellationPolicy: String,
    rating:  String,
    reviews: String,

    /* ================= STATUS ================= */
    status: {
      type:    String,
      default: "approved", // CHANGED: vendor buses go live directly, no admin approval needed
      enum:    ["pending", "approved", "rejected"],
    },

    /* ================= ADMIN ================= */
    assignUser: String,
    notes:      String,
    addedBy:    { type: String, default: "vendor" },

    /* ================= ACTIVE ================= */
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bus", busSchema);