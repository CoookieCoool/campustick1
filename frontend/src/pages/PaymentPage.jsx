import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();

  const [order,      setOrder]     = useState(null);
  const [loading,    setLoading]   = useState(true);
  const [status,     setStatus]    = useState("idle");  // "idle" | "processing" | "success"
  const [error,      setError]     = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry,     setExpiry]     = useState("");
  const [cvv,        setCvv]        = useState("");
  const [countdown,  setCountdown]  = useState(2);

  // Auto-redirect countdown after successful payment
  useEffect(() => {
    if (status !== "success") return;
    if (countdown <= 0) {
      navigate("/tickets", { state: { successMessage: "Payment successful! Your ticket(s) are ready." } });
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate]);

  useEffect(() => {
    orderService.getById(orderId)
      .then(setOrder)
      .catch(() => setError("Order not found or access denied."))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePay = async () => {
    setStatus("processing");
    setError("");
    // 800ms simulated processing delay before hitting the API
    await new Promise((res) => setTimeout(res, 800));
    try {
      await orderService.confirm(orderId);
      setStatus("success");   // triggers success screen + countdown
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
      setStatus("idle");
    }
  };

  const handleCancel = () => navigate("/events");

  if (loading) return <LoadingSpinner />;

  // ── Processing screen ──
  if (status === "processing") {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, ...styles.successCard }}>
          <div style={styles.successInner}>
            <span style={styles.processingIcon}>⏳</span>
            <h2 style={styles.successHeading}>Processing Payment...</h2>
            <p style={styles.successSub}>Please wait, don't close this page.</p>
            <div style={styles.dots}>
              <span className="pay-dot" />
              <span className="pay-dot" />
              <span className="pay-dot" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment success screen ──
  if (status === "success") {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, ...styles.successCard }}>
          <div className="confetti-wrap" aria-hidden="true">
            {[...Array(12)].map((_, i) => (
              <span key={i} className={`confetti-piece confetti-piece--${i + 1}`} />
            ))}
          </div>
          <div style={styles.successInner}>
            <span style={styles.successIcon}>🎉</span>
            <h2 style={styles.successHeading}>Payment Successful</h2>
            <p style={styles.successSub}>Your ticket(s) are confirmed and ready.</p>
            <p style={styles.successCountdown}>Redirecting in {countdown}s…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ color: "#c0392b", textAlign: "center" }}>{error}</p>
          <button onClick={handleCancel} style={styles.cancelBtn}>Back to Events</button>
        </div>
      </div>
    );
  }

  const eventDate = order?.event?.date
    ? new Date(order.event.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "N/A";

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <span style={styles.lockIcon}>🔒</span>
          <h2 style={styles.heading}>Secure Checkout</h2>
          <p style={styles.sub}>CampusTick Mock Payment</p>
        </div>

        {/* Order summary */}
        <div style={styles.summary}>
          <p style={styles.summaryTitle}>Order Summary</p>
          <Row label="Event"    value={order?.event?.title || "—"} />
          <Row label="Date"     value={eventDate} />
          <Row label="Venue"    value={order?.event?.venue || "—"} />
          <Row label="Quantity" value={order?.quantity ?? 1} />
          <div style={styles.divider} />
          <Row
            label="Total Amount"
            value={`₹${order?.amount ?? 0}`}
            bold
          />
        </div>

        {/* Mock card UI */}
        <div style={styles.mockCard}>
          <p style={styles.mockLabel}>Card Number</p>
          <input
            style={styles.mockInput}
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
          <div style={styles.mockRow}>
            <div style={{ flex: 1 }}>
              <p style={styles.mockLabel}>Expiry</p>
              <input
                style={styles.mockInput}
                placeholder="MM / YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p style={styles.mockLabel}>CVV</p>
              <input
                style={styles.mockInput}
                placeholder="•••"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </div>
          </div>
          <p style={styles.mockNote}>
            ℹ️ This is a simulated payment. No real transaction occurs.
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Actions */}
        <button
          onClick={handlePay}
          disabled={status !== "idle"}
          style={{ ...styles.payBtn, opacity: status === "idle" ? 1 : 0.7 }}
        >
          {status === "idle" ? `Pay ₹${order?.amount ?? 0}` : "Processing..."}
        </button>

        <button onClick={handleCancel} style={styles.cancelBtn} disabled={status !== "idle"}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={{ ...styles.rowValue, fontWeight: bold ? "700" : "500", color: bold ? "#a78bfa" : "#cbd5e1" }}>
        {value}
      </span>
    </div>
  );
}

const styles = {
  page:         { minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "2.5rem 1rem" },
  card:         { width: "100%", maxWidth: "440px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.5)", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)" },
  header:       { background: "rgba(15,23,42,0.8)", padding: "1.75rem", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  lockIcon:     { fontSize: "2rem" },
  heading:      { margin: "0.3rem 0 0", color: "#f1f5f9", fontSize: "1.25rem", fontWeight: "700" },
  sub:          { margin: "0.3rem 0 0", color: "#475569", fontSize: "0.82rem" },
  summary:      { padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  summaryTitle: { margin: "0 0 0.85rem", fontWeight: "700", fontSize: "0.72rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" },
  row:          { display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.5rem" },
  rowLabel:     { fontSize: "0.88rem", color: "#64748b" },
  rowValue:     { fontSize: "0.88rem", textAlign: "right", color: "#cbd5e1" },
  divider:      { borderTop: "1px dashed rgba(255,255,255,0.1)", margin: "0.85rem 0" },
  mockCard:     { padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  mockLabel:    { margin: "0 0 0.35rem", fontSize: "0.72rem", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" },
  mockInput:    { padding: "0.65rem 0.85rem", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "0.95rem", color: "#94a3b8", marginBottom: "0.85rem", letterSpacing: "0.05em", width: "100%", outline: "none" },
  mockRow:      { display: "flex", gap: "0.75rem" },
  mockNote:     { margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#334155", textAlign: "center" },
  error:        { margin: "0.75rem 1.5rem 0", background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)", padding: "0.65rem 0.9rem", borderRadius: "8px", fontSize: "0.88rem" },
  payBtn:       { display: "block", width: "calc(100% - 3rem)", margin: "1.25rem 1.5rem 0.5rem", padding: "0.9rem", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "1rem", fontWeight: "700", cursor: "pointer", textAlign: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.4)", transition: "transform 0.15s, box-shadow 0.15s" },
  cancelBtn:    { display: "block", width: "calc(100% - 3rem)", margin: "0 1.5rem 1.5rem", padding: "0.75rem", background: "transparent", color: "#475569", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "0.95rem", cursor: "pointer", textAlign: "center", transition: "border-color 0.15s, color 0.15s" },
  // Success screen
  successCard:      { display: "flex", flexDirection: "column", alignItems: "center", overflow: "visible", position: "relative" },
  successInner:     { padding: "2.5rem 2rem 2.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" },
  processingIcon:   { fontSize: "3rem", lineHeight: 1 },
  successIcon:      { fontSize: "3.5rem", lineHeight: 1, animation: "successPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both" },
  successHeading:   { margin: 0, fontSize: "1.5rem", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.02em" },
  successSub:       { margin: 0, fontSize: "0.95rem", color: "#64748b" },
  successCountdown: { margin: 0, fontSize: "0.82rem", color: "#475569", fontVariantNumeric: "tabular-nums" },
  dots:             { display: "flex", gap: "0.4rem", marginTop: "0.25rem" },
};
