import { NavLink } from "react-router-dom";
import Logo from "../Logo";
import {
  HiHome, HiChartBar, HiChatAlt2,
  HiCog, HiUser, HiArrowLeft
} from "react-icons/hi";

const navItems = [
  { to: "/",            icon: HiHome,     label: "Homepage"    },
  { to: "/leaderboard", icon: HiChartBar, label: "Leaderboard" },
  { to: "/messages",    icon: HiChatAlt2, label: "Message"     },
  { to: "/settings",    icon: HiCog,      label: "Settings"    },
  { to: "/profile",     icon: HiUser,     label: "Profile"     },
];

export default function Sidebar() {
  return (
    <aside className="flex flex-col w-[270px] min-h-screen
                      bg-[#f5a623] flex-shrink-0">
      <div className="px-5 pt-6 pb-4">
        {/* Logo always dark text on yellow sidebar */}
        <div>
          <div
            className="text-[2rem] font-bold leading-none mb-1 text-gray-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <span style={{ fontStyle: "italic" }}>D</span>eyMake
          </div>
          <p
            className="text-[0.65rem] tracking-[0.18em] uppercase text-gray-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Content By You, Loved By All
          </p>
        </div>
      </div>

      <nav className="flex flex-col flex-1 mt-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3.5 text-[0.95rem]
               font-semibold transition-colors duration-150
               ${isActive
                 ? "bg-white/30 text-gray-900 border-l-4 border-gray-900"
                 : "text-gray-900 hover:bg-black/10"
               }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <button className="flex items-center gap-3 px-5 py-5
                         text-red-700 font-semibold text-[0.95rem]
                         hover:bg-black/10 transition-colors
                         bg-transparent border-none cursor-pointer
                         w-full text-left">
        <HiArrowLeft className="w-5 h-5" />
        Logout
      </button>
    </aside>
  );
}