import { FaArrowUp } from "react-icons/fa";
import AnalyticsChart from "./StatsChart";



function Stats( {stats, large}) {
  return (
    <div className={`grid grid-cols-4 gap-3 ${large ? 'grid-cols-5' : 'grid-cols-4'}`}>
      {stats.map((stat, i) => (
        <Stat key={i} {...stat} />
      ))}
    </div>
  );
}

function Stat({ title, value, date, color }) {
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
      <AnalyticsChart borderColor={color} />
    </div>
  );
}

export default Stats;
