const Resort = require("../models/Resort.model");


/* ==========================================================
                    CREATE RESORT
========================================================== */

exports.createResort = async (req, res) => {
  try {
    const {
      name,
      propertyType,
      starRating,
      shortDescription,
      description,
      contact,
      address,
      checkInTime,
      checkOutTime,
      amenities,
      policies,
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Resort name is required.",
      });
    }


    // ==========================================
    // CREATE RESORT
    // vendor comes ONLY from JWT
    // ==========================================

    const resort = await Resort.create({
      vendor: req.vendor._id,

      name,
      propertyType: propertyType || "resort",

      starRating: starRating || 3,

      shortDescription: shortDescription || "",

      description: description || "",

      contact: contact || {},

      address: address || {},

      checkInTime: checkInTime || "14:00",

      checkOutTime: checkOutTime || "11:00",

      amenities: amenities || [],

      policies: policies || {},

      status: "DRAFT",
    });


    return res.status(201).json({
      success: true,
      message: "Resort created successfully.",
      resort,
    });

  } catch (error) {
    console.error("Create Resort Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    GET MY RESORTS
========================================================== */

exports.getMyResorts = async (req, res) => {
  try {

    const resorts = await Resort.find({
      vendor: req.vendor._id,
    })
      .sort({ createdAt: -1 });


    return res.status(200).json({
      success: true,
      total: resorts.length,
      resorts,
    });

  } catch (error) {
    console.error("Get My Resorts Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    GET SINGLE RESORT
========================================================== */

exports.getSingleResort = async (req, res) => {
  try {

    const resort = await Resort.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });


    if (!resort) {
      return res.status(404).json({
        success: false,
        message: "Resort not found.",
      });
    }


    return res.status(200).json({
      success: true,
      resort,
    });

  } catch (error) {
    console.error("Get Single Resort Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    UPDATE RESORT
========================================================== */

exports.updateResort = async (req, res) => {
  try {

    const resort = await Resort.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });


    if (!resort) {
      return res.status(404).json({
        success: false,
        message: "Resort not found.",
      });
    }


    const {
      name,
      propertyType,
      starRating,
      shortDescription,
      description,
      contact,
      address,
      checkInTime,
      checkOutTime,
      amenities,
      policies,
    } = req.body;


    // ==========================================
    // UPDATE ONLY PROVIDED FIELDS
    // ==========================================

    if (name !== undefined) {
      resort.name = name;
    }

    if (propertyType !== undefined) {
      resort.propertyType = propertyType;
    }

    if (starRating !== undefined) {
      resort.starRating = starRating;
    }

    if (shortDescription !== undefined) {
      resort.shortDescription = shortDescription;
    }

    if (description !== undefined) {
      resort.description = description;
    }

    if (contact !== undefined) {
      resort.contact = contact;
    }

    if (address !== undefined) {
      resort.address = address;
    }

    if (checkInTime !== undefined) {
      resort.checkInTime = checkInTime;
    }

    if (checkOutTime !== undefined) {
      resort.checkOutTime = checkOutTime;
    }

    if (amenities !== undefined) {
      resort.amenities = amenities;
    }

    if (policies !== undefined) {
      resort.policies = policies;
    }


    await resort.save();


    return res.status(200).json({
      success: true,
      message: "Resort updated successfully.",
      resort,
    });

  } catch (error) {
    console.error("Update Resort Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    DELETE RESORT
========================================================== */

exports.deleteResort = async (req, res) => {
  try {

    const resort = await Resort.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor._id,
    });


    if (!resort) {
      return res.status(404).json({
        success: false,
        message: "Resort not found or access denied.",
      });
    }


    return res.status(200).json({
      success: true,
      message: "Resort deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Resort Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};