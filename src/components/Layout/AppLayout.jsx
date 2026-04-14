import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineSearch } from "react-icons/hi";
import { IoMdSettings } from "react-icons/io";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { buildSearchPath } from "../../utils/search";
import Notification from "../Notification";
import NotificationButton from "./NotificationButton";
import RealtimeNotificationPopup from "./RealtimeNotificationPopup";
import { useNotifications } from "./useNotifications";

function getMobileTitle(pathname, t) {
  if (pathname.startsWith("/home")) return t("app.name");
  if (pathname.startsWith("/live")) return t("common.live");
  if (pathname.startsWith("/leaderboard")) return t("common.leaderboard");
  if (pathname.startsWith("/messages")) return t("common.messages");
  if (pathname.startsWith("/admin")) return t("common.admin");
  if (pathname.startsWith("/profile") || pathname.startsWith("/users/")) return t("common.profile");
  if (pathname.startsWith("/search")) return t("common.search");
  if (pathname.startsWith("/settings")) return t("common.settings");

  return t("app.name");
}

const mobileActionClassName = "flex h-11 w-11 items-center justify-center rounded-full bg-[#F6F6F6] text-[#A7A7A7] transition-colors hover:bg-[#EFEFEF] dark:bg-[#2A2A2A] dark:text-[#D5D5D5] dark:hover:bg-black100";

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
    <Link to={to} aria-label={ariaLabel} title={title ?? ariaLabel} className={mobileActionClassName}>
      {children}
    </Link>
  );
}

export default function AppLayout() {
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

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-gray-50 dark:bg-[#121212] md:h-screen">
      {/* Sidebar — desktop only */}
      {isAuthenticated ? (
        <div className="hidden md:flex">
          <Sidebar />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TopBar — desktop only */}
        <div className="hidden md:block">
          <TopBar notificationState={notificationState} />
        </div>

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
        <div className="sticky top-0 z-20 flex items-center justify-between bg-white px-4 pb-4 pt-5 dark:bg-[#1A1A1A] md:hidden">
          {isHomepage ? (
            <img src="/DEYMAKE LOGO Yellow.svg" alt={t("app.name")} className="h-10 w-auto" />
          ) : (
            <h1 className="text-2xl font-bricolage font-semibold text-slate100 dark:text-white">
              {mobileTitle}
            </h1>
          )}

          <div className="flex items-center gap-3">
            {isHomepage ? (
              <>
              
                <MobileActionButton onClick={openSearch} ariaLabel={t("layout.openSearch")}>
                  <HiOutlineSearch className="h-5 w-5" />
                </MobileActionButton>
                {isAuthenticated ? (
                  <NotificationButton
                    onClick={openNotification}
                    ariaLabel={t("common.notifications")}
                    unreadCount={unreadNotificationCount}
                    className={mobileActionClassName}
                    iconClassName="h-5 w-5"
                  />
                ) : null}
              </>
            ) : (
              <MobileActionButton onClick={openSearch} ariaLabel={t("layout.openSearch")}>
                <HiOutlineSearch className="h-5 w-5" />
              </MobileActionButton>
            )}
            {isAuthenticated && isProfile ? (
              <MobileActionLink to="/settings" ariaLabel={t("layout.openSettings")}>
                  <IoMdSettings className="h-5 w-5" />
              </MobileActionLink>
            ) : null}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-27 bg-white dark:bg-slate100 md:pb-0">
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