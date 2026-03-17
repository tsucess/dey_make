import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import ThemeToggle from "../ThemeToggle";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden
                    bg-gray-50 dark:bg-[#121212]">

      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">

        {/* TopBar — desktop only */}
        <div className="hidden md:block">
          <TopBar />
        </div>

        {/* Mobile TopBar */}
        <div className="flex md:hidden items-center justify-between
                        px-4 py-3 bg-white dark:bg-[#1a1a1a]
                        border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-[1.6rem] font-bold text-[#f5a623] font-serif">
            <span className="italic">D</span>eyMake
          </h1>
          <div className="flex items-center gap-1">
            {/* <ThemeToggle /> */}
            {/* Search */}
            <button className="w-8 h-8 flex items-center justify-center
                               text-gray-500 dark:text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            {/* Bell */}
            <button className="w-8 h-8 flex items-center justify-center
                               text-gray-500 dark:text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
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