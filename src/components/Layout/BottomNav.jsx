import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

function LiveNavIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M7 8a7 7 0 0 0 0 8"/>
      <path d="M17 8a7 7 0 0 1 0 8"/>
      <path d="M10 10.5a3 3 0 0 0 0 3"/>
      <path d="M14 10.5a3 3 0 0 1 0 3"/>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function getNavItems(isAdmin) {
  return [
  {
    to: "/home",
    labelKey: "common.home",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    to: "/live",
    labelKey: "common.live",
    icon: <LiveNavIcon />,
  },
  {
    to: "/leaderboard",
    labelKey: "common.leaderboard",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    to: "/create",
    labelKey: "common.create",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
  },
  {
    to: "/messages",
    labelKey: "common.messages",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  ...(isAdmin ? [{
    to: "/admin",
    labelKey: "common.admin",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7 4v5c0 4.2-2.9 8.1-7 9-4.1-.9-7-4.8-7-9V7l7-4z"/>
        <path d="M9.5 12l1.7 1.7L14.8 10"/>
      </svg>
    ),
  }] : []),
  {
    to: "/profile",
    labelKey: "common.profile",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  ];
}

export default function BottomNav() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navItems = getNavItems(Boolean(user?.isAdmin));

  return (
    <nav
      className="fixed bottom-0 left-0 z-50 flex h-22 w-full items-start justify-between border-t-[0.33px] border-slate900/10 bg-orange100/5 px-3 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#1C2336]/80 md:hidden"
    >
      {navItems.map(({ to, labelKey, icon }) => {
        const label = t(labelKey);

        return (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) => {
            const isCreate = to === "/create";

            return `flex items-center justify-center rounded-full transition-all duration-200 ${
              isCreate
                ? "h-11 w-12 bg-white text-slate900 dark:bg-black100 dark:text-slate200"
                : isActive
                  ? "h-10 w-10 bg-white text-orange100 dark:bg-black100"
                  : "h-10 w-10 bg-white text-slate900 dark:bg-black100 dark:text-slate200"
            }`;
          }}
          aria-label={label}
        >
          {icon}
        </NavLink>
        );
      })}
    </nav>
  );
}