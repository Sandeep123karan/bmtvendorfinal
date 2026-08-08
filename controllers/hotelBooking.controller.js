const mongoose = require("mongoose");

const Hotel = require("../models/Hotel.model");
const HotelRoom = require("../models/HotelRoom.model");
const HotelInventory = require("../models/HotelInventory.model");
const HotelBooking = require("../models/HotelBooking.model");

/* =========================================================
   HELPER
========================================================= */

const getVendorId = (req) => {
  return (
    req.vendor?._id ||
    req.vendor?.id ||
    req.user?.vendorId ||
    req.user?._id
  );
};


const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};


/* =========================================================
   GENERATE BOOKING NUMBER
========================================================= */

const generateBookingNumber = () => {
  const timestamp = Date.now();

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `HTL-${timestamp}-${random}`;
};


/* =========================================================
   CALCULATE NIGHTS
========================================================= */

const calculateNights = (
  checkIn,
  checkOut
) => {

  const start = startOfDay(checkIn);
  const end = startOfDay(checkOut);

  const difference =
    end.getTime() - start.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
};


/* =========================================================
   CREATE HOTEL BOOKING
   POST /api/hotel-booking
========================================================= */

exports.createBooking = async (
  req,
  res
) => {

  const session =
    await mongoose.startSession();

  try {

    session.startTransaction();

    const {
      hotelId,
      roomId,

      guest,

      checkIn,
      checkOut,

      roomsBooked = 1,

      extraGuestAmount = 0,
      mealAmount = 0,

      discountAmount = 0,
      couponDiscount = 0,

      couponCode = "",

      paymentMethod = "PAY_AT_HOTEL",

      commissionPercentage = 0,

      source = "VENDOR",
    } = req.body;


    /* =====================================================
       AUTH
    ===================================================== */

    const vendorId = getVendorId(req);

    if (!vendorId) {

      await session.abortTransaction();

      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    /* =====================================================
       REQUIRED FIELDS
    ===================================================== */

    if (
      !hotelId ||
      !roomId ||
      !checkIn ||
      !checkOut
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "hotelId, roomId, checkIn and checkOut are required.",
      });
    }


    if (
      !isValidObjectId(hotelId) ||
      !isValidObjectId(roomId)
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Invalid hotelId or roomId.",
      });
    }


    /* =====================================================
       GUEST VALIDATION
    ===================================================== */

    if (
      !guest ||
      !guest.name ||
      !guest.email ||
      !guest.phone
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Guest name, email and phone are required.",
      });
    }


    if (
      !guest.adults ||
      Number(guest.adults) < 1
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "At least one adult is required.",
      });
    }


    /* =====================================================
       VALIDATE DATES
    ===================================================== */

    const checkInDate =
      startOfDay(checkIn);

    const checkOutDate =
      startOfDay(checkOut);


    if (
      isNaN(checkInDate.getTime()) ||
      isNaN(checkOutDate.getTime())
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Invalid check-in/check-out date.",
      });
    }


    if (
      checkOutDate <= checkInDate
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Check-out must be after check-in.",
      });
    }


    const nights =
      calculateNights(
        checkInDate,
        checkOutDate
      );


    /* =====================================================
       ROOMS BOOKED VALIDATION
    ===================================================== */

    if (
      Number(roomsBooked) < 1
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "At least one room must be booked.",
      });
    }


    /* =====================================================
       GET HOTEL
    ===================================================== */

    const hotel =
      await Hotel.findOne({
        _id: hotelId,
        vendor: vendorId,
      }).session(session);


    if (!hotel) {

      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message:
          "Hotel not found or unauthorized.",
      });
    }


    /* =====================================================
       GET ROOM
    ===================================================== */

    const room =
      await HotelRoom.findOne({
        _id: roomId,
        hotel: hotelId,
        vendor: vendorId,
        isActive: true,
      }).session(session);


    if (!room) {

      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message:
          "Room not found or inactive.",
      });
    }


    /* =====================================================
       CHECK MIN/MAX STAY
    ===================================================== */

    if (
      room.minimumStay &&
      nights < room.minimumStay
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          `Minimum stay is ${room.minimumStay} night(s).`,
      });
    }


    if (
      room.maximumStay &&
      nights > room.maximumStay
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          `Maximum stay is ${room.maximumStay} night(s).`,
      });
    }


    /* =====================================================
       CHECK GUEST CAPACITY
    ===================================================== */

    const adults =
      Number(guest.adults || 0);

    const children =
      Number(guest.children || 0);

    const totalGuests =
      adults + children;


    if (
      room.maxGuests &&
      totalGuests > room.maxGuests
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          `Maximum ${room.maxGuests} guests allowed for this room.`,
      });
    }


    /* =====================================================
       CHECK INVENTORY FOR EVERY NIGHT
    ===================================================== */

    const inventories = [];

    let currentDate =
      new Date(checkInDate);


    while (
      currentDate < checkOutDate
    ) {

      const inventory =
        await HotelInventory.findOne({
          hotel: hotelId,
          room: roomId,
          vendor: vendorId,
          date: currentDate,
        }).session(session);


      if (!inventory) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            `Inventory not available for ${currentDate.toISOString().split("T")[0]}.`,
        });
      }


      if (
        !inventory.isActive ||
        inventory.stopSell ||
        inventory.status !== "OPEN"
      ) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            `Room is not available for ${currentDate.toISOString().split("T")[0]}.`,
        });
      }


      if (
        inventory.availableRooms <
        Number(roomsBooked)
      ) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            `Only ${inventory.availableRooms} room(s) available on ${currentDate.toISOString().split("T")[0]}.`,
        });
      }


      inventories.push(inventory);

      currentDate.setDate(
        currentDate.getDate() + 1
      );
    }


    /* =====================================================
       PRICE CALCULATION
    ===================================================== */

    let roomAmount = 0;

    let totalTaxAmount = 0;

    let totalServiceCharge = 0;


    for (
      const inventory of inventories
    ) {

      const price =
        Number(
          inventory.offerPrice ||
          inventory.basePrice ||
          0
        );


      const nightlyRoomAmount =
        price *
        Number(roomsBooked);


      const nightlyTax =
        nightlyRoomAmount *
        (
          Number(
            inventory.taxPercentage || 0
          ) / 100
        );


      const nightlyServiceCharge =
        nightlyRoomAmount *
        (
          Number(
            inventory.serviceChargePercentage || 0
          ) / 100
        );


      roomAmount +=
        nightlyRoomAmount;

      totalTaxAmount +=
        nightlyTax;

      totalServiceCharge +=
        nightlyServiceCharge;
    }


    /* =====================================================
       EXTRA CHARGES
    ===================================================== */

    const safeExtraGuestAmount =
      Number(extraGuestAmount || 0);

    const safeMealAmount =
      Number(mealAmount || 0);

    const safeDiscountAmount =
      Number(discountAmount || 0);

    const safeCouponDiscount =
      Number(couponDiscount || 0);


    const subtotal =
      roomAmount +
      safeExtraGuestAmount +
      safeMealAmount;


    const totalDiscount =
      safeDiscountAmount +
      safeCouponDiscount;


    const totalAmount =
      Math.max(
        subtotal +
        totalTaxAmount +
        totalServiceCharge -
        totalDiscount,
        0
      );


    /* =====================================================
       COMMISSION
    ===================================================== */

    const safeCommissionPercentage =
      Number(
        commissionPercentage || 0
      );


    const adminCommission =
      totalAmount *
      (
        safeCommissionPercentage / 100
      );


    const vendorAmount =
      Math.max(
        totalAmount -
        adminCommission,
        0
      );


    /* =====================================================
       PAYMENT STATUS
    ===================================================== */

    let paymentStatus =
      "PENDING";


    if (
      paymentMethod ===
        "PAY_AT_HOTEL" ||
      paymentMethod === "CASH"
    ) {

      paymentStatus =
        "PENDING";
    }


    /* =====================================================
       CREATE BOOKING
    ===================================================== */

    const bookingNumber =
      generateBookingNumber();


    const booking =
      await HotelBooking.create(
        [
          {
            hotel: hotelId,

            room: roomId,

            vendor: vendorId,

            bookingNumber,

            guest: {
              name: guest.name,
              email: guest.email,
              phone: guest.phone,
              alternatePhone:
                guest.alternatePhone || "",
              adults,
              children,
              specialRequest:
                guest.specialRequest || "",
            },

            checkIn: checkInDate,

            checkOut: checkOutDate,

            nights,

            roomsBooked:
              Number(roomsBooked),

            roomName:
              room.roomName || "",

            roomType:
              room.roomType || "",

            pricePerNight:
              Number(
                room.offerPrice ||
                room.basePrice ||
                0
              ),

            roomAmount,

            extraGuestAmount:
              safeExtraGuestAmount,

            mealAmount:
              safeMealAmount,

            taxAmount:
              totalTaxAmount,

            serviceCharge:
              totalServiceCharge,

            discountAmount:
              safeDiscountAmount,

            couponDiscount:
              safeCouponDiscount,

            couponCode,

            totalAmount,

            paymentMethod,

            paymentStatus,

            bookingStatus:
              "CONFIRMED",

            commissionPercentage:
              safeCommissionPercentage,

            adminCommission,

            vendorAmount,

            settlementStatus:
              "PENDING",

            source,

            isActive: true,
          },
        ],
        {
          session,
        }
      );


    const createdBooking =
      booking[0];


    /* =====================================================
       UPDATE INVENTORY
    ===================================================== */

    for (
      const inventory of inventories
    ) {

      inventory.bookedRooms +=
        Number(roomsBooked);


      inventory.availableRooms =
        Math.max(
          inventory.totalRooms -
          inventory.bookedRooms -
          inventory.blockedRooms,
          0
        );


      await inventory.save({
        session,
      });
    }


    /* =====================================================
       COMMIT
    ===================================================== */

    await session.commitTransaction();

    session.endSession();


    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(201).json({
      success: true,

      message:
        "Hotel booking created successfully.",

      booking: createdBooking,
    });

  } catch (error) {

    try {
      await session.abortTransaction();
    } catch (e) {}

    session.endSession();

    console.error(
      "CREATE HOTEL BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create hotel booking.",
      error: error.message,
    });
  }
};


/* =========================================================
   GET VENDOR BOOKINGS
   GET /api/hotel-booking
========================================================= */

exports.getVendorBookings = async (
  req,
  res
) => {

  try {

    const vendorId =
      getVendorId(req);


    if (!vendorId) {

      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    const {
      status,
      paymentStatus,
      hotelId,
      page = 1,
      limit = 20,
    } = req.query;


    const query = {
      vendor: vendorId,
    };


    if (status) {
      query.bookingStatus =
        status.toUpperCase();
    }


    if (paymentStatus) {
      query.paymentStatus =
        paymentStatus.toUpperCase();
    }


    if (
      hotelId &&
      isValidObjectId(hotelId)
    ) {

      query.hotel =
        hotelId;
    }


    const skip =
      (
        Number(page) - 1
      ) *
      Number(limit);


    const [
      bookings,
      total,
    ] =
      await Promise.all([

        HotelBooking.find(query)
          .populate(
            "hotel",
            "hotelName city state"
          )
          .populate(
            "room",
            "roomName roomType"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(
            Number(limit)
          ),

        HotelBooking.countDocuments(
          query
        ),
      ]);


    return res.status(200).json({

      success: true,

      count:
        bookings.length,

      total,

      page:
        Number(page),

      pages:
        Math.ceil(
          total /
          Number(limit)
        ),

      bookings,
    });

  } catch (error) {

    console.error(
      "GET HOTEL BOOKINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch hotel bookings.",
      error: error.message,
    });
  }
};


/* =========================================================
   GET SINGLE BOOKING
   GET /api/hotel-booking/:bookingId
========================================================= */

exports.getSingleBooking = async (
  req,
  res
) => {

  try {

    const vendorId =
      getVendorId(req);

    const {
      bookingId,
    } = req.params;


    if (
      !isValidObjectId(
        bookingId
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid booking ID.",
      });
    }


    const booking =
      await HotelBooking.findOne({
        _id: bookingId,
        vendor: vendorId,
      })
        .populate(
          "hotel"
        )
        .populate(
          "room"
        );


    if (!booking) {

      return res.status(404).json({
        success: false,
        message:
          "Booking not found.",
      });
    }


    return res.status(200).json({
      success: true,
      booking,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch booking.",
      error: error.message,
    });
  }
};


/* =========================================================
   CONFIRM BOOKING
   PUT /api/hotel-booking/:bookingId/confirm
========================================================= */

exports.confirmBooking = async (
  req,
  res
) => {

  try {

    const vendorId =
      getVendorId(req);

    const {
      bookingId,
    } = req.params;


    const booking =
      await HotelBooking.findOneAndUpdate(

        {
          _id: bookingId,
          vendor: vendorId,
          bookingStatus: "PENDING",
        },

        {
          $set: {
            bookingStatus:
              "CONFIRMED",
          },
        },

        {
          new: true,
        }
      );


    if (!booking) {

      return res.status(404).json({
        success: false,
        message:
          "Pending booking not found.",
      });
    }


    return res.status(200).json({
      success: true,
      message:
        "Hotel booking confirmed successfully.",
      booking,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Failed to confirm booking.",
      error: error.message,
    });
  }
};


/* =========================================================
   CANCEL BOOKING
   PUT /api/hotel-booking/:bookingId/cancel
========================================================= */

exports.cancelBooking = async (
  req,
  res
) => {

  const session =
    await mongoose.startSession();


  try {

    session.startTransaction();


    const vendorId =
      getVendorId(req);


    const {
      bookingId,
    } = req.params;


    const {
      reason = "Cancelled by vendor",
    } = req.body;


    const booking =
      await HotelBooking.findOne({
        _id: bookingId,
        vendor: vendorId,
      }).session(session);


    if (!booking) {

      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message:
          "Booking not found.",
      });
    }


    if (
      [
        "CANCELLED",
        "CHECKED_OUT",
        "COMPLETED",
      ].includes(
        booking.bookingStatus
      )
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          `Booking cannot be cancelled from ${booking.bookingStatus} status.`,
      });
    }


    /* =====================================================
       RELEASE INVENTORY
    ===================================================== */

    let currentDate =
      new Date(
        booking.checkIn
      );

    const endDate =
      new Date(
        booking.checkOut
      );


    while (
      currentDate < endDate
    ) {

      const inventory =
        await HotelInventory.findOne({
          room: booking.room,
          vendor: vendorId,
          date: currentDate,
        }).session(session);


      if (inventory) {

        inventory.bookedRooms =
          Math.max(
            inventory.bookedRooms -
            booking.roomsBooked,
            0
          );


        inventory.availableRooms =
          Math.max(
            inventory.totalRooms -
            inventory.bookedRooms -
            inventory.blockedRooms,
            0
          );


        await inventory.save({
          session,
        });
      }


      currentDate.setDate(
        currentDate.getDate() + 1
      );
    }


    /* =====================================================
       UPDATE BOOKING
    ===================================================== */

    booking.bookingStatus =
      "CANCELLED";


    booking.cancellation = {

      cancelled: true,

      cancelledBy: "VENDOR",

      cancelledAt:
        new Date(),

      reason,

      refundAmount:
        booking.paymentStatus ===
        "PAID"
          ? booking.totalAmount
          : 0,
    };


    if (
      booking.paymentStatus ===
      "PAID"
    ) {

      booking.paymentStatus =
        "REFUNDED";
    }


    await booking.save({
      session,
    });


    await session.commitTransaction();

    session.endSession();


    return res.status(200).json({
      success: true,
      message:
        "Hotel booking cancelled successfully.",
      booking,
    });

  } catch (error) {

    try {
      await session.abortTransaction();
    } catch (e) {}

    session.endSession();


    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel hotel booking.",
      error: error.message,
    });
  }
};


/* =========================================================
   CHECK-IN
   PUT /api/hotel-booking/:bookingId/check-in
========================================================= */

exports.checkIn = async (
  req,
  res
) => {

  try {

    const vendorId =
      getVendorId(req);

    const {
      bookingId,
    } = req.params;


    const {
      idVerified = false,
      idType = "",
      idNumber = "",
      remarks = "",
    } = req.body;


    const booking =
      await HotelBooking.findOne({
        _id: bookingId,
        vendor: vendorId,
      });


    if (!booking) {

      return res.status(404).json({
        success: false,
        message:
          "Booking not found.",
      });
    }


    if (
      booking.bookingStatus !==
      "CONFIRMED"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Only confirmed bookings can be checked in.",
      });
    }


    booking.bookingStatus =
      "CHECKED_IN";


    booking.checkInDetails = {

      actualCheckIn:
        new Date(),

      actualCheckOut:
        null,

      idVerified:
        Boolean(idVerified),

      idType,

      idNumber,

      remarks,
    };


    await booking.save();


    return res.status(200).json({
      success: true,
      message:
        "Guest checked in successfully.",
      booking,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Failed to check in guest.",
      error: error.message,
    });
  }
};


/* =========================================================
   CHECK-OUT
   PUT /api/hotel-booking/:bookingId/check-out
========================================================= */

exports.checkOut = async (
  req,
  res
) => {

  try {

    const vendorId =
      getVendorId(req);

    const {
      bookingId,
    } = req.params;


    const booking =
      await HotelBooking.findOne({
        _id: bookingId,
        vendor: vendorId,
      });


    if (!booking) {

      return res.status(404).json({
        success: false,
        message:
          "Booking not found.",
      });
    }


    if (
      booking.bookingStatus !==
      "CHECKED_IN"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Guest must be checked in first.",
      });
    }


    booking.bookingStatus =
      "CHECKED_OUT";


    booking.checkInDetails.actualCheckOut =
      new Date();


    await booking.save();


    return res.status(200).json({
      success: true,
      message:
        "Guest checked out successfully.",
      booking,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Failed to check out guest.",
      error: error.message,
    });
  }
};