import { AiOutlineRetweet } from "react-icons/ai";
import { CiShare2 } from "react-icons/ci";
import { FaRegCommentDots, FaRegHeart } from "react-icons/fa";
import { FaEllipsis } from "react-icons/fa6";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

function WatchLiveVideo() {
  return (
    <div className="w-full flex items-center gap-6">
      <img src="/live-img.jpg" alt="" className="rounded-t-4xl h-full" />
      <img src="" alt="" />
      {/* next and prev btn */}
      <div className="hidden md:flex flex-col gap-3 ">
        <button className="border-2 border-slate150 bg-white flex items-center justify-center w-8 h-8 rounded-full">
          <IoMdArrowDropup className="w-5 h-5 text-black dark:text-white" />
        </button>
        <button className="border-2 border-slate150 bg-white flex items-center justify-center w-8 h-8 rounded-full">
          <IoMdArrowDropdown className="w-5 h-5 text-black dark:text-white" />
        </button>
      </div>
      <div className="flex flex-col gap-2  items-center">
        <div className="flex flex-col gap-1 items-center">
          <button>
            <FaRegHeart className={`text-black dark:text-white w-8 h-8`} />
          </button>
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            250,5K
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <FaRegCommentDots className={`text-black dark:text-white w-8 h-8`} />
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            100K
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <AiOutlineRetweet className={`text-black dark:text-white w-8 h-8`} />
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            89K
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <CiShare2 className={`text-black dark:text-white w-8 h-8`} />
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            132,5K
          </span>
        </div>
        <button>
          <FaEllipsis className={`text-black dark:text-white w-6 h-6`} />
        </button>
      </div>
    </div>
  );
}

export default WatchLiveVideo;
