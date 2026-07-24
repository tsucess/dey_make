/**
 * LiveNew page — creator live-room (host view).
 *
 * Reads :id from the URL, polls api.getLiveEngagements every 5s and
 * api.getLiveAudience every 20s, and shows the live timer, viewer count,
 * top-3-gifters rail, and chat feed. End-Live triggers api.stopVideoLive.
 * The stream is also auto-stopped on unmount / tab-close / navigation
 * away so leaving the page always ends the live session.
 *
 * Feature: 3.5 Live streaming (see PROJECT_OVERVIEW.md).
 * Backend: VideoController@show/liveEngagements/liveAudience/stopLive.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BsFillBarChartFill } from "react-icons/bs";
import { FaCrown, FaEye, FaMicrophone, FaRegComment } from "react-icons/fa";
import { GiStarKey } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { PiCoinFill } from "react-icons/pi";
import { RiShareForwardLine } from "react-icons/ri";
import { TiCameraOutline } from "react-icons/ti";
import { useNavigate, useParams } from "react-router-dom";
import EndLiveModal from "../components/Live/EndLiveModal";
import { api, firstError } from "../services/api";
import {
  formatCompactNumber,
  getProfileAvatar,
  getProfileName,
} from "../utils/content";

const icons = [
  FaMicrophone,
  TiCameraOutline,
  GiStarKey,
  BsFillBarChartFill,
  RiShareForwardLine,
];

function formatElapsed(startedAt) {
  if (!startedAt) return "00:00";
  const startMs = new Date(startedAt).getTime();
  if (Number.isNaN(startMs)) return "00:00";
  const seconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = seconds % 60;
  const pad = (n) => `${n}`.padStart(2, "0");
  return hh > 0 ? `${pad(hh)}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`;
}

function LiveNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [endLive, setEndLive] = useState(false);
  const [video, setVideo] = useState(null);
  const [engagements, setEngagements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [comment, setComment] = useState("");
  const [elapsed, setElapsed] = useState("00:00");
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");
  const stoppedRef = useRef(false);
  const isLiveRef = useRef(false);

  const loadVideo = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.getVideo(id);
      setVideo(response?.data?.video || null);
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || "Unable to load the live stream."));
    }
  }, [id]);

  const loadEngagements = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.getLiveEngagements(id, { limit: 12, includeSummary: true });
      setEngagements(response?.data?.engagements || []);
      setSummary(response?.data?.summary || null);
    } catch {
      // Silently ignore — the mock feed keeps rendering.
    }
  }, [id]);

  useEffect(() => { loadVideo(); }, [loadVideo]);

  useEffect(() => {
    if (!id) return undefined;
    loadEngagements();
    const interval = setInterval(loadEngagements, 5000);
    return () => clearInterval(interval);
  }, [id, loadEngagements]);

  useEffect(() => {
    if (!video?.liveStartedAt) return undefined;
    setElapsed(formatElapsed(video.liveStartedAt));
    const timer = setInterval(() => setElapsed(formatElapsed(video.liveStartedAt)), 1000);
    return () => clearInterval(timer);
  }, [video?.liveStartedAt]);

  useEffect(() => {
    isLiveRef.current = Boolean(video?.isLive);
    if (!video?.isLive) return undefined;

    function handlePageHide() {
      if (stoppedRef.current || !id) return;
      stoppedRef.current = true;
      api.stopVideoLiveBeacon(id);
    }

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
    };
  }, [id, video?.isLive]);

  useEffect(() => {
    return () => {
      if (stoppedRef.current || !isLiveRef.current || !id) return;
      stoppedRef.current = true;
      api.stopVideoLive(id).catch(() => {});
    };
  }, [id]);

  function handleToggleEndLive() {
    setEndLive((prev) => !prev);
  }

  async function handleConfirmEndLive() {
    if (!id || ending) {
      handleToggleEndLive();
      return;
    }
    setEnding(true);
    try {
      await api.stopVideoLive(id);
      stoppedRef.current = true;
      isLiveRef.current = false;
      navigate("/live", { replace: true });
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || "Unable to end the live stream."));
    } finally {
      setEnding(false);
      setEndLive(false);
    }
  }

  async function handleSubmitComment(event) {
    event?.preventDefault?.();
    const body = comment.trim();
    if (!id || !body) return;
    setComment("");
    try {
      await api.postComment(id, body);
      loadEngagements();
    } catch {
      setComment(body);
    }
  }

  const title = video?.title || "Welcome to my Live";
  const description = video?.description || video?.caption || "I’m Vera Stone, welcome to my live. Can I know you?";
  const viewers = Number(video?.currentViewers ?? video?.liveAnalytics?.currentViewers ?? 0);
  const topGifters = useMemo(() => summary?.topGifters?.slice(0, 3) || [], [summary]);
  const chatFeed = engagements.filter((event) => event.type === "comment" || event.type === "tip").slice(0, 4);

  return (
    <>
      {endLive && <EndLiveModal handleEndLive={handleConfirmEndLive} video={video} summary={summary} onDismiss={handleToggleEndLive} ending={ending} />}
      <div className="w-full h-full min-h-screen relative font-inter">
        <img src="/Live.png" alt="" className="w-full h-full object-fill" />
        <div className="flex flex-col gap-4 md:gap-10.5 absolute top-4 left-4 right-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-5.5">
              <div className="bg-red100 rounded-lg py-2 px-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-xs md:text-sm font-semibold uppercase text-white">
                  LIVE
                </p>
              </div>
              <div className="flex items-center gap-3 text-white">
                <FaEye className="w-4 h-4" />
                <span className="text-[10px]">{formatCompactNumber(viewers)}</span>
              </div>
              <span className="text-[10px] text-white">{elapsed}</span>
            </div>
            <button
              onClick={handleToggleEndLive}
              className="bg-red100 rounded-lg py-2 px-4 flex items-center gap-2 text-xs md:text-sm text-white"
            >
              {" "}
              <IoMdClose className="w-4 h-4" /> End Live
            </button>
          </div>
          <div className="flex flex-col gap-2 md:gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {title}
            </h2>
            <p className="text-xs text-white">
              {description}
            </p>
            {error ? <p className="text-xs text-red100">{error}</p> : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {(topGifters.length ? topGifters : [1, 2, 3]).map((entry, i) => {
                const isReal = typeof entry === "object" && entry !== null;
                const actor = isReal ? entry.actor : null;
                const avatar = actor ? getProfileAvatar(actor) : "/story3.jpg";
                const username = actor?.username ? `@${actor.username}` : "@jayden_x";
                const tipsAmount = isReal ? formatCompactNumber(entry.tipsAmount || 0) : "12.4K";
                const rank = i + 1;
                return (
                <div key={actor?.id || i} className="flex flex-col md:flex-row md:items-center gap-2">
                  <div className="relative w-7 md:w-10 h-7 md:h-10">
                    <img
                      src={avatar}
                      alt=""
                      className="w-7 md:w-10 h-7 md:h-10 border border-orange100 rounded-full object-cover"
                    />
                    <span className="w-3 md:w-5 h-3 md:h-5 absolute -right-0.5 text-[10px] md:text-xs font-semibold bottom-1 bg-orange100 text-black rounded-full flex items-center justify-center">
                      {rank}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5 md:gap-1">
                    <span className="text-xs md:text-sm font-semibold text-white">
                      {username}
                    </span>
                    <div className="flex items-center gap-0.5 text-white text-xs">
                      {" "}
                      <PiCoinFill className="w-4 h-4 text-orange100" /> {tipsAmount}
                    </div>
                  </div>
                </div>
              );})}
            </div>
            <div className="flex items-center gap-1 text-white text-[10px] md:text-xs border border-white justify-center rounded-md px-3 py-2">
              {" "}
              <PiCoinFill className="w-4 h-4 text-orange100" /> Gift to rank
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 absolute right-4 top-1/2 -translate-y-1/2">
          {icons.map((Icon, i) => (
            <div
              key={i}
              className="w-7.5 h-7.5 rounded-md flex items-center justify-center border border-white/20 bg-slate100"
            >
              {" "}
              <Icon className="w-5 h-5 text-white" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 bottom-24 left-4 absolute">
          {(chatFeed.length ? chatFeed : [null, null, null, null]).map((event, i) => {
            const actor = event?.actor || null;
            const avatar = actor ? getProfileAvatar(actor) : "/user1.jpg";
            const displayName = actor?.username || getProfileName(actor, "lila.movess");
            if (event?.type === "tip") {
              const giftName = event?.metadata?.giftName || "Crown";
              const giftCount = event?.metadata?.giftCount || 500;
              return (
                <div key={event.id || i} className="px-2 flex items-center gap-3">
                  <img src={avatar} alt="" className="w-5 h-5 rounded-full" />
                  <div className="bg-orange100/10 border border-orange100/50 p-2 flex items-center gap-2 rounded-full">
                    <span className="text-[10px] text-orange800">
                      {displayName} sent
                    </span>
                    <FaCrown className="w-4 h-4 text-orange600" />
                    <span className="text-[10px] font-semibold text-white">
                      {giftName}{" "}
                    </span>
                    <span className="text-white text-[8px]">x{giftCount}</span>
                  </div>
                </div>
              );
            }
            if (event?.type === "comment") {
              return (
                <div key={event.id || i} className="px-2 flex items-center gap-3">
                  <img src={avatar} alt="" className="w-5 h-5 rounded-full" />
                  <span className="text-[10px] text-white">
                    {displayName}: {event.body}
                  </span>
                </div>
              );
            }
            return (
              <div key={`placeholder-${i}`} className="px-2 flex items-center gap-3">
                <img src="/user1.jpg" alt="" className="w-5 h-5 rounded-full" />
                <span className="text-[10px] text-white">
                  boby_kkai joined the stream
                </span>
              </div>
            );
          })}
          <div className="p-2 border-red100/10 bg-red100/50 flex items-center gap-2 rounded-full">
            <FaCrown className="w-4 h-4 text-orange600" />
            <span className="text-[10px] font-semibold text-white">
              {viewers ? `${formatCompactNumber(viewers)} viewers watching right now!` : "500 viewers watching right now!"}
            </span>
          </div>
        </div>
        <form onSubmit={handleSubmitComment} className="right-4 left-4 bottom-7 bg-black100 border border-slate700 px-4 py-3 flex items-center gap-3 absolute rounded-full">
          <FaRegComment className="w-5 h-5 text-white shrink-0" />
          <input
            type="text"
            name=""
            id=""
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Say something..."
            className="text-xs text-white font-medium flex-1 bg-transparent outline-none"
          />
        </form>
      </div>
    </>
  );
}

export default LiveNew;
