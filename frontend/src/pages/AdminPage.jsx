import { useEffect, useState } from "react";
import { adminService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const ROLE_BADGE = {
  admin:     { bg: "#fef3c7", color: "#92400e", label: "Admin" },
  organizer: { bg: "#dcfce7", color: "#166534", label: "Organizer" },
  student:   { bg: "#eff6ff", color: "#1e40af", label: "Student" },
};

export default function AdminPage() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [actionId, setActionId] = useState(null);
  const [notice,   setNotice]   = useState("");
  const { user, refreshUser } = useAuth();

  const load = () => {
    setLoading(true);
    adminService.getAllUsers()
      .then(setUsers)
      .catch(() => setError("Couldn't load users. Try refreshing."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handlePromote = async (id) => {
    setActionId(id);
    try {
      await adminService.promoteToOrganizer(id);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: "organizer" } : u))
      );
      setNotice("Done! They'll need to sign out and back in to see their new role.");
      if (user?._id === id || user?.id === id) await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || "Promote failed");
    } finally {
      setActionId(null);
    }
  };

  const handleDemote = async (id) => {
    if (!window.confirm("Remove organizer access for this user?")) return;
    setActionId(id);
    try {
      await adminService.demoteToStudent(id);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: "student" } : u))
      );
      setNotice("Done! They'll need to sign out and back in to see their new role.");
      if (user?._id === id || user?.id === id) await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || "Demote failed");
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  const students   = users.filter((u) => u.role === "student");
  const organizers = users.filter((u) => u.role === "organizer");
  const admins     = users.filter((u) => u.role === "admin");

  return (
    <div style={styles.container}>
      <h2 style={{ margin: "0 0 0.25rem" }}>⚙️ Admin Panel</h2>
      <p style={styles.sub}>Manage who can host events on CampusTick.</p>

      {/* Stats bar */}
      <div style={styles.statsRow}>
        <StatPill label="Total Users"  value={users.length}      color="#b8ec2a" />
        <StatPill label="Students"     value={students.length}   color="#0c41ee" />
        <StatPill label="Organizers"   value={organizers.length} color="#f20f63" />
        <StatPill label="Admins"       value={admins.length}     color="#0ddccb" />
      </div>

      {error  && <div style={styles.error}>{error}</div>}
      {notice && <div style={{ ...styles.error, background: "#f0fdf4", color: "#166534" }}>ℹ️ {notice}</div>}

      {/* User table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Joined</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={styles.tr}>
                <td style={styles.td}>{u.name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: ROLE_BADGE[u.role]?.bg, color: ROLE_BADGE[u.role]?.color }}>
                    {ROLE_BADGE[u.role]?.label}
                  </span>
                </td>
                <td style={styles.td}>
                  {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td style={styles.td}>
                  {u.role === "student" && (
                    <button
                      style={styles.promoteBtn}
                      onClick={() => handlePromote(u._id)}
                      disabled={actionId === u._id}
                    >
                      {actionId === u._id ? "Working…" : "Make Organizer"}
                    </button>
                  )}
                  {u.role === "organizer" && (
                    <button
                      style={styles.demoteBtn}
                      onClick={() => handleDemote(u._id)}
                      disabled={actionId === u._id}
                    >
                      {actionId === u._id ? "Working…" : "Remove Organizer"}
                    </button>
                  )}
                  {u.role === "admin" && (
                    <span style={styles.adminTag}>— Admin —</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ ...styles.pill, borderColor: color }}>
      <span style={{ ...styles.pillNum, color }}>{value}</span>
      <span style={styles.pillLabel}>{label}</span>
    </div>
  );
}

const styles = {
  container:  { maxWidth: "900px", margin: "2rem auto", padding: "0 1rem" },
  sub:        { color: "#94a3b8", fontSize: "0.9rem", margin: "0 0 1.5rem" },
  statsRow:   { display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" },
  pill:       { flex: "1 1 120px", border: "2px solid", borderRadius: "10px", padding: "0.9rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" },
  pillNum:    { fontSize: "1.6rem", fontWeight: "700" },
  pillLabel:  { fontSize: "0.8rem", color: "#94a3b8" },
  error:      { background: "#fff0f0", color: "#c0392b", padding: "0.6rem 0.8rem", borderRadius: "6px", marginBottom: "1rem" },
  tableWrap:  { overflowX: "auto", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px" },
  table:      { width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" },
  thead:      { background: "rgba(255,255,255,0.05)" },
  th:         { padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  tr:         { borderBottom: "1px solid rgba(255,255,255,0.05)" },
  td:         { padding: "0.75rem 1rem", color: "#e5e7eb", verticalAlign: "middle" },
  badge:      { padding: "0.25rem 0.6rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "600" },
  promoteBtn: { padding: "0.35rem 0.8rem", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "0.82rem", fontWeight: "600" },
  demoteBtn:  { padding: "0.35rem 0.8rem", background: "#fff0f0", color: "#c0392b", border: "1px solid #fca5a5", borderRadius: "5px", cursor: "pointer", fontSize: "0.82rem" },
  adminTag:   { color: "#aaa", fontSize: "0.82rem" },
};
