const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");

const {
  createTicket,
  getEventTickets,
  updateTicket,
  toggleTicketStatus,
  deleteTicket,
} = require("../controllers/nightclubEventTicket.controller");

// CREATE TICKET
router.post(
  "/",
  protect,
  upload.none(),
  createTicket
);

// GET EVENT TICKETS
router.get(
  "/event/:eventId",
  protect,
  getEventTickets
);

// UPDATE
router.put(
  "/:id",
  protect,
  upload.none(),
  updateTicket
);

// TOGGLE
router.patch(
  "/:id/toggle",
  protect,
  toggleTicketStatus
);

// DELETE
router.delete(
  "/:id",
  protect,
  deleteTicket
);

module.exports = router;