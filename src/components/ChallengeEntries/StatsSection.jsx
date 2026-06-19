import { CiFileOn } from "react-icons/ci";
import { GrTrophy } from "react-icons/gr";
import { IoMdStopwatch } from "react-icons/io";
import { LuEye } from "react-icons/lu";

const stats = [
  {
    icon: CiFileOn,
    value: "48.2k",
    name: "Entries",
  },
  {
    icon: LuEye,
    value: "142M",
    name: "Views",
  },
  {
    icon: GrTrophy,
    value: "₦500,000",
    name: "Prize",
  },
  {
    icon: IoMdStopwatch,
    value: "6",
    name: "Days Left",
  },
];

function StatsSection() {
  return (
    <section className="flex flex-col px-6 gap-5">
      <div className="border border-white/27 rounded-3xl px-6 py-5 flex items-center gap-4 justify-between">
        {stats.map(({ icon: Icon, value, name }, i) => (
          <div className="flex items-center flex-col gap-3">
            <Icon
              className={`w-6 h-6 ${i === 2 ? "text-orange100" : "text-white"}`}
            />
            <div className="flex flex-col gap-1 items-center">
              <h4
                className={`text-base font-bold font-inter ${i === 2 ? "text-orange100" : "text-white"}`}
              >
                {value}
              </h4>
              <span className="text-white text-[11px] font-inter font-extralight">
                {name}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5, 6].map((_, i) => (
            <img
              key={i}
              src="/user1.jpg"
              className={`w-6 h-6 rounded-full ${i !== 0 ? "-ml-2" : ""}`}
            />
          ))}
        </div>
        <h5 className="text-white text-xs font-inter">
          {" "}
          <span className="font-semibold text-sm">48.2k</span> others joined
        </h5>
      </div>
    </section>
  );
}

export default StatsSection;
