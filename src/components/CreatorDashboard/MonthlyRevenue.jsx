import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "../../context/ThemeContext";
import { formatCompactNumber } from "../../utils/content";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

function bucketByMonth(trend) {
  if (!Array.isArray(trend) || trend.length === 0) return { labels: [], data: [] };
  const buckets = new Map();
  trend.forEach((entry) => {
    if (!entry?.date) return;
    const date = new Date(entry.date);
    if (Number.isNaN(date.getTime())) return;
    const label = date.toLocaleDateString(undefined, { month: "short" });
    buckets.set(label, (buckets.get(label) ?? 0) + Number(entry.membershipRevenue ?? 0));
  });
  return {
    labels: Array.from(buckets.keys()),
    data: Array.from(buckets.values()),
  };
}

export default function MonthlyRevenueChart({ analytics, summary }) {
  const { isDark } = useTheme();
  const currency = summary?.currency ?? "NGN";

  const { labels, data: seriesData } = useMemo(() => bucketByMonth(analytics?.trends ?? []), [analytics]);
  const totalRevenue = seriesData.reduce((acc, value) => acc + value, 0);
  const mid = Math.floor(seriesData.length / 2);
  const recentHalf = seriesData.slice(mid).reduce((acc, value) => acc + value, 0);
  const priorHalf = seriesData.slice(0, mid).reduce((acc, value) => acc + value, 0);
  const percentChange = priorHalf === 0
    ? (recentHalf > 0 ? 100 : 0)
    : Math.round(((recentHalf - priorHalf) / priorHalf) * 100);

  const suggestedMax = Math.max(10, Math.ceil(Math.max(...seriesData, 0) * 1.2));

  const data = {
    labels,

    datasets: [
      {
        label: "Revenue",
        data: seriesData,

        borderColor: "#00b8d9",
        backgroundColor: "rgba(0, 184, 217, 0.15)",

        borderWidth: 2,

        pointRadius: 5,
        pointBackgroundColor: "#0b1f25",
        pointBorderColor: "#00b8d9",
        pointBorderWidth: 3,

        tension: 0.45,

        fill: false,
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
        grid: {
          color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)",
          borderDash: [2, 2],
        },

        ticks: {
          color: isDark ? "#ddd" : "#333",
          font: {
            size: 11,
          },
        },
      },

      y: {
        min: 0,
        suggestedMax,

        ticks: {
          color: isDark ? "#ddd" : "#333",
          font: {
            size: 11,
          },
        },

        grid: {
          color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)",
          borderDash: [2, 2],
        },
      },
    },
  };

  return (
    <div className=" text-black dark:text-white rounded-xl border border-black/57 dark:border-white/57 py-10 px-5">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-black dark:text-white text-lg font-bold">
            Monthly Revenue
          </h2>

          <p className="text-black dark:text-white text-xs">Analytics period</p>
        </div>

        <div className="text-right">
          <h2 className="text-yellow-400 text-xl font-bold">
            {currency} {formatCompactNumber(totalRevenue)}
          </h2>

          <p className={`text-xs ${percentChange >= 0 ? "text-green-400" : "text-red-400"}`}>
            {percentChange >= 0 ? "+" : ""}{percentChange}% vs previous half
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-70">
        {seriesData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-slate700">No membership revenue yet.</div>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
}
