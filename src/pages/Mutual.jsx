import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Comment from "../components/Mutual/Comment";
import Video from "../components/Mutual/Video";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import { buildShareUrl, getProfileAvatar, getVideoRouteId } from "../utils/content";

function Mutual() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [hasMutuals, setHasMutuals] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [repliesByComment, setRepliesByComment] = useState({});
  const [isCommentVisible, setIsCommentVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.getMutualsFeed()
      .then((response) => {
        if (cancelled) return;
        setVideos(response?.data?.videos ?? []);
        setHasMutuals(Boolean(response?.data?.hasMutuals));
        setLoaded(true);
      })
      .catch(() => { if (!cancelled) { setVideos([]); setHasMutuals(false); setLoaded(true); } });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const current = videos[currentIndex] || null;
  const currentId = current ? getVideoRouteId(current) : null;

  useEffect(() => {
    if (!currentId) { setComments([]); setRepliesByComment({}); return; }
    let cancelled = false;
    setRepliesByComment({});
    api.getVideoComments(currentId)
      .then((response) => { if (!cancelled) setComments(response?.data?.comments ?? response?.data ?? []); })
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

  const handleOpenComments = useCallback(() => setIsCommentVisible(true), []);
  const handleHideComment = useCallback(() => setIsCommentVisible(false), []);
  const handlePrev = useCallback(() => setCurrentIndex((i) => Math.max(0, i - 1)), []);
  const handleNext = useCallback(() => setCurrentIndex((i) => Math.min(videos.length - 1, i + 1)), [videos.length]);

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
    } catch { patchComment(commentId, target); }
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
    } catch { patchComment(commentId, target); }
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
        setRepliesByComment((prev) => ({ ...prev, [commentId]: [created, ...(prev[commentId] || [])] }));
        patchComment(commentId, { repliesCount: (comments.find((c) => c.id === commentId)?.repliesCount || 0) + 1 });
      }
    } catch { /* ignored */ }
  }, [comments, patchComment, requireAuth]);

  const currentUserAvatar = useMemo(() => (user ? getProfileAvatar(user) : undefined), [user]);

  if (loaded && (!hasMutuals || videos.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 md:p-8 min-h-[60vh] text-center">
        <h2 className="text-2xl font-inter font-semibold text-black dark:text-white">
          {t("mutuals.emptyTitle")}
        </h2>
        <p className="text-base font-inter text-black dark:text-white max-w-md">
          {t("mutuals.emptyBody")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-10 px-4 md:p-8">
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
      {isCommentVisible && (
        <Comment
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
        />
      )}
    </div>
  );
}

export default Mutual;