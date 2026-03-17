import { NavLink } from "react-router-dom";
import { RiLogoutCircleLine } from "react-icons/ri";
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
    <aside className="flex flex-col w-67.5 min-h-screen
                      bg-orange100 shrink-0">
      <div className="px-5 pt-6 pb-4">
        {/* Logo always dark text on yellow sidebar */}
        <img src="./logo-app.png" className="w-47 h-16.5"/>
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
                 ? "bg-orange300 text-black border-r-8 border-black shadow-nav-web"
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
                         w-full text-left">
        <RiLogoutCircleLine className="w-6 h-6"/>
        Logout
      </button>
    </aside>
  );
}