import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { LuEye } from "react-icons/lu";

const entriesImg = [
  "/entry1.png",
  "/entry_2.png",
  "/entry_3.png",
  "/entry_4.png",
  "/entry_5.png",
  "/entry_6.png",
  "/entry_7.png",
  "/entry_8.png",
  "/entry_9.png",
];

function EntriesSection() {
  const [activeTab, setActiveTab] = useState("trending");

  function handleActiveTabChange(value) {
    setActiveTab(value);
  }
  return (
    <section className="flex flex-col gap-5 px-4 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-slate250 text-sm font-semibold font-inter">
          9 entries
        </p>
        <menu className="flex items-center gap-2 md:gap-3 overflow-x-auto">
          <button
            onClick={() => handleActiveTabChange("trending")}
            className={`w-20 md:w-25 h-10.5 rounded-full flex items-center justify-center text-xs sm:text-sm font-inter font-semibold transition-all ${
              activeTab === "trending"
                ? "bg-orange100 text-black hover:bg-orange200"
                : "text-slate250 dark:text-white hover:text-slate150 hover:bg-slate250"
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => handleActiveTabChange("newest")}
            className={`w-20 md:w-25 h-10.5 rounded-full flex items-center justify-center text-xs sm:text-sm font-inter font-semibold transition-all ${
              activeTab === "newest"
                ? "bg-orange100 text-black hover:bg-orange200"
                : "text-slate250 dark:text-white hover:text-slate150 hover:bg-slate250"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => handleActiveTabChange("most liked")}
            className={`w-20 md:w-25 h-10.5 rounded-full flex items-center justify-center text-xs sm:text-sm font-inter font-semibold transition-all ${
              activeTab === "most liked"
                ? "bg-orange100 text-black hover:bg-orange200"
                : "text-slate250 dark:text-white hover:text-slate150 hover:bg-slate250"
            }`}
          >
            Most Liked
          </button>
        </menu>
      </div>

      {/* entries section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {entriesImg.map((img, i) => (
          <div key={i} className="w-full h-full relative">
            <img src={img} alt="" className="w-full h-full" />
            <div
              className={`flex items-center gap-3 absolute left-4 top-4 right-4 ${i < 3 ? "justify-between" : "justify-end"}`}
            >
              {i < 3 && (
                <div
                  className={`w-5 h-5 flex justify-center items-center text-xs font-semibold rounded-full ${
                    i === 0
                      ? "bg-orange100 text-black"
                      : i === 1
                        ? "bg-slate350 text-black"
                        : "bg-orange400 text-white"
                  }`}
                >
                  {i + 1}
                </div>
              )}
              <FaRegHeart className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col gap-1 left-4 absolute bottom-4">
              <div className="flex items-center gap-1.5">
                <img src="/user1.jpg" alt="" className="w-5 h-5 rounded-full" />
                <span className="text-white font-inter text-xs">
                  @zara.vibes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <LuEye className="w-4 h-4 text-white" />
                  <span className="text-white font-inter text-[10px]">
                    2.1M
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  <FaHeart className="w-4 h-4 text-red100" />
                  <span className="text-white font-inter text-[10px]">
                    184k
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EntriesSection;
