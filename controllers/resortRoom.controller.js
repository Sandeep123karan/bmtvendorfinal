// const Resort = require("../models/Resort.model");
// const ResortRoom = require("../models/ResortRoom.model");


// /* ==========================================================
//                 CREATE ROOM CATEGORY
// ========================================================== */

// exports.createRoom = async (req, res) => {
//   try {
//     const {
//       resortId,
//       name,
//       description,
//       roomSize,
//       roomSizeUnit,
//       bedType,
//       numberOfBeds,
//       maxAdults,
//       maxChildren,
//       maxGuests,
//       basePrice,
//       extraAdultPrice,
//       extraChildPrice,
//       mealPlans,
//       amenities,
//     } = req.body;


//     // ==========================================
//     // VALIDATION
//     // ==========================================

//     if (!resortId || !name || basePrice === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "resortId, name and basePrice are required.",
//       });
//     }


//     // ==========================================
//     // CHECK RESORT OWNERSHIP
//     // Vendor can only add room to own resort
//     // ==========================================

//     const resort = await Resort.findOne({
//       _id: resortId,
//       vendor: req.vendor._id,
//     });

//     if (!resort) {
//       return res.status(404).json({
//         success: false,
//         message: "Resort not found or access denied.",
//       });
//     }


//     // ==========================================
//     // CHECK DUPLICATE ROOM CATEGORY
//     // ==========================================

//     const existingRoom = await ResortRoom.findOne({
//       resort: resortId,
//       name: name.trim(),
//     });

//     if (existingRoom) {
//       return res.status(400).json({
//         success: false,
//         message: "This room category already exists in this resort.",
//       });
//     }


//     // ==========================================
//     // CREATE ROOM
//     // ==========================================

//     const room = await ResortRoom.create({
//       resort: resortId,
//       vendor: req.vendor._id,

//       name: name.trim(),
//       description: description || "",

//       roomSize: roomSize || 0,
//       roomSizeUnit: roomSizeUnit || "sqft",

//       bedType: bedType || "",
//       numberOfBeds: numberOfBeds || 1,

//       maxAdults: maxAdults || 2,
//       maxChildren: maxChildren || 0,
//       maxGuests: maxGuests || 2,

//       basePrice,

//       extraAdultPrice: extraAdultPrice || 0,
//       extraChildPrice: extraChildPrice || 0,

//       mealPlans: mealPlans || [],
//       amenities: amenities || [],
//     });


//     return res.status(201).json({
//       success: true,
//       message: "Room category created successfully.",
//       room,
//     });

//   } catch (error) {
//     console.error("Create Room Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================================
//                 GET ROOMS OF A RESORT
// ========================================================== */

// exports.getResortRooms = async (req, res) => {
//   try {
//     const { resortId } = req.params;


//     // Security check
//     const resort = await Resort.findOne({
//       _id: resortId,
//       vendor: req.vendor._id,
//     });

//     if (!resort) {
//       return res.status(404).json({
//         success: false,
//         message: "Resort not found or access denied.",
//       });
//     }


//     const rooms = await ResortRoom.find({
//       resort: resortId,
//       vendor: req.vendor._id,
//     }).sort({ createdAt: -1 });


//     return res.status(200).json({
//       success: true,
//       total: rooms.length,
//       rooms,
//     });

//   } catch (error) {
//     console.error("Get Resort Rooms Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================================
//                 GET SINGLE ROOM CATEGORY
// ========================================================== */

// exports.getSingleRoom = async (req, res) => {
//   try {
//     const room = await ResortRoom.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });

//     if (!room) {
//       return res.status(404).json({
//         success: false,
//         message: "Room category not found or access denied.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       room,
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================================
//                 UPDATE ROOM CATEGORY
// ========================================================== */

// exports.updateRoom = async (req, res) => {
//   try {
//     const room = await ResortRoom.findOne({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });

//     if (!room) {
//       return res.status(404).json({
//         success: false,
//         message: "Room category not found or access denied.",
//       });
//     }


//     const allowedFields = [
//       "name",
//       "description",
//       "roomSize",
//       "roomSizeUnit",
//       "bedType",
//       "numberOfBeds",
//       "maxAdults",
//       "maxChildren",
//       "maxGuests",
//       "basePrice",
//       "extraAdultPrice",
//       "extraChildPrice",
//       "mealPlans",
//       "amenities",
//       "status",
//       "isActive",
//     ];


//     allowedFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         room[field] = req.body[field];
//       }
//     });


//     await room.save();


//     return res.status(200).json({
//       success: true,
//       message: "Room category updated successfully.",
//       room,
//     });

//   } catch (error) {
//     console.error("Update Room Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// /* ==========================================================
//                 DELETE ROOM CATEGORY
// ========================================================== */

// exports.deleteRoom = async (req, res) => {
//   try {
//     const room = await ResortRoom.findOneAndDelete({
//       _id: req.params.id,
//       vendor: req.vendor._id,
//     });

//     if (!room) {
//       return res.status(404).json({
//         success: false,
//         message: "Room category not found or access denied.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Room category deleted successfully.",
//     });

//   } catch (error) {
//     console.error("Delete Room Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

const mongoose = require("mongoose");
const Resort = require("../models/Resort.model");
const ResortRoom = require("../models/ResortRoom.model");


/* ==========================================================
                    HELPERS
========================================================== */

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const MEAL_PLAN_NAMES = ["ROOM_ONLY", "BREAKFAST", "HALF_BOARD", "FULL_BOARD"];

// Case-insensitive match (Deluxe == deluxe)
const CI = { locale: "en", strength: 2 };

class ValidationFailure extends Error {}

const fail = (message) => {
  throw new ValidationFailure(message);
};

const toNumber = (value, label, { min = 0, integer = false } = {}) => {
  const n = Number(value);

  if (value === "" || value === null || Number.isNaN(n)) {
    fail(`${label} must be a number.`);
  }
  if (n < min) {
    fail(`${label} must be at least ${min}.`);
  }
  if (integer && !Number.isInteger(n)) {
    fail(`${label} must be a whole number.`);
  }

  return n;
};

const cleanImages = (images) => {
  if (!Array.isArray(images)) return [];

  return images
    .filter((img) => img && typeof img.url === "string" && img.url.trim())
    .map((img) => ({
      url: img.url.trim(),
      publicId: typeof img.publicId === "string" ? img.publicId.trim() : "",
    }));
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

const cleanMealPlans = (plans) => {
  if (!Array.isArray(plans)) fail("mealPlans must be a list.");

  const seen = new Set();
  const result = [];

  plans.forEach((p) => {
    if (!p || !MEAL_PLAN_NAMES.includes(p.name)) {
      fail(`Meal plan must be one of: ${MEAL_PLAN_NAMES.join(", ")}.`);
    }
    if (seen.has(p.name)) return;
    seen.add(p.name);

    result.push({
      name: p.name,
      price: p.price === undefined || p.price === "" ? 0 : toNumber(p.price, "Meal plan price"),
    });
  });

  return result;
};

/*
  Sirf wahi fields return karta hai jo body me aaye hain
  (whitelist) - vendor/resort/_id kabhi body se nahi aayenge.
*/
const sanitizeRoomFields = (body) => {
  const data = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) fail("Room name is required.");
    data.name = name;
  }

  if (body.description !== undefined) data.description = String(body.description);

  if (body.roomSize !== undefined) data.roomSize = toNumber(body.roomSize === "" ? 0 : body.roomSize, "Room size");

  if (body.roomSizeUnit !== undefined) {
    if (!["sqft", "sqm"].includes(body.roomSizeUnit)) fail("Room size unit must be sqft or sqm.");
    data.roomSizeUnit = body.roomSizeUnit;
  }

  if (body.bedType !== undefined) data.bedType = String(body.bedType).trim();

  if (body.numberOfBeds !== undefined) {
    data.numberOfBeds = toNumber(body.numberOfBeds, "Number of beds", { min: 1, integer: true });
  }

  if (body.maxAdults !== undefined) {
    data.maxAdults = toNumber(body.maxAdults, "Max adults", { min: 1, integer: true });
  }

  if (body.maxChildren !== undefined) {
    data.maxChildren = toNumber(body.maxChildren, "Max children", { min: 0, integer: true });
  }

  if (body.maxGuests !== undefined) {
    data.maxGuests = toNumber(body.maxGuests, "Max guests", { min: 1, integer: true });
  }

  if (body.basePrice !== undefined) data.basePrice = toNumber(body.basePrice, "Base price");

  if (body.extraAdultPrice !== undefined) {
    data.extraAdultPrice = toNumber(body.extraAdultPrice === "" ? 0 : body.extraAdultPrice, "Extra adult price");
  }

  if (body.extraChildPrice !== undefined) {
    data.extraChildPrice = toNumber(body.extraChildPrice === "" ? 0 : body.extraChildPrice, "Extra child price");
  }

  if (body.mealPlans !== undefined) data.mealPlans = cleanMealPlans(body.mealPlans);

  if (body.amenities !== undefined) data.amenities = cleanAmenities(body.amenities);

  if (body.images !== undefined) data.images = cleanImages(body.images);

  // isActive aur status hamesha sync rahenge
  if (body.isActive !== undefined) {
    data.isActive = Boolean(body.isActive);
    data.status = data.isActive ? "ACTIVE" : "INACTIVE";
  } else if (body.status !== undefined) {
    if (!["ACTIVE", "INACTIVE"].includes(body.status)) fail("Status must be ACTIVE or INACTIVE.");
    data.status = body.status;
    data.isActive = body.status === "ACTIVE";
  }

  return data;
};

const checkCapacity = ({ maxAdults, maxChildren, maxGuests }) => {
  if (maxGuests > maxAdults + maxChildren) {
    fail("Max guests cannot be more than max adults + max children.");
  }
};

const handleError = (res, error, label) => {
  if (error instanceof ValidationFailure) {
    return res.status(400).json({ success: false, message: error.message });
  }

  console.error(`${label}:`, error);

  // Unique index (resort + name)
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "This room category already exists in this resort.",
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(error.errors).map((e) => e.message).join(", "),
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid value or id provided." });
  }

  return res.status(500).json({
    success: false,
    message: error.message || "Something went wrong.",
  });
};


/* ==========================================================
                CREATE ROOM CATEGORY
========================================================== */

exports.createRoom = async (req, res) => {
  try {
    const { resortId } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!resortId || !isValidId(resortId)) {
      return res.status(400).json({
        success: false,
        message: "A valid resortId is required.",
      });
    }

    if (!req.body.name || !String(req.body.name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Room name is required.",
      });
    }

    if (req.body.basePrice === undefined || req.body.basePrice === "") {
      return res.status(400).json({
        success: false,
        message: "Base price is required.",
      });
    }

    const data = sanitizeRoomFields(req.body);

    checkCapacity({
      maxAdults: data.maxAdults ?? 2,
      maxChildren: data.maxChildren ?? 0,
      maxGuests: data.maxGuests ?? 2,
    });


    // ==========================================
    // CHECK RESORT OWNERSHIP
    // ==========================================

    const resort = await Resort.findOne({
      _id: resortId,
      vendor: req.vendor._id,
    });

    if (!resort) {
      return res.status(404).json({
        success: false,
        message: "Resort not found or access denied.",
      });
    }


    // ==========================================
    // DUPLICATE ROOM NAME (case-insensitive)
    // ==========================================

    const existingRoom = await ResortRoom.findOne({
      resort: resortId,
      name: data.name,
    }).collation(CI);

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "This room category already exists in this resort.",
      });
    }


    // ==========================================
    // CREATE ROOM
    // ==========================================

    const room = await ResortRoom.create({
      ...data,
      resort: resortId,
      vendor: req.vendor._id,
    });


    return res.status(201).json({
      success: true,
      message: "Room category created successfully.",
      room,
    });

  } catch (error) {
    return handleError(res, error, "Create Room Error");
  }
};


/* ==========================================================
                GET ROOMS OF A RESORT
========================================================== */

exports.getResortRooms = async (req, res) => {
  try {
    const { resortId } = req.params;

    if (!isValidId(resortId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resort id.",
      });
    }

    const resort = await Resort.findOne({
      _id: resortId,
      vendor: req.vendor._id,
    });

    if (!resort) {
      return res.status(404).json({
        success: false,
        message: "Resort not found or access denied.",
      });
    }

    const rooms = await ResortRoom.find({
      resort: resortId,
      vendor: req.vendor._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: rooms.length,
      rooms,
    });

  } catch (error) {
    return handleError(res, error, "Get Resort Rooms Error");
  }
};


/* ==========================================================
                GET SINGLE ROOM CATEGORY
========================================================== */

exports.getSingleRoom = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room id.",
      });
    }

    const room = await ResortRoom.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room category not found or access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });

  } catch (error) {
    return handleError(res, error, "Get Single Room Error");
  }
};


/* ==========================================================
                UPDATE ROOM CATEGORY
========================================================== */

exports.updateRoom = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room id.",
      });
    }

    const room = await ResortRoom.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room category not found or access denied.",
      });
    }

    const data = sanitizeRoomFields(req.body);

    checkCapacity({
      maxAdults: data.maxAdults ?? room.maxAdults,
      maxChildren: data.maxChildren ?? room.maxChildren,
      maxGuests: data.maxGuests ?? room.maxGuests,
    });

    // Name change hui hai to duplicate check
    if (data.name && data.name.toLowerCase() !== room.name.toLowerCase()) {
      const duplicate = await ResortRoom.findOne({
        resort: room.resort,
        name: data.name,
        _id: { $ne: room._id },
      }).collation(CI);

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "This room category already exists in this resort.",
        });
      }
    }

    room.set(data);

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Room category updated successfully.",
      room,
    });

  } catch (error) {
    return handleError(res, error, "Update Room Error");
  }
};


/* ==========================================================
                DELETE ROOM CATEGORY
========================================================== */

exports.deleteRoom = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room id.",
      });
    }

    const room = await ResortRoom.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room category not found or access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Room category deleted successfully.",
    });

  } catch (error) {
    return handleError(res, error, "Delete Room Error");
  }
};