import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FaRegBookmark, FaRegFlag, FaRegThumbsDown, FaRegThumbsUp } from "react-icons/fa";
import { HiArrowLeft, HiShare } from "react-icons/hi";
import { useLanguage } from "../context/LanguageContext";
import { api, firstError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  buildShareUrl,
  buildVideoLink,
  formatCompactNumber,
  formatCountLabel,
  formatRelativeTime,
  formatSubscriberLabel,
  getVideoProcessingStatus,
  getProfileAvatar,
  getProfileName,
  getVideoThumbnail,
  getVideoTitle,
} from "../utils/content";

function stopMediaStream(stream) {
  stream?.getTracks?.().forEach((track) => track.stop());
}

const LIVE_SIGNAL_POLL_INTERVAL_MS = 1500;
const LIVE_PEER_CONFIGURATION = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

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

function ActionButton({ children, active, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
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
          {video.isLive ? <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-semibold text-white">{t("content.liveBadge")}</span> : null}
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
}) {
  const { t } = useLanguage();

  return (
    <article className="rounded-3xl bg-white300 p-4 dark:bg-black100">
      <div className="flex gap-3">
        <img src={getProfileAvatar(comment.user)} alt={getProfileName(comment.user)} className="h-11 w-11 rounded-full object-cover" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-black dark:text-white">{getProfileName(comment.user)}</p>
            <span className="text-xs text-slate500 dark:text-slate200">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          <p className="text-sm leading-relaxed text-slate700 dark:text-slate200">{comment.body || comment.text}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate500 dark:text-slate200">
            <button type="button" onClick={() => onToggleReaction(comment.id, "like")} className={comment.currentUserState?.liked ? "text-orange100" : ""}>
              {t("videoDetails.like")} {comment.likes ? `(${formatCompactNumber(comment.likes)})` : ""}
            </button>
            <button type="button" onClick={() => onToggleReaction(comment.id, "dislike")} className={comment.currentUserState?.disliked ? "text-orange100" : ""}>
              {t("videoDetails.dislike")} {comment.dislikes ? `(${formatCompactNumber(comment.dislikes)})` : ""}
            </button>
            <button type="button" onClick={() => onToggleReplies(comment.id)}>
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
                      <span className="text-[11px] text-slate500 dark:text-slate200">{formatRelativeTime(reply.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate700 dark:text-slate200">{reply.body || reply.text}</p>
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

export default function VideoDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const viewRecordedRef = useRef(new Set());
  const livePreviewRef = useRef(null);
  const livePlaybackRef = useRef(null);
  const viewerPeerConnectionRef = useRef(null);
  const viewerSignalCursorRef = useRef(0);
  const viewerPollRef = useRef(null);
  const broadcasterSignalCursorRef = useRef(0);
  const broadcasterPollRef = useRef(null);
  const broadcasterConnectionsRef = useRef(new Map());
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
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
  const canSubscribeToAuthor = Boolean(creatorId) && user?.id !== creatorId;
  const canManageLive = Boolean(creatorId) && user?.id === creatorId && video?.type === "video";
  const processingStatus = getVideoProcessingStatus(video);
  const showProcessingBadge = processingStatus !== "completed";
  const isLiveWatchRoute = location.pathname.startsWith("/live/");
  const shouldUseLocalLivePreview = Boolean(video?.isLive && canManageLive && video?.type === "video");
  const shouldReceiveRemoteLiveStream = Boolean(video?.isLive && isLiveWatchRoute && !canManageLive && video?.type === "video" && isAuthenticated);
  const shouldBroadcastLiveStream = Boolean(video?.isLive && canManageLive && video?.type === "video" && localLiveStream && isAuthenticated);

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

  useEffect(() => () => {
    stopMediaStream(localLiveStream);
  }, [localLiveStream]);

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
  }, [shouldUseLocalLivePreview]);

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

        if (existing) {
          closePeerConnection(existing.peerConnection);
          broadcasterConnectionsRef.current.delete(senderId);
        }

        const entry = createBroadcasterConnection(senderId);
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
        const entry = broadcasterConnectionsRef.current.get(senderId);
        if (!entry) return;

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
          api.getRelatedVideos(id),
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
  }, [id, t]);

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

    const wasLive = Boolean(video.isLive);
    const actionKey = `${wasLive ? "stop" : "start"}-live-${video.id}`;
    setBusyAction(actionKey);
    setError("");
    setFeedback("");

    try {
      const response = wasLive ? await api.stopVideoLive(video.id) : await api.startVideoLive(video.id);

      if (response?.data?.video) setVideo(response.data.video);
      setFeedback(t(wasLive ? "videoDetails.liveStopped" : "videoDetails.liveStarted"));
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
      const shareUrl = buildShareUrl(video, isLiveWatchRoute);

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

  const creatorProfile = video.author || video.creator;
  const isLiveWatchLayout = Boolean(video.isLive && isLiveWatchRoute);
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
          disabled={busyAction === `${video.isLive ? "stop" : "start"}-live-${video.id}`}
          onClick={handleLiveToggle}
          className="rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busyAction === `${video.isLive ? "stop" : "start"}-live-${video.id}`
            ? t(video.isLive ? "videoDetails.stoppingLive" : "videoDetails.startingLive")
            : t(video.isLive ? "videoDetails.stopLive" : "videoDetails.startLive")}
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
    </>
  );

  const actionButtons = (
    <>
      <ActionButton active={video.currentUserState?.liked} disabled={busyAction === `like-${video.id}`} onClick={() => handleVideoAction("like")}>
        <span className="inline-flex items-center gap-2"><FaRegThumbsUp /> {formatCompactNumber(video.likes || 0)}</span>
      </ActionButton>
      <ActionButton active={video.currentUserState?.disliked} disabled={busyAction === `dislike-${video.id}`} onClick={() => handleVideoAction("dislike")}>
        <span className="inline-flex items-center gap-2"><FaRegThumbsDown /> {formatCompactNumber(video.dislikes || 0)}</span>
      </ActionButton>
      <ActionButton active={video.currentUserState?.saved} disabled={busyAction === `save-${video.id}`} onClick={() => handleVideoAction("save")}>
        <span className="inline-flex items-center gap-2"><FaRegBookmark /> {t("videoDetails.save")}</span>
      </ActionButton>
      <ActionButton disabled={busyAction === `share-${video.id}`} onClick={handleShare}>
        <span className="inline-flex items-center gap-2"><HiShare /> {t("videoDetails.share")}</span>
      </ActionButton>
      <ActionButton disabled={busyAction === `report-${video.id}`} onClick={handleReport}>
        <span className="inline-flex items-center gap-2"><FaRegFlag /> {t("videoDetails.report")}</span>
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

  const commentsSection = (
    <section className={`flex flex-col gap-4 rounded-[2rem] bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6 ${isLiveWatchLayout ? "max-h-[75vh] overflow-hidden" : ""}`}>
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

      <div className={`${isLiveWatchLayout ? "flex-1 space-y-4 overflow-y-auto pr-1" : "space-y-4"}`}>
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
            />
          ))
        ) : (
          <div className="rounded-3xl bg-white300 px-6 py-10 text-center text-sm text-slate600 dark:bg-black100 dark:text-slate200">{t("videoDetails.noComments")}</div>
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 dark:bg-[#121212] md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-black shadow-sm dark:bg-[#1D1D1D] dark:text-white">
            <HiArrowLeft className="h-5 w-5" /> {t("videoDetails.back")}
          </button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {showProcessingBadge ? <span className="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold tracking-wide text-black">{processingStatus === "failed" ? t("content.processingFailedBadge") : t("content.processingBadge")}</span> : null}
            {video.isLive ? <span className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold tracking-wide text-white">{t("videoDetails.liveNow")}</span> : null}
          </div>
        </div>

        {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {feedback ? <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</div> : null}

        <div className={`grid gap-6 ${isLiveWatchLayout ? "xl:grid-cols-[minmax(0,1.2fr),400px]" : "xl:grid-cols-[minmax(0,1fr),360px]"}`}>
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm dark:bg-[#171717]">
              <div className="relative aspect-video bg-black">
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
                  ) : video.isLive && (shouldUseLocalLivePreview || shouldReceiveRemoteLiveStream || !video.mediaUrl) ? (
                    <div className="flex h-full items-center justify-center px-6 text-center text-white">
                      <div className="max-w-lg">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-300">{t("videoDetails.liveNow")}</p>
                        <h2 className="mt-4 text-2xl font-semibold">{t("videoDetails.livePlaceholderTitle")}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-slate-300">{livePlaceholderMessage}</p>
                      </div>
                    </div>
                  ) : video.mediaUrl ? (
                    <video src={video.mediaUrl} poster={video.thumbnailUrl || getVideoThumbnail(video)} controls className="h-full w-full object-cover" />
                  ) : (
                    <img src={video.thumbnailUrl || getVideoThumbnail(video)} alt={getVideoTitle(video)} className="h-full w-full object-cover" />
                  )
                ) : (
                  <img src={video.mediaUrl || getVideoThumbnail(video)} alt={getVideoTitle(video)} className="h-full w-full object-cover" />
                )}
              </div>

              <div className="space-y-5 px-5 py-5 md:px-6 md:py-6">
                <div className={`flex flex-col gap-4 ${isLiveWatchLayout ? "" : "lg:flex-row lg:items-start lg:justify-between"}`}>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-black dark:text-white">{getVideoTitle(video)}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate500 dark:text-slate200">
                      <span>{formatCountLabel(video.views || 0, t("content.views"))}</span>
                      <span>{formatRelativeTime(video.createdAt)}</span>
                      {video.category?.label ? <span>{video.category.label}</span> : null}
                      {video.location ? <span>{video.location}</span> : null}
                    </div>
                  </div>

                  {!isLiveWatchLayout ? <div className="flex flex-wrap gap-3">{creatorControls}</div> : null}
                </div>

                {!isLiveWatchLayout ? (
                  <>
                    <div className="flex flex-wrap gap-3">{actionButtons}</div>

                    <div className="rounded-3xl bg-gray-50 p-5 dark:bg-[#101010]">
                      {creatorIdentity}
                      <p className="mt-4 text-sm leading-relaxed text-slate700 dark:text-slate200">{video.description || video.caption || t("videoDetails.noDescription")}</p>
                    </div>
                  </>
                ) : null}
              </div>
            </section>

            {!isLiveWatchLayout ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-black dark:text-white">{t("videoDetails.moreVideos")}</h2>
                  <p className="text-sm text-slate500 dark:text-slate200">{t("videoDetails.relatedCount", { count: relatedVideos.length })}</p>
                </div>
                {relatedVideos.length ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {relatedVideos.map((relatedVideo) => (
                      <RelatedVideoCard key={relatedVideo.id} video={relatedVideo} onOpen={(nextVideo) => navigate(buildVideoLink(nextVideo))} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl bg-white300 px-6 py-10 text-center text-sm text-slate600 dark:bg-black100 dark:text-slate200">{t("videoDetails.noRelatedVideos")}</div>
                )}
              </section>
            ) : null}
          </div>

          <aside className={isLiveWatchLayout ? "flex flex-col gap-4 self-start xl:sticky xl:top-6" : ""}>
            {isLiveWatchLayout ? (
              <section className="space-y-5 rounded-[2rem] bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {creatorIdentity}
                  <div className="flex flex-wrap gap-3">{creatorControls}</div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {actionButtons}
                </div>

                <p className="text-sm leading-relaxed text-slate700 dark:text-slate200">{video.description || video.caption || t("videoDetails.noDescription")}</p>
              </section>
            ) : null}

            {commentsSection}
          </aside>
        </div>
      </div>
    </div>
  );
}