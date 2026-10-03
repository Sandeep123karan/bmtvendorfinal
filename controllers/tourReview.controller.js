const mongoose = require("mongoose");

const TourReview = require("../models/TourReview");
const TourBooking = require("../models/TourBooking");
const Tour = require("../models/Tour");

// ============================================================
// CUSTOMER - CREATE REVIEW
// ============================================================

const createReview = async (req, res) => {
  try {
    const customerId = req.user._id;

    const { bookingId, rating, review } = req.body;

    if (!bookingId || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "bookingId, rating and review are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Find customer's booking
    const booking = await TourBooking.findOne({
      _id: bookingId,
      customerId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Only completed bookings can be reviewed
    if (booking.bookingStatus !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "You can review only a completed tour",
      });
    }

    // Prevent duplicate review
    const existingReview = await TourReview.findOne({
      bookingId,
      customerId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    // Get tour
    const tour = await Tour.findById(booking.tourId);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    const newReview = await TourReview.create({
      tourId: booking.tourId,
      bookingId: booking._id,
      vendorId: booking.vendorId,
      customerId,
      rating: Number(rating),
      review: review.trim(),
      status: "PENDING",
    });

    const populatedReview = await TourReview.findById(
      newReview._id
    )
      .populate("tourId", "title images")
      .populate("customerId", "name email")
      .populate("vendorId", "name");

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);

    // Duplicate key protection
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message,
    });
  }
};

// ============================================================
// CUSTOMER - GET MY REVIEWS
// ============================================================

const getMyReviews = async (req, res) => {
  try {
    const customerId = req.user._id;

    const reviews = await TourReview.find({
      customerId,
    })
      .populate("tourId", "title images location")
      .populate("bookingId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("GET MY REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// ============================================================
// CUSTOMER - GET SINGLE REVIEW
// ============================================================

const getMyReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await TourReview.findOne({
      _id: id,
      customerId: req.user._id,
    })
      .populate("tourId", "title images location")
      .populate("customerId", "name email")
      .populate("vendorId", "name");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("GET REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch review",
      error: error.message,
    });
  }
};

// ============================================================
// CUSTOMER - UPDATE REVIEW
// ============================================================

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    if (rating !== undefined) {
      if (Number(rating) < 1 || Number(rating) > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }
    }

    const existingReview = await TourReview.findOne({
      _id: id,
      customerId: req.user._id,
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Once approved, don't allow customer editing
    if (existingReview.status === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Approved review cannot be edited",
      });
    }

    if (rating !== undefined) {
      existingReview.rating = Number(rating);
    }

    if (review !== undefined) {
      existingReview.review = review.trim();
    }

    // Send back for approval
    existingReview.status = "PENDING";

    await existingReview.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: existingReview,
    });
  } catch (error) {
    console.error("UPDATE REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message,
    });
  }
};

// ============================================================
// CUSTOMER - DELETE REVIEW
// ============================================================

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await TourReview.findOneAndDelete({
      _id: id,
      customerId: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

// ============================================================
// VENDOR - GET REVIEWS
// ============================================================

const getVendorReviews = async (req, res) => {
  try {
    const { tourId, status } = req.query;

    const filter = {
      vendorId: req.user._id,
    };

    if (tourId) {
      filter.tourId = tourId;
    }

    if (status) {
      filter.status = status;
    }

    const reviews = await TourReview.find(filter)
      .populate("tourId", "title images")
      .populate("customerId", "name email")
      .populate("bookingId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("GET VENDOR REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor reviews",
      error: error.message,
    });
  }
};

// ============================================================
// VENDOR - GET SINGLE REVIEW
// ============================================================

const getVendorReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await TourReview.findOne({
      _id: id,
      vendorId: req.user._id,
    })
      .populate("tourId", "title images")
      .populate("customerId", "name email")
      .populate("bookingId");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("GET VENDOR REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch review",
      error: error.message,
    });
  }
};

// ============================================================
// VENDOR - REPLY TO REVIEW
// ============================================================

const replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorReply } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    if (!vendorReply || !vendorReply.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vendor reply is required",
      });
    }

    const review = await TourReview.findOne({
      _id: id,
      vendorId: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.vendorReply = vendorReply.trim();
    review.vendorReplyAt = new Date();

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Vendor reply added successfully",
      review,
    });
  } catch (error) {
    console.error("REPLY REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reply to review",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getMyReviews,
  getMyReviewById,
  updateReview,
  deleteReview,
  getVendorReviews,
  getVendorReviewById,
  replyToReview,
};