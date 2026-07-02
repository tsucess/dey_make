import React from "react";

export default function ExploreHero() {
  return (
    <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 group cursor-pointer">
      <img
        src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop"
        alt="What's Trending"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"></div>

      <div className="absolute bottom-6 left-6 right-6">
        <p className="text-orange100 text-xs font-bold uppercase tracking-wider mb-2">
          HOT RIGHT NOW
        </p>
        <h2 className="text-white text-3xl font-bricolage font-bold">
          What's Trending
        </h2>
      </div>
    </div>
  );
}
