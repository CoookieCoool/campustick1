import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendBookingConfirmation = async ({ to, studentName, event, ticket }) => {
  try {
    const eventDate = new Date(event.date).toLocaleString("en-IN", {
      dateStyle: "long",
      timeStyle: "short",
    });

    const html = `
      <h2>Hello ${studentName} 👋</h2>
      <p>Your ticket is confirmed!</p>

      <h3>${event.title}</h3>
      <p>📅 ${eventDate}</p>
      <p>📍 ${event.venue}</p>
      <p>🎫 Ticket ID: ${ticket._id}</p>

      <p>Please show your QR from dashboard at entry.</p>
    `;

    await resend.emails.send({
      from: "CampusTick <onboarding@resend.dev>",
      to: [to],
      subject: `🎟 Booking Confirmed — ${event.title}`,
      html: html,
    });

    console.log("✅ Email sent");
  } catch (err) {
    console.error("❌ Email error:", err);
  }
};