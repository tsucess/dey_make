import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Comment from "../components/Homepage/Comment";
import Video from "../components/Homepage/Video";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { buildShareUrl, getProfileAvatar, getVideoRouteId } from "../utils/content";

function HomePageNew() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [isCommentVisible, setIsCommentVisible] = useState(false)

  useEffect(() => {
    let cancelled = false;
    api.getHome()
      .then((response) => {
        if (cancelled) return;
        const trending = response?.data?.trending ?? [];
        const live = response?.data?.liveStreams ?? [];
        const feed = [...live, ...trending];
        setVideos(feed);
      })
      .catch(() => setVideos([]));
    return () => { cancelled = true; };
  }, []);

  const current = videos[currentIndex] || null;
  const currentId = current ? getVideoRouteId(current) : null;

  useEffect(() => {
    if (!currentId) { setComments([]); return; }
    let cancelled = false;
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

  // const handleOpenComments = useCallback(() => {
  //   if (currentId) navigate(`/video/${currentId}#comments`);
  // }, [currentId, navigate]);

  const handleOpenComments = ()=>{
    setIsCommentVisible(true)
  }
  const handleHideComment = () => {
    setIsCommentVisible(false)
  }
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

  const currentUserAvatar = useMemo(() => (user ? getProfileAvatar(user) : undefined), [user]);

  return (
    <div className="flex gap-10 md:p-8">
        <Video
          video={current}
          canPrev={currentIndex > 0}
          canNext={currentIndex < videos.length - 1}
          onPrev={handlePrev}
          onNext={handleNext}
          onToggleLike={handleToggleLike}
          onOpenComments={handleOpenComments}
          onShare={handleShare}
        />
        {isCommentVisible && <Comment
          comments={comments}
          commentsCount={current?.commentsCount ?? 0}
          currentUserAvatar={currentUserAvatar}
          onPost={handlePostComment}
          onClose={handleHideComment}
        />}
    </div>
  );
}

export default HomePageNew;