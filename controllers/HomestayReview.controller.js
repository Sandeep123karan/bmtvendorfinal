// controllers/homestayReview.controller.js

const mongoose = require("mongoose");

const HomestayReview = require("../models/HomestayReview.model");
const HomestayBooking = require("../models/HomestayBooking.model");
const Homestay = require("../models/Homestay.model");


/* ============================================================
   HELPER
============================================================ */

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};

const getVendorId = (req) => {
  return req.vendor?._id || req.vendor?.id;
};

const validId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


/* ============================================================
   UPDATE HOMESTAY RATING
============================================================ */

const updateHomestayRating = async (
  homestayId
) => {

  const result =
    await HomestayReview.aggregate([
      {
        $match: {
          homestay:
            new mongoose.Types.ObjectId(
              homestayId
            ),

          status: "APPROVED",

          isPublished: true,
        },
      },

      {
        $group: {
          _id: "$homestay",

          averageRating: {
            $avg: "$overallRating",
          },

          totalReviews: {
            $sum: 1,
          },
        },
      },
    ]);


  const ratingData =
    result[0];


  await Homestay.findByIdAndUpdate(
    homestayId,
    {
      averageRating: ratingData
        ? Math.round(
            ratingData.averageRating *
              10
          ) / 10
        : 0,

      totalReviews: ratingData
        ? ratingData.totalReviews
        : 0,
    }
  );
};


/* ============================================================
   CREATE REVIEW
   POST /api/homestay-reviews
============================================================ */

exports.createReview = async (
  req,
  res
) => {

  try {

    const userId =
      getUserId(req);


    if (!userId) {

      return res.status(401).json({
        success: false,
        message:
          "User authentication required.",
      });
    }


    const {
      bookingId,

      overallRating,

      cleanlinessRating,
      locationRating,
      hospitalityRating,
      facilitiesRating,
      valueForMoneyRating,
      foodRating,

      title,
      reviewText,

      likedThings,
      dislikedThings,

      images,
      videos,

      stayType,
      tripType,

      nightsStayed,
    } = req.body;


    /* ========================================================
       VALIDATION
    ======================================================== */

    if (!bookingId) {

      return res.status(400).json({
        success: false,
        message:
          "Booking ID is required.",
      });
    }


    if (!validId(bookingId)) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid booking ID.",
      });
    }


    if (
      !overallRating ||
      Number(overallRating) < 1 ||
      Number(overallRating) > 5
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Overall rating must be between 1 and 5.",
      });
    }


    if (
      !reviewText ||
      !reviewText.trim()
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Review text is required.",
      });
    }


    /* ========================================================
       FIND BOOKING
    ======================================================== */

    const booking =
      await HomestayBooking.findOne({
        _id: bookingId,

        user: userId,
      })
        .populate("homestay")
        .populate("unit");


    if (!booking) {

      return res.status(404).json({
        success: false,
        message:
          "Booking not found.",
      });
    }


    /* ========================================================
       ONLY COMPLETED / CHECKED OUT
    ======================================================== */

    if (
      ![
        "CHECKED_OUT",
        "COMPLETED",
      ].includes(
        booking.bookingStatus
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "You can review the homestay only after checkout.",
      });
    }


    /* ========================================================
       PAYMENT CHECK
    ======================================================== */

    if (
      booking.paymentStatus !==
        "PAID" &&
      booking.paymentMethod !==
        "PAY_AT_PROPERTY"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Only valid completed bookings can be reviewed.",
      });
    }


    /* ========================================================
       CHECK EXISTING REVIEW
    ======================================================== */

    const existingReview =
      await HomestayReview.findOne({
        booking: booking._id,
      });


    if (existingReview) {

      return res.status(409).json({
        success: false,
        message:
          "You have already submitted a review for this booking.",
      });
    }


    /* ========================================================
       CREATE REVIEW
    ======================================================== */

    const review =
      new HomestayReview({

        user: userId,

        guestName:
          booking.guestName,

        booking:
          booking._id,

        homestay:
          booking.homestay._id,

        unit:
          booking.unit?._id ||
          null,

        vendor:
          booking.vendor,


        overallRating:
          Number(
            overallRating
          ),

        cleanlinessRating:
          Number(
            cleanlinessRating || 0
          ),

        locationRating:
          Number(
            locationRating || 0
          ),

        hospitalityRating:
          Number(
            hospitalityRating || 0
          ),

        facilitiesRating:
          Number(
            facilitiesRating || 0
          ),

        valueForMoneyRating:
          Number(
            valueForMoneyRating || 0
          ),

        foodRating:
          Number(
            foodRating || 0
          ),


        title:
          title || "",

        reviewText:
          reviewText.trim(),


        likedThings:
          Array.isArray(
            likedThings
          )
            ? likedThings
            : [],

        dislikedThings:
          Array.isArray(
            dislikedThings
          )
            ? dislikedThings
            : [],


        images:
          Array.isArray(images)
            ? images
            : [],

        videos:
          Array.isArray(videos)
            ? videos
            : [],


        stayType:
          stayType || "OTHER",

        tripType:
          tripType || "OTHER",

        nightsStayed:
          Number(
            nightsStayed ||
            booking.nights ||
            0
          ),


        isVerifiedStay:
          true,

        status:
          "PENDING",

        isPublished:
          false,
      });


    await review.save();


    /* ========================================================
       MARK BOOKING REVIEW SUBMITTED
    ======================================================== */

    booking.reviewSubmitted =
      true;

    booking.review =
      review._id;


    await booking.save();


    return res.status(201).json({

      success: true,

      message:
        "Review submitted successfully. It will be visible after approval.",

      review,

    });

  } catch (error) {

    console.error(
      "Create Homestay Review Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to create review.",

      error:
        error.message,

    });
  }
};


/* ============================================================
   GET HOMESTAY REVIEWS
   GET /api/homestay-reviews/homestay/:homestayId
============================================================ */

exports.getHomestayReviews =
  async (
    req,
    res
  ) => {

    try {

      const {
        homestayId,
      } = req.params;


      if (
        !validId(
          homestayId
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid homestay ID.",
        });
      }


      const {
        rating,
        page = 1,
        limit = 10,
      } = req.query;


      const filter = {

        homestay:
          homestayId,

        status:
          "APPROVED",

        isPublished:
          true,
      };


      if (rating) {

        filter.overallRating =
          Number(rating);
      }


      const pageNumber =
        Math.max(
          Number(page) || 1,
          1
        );


      const limitNumber =
        Math.min(
          Math.max(
            Number(limit) || 10,
            1
          ),
          100
        );


      const skip =
        (
          pageNumber - 1
        ) *
        limitNumber;


      const [
        reviews,
        total,
      ] = await Promise.all([

        HomestayReview.find(
          filter
        )
          .populate(
            "user",
            "name profileImage"
          )
          .sort({
            isFeatured: -1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        HomestayReview.countDocuments(
          filter
        ),
      ]);


      return res.status(200).json({

        success: true,

        pagination: {

          total,

          page:
            pageNumber,

          limit:
            limitNumber,

          totalPages:
            Math.ceil(
              total /
                limitNumber
            ),
        },

        reviews,

      });

    } catch (error) {

      console.error(
        "Get Homestay Reviews Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch reviews.",

        error:
          error.message,

      });
    }
  };


/* ============================================================
   GET SINGLE REVIEW
   GET /api/homestay-reviews/:reviewId
============================================================ */

exports.getReviewById =
  async (
    req,
    res
  ) => {

    try {

      const {
        reviewId,
      } = req.params;


      if (
        !validId(
          reviewId
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid review ID.",
        });
      }


      const review =
        await HomestayReview.findOne({

          _id:
            reviewId,

          status:
            "APPROVED",

          isPublished:
            true,

        })
          .populate(
            "user",
            "name profileImage"
          )
          .populate(
            "homestay",
            "propertyName city state coverImage"
          )
          .populate(
            "unit",
            "unitName unitType"
          );


      if (!review) {

        return res.status(404).json({
          success: false,
          message:
            "Review not found.",
        });
      }


      return res.status(200).json({

        success: true,

        review,

      });

    } catch (error) {

      console.error(
        "Get Review Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch review.",

        error:
          error.message,

      });
    }
  };


/* ============================================================
   GET MY REVIEWS
   GET /api/homestay-reviews/my-reviews
============================================================ */

exports.getMyReviews =
  async (
    req,
    res
  ) => {

    try {

      const userId =
        getUserId(req);


      if (!userId) {

        return res.status(401).json({
          success: false,
          message:
            "User authentication required.",
        });
      }


      const reviews =
        await HomestayReview.find({
          user:
            userId,
        })
          .populate(
            "homestay",
            "propertyName city coverImage"
          )
          .populate(
            "booking",
            "bookingId checkInDate checkOutDate"
          )
          .sort({
            createdAt: -1,
          });


      return res.status(200).json({

        success: true,

        count:
          reviews.length,

        reviews,

      });

    } catch (error) {

      console.error(
        "Get My Reviews Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch your reviews.",

        error:
          error.message,

      });
    }
  };


/* ============================================================
   HELPFUL VOTE
   POST /api/homestay-reviews/:reviewId/helpful
============================================================ */

exports.markHelpful =
  async (
    req,
    res
  ) => {

    try {

      const userId =
        getUserId(req);


      if (!userId) {

        return res.status(401).json({
          success: false,
          message:
            "User authentication required.",
        });
      }


      const {
        reviewId,
      } = req.params;


      const review =
        await HomestayReview.findOne({
          _id:
            reviewId,

          status:
            "APPROVED",

          isPublished:
            true,
        });


      if (!review) {

        return res.status(404).json({
          success: false,
          message:
            "Review not found.",
        });
      }


      const alreadyVoted =
        review.helpfulUsers.some(
          (id) =>
            id.toString() ===
            userId.toString()
        );


      if (alreadyVoted) {

        return res.status(400).json({
          success: false,
          message:
            "You have already marked this review as helpful.",
        });
      }


      review.helpfulUsers.push(
        userId
      );

      review.helpfulCount += 1;


      await review.save();


      return res.status(200).json({

        success: true,

        message:
          "Review marked as helpful.",

        helpfulCount:
          review.helpfulCount,

      });

    } catch (error) {

      console.error(
        "Helpful Review Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to mark review as helpful.",

        error:
          error.message,

      });
    }
  };


/* ============================================================
   VENDOR GET REVIEWS
   GET /api/homestay-reviews/vendor
============================================================ */

exports.getVendorReviews =
  async (
    req,
    res
  ) => {

    try {

      const vendorId =
        getVendorId(req);


      if (!vendorId) {

        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required.",
        });
      }


      const {
        status,
        page = 1,
        limit = 20,
      } = req.query;


      const filter = {

        vendor:
          vendorId,

      };


      if (status) {
        filter.status =
          status;
      }


      const pageNumber =
        Math.max(
          Number(page) || 1,
          1
        );


      const limitNumber =
        Math.min(
          Math.max(
            Number(limit) || 20,
            1
          ),
          100
        );


      const skip =
        (
          pageNumber - 1
        ) *
        limitNumber;


      const [
        reviews,
        total,
      ] = await Promise.all([

        HomestayReview.find(
          filter
        )
          .populate(
            "homestay",
            "propertyName city coverImage"
          )
          .populate(
            "unit",
            "unitName unitType"
          )
          .populate(
            "user",
            "name profileImage"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber),

        HomestayReview.countDocuments(
          filter
        ),
      ]);


      return res.status(200).json({

        success: true,

        pagination: {

          total,

          page:
            pageNumber,

          limit:
            limitNumber,

          totalPages:
            Math.ceil(
              total /
                limitNumber
            ),
        },

        reviews,

      });

    } catch (error) {

      console.error(
        "Get Vendor Reviews Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch vendor reviews.",

        error:
          error.message,

      });
    }
  };


/* ============================================================
   VENDOR REPLY
   PUT /api/homestay-reviews/:reviewId/reply
============================================================ */

exports.replyToReview =
  async (
    req,
    res
  ) => {

    try {

      const vendorId =
        getVendorId(req);


      if (!vendorId) {

        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required.",
        });
      }


      const {
        reviewId,
      } = req.params;


      const {
        hostResponse,
      } = req.body;


      if (
        !hostResponse ||
        !hostResponse.trim()
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Host response is required.",
        });
      }


      const review =
        await HomestayReview.findOne({

          _id:
            reviewId,

          vendor:
            vendorId,

        });


      if (!review) {

        return res.status(404).json({
          success: false,
          message:
            "Review not found.",
        });
      }


      review.hostResponse =
        hostResponse.trim();

      review.hostRespondedAt =
        new Date();

      review.hostRespondedBy =
        vendorId;


      await review.save();


      return res.status(200).json({

        success: true,

        message:
          "Response added successfully.",

        review,

      });

    } catch (error) {

      console.error(
        "Reply Review Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to reply to review.",

        error:
          error.message,

      });
    }
  };


/* ============================================================
   ADMIN GET REVIEWS
   GET /api/homestay-reviews/admin
============================================================ */

exports.getAdminReviews =
  async (
    req,
    res
  ) => {

    try {

      const {
        status,
        page = 1,
        limit = 20,
      } = req.query;


      const filter = {};


      if (status) {
        filter.status =
          status;
      }


      const pageNumber =
        Math.max(
          Number(page) || 1,
          1
        );


      const limitNumber =
        Math.min(
          Math.max(
            Number(limit) || 20,
            1
          ),
          100
        );


      const skip =
        (
          pageNumber - 1
        ) *
        limitNumber;


      const [
        reviews,
        total,
      ] = await Promise.all([

        HomestayReview.find(
          filter
        )
          .populate(
            "user",
            "name email profileImage"
          )
          .populate(
            "homestay",
            "propertyName city"
          )
          .populate(
            "vendor",
            "name email phone"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber),

        HomestayReview.countDocuments(
          filter
        ),
      ]);


      return res.status(200).json({

        success: true,

        pagination: {

          total,

          page:
            pageNumber,

          limit:
            limitNumber,

          totalPages:
            Math.ceil(
              total /
                limitNumber
            ),
        },

        reviews,

      });

    } catch (error) {

      console.error(
        "Admin Reviews Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch admin reviews.",

        error:
          error.message,

      });
    }
  };


/* ============================================================
   ADMIN APPROVE REVIEW
   PUT /api/homestay-reviews/admin/:reviewId/approve
============================================================ */

exports.approveReview =
  async (
    req,
    res
  ) => {

    try {

      const adminId =
        req.admin?._id ||
        req.admin?.id ||
        req.user?._id;


      const review =
        await HomestayReview.findById(
          req.params.reviewId
        );


      if (!review) {

        return res.status(404).json({
          success: false,
          message:
            "Review not found.",
        });
      }


      review.status =
        "APPROVED";

      review.isPublished =
        true;

      review.moderatedBy =
        adminId || null;

      review.moderatedAt =
        new Date();

      review.rejectionReason =
        "";


      await review.save();


      /* ======================================================
         UPDATE HOMESTAY RATING
      ====================================================== */

      await updateHomestayRating(
        review.homestay
      );


      return res.status(200).json({

        success: true,

        message:
          "Review approved successfully.",

        review,

      });

    } catch (error) {

      console.error(
        "Approve Review Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to approve review.",

        error:
          error.message,

      });
    }
  };


/* ============================================================
   ADMIN REJECT REVIEW
   PUT /api/homestay-reviews/admin/:reviewId/reject
============================================================ */

exports.rejectReview =
  async (
    req,
    res
  ) => {

    try {

      const adminId =
        req.admin?._id ||
        req.admin?.id ||
        req.user?._id;


      const {
        reason,
      } = req.body;


      const review =
        await HomestayReview.findById(
          req.params.reviewId
        );


      if (!review) {

        return res.status(404).json({
          success: false,
          message:
            "Review not found.",
        });
      }


      review.status =
        "REJECTED";

      review.isPublished =
        false;

      review.rejectionReason =
        reason ||
        "Review rejected by admin";

      review.moderatedBy =
        adminId || null;

      review.moderatedAt =
        new Date();


      await review.save();


      /* ======================================================
         UPDATE HOMESTAY RATING
      ====================================================== */

      await updateHomestayRating(
        review.homestay
      );


      return res.status(200).json({

        success: true,

        message:
          "Review rejected successfully.",

        review,

      });

    } catch (error) {

      console.error(
        "Reject Review Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to reject review.",

        error:
          error.message,

      });
    }
  };


/* ============================================================
   ADMIN HIDE REVIEW
   PUT /api/homestay-reviews/admin/:reviewId/hide
============================================================ */

exports.hideReview =
  async (
    req,
    res
  ) => {

    try {

      const review =
        await HomestayReview.findById(
          req.params.reviewId
        );


      if (!review) {

        return res.status(404).json({
          success: false,
          message:
            "Review not found.",
        });
      }


      review.status =
        "HIDDEN";

      review.isPublished =
        false;


      await review.save();


      await updateHomestayRating(
        review.homestay
      );


      return res.status(200).json({

        success: true,

        message:
          "Review hidden successfully.",

        review,

      });

    } catch (error) {

      console.error(
        "Hide Review Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to hide review.",

        error:
          error.message,

      });
    }
  };