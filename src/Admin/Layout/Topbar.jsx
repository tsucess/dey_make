import { IoIosSearch } from "react-icons/io";
import { RiNotification3Line } from "react-icons/ri";

function Topbar() {
  return <div className="flex items-center justify-between h-22 bg-blue100 px-8 py-5">
    <div className="flex gap-3.5 items-center">
        <img src="/story3.jpg" alt="" className="w-12 h-12 rounded-full object-cover"/>
        <div className="flex flex-col gap-1 font-inter">
            <h5 className="text-lg font-medium text-white">Sophia Williams</h5>
            <span className="text-sm text-white">Welcome back, Admin! Here’s what’s happening on DeyMake today.</span>
        </div>
    </div>
    <div className="flex items-center gap-3">
        <div className="bg-zinc100 w-10 h-10 rounded-sm flex items-center justify-center relative">
            <RiNotification3Line className="w-5 h-5 text-blue100 relative" />
            <span className="w-1 h-1 bg-red100 rounded-full absolute top-3 right-3"></span>
        </div>
        <div className="bg-zinc100 rounded-md w-44 h-10 flex items-center gap-1 px-2">
            <IoIosSearch className="w-4 h-4 text-blue100 shrink-0" />
            <input type="search" name="" id="" placeholder="Search" className="text-blue100 text-sm font-inter flex-1 outline-none"/>
        </div>
    </div>
  </div>;
}

export default Topbar;
