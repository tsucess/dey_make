import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

import { Doughnut } from "react-chartjs-2";
import { useTheme } from "../../context/ThemeContext";

ChartJS.register(ArcElement, Tooltip);

// center text plugin
const centerTextPlugin = {
  id: "centerText",

  afterDraw(chart, args, options) {
    const { ctx } = chart;

    const meta = chart.getDatasetMeta(0);

    const arc = meta.data[0];

    if (!arc) return;

    const x = arc.x;
    const y = arc.y;

    const innerRadius = arc.innerRadius;

    ctx.save();

    // cutout outline
    ctx.beginPath();

    ctx.arc(x, y, innerRadius, 0, Math.PI * 2);

    ctx.strokeStyle = "#ffffff";

    ctx.lineWidth = 6;

    ctx.stroke();

    // main number
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = options.textColor;

    ctx.font = "bold 28px Arial";

    ctx.fillText(options.mainLabel ?? "0", x, y - 10);

    // subtitle

    ctx.fillStyle = options.subTextColor;

    ctx.font = "14px Arial";

    ctx.fillText(options.subLabel ?? "Sources", x, y + 20);

    ctx.restore();
  },
};

export default function TopSectorsChart({ sectors: sectorsProp }) {
  const { isDark } = useTheme();
  const sectors = (sectorsProp ?? []).map((sector) => ({
    name: sector.title ?? sector.name,
    value: Number(sector.value ?? 0),
    color: sector.color,
  }));
  const total = sectors.reduce((acc, sector) => acc + sector.value, 0);
  const percentages = sectors.map((sector) => (total > 0 ? Math.round((sector.value / total) * 100) : 0));
  const chartSectors = sectors.length > 0
    ? sectors
    : [{ name: "No revenue", value: 1, color: "#4a4a4a" }];

  const data = {
    labels: chartSectors.map((item) => item.name),

    datasets: [
      {
        data: chartSectors.map((item) => item.value),

        backgroundColor: chartSectors.map((item) => item.color),

        borderWidth: 0,

        hoverOffset: 4,
      },
    ],
  };

  const options = {
    cutout: "60%",
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div
      className="
      rounded-2xl
      border border-black/30
      dark:border-white/30
      p-6
      text-black dark:text-white
      w-full
      flex flex-col gap-7
    "
    >
      <h2 className="text-black dark:text-white text-base font-medium">
        REVENUE BY SOURCE
      </h2>

      <div
        className="
        flex
        flex-col
        items-center
        gap-10
      "
      >
        {/* Doughnut */}

        <div
          className="
          w-55
          h-55
        "
        >
          <Doughnut
            data={data}
            options={{
              ...options,

              plugins: {
                ...options.plugins,

                centerText: {
                  textColor: isDark ? "#ffffff" : "#000000",

                  subTextColor: isDark ? "#dddddd" : "#555555",

                  mainLabel: total > 0 ? new Intl.NumberFormat().format(total) : "0",

                  subLabel: total > 0 ? "Total" : "No data",
                },
              },
            }}
            plugins={[centerTextPlugin]}
          />
        </div>

        {/* Legend */}

        <div
          className="
          flex
          w-full
          flex-col
          gap-4
          flex-1
        "
        >
          {sectors.length === 0 ? (
            <span className="text-sm text-slate700 text-center">No revenue sources yet.</span>
          ) : (
            sectors.map((item, index) => (
              <div
                key={item.name}
                className="
                  flex
                  font-light
                  items-center
                  justify-between
                  text-lg
                "
              >
                <div
                  className="
                  flex
                  items-center
                  gap-1
                "
                >
                  <span
                    className="
                      w-4
                      h-4
                      rounded-full

                    "
                    style={{
                      background: item.color,
                    }}
                  />

                  <span className="text-black dark:text-white text-sm font-medium">
                    {item.name}
                  </span>
                </div>

                <span className="text-black dark:text-white text-sm font-medium">
                  {percentages[index]}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
