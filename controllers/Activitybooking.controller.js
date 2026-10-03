const mongoose = require("mongoose");
const crypto = require("crypto");

const Activity = require("../models/Activity");
const ActivitySchedule = require("../models/ActivitySchedule");
const ActivityBooking = require("../models/ActivityBooking");

/* =====================================================
   HELPERS
===================================================== */

const TZ_OFFSET = "+05:30"; // India
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const fail = (res, code, message, extra = {}) =>
  res.status(code).json({ success: false, message, ...extra });

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toInt = (v, def = 0) => {
  const n = Number(v);
  return Number.isInteger(n) ? n : def;
};

const pad = (n) => String(n).padStart(2, "0");

const generateBookingId = () =>
  `ACT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

// "10:30" / "10:30 AM" / "2:00 pm" -> {h, m}
const parseTime = (time) => {
  const match = String(time).trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/);
  if (!match) return null;
  let h = Number(match[1]);
  const m = Number(match[2]);
  if (match[3] === "PM" && h < 12) h += 12;
  if (match[3] === "AM" && h === 12) h = 0;
  return { h, m };
};

// schedule.date + startTime -> exact Date
const getStartDateTime = (schedule) => {
  const t = parseTime(schedule.startTime);
  if (!t) return null;
  const day = new Date(schedule.date).toISOString().slice(0, 10);
  return new Date(`${day}T${pad(t.h)}:${pad(t.m)}:00${TZ_OFFSET}`);
};

const releaseSlots = async (scheduleId, slots) => {
  await ActivitySchedule.updateOne(
    { _id: scheduleId, bookedSlots: { $gte: slots } },
    { $inc: { bookedSlots: -slots } }
  );
};

// Atomic cancel/reject (double-cancel safe) + slots wapas
const cancelBookingAtomic = async (booking, { by, reason, finalStatus = "CANCELLED" }) => {
  const updated = await ActivityBooking.findOneAndUpdate(
    { _id: booking._id, status: { $in: ["PENDING", "CONFIRMED"] } },
    {
      $set: { status: finalStatus, cancelledBy: by, cancellationReason: reason || "", cancelledAt: new Date() },
      $push: { statusHistory: { status: finalStatus, by, note: reason || "", at: new Date() } },
    },
    { new: true }
  );

  if (!updated) return null;

  await releaseSlots(updated.scheduleId, updated.slotsBooked);

  if (updated.paymentStatus === "PAID") {
    updated.paymentStatus = "REFUND_PENDING";
    await updated.save();
  }

  return updated;
};

const getVendorId = (req, res) => {
  const id = req.vendor?._id || req.user?._id;
  if (!id) {
    fail(res, 401, "Vendor authentication required");
    return null;
  }
  return id;
};

const findVendorBooking = async (req, res, vendorId) => {
  if (!isValidId(req.params.id)) {
    fail(res, 400, "Invalid booking ID");
    return null;
  }
  const booking = await ActivityBooking.findOne({ _id: req.params.id, vendorId });
  if (!booking) {
    fail(res, 404, "Booking not found");
    return null;
  }
  return booking;
};

/* =====================================================
   PUBLIC
===================================================== */

// GET /api/activity-bookings/public/activities
const getPublicActivities = async (req, res) => {
  try {
    const { city, category, activityType, search, minPrice, maxPrice } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));

    const filter = { status: "APPROVED", isActive: true };

    if (city) filter["location.city"] = { $regex: `^${escapeRegex(city.trim())}$`, $options: "i" };
    if (category) filter.category = category;
    if (activityType) filter.activityType = activityType.toUpperCase();

    if (search?.trim()) {
      const rx = { $regex: escapeRegex(search.trim()), $options: "i" };
      filter.$or = [{ title: rx }, { category: rx }, { "location.city": rx }];
    }

    if (minPrice || maxPrice) {
      filter["pricing.adult"] = {};
      if (minPrice) filter["pricing.adult"].$gte = Number(minPrice);
      if (maxPrice) filter["pricing.adult"].$lte = Number(maxPrice);
    }

    const [data, total] = await Promise.all([
      Activity.find(filter)
        .select("title slug category activityType shortDescription location duration thumbnail pricing currency maxGuests instantConfirmation")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Activity.countDocuments(filter),
    ]);

    return res.json({ success: true, count: data.length, total, page, pages: Math.ceil(total / limit), data });
  } catch (error) {
    console.error("GET PUBLIC ACTIVITIES ERROR:", error);
    return fail(res, 500, "Failed to fetch activities");
  }
};

// GET /api/activity-bookings/public/activities/:idOrSlug
const getPublicActivityDetails = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const query = isValidId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };

    const activity = await Activity.findOne({ ...query, status: "APPROVED", isActive: true }).select(
      "-termsAndConditions -rejectionReason"
    );
    if (!activity) return fail(res, 404, "Activity not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedules = await ActivitySchedule.find({
      activityId: activity._id,
      isActive: true,
      date: { $gte: today },
    })
      .select("date startTime endTime totalSlots bookedSlots pricing")
      .sort({ date: 1, startTime: 1 })
      .limit(100);

    const available = schedules
      .map((s) => ({
        _id: s._id,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        pricing: {
          adult: s.pricing?.adult ?? activity.pricing.adult,
          child: s.pricing?.child ?? activity.pricing.child,
          infant: s.pricing?.infant ?? activity.pricing.infant,
        },
        availableSlots: Math.max(0, s.totalSlots - s.bookedSlots),
      }))
      .filter((s) => s.availableSlots > 0);

    return res.json({ success: true, data: { activity, schedules: available } });
  } catch (error) {
    console.error("GET PUBLIC ACTIVITY ERROR:", error);
    return fail(res, 500, "Failed to fetch activity");
  }
};

/* =====================================================
   USER (CUSTOMER)  -> userAuth
===================================================== */

// POST /api/activity-bookings
const createActivityBooking = async (req, res) => {
  let reserved = null;

  try {
    const user = req.user;
    const { scheduleId, guests = {}, leadTraveller = {}, specialRequest } = req.body;

    if (!scheduleId || !isValidId(scheduleId)) return fail(res, 400, "Valid scheduleId is required");

    const adults = toInt(guests.adults, 0);
    const children = toInt(guests.children, 0);
    const infants = toInt(guests.infants, 0);

    if (adults < 1) return fail(res, 400, "At least 1 adult is required");
    if (children < 0 || infants < 0) return fail(res, 400, "Invalid guest count");

    const slotsNeeded = adults + children;
    const totalGuests = adults + children + infants;

    const name = String(leadTraveller.name || user.fullname || user.name || "").trim();
    const email = String(leadTraveller.email || user.email || "").trim().toLowerCase();
    const phone = String(leadTraveller.phone || user.phone || "").trim();

    if (!name) return fail(res, 400, "Lead traveller name is required");
    if (!EMAIL_RX.test(email)) return fail(res, 400, "Valid lead traveller email is required");
    if (!/^\+?\d{8,15}$/.test(phone.replace(/[\s-]/g, ""))) {
      return fail(res, 400, "Valid lead traveller phone is required");
    }

    const schedule = await ActivitySchedule.findById(scheduleId);
    if (!schedule || !schedule.isActive) return fail(res, 404, "Schedule not found or not available");

    const activity = await Activity.findById(schedule.activityId);
    if (!activity || !activity.isActive || activity.status !== "APPROVED") {
      return fail(res, 404, "Activity is not available for booking");
    }

    if (totalGuests > activity.maxGuests) {
      return fail(res, 400, `Maximum ${activity.maxGuests} guests allowed per booking`);
    }

    const startsAt = getStartDateTime(schedule);
    if (!startsAt || Number.isNaN(startsAt.getTime())) return fail(res, 400, "Schedule has invalid start time");

    const cutoffMs = (activity.bookingCutoffHours || 0) * 3600 * 1000;
    if (startsAt.getTime() - cutoffMs <= Date.now()) {
      return fail(res, 400, `Booking closed. Book at least ${activity.bookingCutoffHours || 0} hour(s) before start time`);
    }

    // Price server-side
    const price = {
      adult: schedule.pricing?.adult ?? activity.pricing?.adult ?? 0,
      child: schedule.pricing?.child ?? activity.pricing?.child ?? 0,
      infant: schedule.pricing?.infant ?? activity.pricing?.infant ?? 0,
    };
    const totalAmount = adults * price.adult + children * price.child + infants * price.infant;

    // Atomic slot reserve (overbooking nahi hogi)
    const updatedSchedule = await ActivitySchedule.findOneAndUpdate(
      {
        _id: schedule._id,
        isActive: true,
        $expr: { $lte: [{ $add: ["$bookedSlots", slotsNeeded] }, "$totalSlots"] },
      },
      { $inc: { bookedSlots: slotsNeeded } },
      { new: true }
    );

    if (!updatedSchedule) {
      const fresh = await ActivitySchedule.findById(schedule._id).select("totalSlots bookedSlots");
      const available = fresh ? Math.max(0, fresh.totalSlots - fresh.bookedSlots) : 0;
      return fail(res, 409, `Not enough slots available. Only ${available} slot(s) left`, { availableSlots: available });
    }

    reserved = { scheduleId: schedule._id, slots: slotsNeeded };

    const status = activity.instantConfirmation ? "CONFIRMED" : "PENDING";

    const booking = await ActivityBooking.create({
      bookingId: generateBookingId(),
      userId: user._id,
      vendorId: activity.vendorId,
      activityId: activity._id,
      scheduleId: schedule._id,

      guests: { adults, children, infants },
      slotsBooked: slotsNeeded,
      leadTraveller: { name, email, phone },
      specialRequest: specialRequest ? String(specialRequest).trim().slice(0, 500) : undefined,

      priceSnapshot: price,
      totalAmount,
      currency: activity.currency || "INR",

      activitySnapshot: {
        title: activity.title,
        thumbnail: activity.thumbnail,
        city: activity.location?.city,
        meetingPoint: activity.meetingPoint,
        cancellationPolicy: activity.cancellationPolicy,
      },
      activityDate: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      startsAt,

      status,
      confirmedAt: status === "CONFIRMED" ? new Date() : undefined,
      paymentStatus: "PENDING", // TODO: payment verify hone par "PAID"
      statusHistory: [{ status, by: "SYSTEM", note: "Booking created" }],
    });

    reserved = null;

    return res.status(201).json({
      success: true,
      message:
        status === "CONFIRMED"
          ? "Booking confirmed successfully"
          : "Booking request sent. Waiting for vendor confirmation",
      data: booking,
    });
  } catch (error) {
    console.error("CREATE ACTIVITY BOOKING ERROR:", error);

    if (reserved) {
      try {
        await releaseSlots(reserved.scheduleId, reserved.slots);
      } catch (e) {
        console.error("SLOT ROLLBACK ERROR:", e.message);
      }
    }

    return fail(res, 500, "Failed to create booking", { error: error.message });
  }
};

// GET /api/activity-bookings/my
const getMyActivityBookings = async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

    const filter = { userId: req.user._id };
    if (status) filter.status = status.toUpperCase();
    if (upcoming === "true") filter.startsAt = { $gte: new Date() };
    if (upcoming === "false") filter.startsAt = { $lt: new Date() };

    const [data, total] = await Promise.all([
      ActivityBooking.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      ActivityBooking.countDocuments(filter),
    ]);

    return res.json({ success: true, count: data.length, total, page, pages: Math.ceil(total / limit), data });
  } catch (error) {
    console.error("GET MY BOOKINGS ERROR:", error);
    return fail(res, 500, "Failed to fetch bookings", { error: error.message });
  }
};

// GET /api/activity-bookings/my/:id   (_id ya bookingId)
const getMyActivityBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = isValidId(id) ? { _id: id } : { bookingId: id.toUpperCase() };

    const booking = await ActivityBooking.findOne({ ...query, userId: req.user._id }).populate({
      path: "activityId",
      select: "title slug images location meetingPoint pickupAvailable pickupDetails inclusions exclusions requirements cancellationPolicy",
    });

    if (!booking) return fail(res, 404, "Booking not found");
    return res.json({ success: true, data: booking });
  } catch (error) {
    console.error("GET BOOKING ERROR:", error);
    return fail(res, 500, "Failed to fetch booking", { error: error.message });
  }
};

// PATCH /api/activity-bookings/my/:id/cancel
const cancelMyActivityBooking = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 400, "Invalid booking ID");

    const booking = await ActivityBooking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return fail(res, 404, "Booking not found");

    if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
      return fail(res, 400, `Booking is already ${booking.status.toLowerCase()}`);
    }
    if (booking.startsAt <= new Date()) return fail(res, 400, "Activity has already started. Cannot cancel");

    const cancelled = await cancelBookingAtomic(booking, {
      by: "USER",
      reason: String(req.body?.reason || "Cancelled by user").trim().slice(0, 300),
    });
    if (!cancelled) return fail(res, 409, "Booking could not be cancelled (status changed)");

    return res.json({ success: true, message: "Booking cancelled successfully", data: cancelled });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);
    return fail(res, 500, "Failed to cancel booking", { error: error.message });
  }
};

/* =====================================================
   VENDOR  -> protect
===================================================== */

// GET /api/activity-bookings/vendor
const getVendorActivityBookings = async (req, res) => {
  try {
    const vendorId = getVendorId(req, res);
    if (!vendorId) return;

    const { status, activityId, scheduleId, date, paymentStatus } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

    const filter = { vendorId };
    if (status) filter.status = status.toUpperCase();
    if (paymentStatus) filter.paymentStatus = paymentStatus.toUpperCase();

    if (activityId) {
      if (!isValidId(activityId)) return fail(res, 400, "Invalid activityId");
      filter.activityId = activityId;
    }
    if (scheduleId) {
      if (!isValidId(scheduleId)) return fail(res, 400, "Invalid scheduleId");
      filter.scheduleId = scheduleId;
    }
    if (date) {
      const start = new Date(date);
      if (Number.isNaN(start.getTime())) return fail(res, 400, "Invalid date");
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      filter.activityDate = { $gte: start, $lt: end };
    }

    const [data, total, stats] = await Promise.all([
      ActivityBooking.find(filter)
        .populate("userId", "fullname name email phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ActivityBooking.countDocuments(filter),
      ActivityBooking.aggregate([
        { $match: { vendorId: new mongoose.Types.ObjectId(String(vendorId)) } },
        { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$totalAmount" } } },
      ]),
    ]);

    return res.json({ success: true, count: data.length, total, page, pages: Math.ceil(total / limit), stats, data });
  } catch (error) {
    console.error("VENDOR GET BOOKINGS ERROR:", error);
    return fail(res, 500, "Failed to fetch bookings", { error: error.message });
  }
};

// GET /api/activity-bookings/vendor/:id
const getVendorActivityBookingById = async (req, res) => {
  try {
    const vendorId = getVendorId(req, res);
    if (!vendorId) return;
    const booking = await findVendorBooking(req, res, vendorId);
    if (!booking) return;

    await booking.populate("userId", "fullname name email phone");
    return res.json({ success: true, data: booking });
  } catch (error) {
    console.error("VENDOR GET BOOKING ERROR:", error);
    return fail(res, 500, "Failed to fetch booking", { error: error.message });
  }
};

// PATCH /api/activity-bookings/vendor/:id/confirm
const confirmActivityBooking = async (req, res) => {
  try {
    const vendorId = getVendorId(req, res);
    if (!vendorId) return;
    const booking = await findVendorBooking(req, res, vendorId);
    if (!booking) return;

    if (booking.startsAt <= new Date()) return fail(res, 400, "Activity time has already passed");

    const updated = await ActivityBooking.findOneAndUpdate(
      { _id: booking._id, status: "PENDING" },
      {
        $set: { status: "CONFIRMED", confirmedAt: new Date() },
        $push: { statusHistory: { status: "CONFIRMED", by: "VENDOR", note: "Confirmed by vendor" } },
      },
      { new: true }
    );
    if (!updated) return fail(res, 400, `Only PENDING bookings can be confirmed (current: ${booking.status})`);

    return res.json({ success: true, message: "Booking confirmed", data: updated });
  } catch (error) {
    console.error("CONFIRM BOOKING ERROR:", error);
    return fail(res, 500, "Failed to confirm booking", { error: error.message });
  }
};

// PATCH /api/activity-bookings/vendor/:id/reject
const rejectActivityBooking = async (req, res) => {
  try {
    const vendorId = getVendorId(req, res);
    if (!vendorId) return;
    const booking = await findVendorBooking(req, res, vendorId);
    if (!booking) return;

    if (booking.status !== "PENDING") {
      return fail(res, 400, `Only PENDING bookings can be rejected (current: ${booking.status})`);
    }

    const updated = await cancelBookingAtomic(booking, {
      by: "VENDOR",
      reason: String(req.body?.reason || "Rejected by vendor").trim().slice(0, 300),
      finalStatus: "REJECTED",
    });
    if (!updated) return fail(res, 409, "Booking status changed, please refresh");

    return res.json({ success: true, message: "Booking rejected", data: updated });
  } catch (error) {
    console.error("REJECT BOOKING ERROR:", error);
    return fail(res, 500, "Failed to reject booking", { error: error.message });
  }
};

// PATCH /api/activity-bookings/vendor/:id/cancel
const cancelActivityBookingByVendor = async (req, res) => {
  try {
    const vendorId = getVendorId(req, res);
    if (!vendorId) return;
    const booking = await findVendorBooking(req, res, vendorId);
    if (!booking) return;

    if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
      return fail(res, 400, `Booking is already ${booking.status.toLowerCase()}`);
    }

    const reason = String(req.body?.reason || "").trim();
    if (!reason) return fail(res, 400, "Cancellation reason is required");

    const updated = await cancelBookingAtomic(booking, { by: "VENDOR", reason: reason.slice(0, 300) });
    if (!updated) return fail(res, 409, "Booking status changed, please refresh");

    return res.json({ success: true, message: "Booking cancelled", data: updated });
  } catch (error) {
    console.error("VENDOR CANCEL BOOKING ERROR:", error);
    return fail(res, 500, "Failed to cancel booking", { error: error.message });
  }
};

// PATCH /api/activity-bookings/vendor/:id/complete
const completeActivityBooking = async (req, res) => {
  try {
    const vendorId = getVendorId(req, res);
    if (!vendorId) return;
    const booking = await findVendorBooking(req, res, vendorId);
    if (!booking) return;

    if (booking.startsAt > new Date()) return fail(res, 400, "Activity has not started yet");

    const updated = await ActivityBooking.findOneAndUpdate(
      { _id: booking._id, status: "CONFIRMED" },
      {
        $set: { status: "COMPLETED", completedAt: new Date() },
        $push: { statusHistory: { status: "COMPLETED", by: "VENDOR", note: "Marked completed" } },
      },
      { new: true }
    );
    if (!updated) return fail(res, 400, `Only CONFIRMED bookings can be completed (current: ${booking.status})`);

    return res.json({ success: true, message: "Booking marked as completed", data: updated });
  } catch (error) {
    console.error("COMPLETE BOOKING ERROR:", error);
    return fail(res, 500, "Failed to complete booking", { error: error.message });
  }
};

module.exports = {
  // public
  getPublicActivities,
  getPublicActivityDetails,
  // user
  createActivityBooking,
  getMyActivityBookings,
  getMyActivityBookingById,
  cancelMyActivityBooking,
  // vendor
  getVendorActivityBookings,
  getVendorActivityBookingById,
  confirmActivityBooking,
  rejectActivityBooking,
  cancelActivityBookingByVendor,
  completeActivityBooking,
};