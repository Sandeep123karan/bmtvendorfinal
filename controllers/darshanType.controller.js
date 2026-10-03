const Darshan = require("../models/Darshan.model");
const DarshanType = require("../models/DarshanType.model");
const cloudinary = require("cloudinary").v2;
const generateSlug = (text) => {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
const uploadImage = async (file) => {
  if (!file) {
    return "";
  }

  return new Promise((resolve, reject) => {
    const stream =
      cloudinary.uploader.upload_stream(
        {
          folder: "darshans/types",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result.secure_url);
        }
      );

    stream.end(file.buffer);
  });
};

exports.createDarshanType = async (
  req,
  res
) => {
  try {
  
    const vendorId =
      req.user?.vendorId || req.user?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required",
      });
    }

   
    const {
      darshanId,
      name,
      description,
      shortDescription,
      type,
      dailyCapacity,
      perSlotCapacity,
      maxPersonsPerBooking,
      adultPrice,
      childPrice,
      seniorCitizenPrice,
      currency,
      minimumAge,
      bookingAllowed,
      advanceBookingDays,
      status,
      isPublished,
      isActive,
    } = req.body;

    
    if (
      !darshanId ||
      !name ||
      !type
    ) {
      return res.status(400).json({
        success: false,
        message:
          "darshanId, name and type are required",
      });
    }

    const darshan =
      await Darshan.findOne({
        _id: darshanId,
        vendorId,
      });

    if (!darshan) {
      return res.status(404).json({
        success: false,
        message:
          "Darshan not found or does not belong to this vendor",
      });
    }
    const existingType =
      await DarshanType.findOne({
        darshanId,
        type,
      });

    if (existingType) {
      return res.status(400).json({
        success: false,
        message:
          "This darshan type already exists for this temple",
      });
    }

    let image = "";

    if (
      req.file
    ) {
      image =
        await uploadImage(req.file);
    }
    let slug =
      generateSlug(name);

    const existingSlug =
      await DarshanType.findOne({
        slug,
      });

    if (existingSlug) {
      slug =
        `${slug}-${Date.now()}`;
    }
    const darshanType =
      await DarshanType.create({
        vendorId,

        darshanId,

        name:
          name.trim(),

        slug,

        description:
          description || "",

        shortDescription:
          shortDescription || "",

        type,

        image,

        dailyCapacity:
          Number(dailyCapacity || 0),

        perSlotCapacity:
          Number(perSlotCapacity || 0),

        maxPersonsPerBooking:
          Number(
            maxPersonsPerBooking || 10
          ),

        adultPrice:
          Number(adultPrice || 0),

        childPrice:
          Number(childPrice || 0),

        seniorCitizenPrice:
          Number(
            seniorCitizenPrice || 0
          ),

        currency:
          currency || "INR",

        minimumAge:
          Number(minimumAge || 0),

        bookingAllowed:
          bookingAllowed !== undefined
            ? bookingAllowed === "true" ||
              bookingAllowed === true
            : true,

        advanceBookingDays:
          Number(
            advanceBookingDays || 30
          ),

        status:
          status || "draft",

        isPublished:
          isPublished === "true" ||
          isPublished === true,

        isActive:
          isActive !== undefined
            ? isActive === "true" ||
              isActive === true
            : true,
      });

    return res.status(201).json({
      success: true,
      message:
        "Darshan type created successfully",
      data: darshanType,
    });

  } catch (error) {
    console.error(
      "CREATE DARSHAN TYPE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET MY DARSHAN TYPES
// =====================================================

exports.getMyDarshanTypes =
  async (req, res) => {
    try {
      const vendorId =
        req.user?.vendorId ||
        req.user?._id;

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required",
        });
      }

      const {
        darshanId,
      } = req.query;

      const filter = {
        vendorId,
      };

      if (darshanId) {
        filter.darshanId =
          darshanId;
      }

      const types =
        await DarshanType.find(
          filter
        )
          .populate(
            "darshanId",
            "name templeName deityName city state mainImage"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        count: types.length,
        data: types,
      });

    } catch (error) {
      console.error(
        "GET DARSHAN TYPES ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

exports.getDarshanTypeById =
  async (req, res) => {
    try {
      const vendorId =
        req.user?.vendorId ||
        req.user?._id;

      const darshanType =
        await DarshanType.findOne({
          _id: req.params.id,
          vendorId,
        }).populate(
          "darshanId",
          "name templeName deityName city state mainImage"
        );

      if (!darshanType) {
        return res.status(404).json({
          success: false,
          message:
            "Darshan type not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: darshanType,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// UPDATE DARSHAN TYPE
// =====================================================

exports.updateDarshanType =
  async (req, res) => {
    try {
      const vendorId =
        req.user?.vendorId ||
        req.user?._id;

      const darshanType =
        await DarshanType.findOne({
          _id: req.params.id,
          vendorId,
        });

      if (!darshanType) {
        return res.status(404).json({
          success: false,
          message:
            "Darshan type not found",
        });
      }

      const fields = [
        "name",
        "description",
        "shortDescription",
        "type",
        "currency",
        "status",
        "rejectionReason",
      ];

      fields.forEach((field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          darshanType[field] =
            req.body[field];
        }
      });

      // =================================================
      // NUMBER FIELDS
      // =================================================

      const numberFields = [
        "dailyCapacity",
        "perSlotCapacity",
        "maxPersonsPerBooking",
        "adultPrice",
        "childPrice",
        "seniorCitizenPrice",
        "minimumAge",
        "advanceBookingDays",
      ];

      numberFields.forEach(
        (field) => {
          if (
            req.body[field] !==
            undefined
          ) {
            darshanType[field] =
              Number(
                req.body[field]
              );
          }
        }
      );

      // =================================================
      // BOOLEAN FIELDS
      // =================================================

      const booleanFields = [
        "bookingAllowed",
        "isPublished",
        "isActive",
      ];

      booleanFields.forEach(
        (field) => {
          if (
            req.body[field] !==
            undefined
          ) {
            darshanType[field] =
              req.body[field] ===
                "true" ||
              req.body[field] === true;
          }
        }
      );

      // =================================================
      // IMAGE
      // =================================================

      if (req.file) {
        darshanType.image =
          await uploadImage(
            req.file
          );
      }

      // =================================================
      // SLUG
      // =================================================

      if (req.body.name) {
        darshanType.slug =
          generateSlug(
            req.body.name
          );
      }

      await darshanType.save();

      return res.status(200).json({
        success: true,
        message:
          "Darshan type updated successfully",
        data: darshanType,
      });

    } catch (error) {
      console.error(
        "UPDATE DARSHAN TYPE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// DELETE DARSHAN TYPE
// =====================================================

exports.deleteDarshanType =
  async (req, res) => {
    try {
      const vendorId =
        req.user?.vendorId ||
        req.user?._id;

      const darshanType =
        await DarshanType.findOneAndDelete({
          _id: req.params.id,
          vendorId,
        });

      if (!darshanType) {
        return res.status(404).json({
          success: false,
          message:
            "Darshan type not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Darshan type deleted successfully",
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };