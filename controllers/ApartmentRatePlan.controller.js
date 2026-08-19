const Apartment = require("../models/Apartment.model");

const ApartmentRatePlan = require(
  "../models/ApartmentRatePlan.model"
);


/* =====================================================
   CREATE RATE PLAN
===================================================== */

exports.createRatePlan = async (req, res) => {
  try {
    const { apartmentId } = req.params;

    // Security: Vendor sirf apne apartment par plan bana sake
    const apartment = await Apartment.findOne({
      _id: apartmentId,
      vendor: req.vendor._id,
      isDeleted: false,
    });

    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: "Apartment not found or access denied.",
      });
    }

    const {
      name,
      code,
      description,

      mealPlan,

      basePrice,
      weekendPrice,

      extraAdultPrice,
      extraChildPrice,
      extraMattressPrice,

      gstPercentage,

      refundable,
      cancellationHours,
      cancellationChargeType,
      cancellationChargeValue,

      minStay,
      maxStay,

      minAdvanceBookingHours,
      maxAdvanceBookingDays,
    } = req.body;


    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Rate plan name and code are required.",
      });
    }


    if (
      basePrice === undefined ||
      Number(basePrice) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid basePrice is required.",
      });
    }


    if (
      Number(minStay || 1) >
      Number(maxStay || 30)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "minStay cannot be greater than maxStay.",
      });
    }


    const existingPlan =
      await ApartmentRatePlan.findOne({
        apartment: apartmentId,
        code: String(code).toUpperCase(),
      });


    if (existingPlan) {
      return res.status(409).json({
        success: false,
        message:
          "Rate plan code already exists for this apartment.",
      });
    }


    const ratePlan =
      await ApartmentRatePlan.create({
        vendor: req.vendor._id,
        apartment: apartmentId,

        name,
        code: String(code).toUpperCase(),
        description: description || "",

        mealPlan: mealPlan || "ROOM_ONLY",

        basePrice: Number(basePrice),
        weekendPrice: Number(weekendPrice || 0),

        extraAdultPrice: Number(
          extraAdultPrice || 0
        ),

        extraChildPrice: Number(
          extraChildPrice || 0
        ),

        extraMattressPrice: Number(
          extraMattressPrice || 0
        ),

        gstPercentage: Number(
          gstPercentage || 0
        ),

        refundable:
          refundable === undefined
            ? true
            : refundable === true ||
              refundable === "true",

        cancellationHours: Number(
          cancellationHours || 0
        ),

        cancellationChargeType:
          cancellationChargeType || "NONE",

        cancellationChargeValue: Number(
          cancellationChargeValue || 0
        ),

        minStay: Number(minStay || 1),

        maxStay: Number(maxStay || 30),

        minAdvanceBookingHours: Number(
          minAdvanceBookingHours || 0
        ),

        maxAdvanceBookingDays: Number(
          maxAdvanceBookingDays || 365
        ),
      });


    return res.status(201).json({
      success: true,
      message:
        "Apartment rate plan created successfully.",
      data: ratePlan,
    });

  } catch (error) {
    console.error(
      "CREATE RATE PLAN ERROR:",
      error
    );

    // Duplicate key fallback
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Rate plan code already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   GET ALL RATE PLANS
===================================================== */

exports.getRatePlans = async (req, res) => {
  try {
    const { apartmentId } = req.params;

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


    const plans =
      await ApartmentRatePlan.find({
        apartment: apartmentId,
        vendor: req.vendor._id,
      }).sort({ createdAt: -1 });


    return res.status(200).json({
      success: true,
      total: plans.length,
      data: plans,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   GET SINGLE RATE PLAN
===================================================== */

exports.getRatePlanById = async (
  req,
  res
) => {
  try {
    const { ratePlanId } = req.params;

    const plan =
      await ApartmentRatePlan.findOne({
        _id: ratePlanId,
        vendor: req.vendor._id,
      });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found.",
      });
    }


    return res.status(200).json({
      success: true,
      data: plan,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   UPDATE RATE PLAN
===================================================== */

exports.updateRatePlan = async (
  req,
  res
) => {
  try {
    const { ratePlanId } = req.params;

    const plan =
      await ApartmentRatePlan.findOne({
        _id: ratePlanId,
        vendor: req.vendor._id,
      });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found.",
      });
    }


    // Vendor apartment change nahi kar sakta
    delete req.body.vendor;
    delete req.body.apartment;


    // Code uppercase
    if (req.body.code) {
      req.body.code =
        String(req.body.code).toUpperCase();

      const duplicate =
        await ApartmentRatePlan.findOne({
          apartment: plan.apartment,
          code: req.body.code,
          _id: { $ne: plan._id },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Rate plan code already exists.",
        });
      }
    }


    // Boolean conversion
    if (
      req.body.refundable !== undefined
    ) {
      req.body.refundable =
        req.body.refundable === true ||
        req.body.refundable === "true";
    }


    const updated =
      await ApartmentRatePlan.findByIdAndUpdate(
        ratePlanId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );


    return res.status(200).json({
      success: true,
      message:
        "Rate plan updated successfully.",
      data: updated,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   DELETE RATE PLAN
===================================================== */

exports.deleteRatePlan = async (
  req,
  res
) => {
  try {
    const { ratePlanId } = req.params;

    const plan =
      await ApartmentRatePlan.findOneAndDelete({
        _id: ratePlanId,
        vendor: req.vendor._id,
      });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found.",
      });
    }


    return res.status(200).json({
      success: true,
      message:
        "Rate plan deleted successfully.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   TOGGLE RATE PLAN
===================================================== */

exports.toggleRatePlan = async (
  req,
  res
) => {
  try {
    const { ratePlanId } = req.params;

    const plan =
      await ApartmentRatePlan.findOne({
        _id: ratePlanId,
        vendor: req.vendor._id,
      });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found.",
      });
    }


    plan.isActive = !plan.isActive;

    await plan.save();


    return res.status(200).json({
      success: true,
      message: plan.isActive
        ? "Rate plan activated."
        : "Rate plan deactivated.",
      data: plan,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};