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


import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import { AiOutlineRetweet } from "react-icons/ai";
import { CiShare2 } from "react-icons/ci";
import { FaHeart, FaRegCommentDots, FaRegEye, FaRegHeart } from "react-icons/fa";
import { FaEllipsis } from "react-icons/fa6";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { api } from "../../services/api";
import { buildShareUrl, formatCompactNumber, getProfileName, getVideoThumbnail, getVideoTitle } from "../../utils/content";

const HEART_COLORS = ["#de1b1b", "#ff4655", "#ff6b9d", "#fdb300", "#ffae4c"];
const HEART_LIFETIME_MS = 1600;

function WatchLiveVideo({ video, videoId, engagements = [], onEngaged, onVideoRefresh }) {
  const [likeDelta, setLikeDelta] = useState(0);
  const [shareDelta, setShareDelta] = useState(0);
  const [burstCount, setBurstCount] = useState(0);
  const [remoteReady, setRemoteReady] = useState(false);
  const [streamStatus, setStreamStatus] = useState("idle");
  const [hearts, setHearts] = useState([]);
  const burstTimerRef = useRef(null);
  const remoteContainerRef = useRef(null);
  const agoraClientRef = useRef(null);
  const remoteVideoTrackRef = useRef(null);
  const remoteAudioTrackRef = useRef(null);
  const heartIdRef = useRef(0);
  const seenLikeIdsRef = useRef(new Set());
  const initialLikeScanRef = useRef(false);
  const thumb = video ? getVideoThumbnail(video) : "/live-img.jpg";
  const isLive = Boolean(video?.isLive);
  const viewers = Number(video?.currentViewers ?? video?.liveAnalytics?.currentViewers ?? 0);
  const baseLikes = Number(video?.likes ?? video?.liveAnalytics?.liveLikes ?? 0);
  const totalLikes = baseLikes + likeDelta;
  const comments = Number(video?.commentsCount ?? video?.liveAnalytics?.liveComments ?? 0);
  const reposts = Number(video?.reposts ?? 0);
  const shares = Number(video?.shares ?? 0) + shareDelta;

  useEffect(() => {
    return () => {
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    };
  }, []);

  function spawnHeart() {
    heartIdRef.current += 1;
    const id = heartIdRef.current;
    const drift = Math.round((Math.random() - 0.5) * 46);
    const size = 12 + Math.round(Math.random() * 14);
    const color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
    const delay = Math.round(Math.random() * 120);
    setHearts((current) => [...current, { id, drift, size, color, delay }]);
    setTimeout(() => {
      setHearts((current) => current.filter((h) => h.id !== id));
    }, HEART_LIFETIME_MS + delay + 80);
  }

  function spawnHeartBurst(count = 3) {
    for (let index = 0; index < count; index += 1) {
      setTimeout(() => spawnHeart(), index * 65);
    }
  }

  useEffect(() => {
    const likeEntries = engagements.filter((entry) => entry?.type === "like");
    if (!initialLikeScanRef.current) {
      likeEntries.forEach((entry) => { if (entry?.id) seenLikeIdsRef.current.add(entry.id); });
      initialLikeScanRef.current = true;
      return;
    }
    const fresh = likeEntries.filter((entry) => entry?.id && !seenLikeIdsRef.current.has(entry.id));
    if (fresh.length === 0) return;
    fresh.forEach((entry) => { seenLikeIdsRef.current.add(entry.id); });
    const capped = fresh.slice(-6);
    capped.forEach((_, index) => {
      setTimeout(() => spawnHeartBurst(3 + (index % 2)), index * 90);
    });
  }, [engagements]);

  useEffect(() => {
    if (!videoId || !isLive) {
      setStreamStatus("idle");
      return undefined;
    }
    let cancelled = false;
    setStreamStatus("connecting");
    const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

    async function handleUserPublished(user, mediaType) {
      console.info("[LiveViewer] user-published", { uid: user?.uid, mediaType });
      try {
        await client.subscribe(user, mediaType);
      } catch (subscribeError) {
        console.error("[LiveViewer] subscribe failed", subscribeError);
        return;
      }
      if (cancelled) return;
      if (mediaType === "video") {
        remoteVideoTrackRef.current = user.videoTrack;
        if (remoteContainerRef.current && user.videoTrack) {
          user.videoTrack.play(remoteContainerRef.current);
          setRemoteReady(true);
          setStreamStatus("live");
        }
      } else if (mediaType === "audio") {
        remoteAudioTrackRef.current = user.audioTrack;
        try { user.audioTrack?.play(); } catch { /* ignored */ }
      }
    }

    function handleUserUnpublished(user, mediaType) {
      console.info("[LiveViewer] user-unpublished", { uid: user?.uid, mediaType });
      if (mediaType === "video") {
        remoteVideoTrackRef.current = null;
        setRemoteReady(false);
        setStreamStatus("waiting");
      } else if (mediaType === "audio") {
        remoteAudioTrackRef.current = null;
      }
    }

    async function connect() {
      try {
        const response = await api.getLiveAgoraSession(videoId, { role: "audience" });
        const session = response?.data?.session;
        if (!session || cancelled) return;
        console.info("[LiveViewer] joining channel", { channel: session.channelName, uid: session.uid });
        client.on("user-published", handleUserPublished);
        client.on("user-unpublished", handleUserUnpublished);
        await client.setClientRole("audience");
        await client.join(session.appId, session.channelName, session.token, session.uid);
        agoraClientRef.current = client;
        const remoteUsers = client.remoteUsers || [];
        console.info("[LiveViewer] joined; remote users at join", remoteUsers.map((u) => ({ uid: u.uid, hasVideo: u.hasVideo, hasAudio: u.hasAudio })));
        for (const user of remoteUsers) {
          if (user.hasVideo) { await handleUserPublished(user, "video"); }
          if (user.hasAudio) { await handleUserPublished(user, "audio"); }
        }
        if (!cancelled && !remoteUsers.some((u) => u.hasVideo)) setStreamStatus("waiting");
      } catch (error) {
        if (cancelled) return;
        console.error("[LiveViewer] join failed", error);
        const status = error?.status || error?.response?.status;
        setStreamStatus(status === 503 ? "unavailable" : "error");
      }
    }
    connect();

    return () => {
      cancelled = true;
      try { client.removeAllListeners(); } catch { /* ignored */ }
      try { client.leave(); } catch { /* ignored */ }
      agoraClientRef.current = null;
      remoteVideoTrackRef.current = null;
      remoteAudioTrackRef.current = null;
      setRemoteReady(false);
    };
  }, [videoId, isLive]);

  function handleLike() {
    if (!videoId) return;
    setLikeDelta((current) => current + 1);
    setBurstCount((current) => current + 1);
    spawnHeart();
    if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    burstTimerRef.current = setTimeout(() => setBurstCount(0), 1200);
    api.likeLiveVideo(videoId)
      .then(() => onEngaged?.())
      .catch(() => setLikeDelta((current) => Math.max(0, current - 1)));
  }

  async function handleShare() {
    if (!videoId) return;
    const shareUrl = buildShareUrl(video || videoId);
    const shareTitle = video ? getVideoTitle(video) : "Watch this live stream";
    const shareText = video?.author
      ? `${getProfileName(video.author)} is live on DeyMake — tap in!`
      : "Catch this live stream on DeyMake!";

    let sharedNatively = false;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        sharedNatively = true;
      } catch {
        /* user cancelled or share unavailable */
      }
    }
    if (!sharedNatively && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch {
        /* ignore */
      }
    }

    try {
      await api.shareVideo(videoId);
      setShareDelta((current) => current + 1);
      onVideoRefresh?.();
    } catch {
      /* ignore share tracking failure */
    }
  }

  return (
    <div className="w-full h-full flex items-center gap-6 md:col-span-3 relative">
      <img
        src={thumb}
        alt=""
        className={`md:rounded-t-4xl h-full w-full md:w-xs ${remoteReady ? "invisible" : ""}`}
      />
      <div
        ref={remoteContainerRef}
        className={`absolute z-0 inset-0 md:w-full md:rounded-t-4xl overflow-hidden bg-black ${remoteReady ? "block" : "hidden"}`}
      />
      {!remoteReady && isLive && streamStatus !== "idle" ? (
        <div className="absolute z-1 inset-0 md:static md:w-full flex items-center justify-center md:rounded-t-4xl bg-black/40 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-black/70 text-white text-xs md:text-sm text-center max-w-100">
            {streamStatus === "connecting" && "Connecting to the live stream…"}
            {streamStatus === "waiting" && "Waiting for the host's camera…"}
            {streamStatus === "unavailable" && "Live streaming isn't configured on this server yet."}
            {streamStatus === "error" && "Couldn't reach the live stream. Retrying shortly…"}
          </div>
        </div>
      ) : null}
      <div className="pointer-events-none absolute bottom-16 right-6 md:bottom-24 md:right-8 h-40 w-24 overflow-visible z-10">
        {hearts.map((heart) => (
          <FaHeart
            key={heart.id}
            className="floating-heart absolute bottom-0 right-0 drop-shadow-md"
            style={{ color: heart.color, width: heart.size, height: heart.size, marginRight: heart.drift, animationDelay: `${heart.delay}ms` }}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 absolute top-1 right-8">
        <div className="w-10.5 h-5.5 bg-red100 flex items-center gap-1 justify-center rounded-md">
          <span className="w-2 h-2 rounded-full bg-white"></span>
          <span className="text-[8px] text-white font-bold uppercase">live</span>
        </div>
        <div className="flex items-center gap-1">
          <FaRegEye className="w-5 h-5 text-black dark:text-white" />
          <span className="text-[10px] dark:text-white text-black">{formatCompactNumber(viewers)}</span>
        </div>
      </div>
      <button onClick={handleLike} type="button" className="absolute md:hidden bottom-6 right-10 flex flex-col items-center gap-1">
            <FaRegHeart className={`text-black dark:text-white w-5 md:w-8 h-5 md:h-8 ${burstCount > 0 ? "text-red100 dark:text-red100 scale-110 transition-transform" : ""}`} />
            <span className="text-[10px] font-semibold text-black dark:text-white">{formatCompactNumber(totalLikes)}</span>
            {burstCount > 1 && (
              <span className="absolute -top-4 -right-2 text-xs font-bold text-red100">+{burstCount}</span>
            )}
          </button>

      {/* next and prev btn */}
      <div className="hidden md:flex flex-col gap-3 ">
        <button className="border-2 border-slate150 bg-black dark:bg-white  flex items-center justify-center w-8 h-8 rounded-full">
          <IoMdArrowDropup className="w-5 h-5 text-black dark:text-black" />
        </button>
        <button className="border-2 border-slate150 bg-white bg-black dark:bg-white justify-center w-8 h-8 rounded-full">
          <IoMdArrowDropdown className="w-5 h-5 text-black dark:text-black" />
        </button>
      </div>
      <div className="md:flex flex-col gap-2 z-2 items-center hidden">
        <div className="flex flex-col gap-1 items-center relative">
          <button onClick={handleLike} type="button" className="absolute md:static ">
            <FaRegHeart className={`w-8 h-8 transition-transform ${burstCount > 0 ? "text-red100 scale-110" : "text-black dark:text-white"}`} />
          </button>
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            {formatCompactNumber(totalLikes)}
          </span>
          {burstCount > 1 && (
            <span className="absolute -top-3 -right-4 text-sm font-bold text-red100">+{burstCount}</span>
          )}
        </div>
        <div className="flex flex-col gap-1 items-center">
          <FaRegCommentDots className={`text-black dark:text-white w-8 h-8`} />
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            {formatCompactNumber(comments)}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <AiOutlineRetweet className={`text-black dark:text-white w-8 h-8`} />
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            {formatCompactNumber(reposts)}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <button onClick={handleShare} type="button">
            <CiShare2 className={`text-black dark:text-white w-8 h-8`} />
          </button>
          <span className="font-inter text-xs font-semibold text-black dark:text-white">
            {formatCompactNumber(shares)}
          </span>
        </div>
        <button type="button">
          <FaEllipsis className={`text-black dark:text-white w-6 h-6`} />
        </button>
      </div>
    </div>
  );
}

export default WatchLiveVideo;
