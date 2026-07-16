import { useState } from "react";
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

function pickObjectFit(naturalWidth, naturalHeight) {
  if (!naturalWidth || !naturalHeight) return "object-cover";
  const ratio = naturalWidth / naturalHeight;
  return ratio <= 0.75 ? "object-cover" : "object-contain";
}

function MediaFit({ src, poster, type, alt }) {
  const [fit, setFit] = useState("object-cover");
  const hasVideoExt = typeof src === "string" && /\.(mp4|webm|mov|m3u8)(\?|$)/i.test(src);
  const looksLikeImage = typeof src === "string" && /\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(src);
  const isVideo = (type === "video" || hasVideoExt) && !looksLikeImage;

  if (isVideo && src) {
    return (
      <video
        src={src}
        poster={poster || undefined}
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => setFit(pickObjectFit(event.currentTarget.videoWidth, event.currentTarget.videoHeight))}
        className={`rounded-3xl w-full h-full bg-black ${fit}`}
      />
    );
  }

  return (
    <img
      src={(!isVideo && src) || poster || "/video-img.jpg"}
      alt={alt || ""}
      onLoad={(event) => setFit(pickObjectFit(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight))}
      className={`rounded-3xl w-full h-full bg-black ${fit}`}
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

  const mediaSrc = getVideoStreamUrl(video) || getVideoMediaUrl(video) || "/video-img.jpg";
  const thumbnail = video ? getVideoThumbnail(video) : "/video-img.jpg";
  const avatarUrl = creator ? getProfileAvatar(creator) : "/user1.jpg";
  const displayName = creator ? getProfileName(creator) : "username/name";
  const location = video?.location || "Location";
  const caption = video?.caption || video?.title || "Caption of the post 😉 #fyp";

  const likesText = video ? formatCompactNumber(video.likes || 0) : "250,5K";
  const commentsText = video ? formatCompactNumber(video.commentsCount || 0) : "100K";
  const repostsText = video ? formatCompactNumber(video.reposts || 0) : "89K";
  const sharesText = video ? formatCompactNumber(video.shares || 0) : "132,5K";

  const audioTrack = video?.audioTrack || null;
  const audioCover = audioTrack?.coverUrl || "/audio-traack.png";
  const audioTitle = audioTrack?.title || (video ? null : "Song name");
  const audioArtist = audioTrack?.artist || (video ? null : "song artist");
  const audioLabel = audioTitle && audioArtist
    ? `${audioTitle} - ${audioArtist}`
    : audioTitle || audioArtist;

  return (
    <section className="w-full md:w-2/3 flex justify-center relative">
      <div className="max-w-md w-full max-h-215 h-full relative">
        <MediaFit src={mediaSrc} poster={thumbnail} type={video?.type} alt={caption} />
        <div className="flex flex-col gap-2 absolute right-4 bottom-4 items-center">
          <img
            src={avatarUrl || FALLBACK_AVATAR}
            alt=""
            className="w-12 h-12 rounded-full border-2 border-white"
          />
          <div className="flex flex-col gap-1 items-center">
            <button onClick={onToggleLike}>
              {state.liked
                ? <FaHeart className={`text-red100 w-6 h-6`} />
                : <FaRegHeart className={`text-white w-6 h-6`} />}
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
              <AiOutlineRetweet className={`w-6 h-6 ${state.reposted ? "text-green-400" : "text-white"}`} />
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
            className="w-10 h-10 rounded-full mt-6"
          />
        </div>
        <div className="flex flex-col gap-1 absolute left-3 bottom-4">
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
      <div className="flex flex-col gap-3 absolute top-1/2 right-4">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="border-2 border-slate150 bg-black/40 dark:bg-white flex items-center justify-center w-8 h-8 rounded-full"
        >
          <IoMdArrowDropup className="w-5 h-5 text-black dark:text-black" />
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="border-2 border-slate150 bg-black/40 dark:bg-white flex items-center justify-center w-8 h-8 rounded-full"
        >
          <IoMdArrowDropdown className="w-5 h-5 text-white dark:text-black" />
        </button>
      </div>
    </section>
  );
}

export default Video;
