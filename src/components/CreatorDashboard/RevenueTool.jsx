import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import Monetization from "./Monetization";
import MonthlyRevenueChart from "./MonthlyRevenue";
import TopSectorsChart from "./TopSectorChart";

const SECTOR_COLORS = ["#FF4757", "#FFD200", "#FF6B9D", "#4FACFE", "#38EF7D"];

function formatCurrency(amount, currency) {
  const numeric = Number(amount ?? 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 0,
    }).format(numeric);
  } catch {
    return `${currency || "NGN"} ${numeric}`;
  }
}

function RevenueTool({ analytics }) {
  const [summary, setSummary] = useState(null);
  const [tipsReceived, setTipsReceived] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      api.getMonetizationSummary().catch(() => null),
      api.getTipsReceived().catch(() => null),
      api.getReceivedMerchOrders().catch(() => null),
    ]).then(([summaryResponse, tipsResponse, ordersResponse]) => {
      if (ignore) return;
      setSummary(summaryResponse?.data?.summary ?? null);
      setTipsReceived(tipsResponse?.data?.tips ?? tipsResponse?.data ?? []);
      setReceivedOrders(ordersResponse?.data?.orders ?? []);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const currency = summary?.currency ?? "NGN";

  const sectors = useMemo(() => {
    const mrr = Number(summary?.earnings?.monthlyRecurringRevenue ?? 0);
    const totalGross = Number(summary?.earnings?.grossRevenue ?? 0) / 100;
    const tipsTotal = Array.isArray(tipsReceived)
      ? tipsReceived.reduce((acc, tip) => acc + Number(tip?.amount ?? 0), 0) / 100
      : 0;
    const merchTotal = Array.isArray(receivedOrders)
      ? receivedOrders
          .filter((order) => order?.status !== "cancelled")
          .reduce((acc, order) => acc + Number(order?.totalAmount ?? 0), 0) / 100
      : 0;
    const otherRevenue = Math.max(0, totalGross - mrr - tipsTotal - merchTotal);
    return [
      { title: "Subscriptions", value: Math.round(mrr), color: SECTOR_COLORS[0] },
      { title: "Live Gifts / Tips", value: Math.round(tipsTotal), color: SECTOR_COLORS[2] },
      { title: "Merch", value: Math.round(merchTotal), color: SECTOR_COLORS[3] },
      { title: "Creator Fund", value: Math.round(otherRevenue), color: SECTOR_COLORS[4] },
    ].filter((sector) => sector.value > 0);
  }, [summary, tipsReceived, receivedOrders]);

  const totalSectorValue = sectors.reduce((acc, { value }) => acc + value, 0) || 1;

  return (
    <section className="flex flex-col gap-8">
      <MonthlyRevenueChart analytics={analytics} summary={summary} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopSectorsChart sectors={sectors} />
        <div className="flex flex-col gap-6 border border-black/30 dark:border-white/30 rounded-2xl p-6 justify-center">
          {sectors.length === 0 ? (
            <span className="text-sm text-slate700 font-inter">No revenue recorded yet.</span>
          ) : (
            sectors.map(({ title, value, color }) => (
              <div key={title} className="grid grid-cols-5 gap-6">
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
                    {formatCurrency(value, currency)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Monetization summary={summary} />
    </section>
  );
}

export default RevenueTool;
