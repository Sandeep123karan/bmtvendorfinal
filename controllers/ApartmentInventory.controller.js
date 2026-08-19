const Apartment = require("../models/Apartment.model");
const ApartmentInventory = require(
  "../models/ApartmentInventory.model"
);


/* =====================================================
   HELPER - NORMALIZE DATE
===================================================== */

const normalizeDate = (date) => {
  const d = new Date(date);

  d.setHours(0, 0, 0, 0);

  return d;
};


/* =====================================================
   HELPER - UPDATE INVENTORY STATUS
===================================================== */

const calculateStatus = (
  totalUnits,
  bookedUnits,
  blockedUnits
) => {
  const availableUnits =
    totalUnits - bookedUnits - blockedUnits;

  if (blockedUnits >= totalUnits) {
    return {
      availableUnits: 0,
      status: "BLOCKED",
    };
  }

  if (bookedUnits >= totalUnits) {
    return {
      availableUnits: 0,
      status: "SOLD_OUT",
    };
  }

  return {
    availableUnits: Math.max(availableUnits, 0),
    status:
      availableUnits > 0
        ? "AVAILABLE"
        : "SOLD_OUT",
  };
};


/* =====================================================
   GET APARTMENT INVENTORY
===================================================== */

exports.getApartmentInventory = async (
  req,
  res
) => {
  try {
    const { apartmentId } = req.params;

    const {
      startDate,
      endDate,
    } = req.query;


    // Security: only own apartment
    const apartment = await Apartment.findOne({
      _id: apartmentId,
      vendor: req.vendor._id,
      isDeleted: false,
    });


    if (!apartment) {
      return res.status(404).json({
        success: false,
        message:
          "Apartment not found or access denied.",
      });
    }


    const filter = {
      apartment: apartmentId,
      vendor: req.vendor._id,
    };


    if (startDate && endDate) {
      filter.date = {
        $gte: normalizeDate(startDate),
        $lte: normalizeDate(endDate),
      };
    }


    const inventory =
      await ApartmentInventory.find(filter)
        .sort({ date: 1 });


    return res.status(200).json({
      success: true,
      apartment: {
        _id: apartment._id,
        apartmentName:
          apartment.apartmentName,
        totalUnits:
          apartment.totalUnits || 1,
      },
      total: inventory.length,
      data: inventory,
    });

  } catch (error) {
    console.error(
      "GET APARTMENT INVENTORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   BLOCK DATES
===================================================== */

exports.blockApartmentDates = async (
  req,
  res
) => {
  try {
    const { apartmentId } = req.params;

    const {
      startDate,
      endDate,
      reason,
    } = req.body;


    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "startDate and endDate are required.",
      });
    }


    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);


    if (end < start) {
      return res.status(400).json({
        success: false,
        message:
          "endDate cannot be before startDate.",
      });
    }


    // ==========================================
    // SECURITY
    // ==========================================

    const apartment = await Apartment.findOne({
      _id: apartmentId,
      vendor: req.vendor._id,
      isDeleted: false,
    });


    if (!apartment) {
      return res.status(404).json({
        success: false,
        message:
          "Apartment not found or access denied.",
      });
    }


    const totalUnits =
      apartment.totalUnits || 1;


    const operations = [];


    // ==========================================
    // CREATE ONE RECORD FOR EACH DATE
    // ==========================================

    for (
      let current = new Date(start);
      current <= end;
      current.setDate(
        current.getDate() + 1
      )
    ) {
      const date = new Date(current);


      operations.push({
        updateOne: {
          filter: {
            apartment: apartment._id,
            date,
          },

          update: {
            $set: {
              vendor: req.vendor._id,
              apartment: apartment._id,
              date,

              totalUnits,

              blockedUnits: totalUnits,

              bookedUnits: 0,

              availableUnits: 0,

              status: "BLOCKED",

              blockReason: reason || "",

              booking: null,
            },
          },

          upsert: true,
        },
      });
    }


    await ApartmentInventory.bulkWrite(
      operations
    );


    return res.status(200).json({
      success: true,
      message:
        "Apartment dates blocked successfully.",
    });

  } catch (error) {
    console.error(
      "BLOCK APARTMENT DATES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   UNBLOCK DATES
===================================================== */

exports.unblockApartmentDates = async (
  req,
  res
) => {
  try {
    const { apartmentId } = req.params;

    const {
      startDate,
      endDate,
    } = req.body;


    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "startDate and endDate are required.",
      });
    }


    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);


    // Security
    const apartment = await Apartment.findOne({
      _id: apartmentId,
      vendor: req.vendor._id,
      isDeleted: false,
    });


    if (!apartment) {
      return res.status(404).json({
        success: false,
        message:
          "Apartment not found or access denied.",
      });
    }


    const totalUnits =
      apartment.totalUnits || 1;


    const operations = [];


    for (
      let current = new Date(start);
      current <= end;
      current.setDate(
        current.getDate() + 1
      )
    ) {
      const date = new Date(current);


      operations.push({
        updateOne: {
          filter: {
            apartment: apartment._id,
            date,
          },

          update: {
            $set: {
              vendor: req.vendor._id,
              apartment: apartment._id,
              date,

              totalUnits,

              blockedUnits: 0,

              bookedUnits: 0,

              availableUnits: totalUnits,

              status: "AVAILABLE",

              blockReason: "",

              booking: null,
            },
          },

          upsert: true,
        },
      });
    }


    await ApartmentInventory.bulkWrite(
      operations
    );


    return res.status(200).json({
      success: true,
      message:
        "Apartment dates unblocked successfully.",
    });

  } catch (error) {
    console.error(
      "UNBLOCK APARTMENT DATES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   GET SINGLE DATE AVAILABILITY
   Booking ke time use hoga
===================================================== */

exports.getDateAvailability = async (
  req,
  res
) => {
  try {
    const {
      apartmentId,
      date,
    } = req.params;


    const apartment = await Apartment.findOne({
      _id: apartmentId,
      vendor: req.vendor._id,
      isDeleted: false,
    });


    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: "Apartment not found.",
      });
    }


    const normalizedDate =
      normalizeDate(date);


    const inventory =
      await ApartmentInventory.findOne({
        apartment: apartmentId,
        date: normalizedDate,
      });


    // No custom inventory record = available
    if (!inventory) {
      return res.status(200).json({
        success: true,
        data: {
          date: normalizedDate,
          totalUnits:
            apartment.totalUnits || 1,
          bookedUnits: 0,
          blockedUnits: 0,
          availableUnits:
            apartment.totalUnits || 1,
          status: "AVAILABLE",
        },
      });
    }


    return res.status(200).json({
      success: true,
      data: inventory,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};