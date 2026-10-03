const NightClub = require("../models/NightClub.model");
const cloudinary = require("../config/cloudinary");

// =====================================================
// HELPERS
// =====================================================

const getVendorId = (req) =>
  req.vendor?._id || req.user?._id || req.vendor?.id || req.user?.id;

const uploadToCloudinary = (file, folder, resourceType = "auto") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });

// "a, b, c" or ["a","b"] -> ["a","b","c"]
const parseList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

// "true" / true -> true, "false" / false -> false, undefined -> fallback
const parseBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === "true";
};

const parseNumber = (value, fallback = null) => {
  if (value === undefined || value === null || value === "") return fallback;
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};

const unauthorized = (res) =>
  res.status(401).json({ success: false, message: "Authentication required" });

const notFound = (res) =>
  res.status(404).json({ success: false, message: "Night club not found" });

const serverError = (res, label, error) => {
  console.error(`${label}:`, error);
  return res.status(500).json({ success: false, message: error.message });
};

const BOOLEAN_FIELDS = [
  "liveDJAvailable",
  "liveBandAvailable",
  "danceFloorAvailable",
  "dressCodeRequired",
  "stagAllowed",
  "coupleEntryAvailable",
  "alcoholAvailable",
  "parkingAvailable",
  "valetAvailable",
  "vipSectionAvailable",
  "privateBoothAvailable",
  "smokingAreaAvailable",
  "wheelchairAccessible",
];

const NUMBER_FIELDS = ["latitude", "longitude", "totalCapacity", "minimumAge"];

const TEXT_FIELDS = [
  "name",
  "description",
  "venueType",
  "address",
  "city",
  "state",
  "country",
  "pincode",
  "phone",
  "email",
  "website",
  "instagram",
  "dressCode",
  "openingTime",
  "closingTime",
  "lastEntryTime",
  "alcoholLicenseNumber",
  "exciseLicenseNumber",
  "fireNOCNumber",
  "cancellationPolicy",
  "refundPolicy",
  "entryPolicy",
];

const LIST_FIELDS = [
  "musicGenres",
  "residentDJs",
  "operatingDays",
  "prohibitedItems",
];

// =====================================================
// CREATE NIGHT CLUB
// =====================================================

exports.createNightClub = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return unauthorized(res);

    const files = req.files || {};
    const body = req.body;

    // ---------- uploads ----------
    let logo = "";
    if (files.logo?.[0]) {
      logo = await uploadToCloudinary(files.logo[0], "nightclubs/logos", "image");
    }

    let coverImage = "";
    if (files.coverImage?.[0]) {
      coverImage = await uploadToCloudinary(files.coverImage[0], "nightclubs/covers", "image");
    }

    let images = [];
    if (files.images?.length) {
      images = await Promise.all(
        files.images.map((file) => uploadToCloudinary(file, "nightclubs/gallery", "image"))
      );
    }

    let videos = [];
    if (files.videos?.length) {
      videos = await Promise.all(
        files.videos.map((file) => uploadToCloudinary(file, "nightclubs/videos", "video"))
      );
    }

    let alcoholLicenseDocument = "";
    if (files.alcoholLicenseDocument?.[0]) {
      alcoholLicenseDocument = await uploadToCloudinary(
        files.alcoholLicenseDocument[0], "nightclubs/documents", "auto"
      );
    }

    let exciseLicenseDocument = "";
    if (files.exciseLicenseDocument?.[0]) {
      exciseLicenseDocument = await uploadToCloudinary(
        files.exciseLicenseDocument[0], "nightclubs/documents", "auto"
      );
    }

    let fireNOCDocument = "";
    if (files.fireNOCDocument?.[0]) {
      fireNOCDocument = await uploadToCloudinary(
        files.fireNOCDocument[0], "nightclubs/documents", "auto"
      );
    }

    // ---------- create ----------
    const club = await NightClub.create({
      vendorId,

      name: body.name,
      description: body.description,
      venueType: body.venueType,

      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      pincode: body.pincode,
      latitude: parseNumber(body.latitude),
      longitude: parseNumber(body.longitude),

      phone: body.phone,
      email: body.email,
      website: body.website,
      instagram: body.instagram,

      logo,
      coverImage,
      images,
      videos,

      totalCapacity: parseNumber(body.totalCapacity, 0),

      musicGenres: parseList(body.musicGenres),
      residentDJs: parseList(body.residentDJs),
      liveDJAvailable: parseBool(body.liveDJAvailable, false),
      liveBandAvailable: parseBool(body.liveBandAvailable, false),
      danceFloorAvailable: parseBool(body.danceFloorAvailable, true),

      minimumAge: parseNumber(body.minimumAge, 18),
      dressCodeRequired: parseBool(body.dressCodeRequired, false),
      dressCode: body.dressCode,
      stagAllowed: parseBool(body.stagAllowed, true),
      coupleEntryAvailable: parseBool(body.coupleEntryAvailable, true),

      operatingDays: parseList(body.operatingDays),
      openingTime: body.openingTime,
      closingTime: body.closingTime,
      lastEntryTime: body.lastEntryTime,

      alcoholAvailable: parseBool(body.alcoholAvailable, false),
      parkingAvailable: parseBool(body.parkingAvailable, false),
      valetAvailable: parseBool(body.valetAvailable, false),
      vipSectionAvailable: parseBool(body.vipSectionAvailable, false),
      privateBoothAvailable: parseBool(body.privateBoothAvailable, false),
      smokingAreaAvailable: parseBool(body.smokingAreaAvailable, false),
      wheelchairAccessible: parseBool(body.wheelchairAccessible, false),

      alcoholLicenseNumber: body.alcoholLicenseNumber,
      alcoholLicenseDocument,
      exciseLicenseNumber: body.exciseLicenseNumber,
      exciseLicenseDocument,
      fireNOCNumber: body.fireNOCNumber,
      fireNOCDocument,

      cancellationPolicy: body.cancellationPolicy,
      refundPolicy: body.refundPolicy,
      entryPolicy: body.entryPolicy,
      prohibitedItems: parseList(body.prohibitedItems),

      status: "draft",
      isPublished: false,
    });

    return res.status(201).json({
      success: true,
      message: "Night club created successfully",
      data: club,
    });
  } catch (error) {
    return serverError(res, "CREATE NIGHT CLUB ERROR", error);
  }
};

// =====================================================
// GET MY NIGHT CLUBS
// =====================================================

exports.getMyNightClubs = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return unauthorized(res);

    const clubs = await NightClub.find({ vendorId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: clubs.length,
      data: clubs,
    });
  } catch (error) {
    return serverError(res, "GET MY NIGHT CLUBS ERROR", error);
  }
};

// =====================================================
// GET SINGLE NIGHT CLUB
// =====================================================

exports.getNightClubById = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return unauthorized(res);

    const club = await NightClub.findOne({ _id: req.params.id, vendorId });
    if (!club) return notFound(res);

    return res.status(200).json({ success: true, data: club });
  } catch (error) {
    return serverError(res, "GET NIGHT CLUB ERROR", error);
  }
};

// =====================================================
// UPDATE NIGHT CLUB
// =====================================================

exports.updateNightClub = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return unauthorized(res);

    // _id + vendorId => vendor can update only his own club
    const club = await NightClub.findOne({ _id: req.params.id, vendorId });
    if (!club) return notFound(res);

    const body = req.body;

    // ---------- text fields ----------
    TEXT_FIELDS.forEach((field) => {
      if (body[field] !== undefined) club[field] = body[field];
    });

    // ---------- numbers ----------
    NUMBER_FIELDS.forEach((field) => {
      if (body[field] !== undefined) {
        const fallback = field === "minimumAge" ? 18 : field === "totalCapacity" ? 0 : null;
        club[field] = parseNumber(body[field], fallback);
      }
    });

    // ---------- booleans ----------
    BOOLEAN_FIELDS.forEach((field) => {
      if (body[field] !== undefined) club[field] = parseBool(body[field]);
    });

    // ---------- arrays ----------
    LIST_FIELDS.forEach((field) => {
      if (body[field] !== undefined) club[field] = parseList(body[field]);
    });

    // ---------- files ----------
    const files = req.files || {};

    if (files.logo?.[0]) {
      club.logo = await uploadToCloudinary(files.logo[0], "nightclubs/logos", "image");
    }

    if (files.coverImage?.[0]) {
      club.coverImage = await uploadToCloudinary(files.coverImage[0], "nightclubs/covers", "image");
    }

    if (files.images?.length) {
      const newImages = await Promise.all(
        files.images.map((file) => uploadToCloudinary(file, "nightclubs/gallery", "image"))
      );
      club.images = [...(club.images || []), ...newImages];
    }

    if (files.videos?.length) {
      const newVideos = await Promise.all(
        files.videos.map((file) => uploadToCloudinary(file, "nightclubs/videos", "video"))
      );
      club.videos = [...(club.videos || []), ...newVideos];
    }

    if (files.alcoholLicenseDocument?.[0]) {
      club.alcoholLicenseDocument = await uploadToCloudinary(
        files.alcoholLicenseDocument[0], "nightclubs/documents", "auto"
      );
    }

    if (files.exciseLicenseDocument?.[0]) {
      club.exciseLicenseDocument = await uploadToCloudinary(
        files.exciseLicenseDocument[0], "nightclubs/documents", "auto"
      );
    }

    if (files.fireNOCDocument?.[0]) {
      club.fireNOCDocument = await uploadToCloudinary(
        files.fireNOCDocument[0], "nightclubs/documents", "auto"
      );
    }

    // ---------- re-review ----------
    // Draft stays draft (vendor submits when ready).
    // Any other status goes back to pending for admin review.
    const wasDraft = club.status === "draft";

    if (!wasDraft) {
      club.status = "pending";
      club.isPublished = false;
      club.rejectionReason = "";
    }

    await club.save();

    return res.status(200).json({
      success: true,
      message: wasDraft
        ? "Night club updated successfully"
        : "Night club updated successfully and sent for review",
      data: club,
    });
  } catch (error) {
    return serverError(res, "UPDATE NIGHT CLUB ERROR", error);
  }
};

// =====================================================
// DELETE NIGHT CLUB
// =====================================================

exports.deleteNightClub = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return unauthorized(res);

    const club = await NightClub.findOneAndDelete({ _id: req.params.id, vendorId });
    if (!club) return notFound(res);

    return res.status(200).json({
      success: true,
      message: "Night club deleted successfully",
    });
  } catch (error) {
    return serverError(res, "DELETE NIGHT CLUB ERROR", error);
  }
};

// =====================================================
// REMOVE ONE IMAGE / VIDEO
// =====================================================

exports.removeNightClubMedia = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return unauthorized(res);

    const { type, url } = req.body;

    if (!["images", "videos"].includes(type) || !url) {
      return res.status(400).json({
        success: false,
        message: "type (images | videos) and url are required",
      });
    }

    const club = await NightClub.findOne({ _id: req.params.id, vendorId });
    if (!club) return notFound(res);

    club[type] = (club[type] || []).filter((item) => item !== url);
    await club.save();

    return res.status(200).json({ success: true, data: club });
  } catch (error) {
    return serverError(res, "REMOVE MEDIA ERROR", error);
  }
};

// =====================================================
// SUBMIT FOR ADMIN APPROVAL
// =====================================================

exports.submitNightClub = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return unauthorized(res);

    const club = await NightClub.findOne({ _id: req.params.id, vendorId });
    if (!club) return notFound(res);

    if (club.status === "pending") {
      return res.status(400).json({
        success: false,
        message: "Night club is already pending for approval",
      });
    }

    if (club.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Night club is already approved",
      });
    }

    if (!club.name || !club.address || !club.city) {
      return res.status(400).json({
        success: false,
        message: "Please complete club name, address and city before submitting",
      });
    }

    club.status = "pending";
    club.isPublished = false;
    club.rejectionReason = "";

    await club.save();

    return res.status(200).json({
      success: true,
      message: "Night club submitted for admin approval",
      data: club,
    });
  } catch (error) {
    return serverError(res, "SUBMIT NIGHT CLUB ERROR", error);
  }
};

// =====================================================
// PUBLISH
// =====================================================

exports.publishNightClub = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return unauthorized(res);

    const club = await NightClub.findOne({ _id: req.params.id, vendorId });
    if (!club) return notFound(res);

    if (club.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Night club must be approved by admin first",
      });
    }

    club.isPublished = true;
    await club.save();

    return res.status(200).json({
      success: true,
      message: "Night club published successfully",
      data: club,
    });
  } catch (error) {
    return serverError(res, "PUBLISH NIGHT CLUB ERROR", error);
  }
};

// =====================================================
// UNPUBLISH
// =====================================================

exports.unpublishNightClub = async (req, res) => {
  try {
    const vendorId = getVendorId(req);
    if (!vendorId) return unauthorized(res);

    const club = await NightClub.findOne({ _id: req.params.id, vendorId });
    if (!club) return notFound(res);

    club.isPublished = false;
    await club.save();

    return res.status(200).json({
      success: true,
      message: "Night club unpublished successfully",
      data: club,
    });
  } catch (error) {
    return serverError(res, "UNPUBLISH NIGHT CLUB ERROR", error);
  }
};