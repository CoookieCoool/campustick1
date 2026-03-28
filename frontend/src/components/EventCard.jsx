import { Link } from "react-router-dom";

export default function EventCard({ event, isPast }) {
  const seatsLeft = event.availableSeats ?? event.capacity;
  const isSoldOut = seatsLeft === 0;

  return (
    <div style={{ ...styles.card, ...(isPast ? styles.pastCard : {}) }}>
      <div style={styles.top}>
        <h3 style={styles.title}>{event.title}</h3>
        {!isPast && isSoldOut && <span style={styles.soldOut}>Sold Out</span>}
        {isPast && <span style={styles.pastBadge}>Ended</span>}
      </div>
      <p style={styles.meta}>📅 {new Date(event.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      <p style={styles.meta}>📍 {event.venue}</p>
      {!isPast && <p style={styles.meta}>🎟 {seatsLeft} / {event.capacity} seats left</p>}
      {event.createdBy && <p style={styles.meta}>👤 {event.createdBy.name}</p>}
      <p style={{ ...styles.price, ...(isPast ? { color: "#94a3b8" } : {}) }}>
        {event.price === 0 ? "🆓 Free" : `₹${event.price}`}
      </p>
      {isPast ? (
        <Link to={`/events/${event._id}`} style={styles.pastBtn}>View Details</Link>
      ) : (
        <Link to={`/events/${event._id}`} style={{ ...styles.btn, opacity: isSoldOut ? 0.6 : 1 }}>
          View Details
        </Link>
      )}
    </div>
  );
}

const styles = {
  card:      { background: "#fff", border: "1px solid #e8edf3", borderRadius: "16px", padding: "1.35rem", display: "flex", flexDirection: "column", gap: "0.45rem", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", transition: "transform 0.18s ease, box-shadow 0.18s ease" },
  pastCard:  { background: "#f8fafc", borderColor: "#e8edf3", boxShadow: "none", opacity: 0.8 },
  top:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.2rem" },
  title:     { margin: 0, fontSize: "1.05rem", fontWeight: "700", lineHeight: 1.35, color: "#1a1a2e" },
  soldOut:   { fontSize: "0.68rem", background: "#fee2e2", color: "#b91c1c", padding: "0.2rem 0.55rem", borderRadius: "20px", whiteSpace: "nowrap", fontWeight: "600" },
  pastBadge: { fontSize: "0.68rem", background: "#f1f5f9", color: "#94a3b8", padding: "0.2rem 0.55rem", borderRadius: "20px", whiteSpace: "nowrap", fontWeight: "600" },
  meta:      { margin: 0, color: "#6b7280", fontSize: "0.84rem" },
  price:     { fontWeight: "700", color: "#6366f1", fontSize: "1rem", marginTop: "0.25rem" },
  btn:       { marginTop: "0.75rem", background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", color: "#fff", padding: "0.6rem 1rem", borderRadius: "10px", textDecoration: "none", textAlign: "center", fontSize: "0.9rem", fontWeight: "600", boxShadow: "0 3px 10px rgba(99,102,241,0.3)", transition: "box-shadow 0.15s, transform 0.15s", display: "block" },
  pastBtn:   { marginTop: "0.75rem", background: "#f1f5f9", color: "#94a3b8", padding: "0.6rem 1rem", borderRadius: "10px", textDecoration: "none", textAlign: "center", fontSize: "0.9rem", fontWeight: "600", display: "block" },
};
