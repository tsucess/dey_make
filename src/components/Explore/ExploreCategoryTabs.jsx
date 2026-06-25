import React from "react";

const categories = [
  "Trending",
  "Dance",
  "Food",
  "Fitness",
  "Sport",
  "Tech",
  "Music",
  "Art",
];

export default function ExploreCategoryTabs({ activeCategory = "Trending", onSelectCategory }) {
  return (
    <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide py-4 mb-2">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelectCategory?.(category)}
            className={`whitespace-nowrap px-8 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
              isActive
                ? "bg-orange100 text-black"
                : "bg-transparent text-slate300 hover:text-black100 hover:dark:text-white"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
