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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);



const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      displayColors: false,
      backgroundColor: "#1E293B",
    },
  },
  scales: {
    x: {
      display: false,
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
    y: {
      display: false,
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      suggestedMin: 0,
      suggestedMax: 80,
    },
  },
  elements: {
    line: {
      capBezierPoints: true,
    },
  },
};

export default function AnalyticsChart({borderColor = "#C23BFF"}) {
  const data = {
  labels: Array.from({ length: 14 }, (_, i) => i + 1),
  datasets: [
    {
      data: [18, 22, 38, 27, 42, 33, 30, 40, 65, 25, 25, 25, 42, 27, 18],
      borderColor,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.2,
      fill: false,
    },
  ],
};
  return (
    <div
      style={{
        width: "100%",
        height: "50px",
      }}
    >
      <Line data={data} options={options} />
    </div>
  );
}