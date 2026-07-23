import React from "react";

const FALLBACK_TOPICS = [
  { tag: "#AutomationTwist2024", postsLabel: "1.4M posts", growthLabel: "+45%" },
  { tag: "#RocktheVibeDance", postsLabel: "23.4M posts", growthLabel: "+20%" },
  { tag: "#DanceChallenge2024", postsLabel: "4.5M posts", growthLabel: "+10%" },
  { tag: "#TechAndChallenge", postsLabel: "354K posts", growthLabel: "+15%" },
];

export default function TrendingList({ topics }) {
  const items = Array.isArray(topics) && topics.length > 0 ? topics : FALLBACK_TOPICS;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-black dark:text-white text-lg font-bricolage font-semibold">Trending Now</h3>
        <button className="text-orange100 text-sm font-medium hover:underline cursor-pointer bg-transparent border-none">
          See all
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((topic, index) => (
          <div
            key={topic.slug ?? topic.tag ?? index}
            className="flex items-center justify-between p-4 rounded-xl border border-[#333] hover:bg-black/5 hover:dark:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-6">
              <span className="text-slate50 dark:text-white font-medium w-4 text-center">{index + 1}</span>
              <div className="flex flex-col">
                <span className="text-black dark:text-white font-medium text-[15px]">{topic.tag}</span>
                <span className="text-slate-400 text-xs mt-0.5">{topic.postsLabel}</span>
              </div>
            </div>

            <div className="px-2 py-1 rounded-md bg-green100/10 dark:bg-[#0e3b2e] text-[#1ed760] text-xs font-semibold flex items-center">
              {topic.growthLabel}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
