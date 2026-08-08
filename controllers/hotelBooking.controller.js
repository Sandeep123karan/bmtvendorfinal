

const Hotel = require("../models/Hotel.model");
const HotelBooking = require("../models/HotelBooking.model");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const generateBookingId = async () => {
  const lastBooking = await HotelBooking.findOne()
    .sort({ createdAt: -1 })
    .select("bookingId");

  if (!lastBooking || !lastBooking.bookingId) {
    return "HB000001";
  }

  const lastNumber = parseInt(
    lastBooking.bookingId.replace("HB", "")
  );

  return `HB${String(lastNumber + 1).padStart(6, "0")}`;
};
exports.bookHotel = async (req, res) => {
  const session = await mongoose.startSession();

  try {

    session.startTransaction();

    const {

      hotelId,

      roomId,

      checkIn,

      checkOut,

      roomsBooked,

      adults,

      children,

      guestName,

      guestPhone,

      guestEmail,

      specialRequest,

      guests,

      paymentMethod,

    } = req.body;

    if (!hotelId)
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });

    if (!roomId)
      return res.status(400).json({
        success: false,
        message: "Room is required",
      });

    if (!checkIn || !checkOut)
      return res.status(400).json({
        success: false,
        message: "Check In & Check Out required",
      });

    const today = new Date();

    today.setHours(0,0,0,0);

    const checkInDate = new Date(checkIn);

    const checkOutDate = new Date(checkOut);

    if(checkInDate < today){

      return res.status(400).json({

        success:false,

        message:"Check In date cannot be past"

      });

    }

    if(checkOutDate <= checkInDate){

      return res.status(400).json({

        success:false,

        message:"Invalid Check Out"

      });

    }

    const totalNights = Math.ceil(

      (checkOutDate-checkInDate)/(1000*60*60*24)

    );

    const hotel = await Hotel.findById(hotelId).session(session);

    if(!hotel){

      return res.status(404).json({

        success:false,

        message:"Hotel not found"

      });

    }

    const room = hotel.rooms.id(roomId);

    if(!room){

      return res.status(404).json({

        success:false,

        message:"Room not found"

      });

    }
        /* ==========================
       Room Availability
    =========================== */

    if (room.status === "soldout") {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: "Room is sold out",
      });
    }

    if (room.availableRooms < Number(roomsBooked || 1)) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: `Only ${room.availableRooms} room(s) available`,
      });
    }

    /* ==========================
       Upload Guest ID Proof
    =========================== */

    let guestList = [];

    if (guests) {
      try {
        guestList =
          typeof guests === "string"
            ? JSON.parse(guests)
            : guests;
      } catch (err) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          success: false,
          message: "Invalid guests data",
        });
      }
    }

    if (
      req.files &&
      req.files.idProofFront &&
      req.files.idProofFront.length
    ) {
      for (let i = 0; i < guestList.length; i++) {
        const front = req.files.idProofFront[i];

        if (front) {
          const upload = await cloudinary.uploader.upload(
            front.path,
            {
              folder: "hotel-booking/id-proof/front",
            }
          );

          guestList[i].idProofFront = upload.secure_url;
        }
      }
    }

    if (
      req.files &&
      req.files.idProofBack &&
      req.files.idProofBack.length
    ) {
      for (let i = 0; i < guestList.length; i++) {
        const back = req.files.idProofBack[i];

        if (back) {
          const upload = await cloudinary.uploader.upload(
            back.path,
            {
              folder: "hotel-booking/id-proof/back",
            }
          );

          guestList[i].idProofBack = upload.secure_url;
        }
      }
    }

    /* ==========================
       Price Calculation
    =========================== */

    const pricePerNight =
      room.offerPrice && room.offerPrice > 0
        ? room.offerPrice
        : room.basePrice;

    const roomPrice =
      pricePerNight *
      totalNights *
      Number(roomsBooked || 1);

    const tax =
      room.tax
        ? (roomPrice * room.tax) / 100
        : 0;

    const serviceCharge =
      room.serviceCharge || 0;

    const discount = 0;

    const totalAmount =
      roomPrice +
      tax +
      serviceCharge -
      discount;

    /* ==========================
       Booking ID
    =========================== */

    const bookingId =
      await generateBookingId();

    /* ==========================
       Reduce Room Inventory
    =========================== */

    room.availableRooms =
      room.availableRooms -
      Number(roomsBooked || 1);
          /* ==========================
       Create Booking
    =========================== */

    const booking = await HotelBooking.create(
      [
        {
          bookingId,

          user: req.user._id,

          vendor: hotel.vendor,

          hotel: hotel._id,

          roomId: room._id,

          hotelName: hotel.hotelName,

          roomName: room.roomName,

          roomType: room.roomType,

          hotelAddress: hotel.address,

          hotelCity: hotel.city,

          hotelState: hotel.state,

          hotelImage:
            hotel.hotelImages &&
            hotel.hotelImages.length
              ? hotel.hotelImages[0]
              : "",

          checkIn: checkInDate,

          checkOut: checkOutDate,

          totalNights,

          roomsBooked: Number(
            roomsBooked || 1
          ),

          adults: Number(adults || 1),

          children: Number(children || 0),

          guestName,

          guestPhone,

          guestEmail,

          specialRequest,

          guests: guestList,

          pricePerNight,

          roomPrice,

          tax,

          serviceCharge,

          discount,

          totalAmount,

          paymentMethod:
            paymentMethod || "ONLINE",

          paymentStatus: "PENDING",

          bookingStatus: "PENDING",
        },
      ],
      { session }
    );

    /* ==========================
       Save Hotel Inventory
    =========================== */

    await hotel.save({ session });

    /* ==========================
       Commit Transaction
    =========================== */

    await session.commitTransaction();

    session.endSession();

    return res.status(201).json({
      success: true,

      message: "Hotel booked successfully.",

      booking: booking[0],
    });
  } catch (error) {
    await session.abortTransaction();

    session.endSession();

    console.error(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
/* ==========================================================
   USER - GET MY BOOKINGS
========================================================== */

exports.getUserHotelBookings = async (req, res) => {
  try {
    const bookings = await HotelBooking.find({
      user: req.user._id,
    })
      .populate({
        path: "hotel",
        select:
          "hotelName hotelImages city state address starRating",
      })
      .populate({
        path: "vendor",
        select: "name shopName phone email",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalBookings: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ==========================================================
   USER - GET SINGLE BOOKING
========================================================== */

exports.getSingleBooking = async (req, res) => {
  try {
    const booking = await HotelBooking.findOne({
      _id: req.params.bookingId,
      user: req.user._id,
    })
      .populate({
        path: "hotel",
        select:
          "hotelName hotelImages city state address phone email",
      })
      .populate({
        path: "vendor",
        select:
          "name shopName phone email",
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};/* ==========================================================
   VENDOR - GET ALL BOOKINGS
========================================================== */

exports.getVendorHotelBookings = async (req, res) => {
  try {

    const bookings = await HotelBooking.find({
      vendor: req.vendor._id,
    })
      .populate({
        path: "user",
        select: "name email phone profileImage",
      })
      .populate({
        path: "hotel",
        select:
          "hotelName hotelImages city state address",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalBookings: bookings.length,
      bookings,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


/* ==========================================================
   VENDOR - CONFIRM BOOKING
========================================================== */

exports.confirmBooking = async (req, res) => {

  try {

    const booking = await HotelBooking.findOne({
      _id: req.params.bookingId,
      vendor: req.vendor._id,
    });

    if (!booking) {

      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });

    }

    if (booking.bookingStatus === "CANCELLED") {

      return res.status(400).json({
        success: false,
        message: "Cancelled booking cannot be confirmed",
      });

    }

    if (booking.bookingStatus === "CONFIRMED") {

      return res.status(400).json({
        success: false,
        message: "Booking already confirmed",
      });

    }

    booking.bookingStatus = "CONFIRMED";

    booking.confirmedAt = new Date();

    await booking.save();

    return res.status(200).json({

      success: true,

      message: "Booking confirmed successfully.",

      booking,

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};