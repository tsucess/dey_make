import { NavLink } from "react-router-dom";

const navItems = [
  {
    to: "/home",
    label: "Home",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    to: "/leaderboard",
    label: "Leaderboard",
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
    label: "Create",
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
    label: "Messages",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    to: "/profile",
    label: "Profile",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-[430px] -translate-x-1/2 items-center justify-between rounded-[2rem] border border-black/5 bg-white/85 px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1C2336]/80 md:hidden"
    >
      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) => {
            const isCreate = to === "/create";

            return `flex items-center justify-center rounded-full transition-all duration-200 ${
              isCreate
                ? "h-12 w-[4.5rem] bg-white text-[#A5A5A5] shadow-[0_8px_20px_rgba(15,23,42,0.08)] dark:bg-white dark:text-[#A5A5A5]"
                : isActive
                  ? "h-12 w-12 bg-orange100 text-white shadow-[0_10px_20px_rgba(253,179,0,0.28)]"
                  : "h-12 w-12 bg-white text-[#B5B5B5] shadow-[0_8px_20px_rgba(15,23,42,0.06)] dark:bg-white dark:text-[#B5B5B5]"
            }`;
          }}
          aria-label={label}
        >
          {icon}
        </NavLink>
      ))}
    </nav>
  );
}