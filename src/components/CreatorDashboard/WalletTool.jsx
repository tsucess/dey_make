import { useEffect, useMemo, useState } from "react";
import { BiCart } from "react-icons/bi";
import { FaBuildingColumns } from "react-icons/fa6";
import { FiGift } from "react-icons/fi";
import { IoBriefcaseOutline, IoCardOutline } from "react-icons/io5";
import { LiaCcPaypal } from "react-icons/lia";
import { LuWallet } from "react-icons/lu";
import { TbCoins } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../../services/api";
import { formatRelativeTime } from "../../utils/content";

function iconForTransaction(transaction) {
  const type = (transaction?.type ?? "").toLowerCase();
  if (type.includes("payout") || type.includes("withdraw")) return IoCardOutline;
  if (type.includes("tip") || type.includes("gift")) return FiGift;
  if (type.includes("merch")) return BiCart;
  if (type.includes("brand") || type.includes("campaign")) return IoBriefcaseOutline;
  return TbCoins;
}

function titleForTransaction(transaction) {
  const raw = (transaction?.type ?? "").toString();
  if (transaction?.description) return transaction.description;
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase()) || "Transaction";
}

function formatAmount(amount, currency) {
  const numericAmount = Number(amount ?? 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${(currency || "NGN")} ${numericAmount.toFixed(2)}`;
  }
}

function WalletTool() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    Promise.all([
      api.getMonetizationSummary().catch(() => null),
      api.getPayoutAccount().catch(() => null),
      api.getMonetizationTransactions({ perPage: 8 }).catch(() => null),
    ])
      .then(([summaryResponse, accountResponse, transactionsResponse]) => {
        if (ignore) return;
        setSummary(summaryResponse?.data?.summary ?? null);
        setAccount(accountResponse?.data?.account ?? null);
        setTransactions(transactionsResponse?.data?.transactions ?? []);
      })
      .catch((wrapped) => {
        if (ignore) return;
        setError(wrapped instanceof ApiError ? wrapped.message : "Failed to load wallet.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const currency = summary?.currency ?? "NGN";
  const availableBalance = Number(summary?.earnings?.availableBalance ?? 0);
  const pendingPayouts = Number(summary?.earnings?.pendingPayouts ?? 0);
  const grossRevenue = Number(summary?.earnings?.grossRevenue ?? 0);

  const paymentMethods = useMemo(() => {
    if (!account) return [];
    const provider = (account.provider || "").toLowerCase();
    return [
      {
        title: provider === "paypal" ? "PayPal" : provider === "stripe" ? "Stripe" : "Bank Transfer",
        desc: account.accountMask || account.accountName || account.bankName || "Connected",
        value: " ",
        isIncome: true,
        icon: provider === "paypal" ? LiaCcPaypal : FaBuildingColumns,
      },
    ];
  }, [account]);

  const displayRows = [
    ...transactions.map((transaction) => ({
      key: `tx-${transaction.id}`,
      title: titleForTransaction(transaction),
      desc: transaction.occurredAt ? formatRelativeTime(transaction.occurredAt) : "",
      value: formatAmount(transaction.amount, transaction.currency),
      isIncome: transaction.direction === "credit",
      icon: iconForTransaction(transaction),
    })),
    ...paymentMethods.map((method, index) => ({
      ...method,
      key: `pm-${index}`,
    })),
  ];

  return (
    <section className="flex flex-col gap-8">
      <div className="wallet-bg px-5 md:px-7.5 py-7 md:py-12.5 rounded-4xl  flex flex-col gap-3.5 border border-white/30">
        <div className="flex flex-col gap-1 font-inter">
          <h2 className="uppercase text-slate700 dark:text-slate700 text-sm">
            AVAILABLE BALANCE
          </h2>
          <p className="font-bold text-3xl text-white">
            {loading ? "…" : formatAmount(availableBalance, currency)}
          </p>
        </div>
        <div className="flex items-center gap-7">
          <div className="flex flex-col gap-2">
            <span className="text-slate700 text-xs">Pending</span>
            <p className="text-sm font-bold text-white">{formatAmount(pendingPayouts, currency)}</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-slate700 text-xs">Lifetime Earned</span>
            <p className="text-sm font-bold text-white">{formatAmount(grossRevenue, currency)}</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/coins-wallet")}
          className="transition-all text-sm py-3 px-5 rounded-xl font-semibold flex items-center justify-center gap-3 bg-orange100 text-black hover:bg-orange200"
        >
          {" "}
          <LuWallet className="w-5 h-5" /> Withdraw Funds
        </button>
      </div>

      {error && <div className="text-red100 text-sm font-inter">{error}</div>}

      <div className="flex flex-col gap-7">
        <h3 className="font-semibold text-xl md:text-2xl text-black dark:text-white font-inter">
          Recent Transactions
        </h3>
        <div className="flex flex-col gap-6">
          {loading && displayRows.length === 0 ? (
            <div className="text-sm text-slate700 font-inter">Loading transactions…</div>
          ) : displayRows.length === 0 ? (
            <div className="text-sm text-slate700 font-inter">No transactions yet.</div>
          ) : (
            displayRows.map(({ key, title, desc, value, isIncome, icon: Icon }, i) => (
              <div
                key={key}
                className="px-5 md:px-7.5 py-3 md:py-5 hover:bg-slate150 transition-all hover:dark:bg-black500 flex items-center justify-between gap-2 font-inter rounded-xl border border-black/30 dark:border-white/30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 flex items-center justify-center border border-black/20 dark:border-white/20 rounded-xl ${
                      i === 0
                        ? "bg-green300/10 text-green300"
                        : i === 6
                          ? "bg-slate750/5 dark:bg-slate750 text-slate500"
                          : i === 2
                            ? "bg-black500/5 dark:bg-black500 text-red400"
                            : i === 3
                              ? "bg-orange100/10 text-orange100"
                              : i === 4
                                ? "text-cyan bg-cyan100/10"
                                : "bg-black500/5 dark:bg-black500 text-red700"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h6 className="font-bold text-base text-black300 dark:text-white">
                      {title}
                    </h6>
                    <span className="text-xs text-slate250 dark:text-slate700">
                      {desc}
                    </span>
                  </div>
                </div>

                {value.trim() && (
                  <div
                    className={`px-2 py-1 text-sm font-bold rounded ${
                      isIncome
                        ? "bg-green300/20 dark:bg-green200 text-green300"
                        : "bg-red100/10 text-red100"
                    }`}
                  >
                    {isIncome ? "+" : ""}{value}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <button
          onClick={() => navigate("/coins-wallet")}
          className="px-7.5 py-5 md:py-8 text-sm hover:bg-slate150 transition-all hover:dark:bg-black500 font-semibold cursor-pointer font-inter border border-black/20 dark:border-white/20 rounded-xl flex items-center justify-center gap-2 text-black dark:text-white"
        >
          + Add Payment Method
        </button>
      </div>
    </section>
  );
}

export default WalletTool;
