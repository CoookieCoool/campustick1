import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token

  // On app load, restore user from stored token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authService
        .getMe()
        .then(({ user }) => setUser(user))
        .catch(() => localStorage.removeItem("token")) // token invalid/expired
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const { token, user } = await authService.login(credentials);
    localStorage.setItem("token", token);
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const { token, user } = await authService.register(data);
    localStorage.setItem("token", token);
    setUser(user);
    return user;
  };

  const refreshUser = async () => {
    try {
      const { user } = await authService.getMe();
      setUser(user);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this everywhere instead of useContext(AuthContext)
export const useAuth = () => useContext(AuthContext);
