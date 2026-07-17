import { AiOutlineRetweet } from "react-icons/ai";
import { CiShare2 } from "react-icons/ci";
import { FaRegCommentDots, FaRegHeart } from "react-icons/fa";
import { FaEllipsis } from "react-icons/fa6";
import { MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function Video() {
    const navigate = useNavigate()
  return (
    <div className="col-span-2 bg-white300 dark:bg-slate150 px-5 flex justify-between items-center gap-6">
      <button onClick={()=> navigate(-1)} className="self-start pt-10 cursor-pointer">
        <MdClose className={`text-black dark:text-white w-6 h-6`} />
      </button>
      <div className="relative">
        <img src="/live-img.jpg" alt="" />
        <div className="flex items-center gap-5 absolute bottom-1/4 left-10">
        <button className="bg-slate100/70 rounded-md w-50 py-3 text-sm text-white">View Analytics</button>
        <button className="bg-slate100/70 rounded-md w-50 py-3 text-sm text-white">Promote video</button>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center shrink-0">
        <img
          src="/user1.jpg"
          alt=""
          className="w-12 h-12 rounded-full border-2 text-black dark:text-white shrink-0"
        />
        <div className="flex flex-col gap-1 items-center">
          <button>
            <FaRegHeart className={`text-black dark:text-white w-6 h-6`} />
          </button>
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            250,5K
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <FaRegCommentDots className={`text-black dark:text-white w-6 h-6`} />
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            100K
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <AiOutlineRetweet className={`text-black dark:text-white w-6 h-6`} />
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            89K
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <CiShare2 className={`text-black dark:text-white w-6 h-6`} />
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            132,5K
          </span>
        </div>
        <button>
          <FaEllipsis className={`text-black dark:text-white w-6 h-6`} />
        </button>
        <img
          src="/audio-traack.png"
          alt=""
          className="w-10 h-10 rounded-full mt-6"
        />
      </div>
    </div>
  );
}

export default Video;
