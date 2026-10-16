// const Resort = require("../models/Resort.model");
// const ResortRoom = require("../models/ResortRoom.model");
// const ResortRatePlan = require("../models/ResortRatePlan.model");


// /* ==========================================================
//                     CREATE RATE PLAN
// ========================================================== */

// exports.createRatePlan = async (req, res) => {
//   try {
//     const {
//       resortId,
//       roomCategoryId,
//       name,
//       displayName,
//       description,
//       mealPlan,
//       basePrice,
//       extraAdultPrice,
//       extraChildPrice,
//       gstPercent,
//       cancellationPolicy,
//       refundable,
//       minStay,
//       maxStay,
//     } = req.body;


//     if (
//       !resortId ||
//       !roomCategoryId ||
//       !name ||
//       !displayName ||
//       basePrice === undefined
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "resortId, roomCategoryId, name, displayName and basePrice are required.",
//       });
//     }


//     // Check resort ownership
//     const resort = await Resort.findOne({
//       _id: resortId,
//       vendor: req.vendor._id,
//     });

//     if (!resort) {
//       return res.status(404).json({
//         success: false,
//         message: "Resort not found or access denied.",
//       });
//     }


//     // Check room category belongs to resort
//     const roomCategory = await ResortRoom.findOne({
//       _id: roomCategoryId,
//       resort: resortId,
//       vendor: req.vendor._id,
//     });

//     if (!roomCategory) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Room category not found or does not belong to this resort.",
//       });
//     }


//     const normalizedName = name.trim().toUpperCase();


//     const existingPlan = await ResortRatePlan.findOne({
//       roomCategory: roomCategoryId,
//       name: normalizedName,
//     });

//     if (existingPlan) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "This rate plan already exists for this room category.",
//       });
//     }


//     const ratePlan = await ResortRatePlan.create({
//       vendor: req.vendor._id,
//       resort: resortId,
//       roomCategory: roomCategoryId,

//       name: normalizedName,
//       displayName,
//       description: description || "",
//       mealPlan: mealPlan || "ROOM_ONLY",

//       basePrice: Number(basePrice),
//       extraAdultPrice: Number(extraAdultPrice || 0),
//       extraChildPrice: Number(extraChildPrice || 0),
//       gstPercent: Number(gstPercent || 0),

//       cancellationPolicy: cancellationPolicy || "",
//       refundable:
//         refundable !== undefined ? refundable : true,

//       minStay: Number(minStay || 1),
//       maxStay: Number(maxStay || 30),
//     });


//     return res.status(201).json({
//       success: true,
//       message: "Rate plan created successfully.",
//       ratePlan,
//     });

//   } catch (error) {
//     console.error("Create Rate Plan Error:", error);

//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Duplicate rate plan for this room category.",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================================
//                 GET RATE PLANS OF ROOM CATEGORY
// ========================================================== */

// exports.getRatePlans = async (req, res) => {
//   try {
//     const { roomCategoryId } = req.params;


//     const roomCategory = await ResortRoom.findOne({
//       _id: roomCategoryId,
//       vendor: req.vendor._id,
//     });

//     if (!roomCategory) {
//       return res.status(404).json({
//         success: false,
//         message: "Room category not found or access denied.",
//       });
//     }


//     const ratePlans = await ResortRatePlan.find({
//       roomCategory: roomCategoryId,
//       vendor: req.vendor._id,
//     }).sort({
//       createdAt: -1,
//     });


//     return res.status(200).json({
//       success: true,
//       total: ratePlans.length,
//       ratePlans,
//     });

//   } catch (error) {
//     console.error("Get Rate Plans Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================================
//                     UPDATE RATE PLAN
// ========================================================== */

// exports.updateRatePlan = async (req, res) => {
//   try {
//     const ratePlan = await ResortRatePlan.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });

//     if (!ratePlan) {
//       return res.status(404).json({
//         success: false,
//         message: "Rate plan not found or access denied.",
//       });
//     }


//     const allowedFields = [
//       "displayName",
//       "description",
//       "mealPlan",
//       "basePrice",
//       "extraAdultPrice",
//       "extraChildPrice",
//       "gstPercent",
//       "cancellationPolicy",
//       "refundable",
//       "minStay",
//       "maxStay",
//       "isActive",
//     ];


//     allowedFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         ratePlan[field] = req.body[field];
//       }
//     });


//     await ratePlan.save();


//     return res.status(200).json({
//       success: true,
//       message: "Rate plan updated successfully.",
//       ratePlan,
//     });

//   } catch (error) {
//     console.error("Update Rate Plan Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================================
//                     DELETE RATE PLAN
// ========================================================== */

// exports.deleteRatePlan = async (req, res) => {
//   try {
//     const ratePlan = await ResortRatePlan.findOneAndDelete({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });

//     if (!ratePlan) {
//       return res.status(404).json({
//         success: false,
//         message: "Rate plan not found or access denied.",
//       });
//     }


//     return res.status(200).json({
//       success: true,
//       message: "Rate plan deleted successfully.",
//     });

//   } catch (error) {
//     console.error("Delete Rate Plan Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


const mongoose = require("mongoose");

const Resort = require("../models/Resort.model");
const ResortRoom = require("../models/ResortRoom.model");
const ResortRatePlan = require("../models/ResortRatePlan.model");
const ResortPricing = require("../models/ResortPricing.model");

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

const vendorIdOf = (req) => req.vendor?._id;

const numberInRange = (value, min, max = Infinity) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
};

/* ==========================================================
   CREATE RATE PLAN
   POST /api/resort-rate-plans
========================================================== */

exports.createRatePlan = async (req, res) => {
  try {
    const vendorId = vendorIdOf(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const {
      resortId,
      roomCategoryId,
      name,
      displayName,
      description,
      mealPlan,
      basePrice,
      extraAdultPrice = 0,
      extraChildPrice = 0,
      gstPercent = 0,
      cancellationPolicy = "",
      refundable = true,
      minStay = 1,
      maxStay = 30,
    } = req.body;

    if (
      !resortId ||
      !roomCategoryId ||
      !name?.trim() ||
      !displayName?.trim() ||
      basePrice === undefined ||
      basePrice === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "resortId, roomCategoryId, name, displayName and basePrice are required.",
      });
    }

    if (!validId(resortId) || !validId(roomCategoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resortId or roomCategoryId.",
      });
    }

    if (
      !numberInRange(basePrice, 0) ||
      !numberInRange(extraAdultPrice, 0) ||
      !numberInRange(extraChildPrice, 0) ||
      !numberInRange(gstPercent, 0, 100) ||
      !numberInRange(minStay, 1) ||
      !numberInRange(maxStay, 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Prices, GST and stay limits must contain valid values.",
      });
    }

    if (Number(maxStay) < Number(minStay)) {
      return res.status(400).json({
        success: false,
        message: "maxStay cannot be less than minStay.",
      });
    }

    if (typeof refundable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "refundable must be true or false.",
      });
    }

    const allowedMealPlans = [
      "ROOM_ONLY",
      "BREAKFAST",
      "HALF_BOARD",
      "FULL_BOARD",
    ];

    const selectedMealPlan = mealPlan || "ROOM_ONLY";

    if (!allowedMealPlans.includes(selectedMealPlan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mealPlan.",
        allowedMealPlans,
      });
    }

    const resort = await Resort.findOne({
      _id: resortId,
      vendor: vendorId,
    }).select("_id");

    if (!resort) {
      return res.status(404).json({
        success: false,
        message: "Resort not found or access denied.",
      });
    }

    const roomCategory = await ResortRoom.findOne({
      _id: roomCategoryId,
      resort: resortId,
      vendor: vendorId,
    }).select("_id");

    if (!roomCategory) {
      return res.status(404).json({
        success: false,
        message: "Room category not found in this resort.",
      });
    }

    const normalizedName = name.trim().toUpperCase();

    const existingPlan = await ResortRatePlan.findOne({
      roomCategory: roomCategoryId,
      name: normalizedName,
    }).select("_id");

    if (existingPlan) {
      return res.status(409).json({
        success: false,
        message: "This rate plan already exists for this room category.",
      });
    }

    const ratePlan = await ResortRatePlan.create({
      vendor: vendorId,
      resort: resortId,
      roomCategory: roomCategoryId,
      name: normalizedName,
      displayName: displayName.trim(),
      description,
      mealPlan: selectedMealPlan,
      basePrice: Number(basePrice),
      extraAdultPrice: Number(extraAdultPrice),
      extraChildPrice: Number(extraChildPrice),
      gstPercent: Number(gstPercent),
      cancellationPolicy,
      refundable,
      minStay: Number(minStay),
      maxStay: Number(maxStay),
    });

    return res.status(201).json({
      success: true,
      message: "Rate plan created successfully.",
      ratePlan,
    });
  } catch (error) {
    console.error("Create Rate Plan Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This rate plan already exists for this room category.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create rate plan.",
      error: error.message,
    });
  }
};

/* ==========================================================
   GET RATE PLANS BY ROOM CATEGORY
   GET /api/resort-rate-plans/room-category/:roomCategoryId
========================================================== */

exports.getRatePlans = async (req, res) => {
  try {
    const vendorId = vendorIdOf(req);
    const { roomCategoryId } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    if (!validId(roomCategoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid roomCategoryId.",
      });
    }

    const roomCategory = await ResortRoom.findOne({
      _id: roomCategoryId,
      vendor: vendorId,
    }).select("_id name title resort");

    if (!roomCategory) {
      return res.status(404).json({
        success: false,
        message: "Room category not found or access denied.",
      });
    }

    const ratePlans = await ResortRatePlan.find({
      roomCategory: roomCategoryId,
      vendor: vendorId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: ratePlans.length,
      roomCategory,
      ratePlans,
    });
  } catch (error) {
    console.error("Get Rate Plans Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch rate plans.",
      error: error.message,
    });
  }
};

/* ==========================================================
   UPDATE RATE PLAN
   PUT /api/resort-rate-plans/:id
========================================================== */

exports.updateRatePlan = async (req, res) => {
  try {
    const vendorId = vendorIdOf(req);
    const { id } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rate plan ID.",
      });
    }

    const ratePlan = await ResortRatePlan.findOne({
      _id: id,
      vendor: vendorId,
    });

    if (!ratePlan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found or access denied.",
      });
    }

    const textFields = [
      "displayName",
      "description",
      "cancellationPolicy",
    ];

    for (const field of textFields) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "string") {
          return res.status(400).json({
            success: false,
            message: `${field} must be a string.`,
          });
        }

        ratePlan[field] = req.body[field].trim();
      }
    }

    if (req.body.mealPlan !== undefined) {
      const allowedMealPlans = [
        "ROOM_ONLY",
        "BREAKFAST",
        "HALF_BOARD",
        "FULL_BOARD",
      ];

      if (!allowedMealPlans.includes(req.body.mealPlan)) {
        return res.status(400).json({
          success: false,
          message: "Invalid mealPlan.",
          allowedMealPlans,
        });
      }

      ratePlan.mealPlan = req.body.mealPlan;
    }

    const numericRules = {
      basePrice: [0, Infinity],
      extraAdultPrice: [0, Infinity],
      extraChildPrice: [0, Infinity],
      gstPercent: [0, 100],
      minStay: [1, Infinity],
      maxStay: [1, Infinity],
    };

    for (const [field, [min, max]] of Object.entries(numericRules)) {
      if (req.body[field] !== undefined) {
        if (
          req.body[field] === "" ||
          !numberInRange(req.body[field], min, max)
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid value for ${field}.`,
          });
        }

        ratePlan[field] = Number(req.body[field]);
      }
    }

    if (req.body.refundable !== undefined) {
      if (typeof req.body.refundable !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "refundable must be true or false.",
        });
      }

      ratePlan.refundable = req.body.refundable;
    }

    if (req.body.isActive !== undefined) {
      if (typeof req.body.isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be true or false.",
        });
      }

      ratePlan.isActive = req.body.isActive;
    }

    if (ratePlan.maxStay < ratePlan.minStay) {
      return res.status(400).json({
        success: false,
        message: "maxStay cannot be less than minStay.",
      });
    }

    await ratePlan.save();

    return res.status(200).json({
      success: true,
      message: "Rate plan updated successfully.",
      ratePlan,
    });
  } catch (error) {
    console.error("Update Rate Plan Error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update rate plan.",
      error: error.message,
    });
  }
};

/* ==========================================================
   DELETE RATE PLAN
   DELETE /api/resort-rate-plans/:id

   Pricing records are removed first to avoid orphaned pricing.
========================================================== */

exports.deleteRatePlan = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const vendorId = vendorIdOf(req);
    const { id } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rate plan ID.",
      });
    }

    let deleted = false;

    await session.withTransaction(async () => {
      const ratePlan = await ResortRatePlan.findOne({
        _id: id,
        vendor: vendorId,
      }).session(session);

      if (!ratePlan) return;

      await ResortPricing.deleteMany(
        {
          ratePlan: ratePlan._id,
          vendor: vendorId,
        },
        { session }
      );

      await ResortRatePlan.deleteOne(
        { _id: ratePlan._id, vendor: vendorId },
        { session }
      );

      deleted = true;
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found or access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rate plan and its date-wise pricing deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Rate Plan Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete rate plan. Check MongoDB transaction support.",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};
