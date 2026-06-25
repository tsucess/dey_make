import { Link, NavLink } from "react-router-dom";
import { RiLogoutCircleLine } from "react-icons/ri";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  HiOutlineViewGrid,
  HiOutlineChartBar,
  HiOutlineChatAlt2,
  HiOutlineCog,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineUserGroup,
  HiOutlineMail,
  HiOutlineDotsHorizontal,
  HiOutlineInformationCircle,
  HiOutlineBell,
  HiOutlineStatusOnline,
} from "react-icons/hi";
import { MdOutlineSurroundSound } from "react-icons/md";
import { IoTrophyOutline, IoCompassOutline } from "react-icons/io5";

function getNavItems(t, isAdmin, user) {
  return [
    { to: "/home", icon: HiOutlineViewGrid, label: t("common.homepage") },
    { to: "/explore", icon: IoCompassOutline, label: "Explore" },
    { to: "/connection", icon: "AVATAR", label: "Connections" },
    { to: "/mutual", icon: IoCompassOutline, label: "Mutuals" },
    { to: "/messages", icon: HiOutlineMail, label: t("common.messages") },
    { to: "/challenge", icon: IoTrophyOutline, label: "Challenge" },
    { to: "/live", icon: HiOutlineStatusOnline, label: t("common.live") },
    { to: "/notifications", icon: HiOutlineBell, label: "Notifications" },
    { to: "/profile", icon: HiOutlineUser, label: t("common.profile") },
    { to: "/more", icon: HiOutlineDotsHorizontal, label: "More" },
    { to: "/help", icon: HiOutlineInformationCircle, label: "Help" },
    ...(isAdmin
      ? [{ to: "/admin", icon: HiOutlineShieldCheck, label: t("common.admin") }]
      : []),
  ];
}

export default function Sidebar() {
  const { logout, user } = useAuth();
  const { t } = useLanguage();
  const navItems = getNavItems(t, Boolean(user?.isAdmin), user);

  return (
    <aside
      className="flex flex-col w-67.5 min-h-screen
                      bg-white dark:bg-black300 border-r border-orange100 shrink-0"
    >
      <div className="flex flex-col justify-center px-8 h-18.5 bg-orange100 border-t border-b border-orange100 shrink-0">
        <Link to="/home" className="flex flex-col items-start">
          <img
            src="/DEYMAKE LOGO with Tagline Black.svg"
            alt={t("app.name")}
            className="w-35 h-auto object-contain"
          />
        </Link>
      </div>

      <nav
        className="flex flex-col flex-1 mt-4 space-y-1 overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`
          nav::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/home"}
            className={({ isActive }) =>
              `flex items-center gap-4 px-8 py-3 text-[15px]
               font-medium transition-colors duration-150 font-inter
               ${
                 isActive ? "text-orange100 hover:text-orange500" : "text-black500 dark:text-slate150 hover:text-orange200 hover:dark:text-white"
               }`
            }
          >
            {Icon === "AVATAR" ? (
              <img
                src={
                  user?.avatarUrl ||
                  "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&q=80"
                }
                alt="Connections"
                className="w-5 h-5 rounded-full object-cover border border-orange100 shrink-0"
              />
            ) : (
              <Icon className="w-5 h-5 shrink-0" />
            )}
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        className="flex items-center gap-4 px-8 py-6 mb-4
                         text-black500 dark:text-slate150 hover:text-orange200 hover:dark:text-white font-medium text-[15px]
                          font-inter transition-colors
                         bg-transparent border-none cursor-pointer
                         w-full text-left mt-auto"
        onClick={logout}
      >
        <RiLogoutCircleLine className="w-5 h-5" />
        {t("common.logout") || "Logout"}
      </button>
    </aside>
  );
}
