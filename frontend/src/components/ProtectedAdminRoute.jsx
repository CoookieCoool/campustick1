import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedAdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user?.role === "admin" ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
