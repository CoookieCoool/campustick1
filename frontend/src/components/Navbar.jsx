import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navClass = ({ isActive }) =>
  isActive ? "navbar__link navbar__link--active" : "navbar__link";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <NavLink to="/" end className={({ isActive }) => isActive ? "navbar__brand navbar__brand--active" : "navbar__brand"}>🎟 CampusTick</NavLink>
      <div className="navbar__links">
        <NavLink to="/" end className={navClass}>Home</NavLink>
        <NavLink to="/events" className={navClass}>Events</NavLink>
        {user ? (
          <>
            {user.role === "admin" && (
              <NavLink to="/admin" className={({ isActive }) =>
                isActive ? "navbar__link navbar__link--admin navbar__link--active" : "navbar__link navbar__link--admin"
              }>⚙️ Admin</NavLink>
            )}
            <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
            {user.role === "organizer" && (
              <NavLink to="/events/my" className={navClass}>My Events</NavLink>
            )}
            <NavLink to="/tickets" className={navClass}>My Tickets</NavLink>
            <button onClick={handleLogout} className="navbar__logout">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login"    className={navClass}>Login</NavLink>
            <NavLink to="/register" className={navClass}>Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {};
