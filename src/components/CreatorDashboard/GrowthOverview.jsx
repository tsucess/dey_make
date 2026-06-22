import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "../../context/ThemeContext";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler
);

export default function GrowthOverview() {
    const { isDark } = useTheme();
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Views",
        data: [55, 12, 38, 53, 88, 16],
        borderColor: "#fdb300",
        backgroundColor: "transparent",
        tension: 0.5,
        borderWidth: 1.5,
        pointRadius: 5,
        pointBackgroundColor: "#0b3440",
        pointBorderColor: "#fdb300",
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
          color: isDark
          ? "rgba(255,255,255,0.25)"
          : "rgba(0,0,0,0.15)",
          borderDash: [2, 4],
        },
      },

      y: {
        min: 0,
        max: 100,

        ticks: {
          stepSize: 20,
           color: isDark ? "#ddd" : "#333",
        },

        grid: {
          color: isDark
          ? "rgba(255,255,255,0.25)"
          : "rgba(0,0,0,0.15)",
          borderDash: [2,4],
        },
      },
    },
  };


  return (
    <div className="text-black dark:text-white rounded-xl border border-black/57 dark:border-white/57 p-5 w-full">

      {/* Header */}
      <div className="flex justify-between items-start">

        <div>
          <h2 className="font-bold text-lg">
            Growth Overview
          </h2>

          <p className="text-xs text-black dark:text-white200">
            Performance over time
          </p>
        </div>


        <div className="flex gap-2 text-sm">

          <button className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-semibold">
            7D
          </button>

          <button className="px-4">
            30D
          </button>

          <button className="px-4">
            90D
          </button>

        </div>

      </div>



      {/* Legend */}
      <div className="flex gap-3 mt-6">

        <button className="border border-gray-600 bg-red-900/40 px-4 py-1 rounded text-sm">
          <span className="text-white">●</span> Views
        </button>


        <button className="border border-gray-600 px-4 py-1 rounded text-sm">
          <span className="text-green-400">●</span> New Followers
        </button>

      </div>



      {/* Chart */}
      <div className="h-50 mt-5">
        <Line data={data} options={options}/>
      </div>



      {/* Stats */}
      <div className="grid grid-cols-3 text-center mt-4">

        <div>
          <h3 className="font-bold text-lg">
            5.4M
          </h3>

          <p className="text-xs text-black300 dark:text-slate400">
            Total Views
          </p>
        </div>


        <div>
          <h3 className="font-bold text-lg">
            1.4M
          </h3>

          <p className="text-xs text-black300 dark:text-slate400">
            Peak(Sat)
          </p>
        </div>


        <div>
          <h3 className="font-bold text-lg">
            749K
          </h3>

          <p className="text-xs text-black300 dark:text-slate400">
            Daily Avg.
          </p>
        </div>

      </div>

    </div>
  );
}