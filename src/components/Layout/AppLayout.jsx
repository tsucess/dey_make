import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineSearch } from "react-icons/hi";
import { IoMdSettings } from "react-icons/io";
import { IoMoonOutline, IoNotificationsOutline } from "react-icons/io5";
import { MdSunny } from "react-icons/md";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { buildSearchPath } from "../../utils/search";

function getMobileTitle(pathname, t) {
  if (pathname.startsWith("/home")) return t("app.name");
  if (pathname.startsWith("/live")) return t("common.live");
  if (pathname.startsWith("/leaderboard")) return t("common.leaderboard");
  if (pathname.startsWith("/messages")) return t("common.messages");
  if (pathname.startsWith("/profile")) return t("common.profile");
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
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isHomepage = location.pathname === "/home";
  const isProfile = location.pathname === "/profile";
  const mobileTitle = getMobileTitle(location.pathname, t);

  function openSearch() {
    navigate(buildSearchPath());
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-gray-50 dark:bg-[#121212] md:h-screen">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TopBar — desktop only */}
        <div className="hidden md:block">
          <TopBar />
        </div>

        {/* Mobile TopBar */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-white px-4 pb-4 pt-5 dark:bg-[#1A1A1A] md:hidden">
          {isHomepage ? (
            <img src="/logo-footer.png" alt={t("app.name")} className="h-10 w-auto" />
          ) : (
            <h1 className="text-2xl font-bricolage font-semibold text-slate100 dark:text-white">
              {mobileTitle}
            </h1>
          )}

          <div className="flex items-center gap-3">
            {isHomepage ? (
              <>
                <MobileActionButton
                  onClick={toggleTheme}
                  ariaLabel={isDark ? t("layout.switchToLightMode") : t("layout.switchToDarkMode")}
                >
                  {isDark ? <MdSunny className="h-5 w-5" /> : <IoMoonOutline className="h-5 w-5" />}
                </MobileActionButton>
                <MobileActionButton onClick={openSearch} ariaLabel={t("layout.openSearch")}>
                  <HiOutlineSearch className="h-5 w-5" />
                </MobileActionButton>
                <MobileActionButton ariaLabel={t("common.notifications")}>
                  <IoNotificationsOutline className="h-5 w-5" />
                </MobileActionButton>
              </>
            ) : (
              <MobileActionButton onClick={openSearch} ariaLabel={t("layout.openSearch")}>
                <HiOutlineSearch className="h-5 w-5" />
              </MobileActionButton>
            )}
            {isProfile ? (
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
        <div className="flex md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}