import { MdArrowForwardIos } from "react-icons/md";

function Sidebar() {
  return <aside className="flex flex-col gap-6 w-full max-w-69 border-r border-r-white bg-black h-screen overflow-y-auto p-4">
    <div className="flex items-center justify-center p-4 border-b border-white">
        <img src="/DEYMAKE LOGO with Tagline Yellow.svg" alt="" />
    </div>
    <div className="flex flex-col gap-20 overflow-y-auto">
        <nav></nav>
    </div>
    <div className="border-t border-white mt-auto py-3 flex items-center gap-3">
        <img src="/story3.jpg" alt="" className="w-10 h-10 object-cover rounded-full shrink-0"/>
        <div className="flex items-center justify-between flex-1">
            <div className="flex flex-col gap-1 font-inter">
                <h4 className="text-white text-sm font-medium">Sophia Williams</h4>
                <p className="text-white text-xs">sophia@gmail.com</p>
            </div>
            <MdArrowForwardIos className="w-5 h-5 text-white" />
        </div>

    </div>
  </aside>;
}

export default Sidebar;
