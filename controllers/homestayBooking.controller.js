const mongoose = require("mongoose");

const Homestay = require("../models/Homestay.model");
const HomestayUnit = require("../models/HomestayUnit.model");
const HomestayInventory = require("../models/HomestayInventory.model");
const HomestayBooking = require("../models/HomestayBooking.model");


/* ============================================================
   HELPERS
============================================================ */

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


const toNumber = (value, defaultValue = 0) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  const number = Number(value);

  return Number.isNaN(number)
    ? defaultValue
    : number;
};


const normalizeDate = (date) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  parsed.setHours(0, 0, 0, 0);

  return parsed;
};


const getDateRange = (
  checkInDate,
  checkOutDate
) => {
  const start =
    normalizeDate(checkInDate);

  const end =
    normalizeDate(checkOutDate);

  if (!start || !end) {
    return [];
  }

  if (end <= start) {
    return [];
  }

  const dates = [];

  const current =
    new Date(start);

  while (current < end) {
    dates.push(
      new Date(current)
    );

    current.setDate(
      current.getDate() + 1
    );
  }

  return dates;
};


const calculateNights = (
  checkInDate,
  checkOutDate
) => {
  const start =
    normalizeDate(checkInDate);

  const end =
    normalizeDate(checkOutDate);

  if (!start || !end) {
    return 0;
  }

  const difference =
    end.getTime() -
    start.getTime();

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24)
  );
};


const round = (number) => {
  return Math.round(
    number * 100
  ) / 100;
};


/* ============================================================
   CALCULATE DISCOUNT
============================================================ */

const calculateDiscount = (
  amount,
  discountType,
  discountValue
) => {
  const value =
    toNumber(
      discountValue,
      0
    );

  if (
    !value ||
    discountType === "none"
  ) {
    return 0;
  }

  if (
    discountType ===
    "percentage"
  ) {
    return round(
      (amount * value) / 100
    );
  }

  if (
    discountType === "flat"
  ) {
    return Math.min(
      value,
      amount
    );
  }

  return 0;
};


/* ============================================================
   CALCULATE BOOKING PRICE
============================================================ */

const calculateBookingPrice = ({
  inventories,
  unit,
  nights,
  unitsBooked,
  adults,
  children,
}) => {

  let roomAmount = 0;

  let totalExtraGuestAmount = 0;

  let totalTaxAmount = 0;

  let totalServiceChargeAmount = 0;


  const maxGuests =
    Number(unit.maxGuests || 0);


  const extraGuests =
    Math.max(
      (
        Number(adults || 0) +
        Number(children || 0)
      ) -
        maxGuests,
      0
    );


  const extraGuestPrice =
    Number(
      unit.extraGuestPrice || 0
    );


  totalExtraGuestAmount =
    round(
      extraGuests *
        extraGuestPrice *
        nights
    );


  inventories.forEach(
    (inventory) => {

      const price =
        Number(
          inventory.finalPrice ||
          inventory.specialPrice ||
          inventory.basePrice ||
          0
        );


      roomAmount +=
        price *
        unitsBooked;


      const tax =
        Number(
          inventory.taxPercentage ||
          0
        );


      const serviceCharge =
        Number(
          inventory.serviceChargePercentage ||
          0
        );


      totalTaxAmount +=
        (
          price *
          unitsBooked *
          tax
        ) / 100;


      totalServiceChargeAmount +=
        (
          price *
          unitsBooked *
          serviceCharge
        ) / 100;
    }
  );


  roomAmount =
    round(roomAmount);


  totalTaxAmount =
    round(totalTaxAmount);


  totalServiceChargeAmount =
    round(
      totalServiceChargeAmount
    );


  const subtotal =
    round(
      roomAmount +
      totalExtraGuestAmount
    );


  const totalAmount =
    round(
      subtotal +
      totalTaxAmount +
      totalServiceChargeAmount
    );


  return {
    roomAmount,

    extraGuestAmount:
      totalExtraGuestAmount,

    extraBedAmount: 0,

    mealAmount: 0,

    discountAmount: 0,

    couponDiscount: 0,

    subtotal,

    taxAmount:
      totalTaxAmount,

    serviceChargeAmount:
      totalServiceChargeAmount,

    totalAmount,
  };
};


/* ============================================================
   CHECK VENDOR HOMESTAY
============================================================ */

const findVendorHomestay = async (
  homestayId,
  vendorId
) => {
  return Homestay.findOne({
    _id: homestayId,
    vendor: vendorId,
  });
};


/* ============================================================
   CREATE BOOKING
============================================================ */

exports.createBooking = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {

    const userId =
      req.user?._id ||
      req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required.",
      });
    }


    const {
      homestayId,
      unitId,

      checkInDate,
      checkOutDate,

      adults,
      children,
      infants,

      guestName,
      guestEmail,
      guestPhone,
      alternatePhone,

      guestNames,

      specialRequest,

      unitsBooked = 1,

      paymentMethod =
        "ONLINE",

      bookingSource =
        "WEBSITE",
    } = req.body;


    /* ========================================================
       VALIDATION
    ======================================================== */

    if (!homestayId) {
      return res.status(400).json({
        success: false,
        message:
          "Homestay ID is required.",
      });
    }


    if (!unitId) {
      return res.status(400).json({
        success: false,
        message:
          "Unit ID is required.",
      });
    }


    if (!checkInDate) {
      return res.status(400).json({
        success: false,
        message:
          "Check-in date is required.",
      });
    }


    if (!checkOutDate) {
      return res.status(400).json({
        success: false,
        message:
          "Check-out date is required.",
      });
    }


    if (
      !isValidObjectId(
        homestayId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid homestay ID.",
      });
    }


    if (
      !isValidObjectId(
        unitId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid unit ID.",
      });
    }


    const checkIn =
      normalizeDate(
        checkInDate
      );


    const checkOut =
      normalizeDate(
        checkOutDate
      );


    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid check-in or check-out date.",
      });
    }


    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message:
          "Check-out date must be after check-in date.",
      });
    }


    const nights =
      calculateNights(
        checkIn,
        checkOut
      );


    if (nights <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid number of nights.",
      });
    }


    const requestedUnits =
      Math.max(
        Number(unitsBooked) || 1,
        1
      );


    const requestedAdults =
      Math.max(
        Number(adults) || 1,
        1
      );


    const requestedChildren =
      Math.max(
        Number(children) || 0,
        0
      );


    /* ========================================================
       START TRANSACTION
    ======================================================== */

    session.startTransaction();


    /* ========================================================
       FIND HOMESTAY
    ======================================================== */

    const homestay =
      await Homestay.findById(
        homestayId
      ).session(session);


    if (!homestay) {

      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message:
          "Homestay not found.",
      });
    }


    if (
      !homestay.isActive
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Homestay is currently inactive.",
      });
    }


    if (
      homestay.status !==
        "APPROVED" &&
      homestay.status !==
        "PENDING"
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Homestay is not available for booking.",
      });
    }


    /* ========================================================
       FIND UNIT
    ======================================================== */

    const unit =
      await HomestayUnit.findOne({
        _id: unitId,
        homestay: homestayId,
      }).session(session);


    if (!unit) {

      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message:
          "Homestay unit not found.",
      });
    }


    if (
      !unit.isActive
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "This unit is currently inactive.",
      });
    }


    if (
      unit.status !== "ACTIVE"
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "This unit is not available for booking.",
      });
    }


    /* ========================================================
       CHECK GUEST CAPACITY
    ======================================================== */

    const totalGuests =
      requestedAdults +
      requestedChildren;


    if (
      unit.maxGuests > 0 &&
      totalGuests >
        unit.maxGuests *
          requestedUnits
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          `Maximum ${unit.maxGuests} guests are allowed per unit.`,
      });
    }


    /* ========================================================
       GET INVENTORY
    ======================================================== */

    const dates =
      getDateRange(
        checkIn,
        checkOut
      );


    const inventories =
      await HomestayInventory.find({
        homestay:
          homestayId,

        unit:
          unitId,

        vendor:
          homestay.vendor,

        date: {
          $gte: dates[0],
          $lte:
            dates[
              dates.length - 1
            ],
        },
      })
        .sort({
          date: 1,
        })
        .session(session);


    /* ========================================================
       INVENTORY COUNT CHECK
    ======================================================== */

    if (
      inventories.length !==
      dates.length
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Inventory is not available for all selected dates.",
      });
    }


    /* ========================================================
       CHECK EVERY DATE
    ======================================================== */

    for (
      const inventory
      of inventories
    ) {

      if (
        inventory.isBlocked
      ) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,

          message:
            `Inventory is blocked for ${inventory.date.toISOString().split("T")[0]}.`,
        });
      }


      if (
        inventory.stopSell
      ) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,

          message:
            `Booking is stopped for ${inventory.date.toISOString().split("T")[0]}.`,
        });
      }


      if (
        inventory.closedForBooking
      ) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,

          message:
            `Booking is closed for ${inventory.date.toISOString().split("T")[0]}.`,
        });
      }


      if (
        !inventory.isAvailable
      ) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,

          message:
            `Unit is unavailable for ${inventory.date.toISOString().split("T")[0]}.`,
        });
      }


      if (
        inventory.availableUnits <
        requestedUnits
      ) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,

          message:
            `Only ${inventory.availableUnits} unit(s) available for ${inventory.date.toISOString().split("T")[0]}.`,
        });
      }


      if (
        inventory.minimumStay >
        nights
      ) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,

          message:
            `Minimum stay is ${inventory.minimumStay} night(s).`,
        });
      }


      if (
        inventory.maximumStay > 0 &&
        nights >
          inventory.maximumStay
      ) {

        await session.abortTransaction();

        return res.status(400).json({
          success: false,

          message:
            `Maximum stay is ${inventory.maximumStay} night(s).`,
        });
      }
    }


    /* ========================================================
       CALCULATE PRICE
    ======================================================== */

    const price =
      calculateBookingPrice({
        inventories,

        unit,

        nights,

        unitsBooked:
          requestedUnits,

        adults:
          requestedAdults,

        children:
          requestedChildren,
      });


    /* ========================================================
       ADMIN COMMISSION
    ======================================================== */

    const commissionPercentage =
      0;


    const commissionAmount =
      round(
        (
          price.totalAmount *
          commissionPercentage
        ) / 100
      );


    const vendorAmount =
      round(
        price.totalAmount -
        commissionAmount
      );


    /* ========================================================
       PAYMENT STATUS
    ======================================================== */

    const onlinePaymentMethods = [
      "ONLINE",
      "UPI",
      "CARD",
      "NET_BANKING",
    ];


    const paymentStatus =
      onlinePaymentMethods.includes(
        paymentMethod
      )
        ? "PENDING"
        : "PENDING";


    /* ========================================================
       CREATE BOOKING
    ======================================================== */

    const booking =
      new HomestayBooking({
        user:
          userId,

        guestName:
          guestName ||
          "Guest",

        guestEmail:
          guestEmail ||
          "",

        guestPhone:
          guestPhone ||
          "",

        alternatePhone:
          alternatePhone ||
          "",


        homestay:
          homestayId,

        unit:
          unitId,

        inventory:
          inventories[0]?._id ||
          null,

        vendor:
          homestay.vendor,


        checkInDate:
          checkIn,

        checkOutDate:
          checkOut,

        nights,

        unitsBooked:
          requestedUnits,


        adults:
          requestedAdults,

        children:
          requestedChildren,

        infants:
          Number(infants) || 0,

        totalGuests,

        guestNames:
          Array.isArray(
            guestNames
          )
            ? guestNames
            : [],


        specialRequest:
          specialRequest ||
          "",


        pricePerNight:
          unit.basePrice ||
          0,

        roomAmount:
          price.roomAmount,

        extraGuestAmount:
          price.extraGuestAmount,

        extraBedAmount:
          price.extraBedAmount,

        mealAmount:
          price.mealAmount,

        discountAmount:
          price.discountAmount,

        couponDiscount:
          price.couponDiscount,

        subtotal:
          price.subtotal,


        taxPercentage:
          inventories[0]
            ?.taxPercentage ||
          0,

        taxAmount:
          price.taxAmount,


        serviceChargePercentage:
          inventories[0]
            ?.serviceChargePercentage ||
          0,

        serviceChargeAmount:
          price.serviceChargeAmount,


        totalAmount:
          price.totalAmount,


        paymentMethod:
          paymentMethod,

        paymentStatus:
          paymentStatus,


        bookingStatus:
          "PENDING",

        vendorConfirmation:
          "PENDING",


        adminCommissionType:
          "PERCENTAGE",

        adminCommissionPercentage:
          commissionPercentage,

        adminCommissionAmount:
          commissionAmount,

        vendorAmount:
          vendorAmount,


        settlementStatus:
          "PENDING",


        bookingSource:
          bookingSource,
      });


    await booking.save({
      session,
    });


    /* ========================================================
       RESERVE INVENTORY
    ======================================================== */

    for (
      const inventory
      of inventories
    ) {

      const updated =
        await HomestayInventory.findOneAndUpdate(
          {
            _id:
              inventory._id,

            availableUnits: {
              $gte:
                requestedUnits,
            },

            isAvailable:
              true,

            isBlocked:
              false,

            stopSell:
              false,

            closedForBooking:
              false,
          },

          {
            $inc: {
              availableUnits:
                -requestedUnits,

              bookedUnits:
                requestedUnits,

              totalBookings:
                1,
            },

            $set: {
              lastUpdatedAt:
                new Date(),
            },
          },

          {
            new: true,

            session,
          }
        );


      if (!updated) {

        await session.abortTransaction();

        return res.status(409).json({
          success: false,

          message:
            "Room availability changed. Please search again.",
        });
      }
    }


    /* ========================================================
       COMMIT
    ======================================================== */

    await session.commitTransaction();


    return res.status(201).json({
      success: true,

      message:
        "Homestay booking created successfully.",

      booking,
    });

  } catch (error) {

    await session.abortTransaction();

    console.error(
      "Create Homestay Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to create homestay booking.",

      error:
        error.message,
    });

  } finally {

    session.endSession();
  }
};


/* ============================================================
   GET USER BOOKINGS
============================================================ */

exports.getMyBookings = async (
  req,
  res
) => {
  try {

    const userId =
      req.user?._id ||
      req.user?.id;


    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required.",
      });
    }


    const bookings =
      await HomestayBooking.find({
        user:
          userId,
      })
        .populate(
          "homestay",
          "propertyName city state coverImage averageRating"
        )
        .populate(
          "unit",
          "unitName unitType coverImage"
        )
        .sort({
          createdAt: -1,
        });


    return res.status(200).json({
      success: true,

      count:
        bookings.length,

      bookings,
    });

  } catch (error) {

    console.error(
      "Get My Bookings Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch bookings.",

      error:
        error.message,
    });
  }
};


/* ============================================================
   GET SINGLE USER BOOKING
============================================================ */

exports.getMyBookingById =
  async (
    req,
    res
  ) => {
    try {

      const userId =
        req.user?._id ||
        req.user?.id;


      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "User authentication required.",
        });
      }


      const booking =
        await HomestayBooking.findOne({
          _id:
            req.params.bookingId,

          user:
            userId,
        })
          .populate(
            "homestay"
          )
          .populate(
            "unit"
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

      console.error(
        "Get Booking Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch booking.",

        error:
          error.message,
      });
    }
  };


/* ============================================================
   GET VENDOR BOOKINGS
============================================================ */

exports.getVendorBookings =
  async (
    req,
    res
  ) => {
    try {

      const vendorId =
        req.vendor?._id;


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
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = req.query;


      const filter = {
        vendor:
          vendorId,
      };


      if (status) {
        filter.bookingStatus =
          status;
      }


      if (paymentStatus) {
        filter.paymentStatus =
          paymentStatus;
      }


      if (
        startDate &&
        endDate
      ) {

        const start =
          normalizeDate(
            startDate
          );

        const end =
          normalizeDate(
            endDate
          );


        if (
          !start ||
          !end
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid date range.",
          });
        }


        end.setHours(
          23,
          59,
          59,
          999
        );


        filter.checkInDate = {
          $gte: start,
          $lte: end,
        };
      }


      const pageNumber =
        Math.max(
          Number(page) || 1,
          1
        );


      const limitNumber =
        Math.min(
          Math.max(
            Number(limit) || 20,
            1
          ),
          100
        );


      const skip =
        (
          pageNumber - 1
        ) *
        limitNumber;


      const [
        bookings,
        total,
      ] = await Promise.all([
        HomestayBooking.find(
          filter
        )
          .populate(
            "homestay",
            "propertyName city state coverImage"
          )
          .populate(
            "unit",
            "unitName unitType"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber),

        HomestayBooking.countDocuments(
          filter
        ),
      ]);


      return res.status(200).json({
        success: true,

        pagination: {
          total,

          page:
            pageNumber,

          limit:
            limitNumber,

          totalPages:
            Math.ceil(
              total /
                limitNumber
            ),
        },

        bookings,
      });

    } catch (error) {

      console.error(
        "Get Vendor Bookings Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch vendor bookings.",

        error:
          error.message,
      });
    }
  };


/* ============================================================
   GET VENDOR SINGLE BOOKING
============================================================ */

exports.getVendorBookingById =
  async (
    req,
    res
  ) => {
    try {

      const vendorId =
        req.vendor?._id;


      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required.",
        });
      }


      const booking =
        await HomestayBooking.findOne({
          _id:
            req.params.bookingId,

          vendor:
            vendorId,
        })
          .populate(
            "homestay"
          )
          .populate(
            "unit"
          )
          .populate(
            "user",
            "-password"
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

      console.error(
        "Get Vendor Booking Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch booking.",

        error:
          error.message,
      });
    }
  };


/* ============================================================
   CONFIRM BOOKING
============================================================ */

exports.confirmBooking =
  async (
    req,
    res
  ) => {
    try {

      const vendorId =
        req.vendor?._id;


      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required.",
        });
      }


      const booking =
        await HomestayBooking.findOne({
          _id:
            req.params.bookingId,

          vendor:
            vendorId,
        });


      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found.",
        });
      }


      if (
        booking.bookingStatus ===
        "CANCELLED"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cancelled booking cannot be confirmed.",
        });
      }


      if (
        booking.bookingStatus ===
        "COMPLETED"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Completed booking cannot be confirmed.",
        });
      }


      booking.bookingStatus =
        "CONFIRMED";

      booking.vendorConfirmation =
        "CONFIRMED";

      booking.vendorConfirmedAt =
        new Date();


      await booking.save();


      return res.status(200).json({
        success: true,

        message:
          "Booking confirmed successfully.",

        booking,
      });

    } catch (error) {

      console.error(
        "Confirm Booking Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to confirm booking.",

        error:
          error.message,
      });
    }
  };


/* ============================================================
   REJECT BOOKING
============================================================ */

exports.rejectBooking =
  async (
    req,
    res
  ) => {
    const session =
      await mongoose.startSession();

    try {

      const vendorId =
        req.vendor?._id;


      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required.",
        });
      }


      const {
        reason,
      } = req.body;


      session.startTransaction();


      const booking =
        await HomestayBooking.findOne({
          _id:
            req.params.bookingId,

          vendor:
            vendorId,
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
          "CHECKED_IN",
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
            "This booking cannot be rejected.",
        });
      }


      /* ======================================================
         RESTORE INVENTORY
      ====================================================== */

      const inventories =
        await HomestayInventory.find({
          homestay:
            booking.homestay,

          unit:
            booking.unit,

          vendor:
            vendorId,

          date: {
            $gte:
              normalizeDate(
                booking.checkInDate
              ),

            $lt:
              normalizeDate(
                booking.checkOutDate
              ),
          },
        }).session(session);


      for (
        const inventory
        of inventories
      ) {

        inventory.bookedUnits =
          Math.max(
            inventory.bookedUnits -
              booking.unitsBooked,
            0
          );


        inventory.availableUnits =
          Math.min(
            inventory.availableUnits +
              booking.unitsBooked,

            inventory.totalUnits
          );


        inventory.isAvailable =
          inventory.availableUnits >
            0 &&
          !inventory.isBlocked &&
          !inventory.stopSell &&
          !inventory.closedForBooking;


        await inventory.save({
          session,
        });
      }


      booking.bookingStatus =
        "REJECTED";

      booking.vendorConfirmation =
        "REJECTED";

      booking.vendorRejectionReason =
        reason ||
        "Booking rejected by vendor";


      await booking.save({
        session,
      });


      await session.commitTransaction();


      return res.status(200).json({
        success: true,

        message:
          "Booking rejected and inventory restored.",

        booking,
      });

    } catch (error) {

      await session.abortTransaction();

      console.error(
        "Reject Booking Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to reject booking.",

        error:
          error.message,
      });

    } finally {

      session.endSession();
    }
  };


/* ============================================================
   CANCEL BOOKING BY USER
============================================================ */

exports.cancelBooking =
  async (
    req,
    res
  ) => {

    const session =
      await mongoose.startSession();

    try {

      const userId =
        req.user?._id ||
        req.user?.id;


      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "User authentication required.",
        });
      }


      const booking =
        await HomestayBooking.findOne({
          _id:
            req.params.bookingId,

          user:
            userId,
        });


      if (!booking) {
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
        return res.status(400).json({
          success: false,
          message:
            "Booking cannot be cancelled.",
        });
      }


      const {
        reason,
      } = req.body;


      session.startTransaction();


      /* ======================================================
         RESTORE INVENTORY
      ====================================================== */

      const inventories =
        await HomestayInventory.find({
          homestay:
            booking.homestay,

          unit:
            booking.unit,

          vendor:
            booking.vendor,

          date: {
            $gte:
              normalizeDate(
                booking.checkInDate
              ),

            $lt:
              normalizeDate(
                booking.checkOutDate
              ),
          },
        }).session(session);


      for (
        const inventory
        of inventories
      ) {

        inventory.bookedUnits =
          Math.max(
            inventory.bookedUnits -
              booking.unitsBooked,
            0
          );


        inventory.availableUnits =
          Math.min(
            inventory.availableUnits +
              booking.unitsBooked,

            inventory.totalUnits
          );


        inventory.isAvailable =
          inventory.availableUnits >
            0 &&
          !inventory.isBlocked &&
          !inventory.stopSell &&
          !inventory.closedForBooking;


        await inventory.save({
          session,
        });
      }


      booking.bookingStatus =
        "CANCELLED";

      booking.cancelledBy =
        "USER";

      booking.cancelledAt =
        new Date();

      booking.cancellationRequested =
        true;

      booking.cancellationReason =
        reason ||
        "Cancelled by customer";


      /* ======================================================
         REFUND
      ====================================================== */

      if (
        booking.paymentStatus ===
        "PAID"
      ) {

        booking.refundAmount =
          booking.totalAmount;

        booking.refundStatus =
          "PENDING";

        booking.paymentStatus =
          "REFUND_PENDING";
      }


      await booking.save({
        session,
      });


      await session.commitTransaction();


      return res.status(200).json({
        success: true,

        message:
          "Booking cancelled successfully.",

        booking,
      });

    } catch (error) {

      await session.abortTransaction();

      console.error(
        "Cancel Booking Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to cancel booking.",

        error:
          error.message,
      });

    } finally {

      session.endSession();
    }
  };


/* ============================================================
   CHECK-IN
============================================================ */

exports.checkIn =
  async (
    req,
    res
  ) => {
    try {

      const vendorId =
        req.vendor?._id;


      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required.",
        });
      }


      const booking =
        await HomestayBooking.findOne({
          _id:
            req.params.bookingId,

          vendor:
            vendorId,
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

      booking.actualCheckInAt =
        new Date();

      booking.checkInBy =
        vendorId.toString();


      await booking.save();


      return res.status(200).json({
        success: true,

        message:
          "Guest checked in successfully.",

        booking,
      });

    } catch (error) {

      console.error(
        "Check In Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to check in guest.",

        error:
          error.message,
      });
    }
  };


/* ============================================================
   CHECK-OUT
============================================================ */

exports.checkOut =
  async (
    req,
    res
  ) => {
    try {

      const vendorId =
        req.vendor?._id;


      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required.",
        });
      }


      const booking =
        await HomestayBooking.findOne({
          _id:
            req.params.bookingId,

          vendor:
            vendorId,
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
            "Guest must be checked in before checkout.",
        });
      }


      booking.bookingStatus =
        "CHECKED_OUT";

      booking.actualCheckOutAt =
        new Date();

      booking.checkOutBy =
        vendorId.toString();


      await booking.save();


      return res.status(200).json({
        success: true,

        message:
          "Guest checked out successfully.",

        booking,
      });

    } catch (error) {

      console.error(
        "Check Out Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to check out guest.",

        error:
          error.message,
      });
    }
  };


/* ============================================================
   MARK COMPLETED
============================================================ */

exports.completeBooking =
  async (
    req,
    res
  ) => {
    try {

      const vendorId =
        req.vendor?._id;


      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required.",
        });
      }


      const booking =
        await HomestayBooking.findOne({
          _id:
            req.params.bookingId,

          vendor:
            vendorId,
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
        "CHECKED_OUT"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Only checked-out bookings can be completed.",
        });
      }


      booking.bookingStatus =
        "COMPLETED";


      await booking.save();


      return res.status(200).json({
        success: true,

        message:
          "Booking completed successfully.",

        booking,
      });

    } catch (error) {

      console.error(
        "Complete Booking Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to complete booking.",

        error:
          error.message,
      });
    }
  };