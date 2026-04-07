import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { FaHeart, FaRegCommentDots } from "react-icons/fa";
import { HiArrowLeft } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import AnalyticsLineChart from "../components/analytics/AnalyticsLineChart";
import { api, firstError } from "../services/api";
import {
  buildVideoLink,
  formatCompactNumber,
  formatRelativeTime,
  getProfileAvatar,
  getProfileName,
  getVideoThumbnail,
  getVideoTitle,
  isActiveLiveVideo,
} from "../utils/content";

const EMPTY_LIVE_SUMMARY = {
  topFans: [],
  topCommenters: [],
  topLikers: [],
  timeline: [],
  viewerTrend: [],
  peakMoments: [],
  retention: {
    startViewers: 0,
    endViewers: 0,
    averageViewers: 0,
    peakViewers: 0,
    retentionRate: 0,
  },
  totals: {
    likes: 0,
    comments: 0,
    engagements: 0,
    uniqueFans: 0,
  },
};

const PODIUM_ORDER = [1, 0, 2];

function formatSessionDuration(startedAt, endedAt) {
  if (!startedAt || !endedAt) return "0m";
  const totalSeconds = Math.max(0, Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatPercent(value) {
  return `${Math.max(0, Math.round(value || 0))}%`;
}

export default function PostLiveAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [video, setVideo] = useState(null);
  const [engagements, setEngagements] = useState([]);
  const [summary, setSummary] = useState(EMPTY_LIVE_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const videoResponse = await api.getVideo(id);

        if (ignore) return;

        const nextVideo = videoResponse?.data?.video || null;
        setVideo(nextVideo);

        const nextCreatorId = nextVideo?.author?.id || nextVideo?.creator?.id;
        const nextIsCreator = Boolean(nextCreatorId) && user?.id === nextCreatorId;

        if (!nextVideo || isActiveLiveVideo(nextVideo) || !nextIsCreator) {
          setEngagements([]);
          setSummary(EMPTY_LIVE_SUMMARY);
          return;
        }

        const engagementResponse = await api.getLiveEngagements(id, { limit: 24, includeSummary: true });

        if (ignore) return;

        setEngagements(engagementResponse?.data?.engagements || []);
        setSummary(engagementResponse?.data?.summary || EMPTY_LIVE_SUMMARY);
      } catch (nextError) {
        if (!ignore) setError(firstError(nextError?.errors, nextError?.message || t("videoDetails.analyticsUnavailable")));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      ignore = true;
    };
  }, [id, user?.id]);

  const creatorId = video?.author?.id || video?.creator?.id;
  const creatorProfile = video?.author || video?.creator;
  const isCreator = Boolean(creatorId) && user?.id === creatorId;
  const topFans = summary?.topFans || [];
  const topCommenters = summary?.topCommenters || [];
  const topLikers = summary?.topLikers || [];
  const timeline = summary?.timeline || [];
  const viewerTrend = summary?.viewerTrend || [];
  const peakMoments = summary?.peakMoments || [];
  const retention = summary?.retention || EMPTY_LIVE_SUMMARY.retention;
  const summaryTotals = summary?.totals || EMPTY_LIVE_SUMMARY.totals;
  const podiumFans = PODIUM_ORDER.map((index) => topFans[index]).filter(Boolean);

  const metrics = useMemo(() => ([
    { key: "views", label: t("content.views"), value: formatCompactNumber(video?.views || 0) },
    { key: "peak", label: t("videoDetails.peakViewers"), value: formatCompactNumber(video?.liveAnalytics?.peakViewers || 0) },
    { key: "likes", label: t("videoDetails.like"), value: formatCompactNumber(video?.liveLikes || video?.liveAnalytics?.liveLikes || 0) },
    { key: "comments", label: t("videoDetails.comments"), value: formatCompactNumber(video?.liveComments || video?.liveAnalytics?.liveComments || 0) },
    { key: "duration", label: t("videoDetails.sessionDuration"), value: formatSessionDuration(video?.liveStartedAt, video?.liveEndedAt) },
  ]), [t, video]);

  if (!loading && video && isActiveLiveVideo(video)) {
    return <Navigate to={buildVideoLink(video, { isLive: true })} replace />;
  }

  if (!loading && video && !isCreator) {
    return <Navigate to={buildVideoLink(video, { isLive: false })} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 dark:bg-[#121212] md:px-8 md:py-8">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-black shadow-sm dark:bg-[#1D1D1D] dark:text-white">
            <HiArrowLeft className="h-5 w-5" /> {t("videoDetails.back")}
          </button>
          <div className="flex flex-wrap gap-3">
            <Link to={buildVideoLink(video || id, { isLive: false })} className="rounded-full bg-orange100 px-5 py-3 text-sm font-semibold text-black">{t("videoDetails.viewRecordedVideo")}</Link>
            {isCreator ? <Link to="/analytics/live" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm dark:bg-[#1D1D1D] dark:text-white">{t("profile.liveDashboard")}</Link> : null}
            <Link to="/profile" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm dark:bg-[#1D1D1D] dark:text-white">{t("videoDetails.backToProfile")}</Link>
          </div>
        </div>

        {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {loading ? <div className="rounded-[2rem] bg-white p-8 text-sm text-slate600 shadow-sm dark:bg-[#171717] dark:text-slate200">{t("videoDetails.loading")}</div> : null}

        {video ? (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr),400px]">
            <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm dark:bg-[#171717]">
              <div className="relative aspect-[2.1/1] overflow-hidden bg-black">
                <img src={video.thumbnailUrl || getVideoThumbnail(video)} alt={getVideoTitle(video)} className="h-full w-full object-cover opacity-55" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 space-y-4 px-6 pb-6 text-white md:px-8">
                  <div className="inline-flex rounded-full bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em]">{t("videoDetails.postLiveAnalyticsTitle")}</div>
                  <div>
                    <h1 className="text-3xl font-semibold">{getVideoTitle(video)}</h1>
                    <p className="mt-2 max-w-3xl text-sm text-white/80 md:text-base">{t("videoDetails.postLiveAnalyticsBody")}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <img src={getProfileAvatar(creatorProfile)} alt={getProfileName(creatorProfile)} className="h-14 w-14 rounded-full object-cover ring-2 ring-white/25" />
                    <div>
                      <p className="text-lg font-medium">{getProfileName(creatorProfile)}</p>
                      <p className="text-sm text-white/70">{formatRelativeTime(video.liveEndedAt || video.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5 px-6 py-6 md:px-8">
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white">{t("videoDetails.sessionSummary")}</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {metrics.map((metric) => (
                    <div key={metric.key} className="rounded-[1.5rem] bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate500 dark:text-slate200">{metric.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-black dark:text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[1.5rem] bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate500 dark:text-slate200">{t("videoDetails.engagementActions")}</p>
                    <p className="mt-2 text-2xl font-semibold text-black dark:text-white">{formatCompactNumber(summaryTotals.engagements || 0)}</p>
                    <p className="mt-2 text-sm text-slate600 dark:text-slate200">{formatCompactNumber(summaryTotals.likes || 0)} {t("videoDetails.sentLikes")} · {formatCompactNumber(summaryTotals.comments || 0)} {t("videoDetails.comments")}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate500 dark:text-slate200">{t("videoDetails.uniqueFans")}</p>
                    <p className="mt-2 text-2xl font-semibold text-black dark:text-white">{formatCompactNumber(summaryTotals.uniqueFans || 0)}</p>
                    <p className="mt-2 text-sm text-slate600 dark:text-slate200">{t("videoDetails.recentActivity")}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate500 dark:text-slate200">{t("videoDetails.averageViewers")}</p>
                    <p className="mt-2 text-2xl font-semibold text-black dark:text-white">{formatCompactNumber(retention.averageViewers || 0)}</p>
                    <p className="mt-2 text-sm text-slate600 dark:text-slate200">{formatCompactNumber(retention.startViewers || 0)} → {formatCompactNumber(retention.endViewers || 0)} {t("videoDetails.currentViewers")}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-[#F7F7F7] px-4 py-4 dark:bg-[#1F1F1F]">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate500 dark:text-slate200">{t("videoDetails.retentionRate")}</p>
                    <p className="mt-2 text-2xl font-semibold text-black dark:text-white">{formatPercent(retention.retentionRate)}</p>
                    <p className="mt-2 text-sm text-slate600 dark:text-slate200">{formatCompactNumber(retention.peakViewers || 0)} {t("videoDetails.peakViewers")}</p>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr),400px]">
                  <section className="rounded-[1.75rem] bg-[#F7F7F7] px-5 py-5 dark:bg-[#1F1F1F]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-black dark:text-white">{t("videoDetails.topSupporters")}</h3>
                        <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("videoDetails.topFans")}</p>
                      </div>
                      <span className="text-sm text-slate500 dark:text-slate200">{topFans.length}</span>
                    </div>

                    {podiumFans.length ? (
                      <div className="mt-5 grid gap-3 md:grid-cols-3">
                        {podiumFans.map((fan, index) => {
                          const rank = PODIUM_ORDER[index] + 1;
                          const champion = rank === 1;

                          return (
                            <div key={`podium-${fan.actor?.id || fan.actor?.username}`} className={`rounded-[1.5rem] px-4 py-5 ${champion ? "bg-gradient-to-br from-orange100 via-white to-pink-100 dark:from-[#2A2117] dark:via-[#211A15] dark:to-[#281A21]" : "bg-white dark:bg-[#171717]"}`}>
                              <div className="flex items-center justify-between gap-3">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-semibold text-white dark:bg-white dark:text-black">#{rank}</span>
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate500 dark:text-slate200">{champion ? t("videoDetails.strongestMoment") : t("videoDetails.topFans")}</span>
                              </div>
                              <div className="mt-4 flex items-center gap-3">
                                <img src={getProfileAvatar(fan.actor)} alt={getProfileName(fan.actor, t("videoDetails.you"))} className="h-12 w-12 rounded-full object-cover" />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-black dark:text-white">{getProfileName(fan.actor, t("videoDetails.you"))}</p>
                                  <p className="mt-1 text-xs text-slate500 dark:text-slate200">{formatCompactNumber(fan.likesCount || 0)} {t("videoDetails.sentLikes")} · {formatCompactNumber(fan.commentsCount || 0)} {t("videoDetails.comments")}</p>
                                </div>
                              </div>
                              <div className="mt-5 rounded-[1.25rem] bg-black px-4 py-3 text-white dark:bg-[#0E0E0E]">
                                <p className="text-2xl font-semibold">{formatCompactNumber(fan.engagementCount || 0)}</p>
                                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/70">{t("videoDetails.engagementActions")}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : <div className="mt-4 rounded-[1.25rem] bg-white px-4 py-6 text-center text-sm text-slate600 dark:bg-[#171717] dark:text-slate200">{t("videoDetails.noTopFans")}</div>}

                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                      <section className="rounded-[1.5rem] bg-white px-4 py-4 dark:bg-[#171717]">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-base font-semibold text-black dark:text-white">{t("videoDetails.topLikers")}</h4>
                          <span className="text-xs text-slate500 dark:text-slate200">{topLikers.length}</span>
                        </div>
                        <div className="mt-4 space-y-3">
                          {topLikers.length ? topLikers.map((liker) => (
                            <div key={`liker-${liker.actor?.id || liker.actor?.username}`} className="flex items-center gap-3 rounded-[1.15rem] bg-[#F7F7F7] px-3 py-3 dark:bg-[#1F1F1F]">
                              <img src={getProfileAvatar(liker.actor)} alt={getProfileName(liker.actor, t("videoDetails.you"))} className="h-10 w-10 rounded-full object-cover" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-black dark:text-white">{getProfileName(liker.actor, t("videoDetails.you"))}</p>
                                <p className="mt-1 text-xs text-slate500 dark:text-slate200">{liker.lastLikedAt ? formatRelativeTime(liker.lastLikedAt) : t("videoDetails.sentLikes")}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-black dark:text-white">{formatCompactNumber(liker.likesCount || 0)}</p>
                                <p className="text-xs text-slate500 dark:text-slate200">{t("videoDetails.sentLikes")}</p>
                              </div>
                            </div>
                          )) : <div className="rounded-[1.15rem] bg-[#F7F7F7] px-4 py-6 text-center text-sm text-slate600 dark:bg-[#1F1F1F] dark:text-slate200">{t("videoDetails.noTopLikers")}</div>}
                        </div>
                      </section>

                      <section className="rounded-[1.5rem] bg-white px-4 py-4 dark:bg-[#171717]">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-base font-semibold text-black dark:text-white">{t("videoDetails.topCommenters")}</h4>
                          <span className="text-xs text-slate500 dark:text-slate200">{topCommenters.length}</span>
                        </div>
                        <div className="mt-4 space-y-3">
                          {topCommenters.length ? topCommenters.map((commenter) => (
                            <div key={`commenter-${commenter.actor?.id || commenter.actor?.username}`} className="flex items-center gap-3 rounded-[1.15rem] bg-[#F7F7F7] px-3 py-3 dark:bg-[#1F1F1F]">
                              <img src={getProfileAvatar(commenter.actor)} alt={getProfileName(commenter.actor, t("videoDetails.you"))} className="h-10 w-10 rounded-full object-cover" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-black dark:text-white">{getProfileName(commenter.actor, t("videoDetails.you"))}</p>
                                <p className="mt-1 text-xs text-slate500 dark:text-slate200">{commenter.lastCommentedAt ? formatRelativeTime(commenter.lastCommentedAt) : t("videoDetails.comments")}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-black dark:text-white">{formatCompactNumber(commenter.commentsCount || 0)}</p>
                                <p className="text-xs text-slate500 dark:text-slate200">{t("videoDetails.comments")}</p>
                              </div>
                            </div>
                          )) : <div className="rounded-[1.15rem] bg-[#F7F7F7] px-4 py-6 text-center text-sm text-slate600 dark:bg-[#1F1F1F] dark:text-slate200">{t("videoDetails.noTopCommenters")}</div>}
                        </div>
                      </section>
                    </div>
                  </section>

                  <section className="space-y-4 rounded-[1.75rem] bg-[#F7F7F7] px-5 py-5 dark:bg-[#1F1F1F]">
                    <div>
                      <h3 className="text-lg font-semibold text-black dark:text-white">{t("videoDetails.peakMoments")}</h3>
                      <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("videoDetails.peakMomentsBody")}</p>
                    </div>
                    <div className="space-y-3">
                      {peakMoments.length ? peakMoments.map((moment, index) => (
                        <div key={`${moment.startedAt}-${index}`} className="rounded-[1.25rem] bg-white px-4 py-4 dark:bg-[#171717]">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-black dark:text-white">#{index + 1}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate500 dark:text-slate200">{moment.label}</p>
                            </div>
                            <span className="rounded-full bg-orange100 px-3 py-1 text-xs font-semibold text-black dark:bg-[#2A2117] dark:text-white">{formatCompactNumber(moment.engagementCount || 0)} {t("videoDetails.engagementActions")}</span>
                          </div>
                          <p className="mt-3 text-sm text-slate600 dark:text-slate200">{formatCompactNumber(moment.likesCount || 0)} {t("videoDetails.sentLikes")} · {formatCompactNumber(moment.commentsCount || 0)} {t("videoDetails.comments")} · {formatCompactNumber(moment.viewersCount || 0)} {t("videoDetails.currentViewers")}</p>
                        </div>
                      )) : <div className="rounded-[1.25rem] bg-white px-4 py-6 text-center text-sm text-slate600 dark:bg-[#171717] dark:text-slate200">{t("videoDetails.noPeakMoments")}</div>}
                    </div>
                  </section>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr),380px]">
                  <section className="rounded-[1.75rem] bg-[#F7F7F7] px-5 py-5 dark:bg-[#1F1F1F]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-black dark:text-white">{t("videoDetails.engagementTimeline")}</h3>
                        <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("videoDetails.engagementTimelineBody")}</p>
                      </div>
                    </div>

                    {timeline.length ? (
                      <div className="mt-6">
                        <AnalyticsLineChart
                          ariaLabel={t("videoDetails.engagementTimeline")}
                          data={timeline}
                          series={[
                            { key: "engagementCount", label: t("videoDetails.engagementActions"), color: "#ec4899" },
                            { key: "viewersCount", label: t("videoDetails.currentViewers"), color: "#f97316" },
                          ]}
                        />
                      </div>
                    ) : <div className="mt-4 rounded-[1.25rem] bg-white px-4 py-6 text-center text-sm text-slate600 dark:bg-[#171717] dark:text-slate200">{t("videoDetails.noTimelineData")}</div>}
                  </section>

                  <section className="rounded-[1.75rem] bg-[#F7F7F7] px-5 py-5 dark:bg-[#1F1F1F]">
                    <div>
                      <h3 className="text-lg font-semibold text-black dark:text-white">{t("videoDetails.audienceRetention")}</h3>
                      <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("videoDetails.viewerTrend")}</p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {[
                        { key: "start", label: t("videoDetails.startViewers"), value: formatCompactNumber(retention.startViewers || 0) },
                        { key: "end", label: t("videoDetails.endViewers"), value: formatCompactNumber(retention.endViewers || 0) },
                      ].map((metric) => (
                        <div key={metric.key} className="rounded-[1.15rem] bg-white px-4 py-4 dark:bg-[#171717]">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate500 dark:text-slate200">{metric.label}</p>
                          <p className="mt-2 text-xl font-semibold text-black dark:text-white">{metric.value}</p>
                        </div>
                      ))}
                    </div>

                    {viewerTrend.length ? (
                      <div className="mt-5">
                        <AnalyticsLineChart
                          ariaLabel={t("videoDetails.viewerTrend")}
                          data={viewerTrend}
                          labelKey="label"
                          height={200}
                          series={[
                            { key: "viewersCount", label: t("videoDetails.currentViewers"), color: "#f97316" },
                          ]}
                        />
                      </div>
                    ) : <div className="mt-4 rounded-[1.25rem] bg-white px-4 py-6 text-center text-sm text-slate600 dark:bg-[#171717] dark:text-slate200">{t("videoDetails.noViewerTrend")}</div>}
                  </section>
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <section className="rounded-[2rem] bg-white p-5 shadow-sm dark:bg-[#171717] md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-black dark:text-white">{t("videoDetails.liveEngagement")}</h2>
                    <p className="mt-1 text-sm text-slate500 dark:text-slate200">{t("videoDetails.recentActivity")}</p>
                  </div>
                  <span className="text-sm text-slate500 dark:text-slate200">{engagements.length}</span>
                </div>

                <div className="mt-4 space-y-3">
                  {engagements.length ? engagements.map((item) => (
                    <article key={item.id} className="rounded-[1.5rem] bg-[#F7F7F7] px-4 py-3 dark:bg-[#1F1F1F]">
                      <div className="flex gap-3">
                        <img src={getProfileAvatar(item.actor)} alt={getProfileName(item.actor, t("videoDetails.you"))} className="h-10 w-10 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-black dark:text-white">{getProfileName(item.actor, t("videoDetails.you"))}</p>
                            <span className="text-xs text-slate500 dark:text-slate200">{formatRelativeTime(item.createdAt)}</span>
                          </div>
                          <div className="mt-1 inline-flex items-center gap-2 text-sm text-slate700 dark:text-slate200">
                            {item.type === "like" ? <FaHeart className="h-3.5 w-3.5 text-pink-500" /> : <FaRegCommentDots className="h-3.5 w-3.5 text-orange-500" />}
                            <span>{item.type === "like" ? t("videoDetails.sentLikes") : t("videoDetails.commented")}</span>
                          </div>
                          {item.body ? <p className="mt-2 text-sm leading-relaxed text-slate700 dark:text-slate200">{item.body}</p> : null}
                        </div>
                      </div>
                    </article>
                  )) : <div className="rounded-[1.5rem] bg-[#F7F7F7] px-4 py-8 text-center text-sm text-slate600 dark:bg-[#1F1F1F] dark:text-slate200">{t("videoDetails.noLiveEngagement")}</div>}
                </div>
              </section>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}