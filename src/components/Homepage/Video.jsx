import { useEffect, useRef, useState } from "react";
import { AiOutlineRetweet } from "react-icons/ai";
import { CiShare2 } from "react-icons/ci";
import { FaHeart, FaRegCommentDots, FaRegHeart } from "react-icons/fa";
import { FaEllipsis } from "react-icons/fa6";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { IoLanguage, IoLocationOutline, IoMusicalNotes } from "react-icons/io5";
import {
  FALLBACK_AVATAR,
  formatCompactNumber,
  getProfileAvatar,
  getProfileName,
  getVideoMediaUrl,
  getVideoStreamUrl,
  getVideoThumbnail,
} from "../../utils/content";
import { loadHls } from "../../utils/loadHls";

function pickObjectFit(naturalWidth, naturalHeight) {
  if (!naturalWidth || !naturalHeight) return "object-cover";
  const ratio = naturalWidth / naturalHeight;
  // Portrait / near-portrait fills the 9:16 container edge-to-edge; anything
  // wider (landscape / square) is letterboxed with object-contain so no crop.
  return ratio <= 0.75 ? "object-cover" : "object-contain";
}

function MediaFit({ streamUrl, mediaUrl, poster, type, alt }) {
  const videoRef = useRef(null);
  const [fit, setFit] = useState("object-cover");
  const [muted, setMuted] = useState(true);

  const preferredSrc = streamUrl || mediaUrl || "";
  const fallbackSrc = mediaUrl || "";
  const looksLikeImage =
    typeof preferredSrc === "string" && /\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(preferredSrc);
  const hasVideoExt =
    typeof preferredSrc === "string" && /\.(mp4|webm|mov|m3u8)(\?|$)/i.test(preferredSrc);
  // Trust the backend `type` first (VideoResource sets this reliably to
  // "video" | "image" | "gif"); fall back to extension sniffing only when
  // `type` is missing. Cloudinary URLs frequently omit a filename extension.
  const isVideo = type === "video" || (!type && hasVideoExt && !looksLikeImage);

  useEffect(() => {
    if (!isVideo) return undefined;
    const el = videoRef.current;
    if (!el) return undefined;

    let cancelled = false;
    let hls = null;

    const setSrc = (url) => {
      if (!url) return;
      if (el.src !== url) el.src = url;
    };

    async function init() {
      el.removeAttribute("src");

      // Prefer MP4 when available: universally supported, no CORS or HLS.js
      // dependency. Fall back to HLS only when no MP4 is provided.
      if (fallbackSrc) {
        setSrc(fallbackSrc);
        return;
      }

      if (!preferredSrc) return;

      const isHls = /\.m3u8(\?|$)/i.test(preferredSrc);

      if (!isHls) {
        setSrc(preferredSrc);
        return;
      }

      if (typeof el.canPlayType === "function" && el.canPlayType("application/vnd.apple.mpegurl")) {
        setSrc(preferredSrc);
        return;
      }

      try {
        const Hls = await loadHls();
        if (cancelled) return;
        if (!Hls?.isSupported?.()) return;

        hls = new Hls();
        hls.loadSource(preferredSrc);
        hls.attachMedia(el);
      } catch {
        // no-op: no MP4 and HLS.js failed
      }
    }

    init();

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [isVideo, preferredSrc, fallbackSrc]);

  if (isVideo && preferredSrc) {
    const toggleMute = () => setMuted((current) => !current);
    return (
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          poster={poster || undefined}
          controls
          playsInline
          autoPlay
          muted={muted}
          loop
          preload="metadata"
          onLoadedMetadata={(event) =>
            setFit(
              pickObjectFit(
                event.currentTarget.videoWidth,
                event.currentTarget.videoHeight,
              ),
            )
          }
          className={`md:rounded-3xl w-full h-full bg-black ${fit}`}
        />
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70"
        >
          {muted ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M3.63 3.63a1 1 0 0 0 0 1.41L7.29 8.7 7 9H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3l3.29 3.29A1 1 0 0 0 12 17.59V13.41l3.59 3.59a5.4 5.4 0 0 1-1.09.61 1 1 0 1 0 .78 1.84 7.4 7.4 0 0 0 1.72-1.02l1.59 1.59a1 1 0 0 0 1.41-1.41L5.05 3.63a1 1 0 0 0-1.42 0ZM19 12a7 7 0 0 0-3.36-6 1 1 0 1 0-.96 1.75A5 5 0 0 1 17 12a5 5 0 0 1-.31 1.72 1 1 0 0 0 .62 1.27 1 1 0 0 0 1.27-.61A7 7 0 0 0 19 12Zm-7-5.59V4.41a1 1 0 0 0-1.71-.7l-2 2 3.71 3.7Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M3 10v4a1 1 0 0 0 1 1h3l3.29 3.29A1 1 0 0 0 12 17.59V6.41a1 1 0 0 0-1.71-.7L7 9H4a1 1 0 0 0-1 1Zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.05A4.5 4.5 0 0 0 16.5 12ZM14 3.23v2.06A6.99 6.99 0 0 1 19 12a6.99 6.99 0 0 1-5 6.71v2.06A9 9 0 0 0 21 12a9 9 0 0 0-7-8.77Z" />
            </svg>
          )}
        </button>
      </div>
    );
  }

  return (
    <img
      src={(!isVideo && preferredSrc) || poster || "/home_img.jpg"}
      alt={alt || ""}
      onLoad={(event) =>
        setFit(
          pickObjectFit(
            event.currentTarget.naturalWidth,
            event.currentTarget.naturalHeight,
          ),
        )
      }
      className={`md:rounded-3xl w-full h-full bg-black ${fit}`}
    />
  );
}

function Video({
  video = null,
  canPrev = false,
  canNext = false,
  onPrev,
  onNext,
  onToggleLike,
  onOpenComments,
  onShare,
  onToggleRepost,
  isOwner = false,
}) {
  const creator = video?.creator || video?.author || null;
  const state = video?.currentUserState || {};

  const streamUrl = video ? getVideoStreamUrl(video) : "";
  const mediaUrl = video ? getVideoMediaUrl(video) : "";
  const thumbnail = video ? getVideoThumbnail(video) : "/home_img.jpg";
  const avatarUrl = creator ? getProfileAvatar(creator) : "/user1.jpg";
  const displayName = creator ? getProfileName(creator) : "Name and Last name";
  const location = video?.location || "Location";
  const caption =
    video?.caption || video?.title || "Caption of the post 😉 #fyp";

  const likesText = video ? formatCompactNumber(video.likes || 0) : "250,5K";
  const commentsText = video
    ? formatCompactNumber(video.commentsCount || 0)
    : "100K";
  const repostsText = video ? formatCompactNumber(video.reposts || 0) : "89K";
  const sharesText = video ? formatCompactNumber(video.shares || 0) : "132,5K";

  const audioTrack = video?.audioTrack || null;
  const audioCover = audioTrack?.coverUrl || "/audio-traack.png";
  const audioTitle = audioTrack?.title || (video ? null : "Song name");
  const audioArtist = audioTrack?.artist || (video ? null : "song artist");
  const audioLabel =
    audioTitle && audioArtist
      ? `${audioTitle} - ${audioArtist}`
      : audioTitle || audioArtist;

  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const wheelCooldown = useRef(0);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    touchEndY.current = e.changedTouches[0].clientY;

    const distance = touchStartY.current - touchEndY.current;
    const threshold = 50; // minimum swipe distance

    if (distance > threshold && canNext) {
      // Swiped up
      onNext();
    } else if (distance < -threshold && canPrev) {
      // Swiped down
      onPrev();
    }
  };

  const handleWheel = (e) => {
    const now = Date.now();
    if (now - wheelCooldown.current < 600) return;
    const threshold = 20;
    if (e.deltaY > threshold && canNext) {
      wheelCooldown.current = now;
      onNext();
    } else if (e.deltaY < -threshold && canPrev) {
      wheelCooldown.current = now;
      onPrev();
    }
  };

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className="fixed inset-0 md:relative w-full h-screen lg:w-2/3 md:h-215 flex justify-center "
    >
      <div className="lg:max-w-md w-full h-full relative">
        <MediaFit
          streamUrl={streamUrl}
          mediaUrl={mediaUrl}
          poster={thumbnail}
          type={video?.type}
          alt={caption}
        />
        <div className="flex flex-col gap-1 md:gap-2 absolute right-4 bottom-15 md:bottom-20 items-center">
          <img
            src={avatarUrl || FALLBACK_AVATAR}
            alt=""
            className="w-10 md:w-12 h-10 md:h-12 rounded-full border-2 border-white object-cover"
          />
          <div className="flex flex-col gap-1 items-center">
            <button onClick={onToggleLike}>
              <FaHeart
                className={`w-6 h-6 ${state.liked ? "text-red100" : "text-white"}`}
              />
            </button>
            <span className="font-inter text-xs font-semibold text-white">
              {likesText}
            </span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <button onClick={onOpenComments}>
              <FaRegCommentDots className={`text-white w-6 h-6`} />
            </button>
            <span className="font-inter text-xs font-semibold text-white">
              {commentsText}
            </span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <button
              onClick={onToggleRepost}
              disabled={isOwner}
              title={isOwner ? "You can't repost your own video" : undefined}
              className={isOwner ? "opacity-40 cursor-not-allowed" : undefined}
            >
              <AiOutlineRetweet
                className={`w-6 h-6 ${state.reposted ? "text-green-400" : "text-white"}`}
              />
            </button>
            <span className="font-inter text-xs font-semibold text-white">
              {repostsText}
            </span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <button onClick={onShare}>
              <CiShare2 className={`text-white w-6 h-6`} />
            </button>
            <span className="font-inter text-xs font-semibold text-white">
              {sharesText}
            </span>
          </div>
          <button>
            <FaEllipsis className={`text-white w-6 h-6`} />
          </button>
          <img
            src={audioCover}
            alt=""
            className="w-10 h-10 rounded-full mt-3 md:mt-6"
          />
        </div>
        <div className="flex flex-col gap-1 absolute left-2 bottom-18">
          <div className="flex items-center gap-1.5">
            <IoLocationOutline className="text-white w-4 h-4" />
            <span className="text-xs font-inter text-white">{location}</span>
          </div>
          <p className="text-base font-inter text-white">{displayName}</p>
          <span className="text-sm font-inter text-white max-w-[20ch]">
            {caption}
          </span>
          <div className="flex flex-col gap-0.75">
            <span className="text-xs font-inter text-white flex items-center gap-1">
              {" "}
              <IoLanguage className="text-white w-4 h-4" /> Show translation
            </span>
            {audioLabel ? (
              <span className="text-xs font-inter text-white flex items-center gap-1">
                {" "}
                <IoMusicalNotes className="text-white w-4 h-4" /> {audioLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* next and prev btn */}
      <div className="hidden md:flex flex-col gap-3 absolute top-1/2 right-4">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="border-2 border-slate150 bg-white flex items-center justify-center w-8 h-8 rounded-full disabled:opacity-40"
        >
          <IoMdArrowDropup className="w-6 h-6 text-white dark:text-black" />
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="border-2 border-slate150 bg-white flex items-center justify-center w-8 h-8 rounded-full disabled:opacity-40"
        >
          <IoMdArrowDropdown className="w-6 h-6 text-white dark:text-black" />
        </button>
      </div>
    </section>
  );
}

export default Video;
