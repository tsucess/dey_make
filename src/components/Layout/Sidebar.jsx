import { Link, NavLink } from "react-router-dom";
import { RiLogoutCircleLine } from "react-icons/ri";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  HiHome, HiChartBar, HiChatAlt2,
  HiCog, HiShieldCheck, HiUser
} from "react-icons/hi";
import { MdOutlineSurroundSound } from "react-icons/md";

function getNavItems(t, isAdmin) {
  return [
    { to: "/home", icon: HiHome, label: t("common.homepage") },
    { to: "/live", icon: MdOutlineSurroundSound, label: t("common.live") },
    { to: "/leaderboard", icon: HiChartBar, label: t("common.leaderboard") },
    { to: "/messages", icon: HiChatAlt2, label: t("common.messages") },
    ...(isAdmin ? [{ to: "/admin", icon: HiShieldCheck, label: t("common.admin") }] : []),
    { to: "/settings", icon: HiCog, label: t("common.settings") },
    { to: "/profile", icon: HiUser, label: t("common.profile") },
  ];
}

export default function Sidebar() {
  const { logout, user } = useAuth();
  const { t } = useLanguage();
  const navItems = getNavItems(t, Boolean(user?.isAdmin));

  return (
    <aside className="flex flex-col w-67.5 min-h-screen
                      bg-orange100 shrink-0">
      <div className="px-5 pt-6 pb-4">
        {/* Logo always dark text on yellow sidebar */}
        <Link to='/home'><img src="/DEYMAKE LOGO with Tagline Black.svg" alt={t("app.name")} className="w-47 h-16.5"/></Link>
        
      </div>

      <nav className="flex flex-col flex-1 mt-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-7 px-5 py-3.5 text-sm
               font-medium transition-colors duration-150 font-inter
               ${isActive
                 ? "bg-orange300 text-black border-r-8 border-black"
                 : "text-black hover:bg-orange300"
               }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <button className="flex items-center gap-3 px-5 py-5
                         text-red-700 font-medium text-[0.95rem]
                         hover:bg-orange300 font-inter transition-colors
                         bg-transparent border-none cursor-pointer
                         w-full text-left"
        onClick={logout}>
        <RiLogoutCircleLine className="w-6 h-6"/>
        {t("common.logout")}
      </button>
    </aside>
  );
}