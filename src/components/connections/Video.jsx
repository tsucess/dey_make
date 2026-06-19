import { AiOutlineRetweet } from "react-icons/ai";
import { CiShare2 } from "react-icons/ci";
import { FaRegCommentDots, FaRegHeart } from "react-icons/fa";
import { FaEllipsis } from "react-icons/fa6";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { IoLanguage, IoLocationOutline, IoMusicalNotes } from "react-icons/io5";

function Video() {
  return (
    <section className="w-full md:w-2/3 flex justify-center relative">
      <div className="max-w-md w-full max-h-215 h-full relative">
        <img src="/video-img.jpg" alt="" className="rounded-3xl" />
        <div className="flex flex-col gap-2 absolute right-4 bottom-4 items-center">
          <img
            src="/user1.jpg"
            alt=""
            className="w-12 h-12 rounded-full border-2 border-white"
          />
          <div className="flex flex-col gap-1 items-center">
            <button>
              <FaRegHeart className={`text-white w-6 h-6`} />
            </button>
            <span className="font-inter text-xs font-semibold text-white">
              250,5K
            </span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <FaRegCommentDots className={`text-white w-6 h-6`} />
            <span className="font-inter text-xs font-semibold text-white">
              100K
            </span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <AiOutlineRetweet className={`text-white w-6 h-6`} />
            <span className="font-inter text-xs font-semibold text-white">
              89K
            </span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <CiShare2 className={`text-white w-6 h-6`} />
            <span className="font-inter text-xs font-semibold text-white">
              132,5K
            </span>
          </div>
          <button>
            <FaEllipsis className={`text-white w-6 h-6`} />
          </button>
          <img
            src="/audio-traack.png"
            alt=""
            className="w-10 h-10 rounded-full mt-6"
          />
        </div>
        <div className="flex flex-col gap-1 absolute left-2 bottom-4">
          <div className="flex items-center gap-1.5">
            <IoLocationOutline className="text-white w-4 h-4" />
            <span className="text-xs font-inter text-white">Location</span>
          </div>
          <p className="text-base font-inter text-white">Name and Last name</p>
          <span className="text-sm font-inter text-white max-w-[20ch]">
            Caption of the post 😉 #fyp
          </span>
          <div className="flex flex-col gap-0.75">
            <span className="text-xs font-inter text-white flex items-center gap-1">
              {" "}
              <IoLanguage className="text-white w-4 h-4" /> Show translation
            </span>
            <span className="text-xs font-inter text-white flex items-center gap-1">
              {" "}
              <IoMusicalNotes className="text-white w-4 h-4" /> Song name - song
              artist
            </span>
          </div>
        </div>
      </div>

      {/* next and prev btn */}
      <div className="flex flex-col gap-3 absolute top-1/2 right-4">
        <button className="border-2 border-slate150 bg-white flex items-center justify-center w-8 h-8 rounded-full">
          <IoMdArrowDropup className="w-5 h-5 text-black dark:text-white" />
        </button>
        <button className="border-2 border-slate150 bg-white flex items-center justify-center w-8 h-8 rounded-full">
          <IoMdArrowDropdown className="w-5 h-5 text-black dark:text-white" />
        </button>
      </div>
    </section>
  );
}

export default Video;
