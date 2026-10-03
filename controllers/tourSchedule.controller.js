const mongoose = require("mongoose");

const TourSchedule = require("../models/TourSchedule");
const Tour = require("../models/Tour");


// ==========================================================
// CREATE SCHEDULE
// POST /api/vendor/tour-schedules
// ==========================================================

const createSchedule = async (req, res) => {
  try {
    const {
      tourId,
      departureDate,
      returnDate,
      totalSeats,
      availableSeats,
      pricing,
      vendorNote,
    } = req.body;

    // --------------------------------------------------------
    // VALIDATE TOUR ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tourId",
      });
    }

    // --------------------------------------------------------
    // FIND TOUR
    // --------------------------------------------------------

    const tour = await Tour.findOne({
      _id: tourId,
      vendorId: req.user._id,
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found or unauthorized",
      });
    }

    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (!departureDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: "Departure date and return date are required",
      });
    }

    const departure = new Date(departureDate);
    const returnDateObj = new Date(returnDate);

    if (
      Number.isNaN(departure.getTime()) ||
      Number.isNaN(returnDateObj.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid departure or return date",
      });
    }

    if (returnDateObj < departure) {
      return res.status(400).json({
        success: false,
        message: "Return date cannot be before departure date",
      });
    }

    // --------------------------------------------------------
    // SEATS
    // --------------------------------------------------------

    const seats = Number(totalSeats);

    if (!Number.isInteger(seats) || seats < 1) {
      return res.status(400).json({
        success: false,
        message: "totalSeats must be at least 1",
      });
    }

    const initialAvailableSeats =
      availableSeats === undefined
        ? seats
        : Number(availableSeats);

    if (
      !Number.isInteger(initialAvailableSeats) ||
      initialAvailableSeats < 0 ||
      initialAvailableSeats > seats
    ) {
      return res.status(400).json({
        success: false,
        message:
          "availableSeats must be between 0 and totalSeats",
      });
    }

    // --------------------------------------------------------
    // PRICING
    // --------------------------------------------------------

    const adultPrice = Number(pricing?.adult);

    if (Number.isNaN(adultPrice) || adultPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid adult price is required",
      });
    }

    const childPrice = Number(pricing?.child || 0);
    const infantPrice = Number(pricing?.infant || 0);

    if (childPrice < 0 || infantPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Child and infant prices cannot be negative",
      });
    }

    // --------------------------------------------------------
    // CHECK DUPLICATE SCHEDULE
    // --------------------------------------------------------

    const existingSchedule = await TourSchedule.findOne({
      tourId,
      departureDate: departure,
    });

    if (existingSchedule) {
      return res.status(409).json({
        success: false,
        message:
          "A schedule already exists for this departure date",
      });
    }

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    let status = "OPEN";

    if (initialAvailableSeats === 0) {
      status = "FULL";
    }

    // --------------------------------------------------------
    // CREATE
    // --------------------------------------------------------

    const schedule = await TourSchedule.create({
      vendorId: req.user._id,
      tourId,
      departureDate: departure,
      returnDate: returnDateObj,
      totalSeats: seats,
      availableSeats: initialAvailableSeats,

      pricing: {
        adult: adultPrice,
        child: childPrice,
        infant: infantPrice,
      },

      status,
      vendorNote: vendorNote || "",
    });

    const populatedSchedule = await TourSchedule.findById(
      schedule._id
    ).populate(
      "tourId",
      "title category location duration images"
    );

    return res.status(201).json({
      success: true,
      message: "Tour schedule created successfully",
      data: populatedSchedule,
    });
  } catch (error) {
    console.error("CREATE TOUR SCHEDULE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create tour schedule",
      error: error.message,
    });
  }
};


// ==========================================================
// GET ALL VENDOR SCHEDULES
// GET /api/vendor/tour-schedules
// ==========================================================

const getVendorSchedules = async (req, res) => {
  try {
    const {
      tourId,
      status,
      fromDate,
      toDate,
    } = req.query;

    const filter = {
      vendorId: req.user._id,
    };

    if (tourId) {
      if (!mongoose.Types.ObjectId.isValid(tourId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid tourId",
        });
      }

      filter.tourId = tourId;
    }

    if (status) {
      filter.status = status;
    }

    if (fromDate || toDate) {
      filter.departureDate = {};

      if (fromDate) {
        filter.departureDate.$gte = new Date(fromDate);
      }

      if (toDate) {
        const endDate = new Date(toDate);

        if (!Number.isNaN(endDate.getTime())) {
          endDate.setHours(23, 59, 59, 999);
          filter.departureDate.$lte = endDate;
        }
      }
    }

    const schedules = await TourSchedule.find(filter)
      .populate(
        "tourId",
        "title category location duration images pricing"
      )
      .sort({
        departureDate: 1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    console.error("GET TOUR SCHEDULES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tour schedules",
      error: error.message,
    });
  }
};


// ==========================================================
// GET SINGLE SCHEDULE
// GET /api/vendor/tour-schedules/:id
// ==========================================================

const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule ID",
      });
    }

    const schedule = await TourSchedule.findOne({
      _id: id,
      vendorId: req.user._id,
    }).populate(
      "tourId",
      "title category location duration images pricing"
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Tour schedule not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("GET TOUR SCHEDULE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tour schedule",
      error: error.message,
    });
  }
};


// ==========================================================
// UPDATE SCHEDULE
// PUT /api/vendor/tour-schedules/:id
// ==========================================================

const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule ID",
      });
    }

    const schedule = await TourSchedule.findOne({
      _id: id,
      vendorId: req.user._id,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Tour schedule not found",
      });
    }

    const {
      departureDate,
      returnDate,
      totalSeats,
      availableSeats,
      pricing,
      status,
      vendorNote,
    } = req.body;

    if (departureDate !== undefined) {
      const date = new Date(departureDate);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid departure date",
        });
      }

      schedule.departureDate = date;
    }

    if (returnDate !== undefined) {
      const date = new Date(returnDate);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid return date",
        });
      }

      schedule.returnDate = date;
    }

    if (schedule.returnDate < schedule.departureDate) {
      return res.status(400).json({
        success: false,
        message: "Return date cannot be before departure date",
      });
    }

    // --------------------------------------------------------
    // SEATS
    // --------------------------------------------------------

    if (totalSeats !== undefined) {
      const seats = Number(totalSeats);

      if (!Number.isInteger(seats) || seats < 1) {
        return res.status(400).json({
          success: false,
          message: "totalSeats must be at least 1",
        });
      }

      schedule.totalSeats = seats;
    }

    if (availableSeats !== undefined) {
      const seats = Number(availableSeats);

      if (
        !Number.isInteger(seats) ||
        seats < 0 ||
        seats > schedule.totalSeats
      ) {
        return res.status(400).json({
          success: false,
          message:
            "availableSeats must be between 0 and totalSeats",
        });
      }

      schedule.availableSeats = seats;
    }

    // --------------------------------------------------------
    // PRICING
    // --------------------------------------------------------

    if (pricing) {
      if (pricing.adult !== undefined) {
        const adult = Number(pricing.adult);

        if (Number.isNaN(adult) || adult < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid adult price",
          });
        }

        schedule.pricing.adult = adult;
      }

      if (pricing.child !== undefined) {
        const child = Number(pricing.child);

        if (Number.isNaN(child) || child < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid child price",
          });
        }

        schedule.pricing.child = child;
      }

      if (pricing.infant !== undefined) {
        const infant = Number(pricing.infant);

        if (Number.isNaN(infant) || infant < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid infant price",
          });
        }

        schedule.pricing.infant = infant;
      }
    }

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    if (status !== undefined) {
      const allowedStatuses = [
        "DRAFT",
        "OPEN",
        "FULL",
        "CLOSED",
        "CANCELLED",
        "COMPLETED",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid schedule status",
        });
      }

      schedule.status = status;
    } else if (schedule.availableSeats === 0) {
      schedule.status = "FULL";
    } else if (schedule.status === "FULL") {
      schedule.status = "OPEN";
    }

    if (vendorNote !== undefined) {
      schedule.vendorNote = vendorNote;
    }

    await schedule.save();

    const updatedSchedule = await TourSchedule.findById(
      schedule._id
    ).populate(
      "tourId",
      "title category location duration images pricing"
    );

    return res.status(200).json({
      success: true,
      message: "Tour schedule updated successfully",
      data: updatedSchedule,
    });
  } catch (error) {
    console.error("UPDATE TOUR SCHEDULE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update tour schedule",
      error: error.message,
    });
  }
};


// ==========================================================
// DELETE SCHEDULE
// DELETE /api/vendor/tour-schedules/:id
// ==========================================================

const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule ID",
      });
    }

    const schedule = await TourSchedule.findOneAndDelete({
      _id: id,
      vendorId: req.user._id,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Tour schedule not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tour schedule deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TOUR SCHEDULE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete tour schedule",
      error: error.message,
    });
  }
};


module.exports = {
  createSchedule,
  getVendorSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};