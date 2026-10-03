const mongoose = require("mongoose");

const cruiseAvailabilitySchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    sailingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CruiseSailing",
      required: true,
      index: true,
    },

    shipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CruiseShip",
      required: true,
      index: true,
    },

    cabinId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CruiseCabin",
      required: true,
      index: true,
    },

    totalInventory: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    availableInventory: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    reservedInventory: {
      type: Number,
      min: 0,
      default: 0,
    },

    soldInventory: {
      type: Number,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "available",
        "limited",
        "sold-out",
        "inactive",
      ],
      default: "available",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

cruiseAvailabilitySchema.index(
  {
    vendorId: 1,
    sailingId: 1,
    cabinId: 1,
  },
  {
    unique: true,
  }
);

cruiseAvailabilitySchema.index({
  sailingId: 1,
  status: 1,
});

cruiseAvailabilitySchema.index({
  cabinId: 1,
  status: 1,
});

cruiseAvailabilitySchema.pre(
  "validate",
  function () {
    const total = Number(
      this.totalInventory || 0
    );

    const available = Number(
      this.availableInventory || 0
    );

    const reserved = Number(
      this.reservedInventory || 0
    );

    const sold = Number(
      this.soldInventory || 0
    );

    if (
      available + reserved + sold >
      total
    ) {
      throw new Error(
        "Available, reserved and sold inventory cannot exceed total inventory."
      );
    }

    if (total === 0) {
      this.status = "inactive";
      return;
    }

    if (available === 0) {
      this.status = "sold-out";
      return;
    }

    if (
      available <=
      Math.ceil(total * 0.2)
    ) {
      this.status = "limited";
      return;
    }

    this.status = "available";
  }
);

module.exports = mongoose.model(
  "CruiseAvailability",
  cruiseAvailabilitySchema
);