import { HiBell, HiSearch, HiPlus } from "react-icons/hi";
import ThemeToggle from "../ThemeToggle";

export default function TopBar() {
  return (
    <header className="flex items-center justify-between px-6 py-3
                       bg-white dark:bg-[#1a1a1a]
                       border-b border-gray-100 dark:border-[#2d2d2d]
                       sticky top-0 z-10">

      {/* Search */}
      <div className="flex items-center gap-2 w-[280px]
                      bg-gray-100 dark:bg-[#2d2d2d]
                      rounded-full px-4 py-2">
        <HiSearch className="w-4 h-4 flex-shrink-0
                             text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none border-none
                     w-full text-sm
                     text-gray-700 dark:text-gray-200
                     placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">

        {/* Create */}
        <button className="flex items-center gap-1.5
                           bg-[#f5a623] hover:bg-[#e09510]
                           text-white font-semibold text-sm
                           px-4 py-2 rounded-full
                           border-none cursor-pointer
                           transition-colors">
          <HiPlus className="w-4 h-4" />
          Create
        </button>

        {/* Dark mode toggle */}
        <ThemeToggle />

        {/* Bell */}
        <button className="w-9 h-9 flex items-center justify-center
                           rounded-full border-none cursor-pointer
                           bg-transparent
                           hover:bg-gray-100 dark:hover:bg-[#2d2d2d]
                           transition-colors">
          <HiBell className="w-5 h-5
                             text-gray-500 dark:text-gray-400" />
        </button>

        {/* Avatar */}
        <img
          src="https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&q=80"
          alt="avatar"
          className="w-9 h-9 rounded-full object-cover cursor-pointer"
        />
      </div>
    </header>
  );
}