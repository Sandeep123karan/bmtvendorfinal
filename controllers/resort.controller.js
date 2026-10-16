// const mongoose = require("mongoose");
// const Resort = require("../models/Resort.model");


// /* ==========================================================
//                     HELPERS
// ========================================================== */

// const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// const cleanImages = (images) => {
//   if (!Array.isArray(images)) return [];

//   return images
//     .filter((img) => img && typeof img.url === "string" && img.url.trim())
//     .map((img) => ({
//       url: img.url.trim(),
//       publicId: typeof img.publicId === "string" ? img.publicId.trim() : "",
//     }));
// };

// const cleanCover = (cover, images) => {
//   if (cover && typeof cover.url === "string" && cover.url.trim()) {
//     return {
//       url: cover.url.trim(),
//       publicId: typeof cover.publicId === "string" ? cover.publicId.trim() : "",
//     };
//   }

//   // Cover nahi diya to pehli image cover ban jaye
//   if (images.length > 0) {
//     return { url: images[0].url, publicId: images[0].publicId };
//   }

//   return { url: "", publicId: "" };
// };

// const cleanAmenities = (amenities) => {
//   if (!Array.isArray(amenities)) return [];

//   const seen = new Set();

//   return amenities
//     .filter((a) => typeof a === "string")
//     .map((a) => a.trim())
//     .filter((a) => {
//       const key = a.toLowerCase();
//       if (!a || seen.has(key)) return false;
//       seen.add(key);
//       return true;
//     });
// };

// const cleanStar = (value) => {
//   const n = Number(value);
//   if (Number.isNaN(n)) return 3;
//   return Math.min(5, Math.max(1, Math.round(n)));
// };

// const handleError = (res, error, label) => {
//   console.error(`${label}:`, error);

//   // Mongoose validation (enum, min/max etc.)
//   if (error.name === "ValidationError") {
//     return res.status(400).json({
//       success: false,
//       message: Object.values(error.errors)
//         .map((e) => e.message)
//         .join(", "),
//     });
//   }

//   if (error.name === "CastError") {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid value or id provided.",
//     });
//   }

//   return res.status(500).json({
//     success: false,
//     message: error.message || "Something went wrong.",
//   });
// };


// /* ==========================================================
//                     CREATE RESORT
//    Admin approval NOT required -> status directly APPROVED
// ========================================================== */

// exports.createResort = async (req, res) => {
//   try {
//     const {
//       name,
//       propertyType,
//       starRating,
//       shortDescription,
//       description,
//       contact,
//       address,
//       checkInTime,
//       checkOutTime,
//       amenities,
//       images,
//       coverImage,
//       policies,
//       isActive,
//     } = req.body;


//     // ==========================================
//     // VALIDATION
//     // ==========================================

//     if (!name || !String(name).trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Resort name is required.",
//       });
//     }


//     // ==========================================
//     // IMAGES
//     // ==========================================

//     const cleanedImages = cleanImages(images);


//     // ==========================================
//     // CREATE RESORT
//     // vendor comes ONLY from JWT
//     // ==========================================

//     const resort = await Resort.create({
//       vendor: req.vendor._id,

//       name: String(name).trim(),
//       propertyType: propertyType || "resort",
//       starRating: cleanStar(starRating),

//       shortDescription: shortDescription || "",
//       description: description || "",

//       contact: contact || {},
//       address: address || {},

//       checkInTime: checkInTime || "14:00",
//       checkOutTime: checkOutTime || "11:00",

//       amenities: cleanAmenities(amenities),

//       images: cleanedImages,
//       coverImage: cleanCover(coverImage, cleanedImages),

//       policies: policies || {},

//       // Direct live - no admin approval
//       status: "APPROVED",
//       rejectionReason: "",
//       isActive: isActive === undefined ? true : Boolean(isActive),
//     });


//     return res.status(201).json({
//       success: true,
//       message: "Resort added successfully.",
//       resort,
//     });

//   } catch (error) {
//     return handleError(res, error, "Create Resort Error");
//   }
// };


// /* ==========================================================
//                     GET MY RESORTS
// ========================================================== */

// exports.getMyResorts = async (req, res) => {
//   try {

//     const resorts = await Resort.find({
//       vendor: req.vendor._id,
//     }).sort({ createdAt: -1 });


//     return res.status(200).json({
//       success: true,
//       total: resorts.length,
//       resorts,
//     });

//   } catch (error) {
//     return handleError(res, error, "Get My Resorts Error");
//   }
// };


// /* ==========================================================
//                     GET SINGLE RESORT
// ========================================================== */

// exports.getSingleResort = async (req, res) => {
//   try {

//     if (!isValidId(req.params.id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid resort id.",
//       });
//     }

//     const resort = await Resort.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });


//     if (!resort) {
//       return res.status(404).json({
//         success: false,
//         message: "Resort not found.",
//       });
//     }


//     return res.status(200).json({
//       success: true,
//       resort,
//     });

//   } catch (error) {
//     return handleError(res, error, "Get Single Resort Error");
//   }
// };


// /* ==========================================================
//                     UPDATE RESORT
// ========================================================== */

// exports.updateResort = async (req, res) => {
//   try {

//     if (!isValidId(req.params.id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid resort id.",
//       });
//     }

//     const resort = await Resort.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });


//     if (!resort) {
//       return res.status(404).json({
//         success: false,
//         message: "Resort not found.",
//       });
//     }


//     const {
//       name,
//       propertyType,
//       starRating,
//       shortDescription,
//       description,
//       contact,
//       address,
//       checkInTime,
//       checkOutTime,
//       amenities,
//       images,
//       coverImage,
//       policies,
//       isActive,
//     } = req.body;


//     // ==========================================
//     // UPDATE ONLY PROVIDED FIELDS
//     // ==========================================

//     if (name !== undefined) {
//       if (!String(name).trim()) {
//         return res.status(400).json({
//           success: false,
//           message: "Resort name is required.",
//         });
//       }
//       resort.name = String(name).trim();
//     }

//     if (propertyType !== undefined) resort.propertyType = propertyType;
//     if (starRating !== undefined) resort.starRating = cleanStar(starRating);
//     if (shortDescription !== undefined) resort.shortDescription = shortDescription;
//     if (description !== undefined) resort.description = description;
//     if (contact !== undefined) resort.contact = contact;
//     if (address !== undefined) resort.address = address;
//     if (checkInTime !== undefined) resort.checkInTime = checkInTime;
//     if (checkOutTime !== undefined) resort.checkOutTime = checkOutTime;
//     if (amenities !== undefined) resort.amenities = cleanAmenities(amenities);
//     if (policies !== undefined) resort.policies = policies;
//     if (isActive !== undefined) resort.isActive = Boolean(isActive);

//     if (images !== undefined) {
//       const cleanedImages = cleanImages(images);
//       resort.images = cleanedImages;
//       resort.coverImage = cleanCover(coverImage, cleanedImages);
//     } else if (coverImage !== undefined) {
//       resort.coverImage = cleanCover(coverImage, resort.images || []);
//     }


//     // ==========================================
//     // NO ADMIN APPROVAL NEEDED
//     // Purane DRAFT / PENDING / REJECTED resorts
//     // bhi edit ke baad live ho jayenge
//     // ==========================================

//     resort.status = "APPROVED";
//     resort.rejectionReason = "";


//     await resort.save();


//     return res.status(200).json({
//       success: true,
//       message: "Resort updated successfully.",
//       resort,
//     });

//   } catch (error) {
//     return handleError(res, error, "Update Resort Error");
//   }
// };


// /* ==========================================================
//                     DELETE RESORT
// ========================================================== */

// exports.deleteResort = async (req, res) => {
//   try {

//     if (!isValidId(req.params.id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid resort id.",
//       });
//     }

//     const resort = await Resort.findOneAndDelete({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });


//     if (!resort) {
//       return res.status(404).json({
//         success: false,
//         message: "Resort not found or access denied.",
//       });
//     }


//     return res.status(200).json({
//       success: true,
//       message: "Resort deleted successfully.",
//     });

//   } catch (error) {
//     return handleError(res, error, "Delete Resort Error");
//   }
// };

const mongoose = require("mongoose");
const Resort = require("../models/Resort.model");
const ResortRoom = require("../models/ResortRoom.model");


/* ==========================================================
                    HELPERS
========================================================== */

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const cleanImages = (images) => {
  if (!Array.isArray(images)) return [];

  return images
    .filter((img) => img && typeof img.url === "string" && img.url.trim())
    .map((img) => ({
      url: img.url.trim(),
      publicId: typeof img.publicId === "string" ? img.publicId.trim() : "",
    }));
};

const cleanCover = (cover, images) => {
  if (cover && typeof cover.url === "string" && cover.url.trim()) {
    return {
      url: cover.url.trim(),
      publicId: typeof cover.publicId === "string" ? cover.publicId.trim() : "",
    };
  }

  // Cover nahi diya to pehli image cover ban jaye
  if (images.length > 0) {
    return { url: images[0].url, publicId: images[0].publicId };
  }

  return { url: "", publicId: "" };
};

const cleanAmenities = (amenities) => {
  if (!Array.isArray(amenities)) return [];

  const seen = new Set();

  return amenities
    .filter((a) => typeof a === "string")
    .map((a) => a.trim())
    .filter((a) => {
      const key = a.toLowerCase();
      if (!a || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const cleanStar = (value) => {
  const n = Number(value);
  if (Number.isNaN(n)) return 3;
  return Math.min(5, Math.max(1, Math.round(n)));
};

const handleError = (res, error, label) => {
  console.error(`${label}:`, error);

  // Mongoose validation (enum, min/max etc.)
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(error.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid value or id provided.",
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message || "Something went wrong.",
  });
};


/* ==========================================================
                    CREATE RESORT
   Admin approval NOT required -> status directly APPROVED
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
      images,
      coverImage,
      policies,
      isActive,
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Resort name is required.",
      });
    }


    // ==========================================
    // IMAGES
    // ==========================================

    const cleanedImages = cleanImages(images);


    // ==========================================
    // CREATE RESORT
    // vendor comes ONLY from JWT
    // ==========================================

    const resort = await Resort.create({
      vendor: req.vendor._id,

      name: String(name).trim(),
      propertyType: propertyType || "resort",
      starRating: cleanStar(starRating),

      shortDescription: shortDescription || "",
      description: description || "",

      contact: contact || {},
      address: address || {},

      checkInTime: checkInTime || "14:00",
      checkOutTime: checkOutTime || "11:00",

      amenities: cleanAmenities(amenities),

      images: cleanedImages,
      coverImage: cleanCover(coverImage, cleanedImages),

      policies: policies || {},

      // Direct live - no admin approval
      status: "APPROVED",
      rejectionReason: "",
      isActive: isActive === undefined ? true : Boolean(isActive),
    });


    return res.status(201).json({
      success: true,
      message: "Resort added successfully.",
      resort,
    });

  } catch (error) {
    return handleError(res, error, "Create Resort Error");
  }
};


/* ==========================================================
                    GET MY RESORTS
========================================================== */

exports.getMyResorts = async (req, res) => {
  try {

    const resorts = await Resort.find({
      vendor: req.vendor._id,
    }).sort({ createdAt: -1 });


    return res.status(200).json({
      success: true,
      total: resorts.length,
      resorts,
    });

  } catch (error) {
    return handleError(res, error, "Get My Resorts Error");
  }
};


/* ==========================================================
                    GET SINGLE RESORT
========================================================== */

exports.getSingleResort = async (req, res) => {
  try {

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resort id.",
      });
    }

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
    return handleError(res, error, "Get Single Resort Error");
  }
};


/* ==========================================================
                    UPDATE RESORT
========================================================== */

exports.updateResort = async (req, res) => {
  try {

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resort id.",
      });
    }

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
      images,
      coverImage,
      policies,
      isActive,
    } = req.body;


    // ==========================================
    // UPDATE ONLY PROVIDED FIELDS
    // ==========================================

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: "Resort name is required.",
        });
      }
      resort.name = String(name).trim();
    }

    if (propertyType !== undefined) resort.propertyType = propertyType;
    if (starRating !== undefined) resort.starRating = cleanStar(starRating);
    if (shortDescription !== undefined) resort.shortDescription = shortDescription;
    if (description !== undefined) resort.description = description;
    if (contact !== undefined) resort.contact = contact;
    if (address !== undefined) resort.address = address;
    if (checkInTime !== undefined) resort.checkInTime = checkInTime;
    if (checkOutTime !== undefined) resort.checkOutTime = checkOutTime;
    if (amenities !== undefined) resort.amenities = cleanAmenities(amenities);
    if (policies !== undefined) resort.policies = policies;
    if (isActive !== undefined) resort.isActive = Boolean(isActive);

    if (images !== undefined) {
      const cleanedImages = cleanImages(images);
      resort.images = cleanedImages;
      resort.coverImage = cleanCover(coverImage, cleanedImages);
    } else if (coverImage !== undefined) {
      resort.coverImage = cleanCover(coverImage, resort.images || []);
    }


    // ==========================================
    // NO ADMIN APPROVAL NEEDED
    // Purane DRAFT / PENDING / REJECTED resorts
    // bhi edit ke baad live ho jayenge
    // ==========================================

    resort.status = "APPROVED";
    resort.rejectionReason = "";


    await resort.save();


    return res.status(200).json({
      success: true,
      message: "Resort updated successfully.",
      resort,
    });

  } catch (error) {
    return handleError(res, error, "Update Resort Error");
  }
};


/* ==========================================================
                    DELETE RESORT
========================================================== */

exports.deleteResort = async (req, res) => {
  try {

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resort id.",
      });
    }

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


    // Resort ke saare room categories bhi delete (orphan na bachein)
    await ResortRoom.deleteMany({ resort: resort._id });


    return res.status(200).json({
      success: true,
      message: "Resort deleted successfully.",
    });

  } catch (error) {
    return handleError(res, error, "Delete Resort Error");
  }
};