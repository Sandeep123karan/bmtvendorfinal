const mongoose = require("mongoose");

const NightClubEvent = require(
  "../models/NightClubEvent.model"
);

const NightClubEventTicket = require(
  "../models/NightClubEventTicket.model"
);

const NightClubEventBooking = require(
  "../models/NightClubEventBooking.model"
);

// =====================================================
// GENERATE BOOKING ID
// =====================================================

const generateBookingId = () => {
  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `NC-${Date.now()}-${random}`;
};

// =====================================================
// CREATE BOOKING
// =====================================================

exports.createNightClubEventBooking = async (
  req,
  res
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const {
      eventId,
      ticketId,
      quantity,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body;

    // =====================================================
    // VALIDATION
    // =====================================================

    if (
      !eventId ||
      !ticketId ||
      !quantity ||
      !customerName ||
      !customerEmail ||
      !customerPhone
    ) {
      return res.status(400).json({
        success: false,
        message:
          "eventId, ticketId, quantity, customerName, customerEmail and customerPhone are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(eventId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid eventId",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(ticketId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticketId",
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
          "Quantity must be a valid number greater than 0",
      });
    }

    // =====================================================
    // FIND EVENT
    // =====================================================

    const event = await NightClubEvent.findOne({
      _id: eventId,
      status: "published",
      isPublished: true,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message:
          "Event not found or not published",
      });
    }

    // =====================================================
    // EVENT DATE CHECK
    // =====================================================

    const now = new Date();

    const eventDate = new Date(
      event.eventDate
    );

    if (eventDate < now) {
      return res.status(400).json({
        success: false,
        message:
          "This event has already started or ended",
      });
    }

    // =====================================================
    // FIND TICKET
    // =====================================================

    const ticket =
      await NightClubEventTicket.findOne({
        _id: ticketId,
        eventId: event._id,
        isActive: true,
      });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message:
          "Ticket not found or inactive",
      });
    }

    // =====================================================
    // TICKET SOLD OUT CHECK
    // =====================================================

    if (
      ticket.isSoldOut ||
      ticket.availableQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Tickets are sold out",
      });
    }

    // =====================================================
    // AVAILABLE QUANTITY
    // =====================================================

    if (
      ticket.availableQuantity <
      bookingQuantity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Not enough tickets available",
        availableQuantity:
          ticket.availableQuantity,
      });
    }

    // =====================================================
    // SALE START
    // =====================================================

    if (
      ticket.saleStartDate &&
      now <
        new Date(ticket.saleStartDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Ticket sale has not started yet",
      });
    }

    // =====================================================
    // SALE END
    // =====================================================

    if (
      ticket.saleEndDate &&
      now >
        new Date(ticket.saleEndDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Ticket sale has ended",
      });
    }

    // =====================================================
    // TOTAL CALCULATION
    // =====================================================

    const pricePerTicket =
      Number(ticket.price);

    const totalAmount =
      pricePerTicket *
      bookingQuantity;

    const personsPerTicket =
      Number(
        ticket.personsPerTicket || 1
      );

    const totalPersons =
      bookingQuantity *
      personsPerTicket;

    // =====================================================
    // CHECK EVENT CAPACITY
    // =====================================================

    if (
      typeof event.availableCapacity ===
        "number" &&
      event.availableCapacity <
        totalPersons
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Not enough event capacity available",
        availableCapacity:
          event.availableCapacity,
      });
    }

    // =====================================================
    // PAYMENT EXPIRY
    // 15 MINUTES
    // =====================================================

    const paymentExpiresAt =
      new Date(
        Date.now() +
          15 * 60 * 1000
      );

    // =====================================================
    // CREATE BOOKING
    // =====================================================

    const booking =
      await NightClubEventBooking.create({
        userId,

        customerName:
          customerName.trim(),

        customerEmail:
          customerEmail
            .toLowerCase()
            .trim(),

        customerPhone:
          customerPhone.trim(),

        vendorId:
          event.vendorId,

        nightClubId:
          event.nightClubId,

        eventId:
          event._id,

        ticketId:
          ticket._id,

        ticketName:
          ticket.name,

        ticketType:
          ticket.ticketType,

        quantity:
          bookingQuantity,

        personsPerTicket,

        totalPersons,

        pricePerTicket,

        totalAmount,

        currency:
          ticket.currency || "INR",

        bookingId:
          generateBookingId(),

        bookingStatus:
          "pending",

        paymentStatus:
          "pending",

        paymentMethod:
          "razorpay",

        paymentExpiresAt,
      });

    // =====================================================
    // IMPORTANT
    //
    // YAHAN TICKET QUANTITY DEDUCT NAHI KAR RAHE.
    //
    // Payment successful hone ke baad deduct hogi.
    // =====================================================

    return res.status(201).json({
      success: true,

      message:
        "Night club event booking created successfully",

      data: booking,
    });
  } catch (error) {
    console.error(
      "CREATE NIGHT CLUB BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET MY BOOKINGS
// =====================================================

exports.getMyNightClubEventBookings =
  async (req, res) => {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "User authentication required",
        });
      }

      const bookings =
        await NightClubEventBooking.find({
          userId,
        })
          .populate(
            "eventId",
            "title eventType eventDate startTime endTime bannerImage"
          )
          .populate(
            "nightClubId",
            "name city address phone logo coverImage"
          )
          .populate(
            "ticketId",
            "name ticketType price personsPerTicket"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    } catch (error) {
      console.error(
        "GET MY NIGHT CLUB BOOKINGS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// GET SINGLE BOOKING
// =====================================================

exports.getNightClubEventBookingById =
  async (req, res) => {
    try {
      const userId = req.user?._id;

      const booking =
        await NightClubEventBooking.findOne({
          _id: req.params.id,
          userId,
        })
          .populate(
            "eventId",
            "title eventType eventDate startTime endTime bannerImage"
          )
          .populate(
            "nightClubId",
            "name city address phone logo coverImage"
          )
          .populate(
            "ticketId",
            "name ticketType price personsPerTicket"
          );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      console.error(
        "GET SINGLE NIGHT CLUB BOOKING ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// CANCEL BOOKING
// =====================================================

exports.cancelNightClubEventBooking =
  async (req, res) => {
    try {
      const userId = req.user?._id;

      const booking =
        await NightClubEventBooking.findOne({
          _id: req.params.id,
          userId,
        });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (
        booking.bookingStatus ===
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Booking already cancelled",
        });
      }

      if (
        booking.bookingStatus ===
        "completed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Completed booking cannot be cancelled",
        });
      }

      // =================================================
      // IF PAYMENT NOT COMPLETED
      // =================================================

      if (
        booking.paymentStatus !==
        "paid"
      ) {
        booking.bookingStatus =
          "cancelled";

        booking.cancelledAt =
          new Date();

        booking.cancellationReason =
          "Cancelled before payment";

        await booking.save();

        return res.status(200).json({
          success: true,
          message:
            "Booking cancelled successfully",
          data: booking,
        });
      }

      // =================================================
      // PAID BOOKING
      //
      // Actual refund process Razorpay module me hoga.
      // =================================================

      booking.bookingStatus =
        "cancelled";

      booking.cancelledAt =
        new Date();

      booking.cancellationReason =
        req.body.reason ||
        "Cancelled by customer";

      await booking.save();

      return res.status(200).json({
        success: true,
        message:
          "Booking cancellation request processed",
        data: booking,
      });
    } catch (error) {
      console.error(
        "CANCEL NIGHT CLUB BOOKING ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };