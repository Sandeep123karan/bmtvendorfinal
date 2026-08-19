const Palace = require("../models/palaceModel");
const PalaceRoomCategory = require(
  "../models/palaceRoomCategoryModel"
);
const PalaceRatePlan = require(
  "../models/palaceRatePlanModel"
);


/* ==========================================
   CREATE RATE PLAN
========================================== */

exports.createRatePlan = async (req, res) => {
  try {
    const b = req.body;

    const {
      palaceId,
      roomCategoryId,
      name,
      code,
      description,
      mealPlan,
      basePrice,
      extraAdultPrice,
      extraChildPrice,
      extraMattressPrice,
      gstPercentage,
      isRefundable,
      cancellationPolicy,
      minimumStay,
      maximumStay,
      minimumAdvanceBookingHours,
    } = b;


    // Check palace ownership
    const palace = await Palace.findOne({
      _id: palaceId,
      vendor: req.vendor._id,
    });

    if (!palace) {
      return res.status(404).json({
        success: false,
        message: "Palace not found or access denied",
      });
    }


    // Check room category belongs to palace
    const roomCategory =
      await PalaceRoomCategory.findOne({
        _id: roomCategoryId,
        palace: palace._id,
        vendor: req.vendor._id,
      });

    if (!roomCategory) {
      return res.status(404).json({
        success: false,
        message: "Room category not found for this palace",
      });
    }


    // Duplicate code check
    const existing = await PalaceRatePlan.findOne({
      roomCategory: roomCategoryId,
      code: String(code).toUpperCase().trim(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Rate plan code already exists for this room category",
      });
    }


    // Validate stay
    if (
      Number(maximumStay || 30) <
      Number(minimumStay || 1)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum stay cannot be less than minimum stay",
      });
    }


    // Automatically configure meals
    let meals = {
      breakfast: false,
      lunch: false,
      dinner: false,
    };

    if (mealPlan === "BREAKFAST") {
      meals.breakfast = true;
    }

    if (mealPlan === "BREAKFAST_DINNER") {
      meals.breakfast = true;
      meals.dinner = true;
    }

    if (mealPlan === "ALL_MEALS") {
      meals.breakfast = true;
      meals.lunch = true;
      meals.dinner = true;
    }


    const ratePlan =
      await PalaceRatePlan.create({
        vendor: req.vendor._id,
        palace: palace._id,
        roomCategory: roomCategory._id,

        name,
        code: String(code).toUpperCase().trim(),
        description: description || "",

        mealPlan: mealPlan || "ROOM_ONLY",
        meals,

        basePrice: Number(basePrice),

        extraAdultPrice:
          Number(extraAdultPrice) || 0,

        extraChildPrice:
          Number(extraChildPrice) || 0,

        extraMattressPrice:
          Number(extraMattressPrice) || 0,

        gstPercentage:
          Number(gstPercentage) || 0,

        isRefundable:
          isRefundable === undefined
            ? true
            : isRefundable === true ||
              isRefundable === "true",

        cancellationPolicy:
          cancellationPolicy || "",

        minimumStay:
          Number(minimumStay) || 1,

        maximumStay:
          Number(maximumStay) || 30,

        minimumAdvanceBookingHours:
          Number(minimumAdvanceBookingHours) || 0,
      });


    return res.status(201).json({
      success: true,
      message: "Rate plan created successfully",
      data: ratePlan,
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Rate plan code already exists",
      });
    }

    console.error(
      "CREATE PALACE RATE PLAN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   GET RATE PLANS BY ROOM CATEGORY
========================================== */

exports.getRatePlansByRoomCategory =
  async (req, res) => {
    try {
      const roomCategory =
        await PalaceRoomCategory.findOne({
          _id: req.params.roomCategoryId,
          vendor: req.vendor._id,
        });

      if (!roomCategory) {
        return res.status(404).json({
          success: false,
          message: "Room category not found",
        });
      }

      const ratePlans =
        await PalaceRatePlan.find({
          roomCategory:
            req.params.roomCategoryId,
          vendor: req.vendor._id,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        count: ratePlans.length,
        data: ratePlans,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


/* ==========================================
   GET SINGLE RATE PLAN
========================================== */

exports.getRatePlanById = async (
  req,
  res
) => {
  try {
    const ratePlan =
      await PalaceRatePlan.findOne({
        _id: req.params.id,
        vendor: req.vendor._id,
      })
        .populate("palace", "propertyName")
        .populate(
          "roomCategory",
          "name roomType"
        );

    if (!ratePlan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: ratePlan,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   UPDATE RATE PLAN
========================================== */

exports.updateRatePlan = async (
  req,
  res
) => {
  try {
    const ratePlan =
      await PalaceRatePlan.findOne({
        _id: req.params.id,
        vendor: req.vendor._id,
      });

    if (!ratePlan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found",
      });
    }

    const b = req.body;

    const fields = [
      "name",
      "description",
      "cancellationPolicy",
      "mealPlan",
    ];

    fields.forEach((field) => {
      if (b[field] !== undefined) {
        ratePlan[field] = b[field];
      }
    });


    const numberFields = [
      "basePrice",
      "extraAdultPrice",
      "extraChildPrice",
      "extraMattressPrice",
      "gstPercentage",
      "minimumStay",
      "maximumStay",
      "minimumAdvanceBookingHours",
    ];

    numberFields.forEach((field) => {
      if (b[field] !== undefined) {
        ratePlan[field] = Number(b[field]);
      }
    });


    if (b.isRefundable !== undefined) {
      ratePlan.isRefundable =
        b.isRefundable === true ||
        b.isRefundable === "true";
    }


    if (
      ratePlan.maximumStay <
      ratePlan.minimumStay
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum stay cannot be less than minimum stay",
      });
    }


    // Update meals according to plan
    ratePlan.meals = {
      breakfast:
        ratePlan.mealPlan === "BREAKFAST" ||
        ratePlan.mealPlan ===
          "BREAKFAST_DINNER" ||
        ratePlan.mealPlan === "ALL_MEALS",

      lunch:
        ratePlan.mealPlan === "ALL_MEALS",

      dinner:
        ratePlan.mealPlan ===
          "BREAKFAST_DINNER" ||
        ratePlan.mealPlan === "ALL_MEALS",
    };


    await ratePlan.save();

    return res.status(200).json({
      success: true,
      message: "Rate plan updated successfully",
      data: ratePlan,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   TOGGLE RATE PLAN
========================================== */

exports.toggleRatePlan = async (
  req,
  res
) => {
  try {
    const ratePlan =
      await PalaceRatePlan.findOne({
        _id: req.params.id,
        vendor: req.vendor._id,
      });

    if (!ratePlan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found",
      });
    }

    ratePlan.isActive = !ratePlan.isActive;

    await ratePlan.save();

    return res.status(200).json({
      success: true,
      message: `Rate plan ${
        ratePlan.isActive
          ? "activated"
          : "deactivated"
      } successfully`,
      data: ratePlan,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================
   DELETE RATE PLAN
========================================== */

exports.deleteRatePlan = async (
  req,
  res
) => {
  try {
    const ratePlan =
      await PalaceRatePlan.findOneAndDelete({
        _id: req.params.id,
        vendor: req.vendor._id,
      });

    if (!ratePlan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rate plan deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};