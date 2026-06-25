import React, { useState } from "react";
import ExploreCategoryTabs from "../components/Explore/ExploreCategoryTabs";
import ExploreHero from "../components/Explore/ExploreHero";
import TrendingList from "../components/Explore/TrendingList";
import RisingCreators from "../components/Explore/RisingCreators";
import TopVideosGrid from "../components/Explore/TopVideosGrid";

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("Trending");

  return (
    <div className="min-h-full bg-white dark:bg-black300">
      {/* Category Tabs container matches the padding of the layout */}
      <div className="px-6 md:px-10 pt-4">
        <ExploreCategoryTabs 
          activeCategory={activeCategory} 
          onSelectCategory={setActiveCategory} 
        />
      </div>

      <div className="px-6 md:px-10 pb-10">
        <ExploreHero />
        <TrendingList />
        <RisingCreators />
        <TopVideosGrid />
      </div>
    </div>
  );
}
