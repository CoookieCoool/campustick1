import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import ProtectedAdminRoute from "../components/ProtectedAdminRoute";

import HomePage       from "../pages/HomePage";
import LoginPage        from "../pages/LoginPage";
import RegisterPage     from "../pages/RegisterPage";
import DashboardPage    from "../pages/DashboardPage";
import EventsPage       from "../pages/EventsPage";
import EventDetailsPage from "../pages/EventDetailsPage";
import CreateEventPage  from "../pages/CreateEventPage";
import MyEventsPage     from "../pages/MyEventsPage";
import TicketPage       from "../pages/TicketPage";
import TicketDetailPage from "../pages/TicketDetailPage";
import ScanPage         from "../pages/ScanPage";
import AdminPage        from "../pages/AdminPage";
import PaymentPage      from "../pages/PaymentPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/"          element={<HomePage />} />
      <Route path="/login"     element={<LoginPage />} />
      <Route path="/register"  element={<RegisterPage />} />
      <Route path="/events"    element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"       element={<DashboardPage />} />
        <Route path="/events/create"   element={<CreateEventPage />} />
        <Route path="/events/my"       element={<MyEventsPage />} />
        <Route path="/tickets"         element={<TicketPage />} />
        <Route path="/tickets/:id"     element={<TicketDetailPage />} />
        <Route path="/scan"            element={<ScanPage />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
      </Route>

      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<p style={{ textAlign: "center", marginTop: "4rem" }}>404 — Page not found</p>} />
    </Routes>
  );
}
