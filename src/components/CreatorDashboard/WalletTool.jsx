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
      <div className="wallet-bg px-7.5 py-12.5 rounded-4xl  flex flex-col gap-3.5 border border-white/30">
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
        <h3 className="font-semibold text-black dark:text-white font-inter">
          Recent Transactions
        </h3>
        <div className="flex flex-col gap-6">{}</div>
      </div>
    </section>
  );
}

export default WalletTool;
