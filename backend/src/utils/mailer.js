import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendBookingConfirmation = async ({
  to,
  studentName,
  event,
  ticket,
}) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    if (!to || !event || !ticket) {
      throw new Error("Missing required fields");
    }

    const eventDate = event?.date
      ? new Date(event.date).toLocaleString("en-IN", {
          dateStyle: "long",
          timeStyle: "short",
        })
      : "Date not available";

    const html = `
      <h2>Hello ${studentName || "Guest"} 👋</h2>
      <p>Your ticket is confirmed!</p>

      <h3>${event?.title || "Event"}</h3>
      <p>📅 ${eventDate}</p>
      <p>📍 ${event?.venue || "Venue not specified"}</p>
      <p>🎫 Ticket ID: ${ticket?._id || "N/A"}</p>

      <p>Please show your QR from dashboard at entry.</p>
    `;

    await resend.emails.send({
      from: "CampusTick <onboarding@resend.dev>",
      to: [to],
      subject: `🎟 Booking Confirmed — ${event?.title || "Your Event"}`,
      html,
    });

    console.log("✅ Email sent");
  } catch (err) {
    console.error("❌ Email error:", err);
  }
};