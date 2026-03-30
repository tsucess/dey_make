import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaRegBookmark, FaRegFlag, FaRegThumbsDown, FaRegThumbsUp } from "react-icons/fa";
import { HiArrowLeft, HiShare } from "react-icons/hi";
import { useLanguage } from "../context/LanguageContext";
import { api, firstError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  buildShareUrl,
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
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const viewRecordedRef = useRef(new Set());
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
  const creatorId = video?.author?.id || video?.creator?.id;
  const canSubscribeToAuthor = Boolean(creatorId) && user?.id !== creatorId;
  const canManageLive = Boolean(creatorId) && user?.id === creatorId && video?.type === "video";
  const processingStatus = getVideoProcessingStatus(video);
  const showProcessingBadge = processingStatus !== "completed";

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
      const response = await {
        like: currentState.liked ? api.unlikeVideo(video.id) : api.likeVideo(video.id),
        dislike: currentState.disliked ? api.undislikeVideo(video.id) : api.dislikeVideo(video.id),
        save: currentState.saved ? api.unsaveVideo(video.id) : api.saveVideo(video.id),
      }[action];

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
      const shareUrl = buildShareUrl(video.id);

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
      const response = await {
        like: targetComment?.currentUserState?.liked ? api.unlikeComment(commentId) : api.likeComment(commentId),
        dislike: targetComment?.currentUserState?.disliked ? api.undislikeComment(commentId) : api.dislikeComment(commentId),
      }[action];

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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),360px]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm dark:bg-[#171717]">
              <div className="relative aspect-video bg-black">
                {video.type === "video" ? (
                  <video src={video.mediaUrl} poster={video.thumbnailUrl || getVideoThumbnail(video)} controls className="h-full w-full object-cover" />
                ) : (
                  <img src={video.mediaUrl || getVideoThumbnail(video)} alt={getVideoTitle(video)} className="h-full w-full object-cover" />
                )}
              </div>

              <div className="space-y-5 px-5 py-5 md:px-6 md:py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-black dark:text-white">{getVideoTitle(video)}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate500 dark:text-slate200">
                      <span>{formatCountLabel(video.views || 0, t("content.views"))}</span>
                      <span>{formatRelativeTime(video.createdAt)}</span>
                      {video.category?.label ? <span>{video.category.label}</span> : null}
                      {video.location ? <span>{video.location}</span> : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
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
                        {video.currentUserState?.subscribed ? t("profile.unsubscribe") : t("profile.subscribe")}
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
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
                </div>

                <div className="rounded-3xl bg-gray-50 p-5 dark:bg-[#101010]">
                  {creatorId ? (
                    <Link to={`/users/${creatorId}`} className="flex items-center gap-4 rounded-2xl transition-opacity hover:opacity-80">
                      <img src={getProfileAvatar(video.author || video.creator)} alt={getProfileName(video.author || video.creator)} className="h-16 w-16 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-lg font-medium text-black dark:text-white">{getProfileName(video.author || video.creator)}</p>
                        <p className="text-sm text-slate500 dark:text-slate200">{formatSubscriberLabel(video.author?.subscriberCount || video.creator?.subscriberCount || 0, t("content.subscribers"))}</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4">
                      <img src={getProfileAvatar(video.author || video.creator)} alt={getProfileName(video.author || video.creator)} className="h-16 w-16 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-lg font-medium text-black dark:text-white">{getProfileName(video.author || video.creator)}</p>
                        <p className="text-sm text-slate500 dark:text-slate200">{formatSubscriberLabel(video.author?.subscriberCount || video.creator?.subscriberCount || 0, t("content.subscribers"))}</p>
                      </div>
                    </div>
                  )}
                  <p className="mt-4 text-sm leading-relaxed text-slate700 dark:text-slate200">{video.description || video.caption || t("videoDetails.noDescription")}</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-black dark:text-white">{t("videoDetails.moreVideos")}</h2>
                <p className="text-sm text-slate500 dark:text-slate200">{t("videoDetails.relatedCount", { count: relatedVideos.length })}</p>
              </div>
              {relatedVideos.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {relatedVideos.map((relatedVideo) => (
                    <RelatedVideoCard key={relatedVideo.id} video={relatedVideo} onOpen={(videoId) => navigate(`/video/${videoId}`)} />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl bg-white300 px-6 py-10 text-center text-sm text-slate600 dark:bg-black100 dark:text-slate200">{t("videoDetails.noRelatedVideos")}</div>
              )}
            </section>
          </div>

          <aside className="flex flex-col gap-4 rounded-[2rem] bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
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

            <div className="space-y-4">
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
          </aside>
        </div>
      </div>
    </div>
  );
}