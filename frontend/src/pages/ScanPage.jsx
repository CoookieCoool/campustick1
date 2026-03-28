import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { ticketService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const SCANNER_ID = "qr-reader";

// All 3 possible scan outcomes
const OUTCOMES = {
  valid:       { bg: "#f0fdf4", border: "#86efac", icon: "✅", title: "Entry Allowed",      titleColor: "#166534" },
  already_used:{ bg: "#fefce8", border: "#fde047", icon: "⚠️", title: "Already Used",       titleColor: "#854d0e" },
  invalid:     { bg: "#fff0f0", border: "#fca5a5", icon: "❌", title: "Invalid Ticket",     titleColor: "#b91c1c" },
  cancelled:   { bg: "#fff0f0", border: "#fca5a5", icon: "🚫", title: "Ticket Cancelled",   titleColor: "#b91c1c" },
};

export default function ScanPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [scanning, setScanning] = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState("");
  const [manualId, setManualId] = useState("");
  const [loading,  setLoading]  = useState(false);
  const scannerRef = useRef(null);

  // Role guard — only organizer or admin may use this page
  if (user && user.role !== "organizer" && user.role !== "admin") {
    return (
      <div style={{ textAlign: "center", marginTop: "4rem" }}>
        <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#c0392b" }}>🚫 Organizers only</p>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>This page is for organizers scanning tickets at the gate.</p>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ marginTop: "1rem", padding: "0.6rem 1.4rem", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Take me back
        </button>
      </div>
    );
  }

  /* ── Camera ── */
  const startScan = async () => {
    setError("");
    setResult(null);
    setScanning(true);
    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => { stopScan(); verify(decoded); },
        () => {}
      );
    } catch {
      setError("Camera access denied or unavailable. Use manual entry below.");
      setScanning(false);
    }
  };

  const stopScan = () => {
    scannerRef.current?.stop().catch(() => {});
    scannerRef.current = null;
    setScanning(false);
  };

  useEffect(() => () => stopScan(), []);

  /* ── Verify ── */
  const verify = async (qrData) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await ticketService.scan(qrData.trim());
      setResult(data);                    // result: "valid"
    } catch (err) {
      const data = err.response?.data;
      if (data?.result) {
        setResult(data);                  // result: "already_used" | "invalid" | "cancelled"
      } else {
        setError(data?.message || "Verification failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManual = (e) => {
    e.preventDefault();
    if (manualId.trim()) verify(manualId.trim());
  };

  const reset = () => { setResult(null); setError(""); setManualId(""); };

  const outcome = result ? (OUTCOMES[result.result] || OUTCOMES.invalid) : null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>🎟 Ticket Scanner</h2>
        <p style={styles.sub}>Point the camera at a student's QR code to let them in.</p>

        {/* ── Result card ── */}
        {result && outcome && (
          <div style={{ ...styles.resultCard, background: outcome.bg, borderColor: outcome.border }}>
            <span style={styles.resultIcon}>{outcome.icon}</span>
            <h3 style={{ ...styles.resultTitle, color: outcome.titleColor }}>{outcome.title}</h3>
            <p style={styles.resultMsg}>{result.message}</p>

            {/* Valid ticket details */}
            {result.result === "valid" && result.ticket && (
              <div style={styles.detailBox}>
                <DetailRow label="Student" value={result.ticket.studentName} />
                <DetailRow label="Email"   value={result.ticket.studentEmail} />
                <DetailRow label="Event"   value={result.ticket.eventTitle} />
                <DetailRow label="Venue"   value={result.ticket.eventVenue} />
                <DetailRow label="Date"    value={result.ticket.eventDate ? new Date(result.ticket.eventDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "N/A"} />
                <DetailRow label="Scanned" value={new Date(result.ticket.scannedAt).toLocaleTimeString()} />
              </div>
            )}

            {/* Already used — show who used it */}
            {result.result === "already_used" && result.ticket && (
              <div style={styles.detailBox}>
                <DetailRow label="Student" value={result.ticket.studentName} />
                <DetailRow label="Event"   value={result.ticket.eventTitle} />
                <DetailRow label="Used at" value={result.scannedAt ? new Date(result.scannedAt).toLocaleString() : "Unknown"} />
              </div>
            )}

            <button onClick={reset} style={{ ...styles.actionBtn, background: outcome.titleColor }}>
              Scan another
            </button>
          </div>
        )}

        {/* ── Network / unexpected error ── */}
        {error && !result && (
          <div style={styles.errorBanner}>
            ⚠️ {error}
            <button onClick={reset} style={styles.retryLink}>Retry</button>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <span>Checking ticket…</span>
          </div>
        )}

        {/* ── Scanner UI (hidden while showing result) ── */}
        {!result && !loading && (
          <>
            {/* Camera viewport */}
            <div style={styles.cameraWrap}>
              <div id={SCANNER_ID} style={{ width: "100%" }} />
              {!scanning && (
                <div style={styles.cameraPlaceholder}>
                  <span style={{ fontSize: "2.5rem" }}>📷</span>
                  <span style={{ fontSize: "0.9rem", color: "#888" }}>Camera is off</span>
                </div>
              )}
            </div>

            {!scanning ? (
              <button onClick={startScan} style={styles.cameraBtn}>
                📷 Start Scanning
              </button>
            ) : (
              <button onClick={stopScan} style={styles.stopBtn}>
                ⏹ Stop
              </button>
            )}

            {/* Divider */}
            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>or type it in</span>
              <div style={styles.dividerLine} />
            </div>

            {/* Manual qrData entry */}
            <form onSubmit={handleManual} style={styles.form}>
              <input
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="Paste QR data here…"
                style={styles.input}
              />
              <button type="submit" disabled={!manualId.trim()} style={styles.verifyBtn}>
                Verify
              </button>
            </form>
            <p style={styles.hint}>
              QR data format: <code>CT-&lt;ticketId&gt;-&lt;token&gt;</code>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{value || "N/A"}</span>
    </div>
  );
}

const styles = {
  page:             { minHeight: "80vh", display: "flex", justifyContent: "center", padding: "2rem 1rem" },
  container:        { width: "100%", maxWidth: "440px" },
  heading:          { margin: "0 0 0.2rem", fontSize: "1.4rem" },
  sub:              { color: "#666", fontSize: "0.88rem", margin: "0 0 1.5rem" },

  // Result
  resultCard:       { border: "2px solid", borderRadius: "14px", padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" },
  resultIcon:       { fontSize: "2.8rem" },
  resultTitle:      { margin: 0, fontSize: "1.2rem", fontWeight: "700" },
  resultMsg:        { margin: 0, color: "#444", fontSize: "0.9rem", textAlign: "center" },
  detailBox:        { width: "100%", background: "rgba(255,255,255,0.6)", borderRadius: "8px", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.25rem" },
  detailRow:        { display: "flex", justifyContent: "space-between", gap: "1rem" },
  detailLabel:      { fontSize: "0.8rem", color: "#666", fontWeight: "600" },
  detailValue:      { fontSize: "0.82rem", color: "#1a1a2e", textAlign: "right" },
  actionBtn:        { marginTop: "0.5rem", padding: "0.6rem 1.5rem", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "700", fontSize: "0.9rem" },

  // Error
  errorBanner:      { background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.88rem", color: "#b91c1c", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  retryLink:        { background: "none", border: "none", color: "#e94560", cursor: "pointer", fontWeight: "600", fontSize: "0.88rem" },

  // Loading
  loadingBox:       { display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", padding: "2rem", color: "#666" },
  spinner:          { width: "22px", height: "22px", border: "3px solid #ddd", borderTop: "3px solid #e94560", borderRadius: "50%", animation: "spin 0.7s linear infinite" },

  // Camera
  cameraWrap:       { position: "relative", background: "#0f0f0f", borderRadius: "12px", overflow: "hidden", minHeight: "260px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" },
  cameraPlaceholder:{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" },
  cameraBtn:        { width: "100%", padding: "0.8rem", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "0.95rem", marginBottom: "0.75rem" },
  stopBtn:          { width: "100%", padding: "0.8rem", background: "#e94560", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "0.95rem", marginBottom: "0.75rem" },

  // Divider
  divider:          { display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.75rem 0" },
  dividerLine:      { flex: 1, height: "1px", background: "#e2e8f0" },
  dividerText:      { fontSize: "0.78rem", color: "#aaa", whiteSpace: "nowrap" },

  // Manual form
  form:             { display: "flex", gap: "0.5rem" },
  input:            { flex: 1, padding: "0.65rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem", fontFamily: "monospace" },
  verifyBtn:        { padding: "0.65rem 1rem", background: "#e94560", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "700" },
  hint:             { fontSize: "0.75rem", color: "#aaa", marginTop: "0.5rem" },
};

// Inject spinner keyframes
const s = document.createElement("style");
s.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(s);
