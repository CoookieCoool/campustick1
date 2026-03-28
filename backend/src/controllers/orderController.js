const Order  = require("../models/Order");
const Event  = require("../models/Event");
const { createTicketsForEvent } = require("./ticketController");

// @desc   Create a pending order for a paid event
// @route  POST /api/orders/create/:eventId
// @access Private
const createOrder = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const quantity    = Math.max(1, Math.min(10, Number(req.body.quantity) || 1));

    const event = await Event.findById(eventId);
    if (!event)
      return res.status(404).json({ message: "Event not found" });

    if (new Date(event.date) < new Date())
      return res.status(400).json({ message: "This event has already passed" });

    // Orders are only meaningful for paid events.
    // Free events still use the direct /tickets/book route.
    if (event.price === 0)
      return res.status(400).json({ message: "Free events do not require an order. Use direct booking." });

    const order = await Order.create({
      user:     req.user._id,
      event:    eventId,
      quantity,
      amount:   event.price * quantity,
      status:   "pending",
    });

    res.status(201).json({
      orderId:   order._id,
      eventId:   event._id,
      eventTitle: event.title,
      venue:     event.venue,
      date:      event.date,
      quantity,
      amount:    order.amount,
      status:    order.status,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Confirm a pending order and create ticket(s)
// @route  POST /api/orders/confirm/:orderId
// @access Private
const confirmOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("event");

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    // Only the order owner can confirm
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized to confirm this order" });

    if (order.status === "paid")
      return res.status(400).json({ message: "Order already paid" });

    if (order.status === "failed")
      return res.status(400).json({ message: "Order has failed and cannot be confirmed" });

    // Mark order as paid first
    order.status = "paid";
    await order.save();

    // Reuse the shared ticket creation helper — zero duplication
    let tickets;
    try {
      tickets = await createTicketsForEvent({
        eventId:  order.event._id,
        user:     req.user,
        quantity: order.quantity,
      });
    } catch (ticketErr) {
      // If ticket creation fails, roll the order back to failed
      order.status = "failed";
      await order.save();
      const status = ticketErr.status || 400;
      return res.status(status).json({ message: ticketErr.message });
    }

    res.status(201).json({
      message: "Payment successful. Ticket(s) created.",
      orderId: order._id,
      tickets,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get a single order by ID (owner only)
// @route  GET /api/orders/:orderId
// @access Private
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("event", "title date venue price");

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized to view this order" });

    res.json(order);
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, confirmOrder, getOrder };
