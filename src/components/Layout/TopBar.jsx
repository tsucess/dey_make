import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiSearch, HiPlus } from "react-icons/hi";
import { IoNotificationsOutline } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { api, firstError } from "../../services/api";
import { subscribeToPrivateChannel } from "../../services/realtime";
import { buildVideoLink, formatSubscriberLabel, getProfileAvatar, getProfileName, getVideoTitle } from "../../utils/content";
import { buildSearchPath, normalizeSearchQuery } from "../../utils/search";
import { CreateDropdown } from "./CreateDropdown";
import Notification from "../Notification";

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

export default function TopBar() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const lookupRef = useRef(null);
  const isMountedRef = useRef(true);
  const isNotificationOpenRef = useRef(false);
  const notificationsRefreshInFlightRef = useRef(false);
  const browserNotificationsRef = useRef(new Map());
  const realtimePopupTimeoutRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [lookup, setLookup] = useState({ videos: [], creators: [], categories: [] });
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [markingAllNotificationsRead, setMarkingAllNotificationsRead] = useState(false);
  const [busyNotificationId, setBusyNotificationId] = useState(null);
  const [realtimePopupNotification, setRealtimePopupNotification] = useState(null);

  const normalizedQuery = useMemo(() => normalizeSearchQuery(query), [query]);
  const hasLookupResults = lookup.videos.length || lookup.creators.length || lookup.categories.length;
  const unreadNotificationCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications],
  );
  const notificationSettings = user?.preferences?.notificationSettings || {};
  const canShowRealtimePopup = notificationSettings.inAppRealtime !== false;
  const canShowBrowserNotification = notificationSettings.browserRealtime !== false;

  function toggleVisiblity() {
    setIsVisible((prev) => !prev);
  }

  const loadNotifications = useCallback(async ({ silent = false, skipIfHidden = false } = {}) => {
    if (!isAuthenticated) return;
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
  }, [isAuthenticated, t]);

  function openNotification() {
    if (canShowBrowserNotification) {
      maybeRequestBrowserNotificationPermission();
    }
    closeAllBrowserNotifications();
    setIsNotificationOpen(true);
    loadNotifications({ silent: true });
  }

  const closeNotification = useCallback(() => {
    setIsNotificationOpen(false);
  }, []);

  function closeLookup() {
    setIsLookupOpen(false);
  }

  function submitSearch(nextQuery = query) {
    navigate(buildSearchPath(nextQuery));
    closeLookup();
  }

  function selectSuggestion(nextQuery, tab) {
    navigate(buildSearchPath(nextQuery, tab));
    closeLookup();
  }

  function selectVideo(video) {
    navigate(buildVideoLink(video));
    closeLookup();
  }

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

  const showRealtimePopup = useCallback((notification) => {
    if (!canShowRealtimePopup || !notification?.id || isNotificationOpenRef.current || isDocumentHidden()) return;

    if (realtimePopupTimeoutRef.current) {
      window.clearTimeout(realtimePopupTimeoutRef.current);
    }

    setRealtimePopupNotification(notification);
    realtimePopupTimeoutRef.current = window.setTimeout(() => {
      realtimePopupTimeoutRef.current = null;
      setRealtimePopupNotification(null);
    }, REALTIME_NOTIFICATION_POPUP_MS);
  }, [canShowRealtimePopup]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    if (location.pathname.startsWith("/search")) {
      setQuery(searchParams.get("q") || "");
    }

    closeLookup();
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setNotificationError("");
      setLoadingNotifications(false);
      setIsNotificationOpen(false);
      closeAllBrowserNotifications();
      dismissRealtimePopup();
      return;
    }

    loadNotifications();
  }, [closeAllBrowserNotifications, dismissRealtimePopup, isAuthenticated, loadNotifications]);

  useEffect(() => {
    isNotificationOpenRef.current = isNotificationOpen;

    if (isNotificationOpen) {
      dismissRealtimePopup();
    }
  }, [dismissRealtimePopup, isNotificationOpen]);

  useEffect(() => {
    if (!canShowRealtimePopup) {
      dismissRealtimePopup();
    }
  }, [canShowRealtimePopup, dismissRealtimePopup]);

  useEffect(() => {
    if (!canShowBrowserNotification) {
      closeAllBrowserNotifications();
    }
  }, [canShowBrowserNotification, closeAllBrowserNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

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
  }, [isAuthenticated, loadNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    function refreshNotificationsOnAttention() {
      if (!isDocumentHidden() && hasDocumentFocus()) {
        closeAllBrowserNotifications();
      }

      loadNotifications({ silent: true, skipIfHidden: true });
    }

    window.addEventListener("focus", refreshNotificationsOnAttention);
    document.addEventListener("visibilitychange", refreshNotificationsOnAttention);

    return () => {
      window.removeEventListener("focus", refreshNotificationsOnAttention);
      document.removeEventListener("visibilitychange", refreshNotificationsOnAttention);
    };
  }, [closeAllBrowserNotifications, isAuthenticated, loadNotifications]);

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setLookup({ videos: [], creators: [], categories: [] });
      setLoadingLookup(false);
      setLookupError("");
      closeLookup();
      return undefined;
    }

    let ignore = false;
    const timeoutId = window.setTimeout(async () => {
      setLoadingLookup(true);
      setLookupError("");

      try {
        const response = await api.searchSuggestions(normalizedQuery);

        if (ignore) return;

        const nextLookup = {
          videos: response?.data?.videos || [],
          creators: response?.data?.creators || [],
          categories: response?.data?.categories || [],
        };

        setLookup(nextLookup);
        setIsLookupOpen(true);
      } catch (nextError) {
        if (!ignore) {
          setLookup({ videos: [], creators: [], categories: [] });
          setLookupError(firstError(nextError.errors, nextError.message || t("topbar.unableToLoadSuggestions")));
          setIsLookupOpen(true);
        }
      } finally {
        if (!ignore) setLoadingLookup(false);
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [normalizedQuery, t]);

  useEffect(() => {
    if (!isLookupOpen) return undefined;

    function handlePointerDown(event) {
      if (!lookupRef.current?.contains(event.target)) {
        closeLookup();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isLookupOpen]);

  const showLookup = isLookupOpen && normalizedQuery.length >= 2;

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

  async function handleSelectRealtimePopup(notification) {
    dismissRealtimePopup();
    await handleSelectNotification(notification);
  }

  const showBrowserNotification = useCallback((notification) => {
    if (!canShowBrowserNotification || !notification?.id || !supportsBrowserNotifications()) return false;
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
  }, [canShowBrowserNotification, closeBrowserNotification, handleSelectNotification, t]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return undefined;

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
  }, [closeBrowserNotification, isAuthenticated, showBrowserNotification, showRealtimePopup, user?.id]);

  function handleSubmit(event) {
    event.preventDefault();
    submitSearch();
  }

  function handleInputKeyDown(event) {
    if (event.key === "Escape") {
      closeLookup();
      event.currentTarget.blur();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
    }
  }

  return (
    <>
    {realtimePopupNotification ? (
      <div className="pointer-events-none fixed right-4 top-24 z-120 w-[min(24rem,calc(100vw-2rem))] md:right-6" role="status" aria-live="polite">
        <div className="pointer-events-auto rounded-[1.75rem] border border-orange100/30 bg-white p-4 shadow-2xl dark:border-orange100/20 dark:bg-[#171717]">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => handleSelectRealtimePopup(realtimePopupNotification)}
              className="min-w-0 flex-1 rounded-[1.25rem] text-left"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500 dark:text-orange-300">{t("topbar.realtimeNotification")}</p>
              <p className="mt-2 truncate text-sm font-semibold text-black dark:text-white">{realtimePopupNotification.title}</p>
              {realtimePopupNotification.body ? (
                <p className="mt-1 line-clamp-2 text-sm text-slate600 dark:text-slate200">{realtimePopupNotification.body}</p>
              ) : null}
            </button>
            <button
              type="button"
              onClick={dismissRealtimePopup}
              aria-label={t("topbar.dismissRealtimeNotification")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] text-slate700 transition-colors hover:bg-[#ECECEC] dark:bg-black100 dark:text-slate200 dark:hover:bg-[#2A2A2A]"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    ) : null}
    <Notification
      isVisible={isNotificationOpen}
      closeNotification={closeNotification}
      notifications={notifications}
      loading={loadingNotifications}
      error={notificationError}
      unreadCount={unreadNotificationCount}
      markingAllRead={markingAllNotificationsRead}
      busyNotificationId={busyNotificationId}
      onRetry={() => loadNotifications()}
      onSelectNotification={handleSelectNotification}
      onMarkNotificationRead={handleMarkNotificationRead}
      onMarkAllRead={handleMarkAllNotificationsRead}
    />
    <header className="flex items-center justify-between pl-30 pr-6 pb-3 pt-10
                       bg-white dark:bg-slate100
                       sticky top-0 z-10 ">

      {/* Search */}
      <div ref={lookupRef} className="relative w-70">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-full border-[0.15px] border-slate700 bg-white300 px-4 py-2 dark:bg-black100"
        >
          <button type="submit" className="shrink-0 border-none bg-transparent p-0" aria-label={t("topbar.submitSearch")}>
            <HiSearch className="h-4 w-4 text-black dark:text-slate200" />
          </button>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => {
              if (normalizedQuery.length >= 2) setIsLookupOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={t("topbar.searchPlaceholder")}
            aria-label={t("topbar.searchAriaLabel")}
            className="w-full border-none bg-transparent text-sm font-inter text-black outline-none placeholder-black dark:text-slate200 dark:placeholder-slate200"
          />
        </form>

        {showLookup ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-30 rounded-3xl border border-black/5 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#1B1B1B]">
            {loadingLookup ? (
              <p className="text-sm text-slate500 dark:text-slate200">{t("topbar.lookingUpMatches")}</p>
            ) : lookupError ? (
              <p className="text-sm text-red-600">{lookupError}</p>
            ) : hasLookupResults ? (
              <div className="space-y-4">
                {lookup.videos.length ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate400">{t("common.videos")}</p>
                    <div className="space-y-1.5">
                      {lookup.videos.map((video) => (
                        <button
                          key={video.id}
                          type="button"
                          onClick={() => selectVideo(video)}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-[#F5F5F5] dark:hover:bg-white/5"
                        >
                          <img src={getProfileAvatar(video.author || video.creator)} alt="" className="h-10 w-10 rounded-2xl object-cover" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-black dark:text-white">{getVideoTitle(video)}</p>
                            <p className="truncate text-xs text-slate500 dark:text-slate200">{getProfileName(video.author || video.creator)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {lookup.creators.length ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate400">{t("common.creators")}</p>
                    <div className="space-y-1.5">
                      {lookup.creators.map((creator) => (
                        <button
                          key={creator.id}
                          type="button"
                          onClick={() => selectSuggestion(getProfileName(creator), "creators")}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-[#F5F5F5] dark:hover:bg-white/5"
                        >
                          <img src={getProfileAvatar(creator)} alt="" className="h-10 w-10 rounded-full object-cover" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-black dark:text-white">{getProfileName(creator)}</p>
                            <p className="truncate text-xs text-slate500 dark:text-slate200">{formatSubscriberLabel(creator.subscriberCount || 0)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {lookup.categories.length ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate400">{t("common.categories")}</p>
                    <div className="flex flex-wrap gap-2">
                      {lookup.categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => selectSuggestion(category.label || category.name, "categories")}
                          className="rounded-full bg-[#F5F5F5] px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-[#ECECEC] dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                        >
                          {category.label || category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => submitSearch()}
                  className="w-full rounded-full bg-orange100 px-4 py-2.5 text-sm font-semibold text-black"
                >
                  {t("topbar.viewAllResultsFor", { query: normalizedQuery })}
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate500 dark:text-slate200">{t("topbar.noQuickMatches")}</p>
            )}
          </div>
        ) : null}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 relative">
        {isAuthenticated ? (
          <>
            {/* Create */}
            <button onClick={toggleVisiblity}
              className="flex items-center gap-1.5
                         bg-orange100 font-inter hover:bg-[#e09510]
                         text-black font-semibold text-sm
                         px-6 py-2.5 rounded-full
                         border-none cursor-pointer
                         transition-colors"
            >
              <HiPlus className="w-4 h-4" />
              {t("common.create")}
            </button>
            <CreateDropdown isVisible={isVisible}/>

            {/* Bell */}
            <button onClick={openNotification} aria-label={t("common.notifications")} className="w-9 h-9 flex items-center justify-center
                               rounded-full border-none cursor-pointer
                               bg-transparent
                               hover:bg-gray-100 dark:hover:bg-[#2d2d2d]
                               transition-colors relative">
              <IoNotificationsOutline  className="w-5 h-5 text-black dark:text-white"/>
              {unreadNotificationCount ? (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                </span>
              ) : null}
            </button>
            

            {/* Avatar */}
            <Link to="/profile">
              <img
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&q=80"}
                alt={user?.fullName || t("common.profile")}
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
              />
            </Link>
          </>
        ) : null}
      </div>
    </header>
    </>
  );
}