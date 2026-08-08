// controllers/HotelRoom.controller.js

const mongoose = require("mongoose");

const Hotel = require("../models/Hotel.model");
const HotelRoom = require("../models/HotelRoom.model");


/* ============================================================
   HELPERS
============================================================ */

const getVendorId = (req) => {
  return req.vendor?._id || req.vendor?.id || req.user?.vendorId;
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


/* ============================================================
   CREATE HOTEL ROOM
   POST /api/hotel-rooms
============================================================ */

exports.createRoom = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const {
      hotelId,

      roomName,
      roomType,
      description,
      shortDescription,

      floorNumber,
      roomSize,
      roomSizeUnit,
      viewType,

      totalRooms,

      maxGuests,
      maxAdults,
      maxChildren,

      extraGuestAllowed,
      extraGuestCharge,

      bedType,
      bedCount,
      extraBedAvailable,
      extraBedCharge,

      amenities,

      wifi,
      airConditioning,
      heater,
      television,
      smartTv,
      minibar,
      refrigerator,
      wardrobe,
      workDesk,
      sofa,
      balcony,
      terrace,
      kitchen,
      kitchenette,
      washingMachine,
      iron,
      roomService,

      bathroomCount,
      bathroomType,
      bathtub,
      shower,
      hotWater,
      toiletries,
      hairDryer,

      mealPlan,
      breakfastIncluded,
      lunchIncluded,
      dinnerIncluded,
      mealPrice,

      basePrice,
      weekendPrice,
      holidayPrice,
      offerPrice,
      taxPercentage,
      serviceChargePercentage,
      pricingMode,

      refundable,
      freeCancellation,
      cancellationDeadlineHours,
      cancellationPolicy,

      instantBooking,
      bookingConfirmationRequired,

      minimumStay,
      maximumStay,

      coupleFriendly,
      unmarriedCouplesAllowed,
      localIdAllowed,
      childrenAllowed,
      petsAllowed,
      smokingAllowed,
      alcoholAllowed,
      partiesAllowed,
      eventsAllowed,

      houseRules,

      coverImage,
      images,
      videos,

      featured,
      displayOrder,
    } = req.body;


    /* ========================================================
       VALIDATION
    ======================================================== */

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel ID is required.",
      });
    }

    if (!isValidObjectId(hotelId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel ID.",
      });
    }

    if (!roomName || !roomName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Room name is required.",
      });
    }

    if (!roomType) {
      return res.status(400).json({
        success: false,
        message: "Room type is required.",
      });
    }

    if (
      totalRooms === undefined ||
      Number(totalRooms) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Total rooms must be at least 1.",
      });
    }

    if (
      maxGuests === undefined ||
      Number(maxGuests) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Maximum guests must be at least 1.",
      });
    }

    if (
      basePrice === undefined ||
      Number(basePrice) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Base price is required.",
      });
    }


    /* ========================================================
       CHECK HOTEL
    ======================================================== */

    const hotel = await Hotel.findOne({
      _id: hotelId,
      vendor: vendorId,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message:
          "Hotel not found or you are not authorized to manage this hotel.",
      });
    }


    /* ========================================================
       DUPLICATE ROOM NAME CHECK
    ======================================================== */

    const existingRoom = await HotelRoom.findOne({
      hotel: hotelId,
      vendor: vendorId,
      roomName: roomName.trim(),
    });

    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message:
          "A room with this name already exists in this hotel.",
      });
    }


    /* ========================================================
       CREATE ROOM
    ======================================================== */

    const room = new HotelRoom({

      hotel: hotelId,

      vendor: vendorId,


      roomName: roomName.trim(),

      roomType,

      description: description || "",

      shortDescription:
        shortDescription || "",


      floorNumber:
        floorNumber || "",

      roomSize:
        Number(roomSize || 0),

      roomSizeUnit:
        roomSizeUnit || "sqft",

      viewType:
        viewType || "no-view",


      totalRooms:
        Number(totalRooms),

      availableRooms:
        Number(totalRooms),

      bookedRooms: 0,

      blockedRooms: 0,


      maxGuests:
        Number(maxGuests),

      maxAdults:
        Number(maxAdults || 2),

      maxChildren:
        Number(maxChildren || 0),


      extraGuestAllowed:
        Boolean(extraGuestAllowed),

      extraGuestCharge:
        Number(extraGuestCharge || 0),


      bedType:
        bedType || "double",

      bedCount:
        Number(bedCount || 1),

      extraBedAvailable:
        Boolean(extraBedAvailable),

      extraBedCharge:
        Number(extraBedCharge || 0),


      amenities:
        Array.isArray(amenities)
          ? amenities
          : [],


      wifi:
        Boolean(wifi),

      airConditioning:
        Boolean(airConditioning),

      heater:
        Boolean(heater),

      television:
        Boolean(television),

      smartTv:
        Boolean(smartTv),

      minibar:
        Boolean(minibar),

      refrigerator:
        Boolean(refrigerator),

      wardrobe:
        Boolean(wardrobe),

      workDesk:
        Boolean(workDesk),

      sofa:
        Boolean(sofa),

      balcony:
        Boolean(balcony),

      terrace:
        Boolean(terrace),

      kitchen:
        Boolean(kitchen),

      kitchenette:
        Boolean(kitchenette),

      washingMachine:
        Boolean(washingMachine),

      iron:
        Boolean(iron),

      roomService:
        Boolean(roomService),


      bathroomCount:
        Number(bathroomCount || 1),

      bathroomType:
        bathroomType || "private",

      bathtub:
        Boolean(bathtub),

      shower:
        shower !== undefined
          ? Boolean(shower)
          : true,

      hotWater:
        hotWater !== undefined
          ? Boolean(hotWater)
          : true,

      toiletries:
        Boolean(toiletries),

      hairDryer:
        Boolean(hairDryer),


      mealPlan:
        mealPlan || "room-only",

      breakfastIncluded:
        Boolean(breakfastIncluded),

      lunchIncluded:
        Boolean(lunchIncluded),

      dinnerIncluded:
        Boolean(dinnerIncluded),

      mealPrice:
        Number(mealPrice || 0),


      basePrice:
        Number(basePrice),

      weekendPrice:
        Number(weekendPrice || 0),

      holidayPrice:
        Number(holidayPrice || 0),

      offerPrice:
        Number(offerPrice || 0),

      taxPercentage:
        Number(taxPercentage || 0),

      serviceChargePercentage:
        Number(serviceChargePercentage || 0),

      pricingMode:
        pricingMode || "PER_NIGHT",


      refundable:
        refundable !== undefined
          ? Boolean(refundable)
          : true,

      freeCancellation:
        Boolean(freeCancellation),

      cancellationDeadlineHours:
        Number(
          cancellationDeadlineHours || 24
        ),

      cancellationPolicy:
        cancellationPolicy || "",


      instantBooking:
        instantBooking !== undefined
          ? Boolean(instantBooking)
          : true,

      bookingConfirmationRequired:
        Boolean(bookingConfirmationRequired),


      minimumStay:
        Number(minimumStay || 1),

      maximumStay:
        Number(maximumStay || 30),


      coupleFriendly:
        coupleFriendly !== undefined
          ? Boolean(coupleFriendly)
          : true,

      unmarriedCouplesAllowed:
        unmarriedCouplesAllowed !== undefined
          ? Boolean(unmarriedCouplesAllowed)
          : true,

      localIdAllowed:
        localIdAllowed !== undefined
          ? Boolean(localIdAllowed)
          : true,

      childrenAllowed:
        childrenAllowed !== undefined
          ? Boolean(childrenAllowed)
          : true,

      petsAllowed:
        Boolean(petsAllowed),

      smokingAllowed:
        Boolean(smokingAllowed),

      alcoholAllowed:
        Boolean(alcoholAllowed),

      partiesAllowed:
        Boolean(partiesAllowed),

      eventsAllowed:
        Boolean(eventsAllowed),


      houseRules:
        Array.isArray(houseRules)
          ? houseRules
          : [],


      coverImage:
        coverImage || "",

      images:
        Array.isArray(images)
          ? images
          : [],

      videos:
        Array.isArray(videos)
          ? videos
          : [],


      featured:
        Boolean(featured),

      displayOrder:
        Number(displayOrder || 0),

      status: "PENDING",

      isActive: true,
    });


    await room.save();


    return res.status(201).json({
      success: true,
      message: "Hotel room created successfully.",
      room,
    });

  } catch (error) {

    console.error(
      "Create Hotel Room Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create hotel room.",
      error: error.message,
    });
  }
};


/* ============================================================
   GET ALL ROOMS OF HOTEL
   GET /api/hotel-rooms/hotel/:hotelId
============================================================ */

exports.getHotelRooms = async (req, res) => {
  try {

    const vendorId = getVendorId(req);

    const { hotelId } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    if (!isValidObjectId(hotelId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel ID.",
      });
    }


    const hotel = await Hotel.findOne({
      _id: hotelId,
      vendor: vendorId,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message:
          "Hotel not found or unauthorized.",
      });
    }


    const rooms = await HotelRoom.find({
      hotel: hotelId,
      vendor: vendorId,
    })
      .sort({
        displayOrder: 1,
        createdAt: -1,
      });


    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });

  } catch (error) {

    console.error(
      "Get Hotel Rooms Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hotel rooms.",
      error: error.message,
    });
  }
};


/* ============================================================
   GET SINGLE ROOM
   GET /api/hotel-rooms/:roomId
============================================================ */

exports.getRoomById = async (req, res) => {
  try {

    const vendorId = getVendorId(req);

    const { roomId } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    if (!isValidObjectId(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
    }


    const room = await HotelRoom.findOne({
      _id: roomId,
      vendor: vendorId,
    })
      .populate(
        "hotel",
        "hotelName city state starRating status"
      );


    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Hotel room not found.",
      });
    }


    return res.status(200).json({
      success: true,
      room,
    });

  } catch (error) {

    console.error(
      "Get Hotel Room Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hotel room.",
      error: error.message,
    });
  }
};


/* ============================================================
   UPDATE ROOM
   PUT /api/hotel-rooms/:roomId
============================================================ */

exports.updateRoom = async (req, res) => {
  try {

    const vendorId = getVendorId(req);

    const { roomId } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    if (!isValidObjectId(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
    }


    const room = await HotelRoom.findOne({
      _id: roomId,
      vendor: vendorId,
    });


    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Hotel room not found.",
      });
    }


    const allowedFields = [

      "roomName",
      "roomType",
      "description",
      "shortDescription",

      "floorNumber",
      "roomSize",
      "roomSizeUnit",
      "viewType",

      "maxGuests",
      "maxAdults",
      "maxChildren",

      "extraGuestAllowed",
      "extraGuestCharge",

      "bedType",
      "bedCount",
      "extraBedAvailable",
      "extraBedCharge",

      "amenities",

      "wifi",
      "airConditioning",
      "heater",
      "television",
      "smartTv",
      "minibar",
      "refrigerator",
      "wardrobe",
      "workDesk",
      "sofa",
      "balcony",
      "terrace",
      "kitchen",
      "kitchenette",
      "washingMachine",
      "iron",
      "roomService",

      "bathroomCount",
      "bathroomType",
      "bathtub",
      "shower",
      "hotWater",
      "toiletries",
      "hairDryer",

      "mealPlan",
      "breakfastIncluded",
      "lunchIncluded",
      "dinnerIncluded",
      "mealPrice",

      "basePrice",
      "weekendPrice",
      "holidayPrice",
      "offerPrice",
      "taxPercentage",
      "serviceChargePercentage",
      "pricingMode",

      "refundable",
      "freeCancellation",
      "cancellationDeadlineHours",
      "cancellationPolicy",

      "instantBooking",
      "bookingConfirmationRequired",

      "minimumStay",
      "maximumStay",

      "coupleFriendly",
      "unmarriedCouplesAllowed",
      "localIdAllowed",
      "childrenAllowed",
      "petsAllowed",
      "smokingAllowed",
      "alcoholAllowed",
      "partiesAllowed",
      "eventsAllowed",

      "houseRules",

      "coverImage",
      "images",
      "videos",

      "featured",
      "displayOrder",
    ];


    allowedFields.forEach((field) => {

      if (
        req.body[field] !== undefined
      ) {

        room[field] =
          req.body[field];
      }

    });


    /* ========================================================
       TOTAL ROOMS
       Inventory safety
    ======================================================== */

    if (
      req.body.totalRooms !==
      undefined
    ) {

      const newTotal =
        Number(
          req.body.totalRooms
        );

      if (newTotal < 1) {
        return res.status(400).json({
          success: false,
          message:
            "Total rooms must be at least 1.",
        });
      }

      const occupied =
        room.bookedRooms +
        room.blockedRooms;

      if (
        newTotal < occupied
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Total rooms cannot be less than booked + blocked rooms.",
        });
      }

      room.totalRooms =
        newTotal;

      room.availableRooms =
        Math.max(
          newTotal - occupied,
          0
        );
    }


    await room.save();


    return res.status(200).json({
      success: true,
      message:
        "Hotel room updated successfully.",
      room,
    });

  } catch (error) {

    console.error(
      "Update Hotel Room Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update hotel room.",
      error: error.message,
    });
  }
};


/* ============================================================
   DELETE ROOM
   DELETE /api/hotel-rooms/:roomId
============================================================ */

exports.deleteRoom = async (req, res) => {
  try {

    const vendorId = getVendorId(req);

    const { roomId } = req.params;


    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    if (!isValidObjectId(roomId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid room ID.",
      });
    }


    const room =
      await HotelRoom.findOne({
        _id: roomId,
        vendor: vendorId,
      });


    if (!room) {
      return res.status(404).json({
        success: false,
        message:
          "Hotel room not found.",
      });
    }


    /* ========================================================
       PREVENT DELETE IF BOOKED
    ======================================================== */

    if (
      room.bookedRooms > 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Room cannot be deleted while bookings are active.",
      });
    }


    await HotelRoom.deleteOne({
      _id: roomId,
    });


    return res.status(200).json({
      success: true,
      message:
        "Hotel room deleted successfully.",
    });

  } catch (error) {

    console.error(
      "Delete Hotel Room Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete hotel room.",
      error: error.message,
    });
  }
};


/* ============================================================
   UPDATE ROOM STATUS
   PUT /api/hotel-rooms/:roomId/status
============================================================ */

exports.updateRoomStatus = async (
  req,
  res
) => {
  try {

    const vendorId =
      getVendorId(req);

    const { roomId } =
      req.params;

    const { status } =
      req.body;


    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    const allowedStatuses = [
      "DRAFT",
      "PENDING",
      "APPROVED",
      "REJECTED",
      "ACTIVE",
      "INACTIVE",
    ];


    if (
      !allowedStatuses.includes(
        status
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          `Invalid status. Allowed: ${allowedStatuses.join(
            ", "
          )}`,
      });
    }


    const room =
      await HotelRoom.findOneAndUpdate(

        {
          _id: roomId,
          vendor: vendorId,
        },

        {
          status,
          isActive:
            status === "ACTIVE",
        },

        {
          new: true,
          runValidators: true,
        }

      );


    if (!room) {

      return res.status(404).json({
        success: false,
        message:
          "Hotel room not found.",
      });
    }


    return res.status(200).json({

      success: true,

      message:
        "Room status updated successfully.",

      room,

    });

  } catch (error) {

    console.error(
      "Update Room Status Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to update room status.",

      error:
        error.message,

    });
  }
};


/* ============================================================
   UPDATE ROOM INVENTORY
   PUT /api/hotel-rooms/:roomId/inventory
============================================================ */

exports.updateRoomInventory = async (
  req,
  res
) => {
  try {

    const vendorId =
      getVendorId(req);

    const { roomId } =
      req.params;

    const {
      bookedRooms,
      blockedRooms,
    } = req.body;


    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    const room =
      await HotelRoom.findOne({
        _id: roomId,
        vendor: vendorId,
      });


    if (!room) {

      return res.status(404).json({
        success: false,
        message:
          "Hotel room not found.",
      });
    }


    if (
      bookedRooms !==
      undefined
    ) {

      room.bookedRooms =
        Number(bookedRooms);
    }


    if (
      blockedRooms !==
      undefined
    ) {

      room.blockedRooms =
        Number(blockedRooms);
    }


    if (
      room.bookedRooms < 0 ||
      room.blockedRooms < 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Booked and blocked rooms cannot be negative.",
      });
    }


    const occupied =
      room.bookedRooms +
      room.blockedRooms;


    if (
      occupied >
      room.totalRooms
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Booked + blocked rooms cannot exceed total rooms.",
      });
    }


    room.availableRooms =
      room.totalRooms -
      occupied;


    await room.save();


    return res.status(200).json({

      success: true,

      message:
        "Room inventory updated successfully.",

      inventory: {

        totalRooms:
          room.totalRooms,

        bookedRooms:
          room.bookedRooms,

        blockedRooms:
          room.blockedRooms,

        availableRooms:
          room.availableRooms,

      },

      room,

    });

  } catch (error) {

    console.error(
      "Update Room Inventory Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to update room inventory.",

      error:
        error.message,

    });
  }
};


/* ============================================================
   DELETE ROOM IMAGE
   PUT /api/hotel-rooms/:roomId/images/delete
============================================================ */

exports.deleteRoomImage = async (
  req,
  res
) => {
  try {

    const vendorId =
      getVendorId(req);

    const { roomId } =
      req.params;

    const { imageUrl } =
      req.body;


    if (!imageUrl) {

      return res.status(400).json({
        success: false,
        message:
          "Image URL is required.",
      });
    }


    const room =
      await HotelRoom.findOne({
        _id: roomId,
        vendor: vendorId,
      });


    if (!room) {

      return res.status(404).json({
        success: false,
        message:
          "Hotel room not found.",
      });
    }


    room.images =
      room.images.filter(
        (image) =>
          image !== imageUrl
      );


    if (
      room.coverImage ===
      imageUrl
    ) {

      room.coverImage =
        room.images[0] || "";
    }


    await room.save();


    return res.status(200).json({

      success: true,

      message:
        "Room image deleted successfully.",

      room,

    });

  } catch (error) {

    console.error(
      "Delete Room Image Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to delete room image.",

      error:
        error.message,

    });
  }
};