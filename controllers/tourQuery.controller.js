const TourQuery = require("../models/TourQuery");
const Tour = require("../models/Tour");

/* =========================================================
   CREATE TOUR QUERY
========================================================= */

const createQuery = async (req, res) => {
  try {
    const {
      tourId,
      customerId,
      customer,
      travelDate,
      guests,
      budget,
      message,
      source,
    } = req.body;

    if (!tourId) {
      return res.status(400).json({
        success: false,
        message: "tourId is required",
      });
    }

    if (!customer?.name) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    const tour = await Tour.findById(tourId);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    /*
      Security:
      Vendor sirf apne tour ke liye query create kar sake.
    */

    if (String(tour.vendorId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this tour",
      });
    }

    const totalGuests =
      guests?.total ||
      (Number(guests?.adults || 0) +
        Number(guests?.children || 0) +
        Number(guests?.infants || 0));

    const query = await TourQuery.create({
      vendorId: req.user._id,

      tourId,

      customerId: customerId || null,

      customer: {
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
      },

      travelDate: travelDate || null,

      guests: {
        adults: Number(guests?.adults || 1),
        children: Number(guests?.children || 0),
        infants: Number(guests?.infants || 0),
        total: totalGuests || 1,
      },

      budget: {
        min: Number(budget?.min || 0),
        max: Number(budget?.max || 0),
        currency: budget?.currency || "INR",
      },

      message: message || "",

      source: source || "WEBSITE",

      status: "NEW",
    });

    const populatedQuery = await TourQuery.findById(query._id)
      .populate("tourId", "title category location duration pricing")
      .populate("customerId", "name email phone");

    return res.status(201).json({
      success: true,
      message: "Tour query created successfully",
      query: populatedQuery,
    });
  } catch (error) {
    console.error("CREATE TOUR QUERY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create tour query",
      error: error.message,
    });
  }
};


/* =========================================================
   GET VENDOR QUERIES
========================================================= */

const getVendorQueries = async (req, res) => {
  try {
    const {
      status,
      tourId,
      fromDate,
      toDate,
      search,
    } = req.query;

    const filter = {
      vendorId: req.user._id,
    };

    if (status) {
      filter.status = status;
    }

    if (tourId) {
      filter.tourId = tourId;
    }

    /* Travel date filter */

    if (fromDate || toDate) {
      filter.travelDate = {};

      if (fromDate) {
        filter.travelDate.$gte = new Date(fromDate);
      }

      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);

        filter.travelDate.$lte = endDate;
      }
    }

    /* Search */

    if (search) {
      const regex = new RegExp(search, "i");

      filter.$or = [
        {
          queryId: regex,
        },
        {
          "customer.name": regex,
        },
        {
          "customer.email": regex,
        },
        {
          "customer.phone": regex,
        },
        {
          message: regex,
        },
      ];
    }

    const queries = await TourQuery.find(filter)
      .populate(
        "tourId",
        "title category location duration pricing"
      )
      .populate(
        "customerId",
        "name email phone"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: queries.length,
      queries,
    });
  } catch (error) {
    console.error("GET TOUR QUERIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tour queries",
      error: error.message,
    });
  }
};


/* =========================================================
   GET SINGLE QUERY
========================================================= */

const getQueryById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = await TourQuery.findOne({
      _id: id,
      vendorId: req.user._id,
    })
      .populate(
        "tourId",
        "title category location duration pricing description"
      )
      .populate(
        "customerId",
        "name email phone"
      );

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Tour query not found",
      });
    }

    return res.status(200).json({
      success: true,
      query,
    });
  } catch (error) {
    console.error("GET TOUR QUERY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tour query",
      error: error.message,
    });
  }
};


/* =========================================================
   UPDATE QUERY STATUS
========================================================= */

const updateQueryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "NEW",
      "IN_PROGRESS",
      "CONVERTED",
      "CLOSED",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid query status",
      });
    }

    const query = await TourQuery.findOneAndUpdate(
      {
        _id: id,
        vendorId: req.user._id,
      },
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate(
        "tourId",
        "title category location duration pricing"
      )
      .populate(
        "customerId",
        "name email phone"
      );

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Tour query not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Query status updated successfully",
      query,
    });
  } catch (error) {
    console.error("UPDATE QUERY STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update query status",
      error: error.message,
    });
  }
};


/* =========================================================
   UPDATE VENDOR NOTE
========================================================= */

const updateVendorNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorNote } = req.body;

    const query = await TourQuery.findOneAndUpdate(
      {
        _id: id,
        vendorId: req.user._id,
      },
      {
        vendorNote: vendorNote || "",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Tour query not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor note updated successfully",
      query,
    });
  } catch (error) {
    console.error("UPDATE VENDOR NOTE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update vendor note",
      error: error.message,
    });
  }
};


/* =========================================================
   DELETE QUERY
========================================================= */

const deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;

    const query = await TourQuery.findOneAndDelete({
      _id: id,
      vendorId: req.user._id,
    });

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Tour query not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tour query deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TOUR QUERY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete tour query",
      error: error.message,
    });
  }
};


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  createQuery,
  getVendorQueries,
  getQueryById,
  updateQueryStatus,
  updateVendorNote,
  deleteQuery,
};