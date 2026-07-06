import { FaFlag } from "react-icons/fa";

const modarationStats = [
  { title: "Pending Reports", value: "84" },
  { title: "Pending Reviews", value: "19" },
  { title: "Live Stream Alerts", value: "84" },
  { title: "Comments Flagged", value: "84" },
];

function ContentModeration() {
  return (
    <div className="flex flex-col gap-6 p-6 bg-blue300 font-roboto rounded-2xl">
      <h2 className="text-[22px] text-white ">Content Moderation</h2>
      <div className="grid grid-cols-2 gap-2">
        {modarationStats.map((stat) => (
          <Stat key={stat.title} {...stat} />
        ))}
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="p-5 rounded-2xl border border-white/30 flex items-start gap-5 bg-black800">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shrink-0">
        <FaFlag className="w-6 h-6 text-black" />
      </div>
      <div className="flex flex-col gap-1 font-roboto">
        <h4 className="text-xs font-medium text-white">{title}</h4>
        <p className="text-2xl text-white">{value}</p>
        <button className="text-purple text-xs font-medium underline self-start">View all</button>
      </div>
    </div>
  );
}

export default ContentModeration;
