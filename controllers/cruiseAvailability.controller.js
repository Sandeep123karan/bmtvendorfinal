const CruiseAvailability = require("../models/CruiseAvailability.model");

const getVendorId = (req) =>
  req.user?._id ||
  req.user?.id ||
  req.vendor?._id ||
  req.vendor?.id;

const toNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : NaN;
};

const calculateStatus = (
  totalInventory,
  availableInventory
) => {
  if (totalInventory === 0) {
    return "inactive";
  }

  if (availableInventory === 0) {
    return "sold-out";
  }

  if (
    availableInventory <=
    Math.ceil(totalInventory * 0.2)
  ) {
    return "limited";
  }

  return "available";
};

const validateInventory = ({
  totalInventory,
  availableInventory,
  reservedInventory,
  soldInventory,
}) => {
  const values = [
    totalInventory,
    availableInventory,
    reservedInventory,
    soldInventory,
  ];

  if (
    values.some(
      (value) =>
        Number.isNaN(value) || value < 0
    )
  ) {
    return "Inventory values must be valid non-negative numbers.";
  }

  if (
    availableInventory +
      reservedInventory +
      soldInventory >
    totalInventory
  ) {
    return "Available, reserved and sold inventory cannot exceed total inventory.";
  }

  return null;
};

const createAvailability = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const {
      sailingId,
      shipId,
      cabinId,
      totalInventory,
      availableInventory,
      reservedInventory,
      soldInventory,
    } = req.body;

    if (!sailingId) {
      return res.status(400).json({
        success: false,
        message: "Sailing ID is required.",
      });
    }

    if (!shipId) {
      return res.status(400).json({
        success: false,
        message: "Ship ID is required.",
      });
    }

    if (!cabinId) {
      return res.status(400).json({
        success: false,
        message: "Cabin ID is required.",
      });
    }

    if (
      totalInventory === undefined ||
      totalInventory === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Total inventory is required.",
      });
    }

    const total = toNumber(totalInventory);
    const available = toNumber(
      availableInventory,
      total
    );
    const reserved = toNumber(
      reservedInventory
    );
    const sold = toNumber(soldInventory);

    const validationError =
      validateInventory({
        totalInventory: total,
        availableInventory: available,
        reservedInventory: reserved,
        soldInventory: sold,
      });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const existing =
      await CruiseAvailability.findOne({
        vendorId,
        sailingId,
        cabinId,
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "Availability already exists for this sailing and cabin.",
      });
    }

    const status = calculateStatus(
      total,
      available
    );

    const availability =
      await CruiseAvailability.create({
        vendorId,
        sailingId,
        shipId,
        cabinId,
        totalInventory: total,
        availableInventory: available,
        reservedInventory: reserved,
        soldInventory: sold,
        status,
      });

    const populatedAvailability =
      await CruiseAvailability.findById(
        availability._id
      )
        .populate(
          "sailingId",
          "sailingCode departureDate returnDate departurePort arrivalPort"
        )
        .populate(
          "shipId",
          "shipName cruiseLineName cruiseType"
        )
        .populate("cabinId");

    return res.status(201).json({
      success: true,
      message:
        "Cruise availability created successfully.",
      availability: populatedAvailability,
    });
  } catch (error) {
    console.error(
      "CREATE CRUISE AVAILABILITY ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Availability already exists for this sailing and cabin.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create cruise availability.",
      error: error.message,
    });
  }
};

const getAvailabilities = async (req, res) => {
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

    if (req.query.sailingId) {
      filter.sailingId =
        req.query.sailingId;
    }

    if (req.query.shipId) {
      filter.shipId = req.query.shipId;
    }

    if (req.query.cabinId) {
      filter.cabinId = req.query.cabinId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const availabilities =
      await CruiseAvailability.find(filter)
        .populate(
          "sailingId",
          "sailingCode departureDate returnDate departurePort arrivalPort"
        )
        .populate(
          "shipId",
          "shipName cruiseLineName cruiseType"
        )
        .populate("cabinId")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: availabilities.length,
      availabilities,
    });
  } catch (error) {
    console.error(
      "GET CRUISE AVAILABILITY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch cruise availability.",
      error: error.message,
    });
  }
};

const getAvailabilityById = async (
  req,
  res
) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const availability =
      await CruiseAvailability.findOne({
        _id: req.params.id,
        vendorId,
      })
        .populate(
          "sailingId",
          "sailingCode departureDate returnDate departurePort arrivalPort"
        )
        .populate(
          "shipId",
          "shipName cruiseLineName cruiseType"
        )
        .populate("cabinId");

    if (!availability) {
      return res.status(404).json({
        success: false,
        message:
          "Cruise availability not found.",
      });
    }

    return res.status(200).json({
      success: true,
      availability,
    });
  } catch (error) {
    console.error(
      "GET CRUISE AVAILABILITY BY ID ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch cruise availability.",
      error: error.message,
    });
  }
};

const updateAvailability = async (
  req,
  res
) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const availability =
      await CruiseAvailability.findOne({
        _id: req.params.id,
        vendorId,
      });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message:
          "Cruise availability not found.",
      });
    }

    if (req.body.sailingId !== undefined) {
      availability.sailingId =
        req.body.sailingId;
    }

    if (req.body.shipId !== undefined) {
      availability.shipId =
        req.body.shipId;
    }

    if (req.body.cabinId !== undefined) {
      availability.cabinId =
        req.body.cabinId;
    }

    const numericFields = [
      "totalInventory",
      "availableInventory",
      "reservedInventory",
      "soldInventory",
    ];

    for (const field of numericFields) {
      if (req.body[field] !== undefined) {
        const value = toNumber(
          req.body[field]
        );

        if (
          Number.isNaN(value) ||
          value < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              `${field} must be a valid non-negative number.`,
          });
        }

        availability[field] = value;
      }
    }

    const validationError =
      validateInventory({
        totalInventory:
          availability.totalInventory,
        availableInventory:
          availability.availableInventory,
        reservedInventory:
          availability.reservedInventory,
        soldInventory:
          availability.soldInventory,
      });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const duplicate =
      await CruiseAvailability.findOne({
        vendorId,
        sailingId:
          availability.sailingId,
        cabinId:
          availability.cabinId,
        _id: {
          $ne: availability._id,
        },
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "Availability already exists for this sailing and cabin.",
      });
    }

    availability.status =
      calculateStatus(
        availability.totalInventory,
        availability.availableInventory
      );

    await availability.save();

    const updatedAvailability =
      await CruiseAvailability.findById(
        availability._id
      )
        .populate(
          "sailingId",
          "sailingCode departureDate returnDate departurePort arrivalPort"
        )
        .populate(
          "shipId",
          "shipName cruiseLineName cruiseType"
        )
        .populate("cabinId");

    return res.status(200).json({
      success: true,
      message:
        "Cruise availability updated successfully.",
      availability: updatedAvailability,
    });
  } catch (error) {
    console.error(
      "UPDATE CRUISE AVAILABILITY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update cruise availability.",
      error: error.message,
    });
  }
};

const deleteAvailability = async (
  req,
  res
) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const availability =
      await CruiseAvailability.findOneAndDelete({
        _id: req.params.id,
        vendorId,
      });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message:
          "Cruise availability not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Cruise availability deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE CRUISE AVAILABILITY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete cruise availability.",
      error: error.message,
    });
  }
};

module.exports = {
  createAvailability,
  getAvailabilities,
  getAvailabilityById,
  updateAvailability,
  deleteAvailability,
};