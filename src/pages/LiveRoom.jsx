import { useEffect, useRef, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { clearLiveCreationSession } from "../live/liveSessionStore";
import { api, DIRECT_UPLOAD_LARGE_FILE_THRESHOLD, firstError } from "../services/api";
import { loadAgoraRtc } from "../utils/loadAgoraRtc";
import {
  buildVideoAnalyticsLink,
  buildVideoLink,
  formatCompactNumber,
  formatCountLabel,
  formatRelativeTime,
  formatSubscriberLabel,
  getProfileAvatar,
  getProfileName,
  getVideoThumbnail,
  getVideoTitle,
  isActiveLiveVideo,
} from "../utils/content";

const LIVE_ENGAGEMENT_POLL_MS = 4000;
const LIVE_PRESENCE_POLL_MS = 15000;
const LIVE_HEART_COLORS = ["#f472b6", "#fb7185", "#f97316", "#ec4899"];
const LIVE_HEART_LANES = [91.8, 94.1, 96.1];

function createLiveSessionKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `live-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function mergeEngagementItems(currentItems = [], nextItems = [], limit = 12) {
  const merged = [...currentItems];
  const seenIds = new Set(currentItems.map((item) => item.id));

  nextItems.forEach((item) => {
    if (!item?.id || seenIds.has(item.id)) return;
    seenIds.add(item.id);
    merged.push(item);
  });

  return merged
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
    .slice(0, limit);
}

function buildCommentEngagementItem(comment) {
  if (!comment?.id) return null;

  return {
    id: `comment-${comment.id}`,
    type: "comment",
    body: comment.body || comment.text || "",
    createdAt: comment.createdAt || new Date().toISOString(),
    actor: comment.user || null,
  };
}

function createFloatingHeartBurst() {
  return Array.from({ length: 7 }, (_, index) => {
    const laneIndex = index % LIVE_HEART_LANES.length;
    const laneBase = LIVE_HEART_LANES[laneIndex];

    return {
      id: `heart-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      left: laneBase + Math.random() * 0.9,
      bottom: 6.75 + Math.random() * 2.4,
      size: 18 + Math.random() * 16,
      delay: index * 42,
      duration: 980 + Math.round(Math.random() * 460),
      rise: 165 + Math.round(Math.random() * 120),
      drift: -42 - Math.round(Math.random() * 98),
      sway: Math.round((Math.random() - 0.5) * 18),
      rotate: Math.round((Math.random() - 0.5) * 52),
      trailHeight: 42 + Math.round(Math.random() * 52),
      trailWidth: Math.max(2, 2 + laneIndex),
      glowSize: 22 + Math.round(Math.random() * 22),
      sparkleSize: 5 + Math.round(Math.random() * 6),
      color: LIVE_HEART_COLORS[index % LIVE_HEART_COLORS.length],
    };
  });
}

function stopMediaStream(stream) {
  stream?.getTracks?.().forEach((track) => track.stop());
}

function closeAgoraTracks(tracks = []) {
  tracks.forEach((track) => {
    try {
      track?.stop?.();
      track?.close?.();
    } catch {
      // Ignore cleanup errors.
    }
  });
}

function buildMediaStreamFromAgoraTracks(tracks = []) {
  if (typeof MediaStream === "undefined") return null;
  const mediaTracks = tracks.map((track) => track?.getMediaStreamTrack?.()).filter(Boolean);
  return mediaTracks.length ? new MediaStream(mediaTracks) : null;
}

function createLiveRecorder(stream) {
  if (!stream || typeof MediaRecorder === "undefined") return null;
  const mimeTypes = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  const supportedMimeType = mimeTypes.find((mimeType) => typeof MediaRecorder.isTypeSupported !== "function" || MediaRecorder.isTypeSupported(mimeType));
  return supportedMimeType ? new MediaRecorder(stream, { mimeType: supportedMimeType }) : new MediaRecorder(stream);
}

function createRecordingUploadFile(blob, videoId) {
  const recordingType = blob?.type || "video/webm";
  const extension = recordingType.includes("mp4") ? "mp4" : "webm";
  const fileName = `live-${videoId || "recording"}-${Date.now()}.${extension}`;
  if (typeof File !== "undefined") return new File([blob], fileName, { type: recordingType, lastModified: Date.now() });
  Object.defineProperty(blob, "name", { configurable: true, value: fileName });
  return blob;
}

function requiresDirectUpload(file, type) {
  return type === "video" || (file?.size ?? 0) > DIRECT_UPLOAD_LARGE_FILE_THRESHOLD;
}

async function uploadSelectedFile(file, type, callbacks = {}) {
  callbacks?.onStatusChange?.("preparing");
  const presignResponse = await api.presignUpload({ type, originalName: file.name });
  const uploadStrategy = presignResponse?.data || {};
  if (uploadStrategy.strategy === "client-direct-upload") {
    callbacks?.onStatusChange?.("uploading");
    const directUpload = await api.uploadFileDirect(file, uploadStrategy, { onProgress: callbacks?.onProgress });
    const secureUrl = directUpload?.secure_url;
    if (!secureUrl) throw new Error("Upload provider did not return a file URL.");
    callbacks?.onStatusChange?.("processing");
    const uploadResponse = await api.uploadFile({
      type,
      path: secureUrl,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: directUpload?.bytes ?? file.size ?? 0,
      width: directUpload?.width ?? null,
      height: directUpload?.height ?? null,
      duration: directUpload?.duration ?? null,
    });
    return uploadResponse?.data?.upload || null;
  }
  if (requiresDirectUpload(file, type)) throw new Error(callbacks?.directUploadRequiredMessage || "Large files and videos must upload directly.");
  const uploadFormData = new FormData();
  uploadFormData.append("file", file);
  callbacks?.onStatusChange?.("uploading");
  const uploadResponse = await api.uploadFile(uploadFormData);
  return uploadResponse?.data?.upload || null;
}

function StageTile({ stream, label, muted = false }) {
  const playbackRef = useRef(null);

  useEffect(() => {
    if (!playbackRef.current) return undefined;
    playbackRef.current.srcObject = stream || null;
    return () => {
      if (playbackRef.current) playbackRef.current.srcObject = null;
    };
  }, [stream]);

  if (!stream) return null;

  return <video ref={playbackRef} aria-label={label} className="h-full w-full object-cover" autoPlay muted={muted} playsInline controls={!muted} />;
}

export default function LiveRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const agoraClientRef = useRef(null);
  const agoraLocalTracksRef = useRef([]);
  const heartTimeoutsRef = useRef([]);
  const liveMomentTimeoutsRef = useRef([]);
  const liveMomentumSnapshotRef = useRef({ peakViewers: null, currentViewers: null, totalEngagements: null });
  const lastLiveMomentAtRef = useRef({});
  const presenceSessionKeyRef = useRef(createLiveSessionKey());
  const recorderRef = useRef(null);
  const recorderChunksRef = useRef([]);
  const recorderStopPromiseRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [liveMoments, setLiveMoments] = useState([]);
  const [engagementFeed, setEngagementFeed] = useState([]);
  const [previewStatus, setPreviewStatus] = useState("idle");
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [stageRole, setStageRole] = useState("audience");

  const creatorId = video?.author?.id || video?.creator?.id;
  const creatorProfile = video?.author || video?.creator;
  const isCreator = Boolean(creatorId) && user?.id === creatorId;
  const isLive = isActiveLiveVideo(video);
  const resolvedStageRole = isCreator ? "host" : stageRole;
  const shouldJoinAgora = Boolean(video?.id && video?.type === "video" && isAuthenticated && (isLive || isCreator));
  const shouldRecord = Boolean(isCreator && isLive && localStream);

  useEffect(() => () => stopMediaStream(localStream), [localStream]);
  useEffect(() => () => clearLiveCreationSession(id), [id]);

  useEffect(() => () => {
    heartTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    heartTimeoutsRef.current = [];
    liveMomentTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    liveMomentTimeoutsRef.current = [];
  }, []);

  useEffect(() => {
    setEngagementFeed([]);
    setFloatingHearts([]);
    setLiveMoments([]);
    liveMomentumSnapshotRef.current = { peakViewers: null, currentViewers: null, totalEngagements: null };
    lastLiveMomentAtRef.current = {};
  }, [id]);

  useEffect(() => {
    if (!video?.id) return;

    liveMomentumSnapshotRef.current = {
      peakViewers: video?.liveAnalytics?.peakViewers ?? video?.currentViewers ?? 0,
      currentViewers: video?.currentViewers ?? video?.liveAnalytics?.currentViewers ?? 0,
      totalEngagements: null,
    };
  }, [video?.id]);

  useEffect(() => {
    let ignore = false;
    async function loadRoom() {
      setLoading(true);
      setError("");
      try {
        const [videoResponse, commentsResponse] = await Promise.all([api.getVideo(id), api.getVideoComments(id)]);
        if (ignore) return;
        setVideo(videoResponse?.data?.video || null);
        setComments(commentsResponse?.data?.comments || []);
      } catch (nextError) {
        if (!ignore) setError(firstError(nextError?.errors, nextError?.message || t("videoDetails.unableToLoad")));
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadRoom();
    return () => {
      ignore = true;
    };
  }, [id, t]);

  useEffect(() => {
    if (isCreator) setStageRole("host");
    else if (!isLive) setStageRole("audience");
  }, [id, isCreator, isLive]);

  useEffect(() => {
    if (!shouldRecord || recorderRef.current) return undefined;
    let recorder;
    try {
      recorder = createLiveRecorder(localStream);
    } catch {
      return undefined;
    }
    if (!recorder) return undefined;
    recorderChunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event?.data?.size) recorderChunksRef.current.push(event.data);
    };
    recorder.start(1000);
    recorderRef.current = recorder;
    return () => {
      if (recorderRef.current === recorder && recorder.state !== "inactive") {
        try { recorder.stop(); } catch {}
      }
    };
  }, [localStream, shouldRecord]);

  async function finalizeRecording() {
    const recorder = recorderRef.current;
    if (!recorder) return null;
    if (recorderStopPromiseRef.current) return recorderStopPromiseRef.current;
    recorderStopPromiseRef.current = new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        const chunks = [...recorderChunksRef.current];
        recorderChunksRef.current = [];
        recorderRef.current = null;
        recorderStopPromiseRef.current = null;
        resolve(chunks.length ? new Blob(chunks, { type: recorder.mimeType || "video/webm" }) : null);
      };
      if (recorder.state === "inactive") {
        finish();
        return;
      }
      recorder.addEventListener("stop", finish, { once: true });
      recorder.addEventListener("error", finish, { once: true });
      try { recorder.requestData?.(); } catch {}
      try { recorder.stop(); } catch { finish(); }
    });
    return recorderStopPromiseRef.current;
  }

  useEffect(() => {
    let ignore = false;
    async function cleanupAgora() {
      closeAgoraTracks(agoraLocalTracksRef.current);
      agoraLocalTracksRef.current = [];
      const client = agoraClientRef.current;
      agoraClientRef.current = null;
      if (client) {
        try {
          client.removeAllListeners?.();
          await client.leave();
        } catch {}
      }
    }
    setRemoteParticipants([]);
    if (!shouldJoinAgora) {
      setPreviewStatus("idle");
      setConnectionStatus("idle");
      setLocalStream((current) => {
        stopMediaStream(current);
        return null;
      });
      cleanupAgora();
      return undefined;
    }
    async function connectAgora() {
      await cleanupAgora();
      if (ignore) return;
      setPreviewStatus(resolvedStageRole === "host" ? "requesting" : "idle");
      setConnectionStatus(isLive ? "connecting" : "idle");
      try {
        const response = await api.getLiveAgoraSession(id, { role: resolvedStageRole });
        if (ignore) return;
        const AgoraRTC = await loadAgoraRtc();
        if (ignore) return;
        const session = response?.data?.session || {};
        const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
        agoraClientRef.current = client;
        const syncParticipants = () => {
          if (ignore) return;
          const next = (client.remoteUsers || []).map((remoteUser, index) => ({
            uid: `${remoteUser.uid || index}`,
            stream: buildMediaStreamFromAgoraTracks([remoteUser.videoTrack, remoteUser.audioTrack]),
          })).filter((entry) => entry.stream);
          setRemoteParticipants(next);
          setConnectionStatus(next.length ? "ready" : (isLive ? "connecting" : "idle"));
        };
        client.on("user-published", async (remoteUser, mediaType) => {
          await client.subscribe(remoteUser, mediaType);
          syncParticipants();
        });
        client.on("user-unpublished", syncParticipants);
        client.on("user-left", syncParticipants);
        await client.join(session.appId, session.channelName, session.token, session.uid);
        await client.setClientRole(resolvedStageRole === "host" ? "host" : "audience");
        if (resolvedStageRole === "host") {
          const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
          if (ignore) {
            closeAgoraTracks(tracks);
            await client.leave();
            return;
          }
          agoraLocalTracksRef.current = tracks;
          await client.publish(tracks);
          setLocalStream((current) => {
            stopMediaStream(current);
            return buildMediaStreamFromAgoraTracks(tracks);
          });
          setPreviewStatus("ready");
        } else {
          setLocalStream((current) => {
            stopMediaStream(current);
            return null;
          });
        }
        syncParticipants();
      } catch (nextError) {
        if (ignore) return;
        setRemoteParticipants([]);
        setLocalStream((current) => {
          stopMediaStream(current);
          return null;
        });
        setPreviewStatus(resolvedStageRole === "host" ? "error" : "idle");
        setConnectionStatus("error");
        setError((current) => current || firstError(nextError?.errors, nextError?.message || t("videoDetails.liveStreamUnavailable")));
      }
    }
    connectAgora();
    return () => {
      ignore = true;
      setRemoteParticipants([]);
      cleanupAgora();
    };
  }, [id, isLive, resolvedStageRole, shouldJoinAgora, t]);

  function applyLiveAnalytics(partialAnalytics = {}) {
    setVideo((current) => {
      if (!current) return current;

      const nextAnalytics = {
        ...(current.liveAnalytics || {}),
        ...partialAnalytics,
      };

      return {
        ...current,
        currentViewers: nextAnalytics.currentViewers ?? current.currentViewers ?? 0,
        liveLikes: nextAnalytics.liveLikes ?? current.liveLikes ?? 0,
        liveComments: nextAnalytics.liveComments ?? current.liveComments ?? 0,
        liveAnalytics: nextAnalytics,
      };
    });
  }

  function pushLiveMoment(kind, title, body, tone = "orange") {
    if (!isCreator || typeof window === "undefined") return;

    const now = Date.now();
    const lastRaisedAt = lastLiveMomentAtRef.current[kind] || 0;
    if (lastRaisedAt && now - lastRaisedAt < 12000) return;

    lastLiveMomentAtRef.current[kind] = now;

    const nextMoment = {
      id: `${kind}-${now}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      body,
      tone,
    };

    setLiveMoments((current) => [nextMoment, ...current].slice(0, 3));

    const timeoutId = window.setTimeout(() => {
      setLiveMoments((current) => current.filter((item) => item.id !== nextMoment.id));
      liveMomentTimeoutsRef.current = liveMomentTimeoutsRef.current.filter((activeId) => activeId !== timeoutId);
    }, 4500);

    liveMomentTimeoutsRef.current.push(timeoutId);
  }

  function evaluatePresenceMoments(analytics = {}) {
    if (!isCreator) return;

    const snapshot = liveMomentumSnapshotRef.current;
    const nextCurrent = Number(analytics?.currentViewers ?? 0);
    const nextPeak = Number(analytics?.peakViewers ?? nextCurrent);

    if (snapshot.currentViewers !== null) {
      const surge = nextCurrent - snapshot.currentViewers;
      if (nextCurrent >= 8 && surge >= 4) {
        pushLiveMoment("audience-surge", t("videoDetails.audienceSurgeTitle"), t("videoDetails.audienceSurgeBody", { count: surge }), "orange");
      }
    }

    if (snapshot.peakViewers !== null && nextPeak > snapshot.peakViewers && nextPeak >= 10) {
      pushLiveMoment("viewer-peak", t("videoDetails.newPeakTitle"), t("videoDetails.newPeakBody", { count: nextPeak }), "pink");
    }

    liveMomentumSnapshotRef.current = {
      ...snapshot,
      currentViewers: nextCurrent,
      peakViewers: Math.max(snapshot.peakViewers ?? 0, nextPeak),
    };
  }

  function evaluateEngagementMoments(summary = {}) {
    if (!isCreator) return;

    const totals = summary?.totals || {};
    const nextEngagements = Number(totals.engagements || 0);
    const snapshot = liveMomentumSnapshotRef.current;

    if (snapshot.totalEngagements !== null) {
      const engagementJump = nextEngagements - snapshot.totalEngagements;
      if (engagementJump >= 3) {
        pushLiveMoment("engagement-spike", t("videoDetails.engagementSpikeTitle"), t("videoDetails.engagementSpikeBody", { count: engagementJump }), "rose");
      }
    }

    liveMomentumSnapshotRef.current = {
      ...snapshot,
      totalEngagements: nextEngagements,
    };

    applyLiveAnalytics({
      liveLikes: Number(totals.likes || 0),
      liveComments: Number(totals.comments || 0),
      peakViewers: summary?.retention?.peakViewers,
    });
  }

  function appendEngagementItems(items) {
    setEngagementFeed((current) => mergeEngagementItems(current, items, 12));
  }

  function spawnFloatingHearts() {
    if (typeof window === "undefined") return;

    const hearts = createFloatingHeartBurst();
    setFloatingHearts((current) => [...current, ...hearts].slice(-36));

    hearts.forEach((heart) => {
      const timeoutId = window.setTimeout(() => {
        setFloatingHearts((current) => current.filter((item) => item.id !== heart.id));
        heartTimeoutsRef.current = heartTimeoutsRef.current.filter((activeId) => activeId !== timeoutId);
      }, heart.duration + heart.delay + 50);

      heartTimeoutsRef.current.push(timeoutId);
    });
  }

  useEffect(() => {
    let ignore = false;

    if (!video?.id || !isAuthenticated || !isLive) {
      setEngagementFeed([]);
      return undefined;
    }

    async function loadEngagements() {
      try {
        const response = await api.getLiveEngagements(video.id, { limit: 12, includeSummary: isCreator });
        if (ignore) return;

        appendEngagementItems(response?.data?.engagements || []);
        if (isCreator && response?.data?.summary) evaluateEngagementMoments(response.data.summary);
      } catch {
        // Ignore polling failures and retry.
      }
    }

    loadEngagements();
    const intervalId = window.setInterval(loadEngagements, LIVE_ENGAGEMENT_POLL_MS);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, isCreator, isLive, video?.id]);

  useEffect(() => {
    let ignore = false;

    if (!video?.id || !isAuthenticated || !isLive) {
      applyLiveAnalytics({ currentViewers: 0 });
      return undefined;
    }

    async function recordPresence() {
      try {
        const response = await api.recordLivePresence(video.id, {
          sessionKey: presenceSessionKeyRef.current,
          role: resolvedStageRole,
        });

        if (ignore) return;

        evaluatePresenceMoments(response?.data?.analytics || {});
        applyLiveAnalytics(response?.data?.analytics || {});
      } catch {
        // Ignore transient presence update failures.
      }
    }

    recordPresence();
    const intervalId = window.setInterval(recordPresence, LIVE_PRESENCE_POLL_MS);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
      api.leaveLivePresence(video.id, { sessionKey: presenceSessionKeyRef.current }).catch(() => {});
    };
  }, [isAuthenticated, isLive, resolvedStageRole, video?.id]);

  async function handleToggleLive() {
    if (!video || !isCreator) return;
    const actionKey = `${isLive ? "stop" : "start"}-live-${video.id}`;
    setBusyAction(actionKey);
    setError("");
    setFeedback("");
    try {
      if (isLive) {
        const recordingBlob = await finalizeRecording();
        const stopResponse = await api.stopVideoLive(video.id);
        let updatedVideo = stopResponse?.data?.video || null;
        if (recordingBlob) {
          const recordingFile = createRecordingUploadFile(recordingBlob, video.id);
          const upload = await uploadSelectedFile(recordingFile, "video", { directUploadRequiredMessage: t("upload.errors.directUploadRequired") });
          if (!upload?.id) throw new Error(t("upload.errors.unableToComplete"));
          const updateResponse = await api.updateVideo(video.id, { uploadId: upload.id, isDraft: true, isLive: false });
          updatedVideo = updateResponse?.data?.video || updatedVideo;
        }
        if (updatedVideo) {
          setVideo(updatedVideo);
          clearLiveCreationSession(video.id);
          navigate(buildVideoAnalyticsLink(updatedVideo), { replace: true });
        }
        setFeedback(stopResponse?.message || t("videoDetails.liveStopped"));
      } else {
        const response = await api.startVideoLive(video.id);
        if (response?.data?.video) setVideo(response.data.video);
        setFeedback(response?.message || t("videoDetails.liveStarted"));
      }
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("videoDetails.unableToLoad")));
    } finally {
      setBusyAction("");
    }
  }

  async function handleSubmitComment() {
    if (!video || !commentBody.trim() || !isAuthenticated) return;
    setSubmittingComment(true);
    setError("");
    try {
      const response = await api.postComment(video.id, commentBody.trim());
      const nextComment = response?.data?.comment;
      if (nextComment) {
        setComments((current) => [nextComment, ...current]);
        setVideo((current) => {
          if (!current) return current;

          const nextLiveComments = isLive ? (current.liveComments || 0) + 1 : (current.liveComments || 0);

          return {
            ...current,
            commentsCount: (current.commentsCount || 0) + 1,
            liveComments: nextLiveComments,
            liveAnalytics: {
              ...(current.liveAnalytics || {}),
              liveComments: nextLiveComments,
            },
          };
        });
        appendEngagementItems([buildCommentEngagementItem(nextComment)].filter(Boolean));
        setCommentBody("");
      }
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("videoDetails.commentError")));
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleSendLiveLike() {
    if (!video || !isLive || !isAuthenticated) return;

    spawnFloatingHearts();

    setVideo((current) => {
      if (!current) return current;

      const nextLiveLikes = (current.liveLikes || 0) + 1;

      return {
        ...current,
        likes: (current.likes || 0) + 1,
        liveLikes: nextLiveLikes,
        liveAnalytics: {
          ...(current.liveAnalytics || {}),
          liveLikes: nextLiveLikes,
        },
      };
    });

    try {
      const response = await api.likeLiveVideo(video.id);
      const nextVideo = response?.data?.video;
      const nextEngagement = response?.data?.engagement;

      if (nextVideo) {
        setVideo((current) => {
          if (!current) return nextVideo;

          return {
            ...current,
            ...nextVideo,
            likes: Math.max(current.likes || 0, nextVideo.likes || 0),
            liveLikes: Math.max(current.liveLikes || 0, nextVideo.liveLikes || 0),
            liveAnalytics: {
              ...(current.liveAnalytics || {}),
              ...(nextVideo.liveAnalytics || {}),
              liveLikes: Math.max(current.liveAnalytics?.liveLikes || 0, nextVideo.liveLikes || 0),
            },
          };
        });
      }

      if (nextEngagement) {
        appendEngagementItems([nextEngagement]);
      }
    } catch (nextError) {
      setVideo((current) => {
        if (!current) return current;

        const nextLiveLikes = Math.max((current.liveLikes || 1) - 1, 0);

        return {
          ...current,
          likes: Math.max((current.likes || 1) - 1, 0),
          liveLikes: nextLiveLikes,
          liveAnalytics: {
            ...(current.liveAnalytics || {}),
            liveLikes: nextLiveLikes,
          },
        };
      });
      setError(firstError(nextError?.errors, nextError?.message || t("videoDetails.liveStreamUnavailable")));
    }
  }

  if (!loading && video && !isLive && !isCreator) {
    return <Navigate to={buildVideoLink(video, { isLive: false })} replace />;
  }

  const stageTiles = [
    ...(resolvedStageRole === "host" && localStream ? [{ key: `local-${user?.id || "host"}`, stream: localStream, muted: true, label: t("videoDetails.liveCameraPreview") }] : []),
    ...remoteParticipants.map((participant, index) => ({
      key: `remote-${participant.uid}`,
      stream: participant.stream,
      muted: false,
      label: index === 0 ? t("videoDetails.liveStreamPlayback") : `${t("videoDetails.liveStreamPlayback")} ${index + 1}`,
    })),
  ];
  const livePlaceholderMessage = resolvedStageRole === "host" && previewStatus === "requesting"
    ? t("videoDetails.loadingLivePreview")
    : resolvedStageRole === "host" && previewStatus === "error"
      ? t("videoDetails.livePreviewUnavailable")
      : connectionStatus === "connecting"
        ? t("videoDetails.connectingLiveStream")
        : connectionStatus === "error"
          ? t("videoDetails.liveStreamUnavailable")
          : t("videoDetails.livePlaceholderBody");
  const currentViewers = video?.currentViewers ?? video?.liveAnalytics?.currentViewers ?? 0;
  const peakViewers = video?.liveAnalytics?.peakViewers ?? 0;
  const liveLikes = video?.liveLikes ?? video?.liveAnalytics?.liveLikes ?? 0;
  const liveComments = video?.liveComments ?? video?.liveAnalytics?.liveComments ?? video?.commentsCount ?? comments.length ?? 0;
  const engagementStats = [
    formatCountLabel(video?.views || 0, t("content.views")),
    `${formatCompactNumber(currentViewers)} ${t("videoDetails.currentViewers")}`,
    `${formatCompactNumber(peakViewers)} ${t("videoDetails.peakViewers")}`,
    `${formatCompactNumber(video?.likes || 0)} ${t("videoDetails.like")}`,
    `${formatCompactNumber(liveComments)} ${t("videoDetails.comments")}`,
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 dark:bg-[#121212] md:px-8 md:py-8">
      <div className="mx-auto max-w-350 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-black shadow-sm dark:bg-[#1D1D1D] dark:text-white">
            <HiArrowLeft className="h-5 w-5" /> {t("videoDetails.back")}
          </button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {isLive ? <span className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold tracking-wide text-white">{t("videoDetails.liveNow")}</span> : null}
          </div>
        </div>

        {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {feedback ? <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</div> : null}
        {loading ? <div className="rounded-4xl bg-white p-8 text-sm text-slate600 shadow-sm dark:bg-[#171717] dark:text-slate200">{t("videoDetails.loading")}</div> : null}

        {video ? (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr),400px]">
            <div className="space-y-6">
              <section className="overflow-hidden rounded-4xl bg-white shadow-sm dark:bg-[#171717]">
                <div className="relative aspect-video bg-black">
                  <style>{`@keyframes live-heart-float {0% {transform: translate3d(-50%, 0, 0) scale(.42) rotate(var(--heart-rotate)); opacity: 0;} 10% {opacity: 1;} 32% {transform: translate3d(calc(-50% + var(--heart-sway)), calc(var(--heart-rise) * -.28), 0) scale(.95) rotate(calc(var(--heart-rotate) * .55)); opacity: .98;} 68% {transform: translate3d(calc(-50% + calc(var(--heart-drift) * .58)), calc(var(--heart-rise) * -.72), 0) scale(1.08) rotate(calc(var(--heart-rotate) * .82)); opacity: .9;} 100% {transform: translate3d(calc(-50% + var(--heart-drift)), calc(var(--heart-rise) * -1), 0) scale(1.2) rotate(var(--heart-rotate)); opacity: 0;}} @keyframes live-heart-spark {0%,100% {transform: translate(-50%, 0) scale(.35); opacity: 0;} 24% {opacity: .95;} 72% {transform: translate(calc(-50% + var(--spark-drift)), -18px) scale(1.12); opacity: 0;}} @keyframes live-heart-glow {0%,100% {transform: translate(-50%, -50%) scale(.62); opacity: 0;} 16% {opacity: .68;} 60% {transform: translate(-50%, -50%) scale(1.2); opacity: .26;}}`}</style>
                  {stageTiles.length ? (
                    <div className={`grid h-full w-full ${stageTiles.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {stageTiles.map((tile) => (
                        <div key={tile.key} className="relative min-h-0">
                          <StageTile stream={tile.stream} label={tile.label} muted={tile.muted} />
                          {tile.muted ? <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">{t("videoDetails.onStage")}</span> : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-white">
                      <div className="max-w-lg">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-300">{t("videoDetails.liveNow")}</p>
                        <h2 className="mt-4 text-2xl font-semibold">{t("videoDetails.livePlaceholderTitle")}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-slate-300">{livePlaceholderMessage}</p>
                      </div>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                    {isCreator && liveMoments.length ? (
                      <div className="absolute left-4 top-4 z-10 flex max-w-70 flex-col gap-3">
                        {liveMoments.map((moment) => (
                          <article
                            key={moment.id}
                            data-testid="live-momentum-card"
                            className={`rounded-[1.25rem] border px-4 py-3 text-white shadow-lg backdrop-blur-sm ${moment.tone === "pink" ? "border-pink-300/30 bg-pink-500/80" : moment.tone === "rose" ? "border-rose-300/30 bg-rose-500/80" : "border-orange-300/30 bg-orange-500/80"}`}
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">{t("videoDetails.liveMomentum")}</p>
                            <p className="mt-1 text-sm font-semibold">{moment.title}</p>
                            <p className="mt-1 text-xs text-white/80">{moment.body}</p>
                          </article>
                        ))}
                      </div>
                    ) : null}
                    <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-pink-500/10 via-orange-400/8 to-transparent" />
                    <div className="absolute bottom-4 right-3 h-20 w-20 rounded-full bg-linear-to-br from-pink-500/35 via-orange-400/20 to-transparent blur-2xl" />
                    {floatingHearts.map((heart) => (
                      <div
                        key={heart.id}
                        data-testid="floating-heart"
                        className="absolute"
                        style={{
                          bottom: `${heart.bottom}%`,
                          left: `${heart.left}%`,
                          fontSize: `${heart.size}px`,
                          opacity: 0,
                          transform: "translateX(-50%)",
                          animation: `live-heart-float ${heart.duration}ms ease-out ${heart.delay}ms forwards`,
                          "--heart-drift": `${heart.drift}px`,
                          "--heart-sway": `${heart.sway}px`,
                          "--heart-rise": `${heart.rise}px`,
                          "--heart-rotate": `${heart.rotate}deg`,
                        }}
                      >
                        <span
                          className="absolute left-1/2 top-1/2 rounded-full blur-xl"
                          style={{
                            width: `${heart.glowSize}px`,
                            height: `${heart.glowSize}px`,
                            backgroundColor: `${heart.color}80`,
                            animation: `live-heart-glow ${heart.duration}ms ease-out ${heart.delay}ms forwards`,
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                        <span
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-full"
                          style={{
                            width: `${heart.trailWidth}px`,
                            height: `${heart.trailHeight}px`,
                            background: `linear-gradient(to top, ${heart.color}D9, ${heart.color}00)`,
                            filter: "blur(0.5px)",
                            transform: "translate(-50%, 10%)",
                          }}
                        />
                        {[-1, 1].map((direction) => (
                          <span
                            key={`${heart.id}-${direction}`}
                            className="absolute left-1/2 top-1/2 rounded-full bg-white/80"
                            style={{
                              width: `${heart.sparkleSize}px`,
                              height: `${heart.sparkleSize}px`,
                              opacity: 0,
                              animation: `live-heart-spark ${Math.max(520, heart.duration - 120)}ms ease-out ${heart.delay + 80}ms forwards`,
                              "--spark-drift": `${direction * (10 + Math.round(Math.abs(heart.drift) * 0.2))}px`,
                            }}
                          />
                        ))}
                        <FaHeart className="relative drop-shadow-[0_0_16px_rgba(255,255,255,0.55)]" style={{ color: heart.color }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5 px-5 py-5 md:px-6 md:py-6">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-black dark:text-white">{getVideoTitle(video)}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate500 dark:text-slate200">
                      {engagementStats.map((stat) => <span key={stat}>{stat}</span>)}
                      <span>{formatRelativeTime(video.createdAt)}</span>
                      {video.category?.label ? <span>{video.category.label}</span> : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <img src={getProfileAvatar(creatorProfile)} alt={getProfileName(creatorProfile)} className="h-16 w-16 rounded-full object-cover" />
                      <div className="min-w-0">
                        {creatorId ? <Link to={`/users/${creatorId}`} className="truncate text-lg font-medium text-black hover:opacity-80 dark:text-white">{getProfileName(creatorProfile)}</Link> : <p className="truncate text-lg font-medium text-black dark:text-white">{getProfileName(creatorProfile)}</p>}
                        <p className="text-sm text-slate500 dark:text-slate200">{formatSubscriberLabel(creatorProfile?.subscriberCount || 0, t("content.subscribers"))}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {isLive ? (
                        <button
                          type="button"
                          aria-label={`${t("videoDetails.like")} ${video?.likes || 0}`}
                          onClick={handleSendLiveLike}
                          className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
                        >
                          <FaHeart className="h-4 w-4" />
                          <span>{formatCompactNumber(video?.likes || 0)}</span>
                        </button>
                      ) : null}
                      {isCreator ? (
                        <button type="button" disabled={busyAction === `${isLive ? "stop" : "start"}-live-${video.id}`} onClick={handleToggleLive} className="rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                          {busyAction === `${isLive ? "stop" : "start"}-live-${video.id}` ? t(isLive ? "videoDetails.stoppingLive" : "videoDetails.startingLive") : t(isLive ? "videoDetails.stopLive" : "videoDetails.startLive")}
                        </button>
                      ) : null}
                      {isLive ? (
                        <button type="button" onClick={() => setStageRole((current) => (current === "host" ? "audience" : "host"))} className={`rounded-full px-6 py-3 text-sm font-semibold transition-colors ${resolvedStageRole === "host" ? "bg-white300 text-black dark:bg-black100 dark:text-white" : "bg-orange100 text-black"}`}>
                          {resolvedStageRole === "host" ? t("videoDetails.leaveStage") : t("videoDetails.joinStage")}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-slate700 dark:text-slate200">{video.description || video.caption || t("videoDetails.noDescription")}</p>
                </div>
              </section>
            </div>

            <aside className="flex flex-col gap-4 self-start xl:sticky xl:top-6">
              <section className="rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-black dark:text-white">{t("videoDetails.liveAnalytics")}</h2>
                  {isLive ? <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-500">{t("videoDetails.liveNow")}</span> : null}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { key: "current", label: t("videoDetails.currentViewers"), value: formatCompactNumber(currentViewers) },
                    { key: "peak", label: t("videoDetails.peakViewers"), value: formatCompactNumber(peakViewers) },
                    { key: "likes", label: t("videoDetails.like"), value: formatCompactNumber(liveLikes) },
                    { key: "comments", label: t("videoDetails.comments"), value: formatCompactNumber(liveComments) },
                  ].map((metric) => (
                    <div key={metric.key} className="rounded-3xl bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate500 dark:text-slate200">{metric.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-black dark:text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-black dark:text-white">{t("videoDetails.liveEngagement")}</h2>
                    <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("videoDetails.recentActivity")}</p>
                  </div>
                  <span className="text-sm text-slate500 dark:text-slate200">{engagementFeed.length}</span>
                </div>

                <div className="mt-4 space-y-3">
                  {engagementFeed.length ? engagementFeed.map((item) => (
                    <article key={item.id} className="rounded-3xl bg-[#F7F7F7] px-4 py-3 dark:bg-[#1F1F1F]">
                      <div className="flex gap-3">
                        <img src={getProfileAvatar(item.actor)} alt={getProfileName(item.actor, t("videoDetails.you"))} className="h-10 w-10 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-black dark:text-white">{getProfileName(item.actor, t("videoDetails.you"))}</p>
                            <span className="text-xs text-slate500 dark:text-slate200">{formatRelativeTime(item.createdAt)}</span>
                          </div>
                          <p className="mt-1 text-sm text-slate700 dark:text-slate200">
                            {item.type === "like" ? t("videoDetails.sentLikes") : t("videoDetails.commented")}
                          </p>
                          {item.body ? <p className="mt-2 text-sm leading-relaxed text-slate700 dark:text-slate200">{item.body}</p> : null}
                        </div>
                      </div>
                    </article>
                  )) : <div className="rounded-3xl bg-[#F7F7F7] px-4 py-8 text-center text-sm text-slate600 dark:bg-[#1F1F1F] dark:text-slate200">{t("videoDetails.noLiveEngagement")}</div>}
                </div>
              </section>

              <section className="max-h-[75vh] overflow-hidden rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-black dark:text-white">{t("videoDetails.comments")}</h2>
                  <span className="text-sm text-slate500 dark:text-slate200">{comments.length}</span>
                </div>

                <div className="mt-4 flex gap-3">
                  <img src={getProfileAvatar(user)} alt={getProfileName(user, t("videoDetails.you"))} className="h-11 w-11 rounded-full object-cover" />
                  <div className="flex-1 space-y-3">
                    <textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} rows={3} placeholder={t("videoDetails.commentPlaceholder")} className="w-full resize-none rounded-3xl bg-[#F7F7F7] px-4 py-3 text-sm text-slate100 outline-none placeholder:text-slate500 dark:bg-[#1F1F1F] dark:text-white dark:placeholder:text-slate200" />
                    <button type="button" disabled={submittingComment || !commentBody.trim()} onClick={handleSubmitComment} className="rounded-full bg-orange100 px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60">
                      {submittingComment ? t("videoDetails.posting") : t("videoDetails.postComment")}
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-4 overflow-y-auto pr-1">
                  {comments.length ? comments.map((comment) => (
                    <article key={comment.id} className="rounded-3xl bg-[#F7F7F7] p-4 dark:bg-[#1F1F1F]">
                      <div className="flex gap-3">
                        <img src={getProfileAvatar(comment.user)} alt={getProfileName(comment.user)} className="h-10 w-10 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-black dark:text-white">{getProfileName(comment.user)}</p>
                            <span className="text-xs text-slate500 dark:text-slate200">{formatRelativeTime(comment.createdAt)}</span>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate700 dark:text-slate200">{comment.body || comment.text}</p>
                        </div>
                      </div>
                    </article>
                  )) : <div className="rounded-3xl bg-[#F7F7F7] px-6 py-10 text-center text-sm text-slate600 dark:bg-[#1F1F1F] dark:text-slate200">{t("videoDetails.noComments")}</div>}
                </div>
              </section>

              {!isLive ? (
                <section className="rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
                  <img src={video.thumbnailUrl || getVideoThumbnail(video)} alt={getVideoTitle(video)} className="aspect-video w-full rounded-3xl object-cover" />
                </section>
              ) : null}
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}