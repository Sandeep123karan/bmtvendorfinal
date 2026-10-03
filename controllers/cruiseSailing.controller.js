const CruiseSailing = require("../models/CruiseSailing.model");

const getVendorId = (req) =>
  req.user?._id ||
  req.user?.id ||
  req.vendor?._id ||
  req.vendor?.id;

const parsePort = (value) => {
  if (!value) return null;

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return {
      name: value.trim(),
    };
  }
};

const validateDates = (departureDate, returnDate) => {
  const departure = new Date(departureDate);
  const arrival = new Date(returnDate);

  if (
    Number.isNaN(departure.getTime()) ||
    Number.isNaN(arrival.getTime())
  ) {
    return "Valid departure and return dates are required.";
  }

  if (arrival <= departure) {
    return "Return date must be after departure date.";
  }

  return null;
};

const createSailing = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const {
      shipId,
      itineraryId,
      sailingCode,
      departureDate,
      returnDate,
      departurePort,
      arrivalPort,
      bookingOpenDate,
      bookingCloseDate,
      totalCapacity,
      availableCapacity,
      bookingStatus,
      status,
    } = req.body;

    if (!shipId) {
      return res.status(400).json({
        success: false,
        message: "Ship ID is required.",
      });
    }

    if (!itineraryId) {
      return res.status(400).json({
        success: false,
        message: "Itinerary ID is required.",
      });
    }

    if (!sailingCode?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Sailing code is required.",
      });
    }

    if (!departureDate) {
      return res.status(400).json({
        success: false,
        message: "Departure date is required.",
      });
    }

    if (!returnDate) {
      return res.status(400).json({
        success: false,
        message: "Return date is required.",
      });
    }

    const dateError = validateDates(
      departureDate,
      returnDate
    );

    if (dateError) {
      return res.status(400).json({
        success: false,
        message: dateError,
      });
    }

    const parsedDeparturePort = parsePort(
      departurePort
    );

    const parsedArrivalPort = parsePort(
      arrivalPort
    );

    if (
      !parsedDeparturePort ||
      !parsedDeparturePort.name
    ) {
      return res.status(400).json({
        success: false,
        message: "Departure port name is required.",
      });
    }

    if (
      !parsedArrivalPort ||
      !parsedArrivalPort.name
    ) {
      return res.status(400).json({
        success: false,
        message: "Arrival port name is required.",
      });
    }

    const existingSailing =
      await CruiseSailing.findOne({
        vendorId,
        sailingCode:
          sailingCode.trim().toUpperCase(),
      });

    if (existingSailing) {
      return res.status(409).json({
        success: false,
        message: "Sailing code already exists.",
      });
    }

    const total =
      totalCapacity !== undefined
        ? Number(totalCapacity)
        : 0;

    const available =
      availableCapacity !== undefined
        ? Number(availableCapacity)
        : total;

    if (total < 0 || available < 0) {
      return res.status(400).json({
        success: false,
        message: "Capacity cannot be negative.",
      });
    }

    if (available > total) {
      return res.status(400).json({
        success: false,
        message:
          "Available capacity cannot be greater than total capacity.",
      });
    }

    const sailing =
      await CruiseSailing.create({
        vendorId,
        shipId,
        itineraryId,
        sailingCode:
          sailingCode.trim().toUpperCase(),
        departureDate,
        returnDate,
        departurePort:
          parsedDeparturePort,
        arrivalPort:
          parsedArrivalPort,
        bookingOpenDate:
          bookingOpenDate || null,
        bookingCloseDate:
          bookingCloseDate || null,
        totalCapacity: total,
        availableCapacity: available,
        bookingStatus:
          bookingStatus || "open",
        status: status || "draft",
      });

    const populatedSailing =
      await CruiseSailing.findById(
        sailing._id
      )
        .populate(
          "shipId",
          "shipName cruiseLineName cruiseType coverImage"
        )
        .populate(
          "itineraryId",
          "itineraryName itineraryCode durationDays durationNights"
        );

    return res.status(201).json({
      success: true,
      message:
        "Cruise sailing created successfully.",
      sailing: populatedSailing,
    });
  } catch (error) {
    console.error(
      "CREATE SAILING ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Sailing code already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create cruise sailing.",
      error: error.message,
    });
  }
};

const getSailings = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const filter = {
      vendorId,
    };

    if (req.query.shipId) {
      filter.shipId = req.query.shipId;
    }

    if (req.query.itineraryId) {
      filter.itineraryId =
        req.query.itineraryId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.bookingStatus) {
      filter.bookingStatus =
        req.query.bookingStatus;
    }

    const sailings =
      await CruiseSailing.find(filter)
        .populate(
          "shipId",
          "shipName cruiseLineName cruiseType coverImage"
        )
        .populate(
          "itineraryId",
          "itineraryName itineraryCode durationDays durationNights"
        )
        .sort({
          departureDate: 1,
        });

    return res.status(200).json({
      success: true,
      count: sailings.length,
      sailings,
    });
  } catch (error) {
    console.error(
      "GET SAILINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch cruise sailings.",
      error: error.message,
    });
  }
};

const getSailingById = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const sailing =
      await CruiseSailing.findOne({
        _id: req.params.id,
        vendorId,
      })
        .populate(
          "shipId",
          "shipName cruiseLineName cruiseType vesselType coverImage"
        )
        .populate(
          "itineraryId",
          "itineraryName itineraryCode description durationDays durationNights departurePort arrivalPort"
        );

    if (!sailing) {
      return res.status(404).json({
        success: false,
        message: "Cruise sailing not found.",
      });
    }

    return res.status(200).json({
      success: true,
      sailing,
    });
  } catch (error) {
    console.error(
      "GET SAILING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch cruise sailing.",
      error: error.message,
    });
  }
};

const updateSailing = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const sailing =
      await CruiseSailing.findOne({
        _id: req.params.id,
        vendorId,
      });

    if (!sailing) {
      return res.status(404).json({
        success: false,
        message: "Cruise sailing not found.",
      });
    }

    if (req.body.shipId !== undefined) {
      sailing.shipId = req.body.shipId;
    }

    if (
      req.body.itineraryId !== undefined
    ) {
      sailing.itineraryId =
        req.body.itineraryId;
    }

    if (req.body.sailingCode !== undefined) {
      const code =
        req.body.sailingCode
          .trim()
          .toUpperCase();

      const duplicate =
        await CruiseSailing.findOne({
          vendorId,
          sailingCode: code,
          _id: {
            $ne: sailing._id,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Sailing code already exists.",
        });
      }

      sailing.sailingCode = code;
    }

    if (
      req.body.departureDate !== undefined
    ) {
      sailing.departureDate =
        req.body.departureDate;
    }

    if (
      req.body.returnDate !== undefined
    ) {
      sailing.returnDate =
        req.body.returnDate;
    }

    if (
      req.body.departureDate !== undefined ||
      req.body.returnDate !== undefined
    ) {
      const dateError = validateDates(
        sailing.departureDate,
        sailing.returnDate
      );

      if (dateError) {
        return res.status(400).json({
          success: false,
          message: dateError,
        });
      }
    }

    if (
      req.body.departurePort !== undefined
    ) {
      sailing.departurePort =
        parsePort(
          req.body.departurePort
        );
    }

    if (
      req.body.arrivalPort !== undefined
    ) {
      sailing.arrivalPort =
        parsePort(
          req.body.arrivalPort
        );
    }

    if (
      req.body.bookingOpenDate !==
      undefined
    ) {
      sailing.bookingOpenDate =
        req.body.bookingOpenDate || null;
    }

    if (
      req.body.bookingCloseDate !==
      undefined
    ) {
      sailing.bookingCloseDate =
        req.body.bookingCloseDate || null;
    }

    if (
      req.body.totalCapacity !==
      undefined
    ) {
      sailing.totalCapacity = Number(
        req.body.totalCapacity
      );
    }

    if (
      req.body.availableCapacity !==
      undefined
    ) {
      sailing.availableCapacity =
        Number(
          req.body.availableCapacity
        );
    }

    if (
      sailing.totalCapacity < 0 ||
      sailing.availableCapacity < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Capacity cannot be negative.",
      });
    }

    if (
      sailing.availableCapacity >
      sailing.totalCapacity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Available capacity cannot be greater than total capacity.",
      });
    }

    if (
      req.body.bookingStatus !==
      undefined
    ) {
      sailing.bookingStatus =
        req.body.bookingStatus;
    }

    if (req.body.status !== undefined) {
      sailing.status = req.body.status;
    }

    await sailing.save();

    const updatedSailing =
      await CruiseSailing.findById(
        sailing._id
      )
        .populate(
          "shipId",
          "shipName cruiseLineName cruiseType coverImage"
        )
        .populate(
          "itineraryId",
          "itineraryName itineraryCode durationDays durationNights"
        );

    return res.status(200).json({
      success: true,
      message:
        "Cruise sailing updated successfully.",
      sailing: updatedSailing,
    });
  } catch (error) {
    console.error(
      "UPDATE SAILING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update cruise sailing.",
      error: error.message,
    });
  }
};

const deleteSailing = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const sailing =
      await CruiseSailing.findOneAndDelete({
        _id: req.params.id,
        vendorId,
      });

    if (!sailing) {
      return res.status(404).json({
        success: false,
        message: "Cruise sailing not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Cruise sailing deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE SAILING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete cruise sailing.",
      error: error.message,
    });
  }
};

module.exports = {
  createSailing,
  getSailings,
  getSailingById,
  updateSailing,
  deleteSailing,
};