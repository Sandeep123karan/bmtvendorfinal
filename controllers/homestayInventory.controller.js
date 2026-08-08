const mongoose = require("mongoose");

const Homestay = require("../models/Homestay.model");
const HomestayUnit = require("../models/HomestayUnit.model");
const HomestayInventory = require("../models/HomestayInventory.model");


/* ============================================================
   HELPERS
============================================================ */

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


const toNumber = (value, defaultValue = 0) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  const number = Number(value);

  return Number.isNaN(number)
    ? defaultValue
    : number;
};


const toBoolean = (
  value,
  defaultValue = false
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  if (
    value === true ||
    value === "true" ||
    value === "1" ||
    value === 1
  ) {
    return true;
  }

  if (
    value === false ||
    value === "false" ||
    value === "0" ||
    value === 0
  ) {
    return false;
  }

  return defaultValue;
};


/* ============================================================
   DATE HELPERS
============================================================ */

const normalizeDate = (date) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  parsed.setHours(
    0,
    0,
    0,
    0
  );

  return parsed;
};


const getDateKey = (date) => {
  const d = normalizeDate(date);

  if (!d) return null;

  const year = d.getFullYear();

  const month = String(
    d.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    d.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


const getDateRange = (
  startDate,
  endDate
) => {
  const start =
    normalizeDate(startDate);

  const end =
    normalizeDate(endDate);

  if (!start || !end) {
    return [];
  }

  if (start > end) {
    return [];
  }

  const dates = [];

  const current =
    new Date(start);

  while (current <= end) {
    dates.push(
      new Date(current)
    );

    current.setDate(
      current.getDate() + 1
    );
  }

  return dates;
};


/* ============================================================
   DAY TYPE
============================================================ */

const getDayType = (date) => {
  const day =
    normalizeDate(date).getDay();

  /*
    0 = Sunday
    6 = Saturday
  */

  if (
    day === 0 ||
    day === 6
  ) {
    return "weekend";
  }

  return "weekday";
};


/* ============================================================
   FINAL PRICE CALCULATION
============================================================ */

const calculateFinalPrice = ({
  basePrice = 0,
  discountType = "none",
  discountValue = 0,
}) => {
  let price =
    Number(basePrice) || 0;

  const discount =
    Number(discountValue) || 0;

  if (
    discountType ===
    "percentage"
  ) {
    price =
      price -
      (price * discount) / 100;
  }

  if (
    discountType === "flat"
  ) {
    price =
      price - discount;
  }

  return Math.max(
    Math.round(price * 100) / 100,
    0
  );
};


/* ============================================================
   FIND VENDOR UNIT
============================================================ */

const findVendorUnit = async (
  unitId,
  vendorId
) => {
  return HomestayUnit.findOne({
    _id: unitId,
    vendor: vendorId,
  });
};


/* ============================================================
   CHECK HOMESTAY OWNERSHIP
============================================================ */

const findVendorHomestay = async (
  homestayId,
  vendorId
) => {
  return Homestay.findOne({
    _id: homestayId,
    vendor: vendorId,
  });
};


/* ============================================================
   CREATE INVENTORY OBJECT
============================================================ */

const buildInventoryData = ({
  unit,
  homestayId,
  vendorId,
  date,

  basePrice,
  weekendPrice,
  holidayPrice,
  specialPrice,
  extraGuestPrice,

  discountType,
  discountValue,

  taxPercentage,
  serviceChargePercentage,

  minimumStay,
  maximumStay,

  checkInAllowed,
  checkOutAllowed,

  stopSell,
  closedForBooking,

  isBlocked,
  blockReason,

  bookedUnits = 0,
  blockedUnits = 0,

  lastUpdatedBy,
}) => {
  const dayType =
    getDayType(date);


  let selectedPrice =
    toNumber(
      basePrice,
      unit.basePrice || 0
    );


  if (
    dayType === "weekend" &&
    Number(weekendPrice) > 0
  ) {
    selectedPrice =
      Number(weekendPrice);
  }


  if (
    dayType === "holiday" &&
    Number(holidayPrice) > 0
  ) {
    selectedPrice =
      Number(holidayPrice);
  }


  if (
    Number(specialPrice) > 0
  ) {
    selectedPrice =
      Number(specialPrice);
  }


  const finalPrice =
    calculateFinalPrice({
      basePrice:
        selectedPrice,
      discountType:
        discountType || "none",
      discountValue:
        toNumber(
          discountValue,
          0
        ),
    });


  const totalUnits =
    toNumber(
      unit.totalUnits,
      1
    );


  const booked =
    Math.max(
      toNumber(
        bookedUnits,
        0
      ),
      0
    );


  const blocked =
    Math.max(
      toNumber(
        blockedUnits,
        0
      ),
      0
    );


  const available =
    Math.max(
      totalUnits -
        booked -
        blocked,
      0
    );


  const blockedStatus =
    toBoolean(
      isBlocked,
      false
    );


  const stopSellStatus =
    toBoolean(
      stopSell,
      false
    );


  const closedStatus =
    toBoolean(
      closedForBooking,
      false
    );


  return {
    homestay:
      homestayId,

    unit:
      unit._id,

    vendor:
      vendorId,

    date:
      normalizeDate(date),

    totalUnits,

    availableUnits:
      available,

    bookedUnits:
      booked,

    blockedUnits:
      blocked,


    basePrice:
      selectedPrice,

    weekendPrice:
      toNumber(
        weekendPrice,
        unit.weekendPrice || 0
      ),

    holidayPrice:
      toNumber(
        holidayPrice,
        unit.holidayPrice || 0
      ),

    specialPrice:
      toNumber(
        specialPrice,
        0
      ),

    extraGuestPrice:
      toNumber(
        extraGuestPrice,
        unit.extraGuestPrice || 0
      ),


    discountType:
      discountType ||
      "none",

    discountValue:
      toNumber(
        discountValue,
        0
      ),

    finalPrice,


    taxPercentage:
      toNumber(
        taxPercentage,
        unit.taxPercentage || 0
      ),

    taxAmount:
      Math.round(
        (
          finalPrice *
          toNumber(
            taxPercentage,
            unit.taxPercentage || 0
          )
        ) / 100 * 100
      ) / 100,


    serviceChargePercentage:
      toNumber(
        serviceChargePercentage,
        unit.serviceChargePercentage || 0
      ),

    serviceChargeAmount:
      Math.round(
        (
          finalPrice *
          toNumber(
            serviceChargePercentage,
            unit.serviceChargePercentage || 0
          )
        ) / 100 * 100
      ) / 100,


    dayType,


    isAvailable:
      available > 0 &&
      !blockedStatus &&
      !stopSellStatus &&
      !closedStatus,

    isBlocked:
      blockedStatus,

    blockReason:
      blockReason || "",


    minimumStay:
      toNumber(
        minimumStay,
        unit.minimumStay || 1
      ),

    maximumStay:
      toNumber(
        maximumStay,
        unit.maximumStay || 0
      ),


    checkInAllowed:
      toBoolean(
        checkInAllowed,
        true
      ),

    checkOutAllowed:
      toBoolean(
        checkOutAllowed,
        true
      ),


    stopSell:
      stopSellStatus,

    closedForBooking:
      closedStatus,


    lastUpdatedBy:
      lastUpdatedBy,

    lastUpdatedAt:
      new Date(),
  };
};


/* ============================================================
   CREATE / UPDATE SINGLE DATE INVENTORY
============================================================ */

exports.createInventory = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    const {
      homestayId,
      unitId,
      date,

      basePrice,
      weekendPrice,
      holidayPrice,
      specialPrice,
      extraGuestPrice,

      discountType,
      discountValue,

      taxPercentage,
      serviceChargePercentage,

      minimumStay,
      maximumStay,

      checkInAllowed,
      checkOutAllowed,

      stopSell,
      closedForBooking,

      isBlocked,
      blockReason,

      blockedUnits,
    } = req.body;


    /* ========================================================
       VALIDATION
    ======================================================== */

    if (!homestayId) {
      return res.status(400).json({
        success: false,
        message:
          "Homestay ID is required.",
      });
    }


    if (!unitId) {
      return res.status(400).json({
        success: false,
        message:
          "Unit ID is required.",
      });
    }


    if (!date) {
      return res.status(400).json({
        success: false,
        message:
          "Date is required.",
      });
    }


    if (
      !isValidObjectId(
        homestayId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid homestay ID.",
      });
    }


    if (
      !isValidObjectId(
        unitId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid unit ID.",
      });
    }


    const normalizedDate =
      normalizeDate(date);


    if (!normalizedDate) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid date.",
      });
    }


    /* ========================================================
       CHECK HOMESTAY
    ======================================================== */

    const homestay =
      await findVendorHomestay(
        homestayId,
        vendorId
      );


    if (!homestay) {
      return res.status(404).json({
        success: false,
        message:
          "Homestay not found or you don't have access.",
      });
    }


    /* ========================================================
       CHECK UNIT
    ======================================================== */

    const unit =
      await findVendorUnit(
        unitId,
        vendorId
      );


    if (!unit) {
      return res.status(404).json({
        success: false,
        message:
          "Unit not found or you don't have access.",
      });
    }


    if (
      unit.homestay.toString() !==
      homestayId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This unit does not belong to this homestay.",
      });
    }


    /* ========================================================
       CHECK EXISTING INVENTORY
    ======================================================== */

    let inventory =
      await HomestayInventory.findOne({
        unit: unitId,
        date: normalizedDate,
        vendor: vendorId,
      });


    if (inventory) {

      /*
        Existing booked units must NEVER be overwritten
        by vendor update.
      */

      const bookedUnits =
        inventory.bookedUnits;


      const data =
        buildInventoryData({
          unit,

          homestayId,

          vendorId,

          date:
            normalizedDate,

          basePrice,

          weekendPrice,

          holidayPrice,

          specialPrice,

          extraGuestPrice,

          discountType,

          discountValue,

          taxPercentage,

          serviceChargePercentage,

          minimumStay,

          maximumStay,

          checkInAllowed,

          checkOutAllowed,

          stopSell,

          closedForBooking,

          isBlocked,

          blockReason,

          bookedUnits,

          blockedUnits,

          lastUpdatedBy:
            vendorId,
        });


      inventory.set(data);

      inventory.bookedUnits =
        bookedUnits;


      await inventory.save();


      return res.status(200).json({
        success: true,

        message:
          "Inventory updated successfully.",

        inventory,
      });
    }


    /* ========================================================
       CREATE NEW INVENTORY
    ======================================================== */

    inventory =
      await HomestayInventory.create(
        buildInventoryData({
          unit,

          homestayId,

          vendorId,

          date:
            normalizedDate,

          basePrice,

          weekendPrice,

          holidayPrice,

          specialPrice,

          extraGuestPrice,

          discountType,

          discountValue,

          taxPercentage,

          serviceChargePercentage,

          minimumStay,

          maximumStay,

          checkInAllowed,

          checkOutAllowed,

          stopSell,

          closedForBooking,

          isBlocked,

          blockReason,

          bookedUnits: 0,

          blockedUnits,

          lastUpdatedBy:
            vendorId,
        })
      );


    return res.status(201).json({
      success: true,

      message:
        "Inventory created successfully.",

      inventory,
    });

  } catch (error) {
    console.error(
      "Create Inventory Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create inventory.",
      error: error.message,
    });
  }
};


/* ============================================================
   CREATE INVENTORY FOR DATE RANGE
============================================================ */

exports.createInventoryRange = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    const {
      homestayId,
      unitId,

      startDate,
      endDate,

      basePrice,
      weekendPrice,
      holidayPrice,
      specialPrice,
      extraGuestPrice,

      discountType,
      discountValue,

      taxPercentage,
      serviceChargePercentage,

      minimumStay,
      maximumStay,

      stopSell,
      closedForBooking,

      isBlocked,
      blockReason,

      blockedUnits,
    } = req.body;


    if (!homestayId) {
      return res.status(400).json({
        success: false,
        message:
          "Homestay ID is required.",
      });
    }


    if (!unitId) {
      return res.status(400).json({
        success: false,
        message:
          "Unit ID is required.",
      });
    }


    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Start date and end date are required.",
      });
    }


    const dates =
      getDateRange(
        startDate,
        endDate
      );


    if (!dates.length) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid date range.",
      });
    }


    /*
      Safety limit.

      Do not allow accidental creation
      of thousands of records.
    */

    if (dates.length > 366) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum date range allowed is 366 days.",
      });
    }


    /* ========================================================
       OWNERSHIP
    ======================================================== */

    const homestay =
      await findVendorHomestay(
        homestayId,
        vendorId
      );


    if (!homestay) {
      return res.status(404).json({
        success: false,
        message:
          "Homestay not found.",
      });
    }


    const unit =
      await findVendorUnit(
        unitId,
        vendorId
      );


    if (!unit) {
      return res.status(404).json({
        success: false,
        message:
          "Unit not found.",
      });
    }


    if (
      unit.homestay.toString() !==
      homestayId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Unit does not belong to this homestay.",
      });
    }


    /* ========================================================
       UPSERT EACH DATE
    ======================================================== */

    const results = [];


    for (const date of dates) {

      let inventory =
        await HomestayInventory.findOne({
          unit: unitId,
          date,
          vendor: vendorId,
        });


      if (inventory) {

        const bookedUnits =
          inventory.bookedUnits;


        const data =
          buildInventoryData({
            unit,

            homestayId,

            vendorId,

            date,

            basePrice,

            weekendPrice,

            holidayPrice,

            specialPrice,

            extraGuestPrice,

            discountType,

            discountValue,

            taxPercentage,

            serviceChargePercentage,

            minimumStay,

            maximumStay,

            checkInAllowed: true,

            checkOutAllowed: true,

            stopSell,

            closedForBooking,

            isBlocked,

            blockReason,

            bookedUnits,

            blockedUnits,

            lastUpdatedBy:
              vendorId,
          });


        inventory.set(data);

        inventory.bookedUnits =
          bookedUnits;


        await inventory.save();

      } else {

        inventory =
          await HomestayInventory.create(
            buildInventoryData({
              unit,

              homestayId,

              vendorId,

              date,

              basePrice,

              weekendPrice,

              holidayPrice,

              specialPrice,

              extraGuestPrice,

              discountType,

              discountValue,

              taxPercentage,

              serviceChargePercentage,

              minimumStay,

              maximumStay,

              checkInAllowed: true,

              checkOutAllowed: true,

              stopSell,

              closedForBooking,

              isBlocked,

              blockReason,

              bookedUnits: 0,

              blockedUnits,

              lastUpdatedBy:
                vendorId,
            })
          );
      }


      results.push(
        inventory
      );
    }


    return res.status(200).json({
      success: true,

      message:
        `${results.length} inventory records created/updated successfully.`,

      count:
        results.length,

      inventory:
        results,
    });

  } catch (error) {
    console.error(
      "Create Inventory Range Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create inventory range.",
      error: error.message,
    });
  }
};


/* ============================================================
   GET INVENTORY
============================================================ */

exports.getInventory = async (
  req,
  res
) => {
  try {
    const vendorId =
      req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message:
          "Vendor authentication required.",
      });
    }


    const {
      homestayId,
      unitId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;


    const filter = {
      vendor: vendorId,
    };


    /* ========================================================
       FILTERS
    ======================================================== */

    if (homestayId) {

      if (
        !isValidObjectId(
          homestayId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid homestay ID.",
        });
      }

      filter.homestay =
        homestayId;
    }


    if (unitId) {

      if (
        !isValidObjectId(
          unitId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid unit ID.",
        });
      }

      filter.unit =
        unitId;
    }


    /* ========================================================
       DATE FILTER
    ======================================================== */

    if (
      startDate &&
      endDate
    ) {

      const start =
        normalizeDate(
          startDate
        );

      const end =
        normalizeDate(
          endDate
        );


      if (!start || !end) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid date range.",
        });
      }


      end.setHours(
        23,
        59,
        59,
        999
      );


      filter.date = {
        $gte: start,
        $lte: end,
      };

    } else if (startDate) {

      const start =
        normalizeDate(
          startDate
        );

      if (!start) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid start date.",
        });
      }


      filter.date = {
        $gte: start,
      };
    }


    /* ========================================================
       PAGINATION
    ======================================================== */

    const pageNumber =
      Math.max(
        Number(page) || 1,
        1
      );


    const limitNumber =
      Math.min(
        Math.max(
          Number(limit) || 50,
          1
        ),
        200
      );


    const skip =
      (pageNumber - 1) *
      limitNumber;


    const [
      inventory,
      total,
    ] = await Promise.all([
      HomestayInventory.find(
        filter
      )
        .populate(
          "unit",
          "unitName unitType totalUnits basePrice"
        )
        .populate(
          "homestay",
          "propertyName city state"
        )
        .sort({
          date: 1,
        })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      HomestayInventory.countDocuments(
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


/* ============================================================
   GET SINGLE INVENTORY
============================================================ */

exports.getSingleInventory =
  async (
    req,
    res
  ) => {
    try {
      const vendorId =
        req.vendor?._id;


      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required.",
        });
      }


      if (
        !isValidObjectId(
          req.params.inventoryId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid inventory ID.",
        });
      }


      const inventory =
        await HomestayInventory.findOne({
          _id:
            req.params.inventoryId,

          vendor:
            vendorId,
        })
          .populate(
            "unit",
            "unitName unitType totalUnits"
          )
          .populate(
            "homestay",
            "propertyName city state"
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
        inventory,
      });

    } catch (error) {
      console.error(
        "Get Single Inventory Error:",
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


/* ============================================================
   UPDATE INVENTORY
============================================================ */

exports.updateInventory =
  async (
    req,
    res
  ) => {
    try {
      const vendorId =
        req.vendor?._id;


      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required.",
        });
      }


      const inventory =
        await HomestayInventory.findOne({
          _id:
            req.params.inventoryId,

          vendor:
            vendorId,
        });


      if (!inventory) {
        return res.status(404).json({
          success: false,
          message:
            "Inventory not found.",
        });
      }


      const {
        basePrice,
        weekendPrice,
        holidayPrice,
        specialPrice,
        extraGuestPrice,

        discountType,
        discountValue,

        taxPercentage,
        serviceChargePercentage,

        blockedUnits,

        minimumStay,
        maximumStay,

        checkInAllowed,
        checkOutAllowed,

        stopSell,
        closedForBooking,

        isBlocked,
        blockReason,
      } = req.body;


      /* ========================================================
         BOOKED UNITS PROTECTION
      ======================================================== */

      const bookedUnits =
        inventory.bookedUnits;


      /* ========================================================
         UPDATE PRICES
      ======================================================== */

      if (
        basePrice !== undefined
      ) {
        inventory.basePrice =
          toNumber(
            basePrice,
            inventory.basePrice
          );
      }


      if (
        weekendPrice !== undefined
      ) {
        inventory.weekendPrice =
          toNumber(
            weekendPrice,
            inventory.weekendPrice
          );
      }


      if (
        holidayPrice !== undefined
      ) {
        inventory.holidayPrice =
          toNumber(
            holidayPrice,
            inventory.holidayPrice
          );
      }


      if (
        specialPrice !== undefined
      ) {
        inventory.specialPrice =
          toNumber(
            specialPrice,
            inventory.specialPrice
          );
      }


      if (
        extraGuestPrice !==
        undefined
      ) {
        inventory.extraGuestPrice =
          toNumber(
            extraGuestPrice,
            inventory.extraGuestPrice
          );
      }


      /* ========================================================
         DISCOUNT
      ======================================================== */

      if (
        discountType !== undefined
      ) {
        inventory.discountType =
          discountType;
      }


      if (
        discountValue !==
        undefined
      ) {
        inventory.discountValue =
          toNumber(
            discountValue,
            inventory.discountValue
          );
      }


      /* ========================================================
         TAX
      ======================================================== */

      if (
        taxPercentage !==
        undefined
      ) {
        inventory.taxPercentage =
          toNumber(
            taxPercentage,
            inventory.taxPercentage
          );
      }


      if (
        serviceChargePercentage !==
        undefined
      ) {
        inventory.serviceChargePercentage =
          toNumber(
            serviceChargePercentage,
            inventory.serviceChargePercentage
          );
      }


      /* ========================================================
         INVENTORY
      ======================================================== */

      if (
        blockedUnits !==
        undefined
      ) {

        const newBlocked =
          Math.max(
            toNumber(
              blockedUnits,
              inventory.blockedUnits
            ),
            0
          );


        if (
          inventory.totalUnits -
            bookedUnits -
            newBlocked <
          0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Blocked units cannot exceed available inventory.",
          });
        }


        inventory.blockedUnits =
          newBlocked;
      }


      /* ========================================================
         STAY SETTINGS
      ======================================================== */

      if (
        minimumStay !==
        undefined
      ) {
        inventory.minimumStay =
          toNumber(
            minimumStay,
            inventory.minimumStay
          );
      }


      if (
        maximumStay !==
        undefined
      ) {
        inventory.maximumStay =
          toNumber(
            maximumStay,
            inventory.maximumStay
          );
      }


      /* ========================================================
         CHECK-IN / CHECK-OUT
      ======================================================== */

      if (
        checkInAllowed !==
        undefined
      ) {
        inventory.checkInAllowed =
          toBoolean(
            checkInAllowed
          );
      }


      if (
        checkOutAllowed !==
        undefined
      ) {
        inventory.checkOutAllowed =
          toBoolean(
            checkOutAllowed
          );
      }


      /* ========================================================
         BLOCK / STOP SELL
      ======================================================== */

      if (
        stopSell !== undefined
      ) {
        inventory.stopSell =
          toBoolean(
            stopSell
          );
      }


      if (
        closedForBooking !==
        undefined
      ) {
        inventory.closedForBooking =
          toBoolean(
            closedForBooking
          );
      }


      if (
        isBlocked !== undefined
      ) {
        inventory.isBlocked =
          toBoolean(
            isBlocked
          );
      }


      if (
        blockReason !== undefined
      ) {
        inventory.blockReason =
          blockReason;
      }


      /* ========================================================
         RECALCULATE
      ======================================================== */

      inventory.availableUnits =
        Math.max(
          inventory.totalUnits -
            inventory.bookedUnits -
            inventory.blockedUnits,
          0
        );


      inventory.isAvailable =
        inventory.availableUnits >
          0 &&
        !inventory.isBlocked &&
        !inventory.stopSell &&
        !inventory.closedForBooking;


      /* ========================================================
         FINAL PRICE
      ======================================================== */

      inventory.finalPrice =
        calculateFinalPrice({
          basePrice:
            inventory.specialPrice >
            0
              ? inventory.specialPrice
              : inventory.basePrice,

          discountType:
            inventory.discountType,

          discountValue:
            inventory.discountValue,
        });


      inventory.taxAmount =
        Math.round(
          (
            inventory.finalPrice *
            inventory.taxPercentage
          ) /
            100 *
            100
        ) / 100;


      inventory.serviceChargeAmount =
        Math.round(
          (
            inventory.finalPrice *
            inventory.serviceChargePercentage
          ) /
            100 *
            100
        ) / 100;


      inventory.lastUpdatedBy =
        vendorId;

      inventory.lastUpdatedAt =
        new Date();


      await inventory.save();


      return res.status(200).json({
        success: true,

        message:
          "Inventory updated successfully.",

        inventory,
      });

    } catch (error) {
      console.error(
        "Update Inventory Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update inventory.",
        error: error.message,
      });
    }
  };


/* ============================================================
   BLOCK INVENTORY DATE
============================================================ */

exports.blockInventory =
  async (
    req,
    res
  ) => {
    try {
      const vendorId =
        req.vendor?._id;


      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required.",
        });
      }


      const inventory =
        await HomestayInventory.findOne({
          _id:
            req.params.inventoryId,

          vendor:
            vendorId,
        });


      if (!inventory) {
        return res.status(404).json({
          success: false,
          message:
            "Inventory not found.",
        });
      }


      const {
        reason,
        blockedUnits,
      } = req.body;


      inventory.isBlocked =
        true;


      inventory.blockReason =
        reason ||
        "Blocked by vendor";


      if (
        blockedUnits !==
        undefined
      ) {
        const blocked =
          toNumber(
            blockedUnits,
            inventory.totalUnits -
              inventory.bookedUnits
          );


        if (
          inventory.bookedUnits +
            blocked >
          inventory.totalUnits
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Blocked units cannot exceed remaining units.",
          });
        }


        inventory.blockedUnits =
          blocked;
      } else {
        inventory.blockedUnits =
          Math.max(
            inventory.totalUnits -
              inventory.bookedUnits,
            0
          );
      }


      inventory.availableUnits =
        Math.max(
          inventory.totalUnits -
            inventory.bookedUnits -
            inventory.blockedUnits,
          0
        );


      inventory.isAvailable =
        false;


      inventory.lastUpdatedBy =
        vendorId;

      inventory.lastUpdatedAt =
        new Date();


      await inventory.save();


      return res.status(200).json({
        success: true,

        message:
          "Inventory date blocked successfully.",

        inventory,
      });

    } catch (error) {
      console.error(
        "Block Inventory Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to block inventory.",
        error: error.message,
      });
    }
  };


/* ============================================================
   UNBLOCK INVENTORY DATE
============================================================ */

exports.unblockInventory =
  async (
    req,
    res
  ) => {
    try {
      const vendorId =
        req.vendor?._id;


      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required.",
        });
      }


      const inventory =
        await HomestayInventory.findOne({
          _id:
            req.params.inventoryId,

          vendor:
            vendorId,
        });


      if (!inventory) {
        return res.status(404).json({
          success: false,
          message:
            "Inventory not found.",
        });
      }


      inventory.isBlocked =
        false;

      inventory.blockReason =
        "";

      inventory.blockedUnits =
        0;


      inventory.availableUnits =
        Math.max(
          inventory.totalUnits -
            inventory.bookedUnits,
          0
        );


      inventory.isAvailable =
        inventory.availableUnits >
          0 &&
        !inventory.stopSell &&
        !inventory.closedForBooking;


      inventory.lastUpdatedBy =
        vendorId;

      inventory.lastUpdatedAt =
        new Date();


      await inventory.save();


      return res.status(200).json({
        success: true,

        message:
          "Inventory date unblocked successfully.",

        inventory,
      });

    } catch (error) {
      console.error(
        "Unblock Inventory Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to unblock inventory.",
        error: error.message,
      });
    }
  };


/* ============================================================
   STOP SELL
============================================================ */

exports.stopSellInventory =
  async (
    req,
    res
  ) => {
    try {
      const vendorId =
        req.vendor?._id;


      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required.",
        });
      }


      const inventory =
        await HomestayInventory.findOne({
          _id:
            req.params.inventoryId,

          vendor:
            vendorId,
        });


      if (!inventory) {
        return res.status(404).json({
          success: false,
          message:
            "Inventory not found.",
        });
      }


      inventory.stopSell =
        true;

      inventory.isAvailable =
        false;


      inventory.lastUpdatedBy =
        vendorId;

      inventory.lastUpdatedAt =
        new Date();


      await inventory.save();


      return res.status(200).json({
        success: true,

        message:
          "Stop-sell enabled successfully.",

        inventory,
      });

    } catch (error) {
      console.error(
        "Stop Sell Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to enable stop-sell.",
        error: error.message,
      });
    }
  };


/* ============================================================
   RESUME SELL
============================================================ */

exports.resumeSellInventory =
  async (
    req,
    res
  ) => {
    try {
      const vendorId =
        req.vendor?._id;


      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required.",
        });
      }


      const inventory =
        await HomestayInventory.findOne({
          _id:
            req.params.inventoryId,

          vendor:
            vendorId,
        });


      if (!inventory) {
        return res.status(404).json({
          success: false,
          message:
            "Inventory not found.",
        });
      }


      inventory.stopSell =
        false;


      inventory.isAvailable =
        inventory.availableUnits >
          0 &&
        !inventory.isBlocked &&
        !inventory.closedForBooking;


      inventory.lastUpdatedBy =
        vendorId;

      inventory.lastUpdatedAt =
        new Date();


      await inventory.save();


      return res.status(200).json({
        success: true,

        message:
          "Stop-sell disabled successfully.",

        inventory,
      });

    } catch (error) {
      console.error(
        "Resume Sell Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to resume selling.",
        error: error.message,
      });
    }
  };


/* ============================================================
   DELETE INVENTORY
============================================================ */

exports.deleteInventory =
  async (
    req,
    res
  ) => {
    try {
      const vendorId =
        req.vendor?._id;


      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message:
            "Vendor authentication required.",
        });
      }


      const inventory =
        await HomestayInventory.findOne({
          _id:
            req.params.inventoryId,

          vendor:
            vendorId,
        });


      if (!inventory) {
        return res.status(404).json({
          success: false,
          message:
            "Inventory not found.",
        });
      }


      /*
        Don't allow deletion after booking.
      */

      if (
        inventory.bookedUnits >
        0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Inventory cannot be deleted because bookings already exist for this date.",
        });
      }


      await HomestayInventory.deleteOne({
        _id:
          inventory._id,
      });


      return res.status(200).json({
        success: true,

        message:
          "Inventory deleted successfully.",
      });

    } catch (error) {
      console.error(
        "Delete Inventory Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete inventory.",
        error: error.message,
      });
    }
  };