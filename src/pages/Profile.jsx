import { useEffect, useMemo, useRef, useState } from "react";
import { FaRegCommentDots, FaRegHeart, FaCheck, FaPlay } from "react-icons/fa";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { IoMdArrowDropright } from "react-icons/io";
import { FiBell, FiMoreHorizontal, FiShare, FiGrid, FiFilm, FiLock, FiHeart } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api, firstError } from "../services/api";
import Spinner from "../components/Layout/Spinner";
import {
  // buildVideoAnalyticsLink,
  buildVideoLink,
  formatCompactNumber,
  formatCountLabel,
  // formatSubscriberLabel,
  // hasPostLiveAnalytics,
  getProfileAvatar,
  getProfileName,
  getVideoMediaUrl,
  getVideoThumbnail,
  getVideoTitle,
} from "../utils/content";
import { CiSaveDown2 } from "react-icons/ci";
import { MdOutlineDrafts } from "react-icons/md";
import Toast from "../components/Layout/Toast";

const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/;

function getProfileTabs(t, isOwnProfile) {
  const tabs = [
    { label: "Posts", feed: "posts", icon: FiGrid },
  ];

  if (!isOwnProfile) return tabs;

  return [
    ...tabs,
    { label: "Liked", feed: "liked", icon: FiHeart },
    { label: "Saved", feed: "saved", icon: CiSaveDown2 },
    { label: "Drafts", feed: "drafts", icon: MdOutlineDrafts },
  ];
}

function ViewsBadge({ views }) {
  const { t } = useLanguage();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border-y-2 border-white bg-black/50 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-xs">
      <IoMdArrowDropright className="h-6 w-6 text-white" />
      <span className="font-inter text-sm text-white">{formatCountLabel(views, t("content.views"))}</span>
    </div>
  );
}

function FeedTile({ video, onOpen, showViews = true }) {
  return (
    <article
      onClick={() => onOpen(video)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#1a1a1a] aspect-[9/16]"
    >
      <img src={getVideoThumbnail(video)} alt={getVideoTitle(video)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      {showViews ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex items-end">
          <div className="flex items-center gap-1.5 text-white">
            <FaPlay className="w-3.5 h-3.5" />
            <span className="text-[13px] font-semibold">{formatCompactNumber(video.views || 0)}</span>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function Profile() {
  const { id: routeProfileId } = useParams();
  const navigate = useNavigate();
  const { user, syncUser } = useAuth();
  const { t } = useLanguage();
  const avatarInputRef = useRef(null);
  const isOwnProfile = !routeProfileId || String(user?.id) === String(routeProfileId);
  const profileTabs = useMemo(() => getProfileTabs(t, isOwnProfile), [isOwnProfile, t]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(() => {
    const allowed = ["posts", "liked", "saved", "drafts"];
    return allowed.includes(initialTabParam) ? initialTabParam : "posts";
  });
  const [profile, setProfile] = useState(null);
  const [feeds, setFeeds] = useState({ posts: [], liked: [], saved: [], drafts: [] });
  const [form, setForm] = useState({ fullName: "", username: "", bio: "", avatarUrl: "" });
  const [editing, setEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [draftPreview, setDraftPreview] = useState(null);
  const [draftAction, setDraftAction] = useState(null);
  const [draftError, setDraftError] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const activeConfig = useMemo(
    () => profileTabs.find((tab) => tab.feed === activeTab) || profileTabs[0],
    [activeTab, profileTabs],
  );
  const displayProfile = useMemo(
    () => (form.avatarUrl ? { ...(profile || {}), avatarUrl: form.avatarUrl } : profile),
    [form.avatarUrl, profile],
  );
  const avatarPreviewUrl = getProfileAvatar(displayProfile);
  const visiblePosts = feeds[activeConfig.feed] || [];

  useEffect(() => {
    if (!feedback) return undefined;

    const timeoutId = window.setTimeout(() => {
      setFeedback("");
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  useEffect(() => {
    if (editing) setIsAvatarPreviewOpen(false);
  }, [editing]);

  useEffect(() => {
    if (!profileTabs.some((tab) => tab.feed === activeTab)) {
      setActiveTab(profileTabs[0]?.feed || "posts");
    }
  }, [activeTab, profileTabs]);

  useEffect(() => {
    const currentParam = searchParams.get("tab");
    if (activeTab === "posts") {
      if (currentParam) {
        const next = new URLSearchParams(searchParams);
        next.delete("tab");
        setSearchParams(next, { replace: true });
      }
      return;
    }
    if (currentParam !== activeTab) {
      const next = new URLSearchParams(searchParams);
      next.set("tab", activeTab);
      setSearchParams(next, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      setLoadingProfile(true);
      setError("");

      try {
        const response = isOwnProfile ? await api.getProfile() : await api.getUser(routeProfileId);
        const nextProfile = response?.data?.profile || response?.data?.user;

        if (!ignore) {
          setEditing(false);
          setProfile(nextProfile);
          setForm({
            fullName: nextProfile?.fullName || "",
            username: nextProfile?.username || "",
            bio: nextProfile?.bio || "",
            avatarUrl: nextProfile?.avatarUrl || "",
          });
        }
      } catch (nextError) {
        if (!ignore) {
          setError(firstError(nextError.errors, nextError.message || t("profile.unableToLoad")));
        }
      } finally {
        if (!ignore) setLoadingProfile(false);
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [isOwnProfile, routeProfileId, t]);

  useEffect(() => {
    let ignore = false;

    async function loadFeed() {
      setLoadingFeed(true);

      try {
        const response = isOwnProfile
          ? await api.getProfileFeed(activeConfig.feed)
          : await api.getUserPosts(routeProfileId);

        if (!ignore) {
          setFeeds((current) => ({
            ...current,
            [activeConfig.feed]: response?.data?.videos || [],
          }));
        }
      } catch (nextError) {
        if (!ignore) {
          setError(firstError(nextError.errors, nextError.message || t("profile.unableToLoadFeed", { feed: activeConfig.label.toLowerCase() })));
        }
      } finally {
        if (!ignore) setLoadingFeed(false);
      }
    }

    loadFeed();

    return () => {
      ignore = true;
    };
  }, [activeConfig.feed, activeConfig.label, isOwnProfile, routeProfileId, t]);

  async function handleSaveProfile() {
    if (!isOwnProfile) return;

    const scrollToBanner = () => {
      if (typeof window === "undefined" || typeof window.scrollTo !== "function") return;
      try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch { /* jsdom / older browsers */ }
    };

    if (!form.fullName.trim()) {
      setError(t("profile.fullNameRequired"));
      scrollToBanner();
      return;
    }

    const normalizedUsername = form.username.trim().toLowerCase();

    if (!normalizedUsername) {
      setError(t("profile.usernameRequired"));
      scrollToBanner();
      return;
    }

    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      setError(t("profile.usernameInvalid"));
      scrollToBanner();
      return;
    }

    setSaving(true);
    setError("");
    setFeedback("");

    try {
      const response = await api.updateProfile({
        fullName: form.fullName.trim(),
        username: normalizedUsername,
        bio: form.bio.trim() || null,
        avatarUrl: form.avatarUrl.trim() || null,
      });
      const nextProfile = response?.data?.profile;

      setProfile(nextProfile);
      setForm({
        fullName: nextProfile?.fullName || "",
        username: nextProfile?.username || "",
        bio: nextProfile?.bio || "",
        avatarUrl: nextProfile?.avatarUrl || "",
      });
      syncUser?.(nextProfile);
      setEditing(false);
      setFeedback(t("profile.updated"));
      scrollToBanner();
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("profile.unableToUpdate")));
      scrollToBanner();
    } finally {
      setSaving(false);
    }
  }

  async function handleShareProfile() {
    const sharePath = profile?.id ? `/users/${profile.id}` : (isOwnProfile ? "/profile" : `/users/${routeProfileId}`);
    const shareUrl = `${window.location.origin}${sharePath}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setFeedback(t("profile.shareCopied"));
    } catch {
      setFeedback(t("profile.shareFallback", { url: shareUrl }));
    }
  }

  async function handleAvatarFileChange(event) {
    if (!isOwnProfile) return;

    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setUploadingAvatar(true);
    setError("");
    setFeedback("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);

      const uploadResponse = await api.uploadFile(uploadFormData);
      const uploadedAvatarUrl = uploadResponse?.data?.upload?.url;

      if (!uploadedAvatarUrl) {
        throw new Error(t("profile.unableToResolveUpload"));
      }

      setForm((current) => ({ ...current, avatarUrl: uploadedAvatarUrl }));

      if (editing) {
        setFeedback(t("profile.uploadSavedPending"));
        return;
      }

      const response = await api.updateProfile({ avatarUrl: uploadedAvatarUrl });
      const nextProfile = response?.data?.profile;

      setProfile(nextProfile);
      setForm((current) => ({
        ...current,
        fullName: nextProfile?.fullName || current.fullName,
        username: nextProfile?.username || current.username,
        bio: nextProfile?.bio || "",
        avatarUrl: nextProfile?.avatarUrl || uploadedAvatarUrl,
      }));
      syncUser?.(nextProfile);
      setFeedback(t("profile.pictureUpdated"));
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("profile.unableToUpload")));
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  }

  function handleAvatarClick() {
    if (editing && isOwnProfile) {
      avatarInputRef.current?.click();
      return;
    }

    setIsAvatarPreviewOpen(true);
  }

  function handleOpenFeedItem(nextVideo) {
    if (isOwnProfile && activeConfig.feed === "drafts") {
      setDraftPreview(nextVideo);
      setDraftAction(null);
      setDraftError("");
      return;
    }

    navigate(buildVideoLink(nextVideo));
  }

  function closeDraftPreview() {
    if (draftAction) return;
    setDraftPreview(null);
    setDraftError("");
  }

  async function handleDraftPublish() {
    if (!draftPreview?.id || draftAction) return;
    setDraftAction("publish");
    setDraftError("");

    try {
      const response = await api.publishVideo(draftPreview.id);
      const published = response?.data?.video ?? null;
      setFeeds((current) => ({
        ...current,
        drafts: (current.drafts || []).filter((item) => String(item.id) !== String(draftPreview.id)),
        posts: published ? [published, ...(current.posts || [])] : current.posts,
      }));
      setFeedback(response?.message || t("upload.actions.draftSaved"));
      setDraftPreview(null);
    } catch (nextError) {
      setDraftError(firstError(nextError?.errors, nextError?.message || t("profile.unableToUpdate")));
    } finally {
      setDraftAction(null);
    }
  }

  function handleDraftDelete() {
    if (!draftPreview?.id || draftAction) return;
    setDraftError("");
    setConfirmDeleteOpen(true);
  }

  async function confirmDraftDelete() {
    if (!draftPreview?.id || draftAction) return;
    const targetId = draftPreview.id;
    setDraftAction("delete");
    setDraftError("");

    try {
      const response = await api.deleteVideo(targetId);
      setFeeds((current) => ({
        ...current,
        drafts: (current.drafts || []).filter((item) => String(item.id) !== String(targetId)),
      }));
      setFeedback(response?.message || t("profile.draftDeleted"));
      setConfirmDeleteOpen(false);
      setDraftPreview(null);
    } catch (nextError) {
      setDraftError(firstError(nextError?.errors, nextError?.message || t("profile.unableToUpdate")));
      setConfirmDeleteOpen(false);
    } finally {
      setDraftAction(null);
    }
  }

  function cancelDraftDelete() {
    if (draftAction === "delete") return;
    setConfirmDeleteOpen(false);
  }

  function handleDraftEdit() {
    if (!draftPreview?.id || draftAction) return;
    const id = draftPreview.id;
    setDraftPreview(null);
    navigate(`/post-details-form?id=${id}`);
  }

  const videosCount = formatCompactNumber(profile?.videosCount ?? 0);
  const followersCount = formatCompactNumber(profile?.subscriberCount ?? 0);
  const followingCount = formatCompactNumber(profile?.followingCount ?? 0);
  const totalLikes = formatCompactNumber(profile?.totalLikes ?? 0);

  return (
    <div className="min-h-full bg-white dark:bg-black100 pb-20">
      <Toast
        message={error}
        variant="error"
        onDismiss={() => setError("")}
      />
      <Toast
        message={feedback}
        variant="success"
        onDismiss={() => setFeedback("")}
      />
      <div className="relative">
        <img src="/challenge_entries.png" alt="" className="h-48 w-full object-cover md:h-72" />
        <div className="absolute top-4 right-4 flex items-center gap-3">
          {/* <button className="w-10 h-10 cursor-pointer rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <FiBell className="w-5 h-5" />
          </button> */}
          <button onClick={() => navigate("/coins-wallet")} className="w-10 h-10 cursor-pointer rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <FiMoreHorizontal className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute top-4 w-25 h-7.5 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 bg-orange100 rounded-md px-3 py-1 shadow-md">
          <span className="text-[11px] font-medium text-black">{profile?.username ? `@${profile.username}` : ""}</span>
          <span className="w-2.5 h-2.5 bg-black rounded-full" ></span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <div className="-mt-16 md:-mt-20 flex flex-col items-center">
          {loadingProfile ? (
            <div className="py-20"><Spinner big /></div>
          ) : (
            <>
              {/* Avatar */}
              <div className="relative w-fit">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="group relative block rounded-full disabled:cursor-not-allowed"
                >
                  <img
                    src={avatarPreviewUrl}
                    alt={getProfileName(displayProfile)}
                    className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-slate100 object-cover shadow-lg transition-opacity group-hover:opacity-90 bg-black100"
                  />
                  <span className="absolute inset-x-0 bottom-3 mx-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white text-center">
                    {uploadingAvatar ? t("profile.uploading") : editing ? t("profile.changePhoto") : "View"}
                  </span>
                </button>
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-orange100 rounded-full flex items-center justify-center border-[3px] border-slate100">
                  <FaCheck className="w-3.5 h-3.5 text-black" />
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </div>

              {/* Info */}
              {editing && isOwnProfile ? (
                <div className="mt-6 flex flex-col items-center w-full max-w-sm gap-3">
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                    placeholder={t("profile.fullNamePlaceholder")}
                    className="w-full rounded-xl bg-[#2A2A2A] px-4 py-3 text-sm text-white outline-none"
                  />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(event) => setForm((current) => ({ ...current, username: event.target.value.toLowerCase() }))}
                    placeholder={t("profile.usernamePlaceholder")}
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full rounded-xl bg-[#2A2A2A] px-4 py-3 text-sm text-white outline-none"
                  />
                  <textarea
                    value={form.bio}
                    onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                    placeholder={t("profile.bioPlaceholder")}
                    rows={3}
                    className="w-full rounded-xl bg-[#2A2A2A] px-4 py-3 text-sm text-white outline-none resize-none"
                  />
                </div>
              ) : (
                <div className="mt-4 flex flex-col items-center text-center space-y-1.5">
                  <h1 className="text-[22px] md:text-[26px] font-semibold font-inter text-black dark:text-white">
                    {getProfileName(displayProfile)}
                  </h1>
                  <p className="text-[13px] md:text-[14px] font-medium font-inter text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
                    {profile?.bio?.trim() || t("profile.emptyBio")}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="mt-6 flex items-center justify-center gap-10 md:gap-16">
                <div className="flex flex-col items-center">
                  <span className="text-[18px] md:text-[20px] font-bold font-inter text-black dark:text-white">{videosCount}</span>
                  <span className="text-[11px] font-medium font-inter text-slate-500 mt-0.5">Videos</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[18px] md:text-[20px] font-bold font-inter text-black dark:text-white">{followersCount}</span>
                  <span className="text-[11px] font-medium font-inter text-slate-500 mt-0.5">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[18px] md:text-[20px] font-bold font-inter text-black dark:text-white">{followingCount}</span>
                  <span className="text-[11px] font-medium font-inter text-slate-500 mt-0.5">Following</span>
                </div>
              </div>

              {/* Total Likes */}
              <div className="mt-5">
                <div className="flex items-center gap-2 bg-[#2A2A2A] text-white px-5 py-2 rounded-lg text-[13px] font-medium">
                  <FaRegHeart className="text-red-500 w-3.5 h-3.5" />
                  <span>{totalLikes} total likes</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-85">
                {editing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="w-full rounded-md bg-orange100 py-2.75 text-[14px] font-semibold font-inter text-black transition-colors hover:bg-orange200 disabled:opacity-60"
                    >
                      {saving ? t("profile.saving") : t("profile.saveProfile")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="w-full rounded-md bg-black100 py-2.75 text-[13px] font-medium font-inter text-white transition-colors hover:bg-[#404040]"
                    >
                      {t("profile.cancel")}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate("/creator-dashboard")}
                      className="w-full rounded-md bg-orange100 py-2.75 text-[14px] font-semibold font-inter text-black transition-colors hover:bg-orange200"
                    >
                      Creator Dashboard
                    </button>
                    <div className="flex gap-3 w-full">
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="flex-1 rounded-md bg-black100 py-2.75 text-[13px] font-medium font-inter text-white transition-colors hover:bg-[#404040]"
                      >
                        Edit Profile
                      </button>
                      <button
                        type="button"
                        onClick={handleShareProfile}
                        className="flex flex-1 items-center justify-center gap-2 rounded-md bg-black100 py-2.75 text-[13px] font-medium font-inter text-white transition-colors hover:bg-[#404040]"
                      >
                        <FiShare className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        {!loadingProfile && (
          <div className="mt-12 w-full border-b border-black100">
            <div className={`grid gap-0 max-w-175 mx-auto ${profileTabs.length === 1 ? "grid-cols-1" : "grid-cols-4"}`}>
              {profileTabs.map((tab) => {
                const isActive = tab.feed === activeTab;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.feed}
                    type="button"
                    onClick={() => setActiveTab(tab.feed)}
                    className={`flex items-center justify-center gap-2 pb-4 text-[14px] font-semibold font-inter transition-colors border-b-[3px] ${
                      isActive
                        ? "text-red-500 border-red-500"
                        : "text-slate-500 border-transparent hover:text-black hover:dark:text-white"
                    }`}
                  >
                    {Icon && <Icon className="w-4,5 h-4,5" />}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Feed */}
        {!loadingProfile && (
          <div className="mt-8">
            {loadingFeed ? (
              <div className="flex justify-center py-10">
                <Spinner big />
              </div>
            ) : visiblePosts.length ? (
              <div className="grid grid-cols-3 gap-3 md:gap-5">
                {visiblePosts.map((post) => (
                  <FeedTile
                    key={post.id}
                    video={post}
                    onOpen={handleOpenFeedItem}
                    showViews={activeConfig.feed !== "drafts"}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-12 text-center text-sm font-medium text-slate-500">
                {t("profile.emptyFeed", { feed: activeConfig.label || "posts" })}
              </div>
            )}
          </div>
        )}

        {isAvatarPreviewOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6"
            onClick={() => setIsAvatarPreviewOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={t("profile.picturePreview")}
          >
            <div className="relative max-h-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                onClick={() => setIsAvatarPreviewOpen(false)}
                className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-2 text-sm font-medium text-white"
              >
                {t("profile.close")}
              </button>
              <img src={avatarPreviewUrl} alt={getProfileName(displayProfile)} className="max-h-[80vh] max-w-full rounded-3xl object-contain shadow-2xl" />
            </div>
          </div>
        ) : null}

        {draftPreview ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6"
            onClick={closeDraftPreview}
            role="dialog"
            aria-modal="true"
            aria-label={t("profile.draftPreview")}
          >
            <div
              className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#141414]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeDraftPreview}
                disabled={Boolean(draftAction)}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
              >
                {t("profile.close")}
              </button>

              <div className="relative aspect-[9/16] max-h-[65vh] w-full bg-black">
                {draftPreview.type === "video" && getVideoMediaUrl(draftPreview) ? (
                  <video
                    src={getVideoMediaUrl(draftPreview)}
                    poster={getVideoThumbnail(draftPreview)}
                    className="h-full w-full object-contain"
                    controls
                    playsInline
                  />
                ) : (
                  <img
                    src={getVideoThumbnail(draftPreview)}
                    alt={getVideoTitle(draftPreview)}
                    className="h-full w-full object-contain"
                  />
                )}
              </div>

              <div className="flex flex-col gap-4 p-5">
                <div>
                  <h3 className="text-base font-semibold text-black dark:text-white">
                    {getVideoTitle(draftPreview)}
                  </h3>
                  {draftPreview.description ? (
                    <p className="mt-1 line-clamp-3 text-sm text-slate-500 dark:text-slate-300">
                      {draftPreview.description}
                    </p>
                  ) : null}
                </div>

                {draftError ? (
                  <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {draftError}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleDraftEdit}
                    disabled={Boolean(draftAction)}
                    className="flex-1 min-w-30 rounded-md bg-black100 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#404040] disabled:opacity-60"
                  >
                    {t("profile.editDraft")}
                  </button>
                  <button
                    type="button"
                    onClick={handleDraftPublish}
                    disabled={Boolean(draftAction)}
                    className="flex-1 min-w-30 rounded-md bg-orange100 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-orange200 disabled:opacity-60"
                  >
                    {draftAction === "publish" ? t("upload.actions.publishing") : t("profile.postDraft")}
                  </button>
                  <button
                    type="button"
                    onClick={handleDraftDelete}
                    disabled={Boolean(draftAction)}
                    className="flex-1 min-w-30 rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                  >
                    {draftAction === "delete" ? t("profile.deleting") : t("profile.deleteDraft")}
                  </button>
                </div>
              </div>
            </div>

            {confirmDeleteOpen ? (
              <div
                className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 px-4"
                role="dialog"
                aria-modal="true"
                aria-label={t("profile.confirmDeleteTitle")}
                onClick={cancelDraftDelete}
              >
                <div
                  className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#141414]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <h4 className="text-lg font-semibold text-black dark:text-white">
                    {t("profile.confirmDeleteTitle")}
                  </h4>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                    {t("profile.confirmDeleteBody")}
                  </p>
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelDraftDelete}
                      disabled={draftAction === "delete"}
                      className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-slate-600 dark:text-white dark:hover:bg-white/10"
                    >
                      {t("profile.cancelDelete")}
                    </button>
                    <button
                      type="button"
                      onClick={confirmDraftDelete}
                      disabled={draftAction === "delete"}
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                    >
                      {draftAction === "delete" ? t("profile.deleting") : t("profile.deleteDraft")}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}