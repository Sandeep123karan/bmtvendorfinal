const mongoose = require("mongoose");
const crypto = require("crypto");

const CruiseBooking = require("../models/CruiseBooking.model");
const CruiseAvailability = require("../models/CruiseAvailability.model");
const CruisePricing = require("../models/CruisePricing.model");

const getCustomerId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    req.user?.userId
  );
};

const generateBookingReference = () => {
  const random = crypto
    .randomBytes(5)
    .toString("hex")
    .toUpperCase();

  return `CR-${Date.now()
    .toString()
    .slice(-8)}-${random}`;
};

const createCruiseBooking = async (req, res) => {
  try {
    const customerId = getCustomerId(req);

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required.",
      });
    }

    const {
      sailingId,
      shipId,
      cabinId,
      pricingId,
      customerName,
      customerEmail,
      customerPhone,
      passengers,
      quantity = 1,
      specialRequests = "",
    } = req.body;

    if (!sailingId) {
      return res.status(400).json({
        success: false,
        message: "Sailing ID is required.",
      });
    }

    if (!shipId) {
      return res.status(400).json({
        success: false,
        message: "Ship ID is required.",
      });
    }

    if (!cabinId) {
      return res.status(400).json({
        success: false,
        message: "Cabin ID is required.",
      });
    }

    if (!pricingId) {
      return res.status(400).json({
        success: false,
        message: "Pricing ID is required.",
      });
    }

    if (!customerName) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required.",
      });
    }

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Customer email is required.",
      });
    }

    if (!customerPhone) {
      return res.status(400).json({
        success: false,
        message: "Customer phone is required.",
      });
    }

    if (
      !Array.isArray(passengers) ||
      passengers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one passenger is required.",
      });
    }

    const bookingQuantity = Number(quantity);

    if (
      !Number.isInteger(bookingQuantity) ||
      bookingQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be a positive integer.",
      });
    }

    if (
      passengers.length !== bookingQuantity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Passenger count must match booking quantity.",
      });
    }

    const pricing =
      await CruisePricing.findOne({
        _id: pricingId,
        sailingId,
        shipId,
        cabinId,
      });

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message:
          "Valid cruise pricing not found.",
      });
    }

    if (pricing.status !== "active") {
      return res.status(400).json({
        success: false,
        message:
          "Selected cruise pricing is not active.",
      });
    }

    const pricePerPassenger =
      Number(
        pricing.finalPrice ??
          pricing.totalPrice ??
          pricing.adultPrice ??
          pricing.basePrice ??
          0
      );

    if (pricePerPassenger <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid cruise pricing amount.",
      });
    }

    const baseAmount =
      pricePerPassenger * bookingQuantity;

    const taxAmount =
      Number(pricing.taxAmount || 0) *
      bookingQuantity;

    const portCharges =
      Number(pricing.portCharges || 0) *
      bookingQuantity;

    const serviceCharges =
      Number(pricing.serviceCharges || 0) *
      bookingQuantity;

    const discountAmount =
      Number(pricing.discountAmount || 0) *
      bookingQuantity;

    const totalAmount = Math.max(
      0,
      baseAmount +
        taxAmount +
        portCharges +
        serviceCharges -
        discountAmount
    );

    const availability =
      await CruiseAvailability.findOneAndUpdate(
        {
          sailingId,
          shipId,
          cabinId,
          availableInventory: {
            $gte: bookingQuantity,
          },
          status: {
            $in: [
              "available",
              "limited",
            ],
          },
        },
        {
          $inc: {
            availableInventory:
              -bookingQuantity,
            reservedInventory:
              bookingQuantity,
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!availability) {
      return res.status(409).json({
        success: false,
        message:
          "Not enough cabin availability for this booking.",
      });
    }

    const bookingReference =
      generateBookingReference();

    let booking;

    try {
      booking =
        await CruiseBooking.create({
          bookingReference,
          customerId,
          vendorId:
            availability.vendorId,

          sailingId,
          shipId,
          cabinId,
          pricingId,

          customerName,
          customerEmail:
            customerEmail.toLowerCase().trim(),
          customerPhone,

          passengers,

          quantity: bookingQuantity,

          currency:
            pricing.currency || "INR",

          baseAmount,
          taxAmount,
          portCharges,
          serviceCharges,
          discountAmount,
          totalAmount,

          paymentStatus: "pending",
          bookingStatus: "reserved",

          paymentMethod: "razorpay",

          specialRequests,
        });
    } catch (bookingError) {
      await CruiseAvailability.findOneAndUpdate(
        {
          _id: availability._id,
          reservedInventory: {
            $gte: bookingQuantity,
          },
        },
        {
          $inc: {
            availableInventory:
              bookingQuantity,
            reservedInventory:
              -bookingQuantity,
          },
        }
      );

      throw bookingError;
    }

    return res.status(201).json({
      success: true,
      message:
        "Cruise booking created successfully.",
      booking,
    });
  } catch (error) {
    console.error(
      "CREATE CRUISE BOOKING ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Booking reference already exists. Please try again.",
      });
    }

    if (
      error instanceof mongoose.Error.ValidationError
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking validation failed.",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create cruise booking.",
      error: error.message,
    });
  }
};

const getMyCruiseBookings = async (
  req,
  res
) => {
  try {
    const customerId = getCustomerId(req);

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message:
          "Customer authentication required.",
      });
    }

    const bookings =
      await CruiseBooking.find({
        customerId,
      })
        .populate(
          "vendorId",
          "name email phone"
        )
        .populate(
          "sailingId"
        )
        .populate(
          "shipId",
          "shipName cruiseLineName cruiseType"
        )
        .populate("cabinId")
        .populate("pricingId")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(
      "GET MY CRUISE BOOKINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch cruise bookings.",
      error: error.message,
    });
  }
};

const getCruiseBookingById = async (
  req,
  res
) => {
  try {
    const customerId = getCustomerId(req);

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message:
          "Customer authentication required.",
      });
    }

    const booking =
      await CruiseBooking.findOne({
        _id: req.params.id,
        customerId,
      })
        .populate(
          "vendorId",
          "name email phone"
        )
        .populate("sailingId")
        .populate(
          "shipId",
          "shipName cruiseLineName cruiseType"
        )
        .populate("cabinId")
        .populate("pricingId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Cruise booking not found.",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(
      "GET CRUISE BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch cruise booking.",
      error: error.message,
    });
  }
};

const cancelCruiseBooking = async (
  req,
  res
) => {
  try {
    const customerId = getCustomerId(req);

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message:
          "Customer authentication required.",
      });
    }

    const booking =
      await CruiseBooking.findOne({
        _id: req.params.id,
        customerId,
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Cruise booking not found.",
      });
    }

    if (
      [
        "cancelled",
        "completed",
      ].includes(booking.bookingStatus)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Booking cannot be cancelled because it is already ${booking.bookingStatus}.`,
      });
    }

    if (
      booking.paymentStatus === "paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Paid booking cancellation should be processed through the refund flow.",
      });
    }

    if (
      booking.bookingStatus === "reserved"
    ) {
      await CruiseAvailability.findOneAndUpdate(
        {
          sailingId:
            booking.sailingId,
          shipId:
            booking.shipId,
          cabinId:
            booking.cabinId,
          reservedInventory: {
            $gte: booking.quantity,
          },
        },
        {
          $inc: {
            availableInventory:
              booking.quantity,
            reservedInventory:
              -booking.quantity,
          },
        }
      );
    }

    booking.bookingStatus =
      "cancelled";

    booking.cancellationReason =
      req.body.reason || "";

    booking.cancelledAt =
      new Date();

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        "Cruise booking cancelled successfully.",
      booking,
    });
  } catch (error) {
    console.error(
      "CANCEL CRUISE BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel cruise booking.",
      error: error.message,
    });
  }
};

module.exports = {
  createCruiseBooking,
  getMyCruiseBookings,
  getCruiseBookingById,
  cancelCruiseBooking,
};