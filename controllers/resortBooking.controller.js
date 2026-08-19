const Resort = require("../models/Resort.model");
const ResortRoom = require("../models/ResortRoom.model");
const ResortRoomUnit = require("../models/ResortRoomUnit.model");
const ResortInventory = require("../models/ResortInventory.model");
const ResortRatePlan = require("../models/ResortRatePlan.model");
const ResortPricing = require("../models/ResortPricing.model");
const ResortBooking = require("../models/ResortBooking.model");


/* ==========================================================
                    CREATE DATES ARRAY
========================================================== */

const getStayDates = (checkIn, checkOut) => {
  const dates = [];

  const current = new Date(checkIn);
  current.setHours(0, 0, 0, 0);

  const end = new Date(checkOut);
  end.setHours(0, 0, 0, 0);

  while (current < end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};


/* ==========================================================
                    CREATE BOOKING
========================================================== */

exports.createBooking = async (req, res) => {
  try {
    const {
      resortId,
      roomCategoryId,
      ratePlanId,
      checkIn,
      checkOut,
      rooms = 1,
      adults,
      children = 0,
      leadGuest,
      additionalGuests = [],
      paymentMethod = "ONLINE",
      bookingSource = "VENDOR_PANEL",
      specialRequest = "",
      internalNotes = "",
    } = req.body;


    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (
      !resortId ||
      !roomCategoryId ||
      !ratePlanId ||
      !checkIn ||
      !checkOut ||
      !adults ||
      !leadGuest?.name ||
      !leadGuest?.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Required booking fields are missing.",
      });
    }


    const checkInDate = new Date(checkIn);
    checkInDate.setHours(0, 0, 0, 0);

    const checkOutDate = new Date(checkOut);
    checkOutDate.setHours(0, 0, 0, 0);


    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid check-in or check-out date.",
      });
    }


    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: "Check-out must be after check-in.",
      });
    }


    const totalNights = Math.round(
      (checkOutDate - checkInDate) /
      (1000 * 60 * 60 * 24)
    );


    // ==========================================
    // CHECK RESORT
    // ==========================================

    const resort = await Resort.findOne({
      _id: resortId,
      vendor: req.vendor._id,
    });

    if (!resort) {
      return res.status(404).json({
        success: false,
        message: "Resort not found or access denied.",
      });
    }


    // ==========================================
    // CHECK ROOM CATEGORY
    // ==========================================

    const roomCategory = await ResortRoom.findOne({
      _id: roomCategoryId,
      resort: resortId,
      vendor: req.vendor._id,
    });

    if (!roomCategory) {
      return res.status(404).json({
        success: false,
        message: "Room category not found.",
      });
    }


    // ==========================================
    // CHECK RATE PLAN
    // ==========================================

    const ratePlan = await ResortRatePlan.findOne({
      _id: ratePlanId,
      resort: resortId,
      roomCategory: roomCategoryId,
      vendor: req.vendor._id,
      isActive: true,
    });

    if (!ratePlan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found or inactive.",
      });
    }


    // ==========================================
    // MIN/MAX STAY VALIDATION
    // ==========================================

    if (totalNights < ratePlan.minStay) {
      return res.status(400).json({
        success: false,
        message: `Minimum stay is ${ratePlan.minStay} night(s).`,
      });
    }

    if (totalNights > ratePlan.maxStay) {
      return res.status(400).json({
        success: false,
        message: `Maximum stay is ${ratePlan.maxStay} night(s).`,
      });
    }


    // ==========================================
    // GET ALL STAY DATES
    // ==========================================

    const stayDates = getStayDates(
      checkInDate,
      checkOutDate
    );


    // ==========================================
    // CHECK INVENTORY FOR EVERY DATE
    // ==========================================

    const inventories = await ResortInventory.find({
      resort: resortId,
      roomCategory: roomCategoryId,
      vendor: req.vendor._id,
      date: {
        $gte: checkInDate,
        $lt: checkOutDate,
      },
    });


    if (inventories.length !== stayDates.length) {
      return res.status(400).json({
        success: false,
        message:
          "Inventory is not configured for one or more selected dates.",
      });
    }


    for (const inventory of inventories) {
      if (
        inventory.status !== "AVAILABLE" ||
        inventory.availableRooms < Number(rooms)
      ) {
        return res.status(400).json({
          success: false,
          message: `Room is not available for ${inventory.date
            .toISOString()
            .split("T")[0]}.`,
        });
      }
    }


    // ==========================================
    // GET DATE-WISE PRICING
    // ==========================================

    const datePrices = await ResortPricing.find({
      ratePlan: ratePlanId,
      date: {
        $gte: checkInDate,
        $lt: checkOutDate,
      },
    });


    const pricingMap = new Map();

    datePrices.forEach((item) => {
      const key = item.date
        .toISOString()
        .split("T")[0];

      pricingMap.set(key, item);
    });


    // ==========================================
    // CALCULATE ROOM PRICE
    // Falls back to basePrice if no override
    // ==========================================

    let roomPrice = 0;
    let extraAdultAmount = 0;
    let extraChildAmount = 0;


    const safeRooms = Number(rooms);
    const safeAdults = Number(adults);
    const safeChildren = Number(children);


    for (const stayDate of stayDates) {
      const key = stayDate
        .toISOString()
        .split("T")[0];

      const dayPricing = pricingMap.get(key);

      const dayPrice = dayPricing
        ? dayPricing.price
        : ratePlan.basePrice;

      roomPrice += Number(dayPrice) * safeRooms;
    }


    // ==========================================
    // EXTRA GUEST CALCULATION
    // Category capacities use here
    // ==========================================

    const includedAdults =
      Number(roomCategory.maxAdults || 2) * safeRooms;

    const includedChildren =
      Number(roomCategory.maxChildren || 0) * safeRooms;


    const extraAdults = Math.max(
      0,
      safeAdults - includedAdults
    );

    const extraChildren = Math.max(
      0,
      safeChildren - includedChildren
    );


    extraAdultAmount =
      extraAdults *
      Number(ratePlan.extraAdultPrice || 0) *
      totalNights;

    extraChildAmount =
      extraChildren *
      Number(ratePlan.extraChildPrice || 0) *
      totalNights;


    // ==========================================
    // GST
    // ==========================================

    const subTotal =
      roomPrice +
      extraAdultAmount +
      extraChildAmount;

    const gstAmount =
      (subTotal * Number(ratePlan.gstPercent || 0)) /
      100;

    const totalAmount =
      subTotal + gstAmount;


    // ==========================================
    // GENERATE BOOKING ID
    // ==========================================

    const bookingId =
      `RES${Date.now()}${Math.floor(
        1000 + Math.random() * 9000
      )}`;


    // ==========================================
    // CREATE BOOKING
    // ==========================================

    const booking = await ResortBooking.create({
      bookingId,

      vendor: req.vendor._id,
      resort: resortId,
      roomCategory: roomCategoryId,
      ratePlan: ratePlanId,

      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalNights,

      rooms: safeRooms,
      adults: safeAdults,
      children: safeChildren,

      leadGuest,
      additionalGuests,

      pricing: {
        roomPrice,
        extraAdultAmount,
        extraChildAmount,
        gstAmount,
        discountAmount: 0,
        totalAmount,
      },

      paymentMethod,
      bookingSource,
      specialRequest,
      internalNotes,

      bookingStatus: "CONFIRMED",
      paymentStatus: "PENDING",
    });


    // ==========================================
    // REDUCE INVENTORY
    // ==========================================

    for (const inventory of inventories) {
      inventory.bookedRooms += safeRooms;

      inventory.availableRooms =
        inventory.totalRooms -
        inventory.bookedRooms -
        inventory.blockedRooms -
        inventory.maintenanceRooms;

      if (inventory.availableRooms <= 0) {
        inventory.availableRooms = 0;
        inventory.status = "SOLD_OUT";
      }

      await inventory.save();
    }


    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking,
    });

  } catch (error) {
    console.error(
      "Create Resort Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    GET ALL BOOKINGS
========================================================== */

exports.getBookings = async (req, res) => {
  try {
    const {
      resortId,
      status,
      page = 1,
      limit = 20,
    } = req.query;


    const filter = {
      vendor: req.vendor._id,
    };


    if (resortId) {
      filter.resort = resortId;
    }

    if (status) {
      filter.bookingStatus = status;
    }


    const skip =
      (Number(page) - 1) * Number(limit);


    const [bookings, total] = await Promise.all([
      ResortBooking.find(filter)
        .populate("resort", "name")
        .populate("roomCategory", "name")
        .populate("ratePlan", "displayName mealPlan")
        .populate("roomUnit", "roomNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      ResortBooking.countDocuments(filter),
    ]);


    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      bookings,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    GET SINGLE BOOKING
========================================================== */

exports.getBookingById = async (req, res) => {
  try {
    const booking = await ResortBooking.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    })
      .populate("resort")
      .populate("roomCategory")
      .populate("ratePlan")
      .populate("roomUnit");


    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }


    return res.status(200).json({
      success: true,
      booking,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    UPDATE BOOKING STATUS
========================================================== */

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingStatus } = req.body;


    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "CHECKED_IN",
      "CHECKED_OUT",
      "CANCELLED",
      "NO_SHOW",
    ];


    if (!allowedStatuses.includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status.",
      });
    }


    const booking = await ResortBooking.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });


    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }


    booking.bookingStatus = bookingStatus;


    if (bookingStatus === "CANCELLED") {
      booking.cancelledAt = new Date();
      booking.cancellationReason =
        req.body.cancellationReason || "";
      booking.cancelledBy = "VENDOR";
    }


    await booking.save();


    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully.",
      booking,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};