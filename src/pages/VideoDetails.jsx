import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { FaRegBookmark, FaRegFlag, FaRegThumbsDown, FaRegThumbsUp } from "react-icons/fa";
import { HiArrowLeft, HiShare } from "react-icons/hi";
import { LuArrowRightFromLine } from "react-icons/lu";
import { FaArrowLeftLong } from "react-icons/fa6";
import MentionText from "../components/MentionText";
import { useLanguage } from "../context/LanguageContext";
import { api, DIRECT_UPLOAD_LARGE_FILE_THRESHOLD, firstError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { clearLiveCreationSession, getLiveCreationSession } from "../live/liveSessionStore";
import {
  buildShareUrl,
  buildVideoAnalyticsLink,
  buildVideoLink,
  formatCompactNumber,
  formatCountLabel,
  formatRelativeTime,
  formatSubscriberLabel,
  getVideoProcessingStatus,
  hasPostLiveAnalytics,
  getProfileAvatar,
  getProfileName,
  getVideoMediaUrl,
  isActiveLiveVideo,
  getVideoStreamUrl,
  getVideoThumbnail,
  getVideoTitle,
} from "../utils/content";
import { loadHls } from "../utils/loadHls";
import { normalizeMentionHandle } from "../utils/mentions";

function stopMediaStream(stream) {
  stream?.getTracks?.().forEach((track) => track.stop());
}

const LIVE_SIGNAL_POLL_INTERVAL_MS = 1500;
const LIVE_PEER_CONFIGURATION = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
const LIVE_RECORDING_MIME_TYPES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

function clearLivePoll(ref) {
  if (ref.current) {
    window.clearInterval(ref.current);
    ref.current = null;
  }
}

function closePeerConnection(connection) {
  if (!connection) return;

  try {
    connection.onicecandidate = null;
    connection.ontrack = null;
    connection.onconnectionstatechange = null;
    connection.close?.();
  } catch {
    // Ignore cleanup errors.
  }
}

function serializeIceCandidate(candidate) {
  if (!candidate) return null;

  if (typeof candidate.toJSON === "function") {
    return candidate.toJSON();
  }

  return {
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid ?? null,
    sdpMLineIndex: candidate.sdpMLineIndex ?? null,
  };
}

function createLiveRecorder(stream) {
  if (typeof MediaRecorder === "undefined") return null;

  const supportedMimeType = LIVE_RECORDING_MIME_TYPES.find((mimeType) => (
    typeof MediaRecorder.isTypeSupported !== "function" || MediaRecorder.isTypeSupported(mimeType)
  ));

  return supportedMimeType
    ? new MediaRecorder(stream, { mimeType: supportedMimeType })
    : new MediaRecorder(stream);
}

function createRecordingUploadFile(blob, videoId) {
  const recordingType = blob?.type || "video/webm";
  const extension = recordingType.includes("mp4") ? "mp4" : "webm";
  const fileName = `live-${videoId || "recording"}-${Date.now()}.${extension}`;

  if (typeof File !== "undefined") {
    return new File([blob], fileName, {
      type: recordingType,
      lastModified: Date.now(),
    });
  }

  Object.defineProperty(blob, "name", {
    configurable: true,
    value: fileName,
  });

  return blob;
}

function requiresDirectUpload(file, type) {
  return type === "video" || (file?.size ?? 0) > DIRECT_UPLOAD_LARGE_FILE_THRESHOLD;
}

async function uploadSelectedFile(file, type, callbacks = {}) {
  const onProgress = callbacks?.onProgress;
  const onStatusChange = callbacks?.onStatusChange;
  const directUploadRequiredMessage = callbacks?.directUploadRequiredMessage;

  onStatusChange?.("preparing");

  const presignResponse = await api.presignUpload({
    type,
    originalName: file.name,
  });
  const uploadStrategy = presignResponse?.data || {};

  if (uploadStrategy.strategy === "client-direct-upload") {
    onStatusChange?.("uploading");

    const directUpload = await api.uploadFileDirect(file, uploadStrategy, {
      onProgress,
    });
    const secureUrl = directUpload?.secure_url;

    if (!secureUrl) {
      throw new Error("Upload provider did not return a file URL.");
    }

    onStatusChange?.("processing");

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

  if (requiresDirectUpload(file, type)) {
    throw new Error(directUploadRequiredMessage || "Large files and videos must upload directly.");
  }

  const uploadFormData = new FormData();
  uploadFormData.append("file", file);

  onStatusChange?.("uploading");

  const uploadResponse = await api.uploadFile(uploadFormData);

  return uploadResponse?.data?.upload || null;
}

function buildMentionResolver(profiles = []) {
  const knownProfiles = profiles.filter((profile) => profile?.id && profile?.username);

  return (handle) => {
    const normalizedHandle = normalizeMentionHandle(handle);
    const matchingProfile = knownProfiles.find((profile) => normalizeMentionHandle(profile.username) === normalizedHandle);
    return matchingProfile ? `/users/${matchingProfile.id}` : undefined;
  };
}

function ActionButton({ children, active, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-4 self-start  py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "bg-orange100 text-black"
          : "bg-white300 text-slate100 hover:bg-slate150 dark:bg-black100 dark:text-white dark:hover:bg-[#2A2A2A]"
      }`}
    >
      {children}
    </button>
  );
}

function RelatedVideoCard({ video, onOpen }) {
  const { t } = useLanguage();
  const processingStatus = getVideoProcessingStatus(video);
  const showProcessingBadge = processingStatus !== "completed";

  return (
    <button type="button" onClick={() => onOpen(video.id)} className="overflow-hidden rounded-3xl bg-white300 text-left dark:bg-black100">
      <div className="relative aspect-video overflow-hidden">
        <img src={getVideoThumbnail(video)} alt={getVideoTitle(video)} className="h-full w-full object-cover" />
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {isActiveLiveVideo(video) ? <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-semibold text-white">{t("content.liveBadge")}</span> : null}
          {showProcessingBadge ? <span className="rounded-full bg-amber-500 px-2 py-1 text-[10px] font-semibold text-black">{processingStatus === "failed" ? t("content.processingFailedBadge") : t("content.processingBadge")}</span> : null}
        </div>
      </div>
      <div className="space-y-1 px-4 py-4">
        <p className="line-clamp-2 text-sm font-medium text-black dark:text-white">{getVideoTitle(video)}</p>
        <p className="text-xs text-slate500 dark:text-slate200">{formatCountLabel(video.views || 0, t("content.views"))}</p>
      </div>
    </button>
  );
}

function CommentCard({
  comment,
  replyDraft,
  replies,
  repliesExpanded,
  replying,
  loadingReplies,
  onChangeReplyDraft,
  onSubmitReply,
  onToggleReplies,
  onToggleReaction,
  resolveMentionHref,
  compact = false,
}) {
  const { t } = useLanguage();

  return (
    <article className={compact ? "border-b border-black/10 pb-5 last:border-b-0 dark:border-white/10" : "rounded-3xl bg-white300 p-4 dark:bg-black100"}>
      <div className="flex gap-3">
        {comment.user?.id ? (
          <Link to={`/users/${comment.user.id}`} className="shrink-0 rounded-full transition-opacity hover:opacity-80">
            <img src={getProfileAvatar(comment.user)} alt={getProfileName(comment.user)} className="h-11 w-11 md:h-13 md:w-13 rounded-full object-cover" />
          </Link>
        ) : (
          <img src={getProfileAvatar(comment.user)} alt={getProfileName(comment.user)} className="h-11 w-11 md:h-13 md:w-13 rounded-full object-cover" />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 font-inter">
            {comment.user?.id ? (
              <Link to={`/users/${comment.user.id}`} className="text-sm font-medium text-black200  transition-opacity hover:opacity-80 dark:text-white">
                {getProfileName(comment.user)}
              </Link>
            ) : (
              <p className="text-sm font-medium text-black200 dark:text-white">{getProfileName(comment.user)}</p>
            )}
            <span className="text-sm text-black200 dark:text-slate200">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          <p className={`${compact ? "text-[15px] leading-7" : "text-sm leading-relaxed"} text-black200 dark:text-slate200`}>
            <MentionText text={comment.body || comment.text} resolveMentionHref={resolveMentionHref} />
          </p>

          <div className={`flex flex-wrap items-center ${compact ? "gap-4" : "gap-3"} text-xs text-slate500 dark:text-slate200`}>
            <button
              type="button"
              aria-label={comment.likes ? `${t("videoDetails.like")} (${formatCompactNumber(comment.likes)})` : t("videoDetails.like")}
              onClick={() => onToggleReaction(comment.id, "like")}
              className={`${comment.currentUserState?.liked ? "text-orange100" : ""} flex items-center gap-1`}
            >
              <FaRegThumbsUp  className={`w-4 h-4  ${comment.currentUserState?.liked ? "text-orange100" : " text-black200"}`}/> {comment.likes ? `(${formatCompactNumber(comment.likes)})` : ""}
            </button>
            <button
              type="button"
              aria-label={comment.dislikes ? `${t("videoDetails.dislike")} (${formatCompactNumber(comment.dislikes)})` : t("videoDetails.dislike")}
              onClick={() => onToggleReaction(comment.id, "dislike")}
              className={`${comment.currentUserState?.disliked ? "text-orange100" : ""} flex items-center gap-1`}
            >
              <FaRegThumbsDown  className={`w-4 h-4  ${comment.currentUserState?.disliked ? "text-orange100" : " text-black200"}`}/> {comment.dislikes ? `(${formatCompactNumber(comment.dislikes)})` : ""}
            </button>
            <button type="button" onClick={() => onToggleReplies(comment.id)} className="text-black200">
              {repliesExpanded
                ? t("videoDetails.hideReplies")
                : comment.repliesCount
                  ? t("videoDetails.replyCount", { count: comment.repliesCount })
                  : t("videoDetails.reply")}
            </button>
          </div>

          {repliesExpanded ? (
            <div className="space-y-3 rounded-2xl bg-white px-4 py-4 dark:bg-[#1D1D1D]">
              {loadingReplies ? <p className="text-xs text-slate500 dark:text-slate200">{t("videoDetails.loadingReplies")}</p> : null}
              {replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <img src={getProfileAvatar(reply.user)} alt={getProfileName(reply.user)} className="h-9 w-9 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-medium text-black dark:text-white">{getProfileName(reply.user)}</p>
                      <span className="text-[11px] text-black200 dark:text-slate200">{formatRelativeTime(reply.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-black200 dark:text-slate200">{reply.body || reply.text}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyDraft}
                  onChange={(event) => onChangeReplyDraft(comment.id, event.target.value)}
                  placeholder={t("videoDetails.writeReply")}
                  className="flex-1 rounded-full bg-[#F4F4F4] px-4 py-3 text-xs text-slate100 outline-none dark:bg-[#2B2B2B] dark:text-white"
                />
                <button
                  type="button"
                  disabled={replying || !replyDraft.trim()}
                  onClick={() => onSubmitReply(comment.id)}
                  className="rounded-full bg-orange100 px-4 py-3 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {replying ? t("videoDetails.sending") : t("videoDetails.reply")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function VideoDetails({ mode = "video" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const isLiveRoom = mode === "live";
  const viewRecordedRef = useRef(new Set());
  const recordedPlaybackRef = useRef(null);
  const livePreviewRef = useRef(null);
  const livePlaybackRef = useRef(null);
  const viewerPeerConnectionRef = useRef(null);
  const viewerSignalCursorRef = useRef(0);
  const viewerPollRef = useRef(null);
  const broadcasterSignalCursorRef = useRef(0);
  const broadcasterPollRef = useRef(null);
  const broadcasterConnectionsRef = useRef(new Map());
  const liveRecorderRef = useRef(null);
  const liveRecordingChunksRef = useRef([]);
  const liveRecordingStopPromiseRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [, setRelatedVideos] = useState([]);
  const [comments, setComments] = useState([]);
  const [repliesByComment, setRepliesByComment] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [commentBody, setCommentBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRepliesId, setLoadingRepliesId] = useState(null);
  const [busyAction, setBusyAction] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReplyId, setSubmittingReplyId] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [localLiveStream, setLocalLiveStream] = useState(null);
  const [remoteLiveStream, setRemoteLiveStream] = useState(null);
  const [livePreviewStatus, setLivePreviewStatus] = useState("idle");
  const [liveConnectionStatus, setLiveConnectionStatus] = useState("idle");
  const creatorId = video?.author?.id || video?.creator?.id;
  const isVideoCurrentlyLive = isActiveLiveVideo(video);
  const canSubscribeToAuthor = Boolean(creatorId) && user?.id !== creatorId;
  const canManageLive = isLiveRoom && Boolean(creatorId) && user?.id === creatorId && video?.type === "video";
  const processingStatus = getVideoProcessingStatus(video);
  const showProcessingBadge = processingStatus !== "completed";
  const videoThumbnailUrl = getVideoThumbnail(video);
  const videoMediaUrl = getVideoMediaUrl(video);
  const videoStreamUrl = getVideoStreamUrl(video);
  const shouldUseLocalLivePreview = Boolean(isLiveRoom && isVideoCurrentlyLive && canManageLive && video?.type === "video");
  const shouldReceiveRemoteLiveStream = Boolean(isLiveRoom && isVideoCurrentlyLive && !canManageLive && video?.type === "video" && isAuthenticated);
  const shouldBroadcastLiveStream = Boolean(isLiveRoom && isVideoCurrentlyLive && canManageLive && video?.type === "video" && localLiveStream && isAuthenticated);

  useEffect(() => {
    if (livePreviewRef.current) {
      livePreviewRef.current.srcObject = localLiveStream || null;
    }
  }, [localLiveStream]);

  useEffect(() => {
    if (livePlaybackRef.current) {
      livePlaybackRef.current.srcObject = remoteLiveStream || null;
    }
  }, [remoteLiveStream]);

  useEffect(() => {
    const playbackElement = recordedPlaybackRef.current;

    if (!playbackElement || video?.type !== "video" || isVideoCurrentlyLive) {
      return undefined;
    }

    const fallbackUrl = videoMediaUrl || "";
    const streamUrl = videoStreamUrl || "";
    let hls = null;
    let hasFallenBackToMp4 = false;
    let cancelled = false;

    const setPlaybackSource = (sourceUrl) => {
      if (!sourceUrl) {
        playbackElement.removeAttribute("src");
        return;
      }

      if (playbackElement.src !== sourceUrl) {
        playbackElement.src = sourceUrl;
      }
    };

    const fallbackToMp4 = () => {
      if (hasFallenBackToMp4 || !fallbackUrl) {
        return;
      }

      hasFallenBackToMp4 = true;
      hls?.destroy();
      hls = null;
      setPlaybackSource(fallbackUrl);
    };

    async function initializePlayback() {
      playbackElement.removeAttribute("src");

      if (!streamUrl) {
        setPlaybackSource(fallbackUrl);
        return;
      }

      if (typeof playbackElement.canPlayType === "function" && playbackElement.canPlayType("application/vnd.apple.mpegurl")) {
        setPlaybackSource(streamUrl);
        return;
      }

      try {
        const Hls = await loadHls();

        if (cancelled) return;

        if (!Hls?.isSupported?.()) {
          setPlaybackSource(fallbackUrl);
          return;
        }

        hls = new Hls();
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data?.fatal) {
            fallbackToMp4();
          }
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(playbackElement);
      } catch {
        if (!cancelled) {
          setPlaybackSource(fallbackUrl);
        }
      }
    }

    initializePlayback();

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [isVideoCurrentlyLive, video?.id, video?.type, videoMediaUrl, videoStreamUrl]);

  useEffect(() => () => {
    stopMediaStream(localLiveStream);
  }, [localLiveStream]);

  useEffect(() => () => {
    clearLiveCreationSession(id);
  }, [id]);

  useEffect(() => {
    let ignore = false;

    if (!shouldUseLocalLivePreview) {
      setLocalLiveStream((current) => {
        stopMediaStream(current);
        return null;
      });
      setLivePreviewStatus("idle");
      return;
    }

    const liveCreationSession = getLiveCreationSession(video?.id);

    if (liveCreationSession?.stream) {
      setLocalLiveStream((current) => current || liveCreationSession.stream);
      setLivePreviewStatus("ready");
      return undefined;
    }

    if (localLiveStream) {
      setLivePreviewStatus("ready");
      return undefined;
    }

    async function connectCamera() {
      if (!navigator?.mediaDevices?.getUserMedia) {
        if (!ignore) setLivePreviewStatus("error");
        return;
      }

      if (!ignore) setLivePreviewStatus("requesting");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        if (ignore) {
          stopMediaStream(stream);
          return;
        }

        setLocalLiveStream((current) => {
          stopMediaStream(current);
          return stream;
        });
        setLivePreviewStatus("ready");
      } catch {
        if (!ignore) {
          setLocalLiveStream((current) => {
            stopMediaStream(current);
            return null;
          });
          setLivePreviewStatus("error");
        }
      }
    }

    connectCamera();

    return () => {
      ignore = true;
    };
  }, [localLiveStream, shouldUseLocalLivePreview, t, video?.id]);

  useEffect(() => {
    if (!shouldBroadcastLiveStream || liveRecorderRef.current) {
      return undefined;
    }

    let recorder;

    try {
      recorder = createLiveRecorder(localLiveStream);
    } catch {
      return undefined;
    }

    if (!recorder) {
      return undefined;
    }

    liveRecordingChunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event?.data?.size) {
        liveRecordingChunksRef.current.push(event.data);
      }
    };

    recorder.start(1000);
    liveRecorderRef.current = recorder;

    return () => {
      if (liveRecorderRef.current === recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {
          // Ignore recorder cleanup failures.
        }
      }
    };
  }, [localLiveStream, shouldBroadcastLiveStream]);

  async function finalizeLiveRecording() {
    const recorder = liveRecorderRef.current;

    if (!recorder) return null;
    if (liveRecordingStopPromiseRef.current) return liveRecordingStopPromiseRef.current;

    liveRecordingStopPromiseRef.current = new Promise((resolve) => {
      let settled = false;

      const finish = () => {
        if (settled) return;
        settled = true;
        const recordedChunks = [...liveRecordingChunksRef.current];

        liveRecordingChunksRef.current = [];
        liveRecorderRef.current = null;
        liveRecordingStopPromiseRef.current = null;

        resolve(recordedChunks.length
          ? new Blob(recordedChunks, { type: recorder.mimeType || "video/webm" })
          : null);
      };

      if (recorder.state === "inactive") {
        finish();
        return;
      }

      recorder.addEventListener("stop", finish, { once: true });
      recorder.addEventListener("error", finish, { once: true });

      try {
        recorder.requestData?.();
      } catch {
        // Ignore requestData failures and stop normally.
      }

      try {
        recorder.stop();
      } catch {
        finish();
      }
    });

    return liveRecordingStopPromiseRef.current;
  }

  async function uploadLiveRecording(recordingBlob, videoId) {
    if (!recordingBlob || !videoId) return null;

    const recordingFile = createRecordingUploadFile(recordingBlob, videoId);
    const upload = await uploadSelectedFile(recordingFile, "video", {
      directUploadRequiredMessage: t("upload.errors.directUploadRequired"),
    });

    if (!upload?.id) {
      throw new Error(t("upload.errors.unableToComplete"));
    }

    const response = await api.updateVideo(videoId, {
      uploadId: upload.id,
      isDraft: true,
      isLive: false,
    });

    return response?.data?.video || null;
  }

  useEffect(() => {
    let ignore = false;
    clearLivePoll(viewerPollRef);
    viewerSignalCursorRef.current = 0;
    setRemoteLiveStream(null);
    closePeerConnection(viewerPeerConnectionRef.current);
    viewerPeerConnectionRef.current = null;

    if (!shouldReceiveRemoteLiveStream || !video?.id) {
      setLiveConnectionStatus("idle");
      return undefined;
    }

    if (typeof RTCPeerConnection === "undefined") {
      setLiveConnectionStatus("error");
      return undefined;
    }

    const peerConnection = new RTCPeerConnection(LIVE_PEER_CONFIGURATION);
    const pendingCandidates = [];
    const fallbackRemoteStream = typeof MediaStream === "undefined" ? null : new MediaStream();

    viewerPeerConnectionRef.current = peerConnection;
    setLiveConnectionStatus("connecting");

    if (typeof peerConnection.addTransceiver === "function") {
      try {
        peerConnection.addTransceiver("video", { direction: "recvonly" });
      } catch {
        // Ignore unsupported transceiver directions.
      }

      try {
        peerConnection.addTransceiver("audio", { direction: "recvonly" });
      } catch {
        // Ignore unsupported transceiver directions.
      }
    }

    peerConnection.ontrack = (event) => {
      if (ignore) return;

      const nextStream = event.streams?.[0];

      if (nextStream) {
        setRemoteLiveStream(nextStream);
        setLiveConnectionStatus("ready");
        return;
      }

      if (fallbackRemoteStream && event.track) {
        fallbackRemoteStream.addTrack(event.track);
        setRemoteLiveStream(fallbackRemoteStream);
        setLiveConnectionStatus("ready");
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (!event.candidate) return;

      api.sendLiveSignal(video.id, {
        type: "candidate",
        candidate: serializeIceCandidate(event.candidate),
      }).catch(() => {});
    };

    peerConnection.onconnectionstatechange = () => {
      if (ignore) return;

      if (peerConnection.connectionState === "connected") {
        setLiveConnectionStatus("ready");
      } else if (["failed", "disconnected"].includes(peerConnection.connectionState)) {
        setLiveConnectionStatus("error");
      }
    };

    async function flushPendingCandidates() {
      while (pendingCandidates.length) {
        const candidate = pendingCandidates.shift();

        try {
          await peerConnection.addIceCandidate(candidate);
        } catch {
          // Ignore individual ICE candidate failures.
        }
      }
    }

    async function pollSignals() {
      try {
        const response = await api.getLiveSignals(video.id, { after: viewerSignalCursorRef.current });
        if (ignore) return;

        const signals = response?.data?.signals || [];
        viewerSignalCursorRef.current = response?.data?.latestSignalId ?? viewerSignalCursorRef.current;

        for (const signal of signals) {
          if (signal.type === "answer" && signal.payload?.sdp) {
            await peerConnection.setRemoteDescription({
              type: "answer",
              sdp: signal.payload.sdp,
            });
            await flushPendingCandidates();
          }

          if (signal.type === "candidate" && signal.payload?.candidate) {
            if (peerConnection.remoteDescription?.type) {
              await peerConnection.addIceCandidate(signal.payload.candidate);
            } else {
              pendingCandidates.push(signal.payload.candidate);
            }
          }
        }
      } catch {
        if (!ignore) setLiveConnectionStatus("error");
      }
    }

    async function connectToLive() {
      try {
        const offer = await peerConnection.createOffer();
        if (ignore) return;

        await peerConnection.setLocalDescription(offer);
        await api.sendLiveSignal(video.id, {
          type: "offer",
          sdp: offer?.sdp || peerConnection.localDescription?.sdp || "",
        });
        if (ignore) return;

        await pollSignals();
        if (ignore) return;

        viewerPollRef.current = window.setInterval(pollSignals, LIVE_SIGNAL_POLL_INTERVAL_MS);
      } catch {
        if (!ignore) setLiveConnectionStatus("error");
      }
    }

    connectToLive();

    return () => {
      ignore = true;
      clearLivePoll(viewerPollRef);
      viewerSignalCursorRef.current = 0;
      setRemoteLiveStream(null);
      closePeerConnection(peerConnection);

      if (viewerPeerConnectionRef.current === peerConnection) {
        viewerPeerConnectionRef.current = null;
      }
    };
  }, [shouldReceiveRemoteLiveStream, video?.id]);

  useEffect(() => {
    let ignore = false;

    function closeBroadcasterConnections() {
      broadcasterConnectionsRef.current.forEach((entry) => closePeerConnection(entry.peerConnection));
      broadcasterConnectionsRef.current.clear();
    }

    clearLivePoll(broadcasterPollRef);
    broadcasterSignalCursorRef.current = 0;
    closeBroadcasterConnections();

    if (!shouldBroadcastLiveStream || !video?.id) {
      return undefined;
    }

    if (typeof RTCPeerConnection === "undefined") {
      return undefined;
    }

    function createBroadcasterConnection(recipientId) {
      const peerConnection = new RTCPeerConnection(LIVE_PEER_CONFIGURATION);
      const entry = { peerConnection, pendingCandidates: [] };

      broadcasterConnectionsRef.current.set(recipientId, entry);

      localLiveStream.getTracks().forEach((track) => {
        try {
          peerConnection.addTrack(track, localLiveStream);
        } catch {
          // Ignore duplicate track attachment failures.
        }
      });

      peerConnection.onicecandidate = (event) => {
        if (!event.candidate) return;

        api.sendLiveSignal(video.id, {
          recipientId,
          type: "candidate",
          candidate: serializeIceCandidate(event.candidate),
        }).catch(() => {});
      };

      peerConnection.onconnectionstatechange = () => {
        if (["closed", "failed", "disconnected"].includes(peerConnection.connectionState)) {
          closePeerConnection(peerConnection);
          broadcasterConnectionsRef.current.delete(recipientId);
        }
      };

      return entry;
    }

    function getOrCreateBroadcasterConnection(recipientId) {
      return broadcasterConnectionsRef.current.get(recipientId) || createBroadcasterConnection(recipientId);
    }

    async function flushPendingCandidates(entry) {
      while (entry.pendingCandidates.length) {
        const candidate = entry.pendingCandidates.shift();

        try {
          await entry.peerConnection.addIceCandidate(candidate);
        } catch {
          // Ignore individual ICE candidate failures.
        }
      }
    }

    async function handleBroadcasterSignal(signal) {
      const senderId = signal.senderId;
      if (!senderId) return;

      if (signal.type === "offer" && signal.payload?.sdp) {
        const existing = broadcasterConnectionsRef.current.get(senderId);

        if (existing?.peerConnection.remoteDescription?.type || existing?.peerConnection.localDescription?.type) {
          closePeerConnection(existing.peerConnection);
          broadcasterConnectionsRef.current.delete(senderId);
        }

        const entry = getOrCreateBroadcasterConnection(senderId);
        await entry.peerConnection.setRemoteDescription({
          type: "offer",
          sdp: signal.payload.sdp,
        });

        const answer = await entry.peerConnection.createAnswer();
        await entry.peerConnection.setLocalDescription(answer);
        await api.sendLiveSignal(video.id, {
          recipientId: senderId,
          type: "answer",
          sdp: answer?.sdp || entry.peerConnection.localDescription?.sdp || "",
        });
        await flushPendingCandidates(entry);
      }

      if (signal.type === "candidate" && signal.payload?.candidate) {
        const entry = getOrCreateBroadcasterConnection(senderId);

        if (entry.peerConnection.remoteDescription?.type) {
          await entry.peerConnection.addIceCandidate(signal.payload.candidate);
        } else {
          entry.pendingCandidates.push(signal.payload.candidate);
        }
      }
    }

    async function pollSignals() {
      try {
        const response = await api.getLiveSignals(video.id, { after: broadcasterSignalCursorRef.current });
        if (ignore) return;

        const signals = response?.data?.signals || [];
        broadcasterSignalCursorRef.current = response?.data?.latestSignalId ?? broadcasterSignalCursorRef.current;

        for (const signal of signals) {
          await handleBroadcasterSignal(signal);
        }
      } catch {
        // Ignore polling errors and retry on the next poll.
      }
    }

    pollSignals();
    broadcasterPollRef.current = window.setInterval(pollSignals, LIVE_SIGNAL_POLL_INTERVAL_MS);

    return () => {
      ignore = true;
      clearLivePoll(broadcasterPollRef);
      broadcasterSignalCursorRef.current = 0;
      closeBroadcasterConnections();
    };
  }, [localLiveStream, shouldBroadcastLiveStream, video?.id]);

  useEffect(() => {
    let ignore = false;

    async function loadVideoDetails() {
      setLoading(true);
      setError("");

      try {
        const [videoResponse, relatedResponse, commentsResponse] = await Promise.all([
          api.getVideo(id),
          isLiveRoom ? Promise.resolve({ data: { videos: [] } }) : api.getRelatedVideos(id),
          api.getVideoComments(id),
        ]);

        if (ignore) return;

        setVideo(videoResponse?.data?.video || null);
        setRelatedVideos(relatedResponse?.data?.videos || []);
        setComments(commentsResponse?.data?.comments || []);
        setRepliesByComment({});
        setExpandedReplies({});

        if (!viewRecordedRef.current.has(id)) {
          viewRecordedRef.current.add(id);
          api.recordView(id).then((response) => {
            if (!ignore && response?.data?.video) setVideo(response.data.video);
          }).catch(() => {});
        }
      } catch (nextError) {
        if (!ignore) setError(firstError(nextError.errors, nextError.message || t("videoDetails.unableToLoad")));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadVideoDetails();

    return () => {
      ignore = true;
    };
  }, [id, isLiveRoom, t]);

  function requireAuth() {
    if (isAuthenticated) return true;
    navigate("/login");
    return false;
  }

  function mergeCommentUpdate(updatedComment) {
    if (!updatedComment) return;

    if (updatedComment.parentId) {
      setRepliesByComment((current) => ({
        ...current,
        [updatedComment.parentId]: (current[updatedComment.parentId] || []).map((reply) =>
          reply.id === updatedComment.id ? updatedComment : reply,
        ),
      }));
      return;
    }

    setComments((current) => current.map((comment) => (comment.id === updatedComment.id ? updatedComment : comment)));
  }

  async function handleVideoAction(action) {
    if (!video || !requireAuth()) return;

    const currentState = video.currentUserState || {};
    const actionKey = `${action}-${video.id}`;
    setBusyAction(actionKey);
    setError("");
    setFeedback("");

    try {
      let response;

      switch (action) {
        case "like":
          response = currentState.liked ? await api.unlikeVideo(video.id) : await api.likeVideo(video.id);
          break;
        case "dislike":
          response = currentState.disliked ? await api.undislikeVideo(video.id) : await api.dislikeVideo(video.id);
          break;
        case "save":
          response = currentState.saved ? await api.unsaveVideo(video.id) : await api.saveVideo(video.id);
          break;
        default:
          response = null;
      }

      if (response?.data?.video) setVideo(response.data.video);
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("videoDetails.unableToUpdateInteraction")));
    } finally {
      setBusyAction("");
    }
  }

  async function handleSubscribe() {
    if (!creatorId || user?.id === creatorId || !requireAuth()) return;

    setBusyAction(`subscribe-${creatorId}`);
    setError("");

    try {
      const response = video.currentUserState?.subscribed
        ? await api.unsubscribeFromCreator(creatorId)
        : await api.subscribeToCreator(creatorId);
      const creator = response?.data?.creator;

      setVideo((current) => current ? {
        ...current,
        author: { ...current.author, subscriberCount: creator?.subscriberCount ?? current.author?.subscriberCount },
        creator: { ...current.creator, subscriberCount: creator?.subscriberCount ?? current.creator?.subscriberCount },
        currentUserState: {
          ...current.currentUserState,
          subscribed: creator?.subscribed ?? current.currentUserState?.subscribed,
        },
      } : current);
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("videoDetails.unableToUpdateSubscription")));
    } finally {
      setBusyAction("");
    }
  }

  async function handleLiveToggle() {
    if (!video || !canManageLive || !requireAuth()) return;

    const wasLive = isActiveLiveVideo(video);
    const actionKey = `${wasLive ? "stop" : "start"}-live-${video.id}`;
    setBusyAction(actionKey);
    setError("");
    setFeedback("");

    try {
      if (wasLive) {
        const recordingBlobPromise = finalizeLiveRecording();
        const response = await api.stopVideoLive(video.id);
        const stoppedVideo = response?.data?.video || null;

        if (stoppedVideo) {
          setVideo(stoppedVideo);
        }

        const recordingBlob = await recordingBlobPromise;
        let updatedDraft = stoppedVideo;

        setLocalLiveStream((current) => {
          stopMediaStream(current);
          return null;
        });
        clearLiveCreationSession(video.id);

        if (recordingBlob) {
          updatedDraft = await uploadLiveRecording(recordingBlob, video.id);

          if (updatedDraft) {
            setVideo(updatedDraft);
          }
        }

        setFeedback(t("videoDetails.liveStopped"));
        navigate(`/create?id=${updatedDraft?.id || video.id}`, { replace: true });
        return;
      }

      const response = await api.startVideoLive(video.id);

      if (response?.data?.video) setVideo(response.data.video);
      setFeedback(t("videoDetails.liveStarted"));
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("videoDetails.unableToUpdateLive")));
    } finally {
      setBusyAction("");
    }
  }

  async function handleShare() {
    if (!video) return;

    setBusyAction(`share-${video.id}`);
    setError("");

    try {
      const response = await api.shareVideo(video.id);
      const shareUrl = buildShareUrl(video, isLiveRoom);

      try {
        await navigator.clipboard.writeText(shareUrl);
        setFeedback(t("videoDetails.shareCopied"));
      } catch {
        setFeedback(t("videoDetails.shareFallback", { url: shareUrl }));
      }

      setVideo((current) => current ? { ...current, shares: response?.data?.shares ?? current.shares } : current);
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("videoDetails.unableToShare")));
    } finally {
      setBusyAction("");
    }
  }

  async function handleReport() {
    if (!video || !requireAuth()) return;

    const reason = window.prompt(t("videoDetails.reportPrompt"), t("videoDetails.reportDefaultReason"));
    if (reason === null) return;

    setBusyAction(`report-${video.id}`);
    setError("");

    try {
      await api.reportVideo(video.id, { reason: reason.trim() || undefined });
      setFeedback(t("videoDetails.reportSubmitted"));
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("videoDetails.unableToReport")));
    } finally {
      setBusyAction("");
    }
  }

  async function handleSubmitComment() {
    if (!video || !commentBody.trim() || !requireAuth()) return;

    setSubmittingComment(true);
    setError("");

    try {
      const response = await api.postComment(video.id, commentBody.trim());
      const nextComment = response?.data?.comment;

      if (nextComment) {
        setComments((current) => [nextComment, ...current]);
        setCommentBody("");
        setVideo((current) => current ? { ...current, commentsCount: (current.commentsCount || 0) + 1 } : current);
      }
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("videoDetails.unableToPostComment")));
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleToggleReplies(commentId) {
    if (expandedReplies[commentId]) {
      setExpandedReplies((current) => ({ ...current, [commentId]: false }));
      return;
    }

    if (repliesByComment[commentId]) {
      setExpandedReplies((current) => ({ ...current, [commentId]: true }));
      return;
    }

    setLoadingRepliesId(commentId);

    try {
      const response = await api.getCommentReplies(commentId);
      setRepliesByComment((current) => ({ ...current, [commentId]: response?.data?.replies || [] }));
      setExpandedReplies((current) => ({ ...current, [commentId]: true }));
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("videoDetails.unableToLoadReplies")));
    } finally {
      setLoadingRepliesId(null);
    }
  }

  async function handleSubmitReply(commentId) {
    const replyBody = replyDrafts[commentId]?.trim();
    if (!replyBody || !requireAuth()) return;

    setSubmittingReplyId(commentId);
    setError("");

    try {
      const response = await api.replyToComment(commentId, replyBody);
      const nextReply = response?.data?.reply;

      if (nextReply) {
        setRepliesByComment((current) => ({ ...current, [commentId]: [nextReply, ...(current[commentId] || [])] }));
        setExpandedReplies((current) => ({ ...current, [commentId]: true }));
        setReplyDrafts((current) => ({ ...current, [commentId]: "" }));
        setComments((current) => current.map((comment) => (
          comment.id === commentId ? { ...comment, repliesCount: (comment.repliesCount || 0) + 1 } : comment
        )));
      }
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("videoDetails.unableToReply")));
    } finally {
      setSubmittingReplyId(null);
    }
  }

  async function handleCommentReaction(commentId, action) {
    if (!requireAuth()) return;

    setBusyAction(`${action}-comment-${commentId}`);
    setError("");

    const targetComment = comments.find((comment) => comment.id === commentId)
      || Object.values(repliesByComment).flat().find((reply) => reply.id === commentId);

    try {
      let response;

      switch (action) {
        case "like":
          response = targetComment?.currentUserState?.liked
            ? await api.unlikeComment(commentId)
            : await api.likeComment(commentId);
          break;
        case "dislike":
          response = targetComment?.currentUserState?.disliked
            ? await api.undislikeComment(commentId)
            : await api.dislikeComment(commentId);
          break;
        default:
          response = null;
      }

      mergeCommentUpdate(response?.data?.comment);
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("videoDetails.unableToUpdateCommentInteraction")));
    } finally {
      setBusyAction("");
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-slate100 dark:bg-[#121212] dark:text-white">{t("videoDetails.loadingVideo")}</div>;
  }

  if (!video) {
    return <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-sm text-slate600 dark:bg-[#121212] dark:text-slate200">{t("videoDetails.videoNotFound")}</div>;
  }

  if (isLiveRoom && (video.type !== "video" || (!isVideoCurrentlyLive && !canManageLive))) {
    return <Navigate to={buildVideoLink(video, { isLive: false })} replace />;
  }

  if (!isLiveRoom && isVideoCurrentlyLive) {
    return <Navigate to={buildVideoLink(video, { isLive: true })} replace />;
  }

  const creatorProfile = video.author || video.creator;
  const resolveMentionHref = buildMentionResolver([
    creatorProfile,
    user,
    ...comments.map((comment) => comment?.user),
    ...Object.values(repliesByComment).flat().map((reply) => reply?.user),
  ]);
  const canViewAnalytics = !isVideoCurrentlyLive && creatorId === user?.id && hasPostLiveAnalytics(video);
  const isLiveWatchLayout = Boolean(isLiveRoom && isVideoCurrentlyLive);
  const showRemoteLivePlayer = Boolean(shouldReceiveRemoteLiveStream && remoteLiveStream);
  const livePlaceholderMessage = shouldUseLocalLivePreview && livePreviewStatus === "requesting"
    ? t("videoDetails.loadingLivePreview")
    : shouldUseLocalLivePreview && livePreviewStatus === "error"
      ? t("videoDetails.livePreviewUnavailable")
      : shouldReceiveRemoteLiveStream && liveConnectionStatus === "connecting"
        ? t("videoDetails.connectingLiveStream")
        : shouldReceiveRemoteLiveStream && liveConnectionStatus === "error"
          ? t("videoDetails.liveStreamUnavailable")
          : t("videoDetails.livePlaceholderBody");

  const creatorControls = (
    <>
      {canManageLive ? (
        <button
          type="button"
          disabled={busyAction === `${isVideoCurrentlyLive ? "stop" : "start"}-live-${video.id}`}
          onClick={handleLiveToggle}
          className="rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busyAction === `${isVideoCurrentlyLive ? "stop" : "start"}-live-${video.id}`
            ? t(isVideoCurrentlyLive ? "videoDetails.stoppingLive" : "videoDetails.startingLive")
            : t(isVideoCurrentlyLive ? "videoDetails.stopLive" : "videoDetails.startLive")}
        </button>
      ) : null}
      {canSubscribeToAuthor ? (
        <button
          type="button"
          disabled={busyAction === `subscribe-${creatorId}`}
          onClick={handleSubscribe}
          className="rounded-full bg-orange100 px-6 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {video.currentUserState?.subscribed ? t("videoDetails.subscribed") : t("profile.subscribe")}
        </button>
      ) : null}
      {canViewAnalytics ? (
        <Link
          to={buildVideoAnalyticsLink(video)}
          className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-80 dark:border-white/10 dark:text-white"
        >
          {t("videoDetails.viewAnalytics")}
        </Link>
      ) : null}
    </>
  );

  const actionButtons = (
    <>
      <ActionButton active={video.currentUserState?.liked} disabled={busyAction === `like-${video.id}`} onClick={() => handleVideoAction("like")}>
        <div className="inline-flex items-center gap-2"><FaRegThumbsUp /> <span className="hidden md:inline">{formatCompactNumber(video.likes || 0)}</span></div>
      </ActionButton>
      <ActionButton active={video.currentUserState?.disliked} disabled={busyAction === `dislike-${video.id}`} onClick={() => handleVideoAction("dislike")}>
        <div className="inline-flex items-center gap-2"><FaRegThumbsDown /> <span className="hidden md:inline">{formatCompactNumber(video.dislikes || 0)}</span></div>
      </ActionButton>
      <ActionButton active={video.currentUserState?.saved} disabled={busyAction === `save-${video.id}`} onClick={() => handleVideoAction("save")}>
        <div className="inline-flex items-center gap-2"><FaRegBookmark /> <span className="hidden md:inline">{t("videoDetails.save")}</span> </div>
      </ActionButton>
      <ActionButton disabled={busyAction === `share-${video.id}`} onClick={handleShare}>
        <div className="inline-flex items-center gap-2"><HiShare /> <span className="hidden md:inline">{t("videoDetails.share")}</span> </div>
      </ActionButton>
      <ActionButton disabled={busyAction === `report-${video.id}`} onClick={handleReport}>
        <div className="inline-flex items-center gap-2"><FaRegFlag /> <span className="hidden md:inline">{t("videoDetails.report")}</span></div>
      </ActionButton>
    </>
  );

  const creatorIdentity = creatorId ? (
    <Link to={`/users/${creatorId}`} className="flex items-center gap-4 rounded-2xl transition-opacity hover:opacity-80">
      <img src={getProfileAvatar(creatorProfile)} alt={getProfileName(creatorProfile)} className="h-16 w-16 rounded-full object-cover" />
      <div className="min-w-0">
        <p className="truncate text-lg font-medium text-black dark:text-white">{getProfileName(creatorProfile)}</p>
        <p className="text-sm text-slate500 dark:text-slate200">{formatSubscriberLabel(creatorProfile?.subscriberCount || 0, t("content.subscribers"))}</p>
      </div>
    </Link>
  ) : (
    <div className="flex items-center gap-4">
      <img src={getProfileAvatar(creatorProfile)} alt={getProfileName(creatorProfile)} className="h-16 w-16 rounded-full object-cover" />
      <div className="min-w-0">
        <p className="truncate text-lg font-medium text-black dark:text-white">{getProfileName(creatorProfile)}</p>
        <p className="text-sm text-slate500 dark:text-slate200">{formatSubscriberLabel(creatorProfile?.subscriberCount || 0, t("content.subscribers"))}</p>
      </div>
    </div>
  );

  const creatorBio = creatorProfile?.bio?.trim() || t("profile.emptyBio");
  const videoDescription = video.description || video.caption || t("videoDetails.noDescription");
  const hasTopStatusPills = showProcessingBadge || isVideoCurrentlyLive;
  const recordedCreatorIdentity = creatorId ? (
    <Link to={`/users/${creatorId}`} className="flex items-center gap-3 rounded-2xl transition-opacity hover:opacity-80">
      <img src={getProfileAvatar(creatorProfile)} alt={getProfileName(creatorProfile)} className="h-14 w-14 rounded-full object-cover md:block hidden" />
      <p className="text-lg font-medium text-white md:text-black dark:text-white">{getProfileName(creatorProfile)}</p>
    </Link>
  ) : (
    <div className="flex items-center gap-3">
      <img src={getProfileAvatar(creatorProfile)} alt={getProfileName(creatorProfile)} className="h-14 w-14 rounded-full object-cover hidden md:block" />
      <p className="text-lg font-medium text-white md:text-black dark:text-white">{getProfileName(creatorProfile)}</p>
    </div>
  );

  const commentsSection = isLiveWatchLayout ? (
    <section className="flex max-h-[75vh] flex-col gap-4 overflow-hidden rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-black dark:text-white">{t("videoDetails.comments")}</h2>
        <span className="text-sm text-slate500 dark:text-slate200">{video.commentsCount || comments.length}</span>
      </div>

      <div className="flex gap-3">
        <img src={getProfileAvatar(user)} alt={getProfileName(user, t("videoDetails.you"))} className="h-11 w-11 rounded-full object-cover" />
        <div className="flex-1 space-y-3">
          <textarea
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            rows={3}
            placeholder={t("videoDetails.commentPlaceholder")}
            className="w-full resize-none rounded-3xl bg-white300 px-4 py-3 text-sm text-slate100 outline-none dark:bg-black100 dark:text-white"
          />
          <button
            type="button"
            disabled={submittingComment || !commentBody.trim()}
            onClick={handleSubmitComment}
            className="rounded-full bg-orange100 px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submittingComment ? t("videoDetails.posting") : t("videoDetails.postComment")}
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {comments.length ? (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              replies={repliesByComment[comment.id] || []}
              repliesExpanded={Boolean(expandedReplies[comment.id])}
              loadingReplies={loadingRepliesId === comment.id}
              replying={submittingReplyId === comment.id}
              replyDraft={replyDrafts[comment.id] || ""}
              onChangeReplyDraft={(commentId, value) => setReplyDrafts((current) => ({ ...current, [commentId]: value }))}
              onSubmitReply={handleSubmitReply}
              onToggleReplies={handleToggleReplies}
              onToggleReaction={handleCommentReaction}
              resolveMentionHref={resolveMentionHref}
            />
          ))
        ) : (
          <div className="rounded-3xl bg-white300 px-6 py-10 text-center text-sm text-slate600 dark:bg-black100 dark:text-slate200">{t("videoDetails.noComments")}</div>
        )}
      </div>
    </section>
  ) : (
    <section className="flex min-h-144 flex-col pt-2 lg:max-h-[calc(100vh-3rem)]">
      <div className="flex items-center  gap-10 border-y border-black200 py-4 dark:border-white/10">
        <LuArrowRightFromLine className="w-6 h-6 text-black200"/><div className="flex items-center gap-3">
          <span className=" text-black200 font-semibold font-inter text-lg dark:text-slate200">{video.commentsCount || comments.length}</span>
          <h2 className="text-xl font-inter text-black200 dark:text-white">{t("videoDetails.comments")}</h2>
        
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-5 pr-1">
        <div className="space-y-5">
          {comments.length ? (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                replies={repliesByComment[comment.id] || []}
                repliesExpanded={Boolean(expandedReplies[comment.id])}
                loadingReplies={loadingRepliesId === comment.id}
                replying={submittingReplyId === comment.id}
                replyDraft={replyDrafts[comment.id] || ""}
                onChangeReplyDraft={(commentId, value) => setReplyDrafts((current) => ({ ...current, [commentId]: value }))}
                onSubmitReply={handleSubmitReply}
                onToggleReplies={handleToggleReplies}
                onToggleReaction={handleCommentReaction}
                resolveMentionHref={resolveMentionHref}
                compact
              />
            ))
          ) : (
            <div className="rounded-3xl bg-[#F7F7F7] px-6 py-10 text-center text-sm text-slate600 dark:bg-[#171717] dark:text-slate200">{t("videoDetails.noComments")}</div>
          )}
        </div>
      </div>

      <div className="border-t border-black/10 py-4 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-3">
          <img src={getProfileAvatar(user)} alt={getProfileName(user, t("videoDetails.you"))} className="h-9 w-9 rounded-full object-cover" />
          <div className="min-w-0 flex-1 rounded-full bg-[#F7F7F7] px-4 py-3 dark:bg-[#171717]">
            <textarea
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
              rows={1}
              placeholder={t("videoDetails.commentPlaceholder")}
              className="h-6 max-h-24 w-full resize-none bg-transparent text-sm text-slate100 outline-none placeholder:text-slate500 dark:text-white dark:placeholder:text-slate200"
            />
          </div>
          <button
            type="button"
            disabled={submittingComment || !commentBody.trim()}
            onClick={handleSubmitComment}
            className="rounded-full bg-orange100 px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submittingComment ? t("videoDetails.posting") : t("videoDetails.postComment")}
          </button>
        </div>
      </div>
    </section>
  );

  return (
    
    <div className={`min-h-screen px-4 py-5 md:px-8 md:py-8 ${isLiveWatchLayout ? "bg-gray-50 dark:bg-[#121212]" : "bg-white dark:bg-[#121212]"}`}>
      {!isLiveWatchLayout && <button onClick={()=> navigate(-1)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-black shadow-sm mb-4 dark:bg-black100 dark:text-white"><FaArrowLeftLong /> Back</button>}
      <div className="mx-auto max-w-350 space-y-4">
        {isLiveWatchLayout || hasTopStatusPills ? (
          <div className={`flex items-center gap-4 ${isLiveWatchLayout ? "justify-between" : "justify-end"}`}>
            {isLiveWatchLayout ? (
              <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-black shadow-sm dark:bg-[#1D1D1D] dark:text-white">
                <HiArrowLeft className="h-5 w-5" /> {t("videoDetails.back")}
              </button>
            ) : null}
            <div className="flex flex-wrap items-center justify-end gap-2">
              {showProcessingBadge ? <span className="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold tracking-wide text-black">{processingStatus === "failed" ? t("content.processingFailedBadge") : t("content.processingBadge")}</span> : null}
              {isVideoCurrentlyLive ? <span className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold tracking-wide text-white">{t("videoDetails.liveNow")}</span> : null}
            </div>
          </div>
        ) : null}

        {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {feedback ? <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</div> : null}

        <div className={` gap-8 ${isLiveWatchLayout ? "grid xl:grid-cols-[minmax(0,1.2fr),400px]" : "flex flex-col lg:flex-row"}`}>
          <div className="space-y-6 md:flex-1">
            <section className={isLiveWatchLayout ? "overflow-hidden rounded-4xl bg-white shadow-sm dark:bg-[#171717]" : "space-y-5"}>
              <div className={`relative aspect-video bg-black ${isLiveWatchLayout ? "" : "w-full h-screen md:h-screen md:w-xs md:mx-auto md:overflow-hidden md:rounded-4xl"}`}>
                {video.type === "video" ? (
                  shouldUseLocalLivePreview && localLiveStream ? (
                    <video
                      ref={livePreviewRef}
                      aria-label={t("videoDetails.liveCameraPreview")}
                      className="h-full w-full object-cover"
                      autoPlay
                      muted
                      playsInline
                    />
                  ) : showRemoteLivePlayer ? (
                    <video
                      ref={livePlaybackRef}
                      aria-label={t("videoDetails.liveStreamPlayback")}
                      className="h-full w-full object-cover"
                      autoPlay
                      playsInline
                      controls
                    />
                  ) : isVideoCurrentlyLive && (shouldUseLocalLivePreview || shouldReceiveRemoteLiveStream || !videoMediaUrl) ? (
                    <div className="flex h-full items-center justify-center px-6 text-center text-white">
                      <div className="max-w-lg">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-300">{t("videoDetails.liveNow")}</p>
                        <h2 className="mt-4 text-2xl font-semibold">{t("videoDetails.livePlaceholderTitle")}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-slate-300">{livePlaceholderMessage}</p>
                      </div>
                    </div>
                  ) : (videoStreamUrl || videoMediaUrl) ? (
                    <video ref={recordedPlaybackRef} poster={videoThumbnailUrl} controls playsInline className="h-full w-full object-cover" />
                  ) : (
                    <img src={videoThumbnailUrl} alt={getVideoTitle(video)} className="h-full w-full object-fill" />
                  )
                ) : (
                  <img src={videoMediaUrl || videoThumbnailUrl} alt={getVideoTitle(video)} className="h-full w-full object-fill" />
                )}
              </div>

              <div className={isLiveWatchLayout ? "space-y-5 px-5 py-5 md:px-6 md:py-6" : "space-y-5"}>
                {isLiveWatchLayout ? (
                  <>
                    <div className="flex flex-col gap-4">
                      <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-black dark:text-white">{getVideoTitle(video)}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate500 dark:text-slate200">
                          <span>{formatCountLabel(video.views || 0, t("content.views"))}</span>
                          <span>{formatRelativeTime(video.createdAt)}</span>
                          {video.category?.label ? <span>{video.category.label}</span> : null}
                          {video.location ? <span>{video.location}</span> : null}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="hidden  flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-4">
                        <h1 className="text-2xl font-semibold text-black dark:text-white md:text-[2.15rem]">{getVideoTitle(video)}</h1>
                        {recordedCreatorIdentity}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate500 dark:text-slate200">
                          <span>{formatCountLabel(video.views || 0, t("content.views"))}</span>
                          <span>{formatRelativeTime(video.createdAt)}</span>
                          {video.category?.label ? <span>{video.category.label}</span> : null}
                          {video.location ? <span>{video.location}</span> : null}
                        </div>
                      </div>
                      {canSubscribeToAuthor || canManageLive || canViewAnalytics ? <div className="shrink-0">{creatorControls}</div> : null}
                    </div>

                    <div className="absolute bottom-0 right-6 md:right-3/7 md:translate-x-1/2 flex flex-col gap-3">
                      {actionButtons}
                    </div>

                    <span className="text-white absolute bottom-5 left-5 md:hidden">{recordedCreatorIdentity}</span>

                    <p className="absolute bottom-1 left-5 md:hidden text-sm leading-relaxed text-white md:text-slate700 dark:text-slate200">
                      <MentionText text={videoDescription} resolveMentionHref={resolveMentionHref} />
                    </p>
                  </>
                )}
              </div>
            </section>

            {!isLiveWatchLayout ? (
              <section className="hidden  space-y-4">
                <h2 className="text-[1.75rem] font-semibold text-black dark:text-white">{t("videoDetails.aboutCreator")}</h2>
                <div className="rounded-4xl bg-[#F7F7F7] px-6 py-6 dark:bg-[#171717] md:px-8 md:py-7">
                  <p className="text-base font-medium text-black dark:text-white">{formatSubscriberLabel(creatorProfile?.subscriberCount || 0, t("content.subscribers"))}</p>
                  <p className="mt-4 text-sm leading-8 text-slate700 dark:text-slate200">{creatorBio}</p>
                </div>
              </section>
            ) : null}
          </div>

          <aside className={isLiveWatchLayout ? "flex flex-col gap-4 self-start xl:sticky xl:top-6" : "hidden md:flex flex-col gap-4 self-start w-full lg:w-80 lg:sticky lg:top-6 "}>
            {isLiveWatchLayout ? (
              <section className="space-y-5 rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {creatorIdentity}
                  <div className="flex flex-wrap gap-3">{creatorControls}</div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {actionButtons}
                </div>

                <p className="text-sm leading-relaxed text-slate700 dark:text-slate200">
                  <MentionText text={videoDescription} resolveMentionHref={resolveMentionHref} />
                </p>
              </section>
            ) : null}

            {commentsSection}
          </aside>
        </div>
      </div>
    </div>
  );
}