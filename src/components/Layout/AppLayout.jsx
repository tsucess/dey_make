import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineSearch } from "react-icons/hi";
import { FiMenu } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { buildSearchPath } from "../../utils/search";
import Notification from "../Notification";
import NotificationButton from "./NotificationButton";
import RealtimeNotificationPopup from "./RealtimeNotificationPopup";
import { useNotifications } from "./useNotifications";
import { MdLiveTv } from "react-icons/md";

function getMobileTitle(pathname, t) {
  if (pathname.startsWith("/home")) return t("app.name");
  if (pathname.startsWith("/live")) return t("common.live");
  if (pathname.startsWith("/leaderboard")) return t("common.leaderboard");
  if (pathname.startsWith("/messages")) return t("common.messages");
  if (pathname.startsWith("/admin")) return t("common.admin");
  if (pathname.startsWith("/profile") || pathname.startsWith("/users/"))
    return t("common.profile");
  if (pathname.startsWith("/search")) return t("common.search");
  if (pathname.startsWith("/settings")) return t("common.settings");

  return t("app.name");
}

const mobileActionClassName =
  "flex h-9 w-9 items-center justify-center rounded-full text-[#A7A7A7] transition-colors hover:bg-[#EFEFEF] dark:bg-[#2A2A2A] dark:text-[#D5D5D5] dark:hover:bg-black100";

function MobileActionButton({ children, onClick, ariaLabel, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      className={mobileActionClassName}
    >
      {children}
    </button>
  );
}

function MobileActionLink({ children, to, ariaLabel, title }) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      className={mobileActionClassName}
    >
      {children}
    </Link>
  );
}

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  useTheme();
  const { t } = useLanguage();
  const isHomepage = location.pathname === "/home";
  const isProfile = location.pathname === "/profile";
  const mobileTitle = getMobileTitle(location.pathname, t);
  const notificationState = useNotifications();
  const {
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
  } = notificationState;

  function openSearch() {
    navigate(buildSearchPath());
  }

  async function handleSelectRealtimePopup(notification) {
    dismissRealtimePopup();
    await handleSelectNotification(notification);
  }

  const topBarConfig = {
    "/home": {
      isHomepage: true,
      showSearch: true,
      showNotifications: true,
      showSettings: false,
    },
    "/connection": {
      isConnection: true,
      showSearch: true,
      showNotifications: true,
      showSettings: false,
    },

    "/profile": {
      hidden: true,
    },
    "/live": {
      hidden: true,
    },
    "/live-preview": {
      hidden: true,
    },
    "/lives": {
      hidden: true,
    },
    "/creator-dashboard": {
      title: "Creator Dashboard",
      showSearch: true,
      showNotifications: false,
      showSettings: false,
    },

    "/wallet": {
      title: "Wallet",
      showSearch: false,
      showNotifications: false,
      showSettings: false,
    },

    "/explore": {
      title: "Explore",
      showSearch: true,
      showNotifications: true,
      showSettings: false,
    },

    "/messages": {
      title: "Messages",
      showSearch: false,
      showNotifications: true,
      showSettings: false,
    },

    "/challenge": {
      hidden: true,
    },
  };

  const currentConfig = topBarConfig[location.pathname] || {
    title: "",
    showSearch: true,
    showNotifications: false,
    showSettings: false,
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-gray-50 dark:bg-[#121212] md:h-screen">
      {/* Sidebar — desktop and mobile */}
      {isAuthenticated ? (
        <div className="md:flex">
          <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TopBar — desktop only */} 
        {!location.pathname.startsWith("/messages") &&
          !location.pathname.startsWith("/challenge") &&
          !location.pathname.startsWith("/coins-wallet") &&
          !location.pathname.startsWith("/live") &&
          !location.pathname.startsWith("/live-preview") &&
          !location.pathname.startsWith("/create-campaign") &&
          !location.pathname.startsWith("/post-detail") &&
          !location.pathname.startsWith("/lives") && (
            <div className="hidden md:block">
              <TopBar notificationState={notificationState} />
            </div>
          )}

        {/* Mobile TopBar */}
        <RealtimeNotificationPopup
          notification={realtimePopupNotification}
          onSelectNotification={handleSelectRealtimePopup}
          onDismiss={dismissRealtimePopup}
        />
        <Notification
          isVisible={isNotificationOpen}
          closeNotification={closeNotification}
          notifications={notifications}
          loading={loadingNotifications}
          error={notificationError}
          unreadCount={unreadNotificationCount}
          markingAllRead={markingAllNotificationsRead}
          busyNotificationId={busyNotificationId}
          onRetry={onRetry}
          onSelectNotification={handleSelectNotification}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
        />
        {!currentConfig.hidden && (
          <div className="sticky top-0 z-20 flex items-center font-bricolage justify-between gap-10 bg-white px-4 pb-4 pt-4 dark:bg-[#1A1A1A] md:hidden">
            {currentConfig.isHomepage || currentConfig.isConnection ? (
              <div className="flex justify-between items-center w-3/5">
                <button onClick={() => setIsSidebarOpen(true)} className="mr-2 md:hidden">
                  <FiMenu className="w-6 h-6 text-black dark:text-white" />
                </button>
                <button onClick={() => navigate("/live")}>
                  <MdLiveTv className="w-5 h-5 text-black dark:text-white" />
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/home")}
                    className={`text-black dark:text-white text-sm font-semibold relative ${currentConfig.isHomepage ? "after:content-[''] after:absolute after:-bottom-1 after:w-6 after:h-1 after:rounded-full after:bg-black after:dark:bg-white after:left-4" : ""}`}
                  >
                    For You
                  </button>
                  <button
                    onClick={() => navigate("/connection")}
                    className={`text-black dark:text-white text-sm font-semibold relative ${currentConfig.isConnection ? "after:content-[''] after:absolute after:-bottom-1 after:w-6 after:h-1 after:rounded-full after:bg-black after:dark:bg-white after:left-4" : ""}`}
                  >
                    Friends
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setIsSidebarOpen(true)} className="mr-2 md:hidden">
                  <FiMenu className="w-6 h-6 text-black dark:text-white" />
                </button>
                <h1 className="text-base font-bricolage font-semibold text-slate100 dark:text-white">
                  {currentConfig.title}
                </h1>
              </div>
            )}

            <div className="flex items-center gap-3">
              {currentConfig.showSearch && (
                <MobileActionButton
                  onClick={openSearch}
                  ariaLabel={t("layout.openSearch")}
                >
                  <HiOutlineSearch className="h-5 w-5" />
                </MobileActionButton>
              )}

              {currentConfig.showNotifications && isAuthenticated && (
                <NotificationButton
                  onClick={openNotification}
                  ariaLabel={t("common.notifications")}
                  unreadCount={unreadNotificationCount}
                  className={mobileActionClassName}
                  iconClassName="h-5 w-5"
                />
              )}

              {currentConfig.showSettings && isAuthenticated && (
                <MobileActionLink
                  to="/settings"
                  ariaLabel={t("layout.openSettings")}
                >
                  <IoMdSettings className="h-5 w-5" />
                </MobileActionLink>
              )}
            </div>
          </div>
        )}

        {/* Page content */}
        <main
          className={`${
            location.pathname === "/home" || location.pathname === "/live"
              ? "pb-0"
              : "pb-16"
          } flex-1 overflow-y-auto bg-white dark:bg-slate100 md:pb-0`}
        >
          <Outlet />
        </main>

        {/* Bottom nav — mobile only */}
        {isAuthenticated ? (
          <div className="flex md:hidden">
            <BottomNav />
          </div>
        ) : null}
      </div>
    </div>
  );
}
