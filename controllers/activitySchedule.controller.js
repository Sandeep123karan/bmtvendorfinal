const mongoose = require("mongoose");

const Activity = require("../models/Activity");
const ActivitySchedule = require("../models/ActivitySchedule");

// =====================================================
// VENDOR AUTH
// =====================================================

const requireVendor = (req, res) => {
  const vendorId = req.user?._id;

  if (!vendorId) {
    res.status(401).json({
      success: false,
      message: "Vendor authentication required",
    });

    return null;
  }

  return vendorId;
};

// =====================================================
// VALID OBJECT ID
// =====================================================

const isValidId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =====================================================
// VALID TIME
// Supports:
// 10:00
// 10:00 AM
// 10:30
// 23:00
// =====================================================

const isValidTime = (time) => {
  if (!time) return false;

  const value = String(time).trim();

  // 24-hour format
  const time24 =
    /^([01]\d|2[0-3]):([0-5]\d)$/;

  // 12-hour format
  const time12 =
    /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i;

  return (
    time24.test(value) ||
    time12.test(value)
  );
};

// =====================================================
// CREATE ACTIVITY SCHEDULE
// POST /api/vendor/activity-schedules
// =====================================================

const createActivitySchedule = async (
  req,
  res
) => {
  try {
    const vendorId =
      requireVendor(req, res);

    if (!vendorId) return;

    const {
      activityId,
      date,
      startTime,
      endTime,
      totalSlots,
      pricing,
      isActive,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!activityId) {
      return res.status(400).json({
        success: false,
        message: "activityId is required",
      });
    }

    if (!isValidId(activityId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activityId",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date is required",
      });
    }

    if (!startTime) {
      return res.status(400).json({
        success: false,
        message:
          "startTime is required",
      });
    }

    if (!isValidTime(startTime)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid startTime. Use HH:mm or hh:mm AM/PM",
      });
    }

    if (
      endTime &&
      !isValidTime(endTime)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid endTime. Use HH:mm or hh:mm AM/PM",
      });
    }

    // =================================================
    // DATE VALIDATION
    // =================================================

    const scheduleDate =
      new Date(date);

    if (
      Number.isNaN(
        scheduleDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    // =================================================
    // TOTAL SLOTS
    // =================================================

    const slots =
      Number(totalSlots);

    if (
      !Number.isInteger(slots) ||
      slots < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "totalSlots must be a positive integer",
      });
    }

    // =================================================
    // CHECK ACTIVITY
    // =================================================

    const activity =
      await Activity.findOne({
        _id: activityId,
        vendorId,
      });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message:
          "Activity not found or does not belong to this vendor",
      });
    }

    // =================================================
    // ACTIVITY MUST BE APPROVED
    // =================================================

    if (
      activity.status !== "APPROVED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Schedule cannot be created because activity status is ${activity.status}`,
      });
    }

    // =================================================
    // PRICING
    // =================================================

    let pricingData = {};

    if (pricing) {
      if (
        typeof pricing === "string"
      ) {
        try {
          pricingData =
            JSON.parse(pricing);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid pricing JSON",
          });
        }
      } else {
        pricingData = pricing;
      }
    }

    const adult =
      pricingData.adult !== undefined
        ? Number(pricingData.adult)
        : activity.pricing?.adult || 0;

    const child =
      pricingData.child !== undefined
        ? Number(pricingData.child)
        : activity.pricing?.child || 0;

    const infant =
      pricingData.infant !== undefined
        ? Number(pricingData.infant)
        : activity.pricing?.infant || 0;

    if (
      adult < 0 ||
      child < 0 ||
      infant < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Pricing cannot be negative",
      });
    }

    // =================================================
    // CHECK DUPLICATE SLOT
    // =================================================

    const existingSchedule =
      await ActivitySchedule.findOne({
        activityId,
        date: scheduleDate,
        startTime:
          String(startTime).trim(),
      });

    if (existingSchedule) {
      return res.status(409).json({
        success: false,
        message:
          "Schedule already exists for this activity, date and start time",
      });
    }

    // =================================================
    // CREATE SCHEDULE
    // =================================================

    const schedule =
      await ActivitySchedule.create({
        vendorId,

        activityId,

        date: scheduleDate,

        startTime:
          String(startTime).trim(),

        endTime: endTime
          ? String(endTime).trim()
          : undefined,

        totalSlots: slots,

        bookedSlots: 0,

        pricing: {
          adult,
          child,
          infant,
        },

        isActive:
          isActive === undefined
            ? true
            : isActive === true ||
              isActive === "true",
      });

    // =================================================
    // POPULATE ACTIVITY
    // =================================================

    await schedule.populate({
      path: "activityId",
      select:
        "title slug category activityType location images thumbnail",
    });

    return res.status(201).json({
      success: true,
      message:
        "Activity schedule created successfully",
      data: {
        ...schedule.toObject(),

        availableSlots:
          schedule.totalSlots -
          schedule.bookedSlots,
      },
    });
  } catch (error) {
    console.error(
      "CREATE ACTIVITY SCHEDULE ERROR:",
      error
    );

    // Mongo duplicate key
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Schedule already exists for this activity, date and start time",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create activity schedule",
      error: error.message,
    });
  }
};

// =====================================================
// GET VENDOR ACTIVITY SCHEDULES
// GET /api/vendor/activity-schedules
// =====================================================

const getVendorActivitySchedules =
  async (req, res) => {
    try {
      const vendorId =
        requireVendor(req, res);

      if (!vendorId) return;

      const {
        activityId,
        date,
        isActive,
      } = req.query;

      const filter = {
        vendorId,
      };

      // =================================================
      // ACTIVITY FILTER
      // =================================================

      if (activityId) {
        if (!isValidId(activityId)) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid activityId",
          });
        }

        filter.activityId =
          activityId;
      }

      // =================================================
      // DATE FILTER
      // =================================================

      if (date) {
        const startDate =
          new Date(date);

        if (
          Number.isNaN(
            startDate.getTime()
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid date",
          });
        }

        startDate.setHours(
          0,
          0,
          0,
          0
        );

        const endDate =
          new Date(startDate);

        endDate.setDate(
          endDate.getDate() + 1
        );

        filter.date = {
          $gte: startDate,
          $lt: endDate,
        };
      }

      // =================================================
      // ACTIVE FILTER
      // =================================================

      if (
        isActive !== undefined
      ) {
        filter.isActive =
          isActive === "true";
      }

      // =================================================
      // FETCH
      // =================================================

      const schedules =
        await ActivitySchedule.find(
          filter
        )
          .populate({
            path: "activityId",
            select:
              "title slug category activityType location images thumbnail",
          })
          .sort({
            date: 1,
            startTime: 1,
          });

      // =================================================
      // ADD AVAILABLE SLOTS
      // =================================================

      const data =
        schedules.map(
          (schedule) => ({
            ...schedule.toObject(),

            availableSlots:
              Math.max(
                0,
                schedule.totalSlots -
                  schedule.bookedSlots
              ),
          })
        );

      return res.status(200).json({
        success: true,
        count: data.length,
        data,
      });
    } catch (error) {
      console.error(
        "GET ACTIVITY SCHEDULES ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch activity schedules",
        error: error.message,
      });
    }
  };

// =====================================================
// GET SINGLE SCHEDULE
// GET /api/vendor/activity-schedules/:id
// =====================================================

const getActivityScheduleById =
  async (req, res) => {
    try {
      const vendorId =
        requireVendor(req, res);

      if (!vendorId) return;

      const { id } =
        req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid schedule ID",
        });
      }

      const schedule =
        await ActivitySchedule.findOne({
          _id: id,
          vendorId,
        }).populate({
          path: "activityId",
          select:
            "title slug category activityType location images thumbnail pricing maxGuests",
        });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message:
            "Activity schedule not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...schedule.toObject(),

          availableSlots:
            Math.max(
              0,
              schedule.totalSlots -
                schedule.bookedSlots
            ),
        },
      });
    } catch (error) {
      console.error(
        "GET ACTIVITY SCHEDULE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch activity schedule",
        error: error.message,
      });
    }
  };

// =====================================================
// UPDATE SCHEDULE
// PUT /api/vendor/activity-schedules/:id
// =====================================================

const updateActivitySchedule =
  async (req, res) => {
    try {
      const vendorId =
        requireVendor(req, res);

      if (!vendorId) return;

      const { id } =
        req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid schedule ID",
        });
      }

      const schedule =
        await ActivitySchedule.findOne({
          _id: id,
          vendorId,
        });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message:
            "Activity schedule not found",
        });
      }

      const {
        date,
        startTime,
        endTime,
        totalSlots,
        pricing,
        isActive,
      } = req.body;

      // =================================================
      // DATE
      // =================================================

      if (date !== undefined) {
        const newDate =
          new Date(date);

        if (
          Number.isNaN(
            newDate.getTime()
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid date",
          });
        }

        schedule.date =
          newDate;
      }

      // =================================================
      // START TIME
      // =================================================

      if (
        startTime !== undefined
      ) {
        if (
          !isValidTime(
            startTime
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid startTime",
          });
        }

        schedule.startTime =
          String(startTime).trim();
      }

      // =================================================
      // END TIME
      // =================================================

      if (
        endTime !== undefined
      ) {
        if (
          endTime &&
          !isValidTime(endTime)
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid endTime",
          });
        }

        schedule.endTime =
          endTime
            ? String(endTime).trim()
            : undefined;
      }

      // =================================================
      // TOTAL SLOTS
      // =================================================

      if (
        totalSlots !== undefined
      ) {
        const slots =
          Number(totalSlots);

        if (
          !Number.isInteger(slots) ||
          slots < 1
        ) {
          return res.status(400).json({
            success: false,
            message:
              "totalSlots must be a positive integer",
          });
        }

        // Cannot reduce below already booked
        if (
          slots <
          schedule.bookedSlots
        ) {
          return res.status(400).json({
            success: false,
            message:
              `totalSlots cannot be less than bookedSlots (${schedule.bookedSlots})`,
          });
        }

        schedule.totalSlots =
          slots;
      }

      // =================================================
      // PRICING
      // =================================================

      if (
        pricing !== undefined
      ) {
        let pricingData =
          pricing;

        if (
          typeof pricing === "string"
        ) {
          try {
            pricingData =
              JSON.parse(pricing);
          } catch (error) {
            return res.status(400).json({
              success: false,
              message:
                "Invalid pricing JSON",
            });
          }
        }

        if (
          pricingData.adult !==
          undefined
        ) {
          if (
            Number(
              pricingData.adult
            ) < 0
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Adult price cannot be negative",
            });
          }

          schedule.pricing.adult =
            Number(
              pricingData.adult
            );
        }

        if (
          pricingData.child !==
          undefined
        ) {
          if (
            Number(
              pricingData.child
            ) < 0
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Child price cannot be negative",
            });
          }

          schedule.pricing.child =
            Number(
              pricingData.child
            );
        }

        if (
          pricingData.infant !==
          undefined
        ) {
          if (
            Number(
              pricingData.infant
            ) < 0
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Infant price cannot be negative",
            });
          }

          schedule.pricing.infant =
            Number(
              pricingData.infant
            );
        }
      }

      // =================================================
      // ACTIVE
      // =================================================

      if (
        isActive !== undefined
      ) {
        schedule.isActive =
          isActive === true ||
          isActive === "true";
      }

      // =================================================
      // DUPLICATE CHECK
      // =================================================

      const duplicate =
        await ActivitySchedule.findOne(
          {
            _id: {
              $ne: schedule._id,
            },

            activityId:
              schedule.activityId,

            date:
              schedule.date,

            startTime:
              schedule.startTime,
          }
        );

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Another schedule already exists for this activity, date and start time",
        });
      }

      await schedule.save();

      await schedule.populate({
        path: "activityId",
        select:
          "title slug category activityType location images thumbnail",
      });

      return res.status(200).json({
        success: true,
        message:
          "Activity schedule updated successfully",

        data: {
          ...schedule.toObject(),

          availableSlots:
            Math.max(
              0,
              schedule.totalSlots -
                schedule.bookedSlots
            ),
        },
      });
    } catch (error) {
      console.error(
        "UPDATE ACTIVITY SCHEDULE ERROR:",
        error
      );

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "Schedule already exists for this activity, date and start time",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to update activity schedule",
        error: error.message,
      });
    }
  };

// =====================================================
// DELETE SCHEDULE
// DELETE /api/vendor/activity-schedules/:id
// =====================================================

const deleteActivitySchedule =
  async (req, res) => {
    try {
      const vendorId =
        requireVendor(req, res);

      if (!vendorId) return;

      const { id } =
        req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid schedule ID",
        });
      }

      const schedule =
        await ActivitySchedule.findOne({
          _id: id,
          vendorId,
        });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message:
            "Activity schedule not found",
        });
      }

      // =================================================
      // DON'T DELETE BOOKED SLOT
      // =================================================

      if (
        schedule.bookedSlots > 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete schedule because bookings already exist",
        });
      }

      await schedule.deleteOne();

      return res.status(200).json({
        success: true,
        message:
          "Activity schedule deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE ACTIVITY SCHEDULE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete activity schedule",
        error: error.message,
      });
    }
  };

// =====================================================
// TOGGLE SCHEDULE
// PATCH /api/vendor/activity-schedules/:id/toggle
// =====================================================

const toggleActivitySchedule =
  async (req, res) => {
    try {
      const vendorId =
        requireVendor(req, res);

      if (!vendorId) return;

      const { id } =
        req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid schedule ID",
        });
      }

      const schedule =
        await ActivitySchedule.findOne({
          _id: id,
          vendorId,
        });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message:
            "Activity schedule not found",
        });
      }

      schedule.isActive =
        !schedule.isActive;

      await schedule.save();

      return res.status(200).json({
        success: true,
        message:
          `Activity schedule ${
            schedule.isActive
              ? "activated"
              : "deactivated"
          } successfully`,

        data: {
          ...schedule.toObject(),

          availableSlots:
            Math.max(
              0,
              schedule.totalSlots -
                schedule.bookedSlots
            ),
        },
      });
    } catch (error) {
      console.error(
        "TOGGLE ACTIVITY SCHEDULE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update activity schedule",
        error: error.message,
      });
    }
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createActivitySchedule,
  getVendorActivitySchedules,
  getActivityScheduleById,
  updateActivitySchedule,
  deleteActivitySchedule,
  toggleActivitySchedule,
};