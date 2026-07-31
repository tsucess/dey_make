import { GoFile } from "react-icons/go";
import { HiArrowDown, HiArrowUp } from "react-icons/hi";
import { formatCompactNumber } from "../../utils/content";

const PALETTES = [
  ["#642429", "#782930", "#8B2C35", "#9E313B", "#B23641", "#C53A46", "#D93E4C", "#FF4757"],
  ["#643042", "#78384E", "#8B3F58", "#9E4764", "#B24E70", "#C5557B", "#D95D86", "#FF6B9D"],
  ["#1F5F37", "#227140", "#258248", "#289551", "#2CA75A", "#2EB963", "#32CB6C", "#38EF7D"],
  ["#64550B", "#78650A", "#8B7408", "#9E8407", "#B29406", "#C5A304", "#D9B303", "#FFD200"],
];

function percentChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function sparklineFromTrend(trend, key, bins = 8) {
  if (!Array.isArray(trend) || trend.length === 0) {
    return Array.from({ length: bins }, () => 0);
  }
  const bucketSize = Math.max(1, Math.ceil(trend.length / bins));
  const buckets = [];
  for (let i = 0; i < trend.length; i += bucketSize) {
    const slice = trend.slice(i, i + bucketSize);
    const total = slice.reduce((acc, entry) => acc + Number(entry?.[key] ?? 0), 0);
    buckets.push(total);
  }
  while (buckets.length < bins) buckets.unshift(0);
  return buckets.slice(-bins);
}

function StatsOverview({ analytics, loading }) {
  const overview = analytics?.overview ?? null;
  const trend = analytics?.trends ?? [];

  const totalViews = Number(overview?.engagement?.views ?? 0);
  const totalLikes = Number(overview?.engagement?.likes ?? 0);
  const totalShares = Number(overview?.engagement?.shares ?? 0);
  const totalComments = Number(overview?.engagement?.comments ?? 0);
  const totalSaves = Number(overview?.engagement?.saves ?? 0);
  const subscribers = Number(overview?.audience?.subscribers ?? 0);
  const newSubscribers = Number(overview?.audience?.newSubscribers ?? 0);
  const estRevenue = Number(overview?.audience?.estimatedMonthlyRevenue ?? 0);

  const engagementActions = totalLikes + totalShares + totalComments + totalSaves;
  const engagementRate = totalViews > 0 ? (engagementActions / totalViews) * 100 : 0;

  const midPoint = Math.floor(trend.length / 2);
  const recentSubs = trend.slice(midPoint).reduce((acc, entry) => acc + Number(entry?.subscribers ?? 0), 0);
  const priorSubs = trend.slice(0, midPoint).reduce((acc, entry) => acc + Number(entry?.subscribers ?? 0), 0);
  const recentRevenue = trend.slice(midPoint).reduce((acc, entry) => acc + Number(entry?.membershipRevenue ?? 0), 0);
  const priorRevenue = trend.slice(0, midPoint).reduce((acc, entry) => acc + Number(entry?.membershipRevenue ?? 0), 0);
  const recentLikes = trend.slice(midPoint).reduce((acc, entry) => acc + Number(entry?.likes ?? 0), 0);
  const priorLikes = trend.slice(0, midPoint).reduce((acc, entry) => acc + Number(entry?.likes ?? 0), 0);

  const stats = [
    {
      title: "Total Views",
      value: formatCompactNumber(totalViews),
      stat: newSubscribers,
      trendKey: "publishedVideos",
      palette: PALETTES[0],
    },
    {
      title: "Engagement Rate",
      value: `${engagementRate.toFixed(1)}%`,
      stat: percentChange(recentLikes, priorLikes),
      trendKey: "likes",
      palette: PALETTES[1],
    },
    {
      title: "Followers",
      value: formatCompactNumber(subscribers),
      stat: percentChange(recentSubs, priorSubs),
      trendKey: "subscribers",
      palette: PALETTES[2],
    },
    {
      title: "Est. Revenue",
      value: formatCompactNumber(estRevenue),
      stat: percentChange(recentRevenue, priorRevenue),
      trendKey: "membershipRevenue",
      palette: PALETTES[3],
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {stats.map(({ title, value, stat, trendKey, palette }, index) => {
        const buckets = sparklineFromTrend(trend, trendKey, palette.length);
        const maxBucket = Math.max(1, ...buckets);
        const barMinHeights = ["h-3.5 md:h-5.5", "h-6.75 md:h-8.75", "h-3.5 md:h-5.5", "h-9.5 md:h-11.5", "h-5.75 md:h-7.75", "h-9.5 md:h-11.5", "h-5.75 md:h-7.75", "h-11.75 md:h-13.75"];
        const isPositive = Number(stat) >= 0;
        const statLabel = index === 0 ? `+${newSubscribers}` : `${isPositive ? "+" : ""}${stat}%`;

        return (
          <div key={title} className="flex flex-col gap-4 md:gap-9 border border-black/20 dark:border-white/20 rounded-3xl px-5 py-7.5 bg-white300 dark:bg-black400">
            <div className="flex justify-between gap-2 items-start">
              <div className="flex flex-col gap-2 md:gap-3 items-center">
                <GoFile className="w-4 h-4 md:w-6 md:h-6 text-black300 dark:text-white" />
                <div className="flex flex-col items-center font-inter">
                  <h5 className="text-xl md:text-2xl font-bold text-black300 dark:text-white">
                    {loading ? "…" : value}
                  </h5>
                  <span className="text-black300 dark:text-white text-[10px] md;text-xs font-extralight">{title}</span>
                </div>
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-semibold p-2 rounded-md ${
                isPositive ? "bg-green200/10 dark:bg-green200 text-green300" : "bg-red100/10 text-red100"
              }`}>
                {isPositive ? <HiArrowUp className="w-3 h-3" /> : <HiArrowDown className="w-3 h-3" />} {statLabel}
              </div>
            </div>
            <div className="flex items-end gap-1">
              {palette.map((color, i) => {
                const ratio = buckets[i] / maxBucket;
                const heightClass = ratio > 0
                  ? barMinHeights[Math.min(barMinHeights.length - 1, Math.floor(ratio * (barMinHeights.length - 1)))]
                  : barMinHeights[0];
                return (
                  <div key={i} style={{ backgroundColor: color }} className={`flex-1 ${heightClass}`}></div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsOverview;
