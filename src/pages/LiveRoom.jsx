import { useCallback, useEffect, useRef, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import AnalyticsLineChart from "../components/analytics/AnalyticsLineChart";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { clearLiveCreationSession } from "../live/liveSessionStore";
import { api, DIRECT_UPLOAD_LARGE_FILE_THRESHOLD, firstError } from "../services/api";
import { subscribeToPrivateChannel } from "../services/realtime";
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
import { TbEyeCheck } from "react-icons/tb";
import { FiGift, FiSend } from "react-icons/fi";
import { MdClose } from "react-icons/md";

const LIVE_ENGAGEMENT_POLL_MS = 4000;
const LIVE_STATUS_POLL_MS = 5000;
const LIVE_PRESENCE_POLL_MS = 15000;
const LIVE_SIGNAL_POLL_MS = 3000;
const LIVE_AUDIENCE_POLL_MS = 5000;
const LIVE_HEART_COLORS = ["#f472b6", "#fb7185", "#f97316", "#ec4899"];
const LIVE_HEART_LANES = [91.8, 94.1, 96.1];
const LIVE_GIFT_PRESETS = [
  { name: "Rose", type: "rose", amount: 500, count: 1 },
  { name: "Spark", type: "spark", amount: 1200, count: 1 },
  { name: "Crown", type: "crown", amount: 3500, count: 1 },
  { name: "Galaxy", type: "galaxy", amount: 10000, count: 1 },
];
const EMPTY_LIVE_SUMMARY = {
  topFans: [],
  topGifters: [],
  topCommenters: [],
  topLikers: [],
  timeline: [],
  viewerTrend: [],
  peakMoments: [],
  retention: {
    startViewers: 0,
    endViewers: 0,
    averageViewers: 0,
    peakViewers: 0,
    retentionRate: 0,
  },
  totals: {
    likes: 0,
    comments: 0,
    tips: 0,
    tipsAmount: 0,
    engagements: 0,
    uniqueFans: 0,
  },
};

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

function mergeLiveComments(currentComments = [], nextComments = []) {
  const merged = [...currentComments];
  const seenIds = new Set(currentComments.map((comment) => comment.id));

  nextComments.forEach((comment) => {
    if (!comment?.id || seenIds.has(comment.id)) return;
    seenIds.add(comment.id);
    merged.push(comment);
  });

  return merged.sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());
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

function isRecentLiveActivity(activity, thresholdMs = LIVE_ENGAGEMENT_POLL_MS * 2) {
  const activityAt = new Date(activity?.createdAt || 0).getTime();
  if (!Number.isFinite(activityAt) || activityAt <= 0) return false;
  return Date.now() - activityAt <= thresholdMs;
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

function formatMinorCurrency(amount = 0, currency = "NGN") {
  const numericAmount = Number(amount || 0) / 100;

  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(numericAmount);
  } catch {
    return `${currency} ${numericAmount.toFixed(2)}`;
  }
}

function getGiftDisplayName(metadata = {}) {
  const giftCount = Math.max(1, Number(metadata?.giftCount || 1));
  const giftName = metadata?.giftName || "Gift";
  return giftCount > 1 ? `${giftCount}× ${giftName}` : giftName;
}

function getLiveEngagementLabel(item, t) {
  if (item?.type === "like") return t("videoDetails.sentLikes");
  if (item?.type === "tip") {
    const metadata = item?.metadata || {};
    if (metadata.giftName) return t("videoDetails.sentGift", { gift: getGiftDisplayName(metadata) });
    return t("videoDetails.sentTip", { amount: formatMinorCurrency(metadata.amount, metadata.currency) });
  }
  return t("videoDetails.commented");
}

function getLiveEngagementMeta(item, t) {
  if (item?.type !== "tip") return null;

  const metadata = item?.metadata || {};
  const parts = [formatMinorCurrency(metadata.amount, metadata.currency)];

  if (metadata.isPrivate) parts.push(t("videoDetails.privateGiftBadge"));

  return parts.join(" · ");
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

function LiveStageActionModal({ title, body, acceptLabel, rejectLabel, onAccept, onReject, busy = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-md rounded-4xl bg-white p-6 shadow-2xl dark:bg-[#171717]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange100">Live</p>
        <h2 className="mt-3 text-2xl font-semibold text-black dark:text-white">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate700 dark:text-slate200">{body}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onReject} disabled={busy} className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-white">
            {rejectLabel}
          </button>
          <button type="button" onClick={onAccept} disabled={busy} className="rounded-full bg-orange100 px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60">
            {acceptLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function LiveGiftTray({ t, open, message, onMessageChange, onClose, onSendGift, sendingGiftKey = "" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 py-6 sm:items-center">
      <section role="dialog" aria-modal="true" aria-label={t("videoDetails.sendGift")} className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-[#171717]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange100">Live</p>
            <h2 className="mt-3 text-2xl font-semibold text-black dark:text-white">{t("videoDetails.sendGiftTitle")}</h2>
            <p className="mt-2 text-sm text-slate700 dark:text-slate200">{t("videoDetails.sendGiftBody")}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-[#F7F7F7] p-3 text-black dark:bg-[#1F1F1F] dark:text-white">
            <MdClose className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {LIVE_GIFT_PRESETS.map((gift) => {
            const giftActionKey = `${gift.type}-${gift.amount}`;
            return (
              <button key={gift.type} type="button" onClick={() => onSendGift(gift)} disabled={sendingGiftKey !== ""} className="rounded-3xl border border-black/10 px-4 py-5 text-left transition hover:border-orange100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:hover:border-orange100">
                <div className="inline-flex rounded-full bg-orange100/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-200">{gift.name}</div>
                <p className="mt-4 text-2xl font-semibold text-black dark:text-white">{formatMinorCurrency(gift.amount)}</p>
                <p className="mt-2 text-sm text-slate600 dark:text-slate200">{sendingGiftKey === giftActionKey ? t("videoDetails.sendingGift") : t("videoDetails.sendGift")}</p>
              </button>
            );
          })}
        </div>

        <label className="mt-6 block text-sm font-medium text-black dark:text-white" htmlFor="live-gift-message">
          {t("videoDetails.giftMessage")}
        </label>
        <textarea id="live-gift-message" value={message} onChange={(event) => onMessageChange(event.target.value)} placeholder={t("videoDetails.giftMessagePlaceholder")} rows={3} className="mt-3 w-full resize-none rounded-3xl border border-black/10 px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1F1F1F] dark:text-white" />
      </section>
    </div>
  );
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
  const liveSignalCursorRef = useRef(0);
  const processedLiveSignalIdsRef = useRef(new Set());
  const engagementFeedRef = useRef([]);
  const engagementFeedPrimedRef = useRef(false);
  const recorderRef = useRef(null);
  const recorderChunksRef = useRef([]);
  const recorderStopPromiseRef = useRef(null);
  const creatorInsightsRefreshTimeoutRef = useRef(null);
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
  const [liveSummary, setLiveSummary] = useState(EMPTY_LIVE_SUMMARY);
  const [activeAudience, setActiveAudience] = useState([]);
  const [previewStatus, setPreviewStatus] = useState("idle");
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [stageRole, setStageRole] = useState("audience");
  const [stageAccessByUserId, setStageAccessByUserId] = useState({});
  const [stageActorsByUserId, setStageActorsByUserId] = useState({});
  const [stageNotificationQueue, setStageNotificationQueue] = useState([]);
  const [stageNotification, setStageNotification] = useState(null);
  const [isGiftTrayOpen, setIsGiftTrayOpen] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [sendingGiftKey, setSendingGiftKey] = useState("");

  const creatorId = video?.author?.id || video?.creator?.id;
  const creatorProfile = video?.author || video?.creator;
  const isCreator = Boolean(creatorId) && user?.id === creatorId;
  const isLive = isActiveLiveVideo(video);
  const resolvedStageRole = isCreator ? "host" : stageRole;
  const viewerStageStatus = !isCreator && user?.id ? (stageAccessByUserId[user.id] || "idle") : "idle";
  const shouldJoinAgora = Boolean(video?.id && video?.type === "video" && isAuthenticated && isLive);
  const shouldRecord = Boolean(isCreator && isLive && localStream);

  useEffect(() => () => stopMediaStream(localStream), [localStream]);
  useEffect(() => () => clearLiveCreationSession(id), [id]);

  useEffect(() => () => {
    heartTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    heartTimeoutsRef.current = [];
    liveMomentTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    liveMomentTimeoutsRef.current = [];
    if (creatorInsightsRefreshTimeoutRef.current) window.clearTimeout(creatorInsightsRefreshTimeoutRef.current);
  }, []);

  useEffect(() => {
    setEngagementFeed([]);
    setLiveSummary(EMPTY_LIVE_SUMMARY);
    setActiveAudience([]);
    setFloatingHearts([]);
    setLiveMoments([]);
    setStageAccessByUserId({});
    setStageActorsByUserId({});
    setStageNotificationQueue([]);
    setStageNotification(null);
    liveSignalCursorRef.current = 0;
    processedLiveSignalIdsRef.current = new Set();
    engagementFeedRef.current = [];
    engagementFeedPrimedRef.current = false;
    if (creatorInsightsRefreshTimeoutRef.current) {
      window.clearTimeout(creatorInsightsRefreshTimeoutRef.current);
      creatorInsightsRefreshTimeoutRef.current = null;
    }
    liveMomentumSnapshotRef.current = { peakViewers: null, currentViewers: null, totalEngagements: null };
    lastLiveMomentAtRef.current = {};
  }, [id]);

  useEffect(() => {
    engagementFeedRef.current = engagementFeed;
  }, [engagementFeed]);

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
    if (!isLive || isCreator) setIsGiftTrayOpen(false);
  }, [isCreator, isLive]);

  useEffect(() => {
    let ignore = false;

    if (!video?.id || !isAuthenticated || !isLive) {
      return undefined;
    }

    async function refreshVideoStatus() {
      try {
        const response = await api.getVideo(video.id);
        if (ignore) return;

        const nextVideo = response?.data?.video || null;
        if (nextVideo) setVideo(nextVideo);
      } catch {
        // Ignore transient status refresh failures and rely on other live updates.
      }
    }

    const intervalId = window.setInterval(refreshVideoStatus, LIVE_STATUS_POLL_MS);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, isLive, video?.id]);

  useEffect(() => {
    if (isCreator || !user?.id) return;

    if (viewerStageStatus === "approved") {
      setStageRole("host");
      return;
    }

    if (stageRole === "host") {
      setStageRole("audience");
    }
  }, [isCreator, stageRole, user?.id, viewerStageStatus]);

  const setViewerStageAccess = useCallback((participantId, nextStatus) => {
    if (!participantId) return;

    setStageAccessByUserId((current) => {
      const next = { ...current };
      if (nextStatus) next[participantId] = nextStatus;
      else delete next[participantId];
      return next;
    });
  }, []);

  const rememberStageActor = useCallback((actor) => {
    if (!actor?.id) return;

    setStageActorsByUserId((current) => ({
      ...current,
      [actor.id]: {
        ...(current[actor.id] || {}),
        ...actor,
      },
    }));
  }, []);

  const clearStageNotificationsForUser = useCallback((participantId, kind = null) => {
    if (!participantId) return;

    setStageNotification((current) => {
      if (!current || current.participantId !== participantId) return current;
      if (kind && current.kind !== kind) return current;
      return null;
    });
    setStageNotificationQueue((current) => current.filter((item) => item.participantId !== participantId || (kind && item.kind !== kind)));
  }, []);

  const queueStageNotification = useCallback((nextNotification) => {
    if (!nextNotification?.signalId) return;

    setStageNotificationQueue((current) => (
      current.some((item) => item.signalId === nextNotification.signalId)
        ? current
        : [...current, nextNotification]
    ));
  }, []);

  const applyStageSignal = useCallback((signal) => {
    const participantId = signal?.senderId === creatorId ? signal?.recipientId : signal?.senderId;
    const participantProfile = signal?.senderId === creatorId ? signal?.recipient : signal?.sender;
    const participantName = getProfileName(participantProfile, t("videoDetails.guestAudience"));

    rememberStageActor(participantProfile);

    switch (signal?.type) {
      case "join_request": {
        setViewerStageAccess(signal.senderId, "request_pending");
        if (isCreator) {
          queueStageNotification({
            signalId: signal.id,
            participantId: signal.senderId,
            kind: "request",
            actor: signal.sender,
          });
        }
        break;
      }
      case "join_invite": {
        setViewerStageAccess(signal.recipientId, "invite_pending");
        if (!isCreator && signal.recipientId === user?.id) {
          queueStageNotification({
            signalId: signal.id,
            participantId: signal.recipientId,
            kind: "invite",
            actor: signal.sender,
          });
        }
        break;
      }
      case "join_request_accepted": {
        setViewerStageAccess(signal.recipientId, "approved");
        clearStageNotificationsForUser(signal.recipientId, "request");
        if (!isCreator && signal.recipientId === user?.id) {
          setFeedback(t("videoDetails.requestAcceptedFeedback"));
          setStageRole("host");
        }
        break;
      }
      case "join_invite_accepted": {
        setViewerStageAccess(signal.senderId, "approved");
        clearStageNotificationsForUser(signal.senderId, "invite");
        if (isCreator) {
          setFeedback(t("videoDetails.inviteAcceptedFeedback", { name: participantName }));
        }
        break;
      }
      case "join_request_rejected": {
        setViewerStageAccess(signal.recipientId, null);
        clearStageNotificationsForUser(signal.recipientId, "request");
        if (!isCreator && signal.recipientId === user?.id) {
          setFeedback(t("videoDetails.requestRejectedFeedback"));
        }
        break;
      }
      case "join_invite_rejected": {
        setViewerStageAccess(signal.senderId, null);
        clearStageNotificationsForUser(signal.senderId, "invite");
        if (isCreator) {
          setFeedback(t("videoDetails.inviteRejectedFeedback", { name: participantName }));
        }
        break;
      }
      case "cohost_left": {
        setViewerStageAccess(participantId, null);
        clearStageNotificationsForUser(participantId);
        if (isCreator) {
          setFeedback(t(signal.senderId === creatorId ? "videoDetails.cohostRemovedFeedback" : "videoDetails.cohostLeftFeedback", { name: participantName }));
        } else if (participantId === user?.id) {
          setStageRole("audience");
          setFeedback(t(signal.senderId === creatorId ? "videoDetails.cohostRemovedFeedbackSelf" : "videoDetails.leftLiveFeedback"));
        }
        break;
      }
      default:
        break;
    }
  }, [clearStageNotificationsForUser, creatorId, isCreator, queueStageNotification, rememberStageActor, setViewerStageAccess, t, user?.id]);

  const consumeStageSignal = useCallback((signal) => {
    const signalId = Number(signal?.id || 0);
    if (!signalId) return;

    if (processedLiveSignalIdsRef.current.has(signalId)) {
      liveSignalCursorRef.current = Math.max(liveSignalCursorRef.current, signalId);
      return;
    }

    processedLiveSignalIdsRef.current.add(signalId);

    while (processedLiveSignalIdsRef.current.size > 200) {
      const oldestSignalId = processedLiveSignalIdsRef.current.values().next().value;
      processedLiveSignalIdsRef.current.delete(oldestSignalId);
    }

    liveSignalCursorRef.current = Math.max(liveSignalCursorRef.current, signalId);
    applyStageSignal(signal);
  }, [applyStageSignal]);

  useEffect(() => {
    if (stageNotification || !stageNotificationQueue.length) return;

    const [nextNotification, ...rest] = stageNotificationQueue;
    setStageNotification(nextNotification);
    setStageNotificationQueue(rest);
  }, [stageNotification, stageNotificationQueue]);

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
        try { recorder.stop(); } catch {
          // Ignore recorder stop cleanup failures.
        }
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
      try { recorder.requestData?.(); } catch {
        // Ignore recorder flush failures and continue stopping.
      }
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
        } catch {
          // Ignore Agora leave cleanup failures.
        }
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

  const applyLiveAnalytics = useCallback((partialAnalytics = {}) => {
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
  }, []);

  const pushLiveMoment = useCallback((kind, title, body, tone = "orange") => {
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
  }, [isCreator]);

  const evaluatePresenceMoments = useCallback((analytics = {}) => {
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
  }, [isCreator, pushLiveMoment, t]);

  const evaluateEngagementMoments = useCallback((summary = {}) => {
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
  }, [applyLiveAnalytics, isCreator, pushLiveMoment, t]);

  const spawnFloatingHearts = useCallback(() => {
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
  }, []);

  const appendEngagementItems = useCallback((items, options = {}) => {
    const { animateLikes = false, suppressInitialLikeAnimation = false } = options;
    const nextItems = Array.isArray(items) ? items.filter(Boolean) : [];
    const currentItems = engagementFeedRef.current;
    const seenIds = new Set(currentItems.map((item) => item.id));
    const uniqueItems = nextItems.filter((item) => item?.id && !seenIds.has(item.id));
    const isInitialSync = !engagementFeedPrimedRef.current && currentItems.length === 0;
    const shouldAnimateLikes = animateLikes && uniqueItems.some((item) => {
      if (item?.type !== "like") return false;
      if (Number(item?.actor?.id || 0) === Number(user?.id || 0)) return false;
      if (!isInitialSync || !suppressInitialLikeAnimation) return true;
      return isRecentLiveActivity(item);
    });
    const mergedItems = mergeEngagementItems(currentItems, nextItems, 12);

    engagementFeedPrimedRef.current = true;
    engagementFeedRef.current = mergedItems;
    setEngagementFeed(mergedItems);

    if (shouldAnimateLikes) {
      spawnFloatingHearts();
    }
  }, [spawnFloatingHearts, user?.id]);

  const refreshCreatorInsights = useCallback(async (videoId, { syncFeed = false } = {}) => {
    if (!isCreator || !videoId) return;

    const response = await api.getLiveEngagements(videoId, { limit: 12, includeSummary: true });
    const nextSummary = response?.data?.summary || EMPTY_LIVE_SUMMARY;
    setLiveSummary(nextSummary);
    evaluateEngagementMoments(nextSummary);

    if (syncFeed) appendEngagementItems(response?.data?.engagements || []);
  }, [appendEngagementItems, evaluateEngagementMoments, isCreator]);

  const scheduleCreatorInsightsRefresh = useCallback((videoId) => {
    if (!isCreator || !videoId || typeof window === "undefined") return;
    if (creatorInsightsRefreshTimeoutRef.current) return;

    creatorInsightsRefreshTimeoutRef.current = window.setTimeout(async () => {
      creatorInsightsRefreshTimeoutRef.current = null;

      try {
        await refreshCreatorInsights(videoId);
      } catch {
        // Ignore refresh failures and rely on polling fallback.
      }
    }, 700);
  }, [isCreator, refreshCreatorInsights]);

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

        appendEngagementItems(response?.data?.engagements || [], {
          animateLikes: true,
          suppressInitialLikeAnimation: true,
        });
        if (isCreator) {
          const nextSummary = response?.data?.summary || EMPTY_LIVE_SUMMARY;
          setLiveSummary(nextSummary);
          evaluateEngagementMoments(nextSummary);
        }
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
  }, [appendEngagementItems, evaluateEngagementMoments, isAuthenticated, isCreator, isLive, video?.id]);

  useEffect(() => {
    let ignore = false;

    if (!video?.id || !isAuthenticated || !isLive) {
      return undefined;
    }

    const unsubscribe = subscribeToPrivateChannel(`live.videos.${video.id}`, {
      ".live.engagement.created": (event) => {
        if (ignore || Number(event?.videoId || 0) !== Number(video.id || 0) || !event?.engagement) return;

        appendEngagementItems([event.engagement], { animateLikes: true });

        if (event?.comment?.id) {
          setComments((current) => mergeLiveComments(current, [event.comment]));
        }

        if (event?.analytics) {
          applyLiveAnalytics(event.analytics);

          if (isCreator) {
            const nextLikes = Number(event.analytics.liveLikes || 0);
            const nextComments = Number(event.analytics.liveComments || 0);

            evaluateEngagementMoments({
              totals: {
                likes: nextLikes,
                comments: nextComments,
                engagements: nextLikes + nextComments,
              },
            });
          }
        }

        if (isCreator) scheduleCreatorInsightsRefresh(video.id);
      },
      ".live.presence.updated": (event) => {
        if (ignore || Number(event?.videoId || 0) !== Number(video.id || 0) || !event?.analytics) return;

        applyLiveAnalytics(event.analytics);
        if (isCreator) evaluatePresenceMoments(event.analytics);
        if (isCreator) scheduleCreatorInsightsRefresh(video.id);
      },
    });

    return () => {
      ignore = true;
      unsubscribe?.();
    };
  }, [applyLiveAnalytics, appendEngagementItems, evaluateEngagementMoments, evaluatePresenceMoments, isAuthenticated, isCreator, isLive, scheduleCreatorInsightsRefresh, video?.id]);

  useEffect(() => {
    let ignore = false;

    if (!video?.id || !isAuthenticated || !isLive || !user?.id) {
      liveSignalCursorRef.current = 0;
      return undefined;
    }

    async function pollLiveSignals() {
      try {
        const response = await api.getLiveSignals(video.id, { after: liveSignalCursorRef.current });
        if (ignore) return;

        const nextSignals = response?.data?.signals || [];
        nextSignals.forEach((signal) => consumeStageSignal(signal));
        liveSignalCursorRef.current = response?.data?.latestSignalId ?? liveSignalCursorRef.current;
      } catch {
        // Ignore transient signal polling failures.
      }
    }

    const unsubscribe = subscribeToPrivateChannel(`live.videos.${video.id}.users.${user.id}`, {
      ".live.signal.created": (event) => {
        if (ignore || Number(event?.videoId || 0) !== Number(video.id || 0) || !event?.signal) return;
        consumeStageSignal(event.signal);
      },
    });

    pollLiveSignals();
    const intervalId = window.setInterval(pollLiveSignals, LIVE_SIGNAL_POLL_MS);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
      unsubscribe?.();
    };
  }, [consumeStageSignal, isAuthenticated, isLive, user?.id, video?.id]);

  useEffect(() => {
    let ignore = false;

    if (!video?.id || !isAuthenticated || !isLive || !isCreator) {
      setActiveAudience([]);
      return undefined;
    }

    async function pollActiveAudience() {
      try {
        const response = await api.getLiveAudience(video.id);
        if (ignore) return;

        setActiveAudience(response?.data?.audience || []);
      } catch {
        // Ignore transient audience polling failures.
      }
    }

    pollActiveAudience();
    const intervalId = window.setInterval(pollActiveAudience, LIVE_AUDIENCE_POLL_MS);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, isCreator, isLive, video?.id]);

  useEffect(() => {
    let ignore = false;

    if (!video?.id || !isAuthenticated || !isLive || !isCreator) {
      return undefined;
    }

    const unsubscribe = subscribeToPrivateChannel(`live.videos.${video.id}.creator`, {
      ".live.audience.updated": (event) => {
        if (ignore || Number(event?.videoId || 0) !== Number(video.id || 0) || !Array.isArray(event?.audience)) return;
        setActiveAudience(event.audience);
      },
    });

    return () => {
      ignore = true;
      unsubscribe?.();
    };
  }, [isAuthenticated, isCreator, isLive, video?.id]);

  useEffect(() => {
    let ignore = false;
    const presenceSessionKey = presenceSessionKeyRef.current;

    if (!video?.id || !isAuthenticated || !isLive) {
      applyLiveAnalytics({ currentViewers: 0 });
      return undefined;
    }

    async function recordPresence() {
      try {
        const response = await api.recordLivePresence(video.id, {
          sessionKey: presenceSessionKey,
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
      api.leaveLivePresence(video.id, { sessionKey: presenceSessionKey }).catch(() => {});
    };
  }, [applyLiveAnalytics, evaluatePresenceMoments, isAuthenticated, isLive, resolvedStageRole, video?.id]);

  async function handleToggleLive() {
    if (!video || !isCreator) return;
    const actionKey = `${isLive ? "stop" : "start"}-live-${video.id}`;
    setBusyAction(actionKey);
    setError("");
    setFeedback("");
    try {
      if (isLive) {
        const recordingBlobPromise = finalizeRecording();
        const stopResponse = await api.stopVideoLive(video.id);
        const endedVideo = stopResponse?.data?.video || {
          ...video,
          isLive: false,
          isDraft: true,
          liveEndedAt: new Date().toISOString(),
        };

        setVideo(endedVideo);
        clearLiveCreationSession(video.id);
        setFeedback(stopResponse?.message || t("videoDetails.liveStopped"));

        void (async () => {
          const recordingBlob = await recordingBlobPromise;
          if (!recordingBlob) return;

          const recordingFile = createRecordingUploadFile(recordingBlob, video.id);
          const upload = await uploadSelectedFile(recordingFile, "video", { directUploadRequiredMessage: t("upload.errors.directUploadRequired") });
          if (!upload?.id) throw new Error(t("upload.errors.unableToComplete"));
          await api.updateVideo(video.id, { uploadId: upload.id, isDraft: true, isLive: false });
        })().catch(() => {
          // Ignore delayed recording upload failures after the live has already ended.
        });
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
        setComments((current) => mergeLiveComments(current, [nextComment]));
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

  async function handleSendLiveGift(gift) {
    if (!video || !isLive || !isAuthenticated || isCreator) return;

    const actionKey = `${gift.type}-${gift.amount}`;
    setSendingGiftKey(actionKey);
    setError("");
    setFeedback("");

    try {
      const response = await api.sendLiveTip(video.id, {
        amount: gift.amount,
        currency: "NGN",
        message: giftMessage.trim() || undefined,
        giftName: gift.name,
        giftType: gift.type,
        giftCount: gift.count,
      });
      const nextVideo = response?.data?.video;
      const nextEngagement = response?.data?.engagement;

      if (nextVideo) {
        setVideo((current) => ({
          ...(current || {}),
          ...nextVideo,
          liveAnalytics: {
            ...(current?.liveAnalytics || {}),
            ...(nextVideo.liveAnalytics || {}),
          },
        }));
      }

      if (nextEngagement) appendEngagementItems([nextEngagement]);

      setFeedback(response?.message || "");
      setGiftMessage("");
      setIsGiftTrayOpen(false);
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("videoDetails.liveStreamUnavailable")));
    } finally {
      setSendingGiftKey("");
    }
  }

  async function handleRequestToJoin() {
    if (!video || !isLive || !user?.id || isCreator || viewerStageStatus !== "idle") return;

    const actionKey = `stage-request-${video.id}-${user.id}`;
    setBusyAction(actionKey);
    setError("");
    setFeedback("");

    try {
      await api.sendLiveSignal(video.id, { type: "join_request" });
      setViewerStageAccess(user.id, "request_pending");
      setFeedback(t("videoDetails.requestSentFeedback"));
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("videoDetails.liveStreamUnavailable")));
    } finally {
      setBusyAction("");
    }
  }

  async function handleLeaveAsCohost() {
    if (!video || !user?.id || isCreator || resolvedStageRole !== "host") return;

    const actionKey = `cohost-leave-${video.id}-${user.id}`;
    setBusyAction(actionKey);
    setError("");
    setFeedback("");

    try {
      await api.sendLiveSignal(video.id, { type: "cohost_left" });
      setViewerStageAccess(user.id, null);
      setStageRole("audience");
      setFeedback(t("videoDetails.leftLiveFeedback"));
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("videoDetails.liveStreamUnavailable")));
    } finally {
      setBusyAction("");
    }
  }

  async function handleRemoveCohost(actor) {
    if (!video || !isCreator || !isLive || !actor?.id || stageAccessByUserId[actor.id] !== "approved") return;

    const actionKey = `remove-cohost-${video.id}-${actor.id}`;
    setBusyAction(actionKey);
    setError("");
    setFeedback("");

    try {
      await api.sendLiveSignal(video.id, { recipientId: actor.id, type: "cohost_left" });
      setViewerStageAccess(actor.id, null);
      clearStageNotificationsForUser(actor.id);
      setFeedback(t("videoDetails.cohostRemovedFeedback", { name: getProfileName(actor, t("videoDetails.guestAudience")) }));
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("videoDetails.liveStreamUnavailable")));
    } finally {
      setBusyAction("");
    }
  }

  async function handleInviteAudience(actor) {
    if (!video || !isCreator || !isLive || !actor?.id || actor.id === creatorId) return;

    const actionKey = `invite-stage-${video.id}-${actor.id}`;
    setBusyAction(actionKey);
    setError("");
    setFeedback("");

    try {
      await api.sendLiveSignal(video.id, { recipientId: actor.id, type: "join_invite" });
      setViewerStageAccess(actor.id, "invite_pending");
      setFeedback(t("videoDetails.inviteSentFeedback", { name: getProfileName(actor, t("videoDetails.guestAudience")) }));
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("videoDetails.liveStreamUnavailable")));
    } finally {
      setBusyAction("");
    }
  }

  async function handleStageNotificationAction(action) {
    if (!video || !stageNotification) return;

    const participantId = stageNotification.participantId;
    const actorName = getProfileName(stageNotification.actor, t("videoDetails.guestAudience"));
    const actionKey = `stage-notification-${stageNotification.signalId}-${action}`;
    const isRequest = stageNotification.kind === "request";

    setBusyAction(actionKey);
    setError("");

    try {
      if (isRequest) {
        await api.sendLiveSignal(video.id, {
          recipientId: participantId,
          type: action === "accept" ? "join_request_accepted" : "join_request_rejected",
        });

        setViewerStageAccess(participantId, action === "accept" ? "approved" : null);
        setFeedback(t(action === "accept" ? "videoDetails.requestAcceptedByHostFeedback" : "videoDetails.requestRejectedByHostFeedback", { name: actorName }));
      } else {
        await api.sendLiveSignal(video.id, {
          type: action === "accept" ? "join_invite_accepted" : "join_invite_rejected",
        });

        setViewerStageAccess(user?.id, action === "accept" ? "approved" : null);
        setFeedback(t(action === "accept" ? "videoDetails.inviteAcceptedFeedbackSelf" : "videoDetails.inviteRejectedFeedbackSelf", { name: actorName }));
        if (action === "accept") setStageRole("host");
      }

      setStageNotification(null);
      clearStageNotificationsForUser(participantId, stageNotification.kind);
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("videoDetails.liveStreamUnavailable")));
    } finally {
      setBusyAction("");
    }
  }

  function isApprovedCohost(actorId) {
    return stageAccessByUserId[actorId] === "approved";
  }

  function getAudienceActionBusyKey(actorId) {
    return isApprovedCohost(actorId)
      ? `remove-cohost-${video?.id}-${actorId}`
      : `invite-stage-${video?.id}-${actorId}`;
  }

  function getAudienceActionLabel(actorId) {
    if (isApprovedCohost(actorId)) return t("videoDetails.removeCohost");
    if (stageAccessByUserId[actorId] === "request_pending") return t("videoDetails.requestPending");
    if (stageAccessByUserId[actorId] === "invite_pending") return t("videoDetails.inviteSent");
    return t("videoDetails.inviteToJoin");
  }

  function isAudienceActionDisabled(actorId) {
    return busyAction === getAudienceActionBusyKey(actorId) || ["request_pending", "invite_pending"].includes(stageAccessByUserId[actorId] || "");
  }

  function handleAudienceAction(actor) {
    if (isApprovedCohost(actor?.id)) {
      return handleRemoveCohost(actor);
    }

    return handleInviteAudience(actor);
  }

  if (!loading && video && !isLive) {
    return <Navigate to={isCreator ? buildVideoAnalyticsLink(video) : buildVideoLink(video, { isLive: false })} replace />;
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
  const liveTipsCount = video?.liveAnalytics?.liveTipsCount ?? 0;
  const liveTipsAmount = video?.liveAnalytics?.liveTipsAmount ?? 0;
  const liveSummaryTopFans = liveSummary?.topFans || [];
  const liveSummaryTopGifters = liveSummary?.topGifters || [];
  const liveSummaryPeakMoments = liveSummary?.peakMoments || [];
  const liveSummaryTimeline = liveSummary?.timeline || [];
  const liveSummaryRetention = liveSummary?.retention || EMPTY_LIVE_SUMMARY.retention;
  const liveSummaryTotals = liveSummary?.totals || EMPTY_LIVE_SUMMARY.totals;
  const activeAudienceCount = activeAudience.length;
  const currentCohosts = Object.entries(stageAccessByUserId)
    .filter(([participantId, status]) => status === "approved" && `${participantId}` !== `${creatorId}`)
    .map(([participantId]) => stageActorsByUserId[participantId] || { id: participantId });
  const currentCohostCount = currentCohosts.length;
  const isCohost = !isCreator && resolvedStageRole === "host";
  const stageActionBusyKey = isCohost ? `cohost-leave-${video?.id}-${user?.id}` : `stage-request-${video?.id}-${user?.id}`;
  const stageActionLabel = isCohost
    ? t("videoDetails.leaveLive")
    : viewerStageStatus === "request_pending"
      ? t("videoDetails.requestSent")
      : viewerStageStatus === "invite_pending"
        ? t("videoDetails.respondToInvite")
        : t("videoDetails.requestToJoin");
  const engagementStats = [
    formatCountLabel(video?.views || 0, t("content.views")),
    `${formatCompactNumber(currentViewers)} ${t("videoDetails.currentViewers")}`,
    `${formatCompactNumber(peakViewers)} ${t("videoDetails.peakViewers")}`,
    `${formatCompactNumber(video?.likes || 0)} ${t("videoDetails.like")}`,
    `${formatCompactNumber(liveComments)} ${t("videoDetails.comments")}`,
  ];

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gray-50 px-4 py-5 dark:bg-[#121212] md:px-8 md:py-8">
      {stageNotification ? (
        <LiveStageActionModal
          title={stageNotification.kind === "request" ? t("videoDetails.stageRequestTitle") : t("videoDetails.stageInviteTitle")}
          body={stageNotification.kind === "request"
            ? t("videoDetails.stageRequestBody", { name: getProfileName(stageNotification.actor, t("videoDetails.guestAudience")) })
            : t("videoDetails.stageInviteBody", { name: getProfileName(stageNotification.actor, t("videoDetails.guestAudience")) })}
          acceptLabel={stageNotification.kind === "request" ? t("videoDetails.acceptRequest") : t("videoDetails.acceptInvite")}
          rejectLabel={stageNotification.kind === "request" ? t("videoDetails.rejectRequest") : t("videoDetails.rejectInvite")}
          onAccept={() => handleStageNotificationAction("accept")}
          onReject={() => handleStageNotificationAction("reject")}
          busy={busyAction.startsWith(`stage-notification-${stageNotification.signalId}-`)}
        />
      ) : null}
      <LiveGiftTray
        t={t}
        open={isGiftTrayOpen}
        message={giftMessage}
        onMessageChange={setGiftMessage}
        onClose={() => { setIsGiftTrayOpen(false); setGiftMessage(""); }}
        onSendGift={handleSendLiveGift}
        sendingGiftKey={sendingGiftKey}
      />
      <div className="mx-auto max-w-350 space-y-4 w-full">
        <div className="hidden md:flex items-center justify-between gap-4">
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
          <div className="xl:grid xl:gap-8 xl:grid-cols-[1fr,300px] w-full">
            <div className="space-y-6 w-full ">
              <section className="overflow-hidden h-screen md:h-auto w-full md:mb-6  md:rounded-4xl bg-white shadow-sm dark:bg-[#171717]">
                <div className="relative md:aspect-video h-full w-full bg-black ">
                  {isLive ? <div className="absolute top-4 left-4 z-20 flex gap-4 items-center md:hidden">
                    <div className="flex items-center gap-4">
                      <img src={getProfileAvatar(creatorProfile)} alt={getProfileName(creatorProfile)} className="h-7 w-7 rounded-full object-cover" />
                      <div className="min-w-0">
                        {creatorId ? <Link to={`/users/${creatorId}`} className="truncate text-lg font-medium text-white hover:opacity-80 dark:text-white">{getProfileName(creatorProfile)}</Link> : <p className="truncate text-lg font-medium text-black dark:text-white">{getProfileName(creatorProfile)}</p>}
                       
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white text-base"><TbEyeCheck className="w-5 h-5 text-white"/> {formatCompactNumber(peakViewers)}</div>
                    <span className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold tracking-wide text-white">Live</span>
                    
                      {isCreator ? (
                        <button type="button" disabled={busyAction === `${isLive ? "stop" : "start"}-live-${video.id}`} onClick={handleToggleLive} className="ml-auto disabled:cursor-not-allowed disabled:opacity-60">
                          <MdClose className="w-8 h-8 text-white"/>
                        </button>
                      ) : null}

                  </div>: null}
                  {isLive ? <div className=" absolute bottom-0 left-0 px-2 pb-2 z-20 md:hidden w-full">
                    <div className="mt-4 space-y-3 max-h-50 max-w-60 overflow-auto">
                  {engagementFeed.length ? engagementFeed.map((item) => (
                    <article key={item.id} className="">
                      <div className="flex gap-3">
                        <img src={getProfileAvatar(item.actor)} alt={getProfileName(item.actor, t("videoDetails.you"))} className="h-7 w-7 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-white">{getProfileName(item.actor, t("videoDetails.you"))}</p>
                            <p className="mt-1 text-sm text-white">
                            {getLiveEngagementLabel(item, t)}
                          </p>
                          </div>
                          {getLiveEngagementMeta(item, t) ? <p className="mt-1 text-xs text-slate200">{getLiveEngagementMeta(item, t)}</p> : null}
                          {item.body ? <p className="mt-1 text-sm leading-relaxed text-white">{item.body}</p> : null}
                          
                        </div>
                      </div>
                    </article>
                  )) : <div className="rounded-3xl bg-[#F7F7F7] px-4 py-8 text-center text-sm text-slate600 dark:bg-[#1F1F1F] dark:text-slate200">{t("videoDetails.noLiveEngagement")}</div>}
                </div>
<div className="flex items-end justify-between gap-3 w-full">
                <div className="flex items-center gap-5 space-y-3">
                    <textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} rows={2} placeholder={t("videoDetails.commentPlaceholder")} className="w-full resize-none border-b min-w-60 border-b-white px-4 py-3 text-sm text-slate100 outline-none placeholder:text-slate500 dark:bg-[#1F1F1F] dark:text-white dark:placeholder:text-slate200" />
                    <button type="button" disabled={submittingComment || !commentBody.trim()} onClick={handleSubmitComment} className="rounded-full shrink-0 border border-white w-12 h-12 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60">
                     <FiSend className="text-white w-7 h-7"/>
                    </button>
                  </div>

                  {!isCreator && isLive ? (
                        <button
                          type="button"
                          aria-label={t("videoDetails.sendGift")}
                          onClick={() => setIsGiftTrayOpen(true)}
                          className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition hover:bg-white/20"
                        >
                          <FiGift className="h-4 w-4" />
                          <span>{t("videoDetails.sendGift")}</span>
                        </button>
                      ) : null}
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
                      </div>
                  </div>: null}

                  
                  <style>{`@keyframes live-heart-float {0% {transform: translate3d(-50%, 0, 0) scale(.42) rotate(var(--heart-rotate)); opacity: 0;} 10% {opacity: 1;} 32% {transform: translate3d(calc(-50% + var(--heart-sway)), calc(var(--heart-rise) * -.28), 0) scale(.95) rotate(calc(var(--heart-rotate) * .55)); opacity: .98;} 68% {transform: translate3d(calc(-50% + calc(var(--heart-drift) * .58)), calc(var(--heart-rise) * -.72), 0) scale(1.08) rotate(calc(var(--heart-rotate) * .82)); opacity: .9;} 100% {transform: translate3d(calc(-50% + var(--heart-drift)), calc(var(--heart-rise) * -1), 0) scale(1.2) rotate(var(--heart-rotate)); opacity: 0;}} @keyframes live-heart-spark {0%,100% {transform: translate(-50%, 0) scale(.35); opacity: 0;} 24% {opacity: .95;} 72% {transform: translate(calc(-50% + var(--spark-drift)), -18px) scale(1.12); opacity: 0;}} @keyframes live-heart-glow {0%,100% {transform: translate(-50%, -50%) scale(.62); opacity: 0;} 16% {opacity: .68;} 60% {transform: translate(-50%, -50%) scale(1.2); opacity: .26;}}`}</style>
                  {stageTiles.length ? (
                    <div className={`grid h-full w-full ${stageTiles.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {stageTiles.map((tile) => (
                        <div key={tile.key} className="relative min-h-0">
                          <StageTile stream={tile.stream} label={tile.label} muted={tile.muted} />
                          {tile.muted ? <span className="hidden absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">{t("videoDetails.onStage")}</span> : null}
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

                <div className="hidden md:block space-y-5 px-5 py-5 md:px-6 md:py-6">
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
                      {!isCreator && isLive ? (
                        <button
                          type="button"
                          onClick={() => setIsGiftTrayOpen(true)}
                          className="inline-flex items-center gap-2 rounded-full bg-white300 px-5 py-3 text-sm font-semibold text-black shadow-sm transition-transform hover:scale-[1.02] dark:bg-black100 dark:text-white"
                        >
                          <FiGift className="h-4 w-4" />
                          <span>{t("videoDetails.sendGift")}</span>
                        </button>
                      ) : null}
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
                      {!isCreator && isLive ? (
                        <button
                          type="button"
                          disabled={busyAction === stageActionBusyKey || viewerStageStatus === "request_pending" || viewerStageStatus === "invite_pending"}
                          onClick={isCohost ? handleLeaveAsCohost : handleRequestToJoin}
                          className={`rounded-full px-6 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${isCohost ? "bg-white300 text-black dark:bg-black100 dark:text-white" : "bg-orange100 text-black"}`}
                        >
                          {stageActionLabel}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-slate700 dark:text-slate200">{video.description || video.caption || t("videoDetails.noDescription")}</p>
                </div>
              </section>
            </div>

            <aside className="flex flex-col gap-4 self-start xl:sticky xl:top-6">
              <section className="hidden md:block rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
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
                    { key: "tips", label: t("videoDetails.giftsReceived"), value: formatCompactNumber(liveTipsCount) },
                    { key: "tipRevenue", label: t("videoDetails.giftRevenue"), value: formatMinorCurrency(liveTipsAmount) },
                  ].map((metric) => (
                    <div key={metric.key} className="rounded-3xl bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate500 dark:text-slate200">{metric.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-black dark:text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {isCreator && isLive ? (
                <section className="hidden md:block rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-black dark:text-white">{t("videoDetails.currentCohosts")}</h2>
                      <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("videoDetails.currentCohostsBody")}</p>
                    </div>
                    <span className="text-sm text-slate500 dark:text-slate200">{currentCohostCount}</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {currentCohostCount ? currentCohosts.map((actor) => (
                      <article key={actor.id} className="rounded-3xl bg-[#F7F7F7] px-4 py-3 dark:bg-[#1F1F1F]">
                        <div className="flex gap-3">
                          <img src={getProfileAvatar(actor)} alt={getProfileName(actor, t("videoDetails.guestAudience"))} className="h-10 w-10 rounded-full object-cover" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-black dark:text-white">{getProfileName(actor, t("videoDetails.guestAudience"))}</p>
                              {actor?.username ? <span className="text-xs text-slate500 dark:text-slate200">@{actor.username}</span> : null}
                            </div>
                            <p className="mt-1 text-sm text-slate700 dark:text-slate200">{t("videoDetails.onStage")}</p>
                          </div>
                          {actor?.id ? (
                            <button
                              type="button"
                              disabled={busyAction === getAudienceActionBusyKey(actor.id)}
                              onClick={() => handleRemoveCohost(actor)}
                              className="self-start rounded-full bg-white300 px-4 py-2 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60 dark:bg-black100 dark:text-white"
                            >
                              {t("videoDetails.removeCohost")}
                            </button>
                          ) : null}
                        </div>
                      </article>
                    )) : <div className="rounded-3xl bg-[#F7F7F7] px-4 py-8 text-center text-sm text-slate600 dark:bg-[#1F1F1F] dark:text-slate200">{t("videoDetails.noCurrentCohosts")}</div>}
                  </div>
                </section>
              ) : null}

              {isCreator && isLive ? (
                <section className="hidden md:block rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-black dark:text-white">{t("videoDetails.sessionSummary")}</h2>
                      <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("videoDetails.recentActivity")}</p>
                    </div>
                    <span className="text-sm text-slate500 dark:text-slate200">{formatCompactNumber(liveSummaryTotals.engagements || 0)}</span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      { key: "engagements", label: t("videoDetails.engagementActions"), value: formatCompactNumber(liveSummaryTotals.engagements || 0) },
                      { key: "fans", label: t("videoDetails.uniqueFans"), value: formatCompactNumber(liveSummaryTotals.uniqueFans || 0) },
                      { key: "tips", label: t("videoDetails.giftsReceived"), value: formatCompactNumber(liveSummaryTotals.tips || 0) },
                      { key: "tipRevenue", label: t("videoDetails.giftRevenue"), value: formatMinorCurrency(liveSummaryTotals.tipsAmount || 0) },
                      { key: "average", label: t("videoDetails.averageViewers"), value: formatCompactNumber(liveSummaryRetention.averageViewers || 0) },
                      { key: "retention", label: t("videoDetails.retentionRate"), value: `${Math.max(0, Math.round(liveSummaryRetention.retentionRate || 0))}%` },
                    ].map((metric) => (
                      <div key={metric.key} className="rounded-3xl bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate500 dark:text-slate200">{metric.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-black dark:text-white">{metric.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block mt-4 rounded-3xl bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-black dark:text-white">{t("videoDetails.topSupporters")}</h3>
                        <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("videoDetails.topFans")}</p>
                      </div>
                      <span className="text-sm text-slate500 dark:text-slate200">{liveSummaryTopFans.length}</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {liveSummaryTopFans.length ? liveSummaryTopFans.slice(0, 3).map((fan) => (
                        <div key={`${fan?.actor?.id || fan?.actor?.fullName || "fan"}-${fan?.engagementCount || 0}`} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 dark:bg-[#171717]">
                          <img src={getProfileAvatar(fan.actor)} alt={getProfileName(fan.actor, t("videoDetails.guestAudience"))} className="h-10 w-10 rounded-full object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-black dark:text-white">{getProfileName(fan.actor, t("videoDetails.guestAudience"))}</p>
                            <p className="mt-1 text-xs text-slate500 dark:text-slate200">
                              {formatCompactNumber(fan.engagementCount || 0)} {t("videoDetails.engagementActions")}
                              {(fan.tipsCount || 0) > 0 ? ` · ${t("videoDetails.giftsCount", { count: fan.tipsCount || 0 })}` : ""}
                            </p>
                          </div>
                          <span className="rounded-full bg-orange100 px-3 py-1 text-xs font-semibold text-black dark:bg-[#2A2117] dark:text-white">{(fan.tipsAmount || 0) > 0 ? formatMinorCurrency(fan.tipsAmount || 0) : `${formatCompactNumber(fan.likesCount || 0)} ❤`}</span>
                        </div>
                      )) : <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-slate600 dark:bg-[#171717] dark:text-slate200">{t("videoDetails.noTopFans")}</div>}
                    </div>
                  </div>

                  <div className="hidden md:block mt-4 rounded-3xl bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-black dark:text-white">{t("videoDetails.topGifters")}</h3>
                        <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("videoDetails.sendGiftTitle")}</p>
                      </div>
                      <span className="text-sm text-slate500 dark:text-slate200">{liveSummaryTopGifters.length}</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {liveSummaryTopGifters.length ? liveSummaryTopGifters.slice(0, 3).map((gifter) => (
                        <div key={`${gifter?.actor?.id || gifter?.actor?.fullName || "gifter"}-${gifter?.tipsAmount || 0}`} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 dark:bg-[#171717]">
                          <img src={getProfileAvatar(gifter.actor)} alt={getProfileName(gifter.actor, t("videoDetails.guestAudience"))} className="h-10 w-10 rounded-full object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-black dark:text-white">{getProfileName(gifter.actor, t("videoDetails.guestAudience"))}</p>
                            <p className="mt-1 text-xs text-slate500 dark:text-slate200">{t("videoDetails.giftsCount", { count: gifter.tipsCount || 0 })}</p>
                          </div>
                          <span className="rounded-full bg-orange100 px-3 py-1 text-xs font-semibold text-black dark:bg-[#2A2117] dark:text-white">{formatMinorCurrency(gifter.tipsAmount || 0)}</span>
                        </div>
                      )) : <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-slate600 dark:bg-[#171717] dark:text-slate200">{t("videoDetails.noTopGifters")}</div>}
                    </div>
                  </div>

                  <div className="hidden md:grid mt-4 gap-4 xl:grid-cols-2">
                    <div className="rounded-3xl bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                      <div>
                        <h3 className="text-base font-semibold text-black dark:text-white">{t("videoDetails.engagementTimeline")}</h3>
                        <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("videoDetails.engagementTimelineBody")}</p>
                      </div>

                      {liveSummaryTimeline.length ? (
                        <div className="mt-4">
                          <AnalyticsLineChart
                            ariaLabel={t("videoDetails.engagementTimeline")}
                            data={liveSummaryTimeline}
                            series={[
                              { key: "engagementCount", label: t("videoDetails.engagementActions"), color: "#ec4899" },
                              { key: "viewersCount", label: t("videoDetails.currentViewers"), color: "#f97316" },
                            ]}
                          />
                        </div>
                      ) : <div className="mt-4 rounded-2xl bg-white px-4 py-6 text-center text-sm text-slate600 dark:bg-[#171717] dark:text-slate200">{t("videoDetails.noTimelineData")}</div>}
                    </div>

                    <div className="rounded-3xl bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                      <div>
                        <h3 className="text-base font-semibold text-black dark:text-white">{t("videoDetails.peakMoments")}</h3>
                        <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("videoDetails.peakMomentsBody")}</p>
                      </div>

                      <div className="mt-4 space-y-3">
                        {liveSummaryPeakMoments.length ? liveSummaryPeakMoments.map((moment) => (
                          <div key={`${moment?.label || "moment"}-${moment?.startedAt || ""}`} className="rounded-2xl bg-white px-4 py-3 dark:bg-[#171717]">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-black dark:text-white">{moment.label}</p>
                              <span className="rounded-full bg-orange100 px-3 py-1 text-xs font-semibold text-black dark:bg-[#2A2117] dark:text-white">{formatCompactNumber(moment.engagementCount || 0)} {t("videoDetails.engagementActions")}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate600 dark:text-slate200">{formatCompactNumber(moment.likesCount || 0)} {t("videoDetails.sentLikes")} · {formatCompactNumber(moment.commentsCount || 0)} {t("videoDetails.comments")}</p>
                          </div>
                        )) : <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-slate600 dark:bg-[#171717] dark:text-slate200">{t("videoDetails.noPeakMoments")}</div>}
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              {isCreator && isLive ? (
                <section className="hidden md:block rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-black dark:text-white">{t("videoDetails.activeAudience")}</h2>
                      <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("videoDetails.activeAudienceBody")}</p>
                    </div>
                    <span className="text-sm text-slate500 dark:text-slate200">{activeAudienceCount}</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {activeAudienceCount ? activeAudience.map((member) => (
                      <article key={member.actor?.id || member.sessionId} className="rounded-3xl bg-[#F7F7F7] px-4 py-3 dark:bg-[#1F1F1F]">
                        <div className="flex gap-3">
                          <img src={getProfileAvatar(member.actor)} alt={getProfileName(member.actor, t("videoDetails.guestAudience"))} className="h-10 w-10 rounded-full object-cover" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-black dark:text-white">{getProfileName(member.actor, t("videoDetails.guestAudience"))}</p>
                              {member.actor?.username ? <span className="text-xs text-slate500 dark:text-slate200">@{member.actor.username}</span> : null}
                            </div>
                            <p className="mt-1 text-sm text-slate700 dark:text-slate200">{t("videoDetails.activeAudienceSeen", { time: formatRelativeTime(member.lastSeenAt || member.joinedAt) })}</p>
                          </div>
                          {member.actor?.id ? (
                            <button
                              type="button"
                              disabled={isAudienceActionDisabled(member.actor.id)}
                              onClick={() => handleAudienceAction(member.actor)}
                              className={`self-start rounded-full px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${isApprovedCohost(member.actor.id) ? "bg-white300 text-black dark:bg-black100 dark:text-white" : "bg-orange100 text-black"}`}
                            >
                              {getAudienceActionLabel(member.actor.id)}
                            </button>
                          ) : null}
                        </div>
                      </article>
                    )) : <div className="rounded-3xl bg-[#F7F7F7] px-4 py-8 text-center text-sm text-slate600 dark:bg-[#1F1F1F] dark:text-slate200">{t("videoDetails.noActiveAudience")}</div>}
                  </div>
                </section>
              ) : null}

              <section className="hidden md:block rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
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
                            {getLiveEngagementLabel(item, t)}
                          </p>
                          {getLiveEngagementMeta(item, t) ? <p className="mt-2 text-xs text-slate500 dark:text-slate200">{getLiveEngagementMeta(item, t)}</p> : null}
                          {item.body ? <p className="mt-2 text-sm leading-relaxed text-slate700 dark:text-slate200">{item.body}</p> : null}
                          {isCreator && isLive && item.actor?.id && item.actor.id !== creatorId ? (
                            <button
                              type="button"
                              disabled={isAudienceActionDisabled(item.actor.id)}
                              onClick={() => handleAudienceAction(item.actor)}
                              className={`mt-3 rounded-full px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${isApprovedCohost(item.actor.id) ? "bg-white300 text-black dark:bg-black100 dark:text-white" : "bg-orange100 text-black"}`}
                            >
                              {getAudienceActionLabel(item.actor.id)}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  )) : <div className="rounded-3xl bg-[#F7F7F7] px-4 py-8 text-center text-sm text-slate600 dark:bg-[#1F1F1F] dark:text-slate200">{t("videoDetails.noLiveEngagement")}</div>}
                </div>
              </section>

              <section className="max-h-[75vh] hidden md:block overflow-hidden rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
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
                          {isCreator && isLive && comment.user?.id && comment.user.id !== creatorId ? (
                            <button
                              type="button"
                              disabled={isAudienceActionDisabled(comment.user.id)}
                              onClick={() => handleAudienceAction(comment.user)}
                              className={`mt-3 rounded-full px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${isApprovedCohost(comment.user.id) ? "bg-white300 text-black dark:bg-black100 dark:text-white" : "bg-orange100 text-black"}`}
                            >
                              {getAudienceActionLabel(comment.user.id)}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  )) : <div className="rounded-3xl bg-[#F7F7F7] px-6 py-10 text-center text-sm text-slate600 dark:bg-[#1F1F1F] dark:text-slate200">{t("videoDetails.noComments")}</div>}
                </div>
              </section>

              {!isLive ? (
                <section className="hidden md:block rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
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