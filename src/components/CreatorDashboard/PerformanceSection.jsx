import { BsDot } from "react-icons/bs";
import WeeklyPerformance from "./WeeklyPerformance";

const stats = [
  { title: "IMPRESSIONS", value: "9.1M" },
  { title: "ENGAGEMENT", value: "672.0K" },
  { title: "CLICKS", value: "268.0K" },
  { title: "CONVERSIONS", value: "18,600" },
  { title: "ACTIVE CAMPAIGNS", value: "3" },
  { title: "TOTAL SPENT", value: "₦900,000" },
];

const topPerformance = [
  {title : 'Maya Beauty', impression : '1.4M', engagement : '95.0K', conversations : '2800'},
  {title : 'Luna Chill', impression : '1.4M', engagement : '95.0K', conversations : '2800'},
  {title : 'Alex Fit', impression : '1.4M', engagement : '95.0K', conversations : '2800'},
]

function PerformanceSection() {
  return (
    <section className="flex flex-col gap-8 font-inter">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-3.5">
        {stats.map(({ title, value }, i) => (
          <div className="p-5 border border-black/30 dark:border-white/30 rounded-xl flex flex-col gap-1">
            <h4 className="text-xs font-bold uppercase text-black dark:text-white">
              {title}
            </h4>
            <p
              className={`text-2xl font-bold ${
                i === 1
                  ? "text-orange100"
                  : i === 2
                    ? "text-blue"
                    : i === 3
                      ? "text-green100"
                      : i === 4
                        ? "text-red100"
                        : "text-black dark:text-white"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
      <WeeklyPerformance />
      <div className="flex flex-col gap-8 border border-black/30 dark:border-white/30 rounded-2xl py-5 px-7.5">
      <div className="flex items-center gap-3 justify-between">
        <h2 className="text-xl font-bold text-black dark:text-white">Creator Performance</h2>
        <button className="text-base font-semibold text-orange100">View All</button>
      </div>
      <div className="flex flex-col gap-7.5">
        {
          topPerformance.map(({title, impression, engagement, conversations}, i) => <div key={title-i} className="flex flex-col gap-1">
            <h4 className="text-base font-bold text-black dark:text-white">{title}</h4>
            <div className="flex items-center gap-1">
              <span className="text-slate700 text-[10px]">{impression} imp</span>
              <BsDot className="w-4 h-4 text-slate700"/>
              <span className="text-slate700 text-[10px]">{engagement} eng</span>
              <BsDot className="w-4 h-4 text-slate700"/>
              <span className="text-slate700 text-[10px]">{conversations} conv</span>
            </div>
          </div>)
        }
      </div>
      </div>

    </section>
  );
}

export default PerformanceSection;
