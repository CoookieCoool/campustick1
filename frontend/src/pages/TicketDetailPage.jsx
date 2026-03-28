import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ticketService } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const STATUS_STYLE = {
  valid:     { background: "#dcfce7", color: "#166534", label: "🟢 Valid" },
  used:      { background: "#f1f5f9", color: "#64748b", label: "✅ Used"  },
  cancelled: { background: "#fee2e2", color: "#b91c1c", label: "❌ Cancelled" },
};

export default function TicketDetailPage() {
  const { id } = useParams();
  const [ticket,  setTicket]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    ticketService.getById(id)
      .then(setTicket)
      .catch(() => setError("Couldn't find this ticket. It may have been removed."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error)   return <p style={{ textAlign: "center", color: "red", marginTop: "3rem" }}>{error}</p>;
  if (!ticket) return null;

  const status = STATUS_STYLE[ticket.status] || STATUS_STYLE.valid;

  return (
    <div style={styles.container}>
      <Link to="/tickets" style={styles.back}>← My tickets</Link>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.cardHeader}>
          <h2 style={styles.eventTitle}>{ticket.event?.title}</h2>
          <span style={{ ...styles.badge, background: status.background, color: status.color }}>
            {status.label}
          </span>
        </div>

        {/* Event details */}
        <div style={styles.detailGrid}>
          <Row label="📅 Date"    value={ticket.event?.date ? new Date(ticket.event.date).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" }) : "N/A"} />
          <Row label="📍 Venue"   value={ticket.event?.venue} />
          <Row label="💰 Price"   value={ticket.event?.price === 0 ? "Free" : `₹${ticket.event?.price}`} />
          <Row label="👤 Booked by" value={ticket.user?.name} />
          <Row label="📧 Email"   value={ticket.user?.email} />
          <Row label="🗓 Booked on" value={new Date(ticket.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })} />
        </div>

        {/* Ticket ID */}
        <div style={styles.idBox}>
          <span style={styles.idLabel}>Ticket ID</span>
          <span style={styles.idValue}>{ticket._id}</span>
        </div>

        {/* QR Code */}
        {ticket.qrCode && ticket.status === "valid" && (
          <div style={styles.qrSection}>
            <p style={styles.qrTitle}>Your entry QR code</p>
            <img src={ticket.qrCode} alt="QR Code" style={styles.qrImg} />
            <p style={styles.qrHint}>Show this to the organizer at the door 👋</p>
          </div>
        )}

        {ticket.status === "used" && (
          <div style={styles.usedBanner}>
            ✅ All done — this ticket was scanned at the gate
          </div>
        )}

        {ticket.status === "cancelled" && (
          <div style={styles.cancelledBanner}>
            ❌ This ticket has been cancelled
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.rowValue}>{value || "N/A"}</span>
    </div>
  );
}

const styles = {
  container:       { maxWidth: "480px", margin: "2rem auto", padding: "0 1rem" },
  back:            { color: "#e94560", textDecoration: "none", fontSize: "0.9rem" },
  card:            { marginTop: "1rem", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden" },
  cardHeader:      { background: "#1a1a2e", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" },
  eventTitle:      { margin: 0, color: "#fff", fontSize: "1.1rem", fontWeight: "700" },
  badge:           { padding: "0.3rem 0.75rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "700", whiteSpace: "nowrap" },
  detailGrid:      { padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.6rem", borderBottom: "1px solid #f1f5f9" },
  row:             { display: "flex", justifyContent: "space-between", gap: "1rem" },
  rowLabel:        { fontSize: "0.85rem", color: "#666" },
  rowValue:        { fontSize: "0.85rem", color: "#1a1a2e", fontWeight: "500", textAlign: "right" },
  idBox:           { margin: "1rem 1.5rem", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px", padding: "0.6rem 0.9rem" },
  idLabel:         { display: "block", fontSize: "0.7rem", color: "#888", fontWeight: "700", textTransform: "uppercase", marginBottom: "0.2rem" },
  idValue:         { fontSize: "0.78rem", fontFamily: "monospace", color: "#1a1a2e", wordBreak: "break-all" },
  qrSection:       { padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", borderTop: "1px solid #f1f5f9" },
  qrTitle:         { margin: 0, fontWeight: "700", fontSize: "0.95rem", color: "#1a1a2e" },
  qrImg:           { width: "200px", height: "200px", border: "4px solid #1a1a2e", borderRadius: "10px" },
  qrHint:          { margin: 0, fontSize: "0.78rem", color: "#888", textAlign: "center" },
  usedBanner:      { margin: "1rem 1.5rem 1.5rem", background: "#f1f5f9", color: "#64748b", padding: "0.75rem 1rem", borderRadius: "8px", textAlign: "center", fontSize: "0.88rem", fontWeight: "600" },
  cancelledBanner: { margin: "1rem 1.5rem 1.5rem", background: "#fee2e2", color: "#b91c1c", padding: "0.75rem 1rem", borderRadius: "8px", textAlign: "center", fontSize: "0.88rem", fontWeight: "600" },
};
