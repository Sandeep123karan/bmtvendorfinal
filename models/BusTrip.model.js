// const mongoose = require("mongoose");

// const busTripSchema = new mongoose.Schema(
//   {
//     /* =========================
//        REFERENCES
//     ========================= */

//     bus: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Bus",
//       required: true,
//       index: true,
//     },

//     vendor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Vendor",
//       required: true,
//       index: true,
//     },

//     seatLayout: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "BusSeatLayout",
//       default: null,
//     },

//     /* =========================
//        TRIP IDENTIFICATION
//     ========================= */

//     tripCode: {
//       type: String,
//       required: true,
//       unique: true,
//       index: true,
//     },

//     tripName: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     /* =========================
//        ROUTE
//     ========================= */

//     fromCity: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     toCity: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     viaCities: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],

//     /* =========================
//        JOURNEY DATE & TIME
//     ========================= */

//     travelDate: {
//       type: Date,
//       required: true,
//       index: true,
//     },

//     departureTime: {
//       type: String,
//       required: true,
//     },

//     arrivalDate: {
//       type: Date,
//       default: null,
//     },

//     arrivalTime: {
//       type: String,
//       required: true,
//     },

//     reportingTime: {
//       type: String,
//       default: "",
//     },

//     journeyDuration: {
//       type: String,
//       default: "",
//     },

//     /* =========================
//        BOARDING POINTS
//     ========================= */

//     boardingPoints: [
//       {
//         location: String,
//         time: String,
//         address: String,
//         landmark: String,
//     },
//     ],

//     /* =========================
//        DROPPING POINTS
//     ========================= */

//     droppingPoints: [
//       {
//         location: String,
//         time: String,
//         address: String,
//         landmark: String,
//       },
//     ],

//     /* =========================
//        PRICING
//     ========================= */

//     basePrice: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     tax: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     discount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     finalPrice: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     /* =========================
//        SEAT AVAILABILITY
//     ========================= */

//     totalSeats: {
//       type: Number,
//       default: 0,
//     },

//     availableSeats: {
//       type: Number,
//       default: 0,
//     },

//     bookedSeats: [
//       {
//         type: String,
//       },
//     ],

//     blockedSeats: [
//       {
//         type: String,
//       },
//     ],

//     /* =========================
//        TRIP STATUS
//     ========================= */

//     status: {
//       type: String,
//       enum: [
//         "SCHEDULED",
//         "BOARDING",
//         "STARTED",
//         "COMPLETED",
//         "CANCELLED",
//       ],
//       default: "SCHEDULED",
//       index: true,
//     },

//     cancellationReason: {
//       type: String,
//       default: "",
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },

//     notes: {
//       type: String,
//       default: "",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );


// /* =========================
//    INDEXES
// ========================= */

// busTripSchema.index({
//   bus: 1,
//   travelDate: 1,
// });

// busTripSchema.index({
//   fromCity: 1,
//   toCity: 1,
//   travelDate: 1,
// });


// module.exports = mongoose.model(
//   "BusTrip",
//   busTripSchema
// );


const mongoose = require("mongoose");

/* One seat of the trip (snapshot taken from the bus layout when the
   trip is created, so later layout edits never change running trips).
   price = 0 means "use the trip fare". */
const tripSeatSchema = new mongoose.Schema(
  {
    seatNumber: { type: String, required: true, trim: true },
    deck: { type: String, enum: ["LOWER", "UPPER"], default: "LOWER" },
    seatType: { type: String, default: "SEATER" },
    price: { type: Number, default: 0, min: 0 },
    isBlocked: { type: Boolean, default: false },
  },
  { _id: false }
);

const busTripSchema = new mongoose.Schema(
  {
    /* =========================
       REFERENCES
    ========================= */

    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
      index: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    // Old seat-layout module (BusSeatLayout) - null when the layout
    // comes from the Bus Types page.
    seatLayout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusSeatLayout",
      default: null,
    },

    // Bus Types page layout (BusType) - null when BusSeatLayout is used.
    busTypeLayout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusType",
      default: null,
    },

    seatLayoutSource: {
      type: String,
      enum: ["SEAT_LAYOUT", "BUS_TYPE"],
      default: "BUS_TYPE",
    },

    /* =========================
       TRIP IDENTIFICATION
    ========================= */

    tripCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    tripName: {
      type: String,
      default: "",
      trim: true,
    },

    /* =========================
       ROUTE
    ========================= */

    fromCity: {
      type: String,
      required: true,
      trim: true,
    },

    toCity: {
      type: String,
      required: true,
      trim: true,
    },

    viaCities: [
      {
        type: String,
        trim: true,
      },
    ],

    /* =========================
       JOURNEY DATE & TIME
    ========================= */

    travelDate: {
      type: Date,
      required: true,
      index: true,
    },

    departureTime: {
      type: String,
      required: true,
    },

    arrivalDate: {
      type: Date,
      default: null,
    },

    arrivalTime: {
      type: String,
      required: true,
    },

    reportingTime: {
      type: String,
      default: "",
    },

    journeyDuration: {
      type: String,
      default: "",
    },

    /* =========================
       BOARDING POINTS
    ========================= */

    boardingPoints: [
      {
        location: String,
        time: String,
        address: String,
        landmark: String,
      },
    ],

    /* =========================
       DROPPING POINTS
    ========================= */

    droppingPoints: [
      {
        location: String,
        time: String,
        address: String,
        landmark: String,
      },
    ],

    /* =========================
       PRICING
    ========================= */

    basePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =========================
       SEAT AVAILABILITY
    ========================= */

    seatMap: [tripSeatSchema],

    totalSeats: {
      type: Number,
      default: 0,
    },

    availableSeats: {
      type: Number,
      default: 0,
    },

    bookedSeats: [
      {
        type: String,
      },
    ],

    blockedSeats: [
      {
        type: String,
      },
    ],

    /* =========================
       TRIP STATUS
    ========================= */

    status: {
      type: String,
      enum: [
        "SCHEDULED",
        "BOARDING",
        "STARTED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "SCHEDULED",
      index: true,
    },

    cancellationReason: {
      type: String,
      default: "",
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
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


/* =========================
   INDEXES
========================= */

busTripSchema.index({
  bus: 1,
  travelDate: 1,
});

busTripSchema.index({
  fromCity: 1,
  toCity: 1,
  travelDate: 1,
});


module.exports = mongoose.model(
  "BusTrip",
  busTripSchema
);