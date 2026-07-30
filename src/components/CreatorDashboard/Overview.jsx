import GrowthOverview from "./GrowthOverview";
import QuickActionOverview from "./QuickActionOverview";
import RecentVideoOverview from "./RecentVideoOverview";
import StatsOverview from "./StatsOverview";

function Overview({ analytics, loading, period, onPeriodChange }) {
  return (
    <div className="flex flex-col gap-5">
      <StatsOverview analytics={analytics} loading={loading} />
      <GrowthOverview analytics={analytics} loading={loading} period={period} onPeriodChange={onPeriodChange} />
      <RecentVideoOverview analytics={analytics} loading={loading} />
      <QuickActionOverview />
    </div>
  );
}

export default Overview;
