import { FaEllipsis } from "react-icons/fa6";
import { GoArrowLeft } from "react-icons/go";
import { useNavigate } from "react-router-dom";

function HeroSection() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-7 font-inter">
      <header className="h-20.75 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-7.5 h-7.5 cursor-pointer rounded-lg flex items-center justify-center border border-black/20 dark:border-white/20"
        >
          <GoArrowLeft className="w-5 h-5 text-black dark:text-white" />
        </button>
        <h1 className="text-xl font-bold text-black dark:text-white">
          Coins & Wallet
        </h1>
        <button className="w-7.5 h-7.5 cursor-pointer rounded-lg flex items-center justify-center border border-black/20 dark:border-white/20">
          <FaEllipsis className="w-5 h-5 text-black dark:text-white" />
        </button>
      </header>

      <div className="px-7.5 py-12.5 rounded-[10px] border-black/81 wallet-bg flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-orange100 text-sm">COIN BALANCE</h2>
          <h3 className="text-orange100 text-4xl font-bold">2,840</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-slate700 text-xs">Lifetime Purchased</span>
            <span className="text-white font-bold text-sm">15,200</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate700 text-xs">Gifts Sent</span>
            <span className="text-red100 font-bold text-sm">12,360</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate700 text-xs">Gift Received</span>
            <span className="text-green300 font-bold text-sm">8,920</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
