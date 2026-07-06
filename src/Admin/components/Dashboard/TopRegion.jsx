import { AiOutlineCopyright } from "react-icons/ai";
import { CgList } from "react-icons/cg";
import { FaUserPlus } from "react-icons/fa";
import { FaNairaSign } from "react-icons/fa6";
import { FiAlertTriangle } from "react-icons/fi";
import { GiAlliedStar } from "react-icons/gi";
import { LuOctagonAlert } from "react-icons/lu";
import { RiVerifiedBadgeLine } from "react-icons/ri";

const alerts = [
  {
    icon: FaUserPlus,
    title: "Nigeria",
    value: "1,230",
    percent: "+3.6%",
    color: "#FFFFFF",
    isLow: false,
  },
  {
    icon: RiVerifiedBadgeLine,
    title: "Ghana",
    value: "982",
    percent: "+8%",
    color: "#FFFFFF",
    isLow: false,
  },
  {
    icon: FaNairaSign,
    title: "Cameroon",
    value: "5.2M",
    percent: "+18.4%",
    color: "#FFCC00",
    isLow: false,
  },
  {
    icon: AiOutlineCopyright,
    title: "Benin",
    value: "2.1M",
    percent: "+16.7%",
    color: "#CB30E0",
    isLow: false,
  },
];

function TopRegion() {
  return (
    <section className="bg-blue300 flex flex-col gap-7.5 p-6 rounded-2xl">
      <div className="flex items-center justify-between gap-2 font-roboto">
        <h3 className="text-white text-[22px]">Top Regions by DAU</h3>
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

export default TopRegion;
