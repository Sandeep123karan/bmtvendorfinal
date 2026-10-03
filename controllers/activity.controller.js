const mongoose = require("mongoose");

const Activity = require("../models/Activity");
const cloudinary = require("../config/cloudinary");

// =====================================================
// VENDOR AUTH
// =====================================================

const requireVendor = (req, res) => {
  const vendorId = req.user?._id;

  if (!vendorId) {
    res.status(401).json({
      success: false,
      message: "Vendor authentication required",
    });

    return null;
  }

  return vendorId;
};

// =====================================================
// SLUG GENERATOR
// =====================================================

const makeSlug = (text) => {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// =====================================================
// PARSE ARRAY
// =====================================================

const parseArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

// =====================================================
// PARSE OBJECT
// =====================================================

const parseObject = (value) => {
  if (!value) return {};

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
};

// =====================================================
// BOOLEAN
// =====================================================

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return defaultValue;
};

// =====================================================
// LOCATION
// =====================================================

const normalizeLocation = (location) => {
  if (!location) return null;

  const data = parseObject(location);

  return {
    city: data.city
      ? String(data.city).trim()
      : "",

    state: data.state
      ? String(data.state).trim()
      : "",

    country: data.country
      ? String(data.country).trim()
      : "India",

    address: data.address
      ? String(data.address).trim()
      : "",

    latitude:
      data.latitude !== undefined &&
      data.latitude !== ""
        ? Number(data.latitude)
        : undefined,

    longitude:
      data.longitude !== undefined &&
      data.longitude !== ""
        ? Number(data.longitude)
        : undefined,
  };
};

// =====================================================
// DURATION
// =====================================================

const normalizeDuration = (duration) => {
  if (!duration) {
    return {
      value: 0,
      unit: "hours",
    };
  }

  const data = parseObject(duration);

  return {
    value: Number(data.value) || 0,

    unit:
      data.unit === "days"
        ? "days"
        : "hours",
  };
};

// =====================================================
// CLOUDINARY UPLOAD
// =====================================================

const uploadImageToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream =
      cloudinary.uploader.upload_stream(
        {
          folder: "bmt/activities",
          resource_type: "image",
        },

        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result);
        }
      );

    stream.end(buffer);
  });
};

// =====================================================
// CLOUDINARY DELETE
// =====================================================

const deleteImageFromCloudinary = async (
  imageUrl
) => {
  try {
    if (!imageUrl) return;

    const uploadPart =
      imageUrl.split("/upload/")[1];

    if (!uploadPart) return;

    let publicId = uploadPart.replace(
      /^v\d+\//,
      ""
    );

    publicId = publicId.replace(
      /\.[^/.]+$/,
      ""
    );

    await cloudinary.uploader.destroy(
      publicId
    );
  } catch (error) {
    console.error(
      "CLOUDINARY DELETE ERROR:",
      error.message
    );
  }
};

// =====================================================
// CREATE ACTIVITY
// POST /api/vendor/activities
// =====================================================

const createActivity = async (req, res) => {
  try {
    const vendorId =
      requireVendor(req, res);

    if (!vendorId) return;

    const {
      title,
      slug,
      category,
      activityType,
      shortDescription,
      description,
      location,
      duration,
      pricing,
      maxGuests,
      meetingPoint,
      pickupAvailable,
      pickupDetails,
      highlights,
      inclusions,
      exclusions,
      requirements,
      languages,
      cancellationPolicy,
      termsAndConditions,
      instantConfirmation,
      bookingCutoffHours,
      minAge,
      maxAge,
    } = req.body;

    // =================================================
    // REQUIRED VALIDATION
    // =================================================

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Activity title is required",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Activity category is required",
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Activity description is required",
      });
    }

    // =================================================
    // LOCATION
    // =================================================

    const normalizedLocation =
      normalizeLocation(location);

    if (
      !normalizedLocation ||
      !normalizedLocation.city
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Activity city is required",
      });
    }

    // =================================================
    // SLUG
    // =================================================

    const activitySlug =
      slug?.trim()
        ? slug.trim().toLowerCase()
        : makeSlug(title);

    const existingActivity =
      await Activity.findOne({
        slug: activitySlug,
      });

    if (existingActivity) {
      return res.status(409).json({
        success: false,
        message:
          "Activity with this slug already exists",
      });
    }

    // =================================================
    // IMAGES
    // =================================================

    const imageUrls = [];

    if (
      req.files &&
      req.files.length > 0
    ) {
      for (const file of req.files) {
        if (
          !file.mimetype.startsWith(
            "image/"
          )
        ) {
          continue;
        }

        const uploaded =
          await uploadImageToCloudinary(
            file.buffer
          );

        imageUrls.push(
          uploaded.secure_url
        );
      }
    }

    if (imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "At least one activity image is required",
      });
    }

    // =================================================
    // PRICING
    // =================================================

    const pricingData =
      parseObject(pricing);

    const adultPrice =
      Number(pricingData.adult) || 0;

    const childPrice =
      Number(pricingData.child) || 0;

    const infantPrice =
      Number(pricingData.infant) || 0;

    if (
      adultPrice < 0 ||
      childPrice < 0 ||
      infantPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Pricing cannot be negative",
      });
    }

    // =================================================
    // MAX GUESTS
    // =================================================

    const guests =
      Number(maxGuests) || 1;

    if (guests < 1) {
      return res.status(400).json({
        success: false,
        message:
          "maxGuests must be at least 1",
      });
    }

    // =================================================
    // CREATE ACTIVITY
    // =================================================

    const activity =
      await Activity.create({
        vendorId,

        title:
          title.trim(),

        slug:
          activitySlug,

        category:
          category.trim(),

        activityType:
          activityType ||
          "OTHER",

        shortDescription:
          shortDescription
            ? String(
                shortDescription
              ).trim()
            : "",

        description:
          description.trim(),

        highlights:
          parseArray(highlights),

        location:
          normalizedLocation,

        duration:
          normalizeDuration(
            duration
          ),

        images:
          imageUrls,

        thumbnail:
          imageUrls[0],

        pricing: {
          adult: adultPrice,
          child: childPrice,
          infant: infantPrice,
        },

        currency: "INR",

        maxGuests: guests,

        meetingPoint:
          meetingPoint
            ? String(
                meetingPoint
              ).trim()
            : "",

        pickupAvailable:
          parseBoolean(
            pickupAvailable,
            false
          ),

        pickupDetails:
          pickupDetails
            ? String(
                pickupDetails
              ).trim()
            : "",

        inclusions:
          parseArray(inclusions),

        exclusions:
          parseArray(exclusions),

        requirements:
          parseArray(requirements),

        languages:
          parseArray(languages),

        cancellationPolicy:
          cancellationPolicy
            ? String(
                cancellationPolicy
              ).trim()
            : "",

        termsAndConditions:
          termsAndConditions
            ? String(
                termsAndConditions
              ).trim()
            : "",

        instantConfirmation:
          parseBoolean(
            instantConfirmation,
            true
          ),

        bookingCutoffHours:
          Number(
            bookingCutoffHours
          ) || 2,

        minAge:
          Number(minAge) || 0,

        maxAge:
          maxAge !== undefined &&
          maxAge !== ""
            ? Number(maxAge)
            : undefined,

        // =========================================
        // NO ADMIN MODULE RIGHT NOW
        // =========================================

        status: "APPROVED",

        isActive: true,
      });

    return res.status(201).json({
      success: true,
      message:
        "Activity created successfully",
      data: activity,
    });
  } catch (error) {
    console.error(
      "CREATE ACTIVITY ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Activity slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create activity",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL VENDOR ACTIVITIES
// GET /api/vendor/activities
// =====================================================

const getVendorActivities = async (
  req,
  res
) => {
  try {
    const vendorId =
      requireVendor(req, res);

    if (!vendorId) return;

    const {
      status,
      category,
      activityType,
      isActive,
      search,
    } = req.query;

    const filter = {
      vendorId,
    };

    // =================================================
    // STATUS
    // =================================================

    if (status) {
      filter.status =
        status.toUpperCase();
    }

    // =================================================
    // CATEGORY
    // =================================================

    if (category) {
      filter.category =
        category;
    }

    // =================================================
    // ACTIVITY TYPE
    // =================================================

    if (activityType) {
      filter.activityType =
        activityType;
    }

    // =================================================
    // ACTIVE
    // =================================================

    if (
      isActive !== undefined
    ) {
      filter.isActive =
        isActive === "true";
    }

    // =================================================
    // SEARCH
    // =================================================

    if (search?.trim()) {
      filter.$or = [
        {
          title: {
            $regex:
              search.trim(),
            $options: "i",
          },
        },

        {
          category: {
            $regex:
              search.trim(),
            $options: "i",
          },
        },

        {
          activityType: {
            $regex:
              search.trim(),
            $options: "i",
          },
        },

        {
          "location.city": {
            $regex:
              search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const activities =
      await Activity.find(
        filter
      ).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count:
        activities.length,
      data: activities,
    });
  } catch (error) {
    console.error(
      "GET VENDOR ACTIVITIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch activities",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE ACTIVITY
// GET /api/vendor/activities/:id
// =====================================================

const getActivityById = async (
  req,
  res
) => {
  try {
    const vendorId =
      requireVendor(req, res);

    if (!vendorId) return;

    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Activity ID",
      });
    }

    const activity =
      await Activity.findOne({
        _id: id,
        vendorId,
      });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message:
          "Activity not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error(
      "GET ACTIVITY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch activity",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE ACTIVITY
// PUT /api/vendor/activities/:id
// =====================================================

const updateActivity = async (
  req,
  res
) => {
  try {
    const vendorId =
      requireVendor(req, res);

    if (!vendorId) return;

    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Activity ID",
      });
    }

    const activity =
      await Activity.findOne({
        _id: id,
        vendorId,
      });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message:
          "Activity not found",
      });
    }

    const {
      title,
      slug,
      category,
      activityType,
      shortDescription,
      description,
      location,
      duration,
      pricing,
      maxGuests,
      meetingPoint,
      pickupAvailable,
      pickupDetails,
      highlights,
      inclusions,
      exclusions,
      requirements,
      languages,
      cancellationPolicy,
      termsAndConditions,
      instantConfirmation,
      bookingCutoffHours,
      minAge,
      maxAge,
      isActive,
      existingImages,
    } = req.body;

    // =================================================
    // BASIC FIELDS
    // =================================================

    if (
      title !== undefined
    ) {
      if (!String(title).trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Activity title cannot be empty",
        });
      }

      activity.title =
        String(title).trim();
    }

    // =================================================
    // SLUG
    // =================================================

    if (
      slug !== undefined &&
      String(slug).trim()
    ) {
      const newSlug =
        String(slug)
          .trim()
          .toLowerCase();

      if (
        newSlug !==
        activity.slug
      ) {
        const exists =
          await Activity.findOne({
            slug: newSlug,
            _id: {
              $ne:
                activity._id,
            },
          });

        if (exists) {
          return res.status(409).json({
            success: false,
            message:
              "Activity slug already exists",
          });
        }

        activity.slug =
          newSlug;
      }
    }

    if (
      category !== undefined
    ) {
      if (!String(category).trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Activity category cannot be empty",
        });
      }

      activity.category =
        String(category).trim();
    }

    if (
      activityType !==
      undefined
    ) {
      activity.activityType =
        activityType;
    }

    if (
      shortDescription !==
      undefined
    ) {
      activity.shortDescription =
        String(
          shortDescription
        ).trim();
    }

    if (
      description !==
      undefined
    ) {
      if (
        !String(description).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Activity description cannot be empty",
        });
      }

      activity.description =
        String(
          description
        ).trim();
    }

    // =================================================
    // LOCATION
    // =================================================

    if (
      location !== undefined
    ) {
      const newLocation =
        normalizeLocation(
          location
        );

      if (
        !newLocation ||
        !newLocation.city
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid city is required",
        });
      }

      activity.location =
        newLocation;
    }

    // =================================================
    // DURATION
    // =================================================

    if (
      duration !== undefined
    ) {
      activity.duration =
        normalizeDuration(
          duration
        );
    }

    // =================================================
    // PRICING
    // =================================================

    if (
      pricing !== undefined
    ) {
      const pricingData =
        parseObject(pricing);

      const adult =
        pricingData.adult !==
        undefined
          ? Number(
              pricingData.adult
            )
          : activity.pricing
              .adult;

      const child =
        pricingData.child !==
        undefined
          ? Number(
              pricingData.child
            )
          : activity.pricing
              .child;

      const infant =
        pricingData.infant !==
        undefined
          ? Number(
              pricingData.infant
            )
          : activity.pricing
              .infant;

      if (
        adult < 0 ||
        child < 0 ||
        infant < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Pricing cannot be negative",
        });
      }

      activity.pricing = {
        adult,
        child,
        infant,
      };
    }

    // =================================================
    // IMAGES
    // =================================================

    let keepImages = [];

    if (
      existingImages !==
      undefined
    ) {
      keepImages =
        parseArray(
          existingImages
        );
    } else {
      keepImages =
        activity.images || [];
    }

    const newImages = [];

    if (
      req.files &&
      req.files.length > 0
    ) {
      for (
        const file of req.files
      ) {
        if (
          !file.mimetype.startsWith(
            "image/"
          )
        ) {
          continue;
        }

        const uploaded =
          await uploadImageToCloudinary(
            file.buffer
          );

        newImages.push(
          uploaded.secure_url
        );
      }
    }

    const finalImages = [
      ...keepImages,
      ...newImages,
    ];

    if (
      finalImages.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one activity image is required",
      });
    }

    // =================================================
    // DELETE REMOVED CLOUDINARY IMAGES
    // =================================================

    const removedImages =
      (
        activity.images || []
      ).filter(
        (oldImage) =>
          !keepImages.includes(
            oldImage
          )
      );

    for (
      const image of removedImages
    ) {
      await deleteImageFromCloudinary(
        image
      );
    }

    activity.images =
      finalImages;

    activity.thumbnail =
      finalImages[0];

    // =================================================
    // MAX GUESTS
    // =================================================

    if (
      maxGuests !== undefined
    ) {
      const guests =
        Number(maxGuests);

      if (
        !Number.isInteger(
          guests
        ) ||
        guests < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "maxGuests must be at least 1",
        });
      }

      activity.maxGuests =
        guests;
    }

    // =================================================
    // MEETING POINT
    // =================================================

    if (
      meetingPoint !==
      undefined
    ) {
      activity.meetingPoint =
        String(
          meetingPoint
        ).trim();
    }

    // =================================================
    // PICKUP
    // =================================================

    if (
      pickupAvailable !==
      undefined
    ) {
      activity.pickupAvailable =
        parseBoolean(
          pickupAvailable,
          activity.pickupAvailable
        );
    }

    if (
      pickupDetails !==
      undefined
    ) {
      activity.pickupDetails =
        String(
          pickupDetails
        ).trim();
    }

    // =================================================
    // ARRAYS
    // =================================================

    if (
      highlights !==
      undefined
    ) {
      activity.highlights =
        parseArray(
          highlights
        );
    }

    if (
      inclusions !==
      undefined
    ) {
      activity.inclusions =
        parseArray(
          inclusions
        );
    }

    if (
      exclusions !==
      undefined
    ) {
      activity.exclusions =
        parseArray(
          exclusions
        );
    }

    if (
      requirements !==
      undefined
    ) {
      activity.requirements =
        parseArray(
          requirements
        );
    }

    if (
      languages !==
      undefined
    ) {
      activity.languages =
        parseArray(
          languages
        );
    }

    // =================================================
    // POLICIES
    // =================================================

    if (
      cancellationPolicy !==
      undefined
    ) {
      activity.cancellationPolicy =
        String(
          cancellationPolicy
        ).trim();
    }

    if (
      termsAndConditions !==
      undefined
    ) {
      activity.termsAndConditions =
        String(
          termsAndConditions
        ).trim();
    }

    // =================================================
    // BOOKING SETTINGS
    // =================================================

    if (
      instantConfirmation !==
      undefined
    ) {
      activity.instantConfirmation =
        parseBoolean(
          instantConfirmation,
          activity.instantConfirmation
        );
    }

    if (
      bookingCutoffHours !==
      undefined
    ) {
      const cutoff =
        Number(
          bookingCutoffHours
        );

      if (
        Number.isNaN(cutoff) ||
        cutoff < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "bookingCutoffHours cannot be negative",
        });
      }

      activity.bookingCutoffHours =
        cutoff;
    }

    // =================================================
    // AGE
    // =================================================

    if (
      minAge !== undefined
    ) {
      const value =
        Number(minAge);

      if (
        Number.isNaN(value) ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "minAge cannot be negative",
        });
      }

      activity.minAge =
        value;
    }

    if (
      maxAge !== undefined
    ) {
      const value =
        Number(maxAge);

      if (
        Number.isNaN(value) ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "maxAge cannot be negative",
        });
      }

      activity.maxAge =
        value;
    }

    // =================================================
    // ACTIVE / INACTIVE
    // =================================================

    if (
      isActive !== undefined
    ) {
      activity.isActive =
        parseBoolean(
          isActive,
          activity.isActive
        );
    }

    // =================================================
    // NO ADMIN RE-APPROVAL
    // Activity remains APPROVED
    // =================================================

    activity.status =
      "APPROVED";

    await activity.save();

    return res.status(200).json({
      success: true,
      message:
        "Activity updated successfully",
      data: activity,
    });
  } catch (error) {
    console.error(
      "UPDATE ACTIVITY ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Activity slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update activity",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE ACTIVITY
// DELETE /api/vendor/activities/:id
// =====================================================

const deleteActivity = async (
  req,
  res
) => {
  try {
    const vendorId =
      requireVendor(req, res);

    if (!vendorId) return;

    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Activity ID",
      });
    }

    const activity =
      await Activity.findOne({
        _id: id,
        vendorId,
      });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message:
          "Activity not found",
      });
    }

    // =================================================
    // DELETE CLOUDINARY IMAGES
    // =================================================

    for (
      const image of
        activity.images || []
    ) {
      await deleteImageFromCloudinary(
        image
      );
    }

    // =================================================
    // DELETE ACTIVITY
    // =================================================

    await activity.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Activity deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE ACTIVITY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete activity",
      error: error.message,
    });
  }
};

// =====================================================
// TOGGLE ACTIVITY
// PATCH /api/vendor/activities/:id/toggle
// =====================================================

const toggleActivity = async (
  req,
  res
) => {
  try {
    const vendorId =
      requireVendor(req, res);

    if (!vendorId) return;

    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Activity ID",
      });
    }

    const activity =
      await Activity.findOne({
        _id: id,
        vendorId,
      });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message:
          "Activity not found",
      });
    }

    activity.isActive =
      !activity.isActive;

    await activity.save();

    return res.status(200).json({
      success: true,

      message:
        `Activity ${
          activity.isActive
            ? "activated"
            : "deactivated"
        } successfully`,

      data: activity,
    });
  } catch (error) {
    console.error(
      "TOGGLE ACTIVITY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update activity status",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createActivity,
  getVendorActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  toggleActivity,
};