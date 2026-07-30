import { useMemo, useState } from "react";
import { FaHeart, FaRegCommentDots } from "react-icons/fa";
import { HiArrowUp } from "react-icons/hi";
import { LuEye } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { buildVideoLink, formatCompactNumber, formatRelativeTime, getVideoThumbnail, getVideoTitle } from "../../utils/content";

function engagementCount(video) {
  return Number(video?.likes ?? 0) + Number(video?.comments ?? 0) + Number(video?.saves ?? 0);
}

function RecentVideoOverview({ analytics, loading }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("views");
  const sortedVideos = useMemo(() => {
    const topVideos = analytics?.topVideos ?? [];
    const cloned = [...topVideos];
    if (activeTab === "views") {
      return cloned.sort((a, b) => Number(b?.views ?? 0) - Number(a?.views ?? 0));
    }
    return cloned.sort((a, b) => engagementCount(b) - engagementCount(a));
  }, [analytics, activeTab]);

  const maxViews = sortedVideos.reduce((acc, video) => Math.max(acc, Number(video?.views ?? 0)), 0);

  return (
    <div className="p-5 flex flex-col gap-6 border border-black300 dark:border-white rounded-3xl">
      <div className="flex flex-col  md:items-center md:justify-between gap-3 font-inter">
        <h3 className="text-black300 dark:text-white font-bold text-lg md:text-xl">
          Recent Videos
        </h3>
        <div className="flex items-center gap-1 md:gap-3">
          <button
            onClick={() => setActiveTab("views")}
            className={`text-xs font-semibold transition-all px-2.5 py-2 rounded-xl ${
              activeTab === "views"
                ? "bg-orange100 hover:bg-orange200"
                : "bg-transparent hover:dark:bg-black400 dark:text-white text-black hover:bg-slate150"
            }`}
          >
            Views
          </button>
          <button
            onClick={() => setActiveTab("engagement")}
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
        {loading && sortedVideos.length === 0 ? (
          <div className="text-sm text-slate700 font-inter">Loading videos…</div>
        ) : sortedVideos.length === 0 ? (
          <div className="text-sm text-slate700 font-inter">No videos yet.</div>
        ) : (
          sortedVideos.map((video) => {
            const views = Number(video?.views ?? 0);
            const likes = Number(video?.likes ?? 0);
            const comments = Number(video?.comments ?? 0);
            const engagementRatio = views > 0 ? (engagementCount(video) / views) * 100 : 0;
            const trendPercent = maxViews > 0 ? Math.round((views / maxViews) * 100) - 50 : 0;
            const isPositive = trendPercent >= 0;
            const thumb = getVideoThumbnail(video);

            return (
              <button
                key={video.id}
                onClick={() => navigate(buildVideoLink(video))}
                className="flex flex-col md:items-center md:justify-between gap-2 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 md:w-18.25 h-10 md:h-18.25 rounded-md bg-slate400 dark:bg-white shrink-0 bg-cover bg-center"
                    style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
                  ></div>
                  <div className="flex flex-col justify-between gap-1 font-inter">
                    <h5 className="text-sm md:text-base font-bold text-black dark:text-white line-clamp-2">
                      {getVideoTitle(video)}
                    </h5>
                    <div className="flex items-center gap-3">
                      <div className="text-slate700 flex items-center gap-1.25 font-inter text-[10px]">
                        <LuEye className="w-4 h-4" />
                        <span>{formatCompactNumber(views)}</span>
                      </div>
                      <div className="text-slate700 flex items-center gap-1.25 font-inter text-[10px]">
                        <FaHeart className="w-4 h-4" />
                        <span>{formatCompactNumber(likes)}</span>
                      </div>
                      <div className="text-slate700 flex items-center gap-1.25 font-inter text-[10px]">
                        <FaRegCommentDots className="w-4 h-4" />
                        <span>{formatCompactNumber(comments)}</span>
                      </div>
                    </div>
                    <span className="text-slate700 text-[10px]">{formatRelativeTime(video?.createdAt)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end">
                  <div className={`flex items-center gap-1 text-xs font-semibold p-2 rounded-md ${
                    isPositive ? "bg-green200/10 dark:bg-green200 text-green300" : "bg-red100/10 text-red100"
                  }`}>
                    <HiArrowUp className="w-2 h-2" /> {engagementRatio.toFixed(1)}%
                  </div>
                  <span className="text-black dark:text-white font-inter text-[10px] md:text-xs font-extralight">engagement</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RecentVideoOverview;
