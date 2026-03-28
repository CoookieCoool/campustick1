const express = require("express");
const { bookTicket, getMyTickets, getTicketById, scanTicket } = require("../controllers/ticketController");
const protect             = require("../middleware/authMiddleware");
const authorizeOrganizer  = require("../middleware/authorizeOrganizer");

const router = express.Router();

// NOTE: specific routes must come before /:id
router.post("/book/:eventId",  protect, bookTicket);
router.get("/my",              protect, getMyTickets);
router.post("/scan",           protect, authorizeOrganizer, scanTicket);
router.get("/:id",             protect, getTicketById);

module.exports = router;
