// const ResortRatePlan = require("../models/ResortRatePlan.model");
// const ResortPricing = require("../models/ResortPricing.model");


// /* ==========================================================
//                     SET DATE-WISE PRICE
// ========================================================== */

// exports.setDateWisePrice = async (req, res) => {
//   try {
//     const {
//       ratePlanId,
//       date,
//       price,
//       extraAdultPrice,
//       extraChildPrice,
//       minStay,
//       isAvailable,
//       notes,
//     } = req.body;


//     if (
//       !ratePlanId ||
//       !date ||
//       price === undefined
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "ratePlanId, date and price are required.",
//       });
//     }


//     const ratePlan = await ResortRatePlan.findOne({
//       _id: ratePlanId,
//       vendor: req.vendor._id,
//     });

//     if (!ratePlan) {
//       return res.status(404).json({
//         success: false,
//         message: "Rate plan not found or access denied.",
//       });
//     }


//     const pricingDate = new Date(date);
//     pricingDate.setHours(0, 0, 0, 0);


//     if (Number.isNaN(pricingDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid date.",
//       });
//     }


//     const pricing = await ResortPricing.findOneAndUpdate(
//       {
//         ratePlan: ratePlanId,
//         date: pricingDate,
//       },
//       {
//         $set: {
//           vendor: req.vendor._id,
//           resort: ratePlan.resort,
//           roomCategory: ratePlan.roomCategory,
//           price: Number(price),

//           extraAdultPrice:
//             extraAdultPrice !== undefined
//               ? Number(extraAdultPrice)
//               : ratePlan.extraAdultPrice,

//           extraChildPrice:
//             extraChildPrice !== undefined
//               ? Number(extraChildPrice)
//               : ratePlan.extraChildPrice,

//           minStay:
//             minStay !== undefined
//               ? Number(minStay)
//               : ratePlan.minStay,

//           isAvailable:
//             isAvailable !== undefined
//               ? isAvailable
//               : true,

//           notes: notes || "",
//         },
//       },
//       {
//         new: true,
//         upsert: true,
//         runValidators: true,
//       }
//     );


//     return res.status(200).json({
//       success: true,
//       message: "Date-wise price saved successfully.",
//       pricing,
//     });

//   } catch (error) {
//     console.error("Set Date Wise Price Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================================
//                     GET DATE-WISE PRICING
// ========================================================== */

// exports.getDateWisePricing = async (req, res) => {
//   try {
//     const { ratePlanId } = req.params;
//     const { startDate, endDate } = req.query;


//     const ratePlan = await ResortRatePlan.findOne({
//       _id: ratePlanId,
//       vendor: req.vendor._id,
//     });

//     if (!ratePlan) {
//       return res.status(404).json({
//         success: false,
//         message: "Rate plan not found or access denied.",
//       });
//     }


//     const filter = {
//       ratePlan: ratePlanId,
//       vendor: req.vendor._id,
//     };


//     if (startDate || endDate) {
//       filter.date = {};

//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);

//         filter.date.$gte = start;
//       }

//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);

//         filter.date.$lte = end;
//       }
//     }


//     const pricing = await ResortPricing.find(filter)
//       .sort({ date: 1 });


//     return res.status(200).json({
//       success: true,
//       total: pricing.length,
//       pricing,
//     });

//   } catch (error) {
//     console.error("Get Date Wise Pricing Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


const mongoose = require("mongoose");

const ResortRatePlan = require("../models/ResortRatePlan.model");
const ResortPricing = require("../models/ResortPricing.model");

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

/* Parse YYYY-MM-DD strictly and normalize to UTC midnight */
const parseDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date;
};

const validNumber = (value, min = 0) => {
  if (value === "" || value === null || value === undefined) {
    return false;
  }

  const number = Number(value);
  return Number.isFinite(number) && number >= min;
};

/* ==========================================================
   SET / UPDATE DATE-WISE PRICE
   POST /api/resort-pricing
========================================================== */

exports.setDateWisePrice = async (req, res) => {
  try {
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const {
      ratePlanId,
      date,
      price,
      extraAdultPrice,
      extraChildPrice,
      minStay,
      isAvailable,
      notes,
    } = req.body;

    if (!ratePlanId || !date || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "ratePlanId, date and price are required.",
      });
    }

    if (!validId(ratePlanId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ratePlanId.",
      });
    }

    const pricingDate = parseDate(date);

    if (!pricingDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid date. Use YYYY-MM-DD format.",
      });
    }

    if (!validNumber(price)) {
      return res.status(400).json({
        success: false,
        message: "price must be a number greater than or equal to 0.",
      });
    }

    if (
      extraAdultPrice !== undefined &&
      !validNumber(extraAdultPrice)
    ) {
      return res.status(400).json({
        success: false,
        message: "extraAdultPrice must be a non-negative number.",
      });
    }

    if (
      extraChildPrice !== undefined &&
      !validNumber(extraChildPrice)
    ) {
      return res.status(400).json({
        success: false,
        message: "extraChildPrice must be a non-negative number.",
      });
    }

    if (minStay !== undefined) {
      if (
        minStay === "" ||
        !Number.isInteger(Number(minStay)) ||
        Number(minStay) < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "minStay must be a positive integer.",
        });
      }
    }

    if (
      isAvailable !== undefined &&
      typeof isAvailable !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be true or false.",
      });
    }

    if (notes !== undefined && typeof notes !== "string") {
      return res.status(400).json({
        success: false,
        message: "notes must be a string.",
      });
    }

    const ratePlan = await ResortRatePlan.findOne({
      _id: ratePlanId,
      vendor: vendorId,
    });

    if (!ratePlan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found or access denied.",
      });
    }

    if (!ratePlan.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot set pricing for an inactive rate plan.",
      });
    }

    const update = {
      vendor: vendorId,
      resort: ratePlan.resort,
      roomCategory: ratePlan.roomCategory,
      ratePlan: ratePlan._id,
      date: pricingDate,
      price: Number(price),
      extraAdultPrice:
        extraAdultPrice !== undefined
          ? Number(extraAdultPrice)
          : ratePlan.extraAdultPrice,
      extraChildPrice:
        extraChildPrice !== undefined
          ? Number(extraChildPrice)
          : ratePlan.extraChildPrice,
      minStay:
        minStay !== undefined
          ? Number(minStay)
          : ratePlan.minStay,
      isAvailable:
        isAvailable !== undefined ? isAvailable : true,
      notes: notes !== undefined ? notes.trim() : "",
    };

    const pricing = await ResortPricing.findOneAndUpdate(
      {
        ratePlan: ratePlan._id,
        date: pricingDate,
        vendor: vendorId,
      },
      { $set: update },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Date-wise price saved successfully.",
      pricing,
    });
  } catch (error) {
    console.error("Set Date Wise Price Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Pricing for this rate plan and date already exists. Retry the request.",
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
      message: "Failed to save date-wise pricing.",
      error: error.message,
    });
  }
};

/* ==========================================================
   GET DATE-WISE PRICING
   GET /api/resort-pricing/rate-plan/:ratePlanId
   Optional query: startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
========================================================== */

exports.getDateWisePricing = async (req, res) => {
  try {
    const vendorId = req.vendor?._id;
    const { ratePlanId } = req.params;
    const { startDate, endDate } = req.query;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    if (!validId(ratePlanId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ratePlanId.",
      });
    }

    const ratePlan = await ResortRatePlan.findOne({
      _id: ratePlanId,
      vendor: vendorId,
    });

    if (!ratePlan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found or access denied.",
      });
    }

    const filter = {
      ratePlan: ratePlan._id,
      vendor: vendorId,
    };

    if (startDate || endDate) {
      const range = {};

      if (startDate) {
        const start = parseDate(startDate);

        if (!start) {
          return res.status(400).json({
            success: false,
            message: "Invalid startDate. Use YYYY-MM-DD format.",
          });
        }

        range.$gte = start;
      }

      if (endDate) {
        const end = parseDate(endDate);

        if (!end) {
          return res.status(400).json({
            success: false,
            message: "Invalid endDate. Use YYYY-MM-DD format.",
          });
        }

        end.setUTCHours(23, 59, 59, 999);
        range.$lte = end;
      }

      if (
        range.$gte &&
        range.$lte &&
        range.$gte > range.$lte
      ) {
        return res.status(400).json({
          success: false,
          message: "startDate cannot be after endDate.",
        });
      }

      filter.date = range;
    }

    const pricing = await ResortPricing.find(filter)
      .sort({ date: 1 });

    return res.status(200).json({
      success: true,
      ratePlan: {
        _id: ratePlan._id,
        name: ratePlan.name,
        displayName: ratePlan.displayName,
        basePrice: ratePlan.basePrice,
      },
      total: pricing.length,
      pricing,
    });
  } catch (error) {
    console.error("Get Date Wise Pricing Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch date-wise pricing.",
      error: error.message,
    });
  }
};
