import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import Comment from "../components/Homepage/Comment";
import Video from "../components/Homepage/Video";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { buildShareUrl, getProfileAvatar, getVideoRouteId } from "../utils/content";

function VideoDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [repliesByComment, setRepliesByComment] = useState({});
  const [isCommentVisible, setIsCommentVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getVideo(id), api.getRelatedVideos(id).catch(() => ({ data: { videos: [] } }))])
      .then(([videoResponse, relatedResponse]) => {
        if (cancelled) return;
        const primary = videoResponse?.data?.video || null;
        const related = relatedResponse?.data?.videos ?? [];
        const feed = primary
          ? [primary, ...related.filter((video) => getVideoRouteId(video) !== getVideoRouteId(primary))]
          : related;
        setVideos(feed);
        setCurrentIndex(0);
      })
      .catch(() => setVideos([]));
    return () => { cancelled = true; };
  }, [id]);

  const current = videos[currentIndex] || null;
  const currentId = current ? getVideoRouteId(current) : null;

  useEffect(() => {
    if (!currentId) { setComments([]); setRepliesByComment({}); return; }
    let cancelled = false;
    setRepliesByComment({});
    api.getVideoComments(currentId)
      .then((response) => {
        if (cancelled) return;
        setComments(response?.data?.comments ?? response?.data ?? []);
      })
      .catch(() => setComments([]));
    if (isAuthenticated) { api.recordView(currentId).catch(() => {}); }
    return () => { cancelled = true; };
  }, [currentId, isAuthenticated]);

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) { navigate("/login"); return false; }
    return true;
  }, [isAuthenticated, navigate]);

  const patchCurrent = useCallback((patch) => {
    setVideos((prev) => prev.map((video, index) => (index === currentIndex ? { ...video, ...patch } : video)));
  }, [currentIndex]);

  const handleToggleLike = useCallback(async () => {
    if (!current || !requireAuth()) return;
    const liked = current.currentUserState?.liked;
    const prev = current;
    patchCurrent({
      likes: (current.likes || 0) + (liked ? -1 : 1),
      currentUserState: { ...(current.currentUserState || {}), liked: !liked, disliked: false },
    });
    try {
      const response = liked ? await api.unlikeVideo(currentId) : await api.likeVideo(currentId);
      if (response?.data?.video) patchCurrent(response.data.video);
    } catch { patchCurrent(prev); }
  }, [current, currentId, patchCurrent, requireAuth]);

  const handleToggleRepost = useCallback(async () => {
    if (!current || !requireAuth()) return;
    const isOwner = Boolean(current.isOwner || current.currentUserState?.isOwner);
    if (isOwner) return;
    const reposted = current.currentUserState?.reposted;
    const prev = current;
    patchCurrent({
      reposts: Math.max(0, (current.reposts || 0) + (reposted ? -1 : 1)),
      currentUserState: { ...(current.currentUserState || {}), reposted: !reposted },
    });
    try {
      const response = reposted ? await api.unrepostVideo(currentId) : await api.repostVideo(currentId);
      if (response?.data?.video) patchCurrent(response.data.video);
    } catch { patchCurrent(prev); }
  }, [current, currentId, patchCurrent, requireAuth]);

  const handleShare = useCallback(async () => {
    if (!current) return;
    const shareUrl = buildShareUrl(current);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: current.title || "", url: shareUrl });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch { /* ignored */ }
    if (isAuthenticated) { try { await api.shareVideo(currentId); patchCurrent({ shares: (current.shares || 0) + 1 }); } catch { /* ignored */ } }
  }, [current, currentId, isAuthenticated, patchCurrent]);

  const handleOpenComments = () => { setIsCommentVisible(true); };
  const handleHideComment = () => { setIsCommentVisible(false); };
  const handlePrev = useCallback(() => setCurrentIndex((index) => Math.max(0, index - 1)), []);
  const handleNext = useCallback(() => setCurrentIndex((index) => Math.min(videos.length - 1, index + 1)), [videos.length]);

  const handlePostComment = useCallback(async (body) => {
    if (!currentId || !requireAuth()) return;
    try {
      const response = await api.postComment(currentId, body);
      const created = response?.data?.comment ?? response?.data;
      if (created) setComments((prev) => [created, ...prev]);
      patchCurrent({ commentsCount: (current?.commentsCount || 0) + 1 });
    } catch { /* ignored */ }
  }, [current, currentId, patchCurrent, requireAuth]);

  const patchComment = useCallback((commentId, patch) => {
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, ...patch } : c)));
  }, []);

  const handleToggleCommentLike = useCallback(async (commentId, liked) => {
    if (!requireAuth()) return;
    const target = comments.find((c) => c.id === commentId);
    if (!target) return;
    const prevState = target.currentUserState || {};
    const wasDisliked = Boolean(prevState.disliked);
    patchComment(commentId, {
      likes: (target.likes || 0) + (liked ? -1 : 1),
      dislikes: Math.max(0, (target.dislikes || 0) - (wasDisliked && !liked ? 1 : 0)),
      currentUserState: { ...prevState, liked: !liked, disliked: liked ? prevState.disliked : false },
    });
    try {
      const response = liked ? await api.unlikeComment(commentId) : await api.likeComment(commentId);
      const updated = response?.data?.comment;
      if (updated) patchComment(commentId, updated);
    } catch {
      patchComment(commentId, target);
    }
  }, [comments, patchComment, requireAuth]);

  const handleToggleCommentDislike = useCallback(async (commentId, disliked) => {
    if (!requireAuth()) return;
    const target = comments.find((c) => c.id === commentId);
    if (!target) return;
    const prevState = target.currentUserState || {};
    const wasLiked = Boolean(prevState.liked);
    patchComment(commentId, {
      dislikes: (target.dislikes || 0) + (disliked ? -1 : 1),
      likes: Math.max(0, (target.likes || 0) - (wasLiked && !disliked ? 1 : 0)),
      currentUserState: { ...prevState, disliked: !disliked, liked: disliked ? prevState.liked : false },
    });
    try {
      const response = disliked ? await api.undislikeComment(commentId) : await api.dislikeComment(commentId);
      const updated = response?.data?.comment;
      if (updated) patchComment(commentId, updated);
    } catch {
      patchComment(commentId, target);
    }
  }, [comments, patchComment, requireAuth]);

  const handleLoadReplies = useCallback(async (commentId) => {
    if (repliesByComment[commentId]) return;
    try {
      const response = await api.getCommentReplies(commentId);
      const replies = response?.data?.replies ?? response?.data ?? [];
      setRepliesByComment((prev) => ({ ...prev, [commentId]: replies }));
    } catch { /* ignored */ }
  }, [repliesByComment]);

  const handlePostReply = useCallback(async (commentId, body) => {
    if (!requireAuth()) return;
    try {
      const response = await api.replyToComment(commentId, body);
      const created = response?.data?.reply ?? response?.data?.comment ?? response?.data;
      if (created) {
        setRepliesByComment((prev) => ({
          ...prev,
          [commentId]: [created, ...(prev[commentId] || [])],
        }));
        patchComment(commentId, {
          repliesCount: (comments.find((c) => c.id === commentId)?.repliesCount || 0) + 1,
        });
      }
    } catch { /* ignored */ }
  }, [comments, patchComment, requireAuth]);

  const currentUserAvatar = useMemo(() => (user ? getProfileAvatar(user) : undefined), [user]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate100">
      <div className="flex gap-10 md:p-8">
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="fixed md:absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70"
          >
            <HiArrowLeft className="h-5 w-5" />
          </button>
          <Video
            video={current}
            canPrev={currentIndex > 0}
            canNext={currentIndex < videos.length - 1}
            onPrev={handlePrev}
            onNext={handleNext}
            onToggleLike={handleToggleLike}
            onOpenComments={handleOpenComments}
            onShare={handleShare}
            onToggleRepost={handleToggleRepost}
            isOwner={Boolean(current?.isOwner || current?.currentUserState?.isOwner)}
          />
        </div>
        {isCommentVisible && <Comment
          comments={comments}
          commentsCount={current?.commentsCount ?? 0}
          currentUserAvatar={currentUserAvatar}
          onPost={handlePostComment}
          onClose={handleHideComment}
          onToggleLike={handleToggleCommentLike}
          onToggleDislike={handleToggleCommentDislike}
          onLoadReplies={handleLoadReplies}
          onPostReply={handlePostReply}
          repliesByComment={repliesByComment}
        />}
      </div>
    </div>
  );
}

export default VideoDetails;
