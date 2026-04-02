import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoMdArrowDropright } from "react-icons/io";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api, firstError } from "../services/api";
import {
  buildVideoLink,
  formatCountLabel,
  formatSubscriberLabel,
  getProfileAvatar,
  getProfileName,
  getVideoThumbnail,
  getVideoTitle,
} from "../utils/content";

const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/;

function getProfileTabs(t, isOwnProfile) {
  const tabs = [
    { label: t("profile.tabs.posts"), feed: "posts" },
  ];

  if (!isOwnProfile) return tabs;

  return [
    ...tabs,
    { label: t("profile.tabs.liked"), feed: "liked" },
    { label: t("profile.tabs.saved"), feed: "saved" },
    { label: t("profile.tabs.drafts"), feed: "drafts" },
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

function FeedTile({ video, onOpen }) {
  const { t } = useLanguage();

  return (
    <article
      onClick={() => onOpen(video)}
      className="group relative h-75 cursor-pointer overflow-hidden rounded-2xl bg-slate200/95 dark:bg-slate200"
    >
      <img src={getVideoThumbnail(video)} alt={getVideoTitle(video)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/30 to-transparent px-4 pb-4 pt-12">
        <p className="line-clamp-2 text-sm font-medium text-white md:text-base">{getVideoTitle(video)}</p>
      </div>
      {video.isLive ? <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">{t("content.liveBadge")}</span> : null}
      <div className="absolute bottom-4 right-4">
        <ViewsBadge views={video.views || 0} />
      </div>
    </article>
  );
}

function normalizePlan(plan = {}) {
  return {
    ...plan,
    benefits: Array.isArray(plan.benefits) ? plan.benefits : [],
    priceAmount: Number(plan.priceAmount) || 0,
    activeMemberCount: Number(plan.activeMemberCount) || 0,
    currentUserMembership: plan.currentUserMembership || null,
  };
}

function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format((Number(amount) || 0) / 100);
  } catch {
    return `${currency || "USD"} ${amount || 0}`;
  }
}

export default function Profile() {
  const { id: routeProfileId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, syncUser } = useAuth();
  const { t } = useLanguage();
  const avatarInputRef = useRef(null);
  const isOwnProfile = !routeProfileId || String(user?.id) === String(routeProfileId);
  const profileTabs = useMemo(() => getProfileTabs(t, isOwnProfile), [isOwnProfile, t]);
  const [activeTab, setActiveTab] = useState("posts");
  const [profile, setProfile] = useState(null);
  const [feeds, setFeeds] = useState({ posts: [], liked: [], saved: [], drafts: [] });
  const [form, setForm] = useState({ fullName: "", username: "", bio: "", avatarUrl: "" });
  const [editing, setEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingMemberships, setLoadingMemberships] = useState(false);
  const [saving, setSaving] = useState(false);
  const [membershipActionId, setMembershipActionId] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [membershipPlans, setMembershipPlans] = useState([]);

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
  const canSubscribe = !isOwnProfile && Boolean(profile?.id) && user?.id !== profile?.id;

  const loadMembershipPlans = useCallback(async (creatorId, { silent = false } = {}) => {
    if (!creatorId) {
      setMembershipPlans([]);
      return;
    }

    if (!silent) setLoadingMemberships(true);

    try {
      const response = await api.getCreatorPlans(creatorId);
      setMembershipPlans((response?.data?.plans || []).map(normalizePlan));
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("profile.unableToLoad")));
    } finally {
      if (!silent) setLoadingMemberships(false);
    }
  }, [t]);

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

  useEffect(() => {
    let ignore = false;

    async function fetchPlans() {
      if (isOwnProfile || !routeProfileId) {
        setMembershipPlans([]);
        setLoadingMemberships(false);
        return;
      }

      setLoadingMemberships(true);

      try {
        const response = await api.getCreatorPlans(routeProfileId);

        if (!ignore) {
          setMembershipPlans((response?.data?.plans || []).map(normalizePlan));
        }
      } catch (nextError) {
        if (!ignore) {
          setError(firstError(nextError?.errors, nextError?.message || t("profile.unableToLoad")));
        }
      } finally {
        if (!ignore) setLoadingMemberships(false);
      }
    }

    fetchPlans();

    return () => {
      ignore = true;
    };
  }, [isOwnProfile, routeProfileId, t]);

  function requireAuth() {
    if (isAuthenticated) return true;
    navigate("/login");
    return false;
  }

  async function handleSaveProfile() {
    if (!isOwnProfile) return;

    if (!form.fullName.trim()) {
      setError(t("profile.fullNameRequired"));
      return;
    }

    if (!form.username.trim()) {
      setError(t("profile.usernameRequired"));
      return;
    }

    if (!USERNAME_PATTERN.test(form.username.trim())) {
      setError(t("profile.usernameInvalid"));
      return;
    }

    setSaving(true);
    setError("");
    setFeedback("");

    try {
      const response = await api.updateProfile({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
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
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("profile.unableToUpdate")));
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

  async function handleSubscribe() {
    if (!canSubscribe || !requireAuth()) return;

    setSaving(true);
    setError("");
    setFeedback("");

    try {
      const response = profile?.currentUserState?.subscribed
        ? await api.unsubscribeFromCreator(profile.id)
        : await api.subscribeToCreator(profile.id);
      const creator = response?.data?.creator;

      setProfile((current) => current ? {
        ...current,
        subscriberCount: creator?.subscriberCount ?? current.subscriberCount,
        currentUserState: {
          ...current.currentUserState,
          subscribed: creator?.subscribed ?? current.currentUserState?.subscribed,
        },
      } : current);
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("videoDetails.unableToUpdateSubscription")));
    } finally {
      setSaving(false);
    }
  }

  async function handleMembershipAction(plan) {
    if (!plan?.id || !requireAuth()) return;

    setMembershipActionId(plan.id);
    setError("");
    setFeedback("");

    try {
      const isActiveMembership = plan.currentUserMembership?.status === "active";
      const response = isActiveMembership
        ? await api.cancelMembership(plan.currentUserMembership.id)
        : await api.subscribeToPlan(plan.id);

      await loadMembershipPlans(profile?.id || routeProfileId, { silent: true });
      setFeedback(response?.message || (isActiveMembership ? t("profile.memberships.cancelled") : t("profile.memberships.joinedFeedback")));
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("profile.unableToUpdate")));
    } finally {
      setMembershipActionId(null);
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
    navigate(isOwnProfile && activeConfig.feed === "drafts" ? `/create?id=${nextVideo.id}` : buildVideoLink(nextVideo));
  }

  return (
    <div className="min-h-full bg-white dark:bg-slate100">
      <img src="./header_profile.png" alt="" className="h-56 w-full md:h-64" />

      <div className="mx-auto max-w-6xl px-4 pb-10 md:px-8 md:pl-20 md:pb-12">
        <div className="-mt-12 md:-mt-16">
          {error ? <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          {feedback ? <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</div> : null}

          <div className="md:p-8">
            {loadingProfile ? (
              <p className="text-sm text-slate600 dark:text-slate200">{t("profile.loadingProfile")}</p>
            ) : (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
                  <div className="relative w-fit">
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      disabled={uploadingAvatar}
                      className="group relative block rounded-full disabled:cursor-not-allowed"
                      aria-label={editing ? t("profile.changeProfilePicture") : t("profile.viewProfilePicture")}
                    >
                      <img
                        src={avatarPreviewUrl}
                        alt={getProfileName(displayProfile)}
                        className="h-24 w-24 rounded-full border-[6px] border-white object-cover shadow-lg transition-opacity group-hover:opacity-90 dark:border-slate100 md:h-28 md:w-28"
                      />
                      <span className="absolute inset-x-0 bottom-1 mx-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                        {uploadingAvatar ? t("profile.uploading") : editing ? t("profile.changePhoto") : t("profile.viewPhoto")}
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
                    {profile?.username ? <p className="text-sm font-medium font-inter text-slate500 dark:text-slate200">@{profile.username}</p> : null}
                    <p className="text-base font-inter text-slate700 dark:text-slate200">
                      {formatSubscriberLabel(profile?.subscriberCount || 0)}
                    </p>
                    {isOwnProfile && profile?.email ? <p className="text-sm text-slate500 dark:text-slate200">{profile.email}</p> : null}
                  </div>
                </div>

                {editing && isOwnProfile ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                      placeholder={t("profile.fullNamePlaceholder")}
                      className="rounded-2xl bg-white px-5 py-4 text-sm text-slate100 outline-none dark:bg-[#1D1D1D] dark:text-white"
                    />
                    <input
                      type="text"
                      value={form.username}
                      onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                      placeholder={t("profile.usernamePlaceholder")}
                      autoCapitalize="none"
                      autoCorrect="off"
                      className="rounded-2xl bg-white px-5 py-4 text-sm text-slate100 outline-none dark:bg-[#1D1D1D] dark:text-white"
                    />
                    <input
                      type="url"
                      value={form.avatarUrl}
                      onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                      placeholder={t("profile.avatarUrlPlaceholder")}
                      className="rounded-2xl bg-white px-5 py-4 text-sm text-slate100 outline-none dark:bg-[#1D1D1D] dark:text-white md:col-span-2"
                    />
                    <textarea
                      value={form.bio}
                      onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                      placeholder={t("profile.bioPlaceholder")}
                      rows={4}
                      className="rounded-2xl bg-white px-5 py-4 text-sm text-slate100 outline-none dark:bg-[#1D1D1D] dark:text-white md:col-span-2"
                    />
                  </div>
                ) : (
                  <p className="text-lg font-medium font-inter text-black dark:text-white md:text-xl">
                    {profile?.bio || t("profile.emptyBio")}
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
                        {saving ? t("profile.saving") : t("profile.saveProfile")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setForm({
                            fullName: profile?.fullName || "",
                            username: profile?.username || "",
                            bio: profile?.bio || "",
                            avatarUrl: profile?.avatarUrl || "",
                          });
                        }}
                        className="min-w-44 rounded-full bg-white px-8 py-4 text-base font-medium text-black dark:bg-[#1D1D1D] dark:text-white"
                      >
                        {t("profile.cancel")}
                      </button>
                    </>
                  ) : isOwnProfile ? (
                    <div className="flex gap-4 justify-center">
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="md:min-w-44 rounded-full bg-white300 font-inter px-8 py-4 text-base font-medium text-black dark:bg-black100 dark:hover:bg-black200 dark:text-white"
                      >
                        {t("profile.editProfile")}
                      </button>
                      <button
                        type="button"
                        onClick={handleShareProfile}
                        className="md:min-w-44 rounded-full bg-white300 font-inter px-8 py-4 text-base font-medium text-black dark:bg-black100 dark:hover:bg-black200 dark:text-white"
                      >
                        {t("profile.shareProfile")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 md:flex-row md:justify-center">
                      {canSubscribe ? (
                        <button
                          type="button"
                          onClick={handleSubscribe}
                          disabled={saving}
                          className="md:min-w-44 rounded-full bg-orange100 px-8 py-4 text-base font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving
                            ? t("profile.saving")
                            : profile?.currentUserState?.subscribed
                              ? t("videoDetails.subscribed")
                              : t("profile.subscribe")}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleShareProfile}
                        className="md:min-w-44 rounded-full bg-white300 font-inter px-8 py-4 text-base font-medium text-black dark:bg-black100 dark:hover:bg-black200 dark:text-white"
                      >
                        {t("profile.shareProfile")}
                      </button>
                    </div>
                  )}
                </div>

                {!isOwnProfile ? (
                  <section className="rounded-3xl bg-white300 p-5 dark:bg-black100 md:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-black dark:text-white">{t("profile.memberships.heading")}</h2>
                      </div>
                    </div>

                    {loadingMemberships ? (
                      <div className="mt-4 rounded-2xl bg-white px-4 py-5 text-sm text-slate600 dark:bg-slate100 dark:text-slate200">
                        {t("profile.memberships.loading")}
                      </div>
                    ) : membershipPlans.length ? (
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {membershipPlans.map((plan) => {
                          const isJoined = plan.currentUserMembership?.status === "active";
                          const isBusy = membershipActionId === plan.id;

                          return (
                            <article key={plan.id} className="rounded-3xl bg-white px-5 py-5 shadow-sm dark:bg-slate100/70">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-lg font-semibold text-black dark:text-white">{plan.name}</h3>
                                  <p className="mt-1 text-sm text-slate600 dark:text-slate200">
                                    {t("settings.memberships.priceLabel", {
                                      amount: formatMoney(plan.priceAmount, plan.currency),
                                      period: t(`settings.memberships.billingPeriods.${plan.billingPeriod}`),
                                    })}
                                  </p>
                                </div>
                                <span className="rounded-full bg-orange100/15 px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-200">
                                  {t("profile.memberships.activeMembers")}: {plan.activeMemberCount}
                                </span>
                              </div>

                              {plan.description ? (
                                <p className="mt-3 text-sm text-slate700 dark:text-slate200">{plan.description}</p>
                              ) : null}

                              {plan.benefits.length ? (
                                <div className="mt-4">
                                  <p className="text-sm font-medium text-black dark:text-white">{t("profile.memberships.benefits")}</p>
                                  <ul className="mt-2 space-y-2 text-sm text-slate700 dark:text-slate200">
                                    {plan.benefits.map((benefit) => (
                                      <li key={benefit} className="flex gap-2">
                                        <span aria-hidden="true">•</span>
                                        <span>{benefit}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null}

                              <div className="mt-5 flex items-center justify-between gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleMembershipAction(plan)}
                                  disabled={isBusy}
                                  className={`rounded-full px-6 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 ${isJoined ? "border border-red-200 text-red-600" : "bg-orange100 text-black"}`}
                                >
                                  {isBusy ? t("profile.saving") : isJoined ? t("profile.memberships.cancel") : t("profile.memberships.join")}
                                </button>
                                {plan.currentUserMembership ? (
                                  <span className="text-xs font-medium text-slate500 dark:text-slate300">
                                    {t(`settings.memberships.statuses.${plan.currentUserMembership.status}`)}
                                  </span>
                                ) : null}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl bg-white px-4 py-5 text-sm text-slate600 dark:bg-slate100 dark:text-slate200">
                        {t("profile.memberships.empty")}
                      </div>
                    )}
                  </section>
                ) : null}
              </div>
            )}
          </div>

          <div className="mt-8 md:rounded-full md:bg-white300 p-2 dark:md:bg-black100 md:mt-10">
            <div className={`grid gap-2 ${profileTabs.length === 1 ? "grid-cols-1" : "grid-cols-4 md:grid-cols-4"}`}>
              {profileTabs.map((tab) => {
                const isActive = tab.feed === activeTab;

                return (
                  <button
                    key={tab.feed}
                    type="button"
                    onClick={() => setActiveTab(tab.feed)}
                    className={`md:rounded-full px-5 py-2 text-base font-medium font-inter transition-colors md:text-lg ${
                      isActive
                        ? "text-orange100 border-b-2 border-b-orange100 md:bg-orange100 md:text-black"
                        : "text-slate100 hover:bg-white dark:text-white dark:hover:bg-transparent hover:-translate-y-0.5 dark:hover:border-b-2 dark:hover:border-b-orange100 dark:hover:md:bg-orange100 dark:md:hover:border-0"
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
                <p className="text-sm text-slate600 dark:text-slate200">{t("profile.itemsInFeed", { count: visiblePosts.length })}</p>
            </div>
          </div>

          {loadingFeed ? (
            <div className="mt-6 rounded-3xl bg-white300 px-6 py-10 text-center text-sm text-slate600 dark:bg-black100 dark:text-slate200">
              {t("profile.loadingFeed", { feed: activeConfig.label.toLowerCase() })}
            </div>
          ) : visiblePosts.length ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:mt-8 md:gap-6">
              {visiblePosts.map((post) => (
                <FeedTile key={post.id} video={post} onOpen={handleOpenFeedItem} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl bg-white300 px-6 py-10 text-center text-sm text-slate600 dark:bg-black100 dark:text-slate200">
              {t("profile.noFeedYet", { feed: activeConfig.label.toLowerCase() })}
            </div>
          )}
        </div>

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
      </div>
    </div>
  );
}