/**
 * CreatorDashboard page — creator console.
 *
 * Tabs for analytics, monetization, memberships, campaigns, sponsorships,
 * collaborations, and revenue-shares. Each tab lazy-loads via its own
 * api.* method.
 *
 * Features: 3.13-3.17, 3.21 (see PROJECT_OVERVIEW.md).
 * Backend: CreatorAnalyticsController, MonetizationController,
 * MembershipController, BrandCampaignController, SponsorshipController,
 * CollaborationController, RevenueShareController.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { HiMiniSquares2X2 } from "react-icons/hi2";
import Overview from "../components/CreatorDashboard/Overview";
import CreatorTool from "../components/CreatorDashboard/CreatorTool";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../services/api";
import { getProfileName } from "../utils/content";

function resolveGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function CreatorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState("30d");
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  const loadAnalytics = useCallback(async (nextPeriod) => {
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const response = await api.getCreatorAnalytics({ period: nextPeriod, limit: 8 });
      setAnalytics(response?.data ?? null);
    } catch (error) {
      setAnalyticsError(error instanceof ApiError ? error.message : "Failed to load analytics.");
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics(period);
  }, [loadAnalytics, period]);

  const greeting = useMemo(
    () => `${resolveGreeting()}, ${getProfileName(user, "Creator")}`,
    [user],
  );

  return (
    <section className="bg-white dark:bg-black300 p-4 md:p-6 flex flex-col gap-6 md:gap-9">
      <div className="flex flex-col gap-px font-inter">
        <span className="text-black dark:text-white text-xs">{greeting}</span>
        <h1 className="text-black dark:text-white font-bold text-xl">
          Creator Dashboard
        </h1>
      </div>
      <menu className="flex items-center overflow-hidden rounded-xl h-9 md:h-12.5 w-full">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 h-full flex items-center justify-center gap-2 font-semibold text-xs md:text-[15px] transition-all ${
            activeTab === "overview"
              ? "bg-orange100 hover:bg-orange200 text-black"
              : "bg-slate150 dark:bg-black400 hover:bg-slate200 text-slate250"
          }`}
        >
          {" "}
          <HiMiniSquares2X2 /> Overview
        </button>
        <button
          onClick={() => setActiveTab("creator-tools")}
          className={`flex-1 h-full flex items-center justify-center gap-2 font-semibold text-xs md:text-[15px] transition-all ${
            activeTab === "creator-tools"
              ? "bg-orange100 hover:bg-orange200 text-black"
              : "bg-slate150 dark:bg-black400 hover:bg-slate200 text-slate250"
          }`}
        >
          {" "}
          <HiMiniSquares2X2 /> Creator Tools
        </button>
      </menu>

      {analyticsError ? (
        <div className="text-red100 text-sm font-inter">{analyticsError}</div>
      ) : null}

      {activeTab === "overview" && (
        <Overview
          analytics={analytics}
          loading={analyticsLoading}
          period={period}
          onPeriodChange={setPeriod}
        />
      )}
      {activeTab === "creator-tools" && (
        <CreatorTool analytics={analytics} analyticsLoading={analyticsLoading} />
      )}
    </section>
  );
}

export default CreatorDashboard;
