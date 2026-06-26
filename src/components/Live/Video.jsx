import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { IoVideocamOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

function Video() {
  const navigate = useNavigate();
  return (
    <div className="w-full basis-2/3 bg-orange700/20 dark:bg-orange700 rounded-4xl py-15 flex justify-center relative max-h-225 h-full">
      <div className="max-h-192 h-full">
        <img src="/live-img.png" alt="" />
      </div>

      {/* go live btn */}
      <button
        onClick={() => navigate("/live-preview")}
        className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full flex gap-2.5 items-center justify-center bg-orange100 hover:bg-orange200 transition-all cursor-pointer text-black text-sm font-semibold"
      >
        <IoVideocamOutline className="w-5 h-5" /> Go Live Yourself
      </button>

      {/* next and previous btn */}
      <div className="flex flex-col gap-3 absolute top-1/2 right-4">
        <button className="border-2 border-slate150 bg-white flex items-center justify-center w-8 h-8 rounded-full">
          <IoMdArrowDropup className="w-5 h-5 text-black dark:text-white" />
        </button>
        <button className="border-2 border-slate150 bg-white flex items-center justify-center w-8 h-8 rounded-full">
          <IoMdArrowDropdown className="w-5 h-5 text-black dark:text-white" />
        </button>
      </div>
    </div>
  );
}

export default Video;
