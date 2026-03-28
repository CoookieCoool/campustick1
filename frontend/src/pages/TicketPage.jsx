import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ticketService } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const STATUS_STYLE = {
  valid:     { cls: "badge valid",     label: "🟢 Valid" },
  used:      { cls: "badge used",      label: "✅ Used"  },
  cancelled: { cls: "badge cancelled", label: "❌ Cancelled" },
};

export default function TicketPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const location = useLocation();
  const successMessage = location.state?.successMessage || "";

  useEffect(() => {
    ticketService.getMyTickets()
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => setError("Something went wrong. Could not load your tickets."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error)   return <p style={{ textAlign: "center", marginTop: "3rem", color: "#c0392b" }}>{error}</p>;

  const valid = tickets.filter((t) => t.event !== null && t.status === "valid");
  const past  = tickets.filter((t) => t.event !== null && t.status !== "valid");
  const hasAny = valid.length > 0 || past.length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>My Tickets</h2>
        <span style={styles.count}>{tickets.length} total</span>
      </div>

      {successMessage && (
        <div style={styles.success}>{successMessage}</div>
      )}

      {!hasAny ? (
        <div style={styles.empty}>
          <span style={styles.emptyIcon}>🎟</span>
          <h2 style={styles.emptyHeading}>No Tickets Yet</h2>
          <p style={styles.emptySub}>You haven't booked any events yet. Browse what's on and grab your spot.</p>
          <Link to="/events" style={styles.browseBtn}>Browse Events</Link>
        </div>
      ) : (
        <>
          {valid.length > 0 && (
            <Section title="Upcoming">
              {valid.map((t) => <TicketCard key={t._id} ticket={t} />)}
            </Section>
          )}
          {past.length > 0 && (
            <Section title="Past / Used">
              {past.map((t) => <TicketCard key={t._id} ticket={t} />)}
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function TicketCard({ ticket }) {
  const status = STATUS_STYLE[ticket.status] || STATUS_STYLE.valid;
  return (
    <Link to={`/tickets/${ticket._id}`} style={styles.cardLink}>
      <div style={styles.card}>
        <div style={styles.cardLeft}>
          <span style={styles.eventName}>{ticket.event?.title || "Event"}</span>
          <span style={styles.meta}>
            📅 {ticket.event?.date ? new Date(ticket.event.date).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "N/A"}
          </span>
          <span style={styles.meta}>📍 {ticket.event?.venue || "N/A"}</span>
        </div>
        <div style={styles.cardRight}>
          <span className={status.cls}>{status.label}</span>
          <span style={styles.viewLink}>View →</span>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  container:    { maxWidth: "640px", margin: "2.5rem auto", padding: "0 1.5rem" },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  count:        { fontSize: "0.85rem", color: "#475569" },
  success:      { background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)", padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1rem", fontWeight: "600", fontSize: "0.9rem" },
  sectionTitle: { fontSize: "0.75rem", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.75rem" },
  empty:        { textAlign: "center", marginTop: "6rem", padding: "0 1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.85rem", opacity: 0.92, animation: "fadeIn 0.6s ease" },
  emptyIcon:    { fontSize: "3.5rem", lineHeight: 1, marginBottom: "0.25rem" },
  emptyHeading: { fontSize: "1.5rem", fontWeight: "700", color: "#f1f5f9", margin: 0, letterSpacing: "-0.02em" },
  emptySub:     { fontSize: "0.95rem", color: "#64748b", maxWidth: "320px", lineHeight: 1.6, margin: 0 },
  browseBtn:    { marginTop: "0.5rem", padding: "0.75rem 2rem", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", borderRadius: "12px", textDecoration: "none", fontWeight: "700", fontSize: "0.97rem", boxShadow: "0 4px 18px rgba(99,102,241,0.4)", transition: "transform 0.18s ease, box-shadow 0.18s ease", display: "inline-block" },
  cardLink:     { textDecoration: "none", display: "block", marginBottom: "0.75rem" },
  card:         { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)", transition: "border-color 0.15s, box-shadow 0.15s" },
  cardLeft:     { display: "flex", flexDirection: "column", gap: "0.3rem" },
  eventName:    { fontWeight: "700", color: "#f1f5f9", fontSize: "0.97rem" },
  meta:         { fontSize: "0.82rem", color: "#64748b" },
  cardRight:    { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" },
  viewLink:     { fontSize: "0.8rem", color: "#818cf8", fontWeight: "600" },
};
