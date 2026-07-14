import { CiFaceSmile } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { FaArrowLeftLong } from "react-icons/fa6";
import { IoMdArrowDropdown } from "react-icons/io";
import { RiShareForwardLine } from "react-icons/ri";
import { TbSend2 } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

function LiveChat() {
    const navigate = useNavigate()
  return <div className="flex flex-col gap-8 font-inter col-span-2">
    <button onClick={()=> navigate('/live')} className="w-7.5 h-7.5 rounded-md flex items-center justify-center border border-black/20 dark:border-white/30 cursor-pointer hover:bg-slate150 hover:dark:bg-slate150 transition-all"><FaArrowLeftLong className="text-black dark:text-white w-5 h-5" /></button>
    <div className="flex items-center gap-3">
        <div className="border border-black/10 dark:border-white/10 rounded-2xl flex items-center gap-2 justify-between p-2 bg-white300 dark:bg-slate150 flex-1">
        <div className="flex items-center gap-2">
            <img src="/story5.jpg" alt="" className="w-7.5 h-7.5 rounded-full object-cover"/>
        <div className="flex flex-col gap-1">
            <h4 className="text-sm text-black dark:text-white">User1234567890</h4>
            <div className="flex items-end gap-1"> <FaHeart className="text-red100 w-5 h-5" /> <span className="text-[10px] text-black dark:text-white">184k</span></div>
        </div>
        </div>
        <button className="w-25 h-8 rounded-full bg-orange100 text-black font-semibold text-xs">Connect</button>
        </div>
        <button className="border border-black/10 dark:border-white/10 rounded-2xl w-13 h-15 flex items-center justify-center bg-white300 dark:bg-slate150 shrink-0"><RiShareForwardLine className="text-black dark:text-white w-7 h-7" /></button>
    </div>

    <div className="flex flex-col bg-white300 p-6 gap-10 rounded-2xl dark:bg-slate100">
        <div className="flex items-center justify-between">
            <h3 className="text-base text-black dark:text-white">LIVE chat</h3>
            <button><IoMdArrowDropdown className="w-5 h-5 text-slate100 dark:text-slate50" /></button>
        </div>
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6 h-50 overflow-y-auto">
                {
                    [1,2, 3,4].map(i => <div key={i} className="flex items-start gap-2">
                        <img src="/user1.jpg" alt="" className="w-12 h-12 rounded-full"/>
                        <div className="flex flex-col gap-1">
                            <p className="text-black dark:text-white text-base">@SammieNed</p>
                            <span className="text-black dark:text-white text-sm">You are so amazing, and I really love your contents. 10:21 PM</span>
                        </div>
                    </div>)
                }
            </div>
            <div className="py-6 px-4 flex gap-2 items-center bg-slate150 dark:bg-slate300 rounded-full">
                <input type="text" name="" id="" placeholder="Add a comment..." className="text-base font-medium outline-none w-50"/>
                <button><CiFaceSmile className="text-black dark:text-white w-6 h-6" /></button>
                <button className="bg-orange100 py-3 px-3 rounded-full flex items-center justify-center shrink-0"><TbSend2 className="w-6 h-6 text-black" /></button>
            </div>
        </div>
    </div>
  </div>;
}

export default LiveChat;
