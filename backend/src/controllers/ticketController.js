const Ticket = require("../models/Ticket");
const Event  = require("../models/Event");
const { generateQR, generateQRData }    = require("../utils/qrHelper");
const { sendBookingConfirmation }        = require("../utils/mailer");

// ─────────────────────────────────────────────────────────────
// Shared internal helper — used by bookTicket AND confirmOrder
// Performs all validation, creates tickets, syncs seats, sends email.
// Throws on error so callers can handle via try/catch.
// ─────────────────────────────────────────────────────────────
const createTicketsForEvent = async ({ eventId, user, quantity = 1 }) => {
  // 1. Check event exists
  const event = await Event.findById(eventId);
  if (!event) throw Object.assign(new Error("Event not found"), { status: 404 });

  // 2. Check event hasn't passed
  if (new Date(event.date) < new Date())
    throw Object.assign(new Error("This event has already passed"), { status: 400 });

  // 3. Free event → only 1 ticket per student
  if (event.price === 0) {
    const alreadyBooked = await Ticket.findOne({ event: eventId, user: user._id });
    if (alreadyBooked)
      throw Object.assign(new Error("Free events allow only 1 ticket per student"), { status: 400 });
  }

  // 4. Resolve quantity and check capacity
  const qty = event.price > 0 ? quantity : 1;
  if (qty < 1 || qty > 10)
    throw Object.assign(new Error("Quantity must be between 1 and 10"), { status: 400 });

  const bookedCount = await Ticket.countDocuments({ event: eventId });
  if (bookedCount + qty > event.capacity)
    throw Object.assign(
      new Error(`Only ${event.capacity - bookedCount} seats remaining`),
      { status: 400 }
    );

  // 5. Create all tickets
  const tickets = [];
  for (let i = 0; i < qty; i++) {
    const ticket = await Ticket.create({ event: eventId, user: user._id, qrCode: "pending" });
    const qrData = generateQRData(ticket._id.toString());
    const qrCode = await generateQR(qrData);
    ticket.qrData = qrData;
    ticket.qrCode = qrCode;
    await ticket.save();
    tickets.push(ticket);
  }

  // 6. Sync availableSeats
  event.availableSeats = event.capacity - (bookedCount + qty);
  await event.save();

  const populated = await Ticket.find({ _id: { $in: tickets.map(t => t._id) } })
    .populate("event", "title date venue price");

  // 7. Send confirmation email — fire and forget
  sendBookingConfirmation({
    to:          user.email,
    studentName: user.name,
    event,
    ticket:      tickets[0],
  }).catch((err) => console.warn("Email failed:", err.message));

  return qty === 1 ? populated[0] : populated;
};

// @desc   Book a ticket for an event (direct — free events and legacy path)
// @route  POST /api/tickets/book/:eventId
// @access Private
const bookTicket = async (req, res, next) => {
  try {
    const quantity = Number(req.body.quantity) || 1;
    const result = await createTicketsForEvent({
      eventId:  req.params.eventId,
      user:     req.user,
      quantity,
    });
    res.status(201).json(result);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "You have already booked this event" });
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

module.exports.createTicketsForEvent = createTicketsForEvent;

// @desc   Get all tickets for logged-in user
// @route  GET /api/tickets/my
// @access Private
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

// @desc   Get single ticket by ID
// @route  GET /api/tickets/:id
// @access Private — owner only
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("event", "title date venue price")
      .populate("user", "name email");

    if (!ticket)
      return res.status(404).json({ message: "Ticket not found" });

    if (ticket.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized to view this ticket" });

    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

// @desc   Scan and verify a ticket by qrData
// @route  POST /api/tickets/scan
// @access Private — organizer only
const scanTicket = async (req, res, next) => {
  try {
    const { qrData } = req.body;

    if (!qrData)
      return res.status(400).json({ message: "qrData is required" });

    // Look up ticket by the unique qrData string encoded in the QR
    const ticket = await Ticket.findOne({ qrData })
      .populate("event", "title date venue")
      .populate("user",  "name email");

    // Case 1 — QR not found in DB → invalid / tampered
    if (!ticket)
      return res.status(404).json({
        result:   "invalid",
        message:  "Invalid ticket — QR code not recognised",
      });

    // Case 2 — Already scanned
    if (ticket.status === "used")
      return res.status(400).json({
        result:   "already_used",
        message:  "Ticket already used",
        scannedAt: ticket.scannedAt,
        ticket: {
          studentName:  ticket.user?.name,
          studentEmail: ticket.user?.email,
          eventTitle:   ticket.event?.title,
        },
      });

    // Case 3 — Cancelled
    if (ticket.status === "cancelled")
      return res.status(400).json({
        result:  "cancelled",
        message: "This ticket has been cancelled",
      });

    // Case 4 — Valid → mark as used
    ticket.status    = "used";
    ticket.scannedAt = new Date();
    await ticket.save();

    res.json({
      result:  "valid",
      message: "Entry allowed",
      ticket: {
        id:           ticket._id,
        studentName:  ticket.user?.name,
        studentEmail: ticket.user?.email,
        eventTitle:   ticket.event?.title,
        eventVenue:   ticket.event?.venue,
        eventDate:    ticket.event?.date,
        scannedAt:    ticket.scannedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { bookTicket, getMyTickets, getTicketById, scanTicket, createTicketsForEvent };
