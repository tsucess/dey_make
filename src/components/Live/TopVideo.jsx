/**
 * TopVideo — featured live-stream hero card.
 *
 * Renders the top-billed active live stream on the Live feed with
 * thumbnail, title, host, viewer count, and a tap-through to /watch-live/:id.
 *
 * Feature: 3.5 Live streaming (see PROJECT_OVERVIEW.md).
 * Consumes: props from LiveVideos (video object).
 */

import { useState } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { IoVideocamOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import {
  FALLBACK_AVATAR,
  formatCompactNumber,
  getProfileAvatar,
  getProfileName,
  getVideoRouteId,
  getVideoThumbnail,
  getVideoTitle,
} from "../../utils/content";

function TopVideo({ video, loading = false, error = "", isEmpty = false }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  function handleToggleHovered() {
    setIsHovered((prev) => !prev);
  }

  const author = video?.author || video?.creator || null;
  const thumb = video ? getVideoThumbnail(video) : "/live-img.jpg";
  const title = video
    ? getVideoTitle(video)
    : "Watch now and interact with creators in real time!";
  const description =
    video?.description ||
    video?.caption ||
    "I’m Vera Stone, welcome to my live. Can I know you?";
  const hostName = author ? getProfileName(author) : "Ziko Davies";
  const hostUsername = author?.username || "Ziko_Davies";
  const viewerCount = Number(
    video?.currentViewers ?? video?.liveAnalytics?.currentViewers ?? 0,
  );
  const routeId = video ? getVideoRouteId(video) : "";
  const avatarSeeds = [1, 2, 3, 4, 5];
  const authorAvatar = author ? getProfileAvatar(author) : FALLBACK_AVATAR;

  function handleWatch() {
    if (routeId) {
      navigate(`/watch-live/${routeId}`);
    } else {
      navigate("/watch-live");
    }
  }

  if (loading && !video) {
    return (
      <div className="w-full flex items-center justify-center">
        <div className="max-w-80 w-full h-100 bg-slate150 dark:bg-slate700 animate-pulse" />
      </div>
    );
  }

  if (error && !video) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-sm text-red100">{error}</p>
      </div>
    );
  }

  if (isEmpty || !video) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
        <div className="w-14 h-14 rounded-full bg-orange100/20 flex items-center justify-center">
          <IoVideocamOutline className="w-7 h-7 text-orange100" />
        </div>
        <h2 className="text-lg md:text-2xl font-semibold text-black100 dark:text-white">
          {t("livePage.noLiveTitle")}
        </h2>
        <p className="text-sm text-black100/70 dark:text-white/70 max-w-md">
          {t("livePage.noLiveBody")}
        </p>
        <button
          onClick={() => navigate("/live-preview")}
          className="mt-2 px-5 py-2.5 rounded-full flex gap-2 items-center justify-center bg-orange100 hover:bg-orange200 transition-all cursor-pointer text-black text-sm font-semibold"
        >
          <IoVideocamOutline className="w-5 h-5" /> Go Live Yourself
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {!isHovered ? (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsHovered((prev) => !prev)}
          className="w-full flex items-center justify-center relative transition-all"
        >
          <img src={thumb} alt={title} className="max-w-80 w-full h-100" />

          {/* next and previous btn */}
          <div className="flex flex-col gap-3 absolute top-1/2 right-4 md:right-50">
            <button className="border-2 border-slate150 bg-white flex items-center justify-center w-8 h-8 rounded-full">
              <IoMdArrowDropup className="w-5 h-5 text-black dark:text-white" />
            </button>
            <button className="border-2 border-slate150 bg-white flex items-center justify-center w-8 h-8 rounded-full">
              <IoMdArrowDropdown className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onMouseLeave={handleToggleHovered}
          className="live-hover-bg w-full relative py-20 flex items-center justify-center font-inter rounded-2xl"
        >
          <img
            src={thumb}
            alt={title}
            className="max-w-80 w-full h-110 object-auto bg-black/10 mix-blend-overlay"
          />

          {/* next and previous btn */}
          <div className="flex flex-col gap-3 absolute top-1/2 right-4 md:right-50">
            <button className="border-2 border-slate150 bg-white flex items-center justify-center w-8 h-8 rounded-full">
              <IoMdArrowDropup className="w-5 h-5 text-black dark:text-white" />
            </button>
            <button className="border-2 border-slate150 bg-white flex items-center justify-center w-8 h-8 rounded-full">
              <IoMdArrowDropdown className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>
          {/* go live btn */}
          <button
            onClick={() => navigate("/live-preview")}
            className="absolute top-6 md:top-2 right-7 px-4 py-1.5 md:py-2 rounded-full flex gap-2 md:gap-2.5 items-center justify-center bg-orange100 hover:bg-orange200 transition-all cursor-pointer text-black text-sm font-semibold"
          >
            <IoVideocamOutline className="w-5 h-5" /> Go Live Yourself
          </button>
          <div className="border border-white/20 rounded-lg p-1.5 md:p-2.5 left-4 top-4 absolute">
            <span className="p-1.5 md:p-2.5 uppercase bg-orange100 text-black100 font-inter font-semibold text-sm md:text-base">
              Live
            </span>
          </div>

          <div className="flex flex-col gap-2 md:gap-4 absolute top-20 md:top-30 left-4 max-w-70">
            <h2 className="text-lg md:text-2xl font-semibold text-white ">
              {title}{" "}
            </h2>
            <p className="text-xs text-white">{description}</p>
          </div>
          <div className="border border-white rounded-2xl p-3 md:p-5 flex flex-col gap-2 md:gap-3 absolute left-4 bottom-5">
            <p className="text-base md:text-xl font-bold text-white">
              {hostName}
              {hostUsername ? `(${hostUsername})` : ""}
            </p>
            <p className="text-sm md:text-base text-white">Host</p>
            <div className="flex items-center">
              {avatarSeeds.map((i) => (
                <img
                  key={i}
                  src={authorAvatar}
                  alt=""
                  className={`w-6 md:w-7.5 h-6 md:h-7.5 rounded-full ${
                    i > 1 ? "-ml-3" : ""
                  } `}
                />
              ))}
              <div className="bg-slate650 w-6 md:w-7.5 h-6 md:h-7.5 rounded-full -ml-3 flex items-center justify-center text-black100 text-[8px] md:text-[10px] font-semibold">
                +{viewerCount ? formatCompactNumber(viewerCount) : 100}
              </div>
            </div>
          </div>
          <button
            onClick={handleWatch}
            className="text-sm text-white border border-white w-70 rounded-lg py-2 absolute bottom-40 md:bottom-25 left-1/2 -translate-x-1/2"
          >
            Click to watch the LIVE
          </button>
        </div>
      )}
    </div>
  );
}

export default TopVideo;
