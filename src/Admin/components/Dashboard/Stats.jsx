import { FaArrowUp } from "react-icons/fa";
import AnalyticsChart from "./StatsChart";

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

function Stats() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <Stat key={i} {...stat} />
      ))}
    </div>
  );
}

function Stat({ title, value, date }) {
  return (
    <div className="flex flex-col gap-3 bg-blue200 p-5 rounded-2xl">
      <div className="flex flex-col gap-1 font-roboto">
        <h5 className="text-white text-xs ">{title}</h5>
        <p className="text-white text-2xl">{value}</p>
        <div className="flex items-center gap-1 text-white text-[11px]">
          <FaArrowUp className="w-3 h-3 text-green300" />
          {date}
        </div>
      </div>
      <AnalyticsChart />
    </div>
  );
}

export default Stats;
