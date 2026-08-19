const ResortBooking = require("../models/ResortBooking.model");
const ResortReview = require("../models/ResortReview.model");


/* ==========================================================
                    CREATE REVIEW
========================================================== */

exports.createReview = async (req, res) => {
  try {
    const {
      bookingId,
      rating,
      ratings,
      title,
      comment,
      pros,
      cons,
      images = [],
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message:
          "bookingId, rating and comment are required.",
      });
    }


    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }


    // ==========================================
    // CHECK BOOKING
    // ==========================================

    const booking = await ResortBooking.findById(
      bookingId
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }


    // ==========================================
    // ONLY COMPLETED STAY CAN REVIEW
    // ==========================================

    if (booking.bookingStatus !== "CHECKED_OUT") {
      return res.status(400).json({
        success: false,
        message:
          "Review can only be submitted after check-out.",
      });
    }


    // ==========================================
    // CHECK DUPLICATE REVIEW
    // ==========================================

    const existingReview = await ResortReview.findOne({
      booking: bookingId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message:
          "Review has already been submitted for this booking.",
      });
    }


    // ==========================================
    // CREATE REVIEW
    // ==========================================

    const review = await ResortReview.create({
      resort: booking.resort,
      vendor: booking.vendor,
      booking: booking._id,

      guest: {
        name: booking.leadGuest.name,
        email: booking.leadGuest.email || "",
        phone: booking.leadGuest.phone || "",
      },

      rating: Number(rating),

      ratings: {
        cleanliness: ratings?.cleanliness || null,
        service: ratings?.service || null,
        location: ratings?.location || null,
        valueForMoney: ratings?.valueForMoney || null,
        roomQuality: ratings?.roomQuality || null,
        food: ratings?.food || null,
      },

      title: title || "",
      comment,

      pros: Array.isArray(pros) ? pros : [],
      cons: Array.isArray(cons) ? cons : [],
      images: Array.isArray(images) ? images : [],

      status: "PENDING",
      isVerifiedStay: true,
    });


    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review,
    });

  } catch (error) {
    console.error("Create Resort Review Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "Review already exists for this booking.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    GET VENDOR REVIEWS
========================================================== */

exports.getVendorReviews = async (req, res) => {
  try {
    const {
      resortId,
      status,
      page = 1,
      limit = 20,
    } = req.query;


    const filter = {
      vendor: req.vendor._id,
    };


    if (resortId) {
      filter.resort = resortId;
    }


    if (status) {
      filter.status = status;
    }


    const skip =
      (Number(page) - 1) * Number(limit);


    const [reviews, total] = await Promise.all([
      ResortReview.find(filter)
        .populate("resort", "name")
        .populate(
          "booking",
          "bookingId checkIn checkOut bookingStatus"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      ResortReview.countDocuments(filter),
    ]);


    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      reviews,
    });

  } catch (error) {
    console.error("Get Vendor Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    GET SINGLE REVIEW
========================================================== */

exports.getReviewById = async (req, res) => {
  try {
    const review = await ResortReview.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    })
      .populate("resort", "name")
      .populate(
        "booking",
        "bookingId checkIn checkOut roomCategory"
      );


    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }


    return res.status(200).json({
      success: true,
      review,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    VENDOR REPLY TO REVIEW
========================================================== */

exports.replyToReview = async (req, res) => {
  try {
    const { message } = req.body;


    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required.",
      });
    }


    const review = await ResortReview.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });


    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or access denied.",
      });
    }


    review.vendorReply = {
      message: message.trim(),
      repliedAt: new Date(),
    };


    await review.save();


    return res.status(200).json({
      success: true,
      message: "Reply submitted successfully.",
      review,
    });

  } catch (error) {
    console.error("Reply To Review Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
                    REVIEW SUMMARY
                    For Vendor Dashboard
========================================================== */

exports.getReviewSummary = async (req, res) => {
  try {
    const { resortId } = req.params;


    const filter = {
      vendor: req.vendor._id,
      resort: resortId,
      status: "APPROVED",
      isActive: true,
    };


    const summary = await ResortReview.aggregate([
      {
        $match: {
          vendor: req.vendor._id,
          resort: new (require("mongoose").Types.ObjectId)(
            resortId
          ),
          status: "APPROVED",
          isActive: true,
        },
      },

      {
        $group: {
          _id: null,

          totalReviews: {
            $sum: 1,
          },

          averageRating: {
            $avg: "$rating",
          },

          fiveStar: {
            $sum: {
              $cond: [
                { $eq: ["$rating", 5] },
                1,
                0,
              ],
            },
          },

          fourStar: {
            $sum: {
              $cond: [
                { $eq: ["$rating", 4] },
                1,
                0,
              ],
            },
          },

          threeStar: {
            $sum: {
              $cond: [
                { $eq: ["$rating", 3] },
                1,
                0,
              ],
            },
          },

          twoStar: {
            $sum: {
              $cond: [
                { $eq: ["$rating", 2] },
                1,
                0,
              ],
            },
          },

          oneStar: {
            $sum: {
              $cond: [
                { $eq: ["$rating", 1] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);


    const result = summary[0] || {
      totalReviews: 0,
      averageRating: 0,
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0,
    };


    result.averageRating =
      Number(result.averageRating.toFixed(1));


    return res.status(200).json({
      success: true,
      summary: result,
    });

  } catch (error) {
    console.error("Get Review Summary Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};