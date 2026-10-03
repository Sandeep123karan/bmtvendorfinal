const CruisePricing = require("../models/CruisePricing.model");

const getVendorId = (req) =>
  req.user?._id ||
  req.user?.id ||
  req.vendor?._id ||
  req.vendor?.id;

const toNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : NaN;
};

const calculateFinalPrice = ({
  basePrice,
  taxAmount,
  portCharges,
  serviceCharges,
  discountAmount,
}) => {
  return Math.max(
    0,
    basePrice +
      taxAmount +
      portCharges +
      serviceCharges -
      discountAmount
  );
};

const createPricing = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const {
      sailingId,
      shipId,
      cabinId,
      currency,
      basePrice,
      adultPrice,
      childPrice,
      infantPrice,
      singleSupplement,
      taxPercentage,
      taxAmount,
      portCharges,
      serviceCharges,
      discountAmount,
      finalPrice,
      status,
    } = req.body;

    if (!sailingId) {
      return res.status(400).json({
        success: false,
        message: "Sailing ID is required.",
      });
    }

    if (!shipId) {
      return res.status(400).json({
        success: false,
        message: "Ship ID is required.",
      });
    }

    if (!cabinId) {
      return res.status(400).json({
        success: false,
        message: "Cabin ID is required.",
      });
    }

    if (
      basePrice === undefined ||
      basePrice === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Base price is required.",
      });
    }

    if (
      adultPrice === undefined ||
      adultPrice === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Adult price is required.",
      });
    }

    const base = toNumber(basePrice);
    const adult = toNumber(adultPrice);
    const child = toNumber(childPrice);
    const infant = toNumber(infantPrice);
    const supplement = toNumber(singleSupplement);
    const taxPercent = toNumber(taxPercentage);
    const tax = toNumber(taxAmount);
    const ports = toNumber(portCharges);
    const services = toNumber(serviceCharges);
    const discount = toNumber(discountAmount);

    const values = [
      base,
      adult,
      child,
      infant,
      supplement,
      taxPercent,
      tax,
      ports,
      services,
      discount,
    ];

    if (values.some((value) => Number.isNaN(value))) {
      return res.status(400).json({
        success: false,
        message: "All pricing values must be valid numbers.",
      });
    }

    if (values.some((value) => value < 0)) {
      return res.status(400).json({
        success: false,
        message: "Pricing values cannot be negative.",
      });
    }

    const calculatedFinalPrice =
      calculateFinalPrice({
        basePrice: base,
        taxAmount: tax,
        portCharges: ports,
        serviceCharges: services,
        discountAmount: discount,
      });

    if (finalPrice !== undefined && finalPrice !== "") {
      const requestedFinalPrice =
        toNumber(finalPrice);

      if (
        Number.isNaN(requestedFinalPrice) ||
        requestedFinalPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Final price must be a valid positive number.",
        });
      }
    }

    const existingPricing =
      await CruisePricing.findOne({
        vendorId,
        sailingId,
        cabinId,
      });

    if (existingPricing) {
      return res.status(409).json({
        success: false,
        message:
          "Pricing already exists for this sailing and cabin.",
      });
    }

    const pricing =
      await CruisePricing.create({
        vendorId,
        sailingId,
        shipId,
        cabinId,
        currency:
          currency?.trim()?.toUpperCase() || "INR",
        basePrice: base,
        adultPrice: adult,
        childPrice: child,
        infantPrice: infant,
        singleSupplement: supplement,
        taxPercentage: taxPercent,
        taxAmount: tax,
        portCharges: ports,
        serviceCharges: services,
        discountAmount: discount,
        finalPrice: calculatedFinalPrice,
        status: status || "draft",
      });

    const populatedPricing =
      await CruisePricing.findById(
        pricing._id
      )
        .populate(
          "sailingId",
          "sailingCode departureDate returnDate departurePort arrivalPort"
        )
        .populate(
          "shipId",
          "shipName cruiseLineName cruiseType"
        )
        .populate(
          "cabinId"
        );

    return res.status(201).json({
      success: true,
      message:
        "Cruise pricing created successfully.",
      pricing: populatedPricing,
    });
  } catch (error) {
    console.error(
      "CREATE CRUISE PRICING ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Pricing already exists for this sailing and cabin.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create cruise pricing.",
      error: error.message,
    });
  }
};

const getPricings = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const filter = {
      vendorId,
    };

    if (req.query.sailingId) {
      filter.sailingId = req.query.sailingId;
    }

    if (req.query.shipId) {
      filter.shipId = req.query.shipId;
    }

    if (req.query.cabinId) {
      filter.cabinId = req.query.cabinId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const pricings =
      await CruisePricing.find(filter)
        .populate(
          "sailingId",
          "sailingCode departureDate returnDate departurePort arrivalPort"
        )
        .populate(
          "shipId",
          "shipName cruiseLineName cruiseType"
        )
        .populate("cabinId")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: pricings.length,
      pricings,
    });
  } catch (error) {
    console.error(
      "GET CRUISE PRICINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch cruise pricing.",
      error: error.message,
    });
  }
};

const getPricingById = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const pricing =
      await CruisePricing.findOne({
        _id: req.params.id,
        vendorId,
      })
        .populate(
          "sailingId",
          "sailingCode departureDate returnDate departurePort arrivalPort"
        )
        .populate(
          "shipId",
          "shipName cruiseLineName cruiseType"
        )
        .populate("cabinId");

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: "Cruise pricing not found.",
      });
    }

    return res.status(200).json({
      success: true,
      pricing,
    });
  } catch (error) {
    console.error(
      "GET CRUISE PRICING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch cruise pricing.",
      error: error.message,
    });
  }
};

const updatePricing = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const pricing =
      await CruisePricing.findOne({
        _id: req.params.id,
        vendorId,
      });

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: "Cruise pricing not found.",
      });
    }

    const fields = [
      "sailingId",
      "shipId",
      "cabinId",
      "currency",
      "basePrice",
      "adultPrice",
      "childPrice",
      "infantPrice",
      "singleSupplement",
      "taxPercentage",
      "taxAmount",
      "portCharges",
      "serviceCharges",
      "discountAmount",
      "status",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        pricing[field] =
          req.body[field];
      }
    });

    const numericFields = [
      "basePrice",
      "adultPrice",
      "childPrice",
      "infantPrice",
      "singleSupplement",
      "taxPercentage",
      "taxAmount",
      "portCharges",
      "serviceCharges",
      "discountAmount",
    ];

    for (const field of numericFields) {
      if (
        req.body[field] !== undefined
      ) {
        const value = toNumber(
          req.body[field]
        );

        if (
          Number.isNaN(value) ||
          value < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              `${field} must be a valid non-negative number.`,
          });
        }

        pricing[field] = value;
      }
    }

    if (pricing.currency) {
      pricing.currency =
        pricing.currency
          .trim()
          .toUpperCase();
    }

    const duplicate =
      await CruisePricing.findOne({
        vendorId,
        sailingId: pricing.sailingId,
        cabinId: pricing.cabinId,
        _id: {
          $ne: pricing._id,
        },
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "Pricing already exists for this sailing and cabin.",
      });
    }

    pricing.finalPrice =
      calculateFinalPrice({
        basePrice: pricing.basePrice,
        taxAmount: pricing.taxAmount,
        portCharges: pricing.portCharges,
        serviceCharges:
          pricing.serviceCharges,
        discountAmount:
          pricing.discountAmount,
      });

    await pricing.save();

    const updatedPricing =
      await CruisePricing.findById(
        pricing._id
      )
        .populate(
          "sailingId",
          "sailingCode departureDate returnDate departurePort arrivalPort"
        )
        .populate(
          "shipId",
          "shipName cruiseLineName cruiseType"
        )
        .populate("cabinId");

    return res.status(200).json({
      success: true,
      message:
        "Cruise pricing updated successfully.",
      pricing: updatedPricing,
    });
  } catch (error) {
    console.error(
      "UPDATE CRUISE PRICING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update cruise pricing.",
      error: error.message,
    });
  }
};

const deletePricing = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const pricing =
      await CruisePricing.findOneAndDelete({
        _id: req.params.id,
        vendorId,
      });

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: "Cruise pricing not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Cruise pricing deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE CRUISE PRICING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete cruise pricing.",
      error: error.message,
    });
  }
};

module.exports = {
  createPricing,
  getPricings,
  getPricingById,
  updatePricing,
  deletePricing,
};