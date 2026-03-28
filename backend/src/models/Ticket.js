const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    qrData: {
      type: String,   // unique string encoded inside the QR image
      unique: true,
      sparse: true,   // allows null during creation before it's set
    },
    qrCode: {
      type: String,   // base64 data URL — the actual QR image shown to student
      required: true,
    },
    status: {
      type: String,
      enum: ["valid", "used", "cancelled"],
      default: "valid",
    },
    scannedAt: {
      type: Date,     // timestamp when organizer scanned it
    },
  },
  { timestamps: true }
);

// Note: no unique index on event+user — paid events allow multiple tickets per student
// Free event duplicate check is handled in the controller

module.exports = mongoose.model("Ticket", ticketSchema);
