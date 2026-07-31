/**
 * LiveNew page — creator live-room (host view).
 *
 * Reads :id from the URL, polls api.getLiveEngagements every 5s and
 * api.getLiveAudience every 20s, and shows the live timer, viewer count,
 * top-3-gifters rail, and chat feed. End-Live triggers api.stopVideoLive.
 * The stream is only ended by the explicit End-Live action so a host
 * refresh, tab-close, or navigation away leaves the session running and
 * still visible to the audience.
 *
 * The webcam is acquired via getUserMedia and rendered inline so the
 * creator sees their own feed. A MediaRecorder buffers the session and
 * on end-live the blob is uploaded and attached to the video (which the
 * backend flips to draft on stop) so it can be posted later.
 *
 * Feature: 3.5 Live streaming (see PROJECT_OVERVIEW.md).
 * Backend: VideoController@show/liveEngagements/liveAudience/stopLive/update.
 */

import AgoraRTC from "agora-rtc-sdk-ng";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BsFillBarChartFill, BsFillCameraVideoOffFill } from "react-icons/bs";
import { FaCrown, FaEye, FaHeart, FaMicrophone, FaMicrophoneSlash, FaRegComment } from "react-icons/fa";
import { GiStarKey } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { PiCoinFill } from "react-icons/pi";
import { RiShareForwardLine } from "react-icons/ri";
import { TbSend2 } from "react-icons/tb";
import { TiCameraOutline } from "react-icons/ti";
import { useNavigate, useParams } from "react-router-dom";
import EndLiveModal from "../components/Live/EndLiveModal";
import { api, firstError } from "../services/api";
import {
  buildShareUrl,
  formatCompactNumber,
  getProfileAvatar,
  getProfileName,
} from "../utils/content";

function pickRecorderMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  return candidates.find((type) => MediaRecorder.isTypeSupported?.(type)) || "";
}

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
  const [audience, setAudience] = useState([]);
  const [joinEvents, setJoinEvents] = useState([]);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [elapsed, setElapsed] = useState("00:00");
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [publishStatus, setPublishStatus] = useState("idle");
  const stoppedRef = useRef(false);
  const isLiveRef = useRef(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const knownAudienceRef = useRef(new Set());
  const audienceInitializedRef = useRef(false);
  const agoraClientRef = useRef(null);
  const agoraTracksRef = useRef({ audio: null, video: null });

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
      const response = await api.getLiveEngagements(id, { limit: 20, includeSummary: true });
      setEngagements(response?.data?.engagements || []);
      setSummary(response?.data?.summary || null);
    } catch {
      // Silently ignore — the mock feed keeps rendering.
    }
  }, [id]);

  const loadAudience = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.getLiveAudience(id);
      const next = response?.data?.audience || [];
      setAudience(next);

      const nextIds = new Set(next.map((member) => member?.actor?.id).filter(Boolean));
      if (!audienceInitializedRef.current) {
        knownAudienceRef.current = nextIds;
        audienceInitializedRef.current = true;
        return;
      }

      const freshJoiners = next.filter((member) => {
        const actorId = member?.actor?.id;
        return actorId && !knownAudienceRef.current.has(actorId);
      });

      if (freshJoiners.length) {
        const timestamp = new Date().toISOString();
        const newEvents = freshJoiners.map((member) => ({
          id: `join-${member.actor.id}-${Date.now()}`,
          type: "join",
          body: null,
          createdAt: member.joinedAt || member.lastSeenAt || timestamp,
          actor: member.actor,
        }));
        setJoinEvents((current) => [...current, ...newEvents].slice(-10));
      }
      knownAudienceRef.current = nextIds;
    } catch {
      /* audience endpoint might 409 if stream ended */
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
    if (!id) return undefined;
    loadAudience();
    const audienceInterval = setInterval(loadAudience, 5000);
    const videoInterval = setInterval(loadVideo, 5000);
    return () => {
      clearInterval(audienceInterval);
      clearInterval(videoInterval);
    };
  }, [id, loadAudience, loadVideo]);

  useEffect(() => {
    if (!video?.liveStartedAt) return undefined;
    setElapsed(formatElapsed(video.liveStartedAt));
    const timer = setInterval(() => setElapsed(formatElapsed(video.liveStartedAt)), 1000);
    return () => clearInterval(timer);
  }, [video?.liveStartedAt]);

  useEffect(() => {
    isLiveRef.current = Boolean(video?.isLive);
  }, [video?.isLive]);

  useEffect(() => {
    let cancelled = false;
    async function acquire() {
      if (!id) return;
      try {
        const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        if (cancelled) {
          micTrack.close();
          camTrack.close();
          return;
        }
        agoraTracksRef.current = { audio: micTrack, video: camTrack };

        const stream = new MediaStream([camTrack.getMediaStreamTrack(), micTrack.getMediaStreamTrack()]);
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        const mimeType = pickRecorderMimeType();
        if (typeof MediaRecorder !== "undefined") {
          try {
            const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
            chunksRef.current = [];
            recorder.ondataavailable = (event) => { if (event.data && event.data.size > 0) chunksRef.current.push(event.data); };
            recorder.start(1000);
            recorderRef.current = recorder;
          } catch { /* recorder optional */ }
        }

        try {
          setPublishStatus("connecting");
          console.info("[LiveHost] requesting Agora session", { id });
          const response = await api.getLiveAgoraSession(id, { role: "host" });
          const session = response?.data?.session;
          if (session && !cancelled) {
            console.info("[LiveHost] joining channel", { channel: session.channelName, uid: session.uid });
            const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
            await client.setClientRole("host");
            await client.join(session.appId, session.channelName, session.token, session.uid);
            console.info("[LiveHost] joined; publishing tracks");
            await client.publish([micTrack, camTrack]);
            agoraClientRef.current = client;
            console.info("[LiveHost] publish complete");
            if (!cancelled) setPublishStatus("publishing");
          }
        } catch (publishError) {
          if (cancelled) return;
          console.error("[LiveHost] publish failed", publishError);
          const status = publishError?.status || publishError?.response?.status;
          setPublishStatus(status === 503 ? "unavailable" : "error");
        }
      } catch (mediaError) {
        console.error("[LiveHost] getUserMedia failed", mediaError);
      }
    }
    acquire();
    return () => {
      cancelled = true;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") { try { recorder.stop(); } catch { /* ignored */ } }
      recorderRef.current = null;
      const client = agoraClientRef.current;
      if (client) {
        try { client.unpublish(); } catch { /* ignored */ }
        try { client.leave(); } catch { /* ignored */ }
      }
      agoraClientRef.current = null;
      const { audio, video: cam } = agoraTracksRef.current;
      if (audio) { try { audio.close(); } catch { /* ignored */ } }
      if (cam) { try { cam.close(); } catch { /* ignored */ } }
      agoraTracksRef.current = { audio: null, video: null };
      streamRef.current = null;
    };
  }, [id]);

  const uploadRecording = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    const stopped = new Promise((resolve) => {
      if (recorder.state === "inactive") { resolve(); return; }
      recorder.onstop = () => resolve();
      try { recorder.stop(); } catch { resolve(); }
    });
    await stopped;
    const chunks = chunksRef.current;
    if (!chunks.length || !id) return;
    const blob = new Blob(chunks, { type: chunks[0].type || "video/webm" });
    if (!blob.size) return;
    try {
      const ext = (blob.type.includes("mp4") ? "mp4" : "webm");
      const formData = new FormData();
      formData.append("file", new File([blob], `live-${id}.${ext}`, { type: blob.type }));
      const response = await api.uploadFile(formData);
      const uploadId = response?.data?.upload?.id;
      if (uploadId) await api.updateVideo(id, { uploadId, isDraft: true });
    } catch { /* upload/attach best-effort */ }
  }, [id]);

  function handleToggleMic() {
    const micTrack = agoraTracksRef.current.audio;
    const stream = streamRef.current;
    const nextEnabled = !micOn;
    if (micTrack) { try { micTrack.setEnabled(nextEnabled); } catch { /* ignored */ } }
    if (stream) stream.getAudioTracks().forEach((track) => { track.enabled = nextEnabled; });
    setMicOn(nextEnabled);
  }

  function handleToggleCam() {
    const camTrack = agoraTracksRef.current.video;
    const stream = streamRef.current;
    const nextEnabled = !camOn;
    if (camTrack) { try { camTrack.setEnabled(nextEnabled); } catch { /* ignored */ } }
    if (stream) stream.getVideoTracks().forEach((track) => { track.enabled = nextEnabled; });
    setCamOn(nextEnabled);
  }

  async function handleShare() {
    if (!video) return;
    const shareUrl = buildShareUrl(video);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: video.title || "Live stream", url: shareUrl });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch { /* ignored */ }
  }

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
      await uploadRecording();
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
    if (!id || !body || submittingComment) return;
    setSubmittingComment(true);
    setComment("");
    try {
      await api.postComment(id, body);
      loadEngagements();
    } catch {
      setComment(body);
    } finally {
      setSubmittingComment(false);
    }
  }

  const title = video?.title || "Welcome to my Live";
  const creatorName = getProfileName(video?.author || video?.creator, "your host");
  const description = video?.description || video?.caption || `I’m ${creatorName}, welcome to my live. Can I know you?`;
  const viewers = Number(video?.currentViewers ?? video?.liveAnalytics?.currentViewers ?? audience.length ?? 0);
  const topGifters = useMemo(() => summary?.topGifters?.slice(0, 3) || [], [summary]);
  const chatFeed = useMemo(() => {
    const sortedAsc = [...engagements, ...joinEvents]
      .filter((event) => event && ["comment", "tip", "like", "join"].includes(event.type))
      .sort((a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime());
    const collapsed = [];
    for (const entry of sortedAsc) {
      const last = collapsed[collapsed.length - 1];
      const actorKey = entry?.actor?.id ?? entry?.actor?.username ?? null;
      const lastActorKey = last?.actor?.id ?? last?.actor?.username ?? null;
      if (entry.type === "like" && last?.type === "like" && actorKey && actorKey === lastActorKey) {
        last.likeCount = (last.likeCount || 1) + 1;
        last.createdAt = entry.createdAt || last.createdAt;
        last.id = entry.id || last.id;
        continue;
      }
      collapsed.push(entry.type === "like" ? { ...entry, likeCount: 1 } : entry);
    }
    return collapsed.reverse().slice(0, 5);
  }, [engagements, joinEvents]);

  return (
    <>
      {endLive && <EndLiveModal handleEndLive={handleConfirmEndLive} video={video} summary={summary} onDismiss={handleToggleEndLive} ending={ending} />}
      <div className="w-full h-full min-h-screen relative font-inter">
        <img src="/Live.png" alt="" className="w-full h-full object-fill" />
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`${camOn ? "block" : "hidden"} absolute inset-0 w-full h-full object-cover`}
        />
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
            {publishStatus === "unavailable" ? (
              <p className="text-xs text-red100">Live streaming isn't configured on this server yet. Your camera isn't reaching the audience.</p>
            ) : null}
            {publishStatus === "error" ? (
              <p className="text-xs text-red100">Couldn't publish to the live channel. Your camera isn't reaching the audience.</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {topGifters.length === 0 ? (
                <span className="text-[10px] md:text-xs text-white/60 italic">No gifts yet — the top-3 rail lights up when your fans start tipping.</span>
              ) : topGifters.map((entry, i) => {
                const actor = entry?.actor || null;
                const avatar = actor ? getProfileAvatar(actor) : "/story3.jpg";
                const username = actor?.username ? `@${actor.username}` : getProfileName(actor, "supporter");
                const tipsAmount = formatCompactNumber(Math.round((entry?.tipsAmount || 0) / 100));
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
          <button
            type="button"
            onClick={handleToggleMic}
            aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
            className="w-7.5 h-7.5 rounded-md flex items-center justify-center border border-white/20 bg-slate100"
          >
            {micOn ? <FaMicrophone className="w-5 h-5 text-white" /> : <FaMicrophoneSlash className="w-5 h-5 text-white" />}
          </button>
          <button
            type="button"
            onClick={handleToggleCam}
            aria-label={camOn ? "Turn camera off" : "Turn camera on"}
            className="w-7.5 h-7.5 rounded-md flex items-center justify-center border border-white/20 bg-slate100"
          >
            {camOn ? <TiCameraOutline className="w-5 h-5 text-white" /> : <BsFillCameraVideoOffFill className="w-5 h-5 text-white" />}
          </button>
          <div className="w-7.5 h-7.5 rounded-md flex items-center justify-center border border-white/20 bg-slate100">
            <GiStarKey className="w-5 h-5 text-white" />
          </div>
          <div className="w-7.5 h-7.5 rounded-md flex items-center justify-center border border-white/20 bg-slate100">
            <BsFillBarChartFill className="w-5 h-5 text-white" />
          </div>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share live"
            className="w-7.5 h-7.5 rounded-md flex items-center justify-center border border-white/20 bg-slate100"
          >
            <RiShareForwardLine className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="flex flex-col gap-4 bottom-24 left-4 absolute">
          {chatFeed.length === 0 ? (
            <div className="px-2 flex items-center gap-3">
              <span className="text-[10px] text-white/70 italic">Waiting for your first fan to jump in…</span>
            </div>
          ) : chatFeed.map((event, i) => {
            const actor = event?.actor || null;
            const avatar = actor ? getProfileAvatar(actor) : "/user1.jpg";
            const displayName = actor?.username || getProfileName(actor, "someone");
            if (event?.type === "tip") {
              const giftName = event?.metadata?.giftName || "a gift";
              const giftCount = event?.metadata?.giftCount || 1;
              return (
                <div key={event.id || i} className="px-2 flex items-center gap-3">
                  <img src={avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
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
                  <img src={avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-[10px] text-white">
                    {displayName}: {event.body}
                  </span>
                </div>
              );
            }
            if (event?.type === "like") {
              const likeCount = Number(event?.likeCount || 1);
              return (
                <div key={event.id || i} className="px-2 flex items-center gap-3">
                  <img src={avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-[10px] text-white flex items-center gap-1">
                    {displayName} liked your stream <FaHeart className="w-3 h-3 text-red100" />
                    {likeCount > 1 && <span className="text-[10px] font-semibold text-red100">×{likeCount}</span>}
                  </span>
                </div>
              );
            }
            if (event?.type === "join") {
              return (
                <div key={event.id || i} className="px-2 flex items-center gap-3">
                  <img src={avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-[10px] text-white/80 italic">
                    {displayName} joined the stream
                  </span>
                </div>
              );
            }
            return null;
          })}
          <div className="p-2 border-red100/10 bg-red100/50 flex items-center gap-2 rounded-full">
            <FaCrown className="w-4 h-4 text-orange600" />
            <span className="text-[10px] font-semibold text-white">
              {viewers ? `${formatCompactNumber(viewers)} viewers watching right now!` : "You're live — waiting for viewers to tap in."}
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
          <button type="submit" disabled={submittingComment || !comment.trim()} className="bg-orange100 rounded-full w-8 h-8 flex items-center justify-center shrink-0 disabled:opacity-40"><TbSend2 className="w-4 h-4 text-black" /></button>
        </form>
      </div>
    </>
  );
}

export default LiveNew;
