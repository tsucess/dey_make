import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api, ApiError } from "../../services/api";
import ProductSection from "./ProductSection";
import SetupSection from "./SetupSection";

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

function MerchTool() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payoutAccountReady, setPayoutAccountReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return undefined;
    let ignore = false;
    setLoading(true);
    Promise.all([
      api.getUserMerch(user.id).catch(() => null),
      api.getReceivedMerchOrders().catch(() => null),
      api.getPayoutAccount().catch(() => null),
    ])
      .then(([productsResponse, ordersResponse, accountResponse]) => {
        if (ignore) return;
        setProducts(productsResponse?.data?.products ?? []);
        setOrders(ordersResponse?.data?.orders ?? []);
        setPayoutAccountReady(Boolean(accountResponse?.data?.account));
      })
      .catch((wrapped) => {
        if (ignore) return;
        setError(wrapped instanceof ApiError ? wrapped.message : "Failed to load merch.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [user?.id]);

  const totals = useMemo(() => {
    const paidOrders = orders.filter((order) => order?.status !== "cancelled");
    const totalSalesAmount = paidOrders.reduce((acc, order) => acc + Number(order?.totalAmount ?? 0), 0);
    const currency = paidOrders[0]?.currency || products[0]?.currency || "NGN";
    return { totalSalesAmount, currency };
  }, [orders, products]);

  const isLive = products.some((product) => product?.status === "active");

  return (
    <div className="flex flex-col gap-9">
      <div className="px-5 py-7.5 bg-white300 rounded-2xl dark:bg-black600 flex items-center justify-between gap-2">
        <div className="flex gap-5.5 divide-x divide-black dark:divide-white items-center">
          <div className="flex flex-col gap-1.25 pr-5">
            <span className="text-[10px] text-black dark:text-white">
              Total Sales
            </span>
            <h2 className="text-base font-bold text-black dark:text-white">
              {loading ? "…" : formatCurrency(totals.totalSalesAmount, totals.currency)}
            </h2>
          </div>
          <div className="flex flex-col gap-1.25">
            <span className="text-[10px] text-black dark:text-white">
              Products
            </span>
            <h2 className="text-base font-bold text-black dark:text-white">
              {products.length}
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-3 items-center">
          <div
            className={`w-16 h-7 p-0.5 rounded-full flex items-center ${isLive ? "bg-red100 justify-end" : "bg-slate850/10 dark:bg-slate850/30 justify-start"}`}
          >
            <span className="w-10 h-6 rounded-full bg-white200"></span>
          </div>
          <span className="text-[10px] text-black dark:text-white">Live</span>
        </div>
      </div>

      {error ? <div className="text-red100 text-sm font-inter">{error}</div> : null}

      <ProductSection products={products} orders={orders} loading={loading} />

      <SetupSection
        payoutAccountReady={payoutAccountReady}
        hasProducts={products.length > 0}
        hasLiveProducts={isLive}
        user={user}
      />
    </div>
  );
}

export default MerchTool;
