const NightClubTablePricing = require(
  "../models/NightClubTablePricing.model"
);

const NightClub = require("../models/NightClub.model");
const NightClubEvent = require("../models/NightClubEvent.model");
const NightClubTable = require("../models/NightClubTable.model");

// =====================================================
// GET VENDOR ID
// =====================================================

const getVendorId = (req) => {
  return (
    req.vendor?._id ||
    req.user?._id ||
    req.vendor?.id ||
    req.user?.id
  );
};

// =====================================================
// CREATE TABLE PRICING
// =====================================================

exports.createTablePricing = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      nightClubId,
      eventId,
      tableId,
      price,
      minimumSpend,
      currency,
      minimumPersons,
      maximumPersons,
      totalQuantity,
    } = req.body;

    // -----------------------------------------------
    // REQUIRED FIELDS
    // -----------------------------------------------

    if (
      !nightClubId ||
      !eventId ||
      !tableId ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "nightClubId, eventId, tableId and price are required",
      });
    }

    // -----------------------------------------------
    // CHECK NIGHT CLUB
    // -----------------------------------------------

    const nightClub = await NightClub.findOne({
      _id: nightClubId,
      vendorId,
    });

    if (!nightClub) {
      return res.status(404).json({
        success: false,
        message: "Night club not found",
      });
    }

    // -----------------------------------------------
    // CHECK EVENT
    // -----------------------------------------------

    const event = await NightClubEvent.findOne({
      _id: eventId,
      vendorId,
      nightClubId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message:
          "Event not found or does not belong to this night club",
      });
    }

    // -----------------------------------------------
    // CHECK TABLE
    // -----------------------------------------------

    const table = await NightClubTable.findOne({
      _id: tableId,
      nightClubId,
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message:
          "Table not found or does not belong to this night club",
      });
    }

    // -----------------------------------------------
    // DUPLICATE CHECK
    // -----------------------------------------------

    const existing = await NightClubTablePricing.findOne({
      eventId,
      tableId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "Pricing already exists for this table and event",
        data: existing,
      });
    }

    const quantity = Number(totalQuantity || 1);

    const pricing = await NightClubTablePricing.create({
      vendorId,
      nightClubId,
      eventId,
      tableId,

      price: Number(price),

      minimumSpend: Number(minimumSpend || 0),

      currency: currency || "INR",

      minimumPersons: Number(
        minimumPersons || table.minimumPersons || 1
      ),

      maximumPersons: Number(
        maximumPersons || table.maximumPersons || table.capacity
      ),

      totalQuantity: quantity,

      availableQuantity: quantity,

      bookedQuantity: 0,

      isActive: true,

      isBookable: true,

      isSoldOut: false,
    });

    return res.status(201).json({
      success: true,
      message:
        "Night club table pricing created successfully",
      data: pricing,
    });
  } catch (error) {
    console.error(
      "CREATE TABLE PRICING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET EVENT TABLE PRICING
// =====================================================

exports.getEventTablePricing = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    const { eventId } = req.params;

    const pricing =
      await NightClubTablePricing.find({
        vendorId,
        eventId,
      })
        .populate("tableId")
        .populate("eventId")
        .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pricing.length,
      data: pricing,
    });
  } catch (error) {
    console.error(
      "GET EVENT TABLE PRICING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE PRICING
// =====================================================

exports.getTablePricingById = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    const pricing =
      await NightClubTablePricing.findOne({
        _id: req.params.id,
        vendorId,
      })
        .populate("tableId")
        .populate("eventId")
        .populate("nightClubId");

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: "Table pricing not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: pricing,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE TABLE PRICING
// =====================================================

exports.updateTablePricing = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    const pricing =
      await NightClubTablePricing.findOne({
        _id: req.params.id,
        vendorId,
      });

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: "Table pricing not found",
      });
    }

    const allowedFields = [
      "price",
      "minimumSpend",
      "currency",
      "minimumPersons",
      "maximumPersons",
      "totalQuantity",
      "isActive",
      "isBookable",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        pricing[field] = req.body[field];
      }
    });

    // Recalculate availability if quantity changes
    if (req.body.totalQuantity !== undefined) {
      const newQuantity =
        Number(req.body.totalQuantity);

      pricing.totalQuantity = newQuantity;

      pricing.availableQuantity =
        Math.max(
          newQuantity - pricing.bookedQuantity,
          0
        );

      pricing.isSoldOut =
        pricing.availableQuantity === 0;
    }

    await pricing.save();

    return res.status(200).json({
      success: true,
      message:
        "Table pricing updated successfully",
      data: pricing,
    });
  } catch (error) {
    console.error(
      "UPDATE TABLE PRICING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// ENABLE / DISABLE BOOKING
// =====================================================

exports.toggleTablePricing = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    const pricing =
      await NightClubTablePricing.findOne({
        _id: req.params.id,
        vendorId,
      });

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: "Table pricing not found",
      });
    }

    pricing.isBookable =
      !pricing.isBookable;

    await pricing.save();

    return res.status(200).json({
      success: true,
      message: pricing.isBookable
        ? "Table booking enabled"
        : "Table booking disabled",
      data: pricing,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE PRICING
// =====================================================

exports.deleteTablePricing = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    const pricing =
      await NightClubTablePricing.findOne({
        _id: req.params.id,
        vendorId,
      });

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: "Table pricing not found",
      });
    }

    await pricing.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Table pricing deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};