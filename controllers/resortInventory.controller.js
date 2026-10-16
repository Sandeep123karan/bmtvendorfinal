const mongoose = require("mongoose");

const Resort = require("../models/Resort.model");
const ResortRoom = require("../models/ResortRoom.model");
const ResortRoomUnit = require("../models/ResortRoomUnit.model");
const ResortInventory = require("../models/ResortInventory.model");

const VALID_INVENTORY_STATUSES = ["AVAILABLE", "SOLD_OUT", "BLOCKED", "CLOSED"];

const isValidId = (id) =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

const sendError = (res, statusCode, message) =>
  res.status(statusCode).json({ success: false, message });

// Strict YYYY-MM-DD validation; stores date at UTC midnight.
const parseDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return null;
  }

  return date;
};

const parseDateRange = (startDate, endDate) => {
  const range = {};

  if (startDate) {
    const start = parseDate(startDate);
    if (!start) return { error: "Invalid startDate. Use YYYY-MM-DD format." };
    range.$gte = start;
  }

  if (endDate) {
    const end = parseDate(endDate);
    if (!end) return { error: "Invalid endDate. Use YYYY-MM-DD format." };
    end.setUTCHours(23, 59, 59, 999);
    range.$lte = end;
  }

  if (range.$gte && range.$lte && range.$gte > range.$lte) {
    return { error: "startDate cannot be after endDate." };
  }

  return { range };
};

const parseNonNegativeInteger = (value, fieldName) => {
  const number = Number(value);

  if (
    value === "" ||
    value === null ||
    value === undefined ||
    !Number.isInteger(number) ||
    number < 0
  ) {
    return { error: `${fieldName} must be a non-negative integer.` };
  }

  return { value: number };
};

const getVendorId = (req) => {
  const vendorId = req.vendor?._id;

  if (!vendorId || !isValidId(String(vendorId))) {
    return null;
  }

  return new mongoose.Types.ObjectId(String(vendorId));
};

const getOwnedResortAndCategory = async ({ vendorId, resortId, roomCategoryId }) => {
  const resort = await Resort.findOne({ _id: resortId, vendor: vendorId });

  if (!resort) {
    return { error: "Resort not found or you do not have access to it." };
  }

  const roomCategory = await ResortRoom.findOne({
    _id: roomCategoryId,
    resort: resortId,
    vendor: vendorId,
  });

  if (!roomCategory) {
    return { error: "Room category not found for this resort." };
  }

  return { resort, roomCategory };
};

// Calculate inventory totals from registered physical room units.
const calculateRoomCounts = async ({ vendorId, resortId, roomCategoryId }) => {
  const units = await ResortRoomUnit.find({
    vendor: vendorId,
    resort: resortId,
    roomCategory: roomCategoryId,
    isActive: true,
    status: { $ne: "INACTIVE" },
  }).select("status");

  return {
    totalRooms: units.length,
    maintenanceRooms: units.filter((u) => u.status === "MAINTENANCE").length,
    blockedRooms: units.filter((u) => u.status === "BLOCKED").length,
  };
};

const calculateInventoryStatus = ({ availableRooms, status }) => {
  if (status === "CLOSED" || status === "BLOCKED") {
    return { status, availableRooms: 0 };
  }

  if (availableRooms <= 0) {
    return { status: "SOLD_OUT", availableRooms: 0 };
  }

  return { status: "AVAILABLE", availableRooms };
};

// Attach physical rooms currently marked AVAILABLE (not date-specific).
const attachAvailableUnits = async (inventoryItems, vendorId) => {
  const categoryIds = [
    ...new Set(
      inventoryItems
        .map((item) => String(item.roomCategory?._id || item.roomCategory || ""))
        .filter(Boolean)
    ),
  ];

  if (!categoryIds.length) {
    return inventoryItems.map((item) => ({
      ...item.toObject(),
      roomUnits: [],
      inventoryAvailableRooms: item.availableRooms,
      currentlyAvailableUnits: 0,
    }));
  }

  const units = await ResortRoomUnit.find({
    vendor: vendorId,
    roomCategory: { $in: categoryIds },
    isActive: true,
    status: "AVAILABLE",
  })
    .select("_id resort roomCategory roomNumber floor building status")
    .populate("roomCategory", "name title");

  return inventoryItems.map((item) => {
    const categoryId = String(item.roomCategory?._id || item.roomCategory);

    const categoryUnits = units.filter(
      (unit) =>
        String(unit.roomCategory?._id || unit.roomCategory) === categoryId &&
        String(unit.resort) === String(item.resort?._id || item.resort)
    );

    const canBook = item.status === "AVAILABLE" && item.availableRooms > 0;

    return {
      ...item.toObject(),
      roomUnits: canBook ? categoryUnits : [],
      inventoryAvailableRooms: item.availableRooms,
      currentlyAvailableUnits: categoryUnits.length,
    };
  });
};

// CREATE inventory for one category and one date.
// POST /api/resort-inventory
exports.createInventory = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return sendError(res, 401, "Vendor authentication required.");
    }

    const {
      resortId,
      roomCategoryId,
      date: dateValue,
      blockedRooms: blockedValue,
      maintenanceRooms: maintenanceValue,
      status: requestedStatus = "AVAILABLE",
      notes = "",
    } = req.body;

    if (!isValidId(resortId) || !isValidId(roomCategoryId)) {
      return sendError(res, 400, "Valid resortId and roomCategoryId are required.");
    }

    const date = parseDate(dateValue);

    if (!date) {
      return sendError(res, 400, "Valid date is required in YYYY-MM-DD format.");
    }

    if (!VALID_INVENTORY_STATUSES.includes(requestedStatus)) {
      return sendError(res, 400, "Invalid inventory status.");
    }

    if (typeof notes !== "string") {
      return sendError(res, 400, "Notes must be a string.");
    }

    const ownership = await getOwnedResortAndCategory({
      vendorId,
      resortId,
      roomCategoryId,
    });

    if (ownership.error) {
      return sendError(res, 404, ownership.error);
    }

    const existing = await ResortInventory.findOne({
      resort: resortId,
      roomCategory: roomCategoryId,
      date,
    });

    if (existing) {
      return sendError(
        res,
        409,
        "Inventory already exists for this room category and date. Use PUT to update it."
      );
    }

    const blockedResult = parseNonNegativeInteger(blockedValue ?? 0, "blockedRooms");
    const maintenanceResult = parseNonNegativeInteger(maintenanceValue ?? 0, "maintenanceRooms");

    if (blockedResult.error) return sendError(res, 400, blockedResult.error);
    if (maintenanceResult.error) return sendError(res, 400, maintenanceResult.error);

    const counts = await calculateRoomCounts({ vendorId, resortId, roomCategoryId });

    const blockedRooms = Math.max(counts.blockedRooms, blockedResult.value);
    const maintenanceRooms = Math.max(counts.maintenanceRooms, maintenanceResult.value);

    if (blockedRooms + maintenanceRooms > counts.totalRooms) {
      return sendError(
        res,
        400,
        "Blocked and maintenance rooms cannot exceed total rooms."
      );
    }

    const calculated = calculateInventoryStatus({
      availableRooms: counts.totalRooms - blockedRooms - maintenanceRooms,
      status: requestedStatus,
    });

    const inventory = await ResortInventory.create({
      vendor: vendorId,
      resort: resortId,
      roomCategory: roomCategoryId,
      date,
      totalRooms: counts.totalRooms,
      bookedRooms: 0,
      blockedRooms,
      maintenanceRooms,
      availableRooms: calculated.availableRooms,
      status: calculated.status,
      notes: notes.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Resort inventory created successfully.",
      inventory,
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, "Inventory already exists for this category and date.");
    }

    console.error("createInventory error:", error);
    return sendError(res, 500, "Failed to create resort inventory.");
  }
};

// BACKWARD COMPATIBILITY for existing POST route/controller name.
exports.upsertInventory = exports.createInventory;

// GET all inventory for a resort.
// GET /api/resort-inventory/resort/:resortId
exports.getResortInventory = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return sendError(res, 401, "Vendor authentication required.");
    }

    const { resortId } = req.params;

    if (!isValidId(resortId)) {
      return sendError(res, 400, "Invalid resortId.");
    }

    const resort = await Resort.findOne({
      _id: resortId,
      vendor: vendorId,
    }).select("_id name resortName");

    if (!resort) {
      return sendError(res, 404, "Resort not found or access denied.");
    }

    const { range, error } = parseDateRange(req.query.startDate, req.query.endDate);

    if (error) {
      return sendError(res, 400, error);
    }

    const filter = { vendor: vendorId, resort: resortId };

    if (Object.keys(range).length) {
      filter.date = range;
    }

    if (req.query.roomCategoryId) {
      if (!isValidId(req.query.roomCategoryId)) {
        return sendError(res, 400, "Invalid roomCategoryId.");
      }
      filter.roomCategory = req.query.roomCategoryId;
    }

    const inventory = await ResortInventory.find(filter)
      .sort({ date: 1, roomCategory: 1 })
      .populate("roomCategory", "name title roomType");

    const inventoryWithUnits = await attachAvailableUnits(inventory, vendorId);

    return res.status(200).json({
      success: true,
      resort,
      total: inventoryWithUnits.length,
      inventory: inventoryWithUnits,
    });
  } catch (error) {
    console.error("getResortInventory error:", error);
    return sendError(res, 500, "Failed to fetch resort inventory.");
  }
};

// GET inventory for a room category.
// GET /api/resort-inventory/room-category/:roomCategoryId
exports.getRoomCategoryInventory = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return sendError(res, 401, "Vendor authentication required.");
    }

    const { roomCategoryId } = req.params;

    if (!isValidId(roomCategoryId)) {
      return sendError(res, 400, "Invalid roomCategoryId.");
    }

    const category = await ResortRoom.findOne({
      _id: roomCategoryId,
      vendor: vendorId,
    }).populate("resort", "name resortName");

    if (!category) {
      return sendError(res, 404, "Room category not found or access denied.");
    }

    const { range, error } = parseDateRange(req.query.startDate, req.query.endDate);

    if (error) {
      return sendError(res, 400, error);
    }

    const filter = { vendor: vendorId, roomCategory: roomCategoryId };

    if (category.resort?._id) {
      filter.resort = category.resort._id;
    }

    if (Object.keys(range).length) {
      filter.date = range;
    }

    const inventory = await ResortInventory.find(filter)
      .sort({ date: 1 })
      .populate("roomCategory", "name title roomType");

    const inventoryWithUnits = await attachAvailableUnits(inventory, vendorId);

    return res.status(200).json({
      success: true,
      roomCategory: category,
      total: inventoryWithUnits.length,
      inventory: inventoryWithUnits,
    });
  } catch (error) {
    console.error("getRoomCategoryInventory error:", error);
    return sendError(res, 500, "Failed to fetch room category inventory.");
  }
};

// GET one inventory record.
// GET /api/resort-inventory/:inventoryId
exports.getInventoryById = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return sendError(res, 401, "Vendor authentication required.");
    }

    const { inventoryId } = req.params;

    if (!isValidId(inventoryId)) {
      return sendError(res, 400, "Invalid inventoryId.");
    }

    const inventory = await ResortInventory.findOne({
      _id: inventoryId,
      vendor: vendorId,
    })
      .populate("roomCategory", "name title roomType")
      .populate("resort", "name resortName");

    if (!inventory) {
      return sendError(res, 404, "Inventory record not found.");
    }

    const [inventoryWithUnits] = await attachAvailableUnits([inventory], vendorId);

    return res.status(200).json({
      success: true,
      inventory: inventoryWithUnits,
    });
  } catch (error) {
    console.error("getInventoryById error:", error);
    return sendError(res, 500, "Failed to fetch inventory record.");
  }
};

// UPDATE inventory counts/status/notes.
// PUT /api/resort-inventory/:inventoryId
exports.updateInventory = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return sendError(res, 401, "Vendor authentication required.");
    }

    const { inventoryId } = req.params;

    if (!isValidId(inventoryId)) {
      return sendError(res, 400, "Invalid inventoryId.");
    }

    const inventory = await ResortInventory.findOne({
      _id: inventoryId,
      vendor: vendorId,
    });

    if (!inventory) {
      return sendError(res, 404, "Inventory record not found.");
    }

    const {
      blockedRooms: blockedValue,
      maintenanceRooms: maintenanceValue,
      status: requestedStatus,
      notes,
    } = req.body;

    if (
      requestedStatus !== undefined &&
      !VALID_INVENTORY_STATUSES.includes(requestedStatus)
    ) {
      return sendError(res, 400, "Invalid inventory status.");
    }

    if (notes !== undefined && typeof notes !== "string") {
      return sendError(res, 400, "Notes must be a string.");
    }

    const counts = await calculateRoomCounts({
      vendorId,
      resortId: inventory.resort,
      roomCategoryId: inventory.roomCategory,
    });

    const blockedResult =
      blockedValue === undefined
        ? { value: inventory.blockedRooms }
        : parseNonNegativeInteger(blockedValue, "blockedRooms");

    const maintenanceResult =
      maintenanceValue === undefined
        ? { value: inventory.maintenanceRooms }
        : parseNonNegativeInteger(maintenanceValue, "maintenanceRooms");

    if (blockedResult.error) return sendError(res, 400, blockedResult.error);
    if (maintenanceResult.error) return sendError(res, 400, maintenanceResult.error);

    // Room Units me jo BLOCKED / MAINTENANCE hain, wo hamesha ginti me aate hain
    const blockedFinal = Math.max(counts.blockedRooms, blockedResult.value);
    const maintenanceFinal = Math.max(counts.maintenanceRooms, maintenanceResult.value);

    if (counts.totalRooms < inventory.bookedRooms + blockedFinal + maintenanceFinal) {
      return sendError(
        res,
        400,
        "Total physical rooms cannot be less than booked + blocked + maintenance rooms."
      );
    }

    const calculated = calculateInventoryStatus({
      availableRooms:
        counts.totalRooms - inventory.bookedRooms - blockedFinal - maintenanceFinal,
      status: requestedStatus || inventory.status,
    });

    inventory.totalRooms = counts.totalRooms;
    inventory.blockedRooms = blockedFinal;
    inventory.maintenanceRooms = maintenanceFinal;
    inventory.availableRooms = calculated.availableRooms;
    inventory.status = calculated.status;

    if (notes !== undefined) {
      inventory.notes = notes.trim();
    }

    await inventory.save();

    return res.status(200).json({
      success: true,
      message: "Resort inventory updated successfully.",
      inventory,
    });
  } catch (error) {
    console.error("updateInventory error:", error);
    return sendError(res, 500, "Failed to update resort inventory.");
  }
};

// DELETE inventory record.
// DELETE /api/resort-inventory/:inventoryId
exports.deleteInventory = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return sendError(res, 401, "Vendor authentication required.");
    }

    const { inventoryId } = req.params;

    if (!isValidId(inventoryId)) {
      return sendError(res, 400, "Invalid inventoryId.");
    }

    const inventory = await ResortInventory.findOne({
      _id: inventoryId,
      vendor: vendorId,
    });

    if (!inventory) {
      return sendError(res, 404, "Inventory record not found.");
    }

    if (inventory.bookedRooms > 0) {
      return sendError(res, 409, "Cannot delete inventory that has booked rooms.");
    }

    await ResortInventory.deleteOne({ _id: inventoryId, vendor: vendorId });

    return res.status(200).json({
      success: true,
      message: "Resort inventory deleted successfully.",
    });
  } catch (error) {
    console.error("deleteInventory error:", error);
    return sendError(res, 500, "Failed to delete resort inventory.");
  }
};