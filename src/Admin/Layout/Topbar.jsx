import { IoIosSearch } from "react-icons/io";
import { RiNotification3Line } from "react-icons/ri";
import { FiMenu } from "react-icons/fi";

function Topbar({ setIsSidebarOpen }) {
  return <div className="flex items-center justify-between h-22 bg-blue100 px-4 md:px-8 py-5">
    <div className="flex gap-3.5 items-center">
        <button className="md:hidden text-white" onClick={() => setIsSidebarOpen(true)}>
          <FiMenu className="w-6 h-6" />
        </button>
        <img src="/story3.jpg" alt="" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"/>
        <div className="flex flex-col gap-1 font-inter">
            <h5 className="text-base md:text-lg font-medium text-white">Sophia Williams</h5>
            <span className="hidden md:block text-sm text-white">Welcome back, Admin! Here’s what’s happening on DeyMake today.</span>
        </div>
    </div>
    <div className="flex items-center gap-3">
        <div className="bg-zinc100 w-8 h-8 md:w-10 md:h-10 rounded-sm flex items-center justify-center relative shrink-0">
            <RiNotification3Line className="w-4 h-4 md:w-5 md:h-5 text-blue100 relative" />
            <span className="w-1 h-1 bg-red100 rounded-full absolute top-2 right-2 md:top-3 md:right-3"></span>
        </div>
        <div className="bg-zinc100 rounded-md w-28 md:w-44 h-8 md:h-10 flex items-center gap-1 px-2">
            <IoIosSearch className="w-4 h-4 text-blue100 shrink-0" />
            <input type="search" name="" id="" placeholder="Search" className="text-blue100 text-sm font-inter flex-1 outline-none w-full bg-transparent"/>
        </div>
    </div>
  </div>;
}

export default Topbar;
