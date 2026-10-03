const mongoose = require("mongoose");

const nightClubEventTicketSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    nightClubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NightClub",
      required: true,
      index: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NightClubEvent",
      required: true,
      index: true,
    },

    // =========================================
    // TICKET BASIC INFO
    // =========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    ticketType: {
      type: String,
      enum: [
        "stag",
        "couple",
        "female",
        "male",
        "vip",
        "table",
        "booth",
        "other",
      ],
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    // =========================================
    // PRICE
    // =========================================

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // =========================================
    // INVENTORY
    // =========================================

    totalQuantity: {
      type: Number,
      required: true,
      min: 1,
    },

    soldQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    availableQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================================
    // PERSON / GROUP CAPACITY
    // =========================================

    personsPerTicket: {
      type: Number,
      default: 1,
      min: 1,
    },

    // =========================================
    // AGE
    // =========================================

    minimumAge: {
      type: Number,
      default: 18,
      min: 0,
    },

    // =========================================
    // SALES WINDOW
    // =========================================

    saleStartDate: {
      type: Date,
      default: null,
    },

    saleEndDate: {
      type: Date,
      default: null,
    },

    // =========================================
    // STATUS
    // =========================================

    isActive: {
      type: Boolean,
      default: true,
    },

    isSoldOut: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================
// INDEX
// =========================================

nightClubEventTicketSchema.index({
  eventId: 1,
  ticketType: 1,
});

nightClubEventTicketSchema.index({
  vendorId: 1,
  eventId: 1,
});

module.exports = mongoose.model(
  "NightClubEventTicket",
  nightClubEventTicketSchema
);