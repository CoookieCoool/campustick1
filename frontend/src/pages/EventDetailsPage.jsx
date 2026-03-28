import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { eventService, ticketService, orderService } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event,    setEvent]   = useState(null);
  const [loading,  setLoading] = useState(true);
  const [booking,  setBooking] = useState(false);
  const [error,    setError]   = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    eventService.getById(id)
      .then(setEvent)
      .catch(() => setError("Failed to load event"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user) return navigate("/login");
    setBooking(true);
    setError("");
    try {
      if (event.price > 0) {
        // Paid event → create order and go to payment page
        const order = await orderService.create(id, quantity);
        navigate(`/payment/${order.orderId}`);
      } else {
        // Free event → direct booking (unchanged legacy path)
        const result = await ticketService.book(id, 1);
        const ticketId = Array.isArray(result) ? null : result._id;
        navigate(ticketId ? `/tickets/${ticketId}` : "/tickets");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
      setBooking(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "3rem", color: "#666" }}>Just a sec…</p>;
  if (error)   return <p style={{ textAlign: "center", marginTop: "3rem", color: "#c0392b" }}>Couldn't load this event. Try again.</p>;
  if (!event)  return <p style={{ textAlign: "center", marginTop: "3rem", color: "#666" }}>Event not found.</p>;

  const eventDate = new Date(event.date);
  const now       = new Date();
  const isPast    = eventDate.getTime() <= now.getTime();
  const soldOut   = event.availableSeats === 0;
  const canBook   = eventDate.getTime() > now.getTime() && !soldOut && user?.role === "student";

  return (
    <div style={styles.container}>
      {/* Back link */}
      <Link to="/events" style={styles.back}>← Back to events</Link>

      {/* Event header */}
      <div style={styles.header}>
        <h2 style={styles.title}>{event.title}</h2>
        {isPast  && <span style={{ ...styles.tag, background: "#f1f5f9", color: "#64748b" }}>Past Event</span>}
        {soldOut && !isPast && <span style={{ ...styles.tag, background: "#fee2e2", color: "#b91c1c" }}>Sold Out</span>}
        {!soldOut && !isPast && <span style={{ ...styles.tag, background: "#dcfce7", color: "#166534" }}>Open</span>}
      </div>

      <p style={styles.description}>{event.description}</p>

      {/* Details grid */}
      <div style={styles.detailGrid}>
        <Detail icon="📅" label="Date & Time" value={new Date(event.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} />
        <Detail icon="📍" label="Venue"       value={event.venue} />
        <Detail icon="🎟" label="Seats Left"  value={`${event.availableSeats} / ${event.capacity}`} />
        <Detail icon="💰" label="Price"       value={event.price === 0 ? "Free" : `₹${event.price}`} />
        {event.createdBy && (
          <Detail icon="👤" label="Organizer" value={event.createdBy.name} />
        )}
      </div>

      {/* Quantity selector — only for paid events */}
      {user?.role === "student" && !isPast && !soldOut && event.price > 0 && (
        <div style={styles.qtyRow}>
          <label style={styles.qtyLabel}>Quantity</label>
          <div style={styles.qtyControl}>
            <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} style={styles.qtyBtn}>−</button>
            <span style={styles.qtyNum}>{quantity}</span>
            <button type="button" onClick={() => setQuantity(q => Math.min(10, q + 1))} style={styles.qtyBtn}>+</button>
          </div>
          <span style={styles.qtyTotal}>Total: ₹{event.price * quantity}</span>
        </div>
      )}

      {/* Error */}
      {error && <div style={styles.error}>{error}</div>}

      {/* Booking button */}
      {!user && (
        <div style={styles.loginPrompt}>
          <Link to="/login" style={styles.bookBtn}>Sign in to book a ticket</Link>
        </div>
      )}

      {user?.role === "student" && (
        <button
          onClick={handleBook}
          disabled={booking || !canBook}
          style={{ ...styles.bookBtn, opacity: canBook ? 1 : 0.5, cursor: canBook ? "pointer" : "not-allowed" }}
        >
          {booking ? "Grabbing your spot…" : isPast ? "Event Ended" : soldOut ? "Sold Out" : "🎟 Grab a Ticket"}
        </button>
      )}

      {user?.role === "organizer" && (
        <p style={styles.orgNote}>You're viewing this as an organizer.</p>
      )}
    </div>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div style={styles.detailItem}>
      <span style={styles.detailIcon}>{icon}</span>
      <div>
        <div style={styles.detailLabel}>{label}</div>
        <div style={styles.detailValue}>{value}</div>
      </div>
    </div>
  );
}

const styles = {
  container:    { maxWidth: "640px", margin: "2rem auto", padding: "0 1rem" },
  back:         { color: "#e94560", textDecoration: "none", fontSize: "0.9rem" },
  header:       { display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", margin: "1rem 0 0.5rem" },
  title:        { margin: 0, fontSize: "1.5rem", fontWeight: "700" },
  tag:          { padding: "0.25rem 0.7rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "600" },
  description:  { color: "#444", lineHeight: 1.6, margin: "0.75rem 0 1.5rem" },
  detailGrid:   { display: "flex", flexDirection: "column", gap: "0.75rem", background: "#f8fafc", borderRadius: "10px", padding: "1.25rem", marginBottom: "1.5rem" },
  detailItem:   { display: "flex", alignItems: "flex-start", gap: "0.75rem" },
  detailIcon:   { fontSize: "1.1rem", marginTop: "0.1rem" },
  detailLabel:  { fontSize: "0.75rem", color: "#888", fontWeight: "600", textTransform: "uppercase" },
  detailValue:  { fontSize: "0.95rem", color: "#1a1a2e", fontWeight: "500" },
  error:        { background: "#fff0f0", color: "#c0392b", padding: "0.7rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem" },
  bookBtn:      { display: "block", width: "100%", padding: "0.85rem", background: "#e94560", color: "#fff", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: "700", textAlign: "center", textDecoration: "none", boxSizing: "border-box" },
  qtyRow:     { display: "flex", alignItems: "center", gap: "1rem", background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", flexWrap: "wrap" },
  qtyLabel:   { fontWeight: "600", fontSize: "0.9rem", color: "#333" },
  qtyControl: { display: "flex", alignItems: "center", gap: "0.75rem" },
  qtyBtn:     { width: "30px", height: "30px", borderRadius: "50%", border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" },
  qtyNum:     { fontWeight: "700", fontSize: "1.1rem", minWidth: "20px", textAlign: "center" },
  qtyTotal:   { marginLeft: "auto", fontWeight: "700", color: "#e94560", fontSize: "0.95rem" },
  orgNote:      { color: "#888", fontSize: "0.88rem", textAlign: "center", marginTop: "0.5rem" },
};
