import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Wait for AuthContext to finish checking stored token
  if (loading) return <LoadingSpinner />;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
