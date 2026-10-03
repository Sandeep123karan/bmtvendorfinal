const NightClub = require("../models/NightClub.model");
const NightClubTable = require(
  "../models/NightClubTable.model"
);

// ==========================================
// GET VENDOR ID
// ==========================================

const getVendorId = (req) => {
  return (
    req.vendor?._id ||
    req.user?._id ||
    req.vendor?.id ||
    req.user?.id
  );
};

// ==========================================
// CREATE TABLE
// ==========================================

exports.createNightClubTable = async (
  req,
  res
) => {
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
      tableNumber,
      tableName,
      tableType,
      capacity,
      minimumPersons,
      maximumPersons,
      floor,
      section,
      position,
      nearDanceFloor,
      nearStage,
      privateArea,
      smokingAllowed,
      description,
      image,
    } = req.body;

    if (
      !nightClubId ||
      !tableNumber ||
      !capacity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "nightClubId, tableNumber and capacity are required",
      });
    }

    // ========================================
    // CHECK CLUB
    // ========================================

    const club = await NightClub.findOne({
      _id: nightClubId,
      vendorId,
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        message:
          "Night club not found for this vendor",
      });
    }

    // ========================================
    // CHECK DUPLICATE TABLE
    // ========================================

    const existing =
      await NightClubTable.findOne({
        nightClubId,
        tableNumber: tableNumber.trim(),
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "Table number already exists in this night club",
      });
    }

    // ========================================
    // CREATE TABLE
    // ========================================

    const table =
      await NightClubTable.create({
        nightClubId,

        tableNumber:
          tableNumber.trim(),

        tableName:
          tableName || "",

        tableType:
          tableType || "regular",

        capacity:
          Number(capacity),

        minimumPersons:
          Number(minimumPersons || 1),

        maximumPersons:
          Number(maximumPersons || capacity),

        floor:
          floor || "",

        section:
          section || "",

        position:
          position || "",

        nearDanceFloor:
          nearDanceFloor === true ||
          nearDanceFloor === "true",

        nearStage:
          nearStage === true ||
          nearStage === "true",

        privateArea:
          privateArea === true ||
          privateArea === "true",

        smokingAllowed:
          smokingAllowed === true ||
          smokingAllowed === "true",

        description:
          description || "",

        image:
          image || "",

        isActive: true,
        isBookable: true,
      });

    return res.status(201).json({
      success: true,
      message:
        "Night club table created successfully",
      data: table,
    });
  } catch (error) {
    console.error(
      "CREATE NIGHT CLUB TABLE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET VENDOR TABLES
// ==========================================

exports.getMyNightClubTables = async (
  req,
  res
) => {
  try {
    const vendorId = getVendorId(req);

    const {
      nightClubId,
    } = req.query;

    if (!nightClubId) {
      return res.status(400).json({
        success: false,
        message:
          "nightClubId is required",
      });
    }

    const club = await NightClub.findOne({
      _id: nightClubId,
      vendorId,
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Night club not found",
      });
    }

    const tables =
      await NightClubTable.find({
        nightClubId,
      }).sort({
        tableNumber: 1,
      });

    return res.status(200).json({
      success: true,
      count: tables.length,
      data: tables,
    });
  } catch (error) {
    console.error(
      "GET NIGHT CLUB TABLES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE TABLE
// ==========================================

exports.updateNightClubTable = async (
  req,
  res
) => {
  try {
    const vendorId = getVendorId(req);

    const table =
      await NightClubTable.findById(
        req.params.id
      );

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    const club =
      await NightClub.findOne({
        _id: table.nightClubId,
        vendorId,
      });

    if (!club) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this table",
      });
    }

    const allowedFields = [
      "tableNumber",
      "tableName",
      "tableType",
      "capacity",
      "minimumPersons",
      "maximumPersons",
      "floor",
      "section",
      "position",
      "nearDanceFloor",
      "nearStage",
      "privateArea",
      "smokingAllowed",
      "description",
      "image",
      "isActive",
      "isBookable",
    ];

    allowedFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        table[field] =
          req.body[field];
      }
    });

    await table.save();

    return res.status(200).json({
      success: true,
      message:
        "Night club table updated successfully",
      data: table,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE / DISABLE TABLE
// ==========================================

exports.deleteNightClubTable = async (
  req,
  res
) => {
  try {
    const vendorId = getVendorId(req);

    const table =
      await NightClubTable.findById(
        req.params.id
      );

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    const club =
      await NightClub.findOne({
        _id: table.nightClubId,
        vendorId,
      });

    if (!club) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized",
      });
    }

    table.isActive = false;
    table.isBookable = false;

    await table.save();

    return res.status(200).json({
      success: true,
      message:
        "Night club table disabled successfully",
      data: table,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};