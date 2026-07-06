import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

const labels = ["May 10", "May 11", "May 12", "May 13", "May 13", "May 14"];

const data = {
  labels,
  datasets: [
    {
      label: "This week",
      data: [49, 35, 80, 56, 39, 44],
      borderColor: "#FF1739",
      backgroundColor: "#FF1739",
      pointBackgroundColor: "#FF1739",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      pointRadius: 5,
      borderWidth: 2,
      tension: 0.45,
    },
    {
      label: "Last week",
      data: [42, 91, 85, 83, 64, 91],
      borderColor: "#D89433",
      backgroundColor: "#D89433",
      pointBackgroundColor: "#D89433",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      pointRadius: 5,
      borderWidth: 2,
      tension: 0.45,
    },
    {
      label: "4 weeks ago",
      data: [26, 57, 57, 71, 13, 95],
      borderColor: "#5D74FF",
      backgroundColor: "#5D74FF",
      pointBackgroundColor: "#5D74FF",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      pointRadius: 5,
      borderWidth: 2,
      tension: 0.45,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,

  interaction: {
    intersect: false,
    mode: "index",
  },

  plugins: {
    legend: {
      position: "bottom",

      labels: {
        color: "#D1D5DB",
        usePointStyle: true,
        pointStyle: "circle",
        padding: 20,
        boxWidth: 8,
        boxHeight: 8,
        font: {
          size: 13,
        },
      },
    },

    tooltip: {
      backgroundColor: "#111827",
      borderColor: "#374151",
      borderWidth: 1,
      titleColor: "#fff",
      bodyColor: "#fff",
      displayColors: true,
    },
  },

  scales: {
    x: {
      grid: {
        color: "rgba(255,255,255,.35)",
        borderDash: [3, 3],
        drawBorder: false,
      },

      ticks: {
        color: "#D1D5DB",
      },

      border: {
        color: "#6B7280",
      },
    },

    y: {
      min: 0,
      max: 100,

      ticks: {
        stepSize: 20,
        color: "#D1D5DB",
      },

      grid: {
        color: "rgba(255,255,255,.35)",
        borderDash: [3, 3],
        drawBorder: false,
      },

      border: {
        color: "#6B7280",
      },
    },
  },
};

export default function PlatformOverviewChart() {
  return (
    <div className="border border-white/76 rounded-3xl p-5 w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-dmSans font-medium text-white">
          Platform Overview
        </h3>

        <select className=" border border-zinc100 rounded-lg py-1.5 px-3 text-sm text-white">
          <option>Month</option>
          <option>Week</option>
          <option>Year</option>
        </select>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-4"
      >
        <button className="text-white text-sm pb-2 border-b-2 border-red100 font-medium">
          DAU
        </button>

        <button className="text-sm text-zinc50 pb-2">MAU</button>

        <button className="text-sm text-zinc50 pb-2">Watch Time</button>

        <button className="text-sm text-zinc50 pb-2">New Signups</button>
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
