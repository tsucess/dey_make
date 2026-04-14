import { useEffect, useMemo, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api, firstError } from "../services/api";
import { formatCompactNumber, formatRelativeTime, getProfileAvatar, getProfileName } from "../utils/content";

const EMPTY_SUMMARY = { totalUsers: 0, adminUsers: 0, suspendedUsers: 0, creatorUsers: 0 };
const EMPTY_META = { currentPage: 1, lastPage: 1, total: 0 };

function roleLabel(managedUser, t) {
  if (managedUser?.isAdmin) return t("adminPage.roleAdmin");
  if ((managedUser?.stats?.videosCount || 0) > 0) return t("adminPage.roleCreator");
  return t("adminPage.roleMember");
}

function statusBadgeClasses(isSuspended) {
  return isSuspended
    ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-200"
    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200";
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ accountStatus: "", role: "", sort: "latest" });
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [meta, setMeta] = useState(EMPTY_META);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notesByUserId, setNotesByUserId] = useState({});
  const [clearSessionsByUserId, setClearSessionsByUserId] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingDetailId, setLoadingDetailId] = useState(null);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let ignore = false;
    async function loadUsers() {
      setLoading(true);
      setError("");
      try {
        const response = await api.getAdminUsers({ q: query, page, ...filters });
        if (ignore) return;
        setUsers(response?.data?.users || []);
        setSummary(response?.meta?.summary || EMPTY_SUMMARY);
        setMeta(response?.meta?.users || EMPTY_META);
      } catch (nextError) {
        if (!ignore) setError(firstError(nextError?.errors, nextError?.message || t("adminPage.unableToLoadUsers")));
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadUsers();
    return () => { ignore = true; };
  }, [filters, page, query, t]);

  const summaryCards = useMemo(() => ([
    { key: "totalUsers", label: t("adminPage.summaryTotalUsers"), value: summary.totalUsers },
    { key: "adminUsers", label: t("adminPage.summaryAdmins"), value: summary.adminUsers },
    { key: "suspendedUsers", label: t("adminPage.summarySuspended"), value: summary.suspendedUsers },
    { key: "creatorUsers", label: t("adminPage.summaryCreators"), value: summary.creatorUsers },
  ]), [summary, t]);

  if (!user?.isAdmin) return <Navigate to="/home" replace />;

  async function handleReview(managedUser) {
    if (selectedUser?.id === managedUser.id) {
      setSelectedUser(null);
      return;
    }
    setLoadingDetailId(managedUser.id);
    setError("");
    try {
      const response = await api.getManagedUser(managedUser.id);
      setSelectedUser(response?.data?.user || managedUser);
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("adminPage.unableToLoadUsers")));
    } finally {
      setLoadingDetailId(null);
    }
  }

  async function handleToggleStatus(managedUser) {
    const nextStatus = managedUser?.isSuspended ? "active" : "suspended";
    const actionKey = `${nextStatus}-${managedUser.id}`;
    setBusyAction(actionKey);
    setError("");
    setFeedback("");
    try {
      const response = await api.updateManagedUser(managedUser.id, {
        accountStatus: nextStatus,
        accountStatusNotes: notesByUserId[managedUser.id]?.trim() || undefined,
        clearSessions: nextStatus === "suspended" ? true : Boolean(clearSessionsByUserId[managedUser.id]),
      });
      const updatedUser = response?.data?.user;
      if (updatedUser) {
        setUsers((current) => current.map((entry) => entry.id === updatedUser.id ? updatedUser : entry));
        setSelectedUser((current) => current?.id === updatedUser.id ? updatedUser : current);
      }
      setFeedback(response?.message || "");
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("adminPage.unableToUpdateUser")));
    } finally {
      setBusyAction("");
    }
  }

  function resetFilters() {
    setDraftQuery("");
    setQuery("");
    setFilters({ accountStatus: "", role: "", sort: "latest" });
    setPage(1);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-330 flex-col gap-6 px-4 py-5 md:px-8 md:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-4xl bg-white p-6 shadow-sm dark:bg-[#171717]">
        <div>
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate600 dark:text-slate200">
            <HiArrowLeft className="h-5 w-5" /> {t("videoDetails.back")}
          </button>
          <h1 className="mt-4 text-3xl font-semibold text-black dark:text-white">{t("adminPage.title")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate600 dark:text-slate200">{t("adminPage.description")}</p>
        </div>
        <span className="rounded-full bg-orange100 px-4 py-2 text-sm font-semibold text-black">{t("common.admin")}</span>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.key} className="rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate500 dark:text-slate200">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-black dark:text-white">{formatCompactNumber(card.value || 0)}</p>
          </article>
        ))}
      </section>

      <section className="rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
        <form className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto_auto]" onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(draftQuery.trim()); }}>
          <input value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder={t("adminPage.searchPlaceholder")} className="rounded-full border border-black/10 px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1F1F1F] dark:text-white" />
          <select value={filters.accountStatus} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, accountStatus: event.target.value })); }} className="rounded-full border border-black/10 px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1F1F1F] dark:text-white">
            <option value="">{t("adminPage.allStatuses")}</option>
            <option value="active">{t("adminPage.statusActive")}</option>
            <option value="suspended">{t("adminPage.statusSuspended")}</option>
          </select>
          <select value={filters.role} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, role: event.target.value })); }} className="rounded-full border border-black/10 px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1F1F1F] dark:text-white">
            <option value="">{t("adminPage.allRoles")}</option>
            <option value="admin">{t("adminPage.roleAdmin")}</option>
            <option value="creator">{t("adminPage.roleCreator")}</option>
            <option value="member">{t("adminPage.roleMember")}</option>
          </select>
          <select value={filters.sort} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, sort: event.target.value })); }} className="rounded-full border border-black/10 px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1F1F1F] dark:text-white">
            <option value="latest">{t("adminPage.sortLatest")}</option>
            <option value="oldest">{t("adminPage.sortOldest")}</option>
            <option value="active">{t("adminPage.sortActive")}</option>
          </select>
          <button type="submit" className="rounded-full bg-orange100 px-5 py-3 text-sm font-semibold text-black">{t("adminPage.applyFilters")}</button>
          <button type="button" onClick={resetFilters} className="rounded-full bg-[#F7F7F7] px-5 py-3 text-sm font-semibold text-black dark:bg-[#1F1F1F] dark:text-white">{t("adminPage.clearFilters")}</button>
        </form>
      </section>

      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</div> : null}
      {feedback ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">{feedback}</div> : null}

      <section className="rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white">{t("adminPage.usersHeading")}</h2>
            <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("adminPage.resultsCount", { count: meta.total || users.length })}</p>
          </div>
          {meta.lastPage > 1 ? <p className="text-sm text-slate500 dark:text-slate200">{t("adminPage.pageSummary", { current: meta.currentPage || 1, last: meta.lastPage || 1 })}</p> : null}
        </div>

        {loading ? <div className="mt-4 rounded-3xl bg-[#F7F7F7] px-4 py-8 text-sm text-slate600 dark:bg-[#1F1F1F] dark:text-slate200">{t("adminPage.loadingUsers")}</div> : null}

        {!loading && users.length === 0 ? <div className="mt-4 rounded-3xl bg-[#F7F7F7] px-4 py-8 text-center text-sm text-slate600 dark:bg-[#1F1F1F] dark:text-slate200">{t("adminPage.noUsers")}</div> : null}

        <div className="mt-4 space-y-4">
          {users.map((managedUser) => {
            const isSelected = selectedUser?.id === managedUser.id;
            const detailUser = isSelected ? selectedUser : managedUser;
            const noteValue = notesByUserId[managedUser.id] ?? detailUser?.accountStatusNotes ?? "";
            const actionKey = `${managedUser.isSuspended ? "active" : "suspended"}-${managedUser.id}`;
            return (
              <article key={managedUser.id} className="rounded-4xl border border-black/5 p-5 dark:border-white/10">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex gap-4">
                    <img src={getProfileAvatar(managedUser)} alt={getProfileName(managedUser)} className="h-16 w-16 rounded-full object-cover" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-black dark:text-white">{getProfileName(managedUser)}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses(managedUser.isSuspended)}`}>{managedUser.isSuspended ? t("adminPage.statusSuspended") : t("adminPage.statusActive")}</span>
                        <span className="rounded-full bg-[#F7F7F7] px-3 py-1 text-xs font-semibold text-slate700 dark:bg-[#1F1F1F] dark:text-slate200">{roleLabel(managedUser, t)}</span>
                        {managedUser.isVerifiedCreator ? <span className="rounded-full bg-orange100 px-3 py-1 text-xs font-semibold text-black">{t("adminPage.verifiedCreator")}</span> : null}
                      </div>
                      <p className="mt-1 text-sm text-slate600 dark:text-slate200">@{managedUser.username} · {managedUser.email}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate500 dark:text-slate200">
                        <span>{t("adminPage.lastActive")}: {managedUser.lastActiveAt ? formatRelativeTime(managedUser.lastActiveAt) : t("content.justNow")}</span>
                        <span>{t("adminPage.joined")}: {formatRelativeTime(managedUser.createdAt)}</span>
                        <span>{managedUser.isOnline ? t("adminPage.onlineNow") : t("adminPage.offlineNow")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 xl:justify-end">
                    <button type="button" onClick={() => handleReview(managedUser)} disabled={loadingDetailId === managedUser.id} className="rounded-full bg-[#F7F7F7] px-5 py-3 text-sm font-semibold text-black disabled:opacity-60 dark:bg-[#1F1F1F] dark:text-white">
                      {isSelected ? t("adminPage.hideDetails") : loadingDetailId === managedUser.id ? t("adminPage.reviewingUser") : t("adminPage.reviewDetails")}
                    </button>
                    <button type="button" onClick={() => handleToggleStatus(managedUser)} disabled={busyAction === actionKey} className={`rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 ${managedUser.isSuspended ? "bg-emerald-500" : "bg-red-500"}`}>
                      {managedUser.isSuspended ? t("adminPage.reactivateUser") : t("adminPage.suspendUser")}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                  {[
                    { key: "videosCount", label: t("adminPage.videosCount"), value: detailUser?.stats?.videosCount || 0 },
                    { key: "publishedVideos", label: t("adminPage.publishedVideos"), value: detailUser?.stats?.publishedVideosCount || 0 },
                    { key: "liveVideos", label: t("adminPage.liveVideos"), value: detailUser?.stats?.liveVideosCount || 0 },
                    { key: "subscribers", label: t("adminPage.subscribers"), value: detailUser?.stats?.subscribersCount || 0 },
                    { key: "reportsSubmitted", label: t("adminPage.reportsSubmitted"), value: detailUser?.stats?.reportsSubmittedCount || 0 },
                    { key: "challengeSubmissions", label: t("adminPage.challengeSubmissions"), value: detailUser?.stats?.challengeSubmissionsCount || 0 },
                  ].map((stat) => (
                    <div key={stat.key} className="rounded-3xl bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate500 dark:text-slate200">{stat.label}</p>
                      <p className="mt-2 text-xl font-semibold text-black dark:text-white">{formatCompactNumber(stat.value)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
                  <div className="rounded-3xl bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate500 dark:text-slate200">{t("adminPage.bio")}</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate700 dark:text-slate200">{detailUser?.bio || t("adminPage.noBio")}</p>
                  </div>
                  <div className="rounded-3xl bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate500 dark:text-slate200" htmlFor={`admin-note-${managedUser.id}`}>{t("adminPage.noteLabel")}</label>
                    <textarea id={`admin-note-${managedUser.id}`} value={noteValue} onChange={(event) => setNotesByUserId((current) => ({ ...current, [managedUser.id]: event.target.value }))} placeholder={managedUser.isSuspended ? t("adminPage.reactivateReasonPlaceholder") : t("adminPage.suspendReasonPlaceholder")} className="mt-3 min-h-28 w-full resize-y rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#171717] dark:text-white" />
                    <label className="mt-3 flex items-center gap-2 text-sm text-slate600 dark:text-slate200">
                      <input type="checkbox" checked={Boolean(clearSessionsByUserId[managedUser.id])} onChange={(event) => setClearSessionsByUserId((current) => ({ ...current, [managedUser.id]: event.target.checked }))} />
                      {t("adminPage.clearSessions")}
                    </label>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {meta.lastPage > 1 ? (
          <div className="mt-6 flex items-center justify-end gap-3">
            <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={(meta.currentPage || 1) <= 1} className="rounded-full bg-[#F7F7F7] px-5 py-3 text-sm font-semibold text-black disabled:opacity-50 dark:bg-[#1F1F1F] dark:text-white">{t("adminPage.previousPage")}</button>
            <button type="button" onClick={() => setPage((current) => Math.min(current + 1, meta.lastPage || current + 1))} disabled={(meta.currentPage || 1) >= (meta.lastPage || 1)} className="rounded-full bg-orange100 px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">{t("adminPage.nextPage")}</button>
          </div>
        ) : null}
      </section>
    </div>
  );
}