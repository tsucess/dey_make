import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";
import { useTheme } from "../../context/ThemeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

export default function MonthlyRevenueChart() {
  const isDark = useTheme();
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],

    datasets: [
      {
        label: "Revenue",
        data: [56, 11, 37, 54, 87, 15],

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
        max: 100,

        ticks: {
          stepSize: 20,
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

          <p className="text-black dark:text-white text-xs">Last 6 months</p>
        </div>

        <div className="text-right">
          <h2 className="text-yellow-400 text-xl font-bold">$4,280</h2>

          <p className="text-green-400 text-xs">+18.2% vs last month</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-70">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
