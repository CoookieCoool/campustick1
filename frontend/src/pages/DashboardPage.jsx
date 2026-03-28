import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { eventService, ticketService } from "../services/api";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats]       = useState({ tickets: 0, eventsCreated: 0, upcoming: 0 });
  const [myEvents, setMyEvents]   = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === "organizer") {
          const events = await eventService.getMy();
          const now = new Date();
          const upcoming = events.filter((e) => new Date(e.date).getTime() > now.getTime());
          setMyEvents(events.slice(0, 3));
          setStats((s) => ({ ...s, eventsCreated: events.length, upcoming: upcoming.length }));
        }

        if (user?.role === "student") {
          const tickets = await ticketService.getMyTickets();
          const now = new Date();
          const upcoming = tickets.filter((t) => t.event && new Date(t.event.date).getTime() > now.getTime());
          setMyTickets(tickets.slice(0, 3));
          setStats((s) => ({ ...s, tickets: tickets.length, upcoming: upcoming.length }));
        }
      } catch {
        setFetchError("Hmm, something went wrong. Try refreshing.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "3rem", color: "#666" }}>Just a sec…</p>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>Hey, {user?.name}! 👋</h2>
          <p style={styles.role}>
            {user?.role === "organizer" ? "🎙 Organizer" : user?.role === "admin" ? "⚙️ Admin" : "🎓 Student"} · {user?.email}
          </p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sign out</button>
      </div>

      {/* Stats */}
      <div style={styles.grid}>
        {user?.role === "student" && (
          <>
            <StatCard num={stats.tickets}  label="My Tickets" link="/tickets" />
            <StatCard num={stats.upcoming} label="Upcoming" />
          </>
        )}
        {user?.role === "organizer" && (
          <>
            <StatCard num={stats.eventsCreated} label="Events Created" link="/events/my" />
            <StatCard num={stats.upcoming}      label="Upcoming Events" />
          </>
        )}
        {user?.role === "admin" && (
          <StatCard num="⚙️" label="Admin Panel" link="/admin" />
        )}
      </div>

      {/* Quick actions */}
      <div style={styles.actions}>
        {user?.role === "organizer" && (
          <>
            <button onClick={() => navigate("/events/create")} style={styles.primaryBtn}>+ Host an Event</button>
            <button onClick={() => navigate("/events/my")}     style={styles.secondaryBtn}>My Events</button>
            <button onClick={() => navigate("/scan")}          style={styles.secondaryBtn}>Scan a Ticket</button>
          </>
        )}
        {user?.role === "student" && (
          <>
            <button onClick={() => navigate("/events")}  style={styles.primaryBtn}>Find Events 🔍</button>
            <button onClick={() => navigate("/tickets")} style={styles.secondaryBtn}>My Tickets</button>
          </>
        )}
        {user?.role === "admin" && (
          <button onClick={() => navigate("/admin")} style={styles.primaryBtn}>Open Admin Panel</button>
        )}
      </div>

      {/* Recent events (organizer) */}
      {user?.role === "organizer" && myEvents.length > 0 && (
        <Section title="Your Recent Events" linkTo="/events/my" linkLabel="See all">
          {myEvents.map((e) => (
            <RecentRow
              key={e._id}
              title={e.title}
              meta={`📅 ${new Date(e.date).toLocaleDateString()} · 🎟 ${e.availableSeats}/${e.capacity} seats`}
              onClick={() => navigate(`/events/${e._id}`)}
            />
          ))}
        </Section>
      )}

      {fetchError && (
        <div style={{ background: "#fff0f0", color: "#c0392b", padding: "0.7rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem" }}>
          {fetchError}
        </div>
      )}

      {/* Recent tickets (student) */}
      {user?.role === "student" && myTickets.length > 0 && (
        <Section title="Your Recent Tickets" linkTo="/tickets" linkLabel="See all">
          {myTickets.map((t) => {
            const statusLabel =
              t.status === "used"      ? "✅ Used" :
              t.status === "cancelled" ? "❌ Cancelled" :
                                         "🟢 Valid";
            return (
              <RecentRow
                key={t._id}
                title={t.event?.title || "Event"}
                meta={`📅 ${t.event?.date ? new Date(t.event.date).toLocaleDateString() : "N/A"} · ${statusLabel}`}
                onClick={() => navigate("/tickets")}
              />
            );
          })}
        </Section>
      )}
    </div>
  );
}

function StatCard({ num, label, link }) {
  const navigate = useNavigate();
  return (
    <div style={styles.card} onClick={() => link && navigate(link)}
      title={link ? `Go to ${label}` : ""}
    >
      <span style={styles.num}>{num}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

function Section({ title, linkTo, linkLabel, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {linkTo && <Link to={linkTo} style={styles.seeAll}>{linkLabel} →</Link>}
      </div>
      {children}
    </div>
  );
}

function RecentRow({ title, meta, onClick }) {
  return (
    <div style={styles.recentRow} onClick={onClick}>
      <span style={styles.recentTitle}>{title}</span>
      <span style={styles.recentMeta}>{meta}</span>
    </div>
  );
}

const styles = {
  container:     { maxWidth: "800px", margin: "2rem auto", padding: "0 1rem" },
  header:        { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" },
  role:          { margin: "0.25rem 0 0", color: "#666", fontSize: "0.9rem" },
  grid:          { display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" },
  card:          { flex: "1 1 140px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", cursor: "pointer", transition: "box-shadow 0.2s" },
  num:           { fontSize: "2rem", fontWeight: "700", color: "#e94560" },
  statLabel:     { fontSize: "0.85rem", color: "#555" },
  actions:       { display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" },
  primaryBtn:    { padding: "0.6rem 1.2rem", background: "#e94560", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
  secondaryBtn:  { padding: "0.6rem 1.2rem", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer" },
  logoutBtn:     { padding: "0.5rem 1rem", background: "transparent", border: "1px solid #e94560", color: "#e94560", borderRadius: "6px", cursor: "pointer" },
  section:       { marginTop: "1.5rem" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" },
  seeAll:        { fontSize: "0.85rem", color: "#e94560", textDecoration: "none" },
  recentRow:     { display: "flex", flexDirection: "column", gap: "0.2rem", padding: "0.75rem 1rem", border: "1px solid #e2e8f0", borderRadius: "8px", marginBottom: "0.5rem", cursor: "pointer" },
  recentTitle:   { fontWeight: "600", fontSize: "0.95rem" },
  recentMeta:    { fontSize: "0.82rem", color: "#666" },
};
