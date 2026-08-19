const Apartment = require("../models/Apartment.model");

const ApartmentRatePlan = require(
  "../models/ApartmentRatePlan.model"
);

const ApartmentDynamicPricing = require(
  "../models/ApartmentDynamicPricing.model"
);


/* ==========================================
   DATE HELPER
========================================== */

const normalizeDate = (value) => {
  const date = new Date(value);

  date.setHours(0, 0, 0, 0);

  return date;
};


/* ==========================================
   CREATE DYNAMIC PRICE
========================================== */

exports.createDynamicPricing = async (
  req,
  res
) => {
  try {
    const { apartmentId, ratePlanId } =
      req.params;

    const {
      startDate,
      endDate,
      pricingType,
      title,
      price,
      minStay,
      maxStay,
      stopSell,
      priority,
      notes,
    } = req.body;


    // ===============================
    // Validation
    // ===============================

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "startDate and endDate are required.",
      });
    }


    if (
      price === undefined ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid price is required.",
      });
    }


    const start =
      normalizeDate(startDate);

    const end =
      normalizeDate(endDate);


    if (end < start) {
      return res.status(400).json({
        success: false,
        message:
          "endDate cannot be before startDate.",
      });
    }


    // ===============================
    // Apartment ownership
    // ===============================

    const apartment =
      await Apartment.findOne({
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


    // ===============================
    // Rate plan ownership
    // ===============================

    const ratePlan =
      await ApartmentRatePlan.findOne({
        _id: ratePlanId,
        apartment: apartmentId,
        vendor: req.vendor._id,
      });


    if (!ratePlan) {
      return res.status(404).json({
        success: false,
        message:
          "Rate plan not found for this apartment.",
      });
    }


    // ===============================
    // Create Rule
    // ===============================

    const dynamicPrice =
      await ApartmentDynamicPricing.create({
        vendor: req.vendor._id,
        apartment: apartmentId,
        ratePlan: ratePlanId,

        startDate: start,
        endDate: end,

        pricingType:
          pricingType || "DATE_RANGE",

        title: title || "",

        price: Number(price),

        minStay:
          minStay !== undefined
            ? Number(minStay)
            : null,

        maxStay:
          maxStay !== undefined
            ? Number(maxStay)
            : null,

        stopSell:
          stopSell === true ||
          stopSell === "true",

        priority: Number(priority || 1),

        notes: notes || "",
      });


    return res.status(201).json({
      success: true,
      message:
        "Dynamic pricing created successfully.",
      data: dynamicPrice,
    });

  } catch (error) {
    console.error(
      "CREATE DYNAMIC PRICING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   GET DYNAMIC PRICING
========================================== */

exports.getDynamicPricing = async (
  req,
  res
) => {
  try {
    const { apartmentId, ratePlanId } =
      req.params;

    const {
      startDate,
      endDate,
    } = req.query;


    // Security
    const ratePlan =
      await ApartmentRatePlan.findOne({
        _id: ratePlanId,
        apartment: apartmentId,
        vendor: req.vendor._id,
      });


    if (!ratePlan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found.",
      });
    }


    const filter = {
      apartment: apartmentId,
      ratePlan: ratePlanId,
      vendor: req.vendor._id,
    };


    // Overlapping date rules
    if (startDate && endDate) {
      filter.startDate = {
        $lte: normalizeDate(endDate),
      };

      filter.endDate = {
        $gte: normalizeDate(startDate),
      };
    }


    const pricing =
      await ApartmentDynamicPricing.find(
        filter
      ).sort({
        priority: -1,
        startDate: 1,
      });


    return res.status(200).json({
      success: true,
      total: pricing.length,
      data: pricing,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   UPDATE DYNAMIC PRICING
========================================== */

exports.updateDynamicPricing = async (
  req,
  res
) => {
  try {
    const { pricingId } = req.params;


    const pricing =
      await ApartmentDynamicPricing.findOne({
        _id: pricingId,
        vendor: req.vendor._id,
      });


    if (!pricing) {
      return res.status(404).json({
        success: false,
        message:
          "Dynamic pricing rule not found.",
      });
    }


    // Protected relations
    delete req.body.vendor;
    delete req.body.apartment;
    delete req.body.ratePlan;


    // Date normalize
    if (req.body.startDate) {
      req.body.startDate =
        normalizeDate(req.body.startDate);
    }

    if (req.body.endDate) {
      req.body.endDate =
        normalizeDate(req.body.endDate);
    }


    const newStart =
      req.body.startDate ||
      pricing.startDate;

    const newEnd =
      req.body.endDate ||
      pricing.endDate;


    if (newEnd < newStart) {
      return res.status(400).json({
        success: false,
        message:
          "endDate cannot be before startDate.",
      });
    }


    // Boolean conversion
    if (req.body.stopSell !== undefined) {
      req.body.stopSell =
        req.body.stopSell === true ||
        req.body.stopSell === "true";
    }


    const updated =
      await ApartmentDynamicPricing.findByIdAndUpdate(
        pricingId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );


    return res.status(200).json({
      success: true,
      message:
        "Dynamic pricing updated successfully.",
      data: updated,
    });

  } catch (error) {
    console.error(
      "UPDATE DYNAMIC PRICING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   DELETE DYNAMIC PRICING
========================================== */

exports.deleteDynamicPricing = async (
  req,
  res
) => {
  try {
    const { pricingId } = req.params;

    const deleted =
      await ApartmentDynamicPricing.findOneAndDelete({
        _id: pricingId,
        vendor: req.vendor._id,
      });


    if (!deleted) {
      return res.status(404).json({
        success: false,
        message:
          "Dynamic pricing rule not found.",
      });
    }


    return res.status(200).json({
      success: true,
      message:
        "Dynamic pricing deleted successfully.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   TOGGLE RULE
========================================== */

exports.toggleDynamicPricing = async (
  req,
  res
) => {
  try {
    const { pricingId } = req.params;

    const pricing =
      await ApartmentDynamicPricing.findOne({
        _id: pricingId,
        vendor: req.vendor._id,
      });


    if (!pricing) {
      return res.status(404).json({
        success: false,
        message:
          "Dynamic pricing rule not found.",
      });
    }


    pricing.isActive =
      !pricing.isActive;

    await pricing.save();


    return res.status(200).json({
      success: true,
      message: pricing.isActive
        ? "Dynamic pricing activated."
        : "Dynamic pricing deactivated.",
      data: pricing,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};