const express = require("express");
const { createOrder, confirmOrder, getOrder } = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All order routes require authentication
router.post("/create/:eventId",    protect, createOrder);
router.post("/confirm/:orderId",   protect, confirmOrder);
router.get("/:orderId",            protect, getOrder);

module.exports = router;
