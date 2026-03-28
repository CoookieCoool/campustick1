const Event = require("../models/Event");

// @desc   Get all events (public)
// @route  GET /api/events
const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "name email")
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    next(err);
  }
};

// @desc   Get events created by logged-in organizer
// @route  GET /api/events/my
const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ createdBy: req.user._id }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    next(err);
  }
};

// @desc   Get single event by ID (public)
// @route  GET /api/events/:id
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate("createdBy", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    next(err);
  }
};

// @desc   Create a new event
// @route  POST /api/events
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, venue, price, capacity } = req.body;

    if (!title || !description || !date || !venue || !capacity)
      return res.status(400).json({ message: "title, description, date, venue and capacity are required" });

    if (new Date(date) < new Date())
      return res.status(400).json({ message: "Event date must be in the future" });

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      price: price || 0,
      capacity,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

// @desc   Update an event (owner only)
// @route  PUT /api/events/:id
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Only the creator or admin can update
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized to update this event" });

    const allowed = ["title", "description", "date", "venue", "price", "capacity"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    const updated = await event.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// @desc   Delete an event (owner only)
// @route  DELETE /api/events/:id
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized to delete this event" });

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllEvents, getMyEvents, getEventById, createEvent, updateEvent, deleteEvent };
