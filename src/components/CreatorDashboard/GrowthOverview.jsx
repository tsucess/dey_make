import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
} from "chart.js";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "../../context/ThemeContext";
import { formatCompactNumber } from "../../utils/content";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
);

const PERIOD_TABS = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
];

function formatLabel(dateString, key) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  if (key === "7d") return date.toLocaleDateString(undefined, { weekday: "short" });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function GrowthOverview({ analytics, loading, period, onPeriodChange }) {
  const { isDark } = useTheme();
  const chartData = useMemo(() => {
    const trend = analytics?.trends ?? [];
    const labels = trend.map((entry) => formatLabel(entry?.date, period));
    const views = trend.map((entry) => Number(entry?.likes ?? 0) + Number(entry?.comments ?? 0) + Number(entry?.saves ?? 0));
    const followers = trend.map((entry) => Number(entry?.subscribers ?? 0));
    return { labels, views, followers };
  }, [analytics, period]);

  const totalEngagement = chartData.views.reduce((acc, value) => acc + value, 0);
  const peakEngagement = chartData.views.length ? Math.max(...chartData.views) : 0;
  const dailyAverage = chartData.views.length ? totalEngagement / chartData.views.length : 0;

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Engagement",
        data: chartData.views,
        borderColor: "#fdb300",
        backgroundColor: "transparent",
        tension: 0.5,
        borderWidth: 1.5,
        pointRadius: 4,
        pointBackgroundColor: "#0b3440",
        pointBorderColor: "#fdb300",
        pointBorderWidth: 2,
      },
      {
        label: "New Followers",
        data: chartData.followers,
        borderColor: "#38EF7D",
        backgroundColor: "transparent",
        tension: 0.5,
        borderWidth: 1.5,
        pointRadius: 4,
        pointBackgroundColor: "#0b3440",
        pointBorderColor: "#38EF7D",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        enabled: true,
      },
    },

    scales: {
      x: {
        ticks: {
          color: isDark ? "#ddd" : "#333",
        },

        grid: {
          color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)",
          borderDash: [2, 4],
        },
      },

      y: {
        min: 0,
        suggestedMax: Math.max(10, Math.ceil(peakEngagement * 1.2)),

        ticks: {
          color: isDark ? "#ddd" : "#333",
        },

        grid: {
          color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)",
          borderDash: [2, 4],
        },
      },
    },
  };

  return (
    <div className="text-black dark:text-white rounded-xl border border-black/57 dark:border-white/57 p-5 w-full">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-start">
        <div>
          <h2 className="font-bold text-lg">Growth Overview</h2>

          <p className="text-xs text-black dark:text-white200">
            Performance over time
          </p>
        </div>

        <div className="flex gap-2 text-sm">
          {PERIOD_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onPeriodChange?.(key)}
              className={`px-3 md:px-5 py-1 md:py-2 rounded-xl font-semibold transition-all ${
                period === key
                  ? "bg-yellow-400 text-black"
                  : "text-black dark:text-white hover:bg-slate150 hover:dark:bg-black500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-6">
        <span className="border border-gray-600 bg-red-900/40 px-4 py-1 rounded text-sm">
          <span className="text-white">●</span> Engagement
        </span>

        <span className="border border-gray-600 px-4 py-1 rounded text-sm">
          <span className="text-green-400">●</span> New Followers
        </span>
      </div>

      {/* Chart */}
      <div className="h-50 mt-5">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm text-slate700">Loading…</div>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 text-center mt-4">
        <div>
          <h3 className="font-bold text-base md:text-lg">{formatCompactNumber(totalEngagement)}</h3>

          <p className="text-xs text-black300 dark:text-slate400">
            Total Engagement
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base md:text-lg">{formatCompactNumber(peakEngagement)}</h3>

          <p className="text-xs text-black300 dark:text-slate400">Peak</p>
        </div>

        <div>
          <h3 className="font-bold text-base md:text-lg">{formatCompactNumber(Math.round(dailyAverage))}</h3>

          <p className="text-xs text-black300 dark:text-slate400">Daily Avg.</p>
        </div>
      </div>
    </div>
  );
}
