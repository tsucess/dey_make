import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import { Outlet, useLocation } from "react-router-dom";
import { HiOutlineSearch } from "react-icons/hi";
import { IoMoonOutline, IoNotificationsOutline } from "react-icons/io5";
import { MdSunny } from "react-icons/md";
import { useTheme } from "../../context/ThemeContext";

function getMobileTitle(pathname) {
  if (pathname.startsWith("/home")) return "DeyMake";
  if (pathname.startsWith("/leaderboard")) return "Leaderboard";
  if (pathname.startsWith("/messages")) return "Inbox";
  if (pathname.startsWith("/profile")) return "Profile";
  if (pathname.startsWith("/settings")) return "Settings";

  return "DeyMake";
}

function MobileActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F6F6F6] text-[#A7A7A7] transition-colors hover:bg-[#EFEFEF] dark:bg-[#2A2A2A] dark:text-[#D5D5D5] dark:hover:bg-[#333333]"
    >
      {children}
    </button>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const isHomepage = location.pathname === "/home";
  const mobileTitle = getMobileTitle(location.pathname);

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
            <img src="/logo-footer.png" alt="DeyMake" className="h-10 w-auto" />
          ) : (
            <h1 className="text-[2rem] font-semibold font-inter text-slate100 dark:text-white">
              {mobileTitle}
            </h1>
          )}

          <div className="flex items-center gap-3">
            {isHomepage ? (
              <>
                <MobileActionButton onClick={toggleTheme}>
                  {isDark ? <MdSunny className="h-5 w-5" /> : <IoMoonOutline className="h-5 w-5" />}
                </MobileActionButton>
                <MobileActionButton>
                  <HiOutlineSearch className="h-5 w-5" />
                </MobileActionButton>
                <MobileActionButton>
                  <IoNotificationsOutline className="h-5 w-5" />
                </MobileActionButton>
              </>
            ) : (
              <MobileActionButton>
                <HiOutlineSearch className="h-5 w-5" />
              </MobileActionButton>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-[108px] md:pb-0">
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