import { useEffect, useState } from "react";
import ChallengeModeration from "../components/Dashboard/ChallengeModeration";
import ContentModeration from "../components/Dashboard/ContentModeration";
import CreatorGrowth from "../components/Dashboard/CreatorGrowth";
import ModerationAlert from "../components/Dashboard/ModerationAlert";
import PlatformOverviewChart from "../components/Dashboard/PlatformOverviewChart";
import Stats from "../components/Dashboard/Stats";
import SystemStatus from "../components/Dashboard/SystemStatus";
import TopChallenge from "../components/Dashboard/TopChallenge";
import TopChallenger from "../components/Dashboard/TopChallenger";
import TopRegion from "../components/Dashboard/TopRegion";
import TrendingVideo from "../components/Dashboard/TrendingVideo";
import { api } from "../../services/api";

function formatCount(value) {
  const num = Number(value) || 0;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

function buildStats(summary = {}) {
  return [
    { title: "Total Users", value: formatCount(summary.totalUsers), date: "all time" },
    { title: "Active Users (24h)", value: formatCount(summary.activeUsers), date: "last 24h" },
    { title: "Creators", value: formatCount(summary.totalCreators), date: "all time" },
    { title: "Live Streams", value: formatCount(summary.liveVideos), date: "current" },
    { title: "Total Videos", value: formatCount(summary.totalVideos), date: "all time" },
    { title: "Open Challenges", value: formatCount(summary.openChallenges), date: "current" },
    { title: "Active Memberships", value: formatCount(summary.activeMemberships), date: "current" },
    { title: "Pending Reports", value: formatCount(summary.pendingVideoReports), date: "queue" },
  ];
}

function Dashboard() {
  const [summary, setSummary] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [recentChallenges, setRecentChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setErrorMessage("");
    api.getAdminDashboard()
      .then((response) => {
        if (cancelled) return;
        const data = response?.data || {};
        setSummary(data.summary || {});
        setRecentUsers(data.recentUsers || []);
        setRecentVideos(data.recentVideos || []);
        setRecentChallenges(data.recentChallenges || []);
      })
      .catch((err) => { if (!cancelled) setErrorMessage(err?.message || "Failed to load dashboard"); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const stats = buildStats(summary);

  return (
    <section className="space-y-7">
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red100/10 text-red100 text-sm">{errorMessage}</div>
      )} 
      <Stats stats={stats} />
      <PlatformOverviewChart />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-11">
        <div className="md:col-span-5 w-full flex flex-col gap-4">
          <ContentModeration />
          <ModerationAlert />
          <CreatorGrowth />
          <SystemStatus />
        </div>
        <div className="md:col-span-6 w-full flex flex-col gap-4">
          <ChallengeModeration challenges={recentChallenges} />
          <TopChallenge />
          <TopChallenger users={recentUsers} />
          <TopRegion />
        </div>
      </div>
      <TrendingVideo videos={recentVideos} />
      {isLoading && (
        <div className="p-3 text-center text-sm text-white/50">Loading dashboard…</div>
      )}
    </section>
  );
}

export default Dashboard;
