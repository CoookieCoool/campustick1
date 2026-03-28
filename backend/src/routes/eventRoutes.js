const express = require("express");
const {
  getAllEvents,
  getMyEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const protect = require("../middleware/authMiddleware");
const authorizeOrganizer = require("../middleware/authorizeOrganizer");

const router = express.Router();

// Public
router.get("/", getAllEvents);

// Protected — organizer only
// NOTE: /my must come before /:id so Express doesn't treat "my" as an id
router.get("/my", protect, getMyEvents);
router.post("/", protect, authorizeOrganizer, createEvent);

// Public single event
router.get("/:id", getEventById);

// Protected — owner only (ownership checked inside controller)
router.put("/:id", protect, authorizeOrganizer, updateEvent);
router.delete("/:id", protect, authorizeOrganizer, deleteEvent);

module.exports = router;
