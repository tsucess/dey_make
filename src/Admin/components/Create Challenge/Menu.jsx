import { GoArrowRight } from "react-icons/go";

const menu = [
  { title: "Basic Info", desc: "Active Challenges" },
//   { title: "Challenge Details", desc: "Define the challenge" },
  { title: "Rewards & Prize", desc: "Set rewards and budget" },
  { title: "Timeline & Rules", desc: "Set duration & rules" },
  { title: "Review & Publish", desc: "Review and launch" },
];

function Menu({ activeMenu }) {
  return (
    <menu className="flex items-center gap-3 font-inter justify-between">
      {menu.map(({ title, desc }, i) => (
        <div key={i} className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9.5 h-9.5 rounded-full flex items-center justify-center font-sm font-medium font-bricolage ${
                activeMenu === i + 1
                  ? "bg-orange100 text-slate100"
                  : "border-white border text-white"
              }`}
            >
              {i + 1}
            </div>
            <div className="md:flex flex-col gap-1 hidden">
              <h4 className="font-bricolage text-xs text-white">{title}</h4>
              <p className="text-white text-[10px] font-medium">{desc}</p>
            </div>
          </div>
          {i < menu.length - 1 && (
            <GoArrowRight className="w-5 h-5 text-white" />
          )}
        </div>
      ))}
    </menu>
  );
}

export default Menu;
