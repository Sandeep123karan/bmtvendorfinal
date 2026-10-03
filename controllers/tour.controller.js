const Tour = require("../models/Tour");

// ==========================================================
// CREATE TOUR
// POST /api/vendor/tours
// ==========================================================
const createTour = async (req, res) => {
  try {
    const vendorId = req.user?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    const {
      title,
      slug,
      shortDescription,
      description,
      category,
      location,
      duration,
      images,
      inclusions,
      exclusions,
      itinerary,
      pricing,
      maxGuests,
      meetingPoint,
      cancellationPolicy,
      termsAndConditions,
    } = req.body;

    // Required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description and category are required",
      });
    }

    if (!location?.city) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    if (!duration?.value || !duration?.unit) {
      return res.status(400).json({
        success: false,
        message: "Duration is required",
      });
    }

    if (pricing?.adult === undefined || pricing?.adult === null) {
      return res.status(400).json({
        success: false,
        message: "Adult price is required",
      });
    }

    if (!maxGuests) {
      return res.status(400).json({
        success: false,
        message: "Maximum guests is required",
      });
    }

    const tour = await Tour.create({
      vendorId,

      title,
      slug: slug || undefined,

      shortDescription,
      description,
      category,

      location,

      duration,

      images: images || [],

      inclusions: inclusions || [],
      exclusions: exclusions || [],

      itinerary: itinerary || [],

      pricing: {
        adult: pricing.adult,
        child: pricing.child || 0,
        infant: pricing.infant || 0,
      },

      maxGuests,

      meetingPoint,
      cancellationPolicy,
      termsAndConditions,

      // New vendor tour requires admin approval
      status: "PENDING",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Tour created successfully and sent for approval",
      tour,
    });
  } catch (error) {
    console.error("Create Tour Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create tour",
      error: error.message,
    });
  }
};


// ==========================================================
// GET ALL VENDOR TOURS
// GET /api/vendor/tours
// ==========================================================
const getVendorTours = async (req, res) => {
  try {
    const vendorId = req.user?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    const tours = await Tour.find({
      vendorId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: tours.length,
      tours,
    });
  } catch (error) {
    console.error("Get Vendor Tours Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tours",
      error: error.message,
    });
  }
};


// ==========================================================
// GET SINGLE TOUR
// GET /api/vendor/tours/:id
// ==========================================================
const getTourById = async (req, res) => {
  try {
    const vendorId = req.user?._id;
    const { id } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    const tour = await Tour.findOne({
      _id: id,
      vendorId,
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    return res.status(200).json({
      success: true,
      tour,
    });
  } catch (error) {
    console.error("Get Tour Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tour",
      error: error.message,
    });
  }
};


// ==========================================================
// UPDATE TOUR
// PUT /api/vendor/tours/:id
// ==========================================================
const updateTour = async (req, res) => {
  try {
    const vendorId = req.user?._id;
    const { id } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    const tour = await Tour.findOne({
      _id: id,
      vendorId,
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    const allowedFields = [
      "title",
      "slug",
      "shortDescription",
      "description",
      "category",
      "location",
      "duration",
      "images",
      "inclusions",
      "exclusions",
      "itinerary",
      "pricing",
      "maxGuests",
      "meetingPoint",
      "cancellationPolicy",
      "termsAndConditions",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        tour[field] = req.body[field];
      }
    });

    // Updated tour goes back for admin approval
    tour.status = "PENDING";

    await tour.save();

    return res.status(200).json({
      success: true,
      message: "Tour updated successfully and sent for approval",
      tour,
    });
  } catch (error) {
    console.error("Update Tour Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update tour",
      error: error.message,
    });
  }
};


// ==========================================================
// DELETE TOUR
// DELETE /api/vendor/tours/:id
// ==========================================================
const deleteTour = async (req, res) => {
  try {
    const vendorId = req.user?._id;
    const { id } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    const tour = await Tour.findOne({
      _id: id,
      vendorId,
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    await Tour.deleteOne({
      _id: id,
      vendorId,
    });

    return res.status(200).json({
      success: true,
      message: "Tour deleted successfully",
    });
  } catch (error) {
    console.error("Delete Tour Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete tour",
      error: error.message,
    });
  }
};


// ==========================================================
// TOGGLE TOUR STATUS
// PATCH /api/vendor/tours/:id/toggle-status
// ==========================================================
const toggleTourStatus = async (req, res) => {
  try {
    const vendorId = req.user?._id;
    const { id } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

    const tour = await Tour.findOne({
      _id: id,
      vendorId,
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    tour.isActive = !tour.isActive;

    await tour.save();

    return res.status(200).json({
      success: true,
      message: tour.isActive
        ? "Tour activated successfully"
        : "Tour deactivated successfully",
      tour,
    });
  } catch (error) {
    console.error("Toggle Tour Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update tour status",
      error: error.message,
    });
  }
};


// ==========================================================
// EXPORTS
// ==========================================================
module.exports = {
  createTour,
  getVendorTours,
  getTourById,
  updateTour,
  deleteTour,
  toggleTourStatus,
};