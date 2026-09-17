const Nightclub = require("../models/Nightclub");

/* ============================================================
   CREATE NIGHTCLUB
   POST /api/nightclubs
============================================================ */
const createNightclub = async (req, res) => {
  try {
    const {
      clubName,
      legalBusinessName,
      description,

      email,
      phone,
      alternatePhone,
      website,

      address,
      landmark,
      city,
      state,
      country,
      pincode,
      latitude,
      longitude,

      businessType,
      gstNumber,
      panNumber,

      clubType,
      capacity,
      danceFloorAvailable,
      liveMusicAvailable,
      djAvailable,
      vipAvailable,
      privatePartyAvailable,
      foodAvailable,
      parkingAvailable,

      openingTime,
      closingTime,
      openDays,

      entryFee,
      coupleEntryFee,
      stagEntryFee,

      images,
      coverImage,

      licenseNumber,
      licenseDocument,

      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
    } = req.body;

    // ==============================
    // VALIDATION
    // ==============================
    if (!clubName || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message:
          "clubName, phone, address, city, state and pincode are required",
      });
    }

    // Vendor middleware se
    const vendorId = req.vendor?._id || req.vendor?.id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    // ==============================
    // CREATE
    // ==============================
    const nightclub = await Nightclub.create({
      vendor: vendorId,

      clubName,
      legalBusinessName,
      description,

      email,
      phone,
      alternatePhone,
      website,

      address,
      landmark,
      city,
      state,
      country: country || "India",
      pincode,
      latitude,
      longitude,

      businessType,
      gstNumber,
      panNumber,

      clubType,
      capacity,
      danceFloorAvailable,
      liveMusicAvailable,
      djAvailable,
      vipAvailable,
      privatePartyAvailable,
      foodAvailable,
      parkingAvailable,

      openingTime,
      closingTime,
      openDays,

      entryFee,
      coupleEntryFee,
      stagEntryFee,

      images,
      coverImage,

      licenseNumber,
      licenseDocument,

      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,

      status: "PENDING",
      isApproved: false,
    });

    return res.status(201).json({
      success: true,
      message: "Nightclub registered successfully",
      data: nightclub,
    });
  } catch (error) {
    console.error("Create Nightclub Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register nightclub",
    });
  }
};


/* ============================================================
   GET ALL NIGHTCLUBS
   GET /api/nightclubs
============================================================ */
const getAllNightclubs = async (req, res) => {
  try {
    const {
      status,
      city,
      state,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (city) {
      filter.city = new RegExp(city, "i");
    }

    if (state) {
      filter.state = new RegExp(state, "i");
    }

    if (search) {
      filter.$or = [
        { clubName: new RegExp(search, "i") },
        { city: new RegExp(search, "i") },
        { state: new RegExp(search, "i") },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const total = await Nightclub.countDocuments(filter);

    const nightclubs = await Nightclub.find(filter)
      .populate("vendor", "name email phone companyName businessName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      message: "Nightclubs fetched successfully",

      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },

      data: nightclubs,
    });
  } catch (error) {
    console.error("Get All Nightclubs Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch nightclubs",
    });
  }
};


/* ============================================================
   GET MY NIGHTCLUBS
   GET /api/nightclubs/my
============================================================ */
const getMyNightclubs = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.vendor?.id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    const nightclubs = await Nightclub.find({
      vendor: vendorId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: nightclubs.length,
      data: nightclubs,
    });
  } catch (error) {
    console.error("Get My Nightclubs Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch your nightclubs",
    });
  }
};


/* ============================================================
   GET SINGLE NIGHTCLUB
   GET /api/nightclubs/:id
============================================================ */
const getNightclubById = async (req, res) => {
  try {
    const nightclub = await Nightclub.findById(req.params.id).populate(
      "vendor",
      "name email phone companyName businessName"
    );

    if (!nightclub) {
      return res.status(404).json({
        success: false,
        message: "Nightclub not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: nightclub,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch nightclub",
    });
  }
};


/* ============================================================
   UPDATE NIGHTCLUB
   PUT /api/nightclubs/:id
============================================================ */
const updateNightclub = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.vendor?.id;

    const nightclub = await Nightclub.findById(req.params.id);

    if (!nightclub) {
      return res.status(404).json({
        success: false,
        message: "Nightclub not found",
      });
    }

    // Sirf owner update kare
    if (nightclub.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this nightclub",
      });
    }

    // Approval ke baad changes dobara review me jayenge
    delete req.body.vendor;
    delete req.body.isApproved;

    const updatedNightclub = await Nightclub.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...req.body,
          status: "PENDING",
          rejectionReason: "",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Nightclub updated successfully and sent for review",
      data: updatedNightclub,
    });
  } catch (error) {
    console.error("Update Nightclub Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update nightclub",
    });
  }
};


/* ============================================================
   DELETE NIGHTCLUB
   DELETE /api/nightclubs/:id
============================================================ */
const deleteNightclub = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.vendor?.id;

    const nightclub = await Nightclub.findById(req.params.id);

    if (!nightclub) {
      return res.status(404).json({
        success: false,
        message: "Nightclub not found",
      });
    }

    if (nightclub.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this nightclub",
      });
    }

    await Nightclub.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Nightclub deleted successfully",
    });
  } catch (error) {
    console.error("Delete Nightclub Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete nightclub",
    });
  }
};


/* ============================================================
   ADMIN APPROVE
   PUT /api/nightclubs/:id/approve
============================================================ */
const approveNightclub = async (req, res) => {
  try {
    const nightclub = await Nightclub.findByIdAndUpdate(
      req.params.id,
      {
        status: "APPROVED",
        isApproved: true,
        rejectionReason: "",
      },
      {
        new: true,
      }
    );

    if (!nightclub) {
      return res.status(404).json({
        success: false,
        message: "Nightclub not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Nightclub approved successfully",
      data: nightclub,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to approve nightclub",
    });
  }
};


/* ============================================================
   ADMIN REJECT
   PUT /api/nightclubs/:id/reject
============================================================ */
const rejectNightclub = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const nightclub = await Nightclub.findByIdAndUpdate(
      req.params.id,
      {
        status: "REJECTED",
        isApproved: false,
        rejectionReason: rejectionReason || "",
      },
      {
        new: true,
      }
    );

    if (!nightclub) {
      return res.status(404).json({
        success: false,
        message: "Nightclub not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Nightclub rejected",
      data: nightclub,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reject nightclub",
    });
  }
};


module.exports = {
  createNightclub,
  getAllNightclubs,
  getMyNightclubs,
  getNightclubById,
  updateNightclub,
  deleteNightclub,
  approveNightclub,
  rejectNightclub,
};