import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, getStoredActivityAt, getStoredToken, setStoredToken, touchStoredActivity } from "../services/api";

const AuthContext = createContext(null);
const PENDING_VERIFICATION_STORAGE_KEY = "deymake.auth.pendingVerification";
const DEFAULT_AUTH_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const configuredIdleTimeoutMs = Number.parseInt(`${import.meta.env.VITE_AUTH_IDLE_TIMEOUT_MS ?? ""}`, 10);
const AUTH_IDLE_TIMEOUT_MS = Number.isFinite(configuredIdleTimeoutMs) && configuredIdleTimeoutMs > 0
  ? configuredIdleTimeoutMs
  : DEFAULT_AUTH_IDLE_TIMEOUT_MS;

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

function hasStoredSessionExpired() {
  const activityAt = getStoredActivityAt();

  if (!activityAt) return false;

  return Date.now() - Date.parse(activityAt) >= AUTH_IDLE_TIMEOUT_MS;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(() => getStoredPendingVerification());
  const logoutTimerRef = useRef(null);

  const syncPendingVerification = useCallback((value) => {
    setPendingVerification(value);
    setStoredPendingVerification(value);
  }, []);

  const clearAuthState = useCallback(() => {
    setStoredToken(null);
    syncPendingVerification(null);
    setUser(null);
  }, [syncPendingVerification]);

  const touchAuthActivity = useCallback(() => touchStoredActivity(), []);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    if (hasStoredSessionExpired()) {
      clearAuthState();
      setIsLoading(false);
      return;
    }

    api.me()
      .then((response) => {
        setUser(response.data.user);
        syncPendingVerification(null);
        touchAuthActivity();
      })
      .catch(() => {
        clearAuthState();
      })
      .finally(() => setIsLoading(false));
  }, [clearAuthState, syncPendingVerification, touchAuthActivity]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    if (!user) {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }

      return undefined;
    }

    const resetIdleTimer = () => {
      touchAuthActivity();

      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
      }

      logoutTimerRef.current = window.setTimeout(() => {
        void api.logout().catch(() => {}).finally(() => {
          clearAuthState();
        });
      }, AUTH_IDLE_TIMEOUT_MS);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resetIdleTimer();
      }
    };

    const activityEvents = ["pointerdown", "keydown", "touchstart", "focus"];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetIdleTimer, true);
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    resetIdleTimer();

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetIdleTimer, true);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
  }, [clearAuthState, touchAuthActivity, user]);

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
      touchAuthActivity();
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
      touchAuthActivity();
      return response.data.user;
    },
    async verifyEmailCode(payload) {
      const email = payload?.email || pendingVerification?.email;
      const response = await api.verifyEmailCode({ ...payload, email });

      setStoredToken(response.data.token);
      syncPendingVerification(null);
      setUser(response.data.user);
      touchAuthActivity();

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
        touchAuthActivity();
        return response.data.user;
      } catch (error) {
        clearAuthState();
        throw error;
      }
    },
    async logout() {
      try {
        await api.logout();
      } finally {
        clearAuthState();
      }
    },
    syncUser(nextUser) {
      setUser(nextUser);
    },
    clearPendingVerification() {
      syncPendingVerification(null);
    },
  }), [clearAuthState, isLoading, pendingVerification, syncPendingVerification, touchAuthActivity, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}