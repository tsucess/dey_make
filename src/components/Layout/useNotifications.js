import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { api, firstError } from "../../services/api";
import { subscribeToPrivateChannel } from "../../services/realtime";
import { buildVideoLink } from "../../utils/content";

const NOTIFICATION_POLL_INTERVAL_MS = 15000;
const REALTIME_NOTIFICATION_POPUP_MS = 5000;

function isDocumentHidden() {
  return typeof document !== "undefined" && document.visibilityState === "hidden";
}

function hasDocumentFocus() {
  if (typeof document === "undefined" || typeof document.hasFocus !== "function") {
    return true;
  }

  return document.hasFocus();
}

function supportsBrowserNotifications() {
  return typeof window !== "undefined" && typeof window.Notification !== "undefined";
}

function upsertNotification(current, notification) {
  if (!notification?.id) return current;

  const existingIndex = current.findIndex((entry) => entry.id === notification.id);
  if (existingIndex === -1) return [notification, ...current];

  const next = [...current];
  next[existingIndex] = { ...next[existingIndex], ...notification };

  return next.sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());
}

export function useNotifications({ enabled = true } = {}) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  const isNotificationOpenRef = useRef(false);
  const notificationsRefreshInFlightRef = useRef(false);
  const browserNotificationsRef = useRef(new Map());
  const realtimePopupTimeoutRef = useRef(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [markingAllNotificationsRead, setMarkingAllNotificationsRead] = useState(false);
  const [busyNotificationId, setBusyNotificationId] = useState(null);
  const [realtimePopupNotification, setRealtimePopupNotification] = useState(null);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications],
  );

  const notificationSettings = user?.preferences?.notificationSettings || {};
  const canShowRealtimePopup = notificationSettings.inAppRealtime !== false;
  const canShowBrowserNotification = notificationSettings.browserRealtime !== false;

  useEffect(() => {
    isMountedRef.current = true;
    const activeBrowserNotifications = browserNotificationsRef.current;

    return () => {
      if (realtimePopupTimeoutRef.current) window.clearTimeout(realtimePopupTimeoutRef.current);
      activeBrowserNotifications.forEach((notification) => notification?.close?.());
      activeBrowserNotifications.clear();
      isMountedRef.current = false;
    };
  }, []);

  const dismissRealtimePopup = useCallback(() => {
    if (realtimePopupTimeoutRef.current) {
      window.clearTimeout(realtimePopupTimeoutRef.current);
      realtimePopupTimeoutRef.current = null;
    }

    setRealtimePopupNotification(null);
  }, []);

  const closeBrowserNotification = useCallback((notificationId) => {
    const activeNotification = browserNotificationsRef.current.get(notificationId);
    if (!activeNotification) return;

    activeNotification.close?.();
    browserNotificationsRef.current.delete(notificationId);
  }, []);

  const closeAllBrowserNotifications = useCallback(() => {
    browserNotificationsRef.current.forEach((notification) => notification?.close?.());
    browserNotificationsRef.current.clear();
  }, []);

  const maybeRequestBrowserNotificationPermission = useCallback(() => {
    if (!supportsBrowserNotifications()) return;
    if (window.Notification.permission !== "default") return;
    if (typeof window.Notification.requestPermission !== "function") return;

    Promise.resolve(window.Notification.requestPermission()).catch(() => {});
  }, []);

  const loadNotifications = useCallback(async ({ silent = false, skipIfHidden = false } = {}) => {
    if (!enabled || !isAuthenticated) return;
    if (skipIfHidden && isDocumentHidden()) return;
    if (notificationsRefreshInFlightRef.current) return;

    notificationsRefreshInFlightRef.current = true;

    if (!silent) {
      setLoadingNotifications(true);
      setNotificationError("");
    }

    try {
      const response = await api.getNotifications();

      if (!isMountedRef.current) return;

      setNotifications(response?.data?.notifications || []);
      setNotificationError("");
    } catch (nextError) {
      if (!silent && isMountedRef.current) {
        setNotificationError(firstError(nextError.errors, nextError.message || t("topbar.unableToLoadNotifications")));
      }
    } finally {
      notificationsRefreshInFlightRef.current = false;
      if (!silent && isMountedRef.current) setLoadingNotifications(false);
    }
  }, [enabled, isAuthenticated, t]);

  const resolveNotificationDestination = useCallback((notification) => {
    const data = notification?.data || {};

    if (data.conversationId) return "/messages";
    if (data.videoId) return buildVideoLink({ id: data.videoId, isLive: notification?.type === "live" });
    if (data.creatorId) return `/users/${data.creatorId}`;
    if (data.membershipId || data.planId) return "/profile";

    return null;
  }, []);

  const handleMarkNotificationRead = useCallback(async (notificationId) => {
    setBusyNotificationId(notificationId);

    try {
      const response = await api.markNotificationRead(notificationId);
      const nextNotification = response?.data?.notification;

      setNotifications((current) => current.map((notification) => (
        notification.id === notificationId ? { ...notification, ...(nextNotification || {}), readAt: nextNotification?.readAt || notification.readAt || new Date().toISOString() } : notification
      )));
    } catch (nextError) {
      setNotificationError(firstError(nextError.errors, nextError.message || t("topbar.unableToUpdateNotification")));
    } finally {
      if (isMountedRef.current) setBusyNotificationId(null);
    }
  }, [t]);

  const closeNotification = useCallback(() => {
    setIsNotificationOpen(false);
  }, []);

  const handleSelectNotification = useCallback(async (notification) => {
    if (!notification?.readAt) {
      await handleMarkNotificationRead(notification.id);
    }

    const destination = resolveNotificationDestination(notification);

    if (destination) {
      navigate(destination);
      closeNotification();
    }
  }, [closeNotification, handleMarkNotificationRead, navigate, resolveNotificationDestination]);

  const showRealtimePopup = useCallback((notification) => {
    if (!enabled || !canShowRealtimePopup || !notification?.id || isNotificationOpenRef.current || isDocumentHidden()) return;

    if (realtimePopupTimeoutRef.current) {
      window.clearTimeout(realtimePopupTimeoutRef.current);
    }

    setRealtimePopupNotification(notification);
    realtimePopupTimeoutRef.current = window.setTimeout(() => {
      realtimePopupTimeoutRef.current = null;
      setRealtimePopupNotification(null);
    }, REALTIME_NOTIFICATION_POPUP_MS);
  }, [canShowRealtimePopup, enabled]);

  const showBrowserNotification = useCallback((notification) => {
    if (!enabled || !canShowBrowserNotification || !notification?.id || !supportsBrowserNotifications()) return false;
    if (window.Notification.permission !== "granted") return false;
    if (!isDocumentHidden() && hasDocumentFocus()) return false;

    closeBrowserNotification(notification.id);

    try {
      const browserNotification = new window.Notification(notification.title || t("topbar.realtimeNotification"), {
        body: notification.body || "",
        tag: `notification-${notification.id}`,
      });

      browserNotificationsRef.current.set(notification.id, browserNotification);

      browserNotification.onclick = () => {
        closeBrowserNotification(notification.id);
        if (typeof window.focus === "function") {
          window.focus();
        }
        void handleSelectNotification(notification);
      };

      browserNotification.onclose = () => {
        if (browserNotificationsRef.current.get(notification.id) === browserNotification) {
          browserNotificationsRef.current.delete(notification.id);
        }
      };

      return true;
    } catch {
      return false;
    }
  }, [canShowBrowserNotification, closeBrowserNotification, enabled, handleSelectNotification, t]);

  const handleMarkAllNotificationsRead = useCallback(async () => {
    if (!unreadNotificationCount) return;

    setMarkingAllNotificationsRead(true);

    try {
      await api.markAllNotificationsRead();
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((notification) => ({ ...notification, readAt: notification.readAt || readAt })));
    } catch (nextError) {
      setNotificationError(firstError(nextError.errors, nextError.message || t("topbar.unableToUpdateNotification")));
    } finally {
      if (isMountedRef.current) setMarkingAllNotificationsRead(false);
    }
  }, [t, unreadNotificationCount]);

  const openNotification = useCallback(() => {
    if (canShowBrowserNotification) {
      maybeRequestBrowserNotificationPermission();
    }
    closeAllBrowserNotifications();
    setIsNotificationOpen(true);
    void loadNotifications({ silent: true });
  }, [canShowBrowserNotification, closeAllBrowserNotifications, loadNotifications, maybeRequestBrowserNotificationPermission]);

  const onRetry = useCallback(() => loadNotifications(), [loadNotifications]);

  useEffect(() => {
    if (!enabled) return;

    if (!isAuthenticated) {
      setNotifications([]);
      setNotificationError("");
      setLoadingNotifications(false);
      setIsNotificationOpen(false);
      closeAllBrowserNotifications();
      dismissRealtimePopup();
      return;
    }

    void loadNotifications();
  }, [closeAllBrowserNotifications, dismissRealtimePopup, enabled, isAuthenticated, loadNotifications]);

  useEffect(() => {
    isNotificationOpenRef.current = isNotificationOpen;

    if (isNotificationOpen) {
      dismissRealtimePopup();
    }
  }, [dismissRealtimePopup, isNotificationOpen]);

  useEffect(() => {
    if (!enabled || canShowRealtimePopup) return;
    dismissRealtimePopup();
  }, [canShowRealtimePopup, dismissRealtimePopup, enabled]);

  useEffect(() => {
    if (!enabled || canShowBrowserNotification) return;
    closeAllBrowserNotifications();
  }, [canShowBrowserNotification, closeAllBrowserNotifications, enabled]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) return undefined;

    let polling = false;

    const intervalId = window.setInterval(async () => {
      if (polling || !isMountedRef.current) return;

      polling = true;

      try {
        await loadNotifications({ silent: true, skipIfHidden: true });
      } finally {
        polling = false;
      }
    }, NOTIFICATION_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [enabled, isAuthenticated, loadNotifications]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) return undefined;

    function refreshNotificationsOnAttention() {
      if (!isDocumentHidden() && hasDocumentFocus()) {
        closeAllBrowserNotifications();
      }

      void loadNotifications({ silent: true, skipIfHidden: true });
    }

    window.addEventListener("focus", refreshNotificationsOnAttention);
    document.addEventListener("visibilitychange", refreshNotificationsOnAttention);

    return () => {
      window.removeEventListener("focus", refreshNotificationsOnAttention);
      document.removeEventListener("visibilitychange", refreshNotificationsOnAttention);
    };
  }, [closeAllBrowserNotifications, enabled, isAuthenticated, loadNotifications]);

  useEffect(() => {
    if (!enabled || !isAuthenticated || !user?.id) return undefined;

    return subscribeToPrivateChannel(`notifications.${user.id}`, {
      ".notification.created": (event) => {
        if (!event?.notification) return;

        setNotifications((current) => upsertNotification(current, event.notification));
        setNotificationError("");

        const didShowBrowserNotification = showBrowserNotification(event.notification);
        if (!didShowBrowserNotification) {
          showRealtimePopup(event.notification);
        }
      },
      ".notification.updated": (event) => {
        if (!event?.notification) return;

        setNotifications((current) => upsertNotification(current, event.notification));
        if (event.notification.readAt) {
          closeBrowserNotification(event.notification.id);
        }
        setRealtimePopupNotification((current) => {
          if (current?.id !== event.notification.id) return current;
          return event.notification.readAt ? null : { ...current, ...event.notification };
        });
      },
      ".notification.deleted": (event) => {
        if (!event?.notificationId) return;

        closeBrowserNotification(event.notificationId);
        setNotifications((current) => current.filter((notification) => notification.id !== event.notificationId));
        setRealtimePopupNotification((current) => (current?.id === event.notificationId ? null : current));
      },
    });
  }, [closeBrowserNotification, enabled, isAuthenticated, showBrowserNotification, showRealtimePopup, user?.id]);

  return {
    isNotificationOpen,
    openNotification,
    closeNotification,
    notifications,
    loadingNotifications,
    notificationError,
    unreadNotificationCount,
    markingAllNotificationsRead,
    busyNotificationId,
    onRetry,
    handleSelectNotification,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead,
    realtimePopupNotification,
    dismissRealtimePopup,
  };
}