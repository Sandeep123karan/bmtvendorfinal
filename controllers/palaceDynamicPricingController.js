const Palace = require("../models/palaceModel");
const PalaceRoomCategory = require(
  "../models/palaceRoomCategory.model"
);
const PalaceRatePlan = require(
  "../models/palaceRatePlan.model"
);
const PalaceDynamicPricing = require(
  "../models/palaceDynamicPricing.model"
);


/* =====================================================
   CREATE DYNAMIC PRICING
===================================================== */

exports.createDynamicPricing = async (req, res) => {
  try {
    const {
      palace,
      roomCategory,
      ratePlan,
      startDate,
      endDate,
      pricingType,
      price,
      percentageChange,
      daysOfWeek,
      priority,
      title,
      description,
    } = req.body;


    // ================= VALIDATION =================

    if (!palace || !roomCategory || !ratePlan) {
      return res.status(400).json({
        success: false,
        message:
          "palace, roomCategory and ratePlan are required",
      });
    }


    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }


    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message:
          "startDate cannot be greater than endDate",
      });
    }


    // ================= CHECK PALACE =================

    const palaceData = await Palace.findById(palace);

    if (!palaceData) {
      return res.status(404).json({
        success: false,
        message: "Palace not found",
      });
    }


    // ================= CHECK ROOM CATEGORY =================

    const category =
      await PalaceRoomCategory.findOne({
        _id: roomCategory,
        palace,
      });

    if (!category) {
      return res.status(404).json({
        success: false,
        message:
          "Room category does not belong to this palace",
      });
    }


    // ================= CHECK RATE PLAN =================

    const plan =
      await PalaceRatePlan.findOne({
        _id: ratePlan,
        palace,
        roomCategory,
      });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message:
          "Rate plan does not belong to this palace/room category",
      });
    }


    // ================= PRICING VALIDATION =================

    if (
      (pricingType || "FIXED") === "FIXED" &&
      Number(price) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price must be greater than 0 for FIXED pricing",
      });
    }


    // ================= CREATE =================

    const dynamicPricing =
      await PalaceDynamicPricing.create({
        palace,
        roomCategory,
        ratePlan,

        startDate,
        endDate,

        pricingType: pricingType || "FIXED",

        price:
          pricingType === "PERCENTAGE"
            ? 0
            : Number(price),

        percentageChange:
          pricingType === "PERCENTAGE"
            ? Number(percentageChange || 0)
            : 0,

        daysOfWeek: Array.isArray(daysOfWeek)
          ? daysOfWeek
          : [],

        priority: Number(priority || 1),

        title,
        description,
      });


    return res.status(201).json({
      success: true,
      message:
        "Palace dynamic pricing created successfully",
      data: dynamicPricing,
    });

  } catch (error) {
    console.error(
      "CREATE PALACE DYNAMIC PRICING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   GET DYNAMIC PRICING
===================================================== */

exports.getDynamicPricing = async (req, res) => {
  try {
    const {
      palace,
      roomCategory,
      ratePlan,
    } = req.query;


    const filter = {};


    if (palace) {
      filter.palace = palace;
    }

    if (roomCategory) {
      filter.roomCategory = roomCategory;
    }

    if (ratePlan) {
      filter.ratePlan = ratePlan;
    }


    const data =
      await PalaceDynamicPricing.find(filter)
        .populate("palace", "propertyName city")
        .populate(
          "roomCategory",
          "name title roomCategoryName"
        )
        .populate(
          "ratePlan",
          "name title ratePlanName"
        )
        .sort({
          priority: -1,
          startDate: 1,
        });


    return res.json({
      success: true,
      count: data.length,
      data,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   GET SINGLE DYNAMIC PRICING
===================================================== */

exports.getDynamicPricingById =
  async (req, res) => {
    try {
      const data =
        await PalaceDynamicPricing.findById(
          req.params.id
        )
          .populate("palace")
          .populate("roomCategory")
          .populate("ratePlan");


      if (!data) {
        return res.status(404).json({
          success: false,
          message:
            "Dynamic pricing not found",
        });
      }


      return res.json({
        success: true,
        data,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


/* =====================================================
   UPDATE DYNAMIC PRICING
===================================================== */

exports.updateDynamicPricing =
  async (req, res) => {
    try {
      const existing =
        await PalaceDynamicPricing.findById(
          req.params.id
        );


      if (!existing) {
        return res.status(404).json({
          success: false,
          message:
            "Dynamic pricing not found",
        });
      }


      // Don't allow changing relationship IDs here
      delete req.body.palace;
      delete req.body.roomCategory;
      delete req.body.ratePlan;


      // Date validation
      const startDate =
        req.body.startDate || existing.startDate;

      const endDate =
        req.body.endDate || existing.endDate;


      if (
        new Date(startDate) >
        new Date(endDate)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "startDate cannot be greater than endDate",
        });
      }


      if (req.body.pricingType === "FIXED") {
        req.body.price =
          Number(req.body.price || existing.price);

        req.body.percentageChange = 0;
      }


      if (
        req.body.pricingType === "PERCENTAGE"
      ) {
        req.body.price = 0;

        req.body.percentageChange =
          Number(
            req.body.percentageChange || 0
          );
      }


      const updated =
        await PalaceDynamicPricing.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );


      return res.json({
        success: true,
        message:
          "Dynamic pricing updated successfully",
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
   TOGGLE ACTIVE
===================================================== */

exports.toggleDynamicPricing =
  async (req, res) => {
    try {
      const pricing =
        await PalaceDynamicPricing.findById(
          req.params.id
        );


      if (!pricing) {
        return res.status(404).json({
          success: false,
          message:
            "Dynamic pricing not found",
        });
      }


      pricing.isActive =
        !pricing.isActive;

      await pricing.save();


      return res.json({
        success: true,
        message: pricing.isActive
          ? "Dynamic pricing activated"
          : "Dynamic pricing deactivated",
        data: pricing,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


/* =====================================================
   DELETE
===================================================== */

exports.deleteDynamicPricing =
  async (req, res) => {
    try {
      const deleted =
        await PalaceDynamicPricing.findByIdAndDelete(
          req.params.id
        );


      if (!deleted) {
        return res.status(404).json({
          success: false,
          message:
            "Dynamic pricing not found",
        });
      }


      return res.json({
        success: true,
        message:
          "Dynamic pricing deleted successfully",
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };