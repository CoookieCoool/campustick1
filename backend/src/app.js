const express = require("express");
const cors = require("cors");

const authRoutes   = require("./routes/authRoutes");
const eventRoutes  = require("./routes/eventRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const orderRoutes  = require("./routes/orderRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/api/auth",    authRoutes);
app.use("/api/events",  eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/orders",  orderRoutes);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
