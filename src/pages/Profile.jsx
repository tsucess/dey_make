import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowDropright } from "react-icons/io";
import { useAuth } from "../context/AuthContext";
import { api, firstError } from "../services/api";
import {
  formatCompactNumber,
  formatSubscriberLabel,
  getProfileAvatar,
  getProfileName,
  getVideoThumbnail,
  getVideoTitle,
} from "../utils/content";

const profileTabs = [
  { label: "Posts", feed: "posts" },
  { label: "Liked", feed: "liked" },
  { label: "Saved", feed: "saved" },
  { label: "Drafts", feed: "drafts" },
];

function ViewsBadge({ views }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border-y-2 border-white bg-black/50 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-xs">
      <IoMdArrowDropright className="h-6 w-6 text-white" />
      <span className="font-inter text-sm text-white">{formatCompactNumber(views)} views</span>
    </div>
  );
}

function FeedTile({ video, onOpen }) {
  return (
    <article
      onClick={() => onOpen(video.id)}
      className="group relative h-75 cursor-pointer overflow-hidden rounded-2xl bg-slate200/95 dark:bg-slate200"
    >
      <img src={getVideoThumbnail(video)} alt={getVideoTitle(video)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/30 to-transparent px-4 pb-4 pt-12">
        <p className="line-clamp-2 text-sm font-medium text-white md:text-base">{getVideoTitle(video)}</p>
      </div>
      {video.isLive ? <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">LIVE</span> : null}
      <div className="absolute bottom-4 right-4">
        <ViewsBadge views={video.views || 0} />
      </div>
    </article>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { syncUser } = useAuth();
  const avatarInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState(profileTabs[0].feed);
  const [profile, setProfile] = useState(null);
  const [feeds, setFeeds] = useState({ posts: [], liked: [], saved: [], drafts: [] });
  const [form, setForm] = useState({ fullName: "", bio: "", avatarUrl: "" });
  const [editing, setEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const activeConfig = useMemo(
    () => profileTabs.find((tab) => tab.feed === activeTab) || profileTabs[0],
    [activeTab],
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
    let ignore = false;

    async function loadProfile() {
      setLoadingProfile(true);
      setError("");

      try {
        const response = await api.getProfile();
        const nextProfile = response?.data?.profile;

        if (!ignore) {
          setProfile(nextProfile);
          setForm({
            fullName: nextProfile?.fullName || "",
            bio: nextProfile?.bio || "",
            avatarUrl: nextProfile?.avatarUrl || "",
          });
        }
      } catch (nextError) {
        if (!ignore) {
          setError(firstError(nextError.errors, nextError.message || "Unable to load profile."));
        }
      } finally {
        if (!ignore) setLoadingProfile(false);
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadFeed() {
      setLoadingFeed(true);

      try {
        const response = await api.getProfileFeed(activeConfig.feed);

        if (!ignore) {
          setFeeds((current) => ({
            ...current,
            [activeConfig.feed]: response?.data?.videos || [],
          }));
        }
      } catch (nextError) {
        if (!ignore) {
          setError(firstError(nextError.errors, nextError.message || `Unable to load ${activeConfig.label.toLowerCase()}.`));
        }
      } finally {
        if (!ignore) setLoadingFeed(false);
      }
    }

    loadFeed();

    return () => {
      ignore = true;
    };
  }, [activeConfig.feed, activeConfig.label]);

  async function handleSaveProfile() {
    if (!form.fullName.trim()) {
      setError("Your full name is required.");
      return;
    }

    setSaving(true);
    setError("");
    setFeedback("");

    try {
      const response = await api.updateProfile({
        fullName: form.fullName.trim(),
        bio: form.bio.trim() || null,
        avatarUrl: form.avatarUrl.trim() || null,
      });
      const nextProfile = response?.data?.profile;

      setProfile(nextProfile);
      setForm({
        fullName: nextProfile?.fullName || "",
        bio: nextProfile?.bio || "",
        avatarUrl: nextProfile?.avatarUrl || "",
      });
      syncUser(nextProfile);
      setEditing(false);
      setFeedback("Profile updated successfully.");
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || "Unable to update profile."));
    } finally {
      setSaving(false);
    }
  }

  async function handleShareProfile() {
    const shareUrl = `${window.location.origin}/profile`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setFeedback("Profile link copied to your clipboard.");
    } catch {
      setFeedback(`Share this link: ${shareUrl}`);
    }
  }

  async function handleAvatarFileChange(event) {
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
        throw new Error("Unable to resolve the uploaded profile picture.");
      }

      setForm((current) => ({ ...current, avatarUrl: uploadedAvatarUrl }));

      if (editing) {
        setFeedback("Profile picture uploaded. Save profile to keep this change.");
        return;
      }

      const response = await api.updateProfile({ avatarUrl: uploadedAvatarUrl });
      const nextProfile = response?.data?.profile;

      setProfile(nextProfile);
      setForm((current) => ({
        ...current,
        fullName: nextProfile?.fullName || current.fullName,
        bio: nextProfile?.bio || "",
        avatarUrl: nextProfile?.avatarUrl || uploadedAvatarUrl,
      }));
      syncUser(nextProfile);
      setFeedback("Profile picture updated successfully.");
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || "Unable to upload profile picture."));
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  }

  function handleAvatarClick() {
    if (editing) {
      avatarInputRef.current?.click();
      return;
    }

    setIsAvatarPreviewOpen(true);
  }

  function handleOpenFeedItem(videoId) {
    navigate(activeConfig.feed === "drafts" ? `/create?id=${videoId}` : `/video/${videoId}`);
  }

  return (
    <div className="min-h-full bg-white dark:bg-slate100">
      <img src="./header_profile.png" className="h-56 w-full md:h-64" />

      <div className="mx-auto max-w-6xl px-4 pb-10 md:px-8 md:pl-20 md:pb-12">
        <div className="-mt-12 md:-mt-16">
          {error ? <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          {feedback ? <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</div> : null}

          <div className="md:p-8">
            {loadingProfile ? (
              <p className="text-sm text-slate600 dark:text-slate200">Loading profile...</p>
            ) : (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
                  <div className="relative w-fit">
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      disabled={uploadingAvatar}
                      className="group relative block rounded-full disabled:cursor-not-allowed"
                      aria-label={editing ? "Change profile picture" : "View profile picture"}
                    >
                      <img
                        src={avatarPreviewUrl}
                        alt={getProfileName(displayProfile)}
                        className="h-24 w-24 rounded-full border-[6px] border-white object-cover shadow-lg transition-opacity group-hover:opacity-90 dark:border-slate100 md:h-28 md:w-28"
                      />
                      <span className="absolute inset-x-0 bottom-1 mx-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                        {uploadingAvatar ? "Uploading..." : editing ? "Change photo" : "View photo"}
                      </span>
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <h1 className="text-2xl font-medium font-inter text-black dark:text-white">{getProfileName(displayProfile)}</h1>
                    <p className="text-base font-inter text-slate700 dark:text-slate200">
                      {formatSubscriberLabel(profile?.subscriberCount || 0)}
                    </p>
                    {profile?.email ? <p className="text-sm text-slate500 dark:text-slate200">{profile.email}</p> : null}
                  </div>
                </div>

                {editing ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                      placeholder="Full name"
                      className="rounded-2xl bg-white px-5 py-4 text-sm text-slate100 outline-none dark:bg-[#1D1D1D] dark:text-white"
                    />
                    <input
                      type="url"
                      value={form.avatarUrl}
                      onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                      placeholder="Avatar URL"
                      className="rounded-2xl bg-white px-5 py-4 text-sm text-slate100 outline-none dark:bg-[#1D1D1D] dark:text-white"
                    />
                    <textarea
                      value={form.bio}
                      onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                      placeholder="Bio"
                      rows={4}
                      className="rounded-2xl bg-white px-5 py-4 text-sm text-slate100 outline-none dark:bg-[#1D1D1D] dark:text-white md:col-span-2"
                    />
                  </div>
                ) : (
                  <p className="text-lg font-medium font-inter text-black dark:text-white md:text-xl">
                    {profile?.bio || "Tell people what you create and why they should follow along."}
                  </p>
                )}

                <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                  {editing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="min-w-44 rounded-full bg-orange100 px-8 py-4 text-base font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? "Saving..." : "Save profile"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setForm({
                            fullName: profile?.fullName || "",
                            bio: profile?.bio || "",
                            avatarUrl: profile?.avatarUrl || "",
                          });
                        }}
                        className="min-w-44 rounded-full bg-white px-8 py-4 text-base font-medium text-black dark:bg-[#1D1D1D] dark:text-white"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="min-w-44 rounded-full bg-white300 font-inter px-8 py-4 text-base font-medium text-black dark:bg-[#1D1D1D] dark:text-white"
                      >
                        Edit profile
                      </button>
                      <button
                        type="button"
                        onClick={handleShareProfile}
                        className="min-w-44 rounded-full bg-white300 font-inter px-8 py-4 text-base font-medium text-black dark:bg-[#1D1D1D] dark:text-white"
                      >
                        Share profile
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 rounded-full bg-white300 p-2 dark:bg-black100 md:mt-10">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {profileTabs.map((tab) => {
                const isActive = tab.feed === activeTab;

                return (
                  <button
                    key={tab.feed}
                    type="button"
                    onClick={() => setActiveTab(tab.feed)}
                    className={`rounded-full px-5 py-2 text-base font-medium font-inter transition-colors md:text-lg ${
                      isActive
                        ? "bg-orange100 text-black"
                        : "text-slate100 hover:bg-white dark:text-white dark:hover:bg-[#454545]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white">{activeConfig.label}</h2>
              <p className="text-sm text-slate600 dark:text-slate200">{visiblePosts.length} items in this feed</p>
            </div>
          </div>

          {loadingFeed ? (
            <div className="mt-6 rounded-3xl bg-white300 px-6 py-10 text-center text-sm text-slate600 dark:bg-black100 dark:text-slate200">
              Loading {activeConfig.label.toLowerCase()}...
            </div>
          ) : visiblePosts.length ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:mt-8 md:gap-6">
              {visiblePosts.map((post) => (
                <FeedTile key={post.id} video={post} onOpen={handleOpenFeedItem} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl bg-white300 px-6 py-10 text-center text-sm text-slate600 dark:bg-black100 dark:text-slate200">
              No {activeConfig.label.toLowerCase()} yet.
            </div>
          )}
        </div>

        {isAvatarPreviewOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6"
            onClick={() => setIsAvatarPreviewOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Profile picture preview"
          >
            <div className="relative max-h-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                onClick={() => setIsAvatarPreviewOpen(false)}
                className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-2 text-sm font-medium text-white"
              >
                Close
              </button>
              <img src={avatarPreviewUrl} alt={getProfileName(displayProfile)} className="max-h-[80vh] max-w-full rounded-3xl object-contain shadow-2xl" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}