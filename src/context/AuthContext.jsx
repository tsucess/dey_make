import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getStoredToken, setStoredToken } from "../services/api";

const AuthContext = createContext(null);
const PENDING_VERIFICATION_STORAGE_KEY = "deymake.auth.pendingVerification";

function getStoredPendingVerification() {
  if (typeof window === "undefined") return null;

  const value = window.sessionStorage.getItem(PENDING_VERIFICATION_STORAGE_KEY);

  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    window.sessionStorage.removeItem(PENDING_VERIFICATION_STORAGE_KEY);
    return null;
  }
}

function setStoredPendingVerification(value) {
  if (typeof window === "undefined") return;

  if (value) {
    window.sessionStorage.setItem(PENDING_VERIFICATION_STORAGE_KEY, JSON.stringify(value));
  } else {
    window.sessionStorage.removeItem(PENDING_VERIFICATION_STORAGE_KEY);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(() => getStoredPendingVerification());

  const syncPendingVerification = (value) => {
    setPendingVerification(value);
    setStoredPendingVerification(value);
  };

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    api.me()
      .then((response) => {
        setUser(response.data.user);
        syncPendingVerification(null);
      })
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
    pendingVerification,
    async login(payload) {
      const response = await api.login(payload);

      setStoredToken(response.data.token);
      syncPendingVerification(null);
      setUser(response.data.user);
      return response.data.user;
    },
    async register(payload) {
      const response = await api.register(payload);

      if (response.data?.verification?.required) {
        setStoredToken(null);
        setUser(null);
        syncPendingVerification(response.data.verification);
        return response.data;
      }

      setStoredToken(response.data.token);
      syncPendingVerification(null);
      setUser(response.data.user);
      return response.data.user;
    },
    async verifyEmailCode(payload) {
      const email = payload?.email || pendingVerification?.email;
      const response = await api.verifyEmailCode({ ...payload, email });

      setStoredToken(response.data.token);
      syncPendingVerification(null);
      setUser(response.data.user);

      return response.data.user;
    },
    async resendVerificationCode(payload = {}) {
      const email = payload.email || pendingVerification?.email;
      const response = await api.resendVerificationCode({ email });

      syncPendingVerification({
        required: true,
        email,
        expiresInMinutes: response.data?.expiresInMinutes ?? pendingVerification?.expiresInMinutes,
      });

      return response.data;
    },
    async authenticateWithToken(token) {
      setStoredToken(token);

      try {
        const response = await api.me();
        syncPendingVerification(null);
        setUser(response.data.user);
        return response.data.user;
      } catch (error) {
        setStoredToken(null);
        setUser(null);
        throw error;
      }
    },
    async logout() {
      try {
        await api.logout();
      } finally {
        setStoredToken(null);
        syncPendingVerification(null);
        setUser(null);
      }
    },
    syncUser(nextUser) {
      setUser(nextUser);
    },
    clearPendingVerification() {
      syncPendingVerification(null);
    },
  }), [user, isLoading, pendingVerification]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}