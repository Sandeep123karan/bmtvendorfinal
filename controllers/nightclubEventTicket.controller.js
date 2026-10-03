const NightClubEventTicket = require(
  "../models/NightClubEventTicket.model"
);

const NightClubEvent = require(
  "../models/NightClubEvent.model"
);

const NightClub = require(
  "../models/NightClub.model"
);

// =====================================================
// GET VENDOR ID
// =====================================================

const getVendorId = (req) => {
  return (
    req.vendor?._id ||
    req.user?._id ||
    req.vendor?.id ||
    req.user?.id
  );
};

// =====================================================
// CREATE TICKET
// =====================================================

exports.createTicket = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      eventId,
      name,
      ticketType,
      description,
      price,
      totalQuantity,
      personsPerTicket,
      minimumAge,
      saleStartDate,
      saleEndDate,
    } = req.body;

    // ================================================
    // REQUIRED
    // ================================================

    if (
      !eventId ||
      !name ||
      !ticketType ||
      price === undefined ||
      !totalQuantity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "eventId, name, ticketType, price and totalQuantity are required",
      });
    }

    // ================================================
    // CHECK EVENT
    // ================================================

    const event = await NightClubEvent.findOne({
      _id: eventId,
      vendorId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message:
          "Event not found or does not belong to this vendor",
      });
    }

    // ================================================
    // CHECK CLUB OWNERSHIP
    // ================================================

    const club = await NightClub.findOne({
      _id: event.nightClubId,
      vendorId,
    });

    if (!club) {
      return res.status(403).json({
        success: false,
        message:
          "Night club does not belong to this vendor",
      });
    }

    // ================================================
    // VALIDATE PRICE
    // ================================================

    const ticketPrice = Number(price);

    if (
      !Number.isFinite(ticketPrice) ||
      ticketPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket price",
      });
    }

    // ================================================
    // VALIDATE QUANTITY
    // ================================================

    const quantity = Number(totalQuantity);

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "totalQuantity must be greater than 0",
      });
    }

    // ================================================
    // DUPLICATE TICKET TYPE
    // ================================================

    const existingTicket =
      await NightClubEventTicket.findOne({
        eventId,
        ticketType,
      });

    if (existingTicket) {
      return res.status(409).json({
        success: false,
        message:
          "This ticket type already exists for this event",
      });
    }

    // ================================================
    // CREATE
    // ================================================

    const ticket =
      await NightClubEventTicket.create({
        vendorId,

        nightClubId: event.nightClubId,

        eventId,

        name: name.trim(),

        ticketType,

        description: description || "",

        price: ticketPrice,

        totalQuantity: quantity,

        soldQuantity: 0,

        availableQuantity: quantity,

        personsPerTicket:
          Number(personsPerTicket || 1),

        minimumAge:
          Number(minimumAge || event.minimumAge || 18),

        saleStartDate: saleStartDate
          ? new Date(saleStartDate)
          : null,

        saleEndDate: saleEndDate
          ? new Date(saleEndDate)
          : null,

        isActive: true,

        isSoldOut: false,
      });

    return res.status(201).json({
      success: true,
      message:
        "Event ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    console.error(
      "CREATE EVENT TICKET ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create event ticket",
    });
  }
};

// =====================================================
// GET MY EVENT TICKETS
// =====================================================

exports.getEventTickets = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { eventId } = req.params;

    const event = await NightClubEvent.findOne({
      _id: eventId,
      vendorId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const tickets =
      await NightClubEventTicket.find({
        eventId,
        vendorId,
      }).sort({
        createdAt: 1,
      });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error(
      "GET EVENT TICKETS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE TICKET
// =====================================================

exports.updateTicket = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const ticket =
      await NightClubEventTicket.findOne({
        _id: req.params.id,
        vendorId,
      });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // ================================================
    // DO NOT ALLOW OWNERSHIP CHANGES
    // ================================================

    delete req.body.vendorId;
    delete req.body.eventId;
    delete req.body.nightClubId;

    // ================================================
    // PRICE
    // ================================================

    if (req.body.price !== undefined) {
      const price = Number(req.body.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid price",
        });
      }

      req.body.price = price;
    }

    // ================================================
    // QUANTITY
    // ================================================

    if (
      req.body.totalQuantity !== undefined
    ) {
      const quantity = Number(
        req.body.totalQuantity
      );

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "totalQuantity must be greater than 0",
        });
      }

      if (quantity < ticket.soldQuantity) {
        return res.status(400).json({
          success: false,
          message:
            "Total quantity cannot be less than sold quantity",
        });
      }

      req.body.totalQuantity = quantity;

      req.body.availableQuantity =
        quantity - ticket.soldQuantity;
    }

    // ================================================
    // PERSONS
    // ================================================

    if (
      req.body.personsPerTicket !== undefined
    ) {
      req.body.personsPerTicket =
        Number(req.body.personsPerTicket);
    }

    // ================================================
    // ACTIVE
    // ================================================

    if (req.body.isActive !== undefined) {
      req.body.isActive =
        req.body.isActive === true ||
        req.body.isActive === "true";
    }

    Object.assign(ticket, req.body);

    ticket.isSoldOut =
      ticket.availableQuantity <= 0;

    await ticket.save();

    return res.status(200).json({
      success: true,
      message:
        "Event ticket updated successfully",
      data: ticket,
    });
  } catch (error) {
    console.error(
      "UPDATE EVENT TICKET ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// ACTIVATE / DEACTIVATE
// =====================================================

exports.toggleTicketStatus = async (
  req,
  res
) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const ticket =
      await NightClubEventTicket.findOne({
        _id: req.params.id,
        vendorId,
      });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.isActive = !ticket.isActive;

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: ticket.isActive
        ? "Ticket activated successfully"
        : "Ticket deactivated successfully",
      data: ticket,
    });
  } catch (error) {
    console.error(
      "TOGGLE TICKET ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE TICKET
// =====================================================

exports.deleteTicket = async (req, res) => {
  try {
    const vendorId = getVendorId(req);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const ticket =
      await NightClubEventTicket.findOne({
        _id: req.params.id,
        vendorId,
      });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Don't delete ticket after sales
    if (ticket.soldQuantity > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Ticket cannot be deleted after bookings. Deactivate it instead.",
      });
    }

    await ticket.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Event ticket deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE EVENT TICKET ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};