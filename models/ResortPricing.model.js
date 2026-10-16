// const mongoose = require("mongoose");

// const resortPricingSchema = new mongoose.Schema(
//   {
//     vendor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Vendor",
//       required: true,
//       index: true,
//     },

//     resort: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Resort",
//       required: true,
//       index: true,
//     },

//     roomCategory: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "ResortRoom",
//       required: true,
//       index: true,
//     },

//     ratePlan: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "ResortRatePlan",
//       required: true,
//       index: true,
//     },

//     date: {
//       type: Date,
//       required: true,
//       index: true,
//     },

//     price: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     extraAdultPrice: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     extraChildPrice: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     minStay: {
//       type: Number,
//       default: 1,
//       min: 1,
//       validate: {
//         validator: Number.isInteger,
//         message: "minStay must be an integer.",
//       },
//     },

//     isAvailable: {
//       type: Boolean,
//       default: true,
//     },

//     notes: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// resortPricingSchema.index(
//   { ratePlan: 1, date: 1 },
//   { unique: true }
// );

// resortPricingSchema.index({
//   resort: 1,
//   roomCategory: 1,
//   date: 1,
// });

// module.exports =
//   mongoose.models.ResortPricing ||
//   mongoose.model("ResortPricing", resortPricingSchema);


const mongoose = require("mongoose");

const resortInventorySchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    resort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resort",
      required: true,
    },

    roomCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResortRoom",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    totalRooms: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    availableRooms: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    bookedRooms: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    blockedRooms: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    maintenanceRooms: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: ["AVAILABLE", "SOLD_OUT", "BLOCKED", "CLOSED"],
      default: "AVAILABLE",
      required: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// One inventory record per room category per date.
resortInventorySchema.index(
  { resort: 1, roomCategory: 1, date: 1 },
  { unique: true }
);

resortInventorySchema.index({
  vendor: 1,
  resort: 1,
  date: 1,
});

module.exports =
  mongoose.models.ResortInventory ||
  mongoose.model("ResortInventory", resortInventorySchema);
