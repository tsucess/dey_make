import React from "react";
import { Link } from "react-router-dom";
import { buildVideoLink, getVideoThumbnail, getVideoTitle, isActiveLiveVideo } from "../../utils/content";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop";

export default function ExploreHero({ video, activeCategory }) {
  const label = activeCategory?.label || activeCategory?.name || "What's Trending";
  const eyebrow = activeCategory ? "TOP IN CATEGORY" : "HOT RIGHT NOW";
  const image = video ? getVideoThumbnail(video) : FALLBACK_IMG;
  const title = video ? getVideoTitle(video) : label;
  const href = video ? buildVideoLink(video, { isLive: isActiveLiveVideo(video) }) : null;

  const inner = (
    <>
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"></div>
      <div className="absolute bottom-6 left-6 right-6">
        <p className="text-orange100 text-xs font-bold uppercase tracking-wider mb-2">{eyebrow}</p>
        <h2 className="text-white text-3xl font-bricolage font-bold line-clamp-2">{title}</h2>
      </div>
    </>
  );

  const className = "relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 group cursor-pointer block";

  return href ? (
    <Link to={href} className={className}>{inner}</Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}
