import { FiArrowUp } from "react-icons/fi";
import { GoFile } from "react-icons/go";
import { HiArrowUp } from "react-icons/hi";

const stats = [
  {
    title: "Total Views",
    value: "14.2M",
    stat: "+42%",
    colors: [
      "#642429",
      "#782930",
      "#8B2C35",
      "#9E313B",
      "#B23641",
      "#C53A46",
      "#D93E4C",
      "#FF4757",
    ],
  },
  {
    title: "Engagement Rate",
    value: "8.7%",
    stat: "+42%",
    colors: [
      "#643042",
      "#78384E",
      "#8B3F58",
      "#9E4764",
      "#B24E70",
      "#C5557B",
      "#D95D86",
      "#FF6B9D",
    ],
  },
  {
    title: "Followers",
    value: "142.8k",
    stat: "+42%",
    colors: [
      "#1F5F37",
      "#227140",
      "#258248",
      "#289551",
      "#2CA75A",
      "#2EB963",
      "#32CB6C",
      "#38EF7D",
    ],
  },
  {
    title: "Est. Revenue",
    value: "400,000",
    stat: "+42%",
    colors: [
      "#64550B",
      "#78650A",
      "#8B7408",
      "#9E8407",
      "#B29406",
      "#C5A304",
      "#D9B303",
      "#FFD200",
    ],
  },
];

function StatsOverview() {
  return <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{
    stats.map(({title, value, stat, colors}, i) => <div key={i} className="flex flex-col gap-4 md:gap-9 border border-black/20 dark:border-white/20 rounded-3xl px-5 py-7.5 bg-white300 dark:bg-black400">
        <div className="flex justify-between gap-2 items-start">
            <div className="flex flex-col gap-2 md:gap-3 items-center">
                <GoFile className="w-4 h-4 md:w-6 md:h-6 text-black300 dark:text-white" />
                <div className="flex flex-col items-center font-inter">
                    <h5 className="text-xl md:text-2xl font-bold text-black300 dark:text-white">{value}</h5>
                    <span className="text-black300 dark:text-white text-[10px] md;text-xs font-extralight">{title}</span>
                </div>
            </div>
            <div className="flex items-center gap-0.5 bg-green200/10 dark:bg-green200 text-green300 text-xs font-semibold p-2 rounded-md"> <HiArrowUp className="w-3 h-3" /> {stat}</div>
        </div>
        <div className="flex items-end gap-1">
            {
                colors.map((color, i) => <div key={i} style={{backgroundColor : color}} className={`flex-1 ${
                 i === 0 ? 'h-3.5 md:h-5.5':
                 i === 1 ? 'h-6.75 md:h-8.75' :
                 i === 2 ? 'h-3.5 md:h-5.5' :
                 i === 3 ? 'h-9.5 md:h-11.5' :
                 i === 4 ? 'h-5.75 md:h-7.75' :
                 i === 5 ? 'h-9.5 md:h-11.5' :
                 i === 6 ? 'h-5.75 md:h-7.75' : 'h-11.75 md:h-13.75'
                }`}></div>)
            }
        </div>
    </div>)
  }</div>;
}

export default StatsOverview;
