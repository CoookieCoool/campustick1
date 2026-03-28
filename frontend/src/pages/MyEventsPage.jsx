import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventService } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function MyEventsPage() {
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    eventService.getMy()
      .then(setEvents)
      .catch(() => setError("Couldn't load your events. Try refreshing."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startEdit = (event) => {
    setEditingId(event._id);
    // Convert UTC date to local time for datetime-local input
    // toISOString() gives UTC which shifts time by timezone offset
    // Instead, build the string from local date parts
    const d = new Date(event.date);
    const localDate =
      d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0") + "T" +
      String(d.getHours()).padStart(2, "0") + ":" +
      String(d.getMinutes()).padStart(2, "0");
    setEditForm({
      title:       event.title,
      description: event.description,
      date:        localDate,
      venue:       event.venue,
      capacity:    event.capacity,
      price:       event.price,
    });
  };

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleSave = async (id) => {
    setSaving(true);
    try {
      await eventService.update(id, {
        ...editForm,
        capacity: Number(editForm.capacity),
        price:    Number(editForm.price),
      });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save changes. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event? This can't be undone.")) return;
    try {
      await eventService.remove(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't delete. Try again.");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>My Events</h2>
        <button onClick={() => navigate("/events/create")} style={styles.createBtn}>
          + New Event
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {events.length === 0 ? (
        <div style={styles.empty}>
          <p>No events yet — time to host something! 🎉</p>
          <button onClick={() => navigate("/events/create")} style={styles.createBtn}>Host your first event</button>
        </div>
      ) : (
        events.map((event) =>
          editingId === event._id ? (
            <EditCard
              key={event._id}
              form={editForm}
              saving={saving}
              onChange={handleEditChange}
              onSave={() => handleSave(event._id)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <EventRow
              key={event._id}
              event={event}
              onEdit={() => startEdit(event)}
              onDelete={() => handleDelete(event._id)}
              onView={() => navigate(`/events/${event._id}`)}
            />
          )
        )
      )}
    </div>
  );
}

function EventRow({ event, onEdit, onDelete, onView }) {
  const booked = event.capacity - event.availableSeats;
  return (
    <div style={styles.row}>
      <div style={styles.rowInfo}>
        <span style={styles.rowTitle}>{event.title}</span>
        <span style={styles.rowMeta}>
          📅 {new Date(event.date).toLocaleDateString()} &nbsp;·&nbsp;
          📍 {event.venue} &nbsp;·&nbsp;
          {event.price === 0 ? "Free" : `₹${event.price}`}
        </span>
        <span style={{ ...styles.rowMeta, marginTop: "0.2rem" }}>
          🎟 <strong>{booked}</strong> booked &nbsp;·&nbsp;
          <strong>{event.availableSeats}</strong> seats left &nbsp;·&nbsp;
          {event.capacity} total
        </span>
      </div>
      <div style={styles.rowActions}>
        <button onClick={onView}   style={styles.btnView}>View</button>
        <button onClick={onEdit}   style={styles.btnEdit}>Edit</button>
        <button onClick={onDelete} style={styles.btnDelete}>Delete</button>
      </div>
    </div>
  );
}

function EditCard({ form, saving, onChange, onSave, onCancel }) {
  return (
    <div style={styles.editCard}>
      <h4 style={{ margin: "0 0 1rem" }}>Edit event details</h4>
      <div style={styles.editGrid}>
        {[
          { name: "title",       label: "Title",       type: "text" },
          { name: "venue",       label: "Venue",       type: "text" },
          { name: "date",        label: "Date & Time", type: "datetime-local" },
          { name: "capacity",    label: "Capacity",    type: "number" },
          { name: "price",       label: "Price (₹)",   type: "number" },
        ].map(({ name, label, type }) => (
          <div key={name} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label style={styles.label}>{label}</label>
            <input name={name} type={type} value={form[name]} onChange={onChange} style={styles.input} />
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", gridColumn: "1 / -1" }}>
          <label style={styles.label}>Description</label>
          <textarea name="description" value={form.description} onChange={onChange} style={{ ...styles.input, height: "70px", resize: "vertical" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
        <button onClick={onSave}   style={styles.btnEdit}   disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        <button onClick={onCancel} style={styles.btnView}>Cancel</button>
      </div>
    </div>
  );
}

const styles = {
  container:  { maxWidth: "800px", margin: "2rem auto", padding: "0 1rem" },
  header:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  createBtn:  { padding: "0.5rem 1.1rem", background: "#e94560", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
  error:      { background: "#fff0f0", color: "#c0392b", padding: "0.6rem 0.8rem", borderRadius: "6px", marginBottom: "1rem" },
  empty:      { textAlign: "center", padding: "3rem 0", color: "#666" },
  row:        { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", padding: "1rem", border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "0.75rem" },
  rowInfo:    { display: "flex", flexDirection: "column", gap: "0.3rem" },
  rowTitle:   { fontWeight: "600", fontSize: "1rem" },
  rowMeta:    { fontSize: "0.82rem", color: "#666" },
  rowActions: { display: "flex", gap: "0.5rem" },
  btnView:    { padding: "0.4rem 0.9rem", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "5px", cursor: "pointer", fontSize: "0.85rem" },
  btnEdit:    { padding: "0.4rem 0.9rem", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "0.85rem" },
  btnDelete:  { padding: "0.4rem 0.9rem", background: "#fff0f0", color: "#c0392b", border: "1px solid #fca5a5", borderRadius: "5px", cursor: "pointer", fontSize: "0.85rem" },
  editCard:   { padding: "1.25rem", border: "2px solid #e94560", borderRadius: "10px", marginBottom: "0.75rem" },
  editGrid:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" },
  label:      { fontSize: "0.82rem", fontWeight: "600", color: "#444" },
  input:      { padding: "0.55rem 0.7rem", borderRadius: "5px", border: "1px solid #ccc", fontSize: "0.95rem", width: "100%", boxSizing: "border-box" },
};
