import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventService } from "../services/api";

const EMPTY_FORM = { title: "", description: "", date: "", venue: "", capacity: "", price: "" };

export default function CreateEventPage() {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (Number(form.capacity) < 1)
      return setError("Capacity must be at least 1");
    if (form.price !== "" && Number(form.price) < 0)
      return setError("Price cannot be negative");

    setLoading(true);
    try {
      const event = await eventService.create({
        ...form,
        capacity: Number(form.capacity),
        price: form.price === "" ? 0 : Number(form.price),
      });
      navigate(`/events/${event._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Host a New Event ✨</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <Field label="What's it called?">
            <input name="title" placeholder="e.g. Tech Fest 2025" value={form.title} onChange={handleChange} style={styles.input} required />
          </Field>
          <Field label="Tell people about it">
            <textarea name="description" placeholder="What can attendees expect?" value={form.description} onChange={handleChange} style={{ ...styles.input, height: "90px", resize: "vertical" }} required />
          </Field>
          <div style={styles.row}>
            <Field label="When is it?" style={{ flex: 1 }}>
              <input name="date" type="datetime-local" value={form.date} onChange={handleChange} style={styles.input} required />
            </Field>
            <Field label="Where?" style={{ flex: 1 }}>
              <input name="venue" placeholder="e.g. Main Auditorium" value={form.venue} onChange={handleChange} style={styles.input} required />
            </Field>
          </div>
          <div style={styles.row}>
            <Field label="How many seats?" style={{ flex: 1 }}>
              <input name="capacity" type="number" min="1" placeholder="100" value={form.capacity} onChange={handleChange} style={styles.input} required />
            </Field>
            <Field label="Ticket price (₹, 0 = free)" style={{ flex: 1 }}>
              <input name="price" type="number" min="0" placeholder="0" value={form.price} onChange={handleChange} style={styles.input} />
            </Field>
          </div>
          {/* TODO: add category dropdown and banner image upload */}
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Publishing…" : "Publish Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", ...style }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  wrapper:  { minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "2rem 1rem" },
  card:     { width: "100%", maxWidth: "580px", padding: "2rem", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  heading:  { margin: "0 0 1.5rem" },
  form:     { display: "flex", flexDirection: "column", gap: "1rem" },
  row:      { display: "flex", gap: "1rem", flexWrap: "wrap" },
  label:    { fontSize: "0.85rem", fontWeight: "600", color: "#333" },
  input:    { padding: "0.65rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem", width: "100%", boxSizing: "border-box" },
  btn:      { padding: "0.75rem", background: "#e94560", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "1rem", fontWeight: "600", marginTop: "0.5rem" },
  error:    { background: "#fff0f0", color: "#c0392b", padding: "0.6rem 0.8rem", borderRadius: "6px", fontSize: "0.9rem", marginBottom: "0.25rem" },
};
