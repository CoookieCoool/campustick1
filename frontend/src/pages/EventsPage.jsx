import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function EventsPage() {
  const [events,   setEvents]   = useState([]);
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [showPast, setShowPast] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    eventService.getAll()
      .then((data) => {
        setEvents(data);
        const now = new Date();
        const hasUpcoming = data.some((e) => new Date(e.date).getTime() > now.getTime());
        if (!hasUpcoming) setShowPast(true);
      })
      .catch(() => setError("Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  const now     = new Date();
  const matched = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.venue.toLowerCase().includes(search.toLowerCase())
  );
  const upcoming = matched.filter((e) => new Date(e.date).getTime() > now.getTime());
  const past     = matched.filter((e) => new Date(e.date).getTime() <= now.getTime());

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Events</h2>
        {user?.role === "organizer" && (
          <button onClick={() => navigate("/events/create")} className="btn btn--primary">
            + Create Event
          </button>
        )}
      </div>

      <input
        className="form-input events-search"
        placeholder="🔍 Search by title or venue…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <div className="alert alert--error">{error}</div>}

      {/* Upcoming */}
      <p className="section-title">🟢 Upcoming ({upcoming.length})</p>
      {upcoming.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">🎭</span>
          <span className="empty-state__text">
            {search ? `No upcoming events for "${search}"` : "No upcoming events yet."}
          </span>
        </div>
      ) : (
        <div className="event-grid">
          {upcoming.map((e) => <EventCard key={e._id} event={e} />)}
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div className="events-past">
          <button className="btn btn--ghost btn--sm events-past__toggle" onClick={() => setShowPast(!showPast)}>
            {showPast ? "▲" : "▼"} Past Events ({past.length})
          </button>
          {showPast && (
            <div className="event-grid events-past__grid">
              {past.map((e) => <EventCard key={e._id} event={e} isPast />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
