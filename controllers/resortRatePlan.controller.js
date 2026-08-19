const Resort = require("../models/Resort.model");
const ResortRoom = require("../models/ResortRoom.model");
const ResortRatePlan = require("../models/ResortRatePlan.model");


/* ==========================================================
                    CREATE RATE PLAN
========================================================== */

exports.createRatePlan = async (req, res) => {
  try {
    const {
      resortId,
      roomCategoryId,
      name,
      displayName,
      description,
      mealPlan,
      basePrice,
      extraAdultPrice,
      extraChildPrice,
      gstPercent,
      cancellationPolicy,
      refundable,
      minStay,
      maxStay,
    } = req.body;


    if (
      !resortId ||
      !roomCategoryId ||
      !name ||
      !displayName ||
      basePrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "resortId, roomCategoryId, name, displayName and basePrice are required.",
      });
    }


    // Check resort ownership
    const resort = await Resort.findOne({
      _id: resortId,
      vendor: req.vendor._id,
    });

    if (!resort) {
      return res.status(404).json({
        success: false,
        message: "Resort not found or access denied.",
      });
    }


    // Check room category belongs to resort
    const roomCategory = await ResortRoom.findOne({
      _id: roomCategoryId,
      resort: resortId,
      vendor: req.vendor._id,
    });

    if (!roomCategory) {
      return res.status(404).json({
        success: false,
        message:
          "Room category not found or does not belong to this resort.",
      });
    }


    const normalizedName = name.trim().toUpperCase();


    const existingPlan = await ResortRatePlan.findOne({
      roomCategory: roomCategoryId,
      name: normalizedName,
    });

    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message:
          "This rate plan already exists for this room category.",
      });
    }


    const ratePlan = await ResortRatePlan.create({
      vendor: req.vendor._id,
      resort: resortId,
      roomCategory: roomCategoryId,

      name: normalizedName,
      displayName,
      description: description || "",
      mealPlan: mealPlan || "ROOM_ONLY",

      basePrice: Number(basePrice),
      extraAdultPrice: Number(extraAdultPrice || 0),
      extraChildPrice: Number(extraChildPrice || 0),
      gstPercent: Number(gstPercent || 0),

      cancellationPolicy: cancellationPolicy || "",
      refundable:
        refundable !== undefined ? refundable : true,

      minStay: Number(minStay || 1),
      maxStay: Number(maxStay || 30),
    });


    return res.status(201).json({
      success: true,
      message: "Rate plan created successfully.",
      ratePlan,
    });

  } catch (error) {
    console.error("Create Rate Plan Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "Duplicate rate plan for this room category.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                GET RATE PLANS OF ROOM CATEGORY
========================================================== */

exports.getRatePlans = async (req, res) => {
  try {
    const { roomCategoryId } = req.params;


    const roomCategory = await ResortRoom.findOne({
      _id: roomCategoryId,
      vendor: req.vendor._id,
    });

    if (!roomCategory) {
      return res.status(404).json({
        success: false,
        message: "Room category not found or access denied.",
      });
    }


    const ratePlans = await ResortRatePlan.find({
      roomCategory: roomCategoryId,
      vendor: req.vendor._id,
    }).sort({
      createdAt: -1,
    });


    return res.status(200).json({
      success: true,
      total: ratePlans.length,
      ratePlans,
    });

  } catch (error) {
    console.error("Get Rate Plans Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    UPDATE RATE PLAN
========================================================== */

exports.updateRatePlan = async (req, res) => {
  try {
    const ratePlan = await ResortRatePlan.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!ratePlan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found or access denied.",
      });
    }


    const allowedFields = [
      "displayName",
      "description",
      "mealPlan",
      "basePrice",
      "extraAdultPrice",
      "extraChildPrice",
      "gstPercent",
      "cancellationPolicy",
      "refundable",
      "minStay",
      "maxStay",
      "isActive",
    ];


    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        ratePlan[field] = req.body[field];
      }
    });


    await ratePlan.save();


    return res.status(200).json({
      success: true,
      message: "Rate plan updated successfully.",
      ratePlan,
    });

  } catch (error) {
    console.error("Update Rate Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    DELETE RATE PLAN
========================================================== */

exports.deleteRatePlan = async (req, res) => {
  try {
    const ratePlan = await ResortRatePlan.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!ratePlan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found or access denied.",
      });
    }


    return res.status(200).json({
      success: true,
      message: "Rate plan deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Rate Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};