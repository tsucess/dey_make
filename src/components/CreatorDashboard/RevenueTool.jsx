import Monetization from "./Monetization";
import MonthlyRevenueChart from "./MonthlyRevenue";
import TopSectorsChart from "./TopSectorChart";

const sectors = [
  { title: "Creator Fund", value: 1840, color: "#FF4757" },
  { title: "Brand Deals", value: 1200, color: "#FFD200" },
  { title: "Live Gifts", value: 620, color: "#FF6B9D" },
  { title: "Merch", value: 340, color: "#4FACFE" },
  { title: "Subscriptions", value: 280, color: "#38EF7D" },
];

let totalSectorValue = sectors.reduce((acc, { value }) => (acc += value), 0);

function RevenueTool() {
  return (
    <section className="flex flex-col gap-8">
      <MonthlyRevenueChart />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopSectorsChart />
        <div className="flex flex-col gap-6 border border-black/30 dark:border-white/30 rounded-2xl p-6 justify-center">
          {sectors.map(({ title, value, color }, i) => (
            <div key={title - i} className="grid grid-cols-5 gap-6">
              <span className="text-sm text-black dark:text-white font-inter font-medium col-span-2">
                {title}
              </span>
              <div className="flex items-center gap-3 flex-1 col-span-3">
                <div className="flex-1 flex justify-start">
                  <div
                    style={{ width: `${(value / totalSectorValue) * 100}%`, backgroundColor: color }}
                    className="rounded-full h-2"
                  ></div>
                </div>
                <span className="text-sm text-black dark:text-white font-inter font-medium">
                  ${value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Monetization/>
    </section>
  );
}

export default RevenueTool;
