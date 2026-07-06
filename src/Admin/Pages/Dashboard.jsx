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

function Dashboard() {
  return (
    <section className="space-y-7">
      <Stats />
      <PlatformOverviewChart />
      <div className="grid gap-4 grid-cols-11">
        <div className="col-span-5 w-full flex flex-col gap-4">
          <ContentModeration />
          <ModerationAlert />
          <CreatorGrowth />
          <SystemStatus />
        </div>
        <div className="col-span-6 w-full flex flex-col gap-4">
          <ChallengeModeration />
          <TopChallenge />
          <TopChallenger />
          <TopRegion />
        </div>
      </div>
      <TrendingVideo />
    </section>
  );
}

export default Dashboard;
