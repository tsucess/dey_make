import { AiOutlineCopyright } from "react-icons/ai";
import { CgList } from "react-icons/cg";
import { FiAlertTriangle } from "react-icons/fi";
import { GiAlliedStar } from "react-icons/gi";
import { LuOctagonAlert } from "react-icons/lu";

const alerts = [
  {
    icon: GiAlliedStar,
    title: "Violent Content",
    color: "#FF383C",
  },
  {
    icon: CgList,
    title: "Live Streaming",
    color: "#FFFFFF",
  },
  {
    icon: FiAlertTriangle,
    title: "Notifications",
    color: "#FFCC00",
  },
  {
    icon: LuOctagonAlert,
    title: "Payments",
    color: "#FFFFFF",
  },
  {
    icon: AiOutlineCopyright,
    title: "AI Services",
    color: "#CB30E0",
  },
  {
    icon: AiOutlineCopyright,
    title: "Search Service",
    color: "#CB30E0",
  },
];

function SystemStatus() {
  return (
    <section className="bg-blue300 flex flex-col gap-7.5 p-6 rounded-2xl">
      <div className="flex items-center justify-between gap-2 font-roboto">
        <h3 className="text-white text-[22px]">System Status</h3>
        <button className="text-base text-white font-medium">View all</button>
      </div>
      <div className="flex flex-col gap-6">
        {alerts.map(({ icon: Icon, title, value, percent, color, isLow }) => (
          <div
            key={title}
            className="flex items-center justify-between gap-8 border-b border-b-white px-3.5 py-5"
          >
            <div className="flex items-center gap-5">
              <Icon className={`w-6 h-6`} style={{ color: `${color}` }} />
              <h5 className="text-xs font-medium text-white">{title}</h5>
            </div>
            <div className="flex items-center gap-4 font-roboto">
              <CgList className="w-6 h-6 text-white" />
              <span className="text-xs font-medium text-white">
                Operational
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SystemStatus;
