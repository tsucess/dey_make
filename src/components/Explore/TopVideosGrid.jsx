import React from "react";
import { Link } from "react-router-dom";
import { HiPlay } from "react-icons/hi";
import {
  buildVideoLink,
  formatCompactNumber,
  getProfileName,
  getVideoThumbnail,
  getVideoTitle,
  isActiveLiveVideo,
} from "../../utils/content";

function formatDuration(seconds) {
  if (!seconds || !Number.isFinite(Number(seconds))) return null;
  const total = Math.floor(Number(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TopVideosGrid({ videos, onLoadMore, canLoadMore = false, loading = false }) {
  const items = Array.isArray(videos) ? videos : [];

  if (!items.length && !loading) return null;

  return (
    <div className="mb-10 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-black dark:text-white text-lg font-bricolage font-semibold">Top Videos Right Now</h3>
        <button className="text-orange100 text-sm font-medium hover:underline cursor-pointer bg-transparent border-none">
          See all
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {items.map((video) => {
          const live = isActiveLiveVideo(video);
          const duration = live ? null : formatDuration(video.duration);
          const title = getVideoTitle(video);
          const author = getProfileName(video?.author || video?.creator);
          const views = formatCompactNumber(video.viewsCount ?? video.views_count ?? video.views ?? 0);

          return (
            <Link
              key={video.id ?? video.publicId}
              to={buildVideoLink(video, { isLive: live })}
              className="relative aspect-2/3 rounded-2xl overflow-hidden cursor-pointer group block"
            >
              <img
                src={getVideoThumbnail(video)}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>

              <div className="absolute top-3 left-3 flex gap-2">
                {live && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                    Live
                  </span>
                )}
              </div>

              {duration && (
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded">
                  {duration}
                </div>
              )}

              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                <div className="min-w-0 pr-2">
                  <p className="text-white font-medium text-sm truncate">{title}</p>
                  <p className="text-slate-300 text-[11px] truncate">{author}</p>
                </div>
                <div className="flex items-center gap-1 text-slate-300 shrink-0">
                  <HiPlay className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{views}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {canLoadMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="self-center max-w-150 w-full py-4 px-4 rounded-xl border border-black/30 dark:border-white/30 text-black dark:text-white font-semibold text-sm hover:bg-white/5 transition-colors cursor-pointer bg-transparent disabled:opacity-60"
        >
          {loading ? "Loading..." : "Load more videos"}
        </button>
      )}
    </div>
  );
}
