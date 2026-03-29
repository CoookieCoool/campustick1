const Ticket = require("../models/Ticket");
const Event  = require("../models/Event");
const { generateQR, generateQRData } = require("../utils/qrHelper");
const { sendBookingConfirmation } = require("../utils/mailer");

// ─────────────────────────────────────────────────────────────
// Helper: Create Tickets
// ─────────────────────────────────────────────────────────────
const createTicketsForEvent = async ({ eventId, user, quantity = 1 }) => {
  // 1. Check event exists
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error("Event not found");
    err.status = 404;
    throw err;
  }

  // 2. Check event not expired
  if (new Date(event.date) < new Date()) {
    const err = new Error("This event has already passed");
    err.status = 400;
    throw err;
  }

  // 3. Free event restriction
  if (event.price === 0) {
    const alreadyBooked = await Ticket.findOne({
      event: eventId,
      user: user._id,
    });

    if (alreadyBooked) {
      const err = new Error("Free events allow only 1 ticket per student");
      err.status = 400;
      throw err;
    }
  }

  // 4. Quantity check
  const qty = event.price > 0 ? quantity : 1;

  if (qty < 1 || qty > 10) {
    const err = new Error("Quantity must be between 1 and 10");
    err.status = 400;
    throw err;
  }

  // 5. Capacity check
  const bookedCount = await Ticket.countDocuments({ event: eventId });

  if (bookedCount + qty > event.capacity) {
    const err = new Error(
      `Only ${event.capacity - bookedCount} seats remaining`
    );
    err.status = 400;
    throw err;
  }

  // 6. Create tickets
  const tickets = [];

  for (let i = 0; i < qty; i++) {
    const ticket = await Ticket.create({
      event: eventId,
      user: user._id,
      qrCode: "pending",
    });

    const qrData = generateQRData(ticket._id.toString());
    const qrCode = await generateQR(qrData);

    ticket.qrData = qrData;
    ticket.qrCode = qrCode;

    await ticket.save();
    tickets.push(ticket);
  }

  // 7. Update seats
  event.availableSeats = event.capacity - (bookedCount + qty);
  await event.save();

  // 8. Populate tickets
  const populatedTickets = await Ticket.find({
    _id: { $in: tickets.map(t => t._id) },
  }).populate("event", "title date venue price");

  // 9. Send email
  try {
    await sendBookingConfirmation({
      to: user.email,
      studentName: user.name,
      event,
      ticket: tickets[0],
    });
  } catch (e) {
    console.error("Email failed:", e.message);
  }

  return populatedTickets;
};

// ─────────────────────────────────────────────────────────────
// Controller: Book Ticket
// ─────────────────────────────────────────────────────────────
const bookTicket = async (req, res, next) => {
  try {
    const quantity = Number(req.body.quantity) || 1;

    const result = await createTicketsForEvent({
      eventId: req.params.eventId,
      user: req.user,
      quantity,
    });

    res.status(201).json(result);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "You have already booked this event",
      });
    }

    if (err.status) {
      return res.status(err.status).json({
        message: err.message,
      });
    }

    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// Controller: Get My Tickets
// ─────────────────────────────────────────────────────────────
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate("event", "title date venue price")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// Controller: Get Ticket by ID
// ─────────────────────────────────────────────────────────────
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("event", "title date venue price")
      .populate("user", "name email");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to view this ticket",
      });
    }

    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// Controller: Scan Ticket
// ─────────────────────────────────────────────────────────────
const scanTicket = async (req, res, next) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        message: "qrData is required",
      });
    }

    const ticket = await Ticket.findOne({ qrData })
      .populate("event", "title date venue")
      .populate("user", "name email");

    if (!ticket) {
      return res.status(404).json({
        result: "invalid",
        message: "Invalid ticket — QR code not recognised",
      });
    }

    if (ticket.status === "used") {
      return res.status(400).json({
        result: "already_used",
        message: "Ticket already used",
        scannedAt: ticket.scannedAt,
      });
    }

    if (ticket.status === "cancelled") {
      return res.status(400).json({
        result: "cancelled",
        message: "This ticket has been cancelled",
      });
    }

    ticket.status = "used";
    ticket.scannedAt = new Date();
    await ticket.save();

    res.json({
      result: "valid",
      message: "Entry allowed",
      ticket: {
        id: ticket._id,
        studentName: ticket.user?.name,
        studentEmail: ticket.user?.email,
        eventTitle: ticket.event?.title,
        eventVenue: ticket.event?.venue,
        eventDate: ticket.event?.date,
        scannedAt: ticket.scannedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────
module.exports = {
  createTicketsForEvent,
  bookTicket,
  getMyTickets,
  getTicketById,
  scanTicket,
};