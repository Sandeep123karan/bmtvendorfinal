const mongoose = require("mongoose");

const Darshan = require("../models/Darshan.model");
const DarshanType = require("../models/DarshanType.model");
const DarshanSlot = require("../models/DarshanSlot.model");
const DarshanSlotAvailability = require("../models/DarshanSlotAvailability.model");

// =====================================================
// HELPERS
// =====================================================

// NOTE: darshanType.controller me `vendorId || _id` use hota hai.
// Teeno controllers (type / slot / availability) me yahi same logic rakho.
const getVendorId = (req) => req.user?.vendorId || req.user?._id || req.user?.id;

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Date ko hamesha UTC midnight par normalize karte hain
// ("2026-10-05" -> 2026-10-05T00:00:00.000Z), taaki server timezone
// ka asar na pade aur frontend par date same dikhe.
const normalizeDate = (value) => {
  if (!value) return null;
  const str = String(value).trim();
  const d = /^\d{4}-\d{2}-\d{2}$/.test(str)
    ? new Date(`${str}T00:00:00.000Z`)
    : new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const toBool = (v) => v === true || String(v).toLowerCase() === "true";

const hasValue = (v) => v !== undefined && v !== null && v !== "";

const POPULATE = [
  { path: "darshanId", select: "name templeName city state" },
  { path: "darshanTypeId", select: "name type" },
  { path: "slotId", select: "name startTime endTime" },
];

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

const handleError = (res, error, label) => {
  console.error(`${label}:`, error);

  if (error.code === 11000) {
    return fail(res, 400, "Availability already exists for this slot and date");
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return fail(res, 400, error.message);
  }
  return fail(res, 500, error.message);
};

// =====================================================
// CREATE
// POST /api/vendor/darshan-slot-availability
// =====================================================

exports.createDarshanSlotAvailability = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return fail(res, 401, "Vendor authentication required");

    const {
      darshanId,
      darshanTypeId,
      slotId,
      date,
      totalCapacity,
      maxPersonsPerBooking,
      adultPrice,
      childPrice,
      seniorCitizenPrice,
      currency,
      isBookable,
      notes,
    } = req.body;

    if (!darshanId || !darshanTypeId || !slotId || !date) {
      return fail(res, 400, "darshanId, darshanTypeId, slotId and date are required");
    }

    if (!isValidId(darshanId)) return fail(res, 400, "Invalid darshanId");
    if (!isValidId(darshanTypeId)) return fail(res, 400, "Invalid darshanTypeId");
    if (!isValidId(slotId)) return fail(res, 400, "Invalid slotId");

    const availabilityDate = normalizeDate(date);
    if (!availabilityDate) return fail(res, 400, "Invalid date");

    const darshan = await Darshan.findOne({ _id: darshanId, vendorId });
    if (!darshan) return fail(res, 404, "Darshan not found for this vendor");

    const darshanType = await DarshanType.findOne({
      _id: darshanTypeId,
      darshanId,
      vendorId,
    });
    if (!darshanType) return fail(res, 404, "Darshan type not found");

    const slot = await DarshanSlot.findOne({
      _id: slotId,
      darshanId,
      darshanTypeId,
      vendorId,
    });
    if (!slot) return fail(res, 404, "Darshan slot not found");

    const existing = await DarshanSlotAvailability.findOne({
      slotId,
      date: availabilityDate,
    });
    if (existing) {
      return fail(res, 400, "Availability already exists for this slot and date");
    }

    // ---------- capacity ----------
    const capacity = hasValue(totalCapacity)
      ? Number(totalCapacity)
      : Number(slot.capacity);

    if (!Number.isFinite(capacity) || capacity <= 0) {
      return fail(res, 400, "Total capacity must be greater than 0");
    }

    // ---------- prices (slot ke defaults, agar bheje na ho) ----------
    const price = (value, fallback) =>
      hasValue(value) ? Number(value) : Number(fallback || 0);

    const prices = {
      adultPrice: price(adultPrice, slot.adultPrice),
      childPrice: price(childPrice, slot.childPrice),
      seniorCitizenPrice: price(seniorCitizenPrice, slot.seniorCitizenPrice),
    };

    if (Object.values(prices).some((p) => !Number.isFinite(p) || p < 0)) {
      return fail(res, 400, "Prices must be valid numbers and cannot be negative");
    }

    const maxPersons =
      Number(maxPersonsPerBooking) ||
      Number(slot.maxPersonsPerBooking) ||
      Number(darshanType.maxPersonsPerBooking) ||
      10;

    if (maxPersons > capacity) {
      return fail(res, 400, "Max persons per booking cannot be more than total capacity");
    }

    const availability = await DarshanSlotAvailability.create({
      vendorId,
      darshanId,
      darshanTypeId,
      slotId,
      date: availabilityDate,

      totalCapacity: capacity,
      availableCapacity: capacity,
      bookedCapacity: 0,
      maxPersonsPerBooking: maxPersons,

      ...prices,
      currency: currency || slot.currency || "INR",

      isBookable: isBookable !== undefined ? toBool(isBookable) : true,
      isActive: true,
      isSoldOut: false,
      isBlocked: false,
      blockedReason: "",

      notes: notes || "",
    });

    const populated = await DarshanSlotAvailability.findById(availability._id).populate(POPULATE);

    return res.status(201).json({
      success: true,
      message: "Darshan slot availability created successfully",
      data: populated,
    });
  } catch (error) {
    return handleError(res, error, "CREATE DARSHAN SLOT AVAILABILITY ERROR");
  }
};

// =====================================================
// LIST
// GET /api/vendor/darshan-slot-availability/my-availability
// query: darshanId, darshanTypeId, slotId, date, from, to
// =====================================================

exports.getMyDarshanSlotAvailabilities = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return fail(res, 401, "Vendor authentication required");

    const { darshanId, darshanTypeId, slotId, date, from, to } = req.query;

    const filter = { vendorId };

    if (darshanId) {
      if (!isValidId(darshanId)) return fail(res, 400, "Invalid darshanId");
      filter.darshanId = darshanId;
    }
    if (darshanTypeId) {
      if (!isValidId(darshanTypeId)) return fail(res, 400, "Invalid darshanTypeId");
      filter.darshanTypeId = darshanTypeId;
    }
    if (slotId) {
      if (!isValidId(slotId)) return fail(res, 400, "Invalid slotId");
      filter.slotId = slotId;
    }

    // single date
    if (date) {
      const day = normalizeDate(date);
      if (!day) return fail(res, 400, "Invalid date");
      const next = new Date(day);
      next.setUTCDate(next.getUTCDate() + 1);
      filter.date = { $gte: day, $lt: next };
    }

    // date range
    if (!date && (from || to)) {
      filter.date = {};
      if (from) {
        const f = normalizeDate(from);
        if (!f) return fail(res, 400, "Invalid from date");
        filter.date.$gte = f;
      }
      if (to) {
        const t = normalizeDate(to);
        if (!t) return fail(res, 400, "Invalid to date");
        filter.date.$lte = t;
      }
    }

    const list = await DarshanSlotAvailability.find(filter)
      .populate(POPULATE)
      .lean();

    // slotId.startTime par mongo sort nahi chalta, isliye yahan sort karte hain
    list.sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date) ||
        String(a.slotId?.startTime || "").localeCompare(String(b.slotId?.startTime || ""))
    );

    return res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    return handleError(res, error, "GET DARSHAN AVAILABILITY ERROR");
  }
};

// =====================================================
// GET ONE
// GET /api/vendor/darshan-slot-availability/:id
// =====================================================

exports.getDarshanSlotAvailabilityById = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!isValidId(req.params.id)) return fail(res, 400, "Invalid id");

    const availability = await DarshanSlotAvailability.findOne({
      _id: req.params.id,
      vendorId,
    }).populate(POPULATE);

    if (!availability) return fail(res, 404, "Slot availability not found");

    return res.status(200).json({ success: true, data: availability });
  } catch (error) {
    return handleError(res, error, "GET DARSHAN AVAILABILITY BY ID ERROR");
  }
};

// =====================================================
// UPDATE
// PUT /api/vendor/darshan-slot-availability/:id
// slot / date / type change nahi hote (delete karke naya banao)
// =====================================================

exports.updateDarshanSlotAvailability = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return fail(res, 401, "Vendor authentication required");
    if (!isValidId(req.params.id)) return fail(res, 400, "Invalid id");

    const item = await DarshanSlotAvailability.findOne({
      _id: req.params.id,
      vendorId,
    });
    if (!item) return fail(res, 404, "Slot availability not found");

    const body = req.body;

    // ---------- capacity ----------
    if (body.totalCapacity !== undefined) {
      const capacity = Number(body.totalCapacity);

      if (!Number.isFinite(capacity) || capacity < 1) {
        return fail(res, 400, "Total capacity must be at least 1");
      }
      if (capacity < item.bookedCapacity) {
        return fail(res, 400, "Capacity cannot be less than already booked capacity");
      }
      item.totalCapacity = capacity;
    }
    item.availableCapacity = item.totalCapacity - item.bookedCapacity;

    // ---------- max persons ----------
    if (body.maxPersonsPerBooking !== undefined) {
      const max = Number(body.maxPersonsPerBooking);
      if (!Number.isFinite(max) || max < 1) {
        return fail(res, 400, "Max persons per booking must be at least 1");
      }
      item.maxPersonsPerBooking = max;
    }
    if (item.maxPersonsPerBooking > item.totalCapacity) {
      return fail(res, 400, "Max persons per booking cannot be more than total capacity");
    }

    // ---------- prices ----------
    for (const field of ["adultPrice", "childPrice", "seniorCitizenPrice"]) {
      if (body[field] !== undefined) {
        const value = Number(body[field]);
        if (!Number.isFinite(value) || value < 0) {
          return fail(res, 400, `${field} must be a valid number and cannot be negative`);
        }
        item[field] = value;
      }
    }

    if (body.currency !== undefined && body.currency) {
      item.currency = String(body.currency).toUpperCase();
    }

    // ---------- flags ----------
    ["isActive", "isBookable", "isBlocked"].forEach((field) => {
      if (body[field] !== undefined) item[field] = toBool(body[field]);
    });

    if (body.blockedReason !== undefined) {
      item.blockedReason = String(body.blockedReason || "").trim();
    }
    if (!item.isBlocked) item.blockedReason = "";

    if (body.notes !== undefined) {
      item.notes = String(body.notes || "").trim();
    }

    item.isSoldOut = item.availableCapacity <= 0;

    await item.save();
    await item.populate(POPULATE);

    return res.status(200).json({
      success: true,
      message: "Darshan slot availability updated successfully",
      data: item,
    });
  } catch (error) {
    return handleError(res, error, "UPDATE DARSHAN SLOT AVAILABILITY ERROR");
  }
};

// =====================================================
// DELETE
// DELETE /api/vendor/darshan-slot-availability/:id
// =====================================================

exports.deleteDarshanSlotAvailability = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return fail(res, 401, "Vendor authentication required");
    if (!isValidId(req.params.id)) return fail(res, 400, "Invalid id");

    const item = await DarshanSlotAvailability.findOne({
      _id: req.params.id,
      vendorId,
    });
    if (!item) return fail(res, 404, "Slot availability not found");

    if (item.bookedCapacity > 0) {
      return fail(
        res,
        400,
        "Cannot delete this date because bookings already exist. Block the date instead."
      );
    }

    await item.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Darshan slot availability deleted successfully",
    });
  } catch (error) {
    return handleError(res, error, "DELETE DARSHAN SLOT AVAILABILITY ERROR");
  }
};