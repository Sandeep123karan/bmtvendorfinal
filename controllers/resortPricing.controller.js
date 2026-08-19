const ResortRatePlan = require("../models/ResortRatePlan.model");
const ResortPricing = require("../models/ResortPricing.model");


/* ==========================================================
                    SET DATE-WISE PRICE
========================================================== */

exports.setDateWisePrice = async (req, res) => {
  try {
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


    if (
      !ratePlanId ||
      !date ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "ratePlanId, date and price are required.",
      });
    }


    const ratePlan = await ResortRatePlan.findOne({
      _id: ratePlanId,
      vendor: req.vendor._id,
    });

    if (!ratePlan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found or access denied.",
      });
    }


    const pricingDate = new Date(date);
    pricingDate.setHours(0, 0, 0, 0);


    if (Number.isNaN(pricingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date.",
      });
    }


    const pricing = await ResortPricing.findOneAndUpdate(
      {
        ratePlan: ratePlanId,
        date: pricingDate,
      },
      {
        $set: {
          vendor: req.vendor._id,
          resort: ratePlan.resort,
          roomCategory: ratePlan.roomCategory,
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
            isAvailable !== undefined
              ? isAvailable
              : true,

          notes: notes || "",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );


    return res.status(200).json({
      success: true,
      message: "Date-wise price saved successfully.",
      pricing,
    });

  } catch (error) {
    console.error("Set Date Wise Price Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    GET DATE-WISE PRICING
========================================================== */

exports.getDateWisePricing = async (req, res) => {
  try {
    const { ratePlanId } = req.params;
    const { startDate, endDate } = req.query;


    const ratePlan = await ResortRatePlan.findOne({
      _id: ratePlanId,
      vendor: req.vendor._id,
    });

    if (!ratePlan) {
      return res.status(404).json({
        success: false,
        message: "Rate plan not found or access denied.",
      });
    }


    const filter = {
      ratePlan: ratePlanId,
      vendor: req.vendor._id,
    };


    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        filter.date.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        filter.date.$lte = end;
      }
    }


    const pricing = await ResortPricing.find(filter)
      .sort({ date: 1 });


    return res.status(200).json({
      success: true,
      total: pricing.length,
      pricing,
    });

  } catch (error) {
    console.error("Get Date Wise Pricing Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};