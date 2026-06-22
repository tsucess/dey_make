import { useState } from "react";
import { FaHeart, FaRegCommentDots } from "react-icons/fa";
import { HiArrowUp } from "react-icons/hi";
import { LuEye } from "react-icons/lu";

const videos = [
  {
    title: "My 5AM Routine Changed Everything",
    views: "2.1M",
    likes: "184k",
    comment: "1823",
    time: "1 week ago",
    engagement: "+42%",
  },
  {
    title: "Morning Dance Routine",
    views: "2.1M",
    likes: "184k",
    comment: "1823",
    time: "1 week ago",
    engagement: "+42%",
  },
  {
    title: "Responding to Your Comments",
    views: "2.1M",
    likes: "184k",
    comment: "1823",
    time: "1 week ago",
    engagement: "-42%",
  },
  {
    title: "NYC Sunset Rooftop",
    views: "2.1M",
    likes: "184k",
    comment: "1823",
    time: "1 week ago",
    engagement: "-42%",
  },
  {
    title: "Behind the Scenes: My Setup",
    views: "2.1M",
    likes: "184k",
    comment: "1823",
    time: "1 week ago",
    engagement: "+42%",
  },
];

function RecentVideoOverview() {
  const [activeTab, setActiveTab] = useState("views");

  function handleActiveTabChange(value) {
    setActiveTab(value);
  }
  return (
    <div className="p-5 flex flex-col gap-6 border border-black300 dark:border-white rounded-3xl">
      <div className="flex items-center justify-between gap-3 font-inter">
        <h3 className="text-black300 dark:text-white font-bold text-xl">
          Recent Videos
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleActiveTabChange("views")}
            className={`text-xs font-semibold transition-all px-2.5 py-2 rounded-xl ${
              activeTab === "views"
                ? "bg-orange100 hover:bg-orange200"
                : "bg-transparent hover:dark:bg-black400 dark:text-white text-black hover:bg-slate150"
            }`}
          >
            Views
          </button>
          <button
            onClick={() => handleActiveTabChange("engagement")}
            className={`text-xs font-semibold transition-all px-2.5 py-2 rounded-xl ${
              activeTab === "engagement"
                ? "bg-orange100 hover:bg-orange200"
                : "bg-transparent hover:dark:bg-black400 dark:text-white text-black hover:bg-slate150"
            }`}
          >
            Engagement
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {
            videos.map(({title, views, likes, comment, time, engagement}, i) => <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-18.25 h-18.25 rounded-md bg-slate400 dark:bg-white"></div>
                    <div className="flex flex-col justify-between gap-1 font-inter">
                        <h5 className="text-base font-bold text-black dark:text-white">{title}</h5>
                        <div className="flex items-center gap-3">
                            <div className="text-slate700 flex items-center gap-1.25 font-inter text-[10px]">
                                <LuEye className="w-4 h-4" />
                                <span>{views}</span>
                            </div>
                            <div className="text-slate700 flex items-center gap-1.25 font-inter text-[10px]">
                                <FaHeart className="w-4 h-4" />
                                <span>{likes}</span>
                            </div>
                            <div className="text-slate700 flex items-center gap-1.25 font-inter text-[10px]">
                                <FaRegCommentDots className="w-4 h-4" />
                                <span>{comment}</span>
                            </div>
                        </div>
                        <span className="text-slate700 text-[10px]">{time}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 bg-green200/10 dark:bg-green200 text-green300 text-xs font-semibold p-2 rounded-md"> <HiArrowUp className="w-2 h-2" /> {engagement}</div>
                    <span className="text-black dark:text-white font-inter text-xs font-extralight">engagement</span>
                </div>
                
            </div>)
        }
      </div>
    </div>
  );
}

export default RecentVideoOverview;
