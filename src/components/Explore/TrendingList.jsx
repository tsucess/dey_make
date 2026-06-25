import React from "react";

const trendingTopics = [
  { id: 1, tag: "#AutomationTwist2024", posts: "1.4M posts", growth: "+45%" },
  { id: 2, tag: "#RocktheVibeDance", posts: "23.4M posts", growth: "+20%" },
  { id: 3, tag: "#DanceChallenge2024", posts: "4.5M posts", growth: "+10%" },
  { id: 4, tag: "#TechAndChallenge", posts: "354K posts", growth: "+15%" },
  { id: 5, tag: "#DancewithmeTonight", posts: "1.4M posts", growth: "+10%" },
  { id: 6, tag: "#Fyp", posts: "23.4M posts", growth: "+20%" },
  { id: 7, tag: "#QuietLuxury", posts: "1.4M posts", growth: "+45%" },
  { id: 8, tag: "#DanceChallenge2024", posts: "354K posts", growth: "+15%" },
];

export default function TrendingList() {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-black dark:text-white text-lg font-bricolage font-semibold">Trending Now</h3>
        <button className="text-orange100 text-sm font-medium hover:underline cursor-pointer bg-transparent border-none">
          See all
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {trendingTopics.map((topic, index) => (
          <div 
            key={topic.id}
            className="flex items-center justify-between p-4 rounded-xl border border-[#333] hover:bg-black/5 hover:dark:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-6">
              <span className="text-slate50 dark:text-white font-medium w-4 text-center">{index + 1}</span>
              <div className="flex flex-col">
                <span className="text-black dark:text-white font-medium text-[15px]">{topic.tag}</span>
                <span className="text-slate-400 text-xs mt-0.5">{topic.posts}</span>
              </div>
            </div>
            
            <div className="px-2 py-1 rounded-md bg-green100/10 dark:bg-[#0e3b2e] text-[#1ed760] text-xs font-semibold flex items-center">
              {topic.growth}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
