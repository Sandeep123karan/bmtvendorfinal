

// const Hotel = require("../models/Hotel.model");
// const cloudinary = require("../config/cloudinary");

// /* ─────────────────────────────────────────
//    HELPERS
// ───────────────────────────────────────── */
// const parseArr = (val) => {
//   if (!val) return [];
//   if (Array.isArray(val)) return val;
//   try { return JSON.parse(val); } catch { return val.split(",").map((s) => s.trim()); }
// };

// const toBool = (val) => val === "true" || val === true;

// const uploadMany = async (files, folder) => {
//   const urls = [];
//   for (const file of files) {
//     const res = await cloudinary.uploader.upload(file.path, { folder });
//     urls.push(res.secure_url);
//   }
//   return urls; 
// };

// /* ═══════════════════════════════════════════
//    ADD HOTEL
// ═══════════════════════════════════════════ */
// exports.addHotel = async (req, res) => {
//   try {
//     const d = req.body;

//     if (!req.files?.hotelImages?.length) {
//       return res.status(400).json({ message: "At least one hotel image is required" });
//     }

//     // Upload images
//     const hotelImages = await uploadMany(req.files.hotelImages, "hotels/main");
//     const roomImages  = req.files?.roomImages ? await uploadMany(req.files.roomImages, "hotels/rooms")   : [];
//     const videos      = req.files?.videos     ? await uploadMany(req.files.videos,     "hotels/videos")  : [];

//     // Location
//     const location = {
//       type: "Point",
//       coordinates:
//         d.latitude && d.longitude
//           ? [parseFloat(d.longitude), parseFloat(d.latitude)]
//           : [0, 0],
//     };

//     const hotel = await Hotel.create({
//       vendor: req.vendor._id,

//       // Basic
//       hotelName:   d.hotelName,
//       hotelType:   d.hotelType,
//       description: d.description,
//       starRating:  d.starRating  ? Number(d.starRating)  : undefined,
//       yearBuilt:   d.yearBuilt   ? Number(d.yearBuilt)   : undefined,

//       // Contact
//       phone:          d.phone,
//       alternatePhone: d.alternatePhone,
//       email:          d.email,
//       website:        d.website,

//       // Address
//       country:  d.country || "India",
//       state:    d.state,
//       city:     d.city,
//       area:     d.area,
//       address:  d.address,
//       pincode:  d.pincode,
//       landmark: d.landmark,
//       location,

//       // Facilities
//       amenities:          parseArr(d.amenities),
//       propertyHighlights: parseArr(d.propertyHighlights),
//       foodAndDining:      parseArr(d.foodAndDining),
//       safetyAndSecurity:  parseArr(d.safetyAndSecurity),
//       wellnessAndSpa:     parseArr(d.wellnessAndSpa),
//       businessFacilities: parseArr(d.businessFacilities),
//       mediaAndTechnology: parseArr(d.mediaAndTechnology),
//       transportServices:  parseArr(d.transportServices),
//       paymentMethods:     parseArr(d.paymentMethods),

//       // Media
//       hotelImages,
//       roomImages,
//       videos,
//       virtualTourLink: d.virtualTourLink,

//       // Policies
//       checkInTime:          d.checkInTime,
//       checkOutTime:         d.checkOutTime,
//       earlyCheckInAllowed:  d.earlyCheckInAllowed !== undefined ? toBool(d.earlyCheckInAllowed) : undefined,
//       lateCheckOutAllowed:  d.lateCheckOutAllowed !== undefined ? toBool(d.lateCheckOutAllowed) : undefined,
//       cancellationPolicy:   d.cancellationPolicy,
//       childPolicy:          d.childPolicy,
//       petPolicy:            d.petPolicy,
//       coupleFriendly:       d.coupleFriendly  !== undefined ? toBool(d.coupleFriendly)  : true,
//       localIdAllowed:       d.localIdAllowed  !== undefined ? toBool(d.localIdAllowed)  : true,

//       // Pricing
//       pricePerNight:  d.pricePerNight  ? Number(d.pricePerNight)  : undefined,
//       taxPercentage:  d.taxPercentage  ? Number(d.taxPercentage)  : undefined,
//       serviceCharge:  d.serviceCharge  ? Number(d.serviceCharge)  : undefined,
//       extraBedCharge: d.extraBedCharge ? Number(d.extraBedCharge) : undefined,
//       refundPolicy:   d.refundPolicy,
//       gstNumber:      d.gstNumber,

//       rooms: [],
//     });

//     res.status(201).json({ success: true, message: "Hotel added successfully", hotel });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ═══════════════════════════════════════════
//    GET VENDOR HOTELS
// ═══════════════════════════════════════════ */
// exports.getHotels = async (req, res) => {
//   try {
//     const hotels = await Hotel.find({ vendor: req.vendor._id }).sort({ createdAt: -1 });
//     res.json(hotels);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ═══════════════════════════════════════════
//    GET SINGLE HOTEL
// ═══════════════════════════════════════════ */
// exports.getSingleHotel = async (req, res) => {
//   try {
//     const hotel = await Hotel.findOne({ _id: req.params.id, vendor: req.vendor._id });
//     if (!hotel) return res.status(404).json({ message: "Hotel not found" });
//     res.json(hotel);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ═══════════════════════════════════════════
//    UPDATE HOTEL
// ═══════════════════════════════════════════ */
// exports.updateHotel = async (req, res) => {
//   try {
//     const d = req.body;

//     const updateData = {
//       // Basic
//       hotelName:   d.hotelName,
//       hotelType:   d.hotelType,
//       description: d.description,
//       starRating:  d.starRating  ? Number(d.starRating)  : undefined,
//       yearBuilt:   d.yearBuilt   ? Number(d.yearBuilt)   : undefined,

//       // Contact
//       phone:          d.phone,
//       alternatePhone: d.alternatePhone,
//       email:          d.email,
//       website:        d.website,

//       // Address
//       country:  d.country,
//       state:    d.state,
//       city:     d.city,
//       area:     d.area,
//       address:  d.address,
//       pincode:  d.pincode,
//       landmark: d.landmark,

//       // Facilities
//       amenities:          parseArr(d.amenities),
//       propertyHighlights: parseArr(d.propertyHighlights),
//       foodAndDining:      parseArr(d.foodAndDining),
//       safetyAndSecurity:  parseArr(d.safetyAndSecurity),
//       wellnessAndSpa:     parseArr(d.wellnessAndSpa),
//       businessFacilities: parseArr(d.businessFacilities),
//       mediaAndTechnology: parseArr(d.mediaAndTechnology),
//       transportServices:  parseArr(d.transportServices),
//       paymentMethods:     parseArr(d.paymentMethods),

//       // Media
//       virtualTourLink: d.virtualTourLink,

//       // Policies
//       checkInTime:         d.checkInTime,
//       checkOutTime:        d.checkOutTime,
//       earlyCheckInAllowed: d.earlyCheckInAllowed !== undefined ? toBool(d.earlyCheckInAllowed) : undefined,
//       lateCheckOutAllowed: d.lateCheckOutAllowed !== undefined ? toBool(d.lateCheckOutAllowed) : undefined,
//       cancellationPolicy:  d.cancellationPolicy,
//       childPolicy:         d.childPolicy,
//       petPolicy:           d.petPolicy,
//       coupleFriendly:      d.coupleFriendly  !== undefined ? toBool(d.coupleFriendly)  : undefined,
//       localIdAllowed:      d.localIdAllowed  !== undefined ? toBool(d.localIdAllowed)  : undefined,

//       // Pricing
//       pricePerNight:  d.pricePerNight  ? Number(d.pricePerNight)  : undefined,
//       taxPercentage:  d.taxPercentage  ? Number(d.taxPercentage)  : undefined,
//       serviceCharge:  d.serviceCharge  ? Number(d.serviceCharge)  : undefined,
//       extraBedCharge: d.extraBedCharge ? Number(d.extraBedCharge) : undefined,
//       refundPolicy:   d.refundPolicy,
//       gstNumber:      d.gstNumber,
//     };

//     // Location
//     if (d.latitude && d.longitude) {
//       updateData.location = {
//         type: "Point",
//         coordinates: [parseFloat(d.longitude), parseFloat(d.latitude)],
//       };
//     }

//     // Append new images
//     if (req.files?.hotelImages?.length) {
//       const urls = await uploadMany(req.files.hotelImages, "hotels/main");
//       updateData.$push = { ...(updateData.$push || {}), hotelImages: { $each: urls } };
//     }
//     if (req.files?.roomImages?.length) {
//       const urls = await uploadMany(req.files.roomImages, "hotels/rooms");
//       updateData.$push = { ...(updateData.$push || {}), roomImages: { $each: urls } };
//     }
//     if (req.files?.videos?.length) {
//       const urls = await uploadMany(req.files.videos, "hotels/videos");
//       updateData.$push = { ...(updateData.$push || {}), videos: { $each: urls } };
//     }

//     // Remove undefined keys (don't overwrite existing data with undefined)
//     Object.keys(updateData).forEach(
//       (k) => updateData[k] === undefined && delete updateData[k]
//     );

//     const hotel = await Hotel.findOneAndUpdate(
//       { _id: req.params.id, vendor: req.vendor._id },
//       updateData,
//       { new: true }
//     );

//     if (!hotel) return res.status(404).json({ message: "Hotel not found" });
//     res.json({ success: true, hotel });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ═══════════════════════════════════════════
//    DELETE HOTEL
// ═══════════════════════════════════════════ */
// exports.deleteHotel = async (req, res) => {
//   try {
//     await Hotel.findOneAndDelete({ _id: req.params.id, vendor: req.vendor._id });
//     res.json({ success: true, message: "Hotel deleted" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ═══════════════════════════════════════════
//    ADD ROOM
// ═══════════════════════════════════════════ */
// exports.addRoom = async (req, res) => {
//   try {
//     const d = req.body;

//     // Upload room images
//     let images = [];
//     if (req.files?.roomGallery?.length) {
//       if (req.files.roomGallery.length > 10) {
//         return res.status(400).json({ message: "Maximum 10 images per room" });
//       }
//       images = await uploadMany(req.files.roomGallery, "hotels/room-gallery");
//     }

//     const roomData = {
//       // Basic
//       roomType:    d.roomType,
//       roomName:    d.roomName,
//       description: d.description,
//       floorNumber: d.floorNumber,
//       roomSize:    d.roomSize,
//       viewType:    d.viewType,
//       status:      d.status || "available",

//       // Pricing
//       basePrice:     Number(d.basePrice),
//       offerPrice:    d.offerPrice    ? Number(d.offerPrice)    : undefined,
//       tax:           d.tax           ? Number(d.tax)           : undefined,
//       serviceCharge: d.serviceCharge ? Number(d.serviceCharge) : undefined,

//       // Capacity
//       totalRooms:     Number(d.totalRooms),
//       availableRooms: Number(d.availableRooms),
//       maxGuests:      d.maxGuests  ? Number(d.maxGuests)  : undefined,
//       adults:         d.adults     ? Number(d.adults)     : undefined,
//       children:       d.children   ? Number(d.children)   : undefined,

//       // Bed
//       bedType:           d.bedType,
//       bedCount:          d.bedCount ? Number(d.bedCount) : undefined,
//       extraBedAvailable: toBool(d.extraBedAvailable),
//       extraBedCharge:    d.extraBedCharge ? Number(d.extraBedCharge) : undefined,

//       // Room Features
//       balcony:      toBool(d.balcony),
//       airCondition: toBool(d.airCondition),
//       heater:       toBool(d.heater),
//       wifi:         toBool(d.wifi),
//       tv:           toBool(d.tv),
//       minibar:      toBool(d.minibar),
//       wardrobe:     toBool(d.wardrobe),
//       workDesk:     toBool(d.workDesk),
//       iron:         toBool(d.iron),
//       kitchen:      toBool(d.kitchen),

//       // Bathroom
//       bathroomType: d.bathroomType,
//       bathtub:      toBool(d.bathtub),
//       shower:       toBool(d.shower),
//       toiletries:   toBool(d.toiletries),
//       hairDryer:    toBool(d.hairDryer),

//       // Meals
//       breakfastIncluded: toBool(d.breakfastIncluded),
//       lunchIncluded:     toBool(d.lunchIncluded),
//       dinnerIncluded:    toBool(d.dinnerIncluded),

//       // Policies
//       smokingAllowed:     toBool(d.smokingAllowed),
//       refundable:         toBool(d.refundable),
//       cancellationPolicy: d.cancellationPolicy,

//       images,
//     };

//     const hotel = await Hotel.findOneAndUpdate(
//       { _id: req.params.hotelId, vendor: req.vendor._id },
//       { $push: { rooms: roomData } },
//       { new: true }
//     );

//     if (!hotel) return res.status(404).json({ message: "Hotel not found" });
//     res.json({ success: true, hotel });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ═══════════════════════════════════════════
//    UPDATE ROOM
// ═══════════════════════════════════════════ */
// exports.updateRoom = async (req, res) => {
//   try {
//     const d = req.body;

//     const hotel = await Hotel.findOne({ _id: req.params.hotelId, vendor: req.vendor._id });
//     if (!hotel) return res.status(404).json({ message: "Hotel not found" });

//     const room = hotel.rooms.id(req.params.roomId);
//     if (!room) return res.status(404).json({ message: "Room not found" });

//     // Append new images
//     if (req.files?.roomGallery?.length) {
//       const newImgs = await uploadMany(req.files.roomGallery, "hotels/room-gallery");
//       room.images.push(...newImgs);
//     }

//     // String fields
//     ["roomType","roomName","description","floorNumber","roomSize","viewType",
//      "bedType","bathroomType","cancellationPolicy","status"].forEach((f) => {
//       if (d[f] !== undefined) room[f] = d[f];
//     });

//     // Number fields
//     ["basePrice","offerPrice","tax","serviceCharge","totalRooms","availableRooms",
//      "maxGuests","adults","children","bedCount","extraBedCharge"].forEach((f) => {
//       if (d[f] !== undefined && d[f] !== "") room[f] = Number(d[f]);
//     });

//     // Boolean fields
//     ["extraBedAvailable","balcony","airCondition","heater","wifi","tv","minibar",
//      "wardrobe","workDesk","iron","kitchen","bathtub","shower","toiletries",
//      "hairDryer","breakfastIncluded","lunchIncluded","dinnerIncluded",
//      "smokingAllowed","refundable"].forEach((f) => {
//       if (d[f] !== undefined) room[f] = toBool(d[f]);
//     });

//     await hotel.save();
//     res.json({ success: true, hotel });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ═══════════════════════════════════════════
//    DELETE ROOM
// ═══════════════════════════════════════════ */
// exports.deleteRoom = async (req, res) => {
//   try {
//     const hotel = await Hotel.findOneAndUpdate(
//       { _id: req.params.hotelId, vendor: req.vendor._id },
//       { $pull: { rooms: { _id: req.params.roomId } } },
//       { new: true }
//     );
//     if (!hotel) return res.status(404).json({ message: "Hotel not found" });
//     res.json({ success: true, hotel });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ═══════════════════════════════════════════
//    DELETE ROOM IMAGE
// ═══════════════════════════════════════════ */
// exports.deleteRoomImage = async (req, res) => {
//   try {
//     const { hotelId, roomId } = req.params;
//     const { imageUrl } = req.body;

//     const hotel = await Hotel.findOne({ _id: hotelId, vendor: req.vendor._id });
//     if (!hotel) return res.status(404).json({ message: "Hotel not found" });

//     const room = hotel.rooms.id(roomId);
//     if (!room) return res.status(404).json({ message: "Room not found" });

//     room.images = room.images.filter((img) => img !== imageUrl);
//     await hotel.save();

//     res.json({ success: true, hotel });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ═══════════════════════════════════════════
//    DELETE HOTEL IMAGE
// ═══════════════════════════════════════════ */
// exports.deleteHotelImage = async (req, res) => {
//   try {
//     const { imageUrl } = req.body;

//     const hotel = await Hotel.findOneAndUpdate(
//       { _id: req.params.id, vendor: req.vendor._id },
//       { $pull: { hotelImages: imageUrl } },
//       { new: true }
//     );
//     if (!hotel) return res.status(404).json({ message: "Hotel not found" });
//     res.json({ success: true, hotel });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


const Hotel = require("../models/Hotel.model");
const cloudinary = require("../config/cloudinary");

/* =========================================================
   HELPERS
========================================================= */

// Convert comma separated / JSON string into array
const parseArr = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return [parsed];
  } catch (error) {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};


// Convert multipart/form-data boolean values
const toBool = (value) => {
  if (value === true || value === "true" || value === "1") {
    return true;
  }

  return false;
};


// Safe number conversion
const toNumber = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  const number = Number(value);

  return Number.isNaN(number)
    ? undefined
    : number;
};


/* =========================================================
   CLOUDINARY UPLOAD
   IMPORTANT:
   This works with multer.memoryStorage()
========================================================= */

const fs = require("fs");
const path = require("path");


/* =========================================================
   CLOUDINARY FILE UPLOAD
   Supports BOTH:
   1. multer.memoryStorage()  -> file.buffer
   2. multer.diskStorage()    -> file.path
========================================================= */

const uploadFile = (file, folder) => {

  return new Promise((resolve, reject) => {

    if (!file) {
      return reject(
        new Error("No file received")
      );
    }


    console.log("📁 Uploading file:", {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer,
      path: file.path || null,
    });


    const stream =
      cloudinary.uploader.upload_stream(
        {
          folder,

          // Image + video dono support
          resource_type: "auto",
        },

        (error, result) => {

          if (error) {

            console.error(
              "❌ Cloudinary Upload Error:",
              error
            );

            return reject(error);
          }


          if (
            !result ||
            !result.secure_url
          ) {

            return reject(
              new Error(
                "Cloudinary upload failed"
              )
            );

          }


          console.log(
            "✅ Cloudinary uploaded:",
            result.secure_url
          );


          resolve(result);
        }
      );


    /* =====================================================
       OPTION 1: MEMORY STORAGE
    ===================================================== */

    if (file.buffer) {

      stream.end(
        file.buffer
      );

      return;
    }


    /* =====================================================
       OPTION 2: DISK STORAGE
    ===================================================== */

    if (file.path) {

      const fileStream =
        fs.createReadStream(
          path.resolve(file.path)
        );


      fileStream.on(
        "error",
        (error) => {

          console.error(
            "❌ File Read Error:",
            error
          );

          reject(error);

        }
      );


      fileStream.pipe(stream);

      return;
    }


    /* =====================================================
       NO BUFFER + NO PATH
    ===================================================== */

    reject(
      new Error(
        "Uploaded file has neither buffer nor path"
      )
    );

  });

};



/* =========================================================
   UPLOAD MULTIPLE FILES
========================================================= */

const uploadMany = async (
  files = [],
  folder
) => {

  if (
    !Array.isArray(files) ||
    files.length === 0
  ) {

    return [];

  }


  const uploadedUrls = [];


  for (
    const file of files
  ) {

    const result =
      await uploadFile(
        file,
        folder
      );


    uploadedUrls.push(
      result.secure_url  
    );

  }


  return uploadedUrls;

};


/* =========================================================
   ADD HOTEL
   POST /api/vendor/hotels
========================================================= */

exports.addHotel = async (req, res) => {

  try {

    console.log("\n=================================");
    console.log("🏨 ADD HOTEL REQUEST");
    console.log("=================================");

    console.log("Vendor ID:", req.vendor?._id);
    console.log("Body:", req.body);

    console.log(
      "Hotel Images:",
      req.files?.hotelImages?.length || 0
    );

    console.log(
      "Room Images:",
      req.files?.roomImages?.length || 0
    );

    console.log(
      "Videos:",
      req.files?.videos?.length || 0
    );


    /* =====================================================
       AUTH CHECK
    ===================================================== */

    if (!req.vendor || !req.vendor._id) {

      return res.status(401).json({
        success: false,
        message: "Vendor authentication failed",
      });

    }


    /* =====================================================
       HOTEL IMAGE VALIDATION
    ===================================================== */

    if (
      !req.files ||
      !req.files.hotelImages ||
      req.files.hotelImages.length === 0
    ) {

      return res.status(400).json({
        success: false,
        message: "At least one hotel image is required",
      });

    }


    const d = req.body;


    /* =====================================================
       CLOUDINARY UPLOAD
    ===================================================== */

    const hotelImages = await uploadMany(
      req.files.hotelImages,
      "hotels/main"
    );


    const roomImages = await uploadMany(
      req.files.roomImages || [],
      "hotels/rooms"
    );


    const videos = await uploadMany(
      req.files.videos || [],
      "hotels/videos"
    );


    /* =====================================================
       LOCATION
    ===================================================== */

    const latitude = toNumber(
      d.latitude
    );

    const longitude = toNumber(
      d.longitude
    );


    const location = {
      type: "Point",

      coordinates: [
        longitude !== undefined
          ? longitude
          : 0,

        latitude !== undefined
          ? latitude
          : 0,
      ],
    };


    /* =====================================================
       CREATE HOTEL
    ===================================================== */

    const hotel = await Hotel.create({

      /* ================= BASIC ================= */

      vendor: req.vendor._id,

      hotelName: d.hotelName,

      hotelType: d.hotelType,

      description: d.description,

      starRating: toNumber(
        d.starRating
      ),

      yearBuilt: toNumber(
        d.yearBuilt
      ),


      /* ================= CONTACT ================= */

      phone: d.phone,

      alternatePhone: d.alternatePhone,

      email: d.email,

      website: d.website,


      /* ================= ADDRESS ================= */

      country:
        d.country || "India",

      state: d.state,

      city: d.city,

      area: d.area,

      address: d.address,

      pincode: d.pincode,

      landmark: d.landmark,


      /* ================= LOCATION ================= */

      location,


      /* ================= FACILITIES ================= */

      amenities:
        parseArr(d.amenities),

      propertyHighlights:
        parseArr(d.propertyHighlights),

      foodAndDining:
        parseArr(d.foodAndDining),

      safetyAndSecurity:
        parseArr(d.safetyAndSecurity),

      wellnessAndSpa:
        parseArr(d.wellnessAndSpa),

      businessFacilities:
        parseArr(d.businessFacilities),

      mediaAndTechnology:
        parseArr(d.mediaAndTechnology),

      transportServices:
        parseArr(d.transportServices),


      /* ================= MEDIA ================= */

      hotelImages,

      roomImages,

      videos,

      virtualTourLink:
        d.virtualTourLink,


      /* ================= POLICIES ================= */

      checkInTime:
        d.checkInTime,

      checkOutTime:
        d.checkOutTime,

      earlyCheckInAllowed:
        d.earlyCheckInAllowed !== undefined
          ? toBool(d.earlyCheckInAllowed)
          : false,

      lateCheckOutAllowed:
        d.lateCheckOutAllowed !== undefined
          ? toBool(d.lateCheckOutAllowed)
          : false,

      cancellationPolicy:
        d.cancellationPolicy,

      childPolicy:
        d.childPolicy,

      petPolicy:
        d.petPolicy,

      coupleFriendly:
        d.coupleFriendly !== undefined
          ? toBool(d.coupleFriendly)
          : true,

      localIdAllowed:
        d.localIdAllowed !== undefined
          ? toBool(d.localIdAllowed)
          : true,


      /* ================= PRICING ================= */

      pricePerNight:
        toNumber(d.pricePerNight),

      taxPercentage:
        toNumber(d.taxPercentage),

      serviceCharge:
        toNumber(d.serviceCharge),

      extraBedCharge:
        toNumber(d.extraBedCharge),

      paymentMethods:
        parseArr(d.paymentMethods),

      refundPolicy:
        d.refundPolicy,

      gstNumber:
        d.gstNumber,


      /* ================= DEFAULTS ================= */

      rooms: [],

      averageRating: 0,

      totalReviews: 0,

      status: "pending",

      featured: false,

      isActive: true,
    });


    /* =====================================================
       SUCCESS
    ===================================================== */

    console.log(
      "✅ HOTEL CREATED:",
      hotel._id
    );


    return res.status(201).json({

      success: true,

      message:
        "Hotel added successfully",

      hotel,
    });

  } catch (error) {

    console.error(
      "\n🔥 ADD HOTEL ERROR"
    );

    console.error(error);

    console.error(error.stack);


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Internal Server Error",

      error:
        process.env.NODE_ENV === "development"
          ? error.stack
          : undefined,
    });

  }

};


/* =========================================================
   GET VENDOR HOTELS
   GET /api/vendor/hotels
========================================================= */

exports.getHotels = async (req, res) => {

  try {

    if (!req.vendor?._id) {

      return res.status(401).json({
        success: false,
        message: "Vendor authentication failed",
      });

    }


    const hotels = await Hotel
      .find({
        vendor: req.vendor._id,
      })
      .sort({
        createdAt: -1,
      });


    return res.status(200).json({

      success: true,

      count: hotels.length,

      hotels,
    });

  } catch (error) {

    console.error(
      "🔥 GET HOTELS ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to fetch hotels",
    });

  }

};


/* =========================================================
   GET SINGLE HOTEL
   GET /api/vendor/hotels/:id
========================================================= */

exports.getSingleHotel = async (req, res) => {

  try {

    const hotel =
      await Hotel.findOne({
        _id: req.params.id,
        vendor: req.vendor._id,
      });


    if (!hotel) {

      return res.status(404).json({

        success: false,

        message:
          "Hotel not found",
      });

    }


    return res.status(200).json({

      success: true,

      hotel,
    });

  } catch (error) {

    console.error(
      "🔥 GET SINGLE HOTEL ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to fetch hotel",
    });

  }

};


/* =========================================================
   UPDATE HOTEL
   PUT /api/vendor/hotels/:id
========================================================= */

exports.updateHotel = async (req, res) => {

  try {

    const hotel =
      await Hotel.findOne({
        _id: req.params.id,
        vendor: req.vendor._id,
      });


    if (!hotel) {

      return res.status(404).json({

        success: false,

        message:
          "Hotel not found",
      });

    }


    const d = req.body;


    /* =====================================================
       BASIC
    ===================================================== */

    if (d.hotelName !== undefined)
      hotel.hotelName = d.hotelName;

    if (d.hotelType !== undefined)
      hotel.hotelType = d.hotelType;

    if (d.description !== undefined)
      hotel.description = d.description;

    if (d.starRating !== undefined)
      hotel.starRating =
        toNumber(d.starRating);

    if (d.yearBuilt !== undefined)
      hotel.yearBuilt =
        toNumber(d.yearBuilt);


    /* =====================================================
       CONTACT
    ===================================================== */

    if (d.phone !== undefined)
      hotel.phone = d.phone;

    if (d.alternatePhone !== undefined)
      hotel.alternatePhone =
        d.alternatePhone;

    if (d.email !== undefined)
      hotel.email = d.email;

    if (d.website !== undefined)
      hotel.website = d.website;


    /* =====================================================
       ADDRESS
    ===================================================== */

    if (d.country !== undefined)
      hotel.country = d.country;

    if (d.state !== undefined)
      hotel.state = d.state;

    if (d.city !== undefined)
      hotel.city = d.city;

    if (d.area !== undefined)
      hotel.area = d.area;

    if (d.address !== undefined)
      hotel.address = d.address;

    if (d.pincode !== undefined)
      hotel.pincode = d.pincode;

    if (d.landmark !== undefined)
      hotel.landmark = d.landmark;


    /* =====================================================
       LOCATION
    ===================================================== */

    if (
      d.latitude !== undefined &&
      d.longitude !== undefined
    ) {

      const latitude =
        toNumber(d.latitude);

      const longitude =
        toNumber(d.longitude);


      if (
        latitude !== undefined &&
        longitude !== undefined
      ) {

        hotel.location = {

          type: "Point",

          coordinates: [
            longitude,
            latitude,
          ],
        };

      }

    }


    /* =====================================================
       FACILITIES
    ===================================================== */

    const arrayFields = [
      "amenities",
      "propertyHighlights",
      "foodAndDining",
      "safetyAndSecurity",
      "wellnessAndSpa",
      "businessFacilities",
      "mediaAndTechnology",
      "transportServices",
      "paymentMethods",
    ];


    for (const field of arrayFields) {

      if (d[field] !== undefined) {

        hotel[field] =
          parseArr(d[field]);

      }

    }


    /* =====================================================
       MEDIA
    ===================================================== */

    if (
      d.virtualTourLink !== undefined
    ) {

      hotel.virtualTourLink =
        d.virtualTourLink;

    }


    /* =====================================================
       POLICIES
    ===================================================== */

    if (d.checkInTime !== undefined)
      hotel.checkInTime =
        d.checkInTime;

    if (d.checkOutTime !== undefined)
      hotel.checkOutTime =
        d.checkOutTime;

    if (
      d.earlyCheckInAllowed !== undefined
    ) {

      hotel.earlyCheckInAllowed =
        toBool(
          d.earlyCheckInAllowed
        );

    }

    if (
      d.lateCheckOutAllowed !== undefined
    ) {

      hotel.lateCheckOutAllowed =
        toBool(
          d.lateCheckOutAllowed
        );

    }

    if (
      d.cancellationPolicy !== undefined
    ) {

      hotel.cancellationPolicy =
        d.cancellationPolicy;

    }

    if (d.childPolicy !== undefined)
      hotel.childPolicy =
        d.childPolicy;

    if (d.petPolicy !== undefined)
      hotel.petPolicy =
        d.petPolicy;

    if (d.coupleFriendly !== undefined)
      hotel.coupleFriendly =
        toBool(d.coupleFriendly);

    if (d.localIdAllowed !== undefined)
      hotel.localIdAllowed =
        toBool(d.localIdAllowed);


    /* =====================================================
       PRICING
    ===================================================== */

    if (d.pricePerNight !== undefined)
      hotel.pricePerNight =
        toNumber(d.pricePerNight);

    if (d.taxPercentage !== undefined)
      hotel.taxPercentage =
        toNumber(d.taxPercentage);

    if (d.serviceCharge !== undefined)
      hotel.serviceCharge =
        toNumber(d.serviceCharge);

    if (d.extraBedCharge !== undefined)
      hotel.extraBedCharge =
        toNumber(d.extraBedCharge);

    if (d.refundPolicy !== undefined)
      hotel.refundPolicy =
        d.refundPolicy;

    if (d.gstNumber !== undefined)
      hotel.gstNumber =
        d.gstNumber;


    /* =====================================================
       NEW HOTEL IMAGES
    ===================================================== */

    if (
      req.files?.hotelImages?.length
    ) {

      const newImages =
        await uploadMany(
          req.files.hotelImages,
          "hotels/main"
        );


      hotel.hotelImages.push(
        ...newImages
      );

    }


    /* =====================================================
       NEW ROOM IMAGES
    ===================================================== */

    if (
      req.files?.roomImages?.length
    ) {

      const newImages =
        await uploadMany(
          req.files.roomImages,
          "hotels/rooms"
        );


      hotel.roomImages.push(
        ...newImages
      );

    }


    /* =====================================================
       NEW VIDEOS
    ===================================================== */

    if (
      req.files?.videos?.length
    ) {

      const newVideos =
        await uploadMany(
          req.files.videos,
          "hotels/videos"
        );


      hotel.videos.push(
        ...newVideos
      );

    }


    await hotel.save();


    return res.status(200).json({

      success: true,

      message:
        "Hotel updated successfully",

      hotel,
    });

  } catch (error) {

    console.error(
      "🔥 UPDATE HOTEL ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to update hotel",
    });

  }

};


/* =========================================================
   DELETE HOTEL
   DELETE /api/vendor/hotels/:id
========================================================= */

exports.deleteHotel = async (req, res) => {

  try {

    const hotel =
      await Hotel.findOneAndDelete({

        _id: req.params.id,

        vendor: req.vendor._id,

      });


    if (!hotel) {

      return res.status(404).json({

        success: false,

        message:
          "Hotel not found",
      });

    }


    return res.status(200).json({

      success: true,

      message:
        "Hotel deleted successfully",
    });

  } catch (error) {

    console.error(
      "🔥 DELETE HOTEL ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to delete hotel",
    });

  }

};


/* =========================================================
   DELETE HOTEL IMAGE
   DELETE /api/vendor/hotels/:id/images
========================================================= */

exports.deleteHotelImage = async (req, res) => {

  try {

    const { imageUrl } = req.body;


    if (!imageUrl) {

      return res.status(400).json({

        success: false,

        message:
          "imageUrl is required",
      });

    }


    const hotel =
      await Hotel.findOne({
        _id: req.params.id,
        vendor: req.vendor._id,
      });


    if (!hotel) {

      return res.status(404).json({

        success: false,

        message:
          "Hotel not found",
      });

    }


    hotel.hotelImages =
      hotel.hotelImages.filter(
        (image) => image !== imageUrl
      );


    await hotel.save();


    return res.status(200).json({

      success: true,

      message:
        "Hotel image deleted successfully",

      hotel,
    });

  } catch (error) {

    console.error(
      "🔥 DELETE HOTEL IMAGE ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to delete hotel image",
    });

  }

};


/* =========================================================
   ADD ROOM
   POST /api/vendor/hotels/:hotelId/rooms
========================================================= */

exports.addRoom = async (req, res) => {

  try {

    const hotel =
      await Hotel.findOne({
        _id: req.params.hotelId,
        vendor: req.vendor._id,
      });


    if (!hotel) {

      return res.status(404).json({

        success: false,

        message:
          "Hotel not found",
      });

    }


    const d = req.body;


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!d.roomType) {

      return res.status(400).json({

        success: false,

        message:
          "Room type is required",
      });

    }


    if (
      d.basePrice === undefined ||
      d.basePrice === ""
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Base price is required",
      });

    }


    if (
      d.totalRooms === undefined ||
      d.totalRooms === ""
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Total rooms is required",
      });

    }


    if (
      d.availableRooms === undefined ||
      d.availableRooms === ""
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Available rooms is required",
      });

    }


    /* =====================================================
       ROOM IMAGES
    ===================================================== */

    let images = [];


    if (
      req.files?.roomGallery?.length
    ) {

      if (
        req.files.roomGallery.length > 10
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Maximum 10 images per room",
        });

      }


      images = await uploadMany(
        req.files.roomGallery,
        "hotels/room-gallery"
      );

    }


    /* =====================================================
       ROOM DATA
    ===================================================== */

    const roomData = {

      /* ================= BASIC ================= */

      roomType:
        d.roomType,

      roomName:
        d.roomName,

      description:
        d.description,

      floorNumber:
        d.floorNumber,

      roomSize:
        d.roomSize,

      viewType:
        d.viewType,


      /* ================= PRICING ================= */

      basePrice:
        Number(d.basePrice),

      offerPrice:
        toNumber(d.offerPrice),

      tax:
        toNumber(d.tax),

      serviceCharge:
        toNumber(d.serviceCharge),


      /* ================= CAPACITY ================= */

      totalRooms:
        Number(d.totalRooms),

      availableRooms:
        Number(d.availableRooms),

      maxGuests:
        toNumber(d.maxGuests),

      adults:
        toNumber(d.adults),

      children:
        toNumber(d.children),


      /* ================= BED ================= */

      bedType:
        d.bedType,

      bedCount:
        toNumber(d.bedCount),

      extraBedAvailable:
        toBool(d.extraBedAvailable),

      extraBedCharge:
        toNumber(d.extraBedCharge),


      /* ================= FEATURES ================= */

      balcony:
        toBool(d.balcony),

      airCondition:
        toBool(d.airCondition),

      heater:
        toBool(d.heater),

      wifi:
        toBool(d.wifi),

      tv:
        toBool(d.tv),

      minibar:
        toBool(d.minibar),

      wardrobe:
        toBool(d.wardrobe),

      workDesk:
        toBool(d.workDesk),

      iron:
        toBool(d.iron),

      kitchen:
        toBool(d.kitchen),


      /* ================= BATHROOM ================= */

      bathroomType:
        d.bathroomType,

      bathtub:
        toBool(d.bathtub),

      shower:
        toBool(d.shower),

      toiletries:
        toBool(d.toiletries),

      hairDryer:
        toBool(d.hairDryer),


      /* ================= MEALS ================= */

      breakfastIncluded:
        toBool(d.breakfastIncluded),

      lunchIncluded:
        toBool(d.lunchIncluded),

      dinnerIncluded:
        toBool(d.dinnerIncluded),


      /* ================= POLICIES ================= */

      smokingAllowed:
        toBool(d.smokingAllowed),

      refundable:
        toBool(d.refundable),

      cancellationPolicy:
        d.cancellationPolicy,


      /* ================= MEDIA ================= */

      images,


      /* ================= STATUS ================= */

      status:
        d.status || "available",
    };


    /* =====================================================
       PUSH ROOM
    ===================================================== */

    hotel.rooms.push(
      roomData
    );


    await hotel.save();


    return res.status(201).json({

      success: true,

      message:
        "Room added successfully",

      hotel,
    });

  } catch (error) {

    console.error(
      "🔥 ADD ROOM ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to add room",
    });

  }

};


/* =========================================================
   UPDATE ROOM
   PUT /api/vendor/hotels/:hotelId/rooms/:roomId
========================================================= */

exports.updateRoom = async (req, res) => {

  try {

    const hotel =
      await Hotel.findOne({
        _id: req.params.hotelId,
        vendor: req.vendor._id,
      });


    if (!hotel) {

      return res.status(404).json({

        success: false,

        message:
          "Hotel not found",
      });

    }


    const room =
      hotel.rooms.id(
        req.params.roomId
      );


    if (!room) {

      return res.status(404).json({

        success: false,

        message:
          "Room not found",
      });

    }


    const d = req.body;


    /* =====================================================
       STRING FIELDS
    ===================================================== */

    const stringFields = [

      "roomType",
      "roomName",
      "description",
      "floorNumber",
      "roomSize",
      "viewType",
      "bedType",
      "bathroomType",
      "cancellationPolicy",
      "status",

    ];


    stringFields.forEach((field) => {

      if (d[field] !== undefined) {

        room[field] =
          d[field];

      }

    });


    /* =====================================================
       NUMBER FIELDS
    ===================================================== */

    const numberFields = [

      "basePrice",
      "offerPrice",
      "tax",
      "serviceCharge",

      "totalRooms",
      "availableRooms",
      "maxGuests",
      "adults",
      "children",

      "bedCount",
      "extraBedCharge",

    ];


    numberFields.forEach((field) => {

      if (
        d[field] !== undefined &&
        d[field] !== ""
      ) {

        room[field] =
          Number(d[field]);

      }

    });


    /* =====================================================
       BOOLEAN FIELDS
    ===================================================== */

    const booleanFields = [

      "extraBedAvailable",

      "balcony",
      "airCondition",
      "heater",
      "wifi",
      "tv",
      "minibar",
      "wardrobe",
      "workDesk",
      "iron",
      "kitchen",

      "bathtub",
      "shower",
      "toiletries",
      "hairDryer",

      "breakfastIncluded",
      "lunchIncluded",
      "dinnerIncluded",

      "smokingAllowed",
      "refundable",

    ];


    booleanFields.forEach((field) => {

      if (d[field] !== undefined) {

        room[field] =
          toBool(d[field]);

      }

    });


    /* =====================================================
       NEW ROOM IMAGES
    ===================================================== */

    if (
      req.files?.roomGallery?.length
    ) {

      const newImages =
        await uploadMany(
          req.files.roomGallery,
          "hotels/room-gallery"
        );


      room.images.push(
        ...newImages
      );

    }


    await hotel.save();


    return res.status(200).json({

      success: true,

      message:
        "Room updated successfully",

      hotel,
    });

  } catch (error) {

    console.error(
      "🔥 UPDATE ROOM ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to update room",
    });

  }

};


/* =========================================================
   DELETE ROOM
   DELETE /api/vendor/hotels/:hotelId/rooms/:roomId
========================================================= */

exports.deleteRoom = async (req, res) => {

  try {

    const hotel =
      await Hotel.findOne({
        _id: req.params.hotelId,
        vendor: req.vendor._id,
      });


    if (!hotel) {

      return res.status(404).json({

        success: false,

        message:
          "Hotel not found",
      });

    }


    const room =
      hotel.rooms.id(
        req.params.roomId
      );


    if (!room) {

      return res.status(404).json({

        success: false,

        message:
          "Room not found",
      });

    }


    room.deleteOne();

    await hotel.save();


    return res.status(200).json({

      success: true,

      message:
        "Room deleted successfully",

      hotel,
    });

  } catch (error) {

    console.error(
      "🔥 DELETE ROOM ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to delete room",
    });

  }

};


/* =========================================================
   DELETE ROOM IMAGE
   DELETE /api/vendor/hotels/:hotelId/rooms/:roomId/images
========================================================= */

exports.deleteRoomImage = async (req, res) => {

  try {

    const {
      hotelId,
      roomId,
    } = req.params;


    const {
      imageUrl,
    } = req.body;


    if (!imageUrl) {

      return res.status(400).json({

        success: false,

        message:
          "imageUrl is required",
      });

    }


    const hotel =
      await Hotel.findOne({
        _id: hotelId,
        vendor: req.vendor._id,
      });


    if (!hotel) {

      return res.status(404).json({

        success: false,

        message:
          "Hotel not found",
      });

    }


    const room =
      hotel.rooms.id(roomId);


    if (!room) {

      return res.status(404).json({

        success: false,

        message:
          "Room not found",
      });

    }


    room.images =
      room.images.filter(
        (image) =>
          image !== imageUrl
      );


    await hotel.save();


    return res.status(200).json({

      success: true,

      message:
        "Room image deleted successfully",

      hotel,
    });

  } catch (error) {

    console.error(
      "🔥 DELETE ROOM IMAGE ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to delete room image",
    });

  }

};