const Darshan = require("../models/Darshan.model");
const DarshanType = require("../models/DarshanType.model");
const DarshanSlot = require("../models/DarshanSlot.model");

// =====================================================
// CREATE SLOT
// =====================================================

exports.createDarshanSlot = async (req, res) => {
  try {
    const vendorId =
      req.user?._id ||
      req.user?.id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    const {
      darshanId,
      darshanTypeId,
      name,
      startTime,
      endTime,
      capacity,
      maxPersonsPerBooking,
      adultPrice,
      childPrice,
      seniorCitizenPrice,
      currency,
      description,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (
      !darshanId ||
      !darshanTypeId ||
      !name ||
      !startTime ||
      !endTime ||
      !capacity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "darshanId, darshanTypeId, name, startTime, endTime and capacity are required",
      });
    }

    // =================================================
    // CHECK DARSHAN
    // =================================================

    const darshan = await Darshan.findOne({
      _id: darshanId,
      vendorId,
    });

    if (!darshan) {
      return res.status(404).json({
        success: false,
        message:
          "Darshan not found or does not belong to this vendor",
      });
    }

    // =================================================
    // CHECK DARSHAN TYPE
    // =================================================

    const darshanType =
      await DarshanType.findOne({
        _id: darshanTypeId,
        darshanId,
        vendorId,
      });

    if (!darshanType) {
      return res.status(404).json({
        success: false,
        message:
          "Darshan type not found or does not belong to this darshan",
      });
    }

    // =================================================
    // CHECK DUPLICATE SLOT
    // =================================================

    const existingSlot =
      await DarshanSlot.findOne({
        darshanId,
        darshanTypeId,
        startTime,
        endTime,
      });

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message:
          "This slot already exists for this darshan type",
      });
    }

    // =================================================
    // CREATE SLOT
    // =================================================

    const slot = await DarshanSlot.create({
      vendorId,

      darshanId,

      darshanTypeId,

      name: name.trim(),

      startTime,

      endTime,

      capacity: Number(capacity),

      availableCapacity: Number(capacity),

      bookedCapacity: 0,

      maxPersonsPerBooking:
        Number(maxPersonsPerBooking || 10),

      adultPrice:
        Number(adultPrice || 0),

      childPrice:
        Number(childPrice || 0),

      seniorCitizenPrice:
        Number(seniorCitizenPrice || 0),

      currency:
        currency || "INR",

      description:
        description || "",

      isActive: true,

      isBookable: true,

      isSoldOut: false,
    });

    return res.status(201).json({
      success: true,
      message: "Darshan slot created successfully",
      data: slot,
    });
  } catch (error) {
    console.error(
      "CREATE DARSHAN SLOT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET MY SLOTS
// =====================================================

exports.getMyDarshanSlots = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.user?._id ||
      req.user?.id;

    const {
      darshanId,
      darshanTypeId,
    } = req.query;

    const filter = {
      vendorId,
    };

    if (darshanId) {
      filter.darshanId = darshanId;
    }

    if (darshanTypeId) {
      filter.darshanTypeId =
        darshanTypeId;
    }

    const slots =
      await DarshanSlot.find(filter)
        .populate(
          "darshanId",
          "name templeName city state"
        )
        .populate(
          "darshanTypeId",
          "name type adultPrice childPrice"
        )
        .sort({
          startTime: 1,
        });

    return res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    console.error(
      "GET DARSHAN SLOTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE SLOT
// =====================================================

exports.getDarshanSlotById = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.user?._id ||
      req.user?.id;

    const slot =
      await DarshanSlot.findOne({
        _id: req.params.id,
        vendorId,
      })
        .populate(
          "darshanId",
          "name templeName city state"
        )
        .populate(
          "darshanTypeId",
          "name type"
        );

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Darshan slot not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: slot,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE SLOT
// =====================================================

exports.updateDarshanSlot = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.user?._id ||
      req.user?.id;

    const slot =
      await DarshanSlot.findOne({
        _id: req.params.id,
        vendorId,
      });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Darshan slot not found",
      });
    }

    const allowedFields = [
      "name",
      "startTime",
      "endTime",
      "capacity",
      "maxPersonsPerBooking",
      "adultPrice",
      "childPrice",
      "seniorCitizenPrice",
      "currency",
      "description",
      "isActive",
      "isBookable",
    ];

    allowedFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        slot[field] =
          req.body[field];
      }
    });

    // =================================================
    // CAPACITY UPDATE
    // =================================================

    if (
      req.body.capacity !== undefined
    ) {
      const newCapacity =
        Number(req.body.capacity);

      if (
        newCapacity <
        slot.bookedCapacity
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Capacity cannot be less than already booked capacity",
        });
      }

      slot.capacity =
        newCapacity;

      slot.availableCapacity =
        newCapacity -
        slot.bookedCapacity;
    }

    slot.isSoldOut =
      slot.availableCapacity <= 0;

    await slot.save();

    return res.status(200).json({
      success: true,
      message:
        "Darshan slot updated successfully",
      data: slot,
    });
  } catch (error) {
    console.error(
      "UPDATE DARSHAN SLOT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE SLOT
// =====================================================

exports.deleteDarshanSlot = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.user?._id ||
      req.user?.id;

    const slot =
      await DarshanSlot.findOne({
        _id: req.params.id,
        vendorId,
      });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Darshan slot not found",
      });
    }

    if (slot.bookedCapacity > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete slot because bookings already exist",
      });
    }

    await slot.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Darshan slot deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE DARSHAN SLOT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};