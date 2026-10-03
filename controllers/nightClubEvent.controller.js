
const NightClubEvent = require("../models/NightClubEvent.model");
const NightClub = require("../models/NightClub.model");

// ============================================================
// GET VENDOR ID
// ============================================================

const getVendorId = (req) => {
  return (
    req.vendor?._id ||
    req.user?._id ||
    req.vendor?.id ||
    req.user?.id
  );
};

// ============================================================
// NORMALIZE ARRAY
// ============================================================

const normalizeArray = (value) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      // comma separated value
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

// ============================================================
// NORMALIZE BOOLEAN
// ============================================================

const normalizeBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return Boolean(value);
};

// ============================================================
// CREATE EVENT
// ============================================================

exports.createNightClubEvent = async (req, res) => {
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
      title,
      description,
      eventType,
      eventDate,
      startTime,
      endTime,
      lastEntryTime,
      artistName,
      djName,
      hostName,
      totalCapacity,
      bookingStartDate,
      bookingEndDate,
      minimumAge,
      dressCode,
      entryPolicy,

      stagEntryAvailable,
      coupleEntryAvailable,
      femaleEntryAvailable,
      maleEntryAvailable,

      stagEntryPrice,
      coupleEntryPrice,
      femaleEntryPrice,
      maleEntryPrice,

      vipAvailable,
      vipPrice,
      vipCapacity,

      tableBookingAvailable,
      boothBookingAvailable,

      musicGenres,
      prohibitedItems,
    } = req.body;

    // ========================================================
    // REQUIRED NIGHT CLUB
    // ========================================================

    if (!nightClubId) {
      return res.status(400).json({
        success: false,
        message: "nightClubId is required",
      });
    }

    // ========================================================
    // CHECK CLUB OWNERSHIP
    //
    // IMPORTANT:
    // NO APPROVAL CHECK HERE.
    // Vendor can create event even if club is draft/pending.
    // ========================================================

    const club = await NightClub.findOne({
      _id: nightClubId,
      vendorId,
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        message:
          "Night club not found or does not belong to this vendor",
      });
    }

    // ========================================================
    // REQUIRED FIELDS
    // ========================================================

    if (
      !title ||
      !eventDate ||
      !startTime ||
      !endTime ||
      !totalCapacity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, event date, start time, end time and total capacity are required",
      });
    }

    // ========================================================
    // DATE VALIDATION
    // ========================================================

    const parsedEventDate = new Date(eventDate);

    if (Number.isNaN(parsedEventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid eventDate",
      });
    }

    // ========================================================
    // CAPACITY VALIDATION
    // ========================================================

    const capacity = Number(totalCapacity);

    if (!Number.isFinite(capacity) || capacity <= 0) {
      return res.status(400).json({
        success: false,
        message: "totalCapacity must be greater than 0",
      });
    }

    // ========================================================
    // CHECK DUPLICATE EVENT
    // ========================================================

    const existingEvent = await NightClubEvent.findOne({
      vendorId,
      nightClubId,
      title: title.trim(),
      eventDate: parsedEventDate,
    });

    if (existingEvent) {
      return res.status(409).json({
        success: false,
        message:
          "An event with the same title already exists for this date",
        data: existingEvent,
      });
    }

    // ========================================================
    // FILES
    //
    // Expected multer fields:
    //
    // bannerImage
    // images[]
    // videos[]
    //
    // If files are already uploaded by another middleware,
    // these values can also be supplied in req.body.
    // ========================================================

    let bannerImage = "";

    let images = [];

    let videos = [];

    if (req.files) {
      // ------------------------------------------------------
      // bannerImage
      // ------------------------------------------------------

      if (req.files.bannerImage?.length) {
        bannerImage =
          req.files.bannerImage[0].path ||
          req.files.bannerImage[0].secure_url ||
          "";
      }

      // ------------------------------------------------------
      // images
      // ------------------------------------------------------

      if (req.files.images?.length) {
        images = req.files.images
          .map(
            (file) =>
              file.path ||
              file.secure_url ||
              file.location ||
              ""
          )
          .filter(Boolean);
      }

      // ------------------------------------------------------
      // videos
      // ------------------------------------------------------

      if (req.files.videos?.length) {
        videos = req.files.videos
          .map(
            (file) =>
              file.path ||
              file.secure_url ||
              file.location ||
              ""
          )
          .filter(Boolean);
      }
    }

    // ========================================================
    // BODY URL SUPPORT
    // ========================================================

    if (!bannerImage && req.body.bannerImage) {
      bannerImage = req.body.bannerImage;
    }

    if (!images.length && req.body.images) {
      images = normalizeArray(req.body.images);
    }

    if (!videos.length && req.body.videos) {
      videos = normalizeArray(req.body.videos);
    }

    // ========================================================
    // CREATE EVENT
    //
    // IMPORTANT:
    // Event starts as DRAFT.
    // No admin approval is required for creation.
    // ========================================================

    const event = await NightClubEvent.create({
      vendorId,
      nightClubId,

      title: title.trim(),

      description: description || "",

      eventType: eventType || "other",

      eventDate: parsedEventDate,

      startTime,

      endTime,

      lastEntryTime: lastEntryTime || "",

      artistName: artistName || "",

      djName: djName || "",

      hostName: hostName || "",

      bannerImage,

      images,

      videos,

      totalCapacity: capacity,

      availableCapacity: capacity,

      musicGenres: normalizeArray(musicGenres),

      stagEntryAvailable: normalizeBoolean(
        stagEntryAvailable,
        true
      ),

      coupleEntryAvailable: normalizeBoolean(
        coupleEntryAvailable,
        true
      ),

      femaleEntryAvailable: normalizeBoolean(
        femaleEntryAvailable,
        true
      ),

      maleEntryAvailable: normalizeBoolean(
        maleEntryAvailable,
        true
      ),

      stagEntryPrice: Number(stagEntryPrice || 0),

      coupleEntryPrice: Number(coupleEntryPrice || 0),

      femaleEntryPrice: Number(femaleEntryPrice || 0),

      maleEntryPrice: Number(maleEntryPrice || 0),

      vipAvailable: normalizeBoolean(
        vipAvailable,
        false
      ),

      vipPrice: Number(vipPrice || 0),

      vipCapacity: Number(vipCapacity || 0),

      tableBookingAvailable: normalizeBoolean(
        tableBookingAvailable,
        false
      ),

      boothBookingAvailable: normalizeBoolean(
        boothBookingAvailable,
        false
      ),

      minimumAge: Number(minimumAge || 18),

      dressCode: dressCode || "",

      entryPolicy: entryPolicy || "",

      prohibitedItems:
        normalizeArray(prohibitedItems),

      bookingStartDate: bookingStartDate
        ? new Date(bookingStartDate)
        : null,

      bookingEndDate: bookingEndDate
        ? new Date(bookingEndDate)
        : null,

      // ======================================================
      // VENDOR CAN CREATE EVENT DIRECTLY
      // ======================================================

      status: "draft",

      isPublished: false,
    });

    return res.status(201).json({
      success: true,
      message: "Night club event created successfully",
      data: event,
    });
  } catch (error) {
    console.error(
      "CREATE NIGHT CLUB EVENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create night club event",
    });
  }
};

// ============================================================
// GET MY EVENTS
// ============================================================

exports.getMyNightClubEvents = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const events = await NightClubEvent.find({
      vendorId,
    })
      .populate(
        "nightClubId",
        "name city address logo coverImage"
      )
      .sort({
        eventDate: 1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error(
      "GET MY NIGHT CLUB EVENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET SINGLE EVENT
// ============================================================

exports.getNightClubEvent = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const event = await NightClubEvent.findOne({
      _id: req.params.id,
      vendorId,
    }).populate(
      "nightClubId",
      "name city address phone logo coverImage"
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Night club event not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error(
      "GET NIGHT CLUB EVENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// UPDATE EVENT
// ============================================================

exports.updateNightClubEvent = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const event = await NightClubEvent.findOne({
      _id: req.params.id,
      vendorId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Night club event not found",
      });
    }

    // ========================================================
    // PREVENT VENDOR FROM CHANGING OWNERSHIP
    // ========================================================

    delete req.body.vendorId;

    if (req.body.nightClubId) {
      const club = await NightClub.findOne({
        _id: req.body.nightClubId,
        vendorId,
      });

      if (!club) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot assign this event to another vendor's night club",
        });
      }
    }

    // ========================================================
    // ARRAY FIELDS
    // ========================================================

    if (req.body.musicGenres !== undefined) {
      req.body.musicGenres =
        normalizeArray(req.body.musicGenres);
    }

    if (req.body.prohibitedItems !== undefined) {
      req.body.prohibitedItems =
        normalizeArray(req.body.prohibitedItems);
    }

    // ========================================================
    // BOOLEAN FIELDS
    // ========================================================

    const booleanFields = [
      "stagEntryAvailable",
      "coupleEntryAvailable",
      "femaleEntryAvailable",
      "maleEntryAvailable",
      "vipAvailable",
      "tableBookingAvailable",
      "boothBookingAvailable",
    ];

    booleanFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.body[field] =
          normalizeBoolean(req.body[field]);
      }
    });

    // ========================================================
    // NUMERIC FIELDS
    // ========================================================

    const numericFields = [
      "totalCapacity",
      "availableCapacity",
      "stagEntryPrice",
      "coupleEntryPrice",
      "femaleEntryPrice",
      "maleEntryPrice",
      "vipPrice",
      "vipCapacity",
      "minimumAge",
    ];

    numericFields.forEach((field) => {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== ""
      ) {
        req.body[field] = Number(
          req.body[field]
        );
      }
    });

    // ========================================================
    // DATE FIELDS
    // ========================================================

    if (req.body.eventDate) {
      req.body.eventDate = new Date(
        req.body.eventDate
      );
    }

    if (req.body.bookingStartDate) {
      req.body.bookingStartDate = new Date(
        req.body.bookingStartDate
      );
    }

    if (req.body.bookingEndDate) {
      req.body.bookingEndDate = new Date(
        req.body.bookingEndDate
      );
    }

    // ========================================================
    // UPDATE
    // ========================================================

    Object.assign(event, req.body);

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Night club event updated successfully",
      data: event,
    });
  } catch (error) {
    console.error(
      "UPDATE NIGHT CLUB EVENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// SUBMIT EVENT
// ============================================================

exports.submitNightClubEvent = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const event = await NightClubEvent.findOne({
      _id: req.params.id,
      vendorId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Night club event not found",
      });
    }

    event.status = "pending";
    event.isPublished = false;

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Night club event submitted successfully",
      data: event,
    });
  } catch (error) {
    console.error(
      "SUBMIT NIGHT CLUB EVENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// PUBLISH EVENT
//
// NO ADMIN APPROVAL REQUIRED
// ============================================================

exports.publishNightClubEvent = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const event = await NightClubEvent.findOne({
      _id: req.params.id,
      vendorId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Night club event not found",
      });
    }

    // ========================================================
    // NO APPROVAL CHECK
    //
    // Event can be published directly by vendor.
    // ========================================================

    event.status = "approved";
    event.isPublished = true;

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Night club event published successfully",
      data: event,
    });
  } catch (error) {
    console.error(
      "PUBLISH NIGHT CLUB EVENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// UNPUBLISH EVENT
// ============================================================

exports.unpublishNightClubEvent = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const event = await NightClubEvent.findOne({
      _id: req.params.id,
      vendorId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Night club event not found",
      });
    }

    event.isPublished = false;

    // Keep event available for future publishing
    event.status = "draft";

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Night club event unpublished successfully",
      data: event,
    });
  } catch (error) {
    console.error(
      "UNPUBLISH NIGHT CLUB EVENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// DELETE EVENT
// ============================================================

exports.deleteNightClubEvent = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const event = await NightClubEvent.findOne({
      _id: req.params.id,
      vendorId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Night club event not found",
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Night club event deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE NIGHT CLUB EVENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
