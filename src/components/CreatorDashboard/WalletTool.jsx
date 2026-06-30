import { BiCart } from "react-icons/bi";
import { FaBuildingColumns } from "react-icons/fa6";
import { FiGift } from "react-icons/fi";
import { IoBriefcaseOutline, IoCardOutline } from "react-icons/io5";
import { LiaCcPaypal } from "react-icons/lia";
import { LuWallet } from "react-icons/lu";
import { TbCoins } from "react-icons/tb";

const transactions = [
  {
    title: "Views Revenue",
    desc: "Dec 12",
    value: "420.50",
    isIncome: true,
    icon: TbCoins,
  },
  {
    title: "Live Gifts",
    desc: "Dec 8",
    value: "420.50",
    isIncome: true,
    icon: FiGift,
  },
  {
    title: "Withdrawal",
    desc: "Dec 5",
    value: "40.50",
    isIncome: false,
    icon: IoCardOutline,
  },
  {
    title: "Brand Deal-Nike",
    desc: "Dec 10",
    value: "420.50",
    isIncome: true,
    icon: IoBriefcaseOutline,
  },
  {
    title: "Merch Sales",
    desc: "Dec 12",
    value: "420.50",
    isIncome: true,
    icon: BiCart,
  },
  {
    title: "PayPal",
    desc: "yourname@gmail.com",
    value: "420.50",
    isIncome: true,
    icon: LiaCcPaypal,
  },
  {
    title: "Bank Transfer",
    desc: "****4291",
    value: " ",
    isIncome: true,
    icon: FaBuildingColumns,
  },
];

function WalletTool() {
  return (
    <section className="flex flex-col gap-8">
      <div className="wallet-bg px-5 md:px-7.5 py-7 md:py-12.5 rounded-4xl  flex flex-col gap-3.5 border border-white/30">
        {/* <div className="bg-black/80 dark:bg-black/80 absolute inset-0 w-full h-full z-0"></div> */}
        <div className="flex flex-col gap-1 font-inter">
          <h2 className="uppercase text-slate700 dark:text-slate700 text-sm">
            AVAILABLE BALANCE
          </h2>
          <p className="font-bold text-3xl text-white">$4280.50</p>
        </div>
        <div className="flex items-center gap-7">
          <div className="flex flex-col gap-2">
            <span className="text-slate700 text-xs">Pending</span>
            <p className="text-sm font-bold text-white">$840.20</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-slate700 text-xs">Lifetime Earned</span>
            <p className="text-sm font-bold text-white">$18,420</p>
          </div>
        </div>
        <button className="transition-all text-sm py-3 px-5 rounded-xl font-semibold flex items-center justify-center gap-3 bg-orange100 text-black hover:bg-orange200">
          {" "}
          <LuWallet className="w-5 h-5" /> Withdraw Funds
        </button>
      </div>

      <div className="flex flex-col gap-7">
        <h3 className="font-semibold text-xl md:text-2xl text-black dark:text-white font-inter">
          Recent Transactions
        </h3>
        <div className="flex flex-col gap-6">
          {transactions.map(
            ({ title, desc, value, isIncome, icon: Icon }, i) => (
              <div
                key={title - i}
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
                    {isIncome ? "+" : ""}${value}
                  </div>
                )}
              </div>
            ),
          )}
        </div>
        <button className="px-7.5 py-5 md:py-8 text-sm hover:bg-slate150 transition-all hover:dark:bg-black500 font-semibold cursor-pointer font-inter border border-black/20 dark:border-white/20 rounded-xl flex items-center justify-center gap-2 text-black dark:text-white">
          + Add Payment Method
        </button>
      </div>
    </section>
  );
}

export default WalletTool;
