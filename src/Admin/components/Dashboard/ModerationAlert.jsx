import { AiOutlineCopyright } from "react-icons/ai";
import { CgList } from "react-icons/cg";
import { FiAlertTriangle } from "react-icons/fi";
import { GiAlliedStar } from "react-icons/gi";
import { LuOctagonAlert } from "react-icons/lu";

const alerts = [
  {
    icon: GiAlliedStar,
    title: "Violent Content",
    value: "1,230",
    percent: "+12%",
    color: "#FF383C",
    isLow: true,
  },
  {
    icon: CgList,
    title: "Nudity / Sexual Content",
    value: "982",
    percent: "+8%",
    color: "#FFFFFF",
    isLow: true,
  },
  {
    icon: FiAlertTriangle,
    title: "Hate Speech",
    value: "864",
    percent: "-15%",
    color: "#FFCC00",
    isLow: true,
  },
  {
    icon: LuOctagonAlert,
    title: "Spam",
    value: "2,156",
    percent: "-5%",
    color: "#FFFFFF",
    isLow: false,
  },
  {
    icon: AiOutlineCopyright,
    title: "Copyright infringement",
    value: "1,112",
    percent: "+7%",
    color: "#CB30E0",
    isLow: true,
  },
];

function ModerationAlert() {
  return (
    <section className="bg-blue300 flex flex-col gap-7.5 p-6 rounded-2xl">
      <div className="flex items-center justify-between gap-2 font-roboto">
        <h3 className="text-white text-[22px]">Moderation Alerts</h3>
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
            <div className="flex items-center gap-7.5 font-roboto">
              <span className="text-white text-xs font-medium">{value}</span>
              <span
                className={`${isLow ? "text-red100" : "text-green300"} text-xs font-medium`}
              >
                {percent}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ModerationAlert;
