import { useState } from "react";
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
  Filler
);

const chartData = {
  Impressions: [56, 11, 37, 54, 87, 15],
  Engagement: [35, 48, 25, 60, 72, 40],
  Clicks: [18, 30, 20, 42, 58, 26],
};

export default function WeeklyPerformance() {
  const [activeTab, setActiveTab] = useState("Impressions");
   const {isDark} = useTheme();
   

  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        data: chartData[activeTab],
        borderColor: "#00D1FF",
        borderWidth: 2,
        tension: 0.45,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBorderWidth: 2,
        pointBackgroundColor: "#1D1D1D",
        pointBorderColor: "#39D9FF",
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
        backgroundColor: "#2A2A2A",
        borderColor: "#444",
        borderWidth: 1,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark  ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" ,
          borderDash: [3, 3],
          drawBorder: false,
        },
        ticks: {
          color: isDark ? "#ffffff" : "#000000",
          font: {
            size: 12,
          },
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: isDark ? "#ffffff" : "#000000",
        },
        grid: {
          color: isDark  ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
          borderDash: [3, 3],
          drawBorder: false,
        },
      },
    },
  };

  return (
    <div className="rounded-3xl border border-black/30 dark:border-white/30 p-6 font-inter">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          Weekly Performance
        </h2>

        <div className="flex rounded-2xl border gap-2 border-black/30 dark:border-white/30 p-2">
          {Object.keys(chartData).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-[#F8B114] text-black"
                  : "text-black dark:text-white hover:bg-slate150 dark:hover:bg-slate50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-60 relative w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}