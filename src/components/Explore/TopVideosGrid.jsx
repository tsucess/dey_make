import React from "react";
import { HiPlay } from "react-icons/hi";

const topVideos = [
  {
    id: 1,
    title: "Dancing like an angel",
    creator: "Zara vibes",
    views: "14.6K",
    thumbnail: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=600&fit=crop",
    isLive: true,
    duration: null
  },
  {
    id: 2,
    title: "Dancing like an angel",
    creator: "Zara vibes",
    views: "14.6K",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop",
    isLive: true,
    duration: null
  },
  {
    id: 3,
    title: "Dancing like an angel",
    creator: "Zara vibes",
    views: "14.6K",
    thumbnail: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=600&fit=crop",
    isLive: false,
    duration: "4:23"
  },
  {
    id: 4,
    title: "Dancing like an angel",
    creator: "Zara vibes",
    views: "14.6K",
    thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=600&fit=crop",
    isLive: true,
    duration: null
  },
  {
    id: 5,
    title: "Dancing like an angel",
    creator: "Zara vibes",
    views: "14.6K",
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop",
    isLive: false,
    duration: "4:23"
  },
  {
    id: 6,
    title: "Dancing like an angel",
    creator: "Zara vibes",
    views: "14.6K",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?w=400&h=600&fit=crop",
    isLive: false,
    duration: "4:23"
  }
];

export default function TopVideosGrid() {
  return (
    <div className="mb-10 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-black dark:text-white text-lg font-bricolage font-semibold">Top Videos Right Now</h3>
        <button className="text-orange100 text-sm font-medium hover:underline cursor-pointer bg-transparent border-none">
          See all
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {topVideos.map((video) => (
          <div key={video.id} className="relative aspect-2/3 rounded-2xl overflow-hidden cursor-pointer group">
            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
            
            {/* Top Badge */}
            <div className="absolute top-3 left-3 flex gap-2">
              {video.isLive ? (
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                  Live
                </span>
              ) : null}
            </div>

            {video.duration && (
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded">
                {video.duration}
              </div>
            )}

            {/* Bottom Info */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
              <div className="min-w-0 pr-2">
                <p className="text-white font-medium text-sm truncate">{video.title}</p>
                <p className="text-slate-300 text-[11px] truncate">{video.creator}</p>
              </div>
              <div className="flex items-center gap-1 text-slate-300 shrink-0">
                <HiPlay className="w-3.5 h-3.5" />
                <span className="text-[11px]">{video.views}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="self-center max-w-150 w-full py-4 px-4 rounded-xl border border-black/30 dark:border-white/30 text-black dark:text-white font-semibold text-sm hover:bg-white/5 transition-colors cursor-pointer bg-transparent">
        Load more videos
      </button>
    </div>
  );
}
