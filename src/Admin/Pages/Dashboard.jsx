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

const stats = [
  {
    title: "Daily Active Users",
    value: "125.6M",
    date: "12.5% vs last 7 days",
  },
  { title: "New Signups", value: "7.23M", date: "12.5% vs last 7 days" },
  { title: "View Uploaded", value: "8.64M", date: "12.5% vs last 7 days" },
  { title: "Live Streams", value: "1,100", date: "12.5% vs last 7 days" },
  { title: "Watch Time", value: "1.2B hrs", date: "12.5% vs last 7 days" },
  { title: "Active Challenges", value: "100", date: "12.5% vs last 7 days" },
  { title: "Revenue", value: "80.64M", date: "12.5% vs last 7 days" },
  { title: "Creator Earning", value: "1,100", date: "12.5% vs last 7 days" },
];

function Dashboard() {
  return (
    <section className="space-y-7">
      <Stats stats={stats} />
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
