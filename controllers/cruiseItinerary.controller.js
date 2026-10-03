const CruiseItinerary = require("../models/CruiseItinerary.model");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    stream.end(file.buffer);
  });
};

const parseArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const parseStops = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const createItinerary = async (req, res) => {
  try {
    const vendorId =
      req.user?._id ||
      req.user?.id ||
      req.vendor?._id ||
      req.vendor?.id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const {
      shipId,
      itineraryName,
      itineraryCode,
      description,
      durationDays,
      durationNights,
      departurePort,
      arrivalPort,
      stops,
      destinations,
      activities,
      inclusions,
      exclusions,
      departureDate,
      returnDate,
      status,
    } = req.body;

    if (!shipId) {
      return res.status(400).json({
        success: false,
        message: "Ship ID is required.",
      });
    }

    if (!itineraryName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Itinerary name is required.",
      });
    }

    if (!durationDays) {
      return res.status(400).json({
        success: false,
        message: "Duration days is required.",
      });
    }

    if (!durationNights && durationNights !== 0) {
      return res.status(400).json({
        success: false,
        message: "Duration nights is required.",
      });
    }

    let parsedDeparturePort = departurePort;
    let parsedArrivalPort = arrivalPort;

    if (typeof departurePort === "string") {
      try {
        parsedDeparturePort = JSON.parse(departurePort);
      } catch {
        parsedDeparturePort = {
          name: departurePort,
        };
      }
    }

    if (typeof arrivalPort === "string") {
      try {
        parsedArrivalPort = JSON.parse(arrivalPort);
      } catch {
        parsedArrivalPort = {
          name: arrivalPort,
        };
      }
    }

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

    const files = req.files || {};

    let coverImage = "";

    if (files.coverImage?.length) {
      coverImage = await uploadToCloudinary(
        files.coverImage[0],
        "cruise-itineraries"
      );
    }

    let images = [];

    if (files.images?.length) {
      images = await Promise.all(
        files.images.map((file) =>
          uploadToCloudinary(
            file,
            "cruise-itineraries/images"
          )
        )
      );
    }

    const itinerary = await CruiseItinerary.create({
      vendorId,
      shipId,
      itineraryName: itineraryName.trim(),
      itineraryCode: itineraryCode?.trim() || "",
      description: description?.trim() || "",
      durationDays: Number(durationDays),
      durationNights: Number(durationNights),
      departurePort: parsedDeparturePort,
      arrivalPort: parsedArrivalPort,
      stops: parseStops(stops),
      destinations: parseArray(destinations),
      activities: parseArray(activities),
      inclusions: parseArray(inclusions),
      exclusions: parseArray(exclusions),
      coverImage,
      images,
      departureDate: departureDate || null,
      returnDate: returnDate || null,
      status: status || "draft",
    });

    return res.status(201).json({
      success: true,
      message: "Cruise itinerary created successfully.",
      itinerary,
    });
  } catch (error) {
    console.error("CREATE ITINERARY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create cruise itinerary.",
      error: error.message,
    });
  }
};

const getItineraries = async (req, res) => {
  try {
    const vendorId =
      req.user?._id ||
      req.user?.id ||
      req.vendor?._id ||
      req.vendor?.id;

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

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const itineraries = await CruiseItinerary.find(filter)
      .populate(
        "shipId",
        "shipName cruiseLineName cruiseType coverImage"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: itineraries.length,
      itineraries,
    });
  } catch (error) {
    console.error("GET ITINERARIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cruise itineraries.",
      error: error.message,
    });
  }
};

const getItineraryById = async (req, res) => {
  try {
    const vendorId =
      req.user?._id ||
      req.user?.id ||
      req.vendor?._id ||
      req.vendor?.id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const itinerary = await CruiseItinerary.findOne({
      _id: req.params.id,
      vendorId,
    }).populate(
      "shipId",
      "shipName cruiseLineName cruiseType vesselType coverImage"
    );

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Cruise itinerary not found.",
      });
    }

    return res.status(200).json({
      success: true,
      itinerary,
    });
  } catch (error) {
    console.error("GET ITINERARY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cruise itinerary.",
      error: error.message,
    });
  }
};

const updateItinerary = async (req, res) => {
  try {
    const vendorId =
      req.user?._id ||
      req.user?.id ||
      req.vendor?._id ||
      req.vendor?.id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const itinerary = await CruiseItinerary.findOne({
      _id: req.params.id,
      vendorId,
    });

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Cruise itinerary not found.",
      });
    }

    const allowedFields = [
      "shipId",
      "itineraryName",
      "itineraryCode",
      "description",
      "durationDays",
      "durationNights",
      "departureDate",
      "returnDate",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== ""
      ) {
        itinerary[field] = req.body[field];
      }
    });

    if (req.body.departurePort !== undefined) {
      let value = req.body.departurePort;

      if (typeof value === "string") {
        try {
          value = JSON.parse(value);
        } catch {
          value = {
            name: value,
          };
        }
      }

      itinerary.departurePort = value;
    }

    if (req.body.arrivalPort !== undefined) {
      let value = req.body.arrivalPort;

      if (typeof value === "string") {
        try {
          value = JSON.parse(value);
        } catch {
          value = {
            name: value,
          };
        }
      }

      itinerary.arrivalPort = value;
    }

    if (req.body.stops !== undefined) {
      itinerary.stops = parseStops(req.body.stops);
    }

    if (req.body.destinations !== undefined) {
      itinerary.destinations = parseArray(
        req.body.destinations
      );
    }

    if (req.body.activities !== undefined) {
      itinerary.activities = parseArray(
        req.body.activities
      );
    }

    if (req.body.inclusions !== undefined) {
      itinerary.inclusions = parseArray(
        req.body.inclusions
      );
    }

    if (req.body.exclusions !== undefined) {
      itinerary.exclusions = parseArray(
        req.body.exclusions
      );
    }

    if (req.body.durationDays !== undefined) {
      itinerary.durationDays = Number(
        req.body.durationDays
      );
    }

    if (req.body.durationNights !== undefined) {
      itinerary.durationNights = Number(
        req.body.durationNights
      );
    }

    const files = req.files || {};

    if (files.coverImage?.length) {
      itinerary.coverImage =
        await uploadToCloudinary(
          files.coverImage[0],
          "cruise-itineraries"
        );
    }

    if (files.images?.length) {
      const newImages = await Promise.all(
        files.images.map((file) =>
          uploadToCloudinary(
            file,
            "cruise-itineraries/images"
          )
        )
      );

      itinerary.images = [
        ...(itinerary.images || []),
        ...newImages,
      ];
    }

    await itinerary.save();

    const updatedItinerary =
      await CruiseItinerary.findById(
        itinerary._id
      ).populate(
        "shipId",
        "shipName cruiseLineName cruiseType vesselType coverImage"
      );

    return res.status(200).json({
      success: true,
      message: "Cruise itinerary updated successfully.",
      itinerary: updatedItinerary,
    });
  } catch (error) {
    console.error("UPDATE ITINERARY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update cruise itinerary.",
      error: error.message,
    });
  }
};

const deleteItinerary = async (req, res) => {
  try {
    const vendorId =
      req.user?._id ||
      req.user?.id ||
      req.vendor?._id ||
      req.vendor?.id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Vendor authentication required.",
      });
    }

    const itinerary =
      await CruiseItinerary.findOneAndDelete({
        _id: req.params.id,
        vendorId,
      });

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Cruise itinerary not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cruise itinerary deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ITINERARY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete cruise itinerary.",
      error: error.message,
    });
  }
};

module.exports = {
  createItinerary,
  getItineraries,
  getItineraryById,
  updateItinerary,
  deleteItinerary,
};