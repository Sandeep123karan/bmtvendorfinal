const mongoose = require("mongoose");

const Hotel = require("../models/Hotel.model");
const HotelRoom = require("../models/HotelRoom.model");
const HotelInventory = require("../models/HotelInventory.model");


const getVendorId = (req) => {
  return (
    req.vendor?._id ||
    req.vendor?.id ||
    req.user?.vendorId ||
    req.user?._id
  );
};


const validId = (id) =>
  mongoose.Types.ObjectId.isValid(id);


/* =========================================================
   CREATE / UPDATE INVENTORY FOR ONE DATE
   PUT /api/hotel-inventory
========================================================= */

exports.upsertInventory = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    const {
      hotelId,
      roomId,
      date,

      totalRooms,
      basePrice,
      offerPrice,
      weekendPrice,
      holidayPrice,

      extraGuestCharge,

      taxPercentage,
      serviceChargePercentage,

      mealPlan,
      breakfastIncluded,
      lunchIncluded,
      dinnerIncluded,

      minimumStay,
      maximumStay,

      instantBooking,

      refundable,
      freeCancellation,
      cancellationDeadlineHours,
      cancellationPolicy,

      stopSell,
      stopSellReason,
    } = req.body;


    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }


    if (!hotelId || !roomId || !date) {
      return res.status(400).json({
        success: false,
        message:
          "hotelId, roomId and date are required.",
      });
    }


    if (
      !validId(hotelId) ||
      !validId(roomId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel or room ID.",
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


    const room = await HotelRoom.findOne({
      _id: roomId,
      hotel: hotelId,
      vendor: vendorId,
    });


    if (!room) {
      return res.status(404).json({
        success: false,
        message:
          "Room not found or unauthorized.",
      });
    }


    const inventoryDate = new Date(date);

    if (isNaN(inventoryDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date.",
      });
    }


    inventoryDate.setHours(0, 0, 0, 0);


    const inventory =
      await HotelInventory.findOneAndUpdate(

        {
          room: roomId,
          date: inventoryDate,
        },

        {
          $set: {
            hotel: hotelId,
            room: roomId,
            vendor: vendorId,

            date: inventoryDate,

            totalRooms:
              totalRooms !== undefined
                ? Number(totalRooms)
                : room.totalRooms,

            basePrice:
              basePrice !== undefined
                ? Number(basePrice)
                : room.basePrice,

            offerPrice:
              offerPrice !== undefined
                ? Number(offerPrice)
                : room.offerPrice,

            weekendPrice:
              weekendPrice !== undefined
                ? Number(weekendPrice)
                : room.weekendPrice,

            holidayPrice:
              holidayPrice !== undefined
                ? Number(holidayPrice)
                : room.holidayPrice,

            extraGuestCharge:
              extraGuestCharge !== undefined
                ? Number(extraGuestCharge)
                : room.extraGuestCharge,

            taxPercentage:
              taxPercentage !== undefined
                ? Number(taxPercentage)
                : room.taxPercentage,

            serviceChargePercentage:
              serviceChargePercentage !== undefined
                ? Number(serviceChargePercentage)
                : room.serviceChargePercentage,

            mealPlan:
              mealPlan || room.mealPlan,

            breakfastIncluded:
              breakfastIncluded !== undefined
                ? Boolean(breakfastIncluded)
                : room.breakfastIncluded,

            lunchIncluded:
              lunchIncluded !== undefined
                ? Boolean(lunchIncluded)
                : room.lunchIncluded,

            dinnerIncluded:
              dinnerIncluded !== undefined
                ? Boolean(dinnerIncluded)
                : room.dinnerIncluded,

            minimumStay:
              minimumStay !== undefined
                ? Number(minimumStay)
                : room.minimumStay,

            maximumStay:
              maximumStay !== undefined
                ? Number(maximumStay)
                : room.maximumStay,

            instantBooking:
              instantBooking !== undefined
                ? Boolean(instantBooking)
                : room.instantBooking,

            refundable:
              refundable !== undefined
                ? Boolean(refundable)
                : room.refundable,

            freeCancellation:
              freeCancellation !== undefined
                ? Boolean(freeCancellation)
                : room.freeCancellation,

            cancellationDeadlineHours:
              cancellationDeadlineHours !== undefined
                ? Number(cancellationDeadlineHours)
                : room.cancellationDeadlineHours,

            cancellationPolicy:
              cancellationPolicy !== undefined
                ? cancellationPolicy
                : room.cancellationPolicy,

            stopSell:
              Boolean(stopSell),

            stopSellReason:
              stopSellReason || "",

            status:
              stopSell
                ? "STOP_SELL"
                : "OPEN",

            isActive: true,

            lastUpdatedBy: vendorId,
          },
        },

        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );


    return res.status(200).json({
      success: true,
      message:
        "Hotel inventory saved successfully.",
      inventory,
    });

  } catch (error) {

    console.error(
      "Inventory Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to save hotel inventory.",
      error: error.message,
    });
  }
};


/* =========================================================
   GET INVENTORY BY DATE RANGE
   GET /api/hotel-inventory/room/:roomId
========================================================= */

exports.getRoomInventory = async (
  req,
  res
) => {
  try {

    const vendorId = getVendorId(req);

    const {
      roomId,
    } = req.params;

    const {
      from,
      to,
    } = req.query;


    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    if (!validId(roomId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid room ID.",
      });
    }


    const query = {
      room: roomId,
      vendor: vendorId,
    };


    if (from || to) {

      query.date = {};

      if (from) {
        query.date.$gte =
          new Date(from);
      }

      if (to) {
        query.date.$lte =
          new Date(to);
      }
    }


    const inventory =
      await HotelInventory.find(query)
        .sort({
          date: 1,
        });


    return res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });

  } catch (error) {

    console.error(
      "Get Inventory Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch inventory.",
      error: error.message,
    });
  }
};


/* =========================================================
   BLOCK / UNBLOCK DATE
   PUT /api/hotel-inventory/:inventoryId/stop-sell
========================================================= */

exports.stopSell = async (
  req,
  res
) => {
  try {

    const vendorId = getVendorId(req);

    const {
      inventoryId,
    } = req.params;

    const {
      stopSell,
      reason,
    } = req.body;


    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    const inventory =
      await HotelInventory.findOneAndUpdate(

        {
          _id: inventoryId,
          vendor: vendorId,
        },

        {
          $set: {
            stopSell:
              Boolean(stopSell),

            stopSellReason:
              reason || "",

            status:
              stopSell
                ? "STOP_SELL"
                : "OPEN",

            lastUpdatedBy:
              vendorId,
          },
        },

        {
          new: true,
          runValidators: true,
        }
      );


    if (!inventory) {
      return res.status(404).json({
        success: false,
        message:
          "Inventory not found.",
      });
    }


    return res.status(200).json({
      success: true,
      message:
        stopSell
          ? "Room stopped for sale."
          : "Room opened for sale.",
      inventory,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Failed to update stop-sell.",
      error: error.message,
    });
  }
};


/* =========================================================
   DELETE INVENTORY
   DELETE /api/hotel-inventory/:inventoryId
========================================================= */

exports.deleteInventory = async (
  req,
  res
) => {
  try {

    const vendorId = getVendorId(req);

    const {
      inventoryId,
    } = req.params;


    const inventory =
      await HotelInventory.findOneAndDelete({
        _id: inventoryId,
        vendor: vendorId,
      });


    if (!inventory) {
      return res.status(404).json({
        success: false,
        message:
          "Inventory not found.",
      });
    }


    return res.status(200).json({
      success: true,
      message:
        "Inventory deleted successfully.",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete inventory.",
      error: error.message,
    });
  }
};