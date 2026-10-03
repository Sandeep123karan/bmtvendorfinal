const mongoose = require("mongoose");

const tourQuerySchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    queryId: {
      type: String,
      unique: true,
      index: true,
    },

    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        trim: true,
      },
    },

    travelDate: {
      type: Date,
    },

    guests: {
      adults: {
        type: Number,
        default: 1,
        min: 0,
      },

      children: {
        type: Number,
        default: 0,
        min: 0,
      },

      infants: {
        type: Number,
        default: 0,
        min: 0,
      },

      total: {
        type: Number,
        default: 1,
        min: 1,
      },
    },

    budget: {
      min: {
        type: Number,
        default: 0,
        min: 0,
      },

      max: {
        type: Number,
        default: 0,
        min: 0,
      },

      currency: {
        type: String,
        default: "INR",
      },
    },

    message: {
      type: String,
      trim: true,
    },

    source: {
      type: String,
      enum: [
        "WEBSITE",
        "WHATSAPP",
        "PHONE",
        "EMAIL",
        "OTHER",
      ],
      default: "WEBSITE",
    },

    status: {
      type: String,
      enum: [
        "NEW",
        "IN_PROGRESS",
        "CONVERTED",
        "CLOSED",
        "REJECTED",
      ],
      default: "NEW",
      index: true,
    },

    vendorNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/* Generate Query ID automatically */
tourQuerySchema.pre("save", async function (next) {
  if (!this.queryId) {
    const random = Math.floor(100000 + Math.random() * 900000);
    this.queryId = `BMT-QRY-${random}`;
  }

  
});

module.exports = mongoose.model("TourQuery", tourQuerySchema);