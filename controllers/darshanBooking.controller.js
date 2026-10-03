const mongoose = require("mongoose");

const Darshan = require("../models/Darshan.model");
const DarshanType = require("../models/DarshanType.model");
const DarshanSlot = require("../models/DarshanSlot.model");
const DarshanSlotAvailability = require(
  "../models/DarshanSlotAvailability.model"
);
const DarshanBooking = require("../models/DarshanBooking.model");

// =====================================================
// COMMON HELPERS
// =====================================================

// Vendor ID nikalne ke liye
const getVendorId = (req) => {
  return (
    req.user?.vendorId ||
    req.user?._id ||
    req.user?.id ||
    req.vendor?._id ||
    req.vendor?.id
  );
};

// Booking ID generate
const generateBookingId = () => {
  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `DAR-${Date.now()}-${random}`;
};

// =====================================================
// USER
// CREATE DARSHAN BOOKING
// =====================================================

exports.createDarshanBooking = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const {
      availabilityId,
      bookingDate,
      adultCount,
      childCount,
      seniorCitizenCount,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (
      !availabilityId ||
      !bookingDate ||
      !customerName ||
      !customerEmail ||
      !customerPhone
    ) {
      return res.status(400).json({
        success: false,
        message:
          "availabilityId, bookingDate, customerName, customerEmail and customerPhone are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(availabilityId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid availabilityId",
      });
    }

    // =================================================
    // PERSON COUNT
    // =================================================

    const adults = Number(adultCount || 0);
    const children = Number(childCount || 0);
    const seniors = Number(
      seniorCitizenCount || 0
    );

    if (
      !Number.isInteger(adults) ||
      !Number.isInteger(children) ||
      !Number.isInteger(seniors)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Person counts must be valid numbers",
      });
    }

    if (
      adults < 0 ||
      children < 0 ||
      seniors < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Person counts cannot be negative",
      });
    }

    const totalPersons =
      adults + children + seniors;

    if (totalPersons < 1) {
      return res.status(400).json({
        success: false,
        message:
          "At least one person is required",
      });
    }

    // =================================================
    // FIND AVAILABILITY
    // =================================================

    const availability =
      await DarshanSlotAvailability.findById(
        availabilityId
      );

    if (!availability) {
      return res.status(404).json({
        success: false,
        message:
          "Darshan slot availability not found",
      });
    }

    // =================================================
    // AVAILABILITY CHECK
    // =================================================

    if (!availability.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "This darshan slot availability is inactive",
      });
    }

    if (!availability.isBookable) {
      return res.status(400).json({
        success: false,
        message:
          "This darshan slot is currently not bookable",
      });
    }

    if (availability.isBlocked) {
      return res.status(400).json({
        success: false,
        message:
          availability.blockedReason ||
          "This darshan slot is blocked",
      });
    }

    if (availability.isSoldOut) {
      return res.status(400).json({
        success: false,
        message:
          "Darshan slot is sold out",
      });
    }

    // =================================================
    // CAPACITY CHECK
    // =================================================

    if (
      totalPersons >
      availability.availableCapacity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Not enough darshan capacity available",
        availableCapacity:
          availability.availableCapacity,
      });
    }

    // =================================================
    // MAX PERSONS PER BOOKING
    // =================================================

    if (
      availability.maxPersonsPerBooking &&
      totalPersons >
        availability.maxPersonsPerBooking
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Maximum ${availability.maxPersonsPerBooking} persons allowed per booking`,
      });
    }

    // =================================================
    // FIND DARSHAN
    // =================================================

    const darshan = await Darshan.findById(
      availability.darshanId
    );

    if (!darshan) {
      return res.status(404).json({
        success: false,
        message: "Darshan not found",
      });
    }

    if (!darshan.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "Darshan is currently inactive",
      });
    }

    // =================================================
    // FIND DARSHAN TYPE
    // =================================================

    const darshanType =
      await DarshanType.findById(
        availability.darshanTypeId
      );

    if (!darshanType) {
      return res.status(404).json({
        success: false,
        message:
          "Darshan type not found",
      });
    }

    if (!darshanType.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "Darshan type is inactive",
      });
    }

    // =================================================
    // FIND SLOT
    // =================================================

    const slot = await DarshanSlot.findById(
      availability.slotId
    );

    if (!slot) {
      return res.status(404).json({
        success: false,
        message:
          "Darshan slot not found",
      });
    }

    if (!slot.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "Darshan slot is inactive",
      });
    }

    // =================================================
    // BOOKING DATE
    // =================================================

    const selectedDate =
      new Date(bookingDate);

    if (
      isNaN(selectedDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking date",
      });
    }

    // =================================================
    // PRICE CALCULATION
    // =================================================

    const adultPrice = Number(
      availability.adultPrice || 0
    );

    const childPrice = Number(
      availability.childPrice || 0
    );

    const seniorCitizenPrice =
      Number(
        availability.seniorCitizenPrice || 0
      );

    const adultAmount =
      adults * adultPrice;

    const childAmount =
      children * childPrice;

    const seniorCitizenAmount =
      seniors * seniorCitizenPrice;

    const totalAmount =
      adultAmount +
      childAmount +
      seniorCitizenAmount;

    // =================================================
    // CREATE BOOKING
    // =================================================

    const booking =
      await DarshanBooking.create({
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
          availability.vendorId,

        darshanId:
          availability.darshanId,

        darshanTypeId:
          availability.darshanTypeId,

        slotId:
          availability.slotId,

        availabilityId:
          availability._id,

        bookingDate:
          selectedDate,

        adultCount: adults,

        childCount: children,

        seniorCitizenCount: seniors,

        totalPersons,

        adultPrice,

        childPrice,

        seniorCitizenPrice,

        adultAmount,

        childAmount,

        seniorCitizenAmount,

        totalAmount,

        currency:
          availability.currency || "INR",

        bookingId:
          generateBookingId(),

        bookingStatus: "pending",

        paymentStatus: "pending",

        paymentMethod: "razorpay",
      });

    // =================================================
    // UPDATE AVAILABILITY
    // =================================================

    availability.availableCapacity -=
      totalPersons;

    availability.bookedCapacity +=
      totalPersons;

    availability.isSoldOut =
      availability.availableCapacity <= 0;

    await availability.save();

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,
      message:
        "Darshan booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error(
      "CREATE DARSHAN BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// USER
// GET MY DARSHAN BOOKINGS
// =====================================================

exports.getMyDarshanBookings = async (
  req,
  res
) => {
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
      await DarshanBooking.find({
        userId,
      })
        .populate(
          "darshanId",
          "name templeName deityName city state mainImage"
        )
        .populate(
          "darshanTypeId",
          "name type image"
        )
        .populate(
          "slotId",
          "name startTime endTime"
        )
        .populate(
          "availabilityId",
          "date totalCapacity availableCapacity"
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
      "GET MY DARSHAN BOOKINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// USER
// GET SINGLE BOOKING
// =====================================================

exports.getDarshanBookingById =
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

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid booking ID",
        });
      }

      const booking =
        await DarshanBooking.findOne({
          _id: req.params.id,
          userId,
        })
          .populate(
            "darshanId",
            "name templeName deityName address city state pincode mainImage"
          )
          .populate(
            "darshanTypeId",
            "name type image"
          )
          .populate(
            "slotId",
            "name startTime endTime"
          )
          .populate(
            "availabilityId",
            "date totalCapacity availableCapacity"
          );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Darshan booking not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      console.error(
        "GET DARSHAN BOOKING ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// USER
// CANCEL BOOKING
// =====================================================

exports.cancelDarshanBooking =
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

      const booking =
        await DarshanBooking.findOne({
          _id: req.params.id,
          userId,
        });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Darshan booking not found",
        });
      }

      if (
        booking.bookingStatus ===
          "cancelled" ||
        booking.bookingStatus ===
          "completed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Booking cannot be cancelled",
        });
      }

      // =================================================
      // RESTORE CAPACITY
      // =================================================

      const availability =
        await DarshanSlotAvailability.findById(
          booking.availabilityId
        );

      if (availability) {
        availability.availableCapacity +=
          booking.totalPersons;

        availability.bookedCapacity -=
          booking.totalPersons;

        if (
          availability.bookedCapacity < 0
        ) {
          availability.bookedCapacity = 0;
        }

        if (
          availability.availableCapacity >
          availability.totalCapacity
        ) {
          availability.availableCapacity =
            availability.totalCapacity;
        }

        availability.isSoldOut = false;

        await availability.save();
      }

      // =================================================
      // UPDATE BOOKING
      // =================================================

      booking.bookingStatus =
        "cancelled";

      booking.cancelledAt =
        new Date();

      booking.cancellationReason =
        req.body?.reason ||
        "Cancelled by customer";

      await booking.save();

      return res.status(200).json({
        success: true,
        message:
          "Darshan booking cancelled successfully",
        data: booking,
      });
    } catch (error) {
      console.error(
        "CANCEL DARSHAN BOOKING ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// VENDOR
// GET ALL DARSHAN BOOKINGS
// =====================================================

exports.getVendorDarshanBookings =
  async (req, res) => {
    try {
      const vendorId = getVendorId(req);

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required",
        });
      }

      const {
        status,
        paymentStatus,
        entryStatus,
        darshanId,
        darshanTypeId,
        slotId,
        availabilityId,
        bookingDate,
        page = 1,
        limit = 10,
      } = req.query;

      const filter = {
        vendorId,
      };

      // Filters
      if (status) {
        filter.bookingStatus = status;
      }

      if (paymentStatus) {
        filter.paymentStatus =
          paymentStatus;
      }

      if (entryStatus) {
        filter.entryStatus =
          entryStatus;
      }

      if (darshanId) {
        filter.darshanId = darshanId;
      }

      if (darshanTypeId) {
        filter.darshanTypeId =
          darshanTypeId;
      }

      if (slotId) {
        filter.slotId = slotId;
      }

      if (availabilityId) {
        filter.availabilityId =
          availabilityId;
      }

      // =================================================
      // DATE FILTER
      // =================================================

      if (bookingDate) {
        const startDate =
          new Date(bookingDate);

        if (
          !isNaN(startDate.getTime())
        ) {
          const endDate =
            new Date(startDate);

          endDate.setDate(
            endDate.getDate() + 1
          );

          filter.bookingDate = {
            $gte: startDate,
            $lt: endDate,
          };
        }
      }

      // =================================================
      // PAGINATION
      // =================================================

      const pageNumber = Math.max(
        Number(page) || 1,
        1
      );

      const limitNumber = Math.min(
        Math.max(Number(limit) || 10, 1),
        100
      );

      const skip =
        (pageNumber - 1) *
        limitNumber;

      // =================================================
      // QUERY
      // =================================================

      const [bookings, total] =
        await Promise.all([
          DarshanBooking.find(filter)
            .populate(
              "userId",
              "name email phone"
            )
            .populate(
              "darshanId",
              "name templeName deityName city state mainImage"
            )
            .populate(
              "darshanTypeId",
              "name type image"
            )
            .populate(
              "slotId",
              "name startTime endTime"
            )
            .populate(
              "availabilityId",
              "date totalCapacity availableCapacity bookedCapacity"
            )
            .sort({
              createdAt: -1,
            })
            .skip(skip)
            .limit(limitNumber),

          DarshanBooking.countDocuments(
            filter
          ),
        ]);

      return res.status(200).json({
        success: true,
        count: bookings.length,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(
          total / limitNumber
        ),
        data: bookings,
      });
    } catch (error) {
      console.error(
        "GET VENDOR DARSHAN BOOKINGS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// VENDOR
// GET SINGLE BOOKING
// =====================================================

exports.getVendorDarshanBookingById =
  async (req, res) => {
    try {
      const vendorId = getVendorId(req);

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid booking ID",
        });
      }

      const booking =
        await DarshanBooking.findOne({
          _id: req.params.id,
          vendorId,
        })
          .populate(
            "userId",
            "name email phone"
          )
          .populate(
            "darshanId",
            "name templeName deityName address city state pincode mainImage"
          )
          .populate(
            "darshanTypeId",
            "name type image"
          )
          .populate(
            "slotId",
            "name startTime endTime"
          )
          .populate(
            "availabilityId",
            "date totalCapacity availableCapacity bookedCapacity"
          );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Darshan booking not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      console.error(
        "GET VENDOR DARSHAN BOOKING ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// VENDOR
// UPDATE BOOKING / PAYMENT STATUS
// =====================================================

exports.updateVendorDarshanBookingStatus =
  async (req, res) => {
    try {
      const vendorId = getVendorId(req);

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required",
        });
      }

      const {
        bookingStatus,
        paymentStatus,
      } = req.body;

      const allowedBookingStatuses = [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "refunded",
      ];

      const allowedPaymentStatuses = [
        "pending",
        "paid",
        "failed",
        "refunded",
      ];

      if (
        bookingStatus &&
        !allowedBookingStatuses.includes(
          bookingStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid bookingStatus",
        });
      }

      if (
        paymentStatus &&
        !allowedPaymentStatuses.includes(
          paymentStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid paymentStatus",
        });
      }

      if (
        !bookingStatus &&
        !paymentStatus
      ) {
        return res.status(400).json({
          success: false,
          message:
            "bookingStatus or paymentStatus is required",
        });
      }

      const booking =
        await DarshanBooking.findOne({
          _id: req.params.id,
          vendorId,
        });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Darshan booking not found",
        });
      }

      if (bookingStatus) {
        booking.bookingStatus =
          bookingStatus;
      }

      if (paymentStatus) {
        booking.paymentStatus =
          paymentStatus;
      }

      await booking.save();

      return res.status(200).json({
        success: true,
        message:
          "Darshan booking status updated successfully",
        data: booking,
      });
    } catch (error) {
      console.error(
        "UPDATE VENDOR DARSHAN BOOKING STATUS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// VENDOR
// CHECK-IN
// =====================================================

exports.checkInDarshanBooking =
  async (req, res) => {
    try {
      const vendorId = getVendorId(req);

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required",
        });
      }

      const booking =
        await DarshanBooking.findOne({
          _id: req.params.id,
          vendorId,
        });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Darshan booking not found",
        });
      }

      if (
        booking.paymentStatus !== "paid"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment is not completed",
        });
      }

      if (
        booking.bookingStatus !==
        "confirmed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Booking must be confirmed before check-in",
        });
      }

      if (
        booking.entryStatus ===
        "checked_in"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Customer is already checked in",
        });
      }

      booking.entryStatus =
        "checked_in";

      booking.checkedInAt =
        new Date();

      booking.bookingStatus =
        "completed";

      await booking.save();

      return res.status(200).json({
        success: true,
        message:
          "Customer checked in successfully",
        data: booking,
      });
    } catch (error) {
      console.error(
        "DARSHAN CHECK-IN ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// VENDOR
// REJECT ENTRY
// =====================================================

exports.rejectDarshanBookingEntry =
  async (req, res) => {
    try {
      const vendorId = getVendorId(req);

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required",
        });
      }

      const booking =
        await DarshanBooking.findOne({
          _id: req.params.id,
          vendorId,
        });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Darshan booking not found",
        });
      }

      if (
        booking.entryStatus ===
        "checked_in"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Customer is already checked in",
        });
      }

      booking.entryStatus =
        "rejected";

      await booking.save();

      return res.status(200).json({
        success: true,
        message:
          "Darshan booking entry rejected",
        data: booking,
      });
    } catch (error) {
      console.error(
        "REJECT DARSHAN ENTRY ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// VENDOR
// BOOKING SUMMARY
// =====================================================

exports.getVendorDarshanBookingSummary =
  async (req, res) => {
    try {
      const vendorId = getVendorId(req);

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          vendorId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid vendor ID",
        });
      }

      const summary =
        await DarshanBooking.aggregate([
          {
            $match: {
              vendorId:
                new mongoose.Types.ObjectId(
                  vendorId
                ),
            },
          },

          {
            $group: {
              _id: null,

              totalBookings: {
                $sum: 1,
              },

              totalPersons: {
                $sum: "$totalPersons",
              },

              totalAmount: {
                $sum: "$totalAmount",
              },

              paidAmount: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$paymentStatus",
                        "paid",
                      ],
                    },
                    "$totalAmount",
                    0,
                  ],
                },
              },

              pendingBookings: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$bookingStatus",
                        "pending",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              confirmedBookings: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$bookingStatus",
                        "confirmed",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              cancelledBookings: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$bookingStatus",
                        "cancelled",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              completedBookings: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$bookingStatus",
                        "completed",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },

          {
            $project: {
              _id: 0,
              totalBookings: 1,
              totalPersons: 1,
              totalAmount: 1,
              paidAmount: 1,
              pendingBookings: 1,
              confirmedBookings: 1,
              cancelledBookings: 1,
              completedBookings: 1,
            },
          },
        ]);

      return res.status(200).json({
        success: true,

        data:
          summary[0] || {
            totalBookings: 0,
            totalPersons: 0,
            totalAmount: 0,
            paidAmount: 0,
            pendingBookings: 0,
            confirmedBookings: 0,
            cancelledBookings: 0,
            completedBookings: 0,
          },
      });
    } catch (error) {
      console.error(
        "GET DARSHAN BOOKING SUMMARY ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };