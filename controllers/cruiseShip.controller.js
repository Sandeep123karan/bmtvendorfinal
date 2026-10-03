// const mongoose = require("mongoose");

// const CruiseShip = require("../models/CruiseShip.model");
// const Vendor = require("../models/Vendor.model");

// /*
// |--------------------------------------------------------------------------
// | BUNNY UPLOAD
// |--------------------------------------------------------------------------
// |
// | IMPORTANT:
// | Yahan apne existing Bunny CDN upload helper ko call karo.
// |
// | Example:
// |
// | const uploadFileToBunny =
// |   require("../utils/bunnyUpload");
// |
// | Agar tumhare project me already helper hai,
// | to upar uska actual import laga dena.
// |
// */

// // const uploadFileToBunny = require("../utils/bunnyUpload");


// // =========================================================
// // GET LOGGED-IN VENDOR ID
// // =========================================================

// const getVendorId = (req) => {
//   return (
//     req.vendor?._id ||
//     req.vendor?.id ||
//     req.user?._id ||
//     req.user?.id ||
//     req.vendorId ||
//     null
//   );
// };


// // =========================================================
// // CHECK CRUISE VENDOR
// // =========================================================

// const getCruiseVendor = async (req) => {
//   const vendorId = getVendorId(req);

//   if (!vendorId) {
//     return {
//       error: {
//         status: 401,
//         code: "UNAUTHORIZED",
//         message: "Vendor authentication required.",
//       },
//     };
//   }

//   if (!mongoose.Types.ObjectId.isValid(vendorId)) {
//     return {
//       error: {
//         status: 401,
//         code: "INVALID_VENDOR_ID",
//         message: "Invalid vendor ID.",
//       },
//     };
//   }

//   const vendor = await Vendor.findById(vendorId);

//   if (!vendor) {
//     return {
//       error: {
//         status: 404,
//         code: "VENDOR_NOT_FOUND",
//         message: "Vendor not found.",
//       },
//     };
//   }

//   const vertical = String(
//     vendor.selectedVertical ||
//       vendor.vertical ||
//       ""
//   )
//     .trim()
//     .toLowerCase();

//   if (vertical !== "cruise") {
//     return {
//       error: {
//         status: 403,
//         code: "CRUISE_ACCESS_REQUIRED",
//         message:
//           "This account is not configured as a cruise vendor.",
//       },
//     };
//   }

//   return {
//     vendor,
//     vendorId,
//   };
// };


// // =========================================================
// // UPLOAD ONE FILE
// // =========================================================

// const uploadOneFile = async (
//   file,
//   folder = "cruise"
// ) => {
//   if (!file) {
//     return "";
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | IMPORTANT
//   |--------------------------------------------------------------------------
//   | Replace this block with your existing Bunny CDN upload function.
//   |--------------------------------------------------------------------------
//   */

//   if (typeof uploadFileToBunny !== "function") {
//     throw new Error(
//       "Bunny upload function is not connected. Connect your existing Bunny CDN upload helper in cruiseShip.controller.js."
//     );
//   }

//   const url = await uploadFileToBunny(
//     file,
//     folder
//   );

//   return url;
// };


// // =========================================================
// // UPLOAD MULTIPLE FILES
// // =========================================================

// const uploadMultipleFiles = async (
//   files = [],
//   folder = "cruise"
// ) => {
//   if (!Array.isArray(files)) {
//     return [];
//   }

//   const urls = [];

//   for (const file of files) {
//     const url = await uploadOneFile(
//       file,
//       folder
//     );

//     if (url) {
//       urls.push(url);
//     }
//   }

//   return urls;
// };


// // =========================================================
// // PARSE ARRAY FIELD
// // =========================================================

// const parseArrayField = (value) => {
//   if (Array.isArray(value)) {
//     return value;
//   }

//   if (!value) {
//     return [];
//   }

//   if (typeof value === "string") {
//     try {
//       const parsed = JSON.parse(value);

//       if (Array.isArray(parsed)) {
//         return parsed;
//       }
//     } catch (error) {
//       // Not JSON, continue below
//     }

//     return value
//       .split(",")
//       .map((item) => item.trim())
//       .filter(Boolean);
//   }

//   return [];
// };


// // =========================================================
// // SAFE NUMBER
// // =========================================================

// const toNumberOrNull = (value) => {
//   if (
//     value === undefined ||
//     value === null ||
//     value === ""
//   ) {
//     return null;
//   }

//   const number = Number(value);

//   return Number.isFinite(number)
//     ? number
//     : null;
// };


// // =========================================================
// // CREATE SHIP
// // POST /api/vendor/cruise/ships
// // =========================================================

// exports.createShip = async (req, res) => {
//   try {
//     // -------------------------------------------------------
//     // CHECK VENDOR
//     // -------------------------------------------------------

//     const result =
//       await getCruiseVendor(req);

//     if (result.error) {
//       return res
//         .status(result.error.status)
//         .json({
//           success: false,
//           code: result.error.code,
//           message: result.error.message,
//         });
//     }

//     // -------------------------------------------------------
//     // FORM DATA
//     // -------------------------------------------------------

//     const {
//       shipName,
//       cruiseLineName,
//       cruiseType,
//       vesselType,
//       imoNumber,
//       registrationNumber,
//       passengerCapacity,
//       crewCapacity,
//       numberOfCabins,
//       numberOfDecks,
//       yearBuilt,
//       yearRefurbished,
//       shipLength,
//       shipWidth,
//       description,
//       amenities,
//       status,
//     } = req.body || {};

//     // -------------------------------------------------------
//     // REQUIRED FIELD
//     // -------------------------------------------------------

//     if (
//       !shipName ||
//       !String(shipName).trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         code: "SHIP_NAME_REQUIRED",
//         message: "Ship name is required.",
//       });
//     }

//     const cleanShipName =
//       String(shipName).trim();

//     // -------------------------------------------------------
//     // DUPLICATE CHECK
//     // -------------------------------------------------------

//     const existingShip =
//       await CruiseShip.findOne({
//         vendorId: result.vendorId,
//         shipName: cleanShipName,
//       });

//     if (existingShip) {
//       return res.status(409).json({
//         success: false,
//         code: "SHIP_ALREADY_EXISTS",
//         message:
//           "A ship with this name already exists for this vendor.",
//       });
//     }

//     // -------------------------------------------------------
//     // FILES
//     // -------------------------------------------------------

//     const logoFile =
//       req.files?.logo?.[0] || null;

//     const coverImageFile =
//       req.files?.coverImage?.[0] || null;

//     const imageFiles =
//       req.files?.images || [];

//     const videoFiles =
//       req.files?.videos || [];

//     // -------------------------------------------------------
//     // UPLOAD LOGO
//     // -------------------------------------------------------

//     const logoUrl =
//       await uploadOneFile(
//         logoFile,
//         "cruise/logos"
//       );

//     // -------------------------------------------------------
//     // UPLOAD COVER IMAGE
//     // -------------------------------------------------------

//     const coverImageUrl =
//       await uploadOneFile(
//         coverImageFile,
//         "cruise/covers"
//       );

//     // -------------------------------------------------------
//     // UPLOAD PROPERTY / SHIP IMAGES
//     // -------------------------------------------------------

//     const imageUrls =
//       await uploadMultipleFiles(
//         imageFiles,
//         "cruise/images"
//       );

//     // -------------------------------------------------------
//     // UPLOAD VIDEOS
//     // -------------------------------------------------------

//     const videoUrls =
//       await uploadMultipleFiles(
//         videoFiles,
//         "cruise/videos"
//       );

//     // -------------------------------------------------------
//     // AMENITIES
//     // -------------------------------------------------------

//     const parsedAmenities =
//       parseArrayField(amenities);

//     // -------------------------------------------------------
//     // CREATE SHIP
//     // -------------------------------------------------------

//     const ship =
//       await CruiseShip.create({
//         vendorId:
//           result.vendorId,

//         shipName:
//           cleanShipName,

//         cruiseLineName:
//           cruiseLineName
//             ? String(
//                 cruiseLineName
//               ).trim()
//             : "",

//         cruiseType:
//           cruiseType ||
//           "ocean-cruise",

//         vesselType:
//           vesselType
//             ? String(
//                 vesselType
//               ).trim()
//             : "",

//         imoNumber:
//           imoNumber
//             ? String(
//                 imoNumber
//               ).trim()
//             : "",

//         registrationNumber:
//           registrationNumber
//             ? String(
//                 registrationNumber
//               ).trim()
//             : "",

//         passengerCapacity:
//           toNumberOrNull(
//             passengerCapacity
//           ) ?? 0,

//         crewCapacity:
//           toNumberOrNull(
//             crewCapacity
//           ) ?? 0,

//         numberOfCabins:
//           toNumberOrNull(
//             numberOfCabins
//           ) ?? 0,

//         numberOfDecks:
//           toNumberOrNull(
//             numberOfDecks
//           ) ?? 0,

//         yearBuilt:
//           toNumberOrNull(
//             yearBuilt
//           ),

//         yearRefurbished:
//           toNumberOrNull(
//             yearRefurbished
//           ),

//         shipLength:
//           toNumberOrNull(
//             shipLength
//           ),

//         shipWidth:
//           toNumberOrNull(
//             shipWidth
//           ),

//         description:
//           description
//             ? String(
//                 description
//               ).trim()
//             : "",

//         amenities:
//           parsedAmenities,

//         logo:
//           logoUrl,

//         coverImage:
//           coverImageUrl,

//         images:
//           imageUrls,

//         videos:
//           videoUrls,

//         status:
//           status || "draft",
//       });

//     // -------------------------------------------------------
//     // RESPONSE
//     // -------------------------------------------------------

//     return res.status(201).json({
//       success: true,
//       message:
//         "Cruise ship created successfully.",
//       ship,
//     });
//   } catch (error) {
//     console.error(
//       "Create Cruise Ship Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       code:
//         "CREATE_CRUISE_SHIP_FAILED",
//       message:
//         error.message ||
//         "Failed to create cruise ship.",
//     });
//   }
// };


// // =========================================================
// // GET ALL SHIPS
// // GET /api/vendor/cruise/ships
// // =========================================================

// exports.getShips = async (
//   req,
//   res
// ) => {
//   try {
//     const result =
//       await getCruiseVendor(req);

//     if (result.error) {
//       return res
//         .status(result.error.status)
//         .json({
//           success: false,
//           code: result.error.code,
//           message: result.error.message,
//         });
//     }

//     const ships =
//       await CruiseShip.find({
//         vendorId:
//           result.vendorId,
//       }).sort({
//         createdAt: -1,
//       });

//     return res.status(200).json({
//       success: true,
//       count: ships.length,
//       ships,
//     });
//   } catch (error) {
//     console.error(
//       "Get Cruise Ships Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       code:
//         "GET_CRUISE_SHIPS_FAILED",
//       message:
//         error.message ||
//         "Failed to fetch cruise ships.",
//     });
//   }
// };


// // =========================================================
// // GET SINGLE SHIP
// // GET /api/vendor/cruise/ships/:id
// // =========================================================

// exports.getShipById = async (
//   req,
//   res
// ) => {
//   try {
//     const result =
//       await getCruiseVendor(req);

//     if (result.error) {
//       return res
//         .status(result.error.status)
//         .json({
//           success: false,
//           code: result.error.code,
//           message: result.error.message,
//         });
//     }

//     const { id } = req.params;

//     if (
//       !mongoose.Types.ObjectId.isValid(id)
//     ) {
//       return res.status(400).json({
//         success: false,
//         code:
//           "INVALID_SHIP_ID",
//         message:
//           "Invalid ship ID.",
//       });
//     }

//     const ship =
//       await CruiseShip.findOne({
//         _id: id,
//         vendorId:
//           result.vendorId,
//       });

//     if (!ship) {
//       return res.status(404).json({
//         success: false,
//         code:
//           "SHIP_NOT_FOUND",
//         message:
//           "Cruise ship not found.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       ship,
//     });
//   } catch (error) {
//     console.error(
//       "Get Cruise Ship Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       code:
//         "GET_CRUISE_SHIP_FAILED",
//       message:
//         error.message ||
//         "Failed to fetch cruise ship.",
//     });
//   }
// };


// // =========================================================
// // UPDATE SHIP
// // PUT /api/vendor/cruise/ships/:id
// // =========================================================

// exports.updateShip = async (
//   req,
//   res
// ) => {
//   try {
//     const result =
//       await getCruiseVendor(req);

//     if (result.error) {
//       return res
//         .status(result.error.status)
//         .json({
//           success: false,
//           code: result.error.code,
//           message: result.error.message,
//         });
//     }

//     const { id } = req.params;

//     if (
//       !mongoose.Types.ObjectId.isValid(id)
//     ) {
//       return res.status(400).json({
//         success: false,
//         code:
//           "INVALID_SHIP_ID",
//         message:
//           "Invalid ship ID.",
//       });
//     }

//     // -------------------------------------------------------
//     // FIND EXISTING SHIP
//     // -------------------------------------------------------

//     const existingShip =
//       await CruiseShip.findOne({
//         _id: id,
//         vendorId:
//           result.vendorId,
//       });

//     if (!existingShip) {
//       return res.status(404).json({
//         success: false,
//         code:
//           "SHIP_NOT_FOUND",
//         message:
//           "Cruise ship not found.",
//       });
//     }

//     // -------------------------------------------------------
//     // BODY
//     // -------------------------------------------------------

//     const {
//       shipName,
//       cruiseLineName,
//       cruiseType,
//       vesselType,
//       imoNumber,
//       registrationNumber,
//       passengerCapacity,
//       crewCapacity,
//       numberOfCabins,
//       numberOfDecks,
//       yearBuilt,
//       yearRefurbished,
//       shipLength,
//       shipWidth,
//       description,
//       amenities,
//       status,
//     } = req.body || {};

//     // -------------------------------------------------------
//     // UPDATE BASIC FIELDS
//     // -------------------------------------------------------

//     if (
//       shipName !== undefined
//     ) {
//       const cleanName =
//         String(shipName).trim();

//       if (!cleanName) {
//         return res.status(400).json({
//           success: false,
//           code:
//             "SHIP_NAME_REQUIRED",
//           message:
//             "Ship name is required.",
//         });
//       }

//       // Check duplicate name
//       const duplicate =
//         await CruiseShip.findOne({
//           vendorId:
//             result.vendorId,

//           shipName:
//             cleanName,

//           _id: {
//             $ne: id,
//           },
//         });

//       if (duplicate) {
//         return res.status(409).json({
//           success: false,
//           code:
//             "SHIP_ALREADY_EXISTS",
//           message:
//             "Another ship with this name already exists.",
//         });
//       }

//       existingShip.shipName =
//         cleanName;
//     }

//     if (
//       cruiseLineName !== undefined
//     ) {
//       existingShip.cruiseLineName =
//         String(
//           cruiseLineName
//         ).trim();
//     }

//     if (
//       cruiseType !== undefined
//     ) {
//       existingShip.cruiseType =
//         cruiseType;
//     }

//     if (
//       vesselType !== undefined
//     ) {
//       existingShip.vesselType =
//         String(
//           vesselType
//         ).trim();
//     }

//     if (
//       imoNumber !== undefined
//     ) {
//       existingShip.imoNumber =
//         String(
//           imoNumber
//         ).trim();
//     }

//     if (
//       registrationNumber !==
//       undefined
//     ) {
//       existingShip.registrationNumber =
//         String(
//           registrationNumber
//         ).trim();
//     }

//     if (
//       passengerCapacity !==
//       undefined
//     ) {
//       existingShip.passengerCapacity =
//         toNumberOrNull(
//           passengerCapacity
//         ) ?? 0;
//     }

//     if (
//       crewCapacity !== undefined
//     ) {
//       existingShip.crewCapacity =
//         toNumberOrNull(
//           crewCapacity
//         ) ?? 0;
//     }

//     if (
//       numberOfCabins !== undefined
//     ) {
//       existingShip.numberOfCabins =
//         toNumberOrNull(
//           numberOfCabins
//         ) ?? 0;
//     }

//     if (
//       numberOfDecks !== undefined
//     ) {
//       existingShip.numberOfDecks =
//         toNumberOrNull(
//           numberOfDecks
//         ) ?? 0;
//     }

//     if (
//       yearBuilt !== undefined
//     ) {
//       existingShip.yearBuilt =
//         toNumberOrNull(
//           yearBuilt
//         );
//     }

//     if (
//       yearRefurbished !==
//       undefined
//     ) {
//       existingShip.yearRefurbished =
//         toNumberOrNull(
//           yearRefurbished
//         );
//     }

//     if (
//       shipLength !== undefined
//     ) {
//       existingShip.shipLength =
//         toNumberOrNull(
//           shipLength
//         );
//     }

//     if (
//       shipWidth !== undefined
//     ) {
//       existingShip.shipWidth =
//         toNumberOrNull(
//           shipWidth
//         );
//     }

//     if (
//       description !== undefined
//     ) {
//       existingShip.description =
//         String(
//           description
//         ).trim();
//     }

//     if (
//       amenities !== undefined
//     ) {
//       existingShip.amenities =
//         parseArrayField(
//           amenities
//         );
//     }

//     if (
//       status !== undefined
//     ) {
//       existingShip.status =
//         status;
//     }

//     // -------------------------------------------------------
//     // FILES
//     // -------------------------------------------------------

//     const logoFile =
//       req.files?.logo?.[0] ||
//       null;

//     const coverImageFile =
//       req.files?.coverImage?.[0] ||
//       null;

//     const imageFiles =
//       req.files?.images || [];

//     const videoFiles =
//       req.files?.videos || [];

//     // -------------------------------------------------------
//     // NEW LOGO
//     // -------------------------------------------------------

//     if (logoFile) {
//       const logoUrl =
//         await uploadOneFile(
//           logoFile,
//           "cruise/logos"
//         );

//       existingShip.logo =
//         logoUrl;
//     }

//     // -------------------------------------------------------
//     // NEW COVER
//     // -------------------------------------------------------

//     if (coverImageFile) {
//       const coverUrl =
//         await uploadOneFile(
//           coverImageFile,
//           "cruise/covers"
//         );

//       existingShip.coverImage =
//         coverUrl;
//     }

//     // -------------------------------------------------------
//     // NEW IMAGES
//     // -------------------------------------------------------

//     if (imageFiles.length > 0) {
//       const newImageUrls =
//         await uploadMultipleFiles(
//           imageFiles,
//           "cruise/images"
//         );

//       existingShip.images = [
//         ...(existingShip.images ||
//           []),
//         ...newImageUrls,
//       ];
//     }

//     // -------------------------------------------------------
//     // NEW VIDEOS
//     // -------------------------------------------------------

//     if (videoFiles.length > 0) {
//       const newVideoUrls =
//         await uploadMultipleFiles(
//           videoFiles,
//           "cruise/videos"
//         );

//       existingShip.videos = [
//         ...(existingShip.videos ||
//           []),
//         ...newVideoUrls,
//       ];
//     }

//     // -------------------------------------------------------
//     // SAVE
//     // -------------------------------------------------------

//     await existingShip.save();

//     return res.status(200).json({
//       success: true,
//       message:
//         "Cruise ship updated successfully.",
//       ship: existingShip,
//     });
//   } catch (error) {
//     console.error(
//       "Update Cruise Ship Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       code:
//         "UPDATE_CRUISE_SHIP_FAILED",
//       message:
//         error.message ||
//         "Failed to update cruise ship.",
//     });
//   }
// };


// // =========================================================
// // DELETE SHIP
// // DELETE /api/vendor/cruise/ships/:id
// // =========================================================

// exports.deleteShip = async (
//   req,
//   res
// ) => {
//   try {
//     const result =
//       await getCruiseVendor(req);

//     if (result.error) {
//       return res
//         .status(result.error.status)
//         .json({
//           success: false,
//           code: result.error.code,
//           message: result.error.message,
//         });
//     }

//     const { id } = req.params;

//     if (
//       !mongoose.Types.ObjectId.isValid(id)
//     ) {
//       return res.status(400).json({
//         success: false,
//         code:
//           "INVALID_SHIP_ID",
//         message:
//           "Invalid ship ID.",
//       });
//     }

//     const ship =
//       await CruiseShip.findOneAndDelete({
//         _id: id,
//         vendorId:
//           result.vendorId,
//       });

//     if (!ship) {
//       return res.status(404).json({
//         success: false,
//         code:
//           "SHIP_NOT_FOUND",
//         message:
//           "Cruise ship not found.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message:
//         "Cruise ship deleted successfully.",
//     });
//   } catch (error) {
//     console.error(
//       "Delete Cruise Ship Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       code:
//         "DELETE_CRUISE_SHIP_FAILED",
//       message:
//         error.message ||
//         "Failed to delete cruise ship.",
//     });
//   }
// };
const mongoose = require("mongoose");
const streamifier = require("streamifier");

const CruiseShip = require("../models/CruiseShip.model");
const Vendor = require("../models/Vendor.model");

const cloudinary = require("../config/cloudinary");

// =========================================================
// GET LOGGED-IN VENDOR ID
// =========================================================

const getVendorId = (req) => {
  return (
    req.vendor?._id ||
    req.vendor?.id ||
    req.user?._id ||
    req.user?.id ||
    req.vendorId ||
    null
  );
};

// =========================================================
// CHECK CRUISE VENDOR
// =========================================================

const getCruiseVendor = async (req) => {
  const vendorId = getVendorId(req);

  // -------------------------------------------------------
  // AUTH CHECK
  // -------------------------------------------------------

  if (!vendorId) {
    return {
      error: {
        status: 401,
        code: "UNAUTHORIZED",
        message: "Vendor authentication required.",
      },
    };
  }

  // -------------------------------------------------------
  // OBJECT ID CHECK
  // -------------------------------------------------------

  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    return {
      error: {
        status: 401,
        code: "INVALID_VENDOR_ID",
        message: "Invalid vendor ID.",
      },
    };
  }

  // -------------------------------------------------------
  // FIND VENDOR
  // -------------------------------------------------------

  const vendor = await Vendor.findById(vendorId);

  if (!vendor) {
    return {
      error: {
        status: 404,
        code: "VENDOR_NOT_FOUND",
        message: "Vendor not found.",
      },
    };
  }

  // -------------------------------------------------------
  // CHECK VERTICAL
  // -------------------------------------------------------

  const vertical = String(
    vendor.selectedVertical ||
      vendor.vertical ||
      ""
  )
    .trim()
    .toLowerCase();

  if (vertical !== "cruise") {
    return {
      error: {
        status: 403,
        code: "CRUISE_ACCESS_REQUIRED",
        message:
          "This account is not configured as a cruise vendor.",
      },
    };
  }

  return {
    vendor,
    vendorId,
  };
};

// =========================================================
// CLOUDINARY UPLOAD - ONE FILE
// =========================================================

const uploadOneFile = async (
  file,
  folder = "cruise"
) => {
  if (!file || !file.buffer) {
    return "";
  }

  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          if (!result?.secure_url) {
            return reject(
              new Error(
                "Cloudinary upload failed."
              )
            );
          }

          resolve(result.secure_url);
        }
      );

    streamifier
      .createReadStream(file.buffer)
      .pipe(uploadStream);
  });
};

// =========================================================
// CLOUDINARY UPLOAD - MULTIPLE FILES
// =========================================================

const uploadMultipleFiles = async (
  files = [],
  folder = "cruise"
) => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const urls = [];

  for (const file of files) {
    const url = await uploadOneFile(
      file,
      folder
    );

    if (url) {
      urls.push(url);
    }
  }

  return urls;
};

// =========================================================
// PARSE ARRAY FIELD
// =========================================================
//
// Supports:
//
// ["Pool","Gym","Spa"]
//
// OR
//
// Pool,Gym,Spa
//
// =========================================================

const parseArrayField = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter(Boolean);
      }
    } catch (error) {
      // Continue with comma-separated value
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

// =========================================================
// SAFE NUMBER
// =========================================================

const toNumberOrNull = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

// =========================================================
// CREATE CRUISE SHIP
// POST /api/cruise-ships
// =========================================================

exports.createShip = async (req, res) => {
  try {
    // =====================================================
    // CHECK VENDOR
    // =====================================================

    const result =
      await getCruiseVendor(req);

    if (result.error) {
      return res
        .status(result.error.status)
        .json({
          success: false,
          code: result.error.code,
          message: result.error.message,
        });
    }

    // =====================================================
    // FORM DATA
    // =====================================================

    const {
      shipName,
      cruiseLineName,
      cruiseType,
      vesselType,
      imoNumber,
      registrationNumber,
      passengerCapacity,
      crewCapacity,
      numberOfCabins,
      numberOfDecks,
      yearBuilt,
      yearRefurbished,
      shipLength,
      shipWidth,
      description,
      amenities,
      status,
    } = req.body || {};

    // =====================================================
    // VALIDATE SHIP NAME
    // =====================================================

    if (
      !shipName ||
      !String(shipName).trim()
    ) {
      return res.status(400).json({
        success: false,
        code: "SHIP_NAME_REQUIRED",
        message: "Ship name is required.",
      });
    }

    const cleanShipName =
      String(shipName).trim();

    // =====================================================
    // DUPLICATE CHECK
    // =====================================================

    const existingShip =
      await CruiseShip.findOne({
        vendorId: result.vendorId,
        shipName: cleanShipName,
      });

    if (existingShip) {
      return res.status(409).json({
        success: false,
        code: "SHIP_ALREADY_EXISTS",
        message:
          "A ship with this name already exists for this vendor.",
      });
    }

    // =====================================================
    // FILES FROM MULTER
    // =====================================================

    const logoFile =
      req.files?.logo?.[0] || null;

    const coverImageFile =
      req.files?.coverImage?.[0] || null;

    const imageFiles =
      req.files?.images || [];

    const videoFiles =
      req.files?.videos || [];

    // =====================================================
    // CLOUDINARY - LOGO
    // =====================================================

    const logoUrl =
      await uploadOneFile(
        logoFile,
        "cruise/logos"
      );

    // =====================================================
    // CLOUDINARY - COVER
    // =====================================================

    const coverImageUrl =
      await uploadOneFile(
        coverImageFile,
        "cruise/covers"
      );

    // =====================================================
    // CLOUDINARY - SHIP IMAGES
    // =====================================================

    const imageUrls =
      await uploadMultipleFiles(
        imageFiles,
        "cruise/images"
      );

    // =====================================================
    // CLOUDINARY - VIDEOS
    // =====================================================

    const videoUrls =
      await uploadMultipleFiles(
        videoFiles,
        "cruise/videos"
      );

    // =====================================================
    // AMENITIES
    // =====================================================

    const parsedAmenities =
      parseArrayField(amenities);

    // =====================================================
    // CREATE SHIP
    // =====================================================

    const ship =
      await CruiseShip.create({
        vendorId: result.vendorId,

        shipName: cleanShipName,

        cruiseLineName: cruiseLineName
          ? String(
              cruiseLineName
            ).trim()
          : "",

        cruiseType:
          cruiseType ||
          "ocean-cruise",

        vesselType: vesselType
          ? String(
              vesselType
            ).trim()
          : "",

        imoNumber: imoNumber
          ? String(
              imoNumber
            ).trim()
          : "",

        registrationNumber:
          registrationNumber
            ? String(
                registrationNumber
              ).trim()
            : "",

        passengerCapacity:
          toNumberOrNull(
            passengerCapacity
          ) ?? 0,

        crewCapacity:
          toNumberOrNull(
            crewCapacity
          ) ?? 0,

        numberOfCabins:
          toNumberOrNull(
            numberOfCabins
          ) ?? 0,

        numberOfDecks:
          toNumberOrNull(
            numberOfDecks
          ) ?? 0,

        yearBuilt:
          toNumberOrNull(
            yearBuilt
          ),

        yearRefurbished:
          toNumberOrNull(
            yearRefurbished
          ),

        shipLength:
          toNumberOrNull(
            shipLength
          ),

        shipWidth:
          toNumberOrNull(
            shipWidth
          ),

        description: description
          ? String(
              description
            ).trim()
          : "",

        amenities:
          parsedAmenities,

        logo:
          logoUrl,

        coverImage:
          coverImageUrl,

        images:
          imageUrls,

        videos:
          videoUrls,

        status:
          status || "draft",
      });

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(201).json({
      success: true,
      message:
        "Cruise ship created successfully.",
      ship,
    });
  } catch (error) {
    console.error(
      "Create Cruise Ship Error:",
      error
    );

    return res.status(500).json({
      success: false,
      code:
        "CREATE_CRUISE_SHIP_FAILED",
      message:
        error.message ||
        "Failed to create cruise ship.",
    });
  }
};

// =========================================================
// GET ALL CRUISE SHIPS
// GET /api/cruise-ships
// =========================================================

exports.getShips = async (
  req,
  res
) => {
  try {
    const result =
      await getCruiseVendor(req);

    if (result.error) {
      return res
        .status(result.error.status)
        .json({
          success: false,
          code: result.error.code,
          message: result.error.message,
        });
    }

    const ships =
      await CruiseShip.find({
        vendorId: result.vendorId,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: ships.length,
      ships,
    });
  } catch (error) {
    console.error(
      "Get Cruise Ships Error:",
      error
    );

    return res.status(500).json({
      success: false,
      code:
        "GET_CRUISE_SHIPS_FAILED",
      message:
        error.message ||
        "Failed to fetch cruise ships.",
    });
  }
};

// =========================================================
// GET SINGLE CRUISE SHIP
// GET /api/cruise-ships/:id
// =========================================================

exports.getShipById = async (
  req,
  res
) => {
  try {
    const result =
      await getCruiseVendor(req);

    if (result.error) {
      return res
        .status(result.error.status)
        .json({
          success: false,
          code: result.error.code,
          message: result.error.message,
        });
    }

    const { id } = req.params;

    // =====================================================
    // VALIDATE ID
    // =====================================================

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        code: "INVALID_SHIP_ID",
        message:
          "Invalid ship ID.",
      });
    }

    // =====================================================
    // FIND SHIP
    // =====================================================

    const ship =
      await CruiseShip.findOne({
        _id: id,
        vendorId: result.vendorId,
      });

    if (!ship) {
      return res.status(404).json({
        success: false,
        code: "SHIP_NOT_FOUND",
        message:
          "Cruise ship not found.",
      });
    }

    return res.status(200).json({
      success: true,
      ship,
    });
  } catch (error) {
    console.error(
      "Get Cruise Ship Error:",
      error
    );

    return res.status(500).json({
      success: false,
      code:
        "GET_CRUISE_SHIP_FAILED",
      message:
        error.message ||
        "Failed to fetch cruise ship.",
    });
  }
};

// =========================================================
// UPDATE CRUISE SHIP
// PUT /api/cruise-ships/:id
// =========================================================

exports.updateShip = async (
  req,
  res
) => {
  try {
    // =====================================================
    // CHECK VENDOR
    // =====================================================

    const result =
      await getCruiseVendor(req);

    if (result.error) {
      return res
        .status(result.error.status)
        .json({
          success: false,
          code: result.error.code,
          message: result.error.message,
        });
    }

    const { id } = req.params;

    // =====================================================
    // VALIDATE ID
    // =====================================================

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        code: "INVALID_SHIP_ID",
        message:
          "Invalid ship ID.",
      });
    }

    // =====================================================
    // FIND EXISTING SHIP
    // =====================================================

    const existingShip =
      await CruiseShip.findOne({
        _id: id,
        vendorId: result.vendorId,
      });

    if (!existingShip) {
      return res.status(404).json({
        success: false,
        code: "SHIP_NOT_FOUND",
        message:
          "Cruise ship not found.",
      });
    }

    // =====================================================
    // BODY
    // =====================================================

    const {
      shipName,
      cruiseLineName,
      cruiseType,
      vesselType,
      imoNumber,
      registrationNumber,
      passengerCapacity,
      crewCapacity,
      numberOfCabins,
      numberOfDecks,
      yearBuilt,
      yearRefurbished,
      shipLength,
      shipWidth,
      description,
      amenities,
      status,
    } = req.body || {};

    // =====================================================
    // SHIP NAME
    // =====================================================

    if (
      shipName !== undefined
    ) {
      const cleanName =
        String(shipName).trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          code:
            "SHIP_NAME_REQUIRED",
          message:
            "Ship name is required.",
        });
      }

      // ---------------------------------------------------
      // DUPLICATE NAME
      // ---------------------------------------------------

      const duplicate =
        await CruiseShip.findOne({
          vendorId:
            result.vendorId,

          shipName:
            cleanName,

          _id: {
            $ne: id,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          code:
            "SHIP_ALREADY_EXISTS",
          message:
            "Another ship with this name already exists.",
        });
      }

      existingShip.shipName =
        cleanName;
    }

    // =====================================================
    // BASIC FIELDS
    // =====================================================

    if (
      cruiseLineName !== undefined
    ) {
      existingShip.cruiseLineName =
        String(
          cruiseLineName
        ).trim();
    }

    if (
      cruiseType !== undefined
    ) {
      existingShip.cruiseType =
        cruiseType;
    }

    if (
      vesselType !== undefined
    ) {
      existingShip.vesselType =
        String(
          vesselType
        ).trim();
    }

    if (
      imoNumber !== undefined
    ) {
      existingShip.imoNumber =
        String(
          imoNumber
        ).trim();
    }

    if (
      registrationNumber !==
      undefined
    ) {
      existingShip.registrationNumber =
        String(
          registrationNumber
        ).trim();
    }

    // =====================================================
    // NUMERIC FIELDS
    // =====================================================

    if (
      passengerCapacity !==
      undefined
    ) {
      existingShip.passengerCapacity =
        toNumberOrNull(
          passengerCapacity
        ) ?? 0;
    }

    if (
      crewCapacity !== undefined
    ) {
      existingShip.crewCapacity =
        toNumberOrNull(
          crewCapacity
        ) ?? 0;
    }

    if (
      numberOfCabins !==
      undefined
    ) {
      existingShip.numberOfCabins =
        toNumberOrNull(
          numberOfCabins
        ) ?? 0;
    }

    if (
      numberOfDecks !== undefined
    ) {
      existingShip.numberOfDecks =
        toNumberOrNull(
          numberOfDecks
        ) ?? 0;
    }

    if (
      yearBuilt !== undefined
    ) {
      existingShip.yearBuilt =
        toNumberOrNull(
          yearBuilt
        );
    }

    if (
      yearRefurbished !==
      undefined
    ) {
      existingShip.yearRefurbished =
        toNumberOrNull(
          yearRefurbished
        );
    }

    if (
      shipLength !== undefined
    ) {
      existingShip.shipLength =
        toNumberOrNull(
          shipLength
        );
    }

    if (
      shipWidth !== undefined
    ) {
      existingShip.shipWidth =
        toNumberOrNull(
          shipWidth
        );
    }

    // =====================================================
    // DESCRIPTION
    // =====================================================

    if (
      description !== undefined
    ) {
      existingShip.description =
        String(
          description
        ).trim();
    }

    // =====================================================
    // AMENITIES
    // =====================================================

    if (
      amenities !== undefined
    ) {
      existingShip.amenities =
        parseArrayField(
          amenities
        );
    }

    // =====================================================
    // STATUS
    // =====================================================

    if (
      status !== undefined
    ) {
      existingShip.status =
        status;
    }

    // =====================================================
    // FILES
    // =====================================================

    const logoFile =
      req.files?.logo?.[0] ||
      null;

    const coverImageFile =
      req.files?.coverImage?.[0] ||
      null;

    const imageFiles =
      req.files?.images || [];

    const videoFiles =
      req.files?.videos || [];

    // =====================================================
    // NEW LOGO
    // =====================================================

    if (logoFile) {
      const logoUrl =
        await uploadOneFile(
          logoFile,
          "cruise/logos"
        );

      existingShip.logo =
        logoUrl;
    }

    // =====================================================
    // NEW COVER IMAGE
    // =====================================================

    if (coverImageFile) {
      const coverUrl =
        await uploadOneFile(
          coverImageFile,
          "cruise/covers"
        );

      existingShip.coverImage =
        coverUrl;
    }

    // =====================================================
    // NEW SHIP IMAGES
    // =====================================================

    if (imageFiles.length > 0) {
      const newImageUrls =
        await uploadMultipleFiles(
          imageFiles,
          "cruise/images"
        );

      existingShip.images = [
        ...(existingShip.images || []),
        ...newImageUrls,
      ];
    }

    // =====================================================
    // NEW VIDEOS
    // =====================================================

    if (videoFiles.length > 0) {
      const newVideoUrls =
        await uploadMultipleFiles(
          videoFiles,
          "cruise/videos"
        );

      existingShip.videos = [
        ...(existingShip.videos || []),
        ...newVideoUrls,
      ];
    }

    // =====================================================
    // SAVE
    // =====================================================

    await existingShip.save();

    return res.status(200).json({
      success: true,
      message:
        "Cruise ship updated successfully.",
      ship: existingShip,
    });
  } catch (error) {
    console.error(
      "Update Cruise Ship Error:",
      error
    );

    return res.status(500).json({
      success: false,
      code:
        "UPDATE_CRUISE_SHIP_FAILED",
      message:
        error.message ||
        "Failed to update cruise ship.",
    });
  }
};

// =========================================================
// DELETE CRUISE SHIP
// DELETE /api/cruise-ships/:id
// =========================================================

exports.deleteShip = async (
  req,
  res
) => {
  try {
    // =====================================================
    // CHECK VENDOR
    // =====================================================

    const result =
      await getCruiseVendor(req);

    if (result.error) {
      return res
        .status(result.error.status)
        .json({
          success: false,
          code: result.error.code,
          message: result.error.message,
        });
    }

    const { id } = req.params;

    // =====================================================
    // VALIDATE ID
    // =====================================================

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        code: "INVALID_SHIP_ID",
        message:
          "Invalid ship ID.",
      });
    }

    // =====================================================
    // DELETE ONLY OWN SHIP
    // =====================================================

    const ship =
      await CruiseShip.findOneAndDelete({
        _id: id,
        vendorId: result.vendorId,
      });

    if (!ship) {
      return res.status(404).json({
        success: false,
        code: "SHIP_NOT_FOUND",
        message:
          "Cruise ship not found.",
      });
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      message:
        "Cruise ship deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Cruise Ship Error:",
      error
    );

    return res.status(500).json({
      success: false,
      code:
        "DELETE_CRUISE_SHIP_FAILED",
      message:
        error.message ||
        "Failed to delete cruise ship.",
    });
  }
};