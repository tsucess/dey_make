import { useState } from "react";
import { FaRegUser, FaUserFriends } from "react-icons/fa";
import { FiLock, FiUsers } from "react-icons/fi";
import { GiAlliedStar, GiStarKey } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { LuDot } from "react-icons/lu";
import { PiBasketballLight } from "react-icons/pi";
import { TbCamera, TbHearts } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

const categoryTab = [
  "Dance",
  "Music",
  "Gaming",
  "Cooking",
  "Fitness",
  "Talk",
  "Photography",
  "Art",
  "Fashion",
];

const settings = [
  {
    title: "Everyone",
    desc: "Anyone on DeyMake",
    icon: PiBasketballLight,
    isCheckbox: true,
  },
  {
    title: "Followers",
    desc: "Only your followers",
    icon: FiUsers,
    isCheckbox: true,
  },
  {
    title: "Friends",
    desc: "Mutual follows only",
    icon: TbHearts,
    isCheckbox: true,
  },
  {
    title: "Close friends",
    desc: "Create your list",
    icon: GiAlliedStar,
    isCheckbox: true,
  },
  {
    title: "Don’t show to...",
    desc: "Select friends",
    icon: FaUserFriends,
    isCheckbox: true,
  },
  {
    title: "Only show to...",
    desc: "Select friends",
    icon: FaRegUser,
    isCheckbox: true,
  },
  {
    title: "Only me",
    desc: "Only me",
    icon: FiLock,
    isCheckbox: true,
  },
  {
    title: "Allow Gifts",
    desc: "Viewers can send you coins",
    icon: FiLock,
    isCheckbox: false,
  },
];

function LivePreview() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategorye] = useState("Dance");

  function handleActiveCategoryChange(value) {
    setActiveCategory(value);
  }
  return (
    <section className="flex flex-col gap-8 font-inter dark:bg-black300 pb-20">
      <div className=" relative">
        <img
          src="/preview-img.png"
          alt=""
          className="w-full h-full min-h-50 object-fill"
        />
        <div className="flex justify-between items-center gap-2 absolute left-3 right-3 top-4">
          <button onClick={()=> navigate(-1)} className="bg-slate100 w-7.5 h-7.5 rounded-lg flex items-center justify-center hover:bg-black500/20">
            <IoMdClose className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2 px-4 py-3 rounded-md bg-black700 text-xs md:text-sm text-white ">
            <div className="w-3 h-3 rounded-full bg-orange100"></div>Camera
            Preview
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-slate100 w-7.5 h-7.5 rounded-lg flex items-center justify-center hover:bg-black500/20">
              <TbCamera className="w-5 h-5 text-white" />
            </button>
            <button className="bg-slate100 w-7.5 h-7.5 rounded-lg flex items-center justify-center hover:bg-black500/20">
              <GiStarKey className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:gap-4 px-6">
        <h3 className="text-xl font-semibold text-black dark:text-white">
          Stream Title*
        </h3>
        <input
          type="text"
          name=""
          id=""
          className="px-6 py-3 rounded-full bg-white300 dark:bg-black100 outline-none"
          placeholder="What’s your stream about? (e.g. Late night dance)"
        />
        <span className="text-orange100 text-sm self-end font-semibold">
          0/80
        </span>
      </div>

      <div className="flex flex-col gap-4.75 font-inter px-6">
        <h3 className="text-black dark:text-white text-base font-semibold">
          Category
        </h3>
        <div className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {categoryTab.map((tab) => (
            <button
              key={tab}
              onClick={() => handleActiveCategoryChange(tab)}
              className={`transition-all text-sm py-2 md:py-3 px-3 md:px-5 rounded-xl font-semibold flex items-center gap-3 ${
                activeCategory === tab
                  ? "bg-orange100 text-black hover:bg-orange200"
                  : "text-black dark:text-white hover:bg-slate150 hover:dark:bg-black500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* settings */}
      <div className="flex flex-col gap-4.5 font-inter px-6">
        <h3 className="text-black dark:text-white text-base font-semibold">
          Settings
        </h3>
        <div className="flex flex-col gap-4.5">{
            settings.map(({title, desc, isCheckbox, icon:Icon}, i) => <div className="flex justify-between items-center gap-3 border border-black/30 rounded-2xl dark:border-white/30 p-4">
                <div className="flex items-center gap-2">
                    <div className="rounded-md w-8 h-8 border border-black/40 dark:border-white/40 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-black dark:text-white"/></div>
                    <div className="flex flex-col">
                        <h4 className="text-sm text-black dark:text-white font-semibold">{title}</h4>
                        <span className="text-[11px] text-black dark:text-white font-thin">{desc}</span>
                    </div>
                </div>

                <div>{
                    isCheckbox ? <input type="checkbox" name="" id="" /> : <div className="bg-orange100 w-10 h-5 rounded-full flex p-1 items-center ">
                        <span className="w-4 h-4 rounded-full bg-black"></span>
                    </div>
                    }</div>
            </div>)
            }</div>
            <button onClick={()=> navigate('/lives')} className="bg-orange100 py-3 md:px-30 font-medium rounded-md text-sm text-black md:self-center">Go Live Now</button>
      </div>

      
    </section>
  );
}

export default LivePreview;
