import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getStoredToken, setStoredToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    api.me()
      .then((response) => setUser(response.data.user))
      .catch(() => {
        setStoredToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    async login(payload) {
      const response = await api.login(payload);
      setStoredToken(response.data.token);
      setUser(response.data.user);
      return response.data.user;
    },
    async register(payload) {
      const response = await api.register(payload);
      setStoredToken(response.data.token);
      setUser(response.data.user);
      return response.data.user;
    },
    async logout() {
      try {
        await api.logout();
      } finally {
        setStoredToken(null);
        setUser(null);
      }
    },
    syncUser(nextUser) {
      setUser(nextUser);
    },
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}