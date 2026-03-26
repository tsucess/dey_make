import { Link } from "react-router-dom";
import { HiSearch, HiPlus } from "react-icons/hi";
import { IoNotificationsOutline } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";

export default function TopBar() {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between pl-30 pr-6 pb-3 pt-10
                       bg-white dark:bg-slate100
                       sticky top-0 z-10">

      {/* Search */}
      <div className="flex items-center gap-2 w-70
                      bg-white300 dark:bg-black100
                      rounded-full px-4 py-2 border-[0.15px] border-slate700 ">
        <HiSearch className="w-4 h-4 shrink-0
                             text-black dark:text-slate200" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none border-none
                     w-full text-sm font-inter
                     text-black dark:text-slate200
                     placeholder-black dark:placeholder-slate200"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">

        {/* Create */}
        <Link
          to="/create"
          className="flex items-center gap-1.5
                     bg-orange100 font-inter hover:bg-[#e09510]
                     text-black font-semibold text-sm
                     px-6 py-2.5 rounded-full
                     border-none cursor-pointer
                     transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          Create
        </Link>


        {/* Bell */}
        <button className="w-9 h-9 flex items-center justify-center
                           rounded-full border-none cursor-pointer
                           bg-transparent
                           hover:bg-gray-100 dark:hover:bg-[#2d2d2d]
                           transition-colors">
          <IoNotificationsOutline  className="w-5 h-5 text-black dark:text-white"/>
        </button>

        {/* Avatar */}
        <Link to="/profile">
          <img
            src={user?.avatarUrl || "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&q=80"}
            alt={user?.fullName || "Profile"}
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
          />
        </Link>
      </div>
    </header>
  );
}