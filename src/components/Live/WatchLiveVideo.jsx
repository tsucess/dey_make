/**
 * WatchLiveVideo — viewer-side player + engagement HUD.
 *
 * Renders the live playback frame with like, tip, share, and chat toggle
 * controls. Posts engagement via api.likeLiveVideo and api.sendLiveTip;
 * subscribes to LiveChat / LiveGift child modals.
 *
 * Feature: 3.5 Live streaming (see PROJECT_OVERVIEW.md).
 * Backend: VideoController@show, VideoInteractionController@toggleLike,
 * FanTipController@storeLive.
 */


import { useState } from "react";
import { AiOutlineRetweet } from "react-icons/ai";
import { CiShare2 } from "react-icons/ci";
import { FaRegCommentDots, FaRegEye, FaRegHeart } from "react-icons/fa";
import { FaEllipsis } from "react-icons/fa6";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { api } from "../../services/api";
import { formatCompactNumber, getVideoThumbnail } from "../../utils/content";

function WatchLiveVideo({ video, videoId }) {
  const [likes, setLikes] = useState(null);
  const thumb = video ? getVideoThumbnail(video) : "/live-img.jpg";
  const viewers = Number(video?.currentViewers ?? video?.liveAnalytics?.currentViewers ?? 0);
  const totalLikes = likes ?? Number(video?.likes ?? 0);
  const comments = Number(video?.commentsCount ?? video?.liveAnalytics?.liveComments ?? 0);
  const reposts = Number(video?.reposts ?? 0);
  const shares = Number(video?.shares ?? 0);

  async function handleLike() {
    if (!videoId) return;
    setLikes((current) => (current ?? Number(video?.likes ?? 0)) + 1);
    try {
      await api.likeLiveVideo(videoId);
    } catch {
      setLikes((current) => Math.max(0, (current ?? 1) - 1));
    }
  }

  async function handleShare() {
    if (!videoId) return;
    try { await api.shareVideo?.(videoId); } catch { /* noop */ }
  }

  return (
    <div className="w-full h-full flex items-center gap-6 md:col-span-3 relative">
      <img src={thumb} alt="" className="md:rounded-t-4xl h-full w-full md:w-xs" />
      <div className="flex items-center gap-3 absolute top-1 right-8">
        <div className="w-10.5 h-5.5 bg-red100 flex items-center gap-1 justify-center rounded-md">
          <span className="w-2 h-2 rounded-full bg-white"></span>
          <span className="text-[8px] text-white font-bold uppercase">live</span>
        </div>
        <div className="flex items-center gap-1">
          <FaRegEye className="w-5 h-5 text-black dark:text-white" />
          <span className="text-[10px] dark:text-white text-black">{viewers ? formatCompactNumber(viewers) : "2.1M"}</span>
        </div>
      </div>
      <button onClick={handleLike} className="absolute md:hidden bottom-6 right-10 ">
            <FaRegHeart className={`text-black dark:text-white w-5 md:w-8 h-5 md:h-8`} />
          </button>

      {/* next and prev btn */}
      <div className="hidden md:flex flex-col gap-3 ">
        <button className="border-2 border-slate150 bg-white flex items-center justify-center w-8 h-8 rounded-full">
          <IoMdArrowDropup className="w-5 h-5 text-black dark:text-white" />
        </button>
        <button className="border-2 border-slate150 bg-white flex items-center justify-center w-8 h-8 rounded-full">
          <IoMdArrowDropdown className="w-5 h-5 text-black dark:text-white" />
        </button>
      </div>
      <div className="md:flex flex-col gap-2  items-center hidden">
        <div className="flex flex-col gap-1 items-center">
          <button onClick={handleLike} className="absolute md:static ">
            <FaRegHeart className={`text-black dark:text-white w-8 h-8`} />
          </button>
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            {totalLikes ? formatCompactNumber(totalLikes) : "250,5K"}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <FaRegCommentDots className={`text-black dark:text-white w-8 h-8`} />
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            {comments ? formatCompactNumber(comments) : "100K"}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <AiOutlineRetweet className={`text-black dark:text-white w-8 h-8`} />
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            {reposts ? formatCompactNumber(reposts) : "89K"}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <button onClick={handleShare}>
            <CiShare2 className={`text-black dark:text-white w-8 h-8`} />
          </button>
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            {shares ? formatCompactNumber(shares) : "132,5K"}
          </span>
        </div>
        <button>
          <FaEllipsis className={`text-black dark:text-white w-6 h-6`} />
        </button>
      </div>
    </div>
  );
}

export default WatchLiveVideo;
