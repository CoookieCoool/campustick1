const QRCode = require("qrcode");
const crypto = require("crypto");

// Generate a unique unguessable string to embed in the QR
// Format: CT-<ticketId>-<randomHex>
const generateQRData = (ticketId) => {
  const random = crypto.randomBytes(8).toString("hex");
  return `CT-${ticketId}-${random}`;
};

// Generate base64 QR image from any string
const generateQR = async (data) => {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 300,
  });
};

module.exports = { generateQR, generateQRData };
