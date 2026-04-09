import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import AnalyticsLineChart from "../components/analytics/AnalyticsLineChart";
import { api, firstError } from "../services/api";
import {
  buildVideoAnalyticsLink,
  buildVideoLink,
  formatCompactNumber,
  formatRelativeTime,
  formatSubscriberLabel,
  getProfileAvatar,
  getProfileName,
  getVideoThumbnail,
  getVideoTitle,
  hasPostLiveAnalytics,
} from "../utils/content";

function formatSessionDuration(startedAt, endedAt) {
  if (!startedAt || !endedAt) return "0m";
  const totalSeconds = Math.max(0, Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes || 0}m`;
}

function formatSessionLabel(timestamp) {
  if (!timestamp) return "—";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(timestamp));
}

export default function CreatorLiveDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [profileResponse, feedResponse] = await Promise.all([
          api.getProfile(),
          api.getProfileFeed("posts"),
        ]);

        if (ignore) return;

        const nextProfile = profileResponse?.data?.profile || user || null;
        const allVideos = feedResponse?.data?.videos || [];
        const nextSessions = allVideos
          .filter((video) => hasPostLiveAnalytics(video))
          .sort((left, right) => new Date(right.liveEndedAt || right.createdAt || 0).getTime() - new Date(left.liveEndedAt || left.createdAt || 0).getTime());

        setProfile(nextProfile);
        setSessions(nextSessions);
      } catch (nextError) {
        if (!ignore) setError(firstError(nextError?.errors, nextError?.message || t("profile.liveDashboardUnavailable")));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [t, user]);

  const metrics = useMemo(() => {
    const totalSessions = sessions.length;
    const totalViews = sessions.reduce((sum, session) => sum + Number(session?.views || 0), 0);
    const totalEngagements = sessions.reduce((sum, session) => sum + Number(session?.liveLikes || session?.liveAnalytics?.liveLikes || 0) + Number(session?.liveComments || session?.liveAnalytics?.liveComments || 0), 0);
    const averagePeakViewers = totalSessions
      ? Math.round(sessions.reduce((sum, session) => sum + Number(session?.liveAnalytics?.peakViewers || 0), 0) / totalSessions)
      : 0;

    return [
      { key: "sessions", label: t("profile.totalLiveSessions"), value: formatCompactNumber(totalSessions) },
      { key: "views", label: t("profile.totalLiveViews"), value: formatCompactNumber(totalViews) },
      { key: "peak", label: t("profile.averagePeakViewers"), value: formatCompactNumber(averagePeakViewers) },
      { key: "engagements", label: t("profile.totalLiveEngagements"), value: formatCompactNumber(totalEngagements) },
    ];
  }, [sessions, t]);

  const bestSession = useMemo(() => sessions.reduce((best, session) => {
    const score = Number(session?.liveLikes || session?.liveAnalytics?.liveLikes || 0) + Number(session?.liveComments || session?.liveAnalytics?.liveComments || 0);
    const bestScore = Number(best?.liveLikes || best?.liveAnalytics?.liveLikes || 0) + Number(best?.liveComments || best?.liveAnalytics?.liveComments || 0);
    return !best || score > bestScore ? session : best;
  }, null), [sessions]);

  const topReachSession = useMemo(() => sessions.reduce((best, session) => (
    !best || Number(session?.liveAnalytics?.peakViewers || 0) > Number(best?.liveAnalytics?.peakViewers || 0)
      ? session
      : best
  ), null), [sessions]);

  const chartData = useMemo(() => (
    [...sessions]
      .slice(0, 6)
      .reverse()
      .map((session) => ({
        label: formatSessionLabel(session.liveEndedAt || session.createdAt),
        views: Number(session?.views || 0),
        peakViewers: Number(session?.liveAnalytics?.peakViewers || 0),
        engagements: Number(session?.liveLikes || session?.liveAnalytics?.liveLikes || 0) + Number(session?.liveComments || session?.liveAnalytics?.liveComments || 0),
      }))
  ), [sessions]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 dark:bg-[#121212] md:px-8 md:py-8">
      <div className="mx-auto max-w-350 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-black shadow-sm dark:bg-black100 dark:text-white">
            <HiArrowLeft className="h-5 w-5" /> {t("videoDetails.back")}
          </button>
          <div className="flex flex-wrap gap-3">
            <Link to="/profile" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm dark:bg-[#1D1D1D] dark:text-white">{t("videoDetails.backToProfile")}</Link>
          </div>
        </div>

        {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {loading ? <div className="rounded-4xl bg-white p-8 text-sm text-slate600 shadow-sm dark:bg-[#171717] dark:text-slate200">{t("videoDetails.loading")}</div> : null}

        {!loading ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr),390px]">
            <section className="overflow-hidden rounded-4xl bg-white shadow-sm dark:bg-[#171717]">
              <div className="border-b border-black/5 px-6 py-6 dark:border-white/5 md:px-8">
                <div className="flex flex-wrap items-center gap-4">
                  <img src={getProfileAvatar(profile)} alt={getProfileName(profile)} className="h-16 w-16 rounded-full object-cover" />
                  <div>
                    <h1 className="text-3xl font-semibold text-black dark:text-white">{t("profile.liveDashboard")}</h1>
                    <p className="mt-2 max-w-3xl text-sm text-slate600 dark:text-slate200">{t("profile.liveDashboardDescription")}</p>
                    <p className="mt-2 text-sm text-slate500 dark:text-slate200">{getProfileName(profile)} · {formatSubscriberLabel(profile?.subscriberCount || 0, t("content.subscribers"))}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 px-6 py-6 md:px-8">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {metrics.map((metric) => (
                    <div key={metric.key} className="rounded-3xl bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate500 dark:text-slate200">{metric.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-black dark:text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>

                <section className="rounded-[1.75rem] bg-[#F7F7F7] px-5 py-5 dark:bg-[#1F1F1F]">
                  <div>
                    <h2 className="text-lg font-semibold text-black dark:text-white">{t("profile.livePerformanceTimeline")}</h2>
                    <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("profile.livePerformanceTimelineBody")}</p>
                  </div>

                  {chartData.length ? (
                    <div className="mt-5">
                      <AnalyticsLineChart
                        ariaLabel={t("profile.liveDashboard")}
                        data={chartData}
                        series={[
                          { key: "views", label: t("content.views"), color: "#111827" },
                          { key: "peakViewers", label: t("videoDetails.peakViewers"), color: "#f97316" },
                          { key: "engagements", label: t("videoDetails.engagementActions"), color: "#ec4899" },
                        ]}
                      />
                    </div>
                  ) : <div className="mt-4 rounded-[1.25rem] bg-white px-4 py-6 text-center text-sm text-slate600 dark:bg-[#171717] dark:text-slate200">{t("profile.noLiveDashboardTimeline")}</div>}
                </section>

                <div className="grid gap-4 xl:grid-cols-2">
                  {[{ key: "best", title: t("profile.bestSession"), video: bestSession, accent: "from-orange100 via-white to-pink-100 dark:from-[#2A2117] dark:via-[#211A15] dark:to-[#281A21]" }, { key: "reach", title: t("profile.topReach"), video: topReachSession, accent: "from-[#EEF2FF] via-white to-[#FCE7F3] dark:from-[#191E2E] dark:via-[#151515] dark:to-[#231822]" }].map((item) => (
                    <section key={item.key} className={`rounded-[1.75rem] bg-linear-to-br px-5 py-5 ${item.accent}`}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate500 dark:text-slate200">{item.title}</p>
                      {item.video ? (
                        <div className="mt-4 flex items-center gap-4">
                          <img src={getVideoThumbnail(item.video)} alt={getVideoTitle(item.video)} className="h-20 w-20 rounded-[1.25rem] object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-lg font-semibold text-black dark:text-white">{getVideoTitle(item.video)}</p>
                            <p className="mt-1 text-sm text-slate600 dark:text-slate200">{formatRelativeTime(item.video.liveEndedAt || item.video.createdAt)}</p>
                            <p className="mt-2 text-sm text-slate700 dark:text-slate200">{formatCompactNumber(item.video.liveAnalytics?.peakViewers || 0)} {t("videoDetails.peakViewers")} · {formatCompactNumber((item.video.liveLikes || item.video.liveAnalytics?.liveLikes || 0) + (item.video.liveComments || item.video.liveAnalytics?.liveComments || 0))} {t("videoDetails.engagementActions")}</p>
                          </div>
                        </div>
                      ) : <p className="mt-4 text-sm text-slate600 dark:text-slate200">{t("profile.noLiveSessions")}</p>}
                    </section>
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <section className="rounded-4xl bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-black dark:text-white">{t("profile.recentLiveSessions")}</h2>
                    <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("profile.recentLiveSessionsBody")}</p>
                  </div>
                  <span className="text-sm text-slate500 dark:text-slate200">{sessions.length}</span>
                </div>

                <div className="mt-4 space-y-3">
                  {sessions.length ? sessions.map((session) => (
                    <article key={session.id} className="rounded-3xl bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                      <div className="flex gap-3">
                        <img src={getVideoThumbnail(session)} alt={getVideoTitle(session)} className="h-16 w-16 rounded-2xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-black dark:text-white">{getVideoTitle(session)}</p>
                          <p className="mt-1 text-xs text-slate500 dark:text-slate200">{formatRelativeTime(session.liveEndedAt || session.createdAt)} · {formatSessionDuration(session.liveStartedAt, session.liveEndedAt)}</p>
                          <p className="mt-2 text-xs text-slate600 dark:text-slate200">{formatCompactNumber(session.views || 0)} {t("content.views")} · {formatCompactNumber(session.liveAnalytics?.peakViewers || 0)} {t("videoDetails.peakViewers")}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link to={buildVideoAnalyticsLink(session)} className="rounded-full bg-orange100 px-4 py-2 text-xs font-semibold text-black">{t("profile.openAnalytics")}</Link>
                        <Link to={buildVideoLink(session, { isLive: false })} className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black dark:bg-[#171717] dark:text-white">{t("videoDetails.viewRecordedVideo")}</Link>
                      </div>
                    </article>
                  )) : <div className="rounded-3xl bg-[#F7F7F7] px-4 py-8 text-center text-sm text-slate600 dark:bg-[#1F1F1F] dark:text-slate200">{t("profile.noLiveSessions")}</div>}
                </div>
              </section>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}