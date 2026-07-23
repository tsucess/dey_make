import React from "react";

const FALLBACK_TABS = [
  { slug: "trending", label: "Trending" },
  { slug: "dance", label: "Dance" },
  { slug: "food", label: "Food" },
  { slug: "fitness", label: "Fitness" },
  { slug: "sport", label: "Sport" },
  { slug: "tech", label: "Tech" },
  { slug: "music", label: "Music" },
  { slug: "art", label: "Art" },
];

export default function ExploreCategoryTabs({ tabs, activeSlug = "trending", onSelectCategory }) {
  const items = Array.isArray(tabs) && tabs.length > 0 ? tabs : FALLBACK_TABS;

  return (
    <div className="flex items-center gap-1 md:gap-4 overflow-x-auto scrollbar-hide md:py-4 mb-4 md:mb-2">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {items.map((tab) => {
        const isActive = activeSlug === tab.slug;
        return (
          <button
            key={tab.slug}
            onClick={() => onSelectCategory?.(tab.slug)}
            className={`whitespace-nowrap px-4 md:px-8 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
              isActive
                ? "bg-orange100 text-black"
                : "bg-transparent text-slate300 hover:text-black100 hover:bg-slate150 hover:dark:text-white"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
