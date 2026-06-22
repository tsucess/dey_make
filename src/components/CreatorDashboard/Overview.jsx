import GrowthOverview from "./GrowthOverview";
import QuickActionOverview from "./QuickActionOverview";
import RecentVideoOverview from "./RecentVideoOverview";
import StatsOverview from "./StatsOverview";

function Overview() {
  return (
    <div className="flex flex-col gap-5">
      <StatsOverview />
      <GrowthOverview />
      <RecentVideoOverview />
      <QuickActionOverview />
    </div>
  );
}

export default Overview;
