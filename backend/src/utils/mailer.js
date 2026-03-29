// const nodemailer = require("nodemailer");

// // Create reusable transporter
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// });

// // Verify connection on startup (logs warning if credentials are wrong)
// console.log("MAIL USER:", process.env.MAIL_USER);
// console.log("MAIL PASS:", process.env.MAIL_PASS ? "EXISTS" : "MISSING");
// transporter.verify((err) => {
//   if (err) console.warn("⚠️  Mailer not connected:", err.message);
//   else     console.log("✅  Mailer ready:", process.env.MAIL_USER);
// });

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendBookingConfirmation = async ({ to, studentName, event, ticket }) => {
  try {
    await resend.emails.send({
      from: "CampusTick <onboarding@resend.dev>",
      to: [to],
      subject: "🎟️ Booking Confirmed",
      html: `<h2>Hello ${studentName}</h2>
             <p>Your ticket is confirmed for ${event.title}</p>`,
    });

    console.log("✅ Email sent");
  } catch (err) {
    console.error("❌ Email error:", err);
  }
};

// Send booking confirmation email with QR code embedded
const sendBookingConfirmation = async ({ to, studentName, event, ticket }) => {
  const eventDate = new Date(event.date).toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:2rem 1rem;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0"
              style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:#1a1a2e;padding:1.5rem 2rem;">
                  <h1 style="margin:0;color:#e94560;font-size:1.4rem;">🎟 CampusTick</h1>
                  <p style="margin:0.25rem 0 0;color:#94a3b8;font-size:0.85rem;">Booking Confirmation</p>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding:1.5rem 2rem 0.5rem;">
                  <h2 style="margin:0;font-size:1.1rem;color:#1a1a2e;">Hi ${studentName} 👋</h2>
                  <p style="color:#555;margin:0.5rem 0 0;font-size:0.95rem;">
                    Your ticket has been confirmed! Here are your booking details.
                  </p>
                </td>
              </tr>

              <!-- Event details box -->
              <tr>
                <td style="padding:1rem 2rem;">
                  <table width="100%" cellpadding="0" cellspacing="0"
                    style="background:#f8fafc;border-radius:8px;padding:1rem;border:1px solid #e2e8f0;">
                    <tr>
                      <td style="padding:0.4rem 0;">
                        <span style="font-size:0.75rem;color:#888;font-weight:700;text-transform:uppercase;">Event</span><br/>
                        <span style="font-size:1rem;font-weight:700;color:#1a1a2e;">${event.title}</span>
                      </td>
                    </tr>
                    <tr><td style="border-top:1px solid #e2e8f0;padding:0.4rem 0;">
                      <span style="font-size:0.75rem;color:#888;font-weight:700;text-transform:uppercase;">Date & Time</span><br/>
                      <span style="font-size:0.95rem;color:#333;">📅 ${eventDate}</span>
                    </td></tr>
                    <tr><td style="border-top:1px solid #e2e8f0;padding:0.4rem 0;">
                      <span style="font-size:0.75rem;color:#888;font-weight:700;text-transform:uppercase;">Venue</span><br/>
                      <span style="font-size:0.95rem;color:#333;">📍 ${event.venue}</span>
                    </td></tr>
                    <tr><td style="border-top:1px solid #e2e8f0;padding:0.4rem 0;">
                      <span style="font-size:0.75rem;color:#888;font-weight:700;text-transform:uppercase;">Price</span><br/>
                      <span style="font-size:0.95rem;color:#e94560;font-weight:700;">
                        ${event.price === 0 ? "🆓 Free" : `₹${event.price}`}
                      </span>
                    </td></tr>
                    <tr><td style="border-top:1px solid #e2e8f0;padding:0.4rem 0;">
                      <span style="font-size:0.75rem;color:#888;font-weight:700;text-transform:uppercase;">Ticket ID</span><br/>
                      <span style="font-size:0.8rem;color:#555;font-family:monospace;">${ticket._id}</span>
                    </td></tr>
                  </table>
                </td>
              </tr>

              <!-- QR Code -->
              <tr>
                <td style="padding:0.5rem 2rem 1rem;text-align:center;">
                  <p style="font-weight:700;color:#1a1a2e;margin:0 0 0.75rem;">Your Entry QR Code</p>
                  <img src="cid:qrcode@campustick" alt="QR Code"
                    style="width:180px;height:180px;border:4px solid #1a1a2e;border-radius:8px;" />
                  <p style="font-size:0.78rem;color:#888;margin:0.5rem 0 0;">
                    Show this QR to the organizer at the entry gate
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;padding:1rem 2rem;border-top:1px solid #e2e8f0;text-align:center;">
                  <p style="margin:0;font-size:0.78rem;color:#aaa;">
                    This is an automated email from CampusTick. Please do not reply.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Extract base64 data from the data URL (strip the "data:image/png;base64," prefix)
  const base64Data = ticket.qrCode.replace(/^data:image\/png;base64,/, "");

  await transporter.sendMail({
    from:    process.env.MAIL_FROM,
    to,
    subject: `🎟 Booking Confirmed — ${event.title}`,
    html,
    attachments: [{
      filename:    "qrcode.png",
      content:     base64Data,
      encoding:    "base64",
      cid:         "qrcode@campustick",
    }],
  });
};

module.exports = { sendBookingConfirmation };
