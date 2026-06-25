import { useState } from "react";
import { AiOutlineFileSearch } from "react-icons/ai";
import { FiGift } from "react-icons/fi";
import { GiTwoCoins } from "react-icons/gi";
import CoinsSection from "./CoinsSection";
import HistoryTab from "./HistoryTab";
import GiftTab from "./GiftTab";

function CoinTabSection() {
  const [activeTab, setActiveTab] = useState("coins");

  function handleActiveTabChange(tab) {
    setActiveTab(tab);
  }
  return (
    <div className="flex flex-col gap-8">
      <menu className="flex items-center">
        <button
          onClick={() => handleActiveTabChange("coins")}
          className={` flex-1 pb-4 border-b-2 cursor-pointer flex items-center justify-center gap-2 font-semibold transition-all ${
            activeTab === "coins"
              ? "border-b-orange100 hover:border-b-orange200 text-orange100 hover:text-orange200"
              : "text-slate250 border-b-slate500 hover:text-slate750 hover:dark:text-slate150 hover:border-b-slate400 hover:dark:border-b-slate200"
          }`}
        >
          <GiTwoCoins /> Buy Coins
        </button>
        <button
          onClick={() => handleActiveTabChange("history")}
          className={` flex-1 pb-4 border-b-2 cursor-pointer flex items-center justify-center gap-2 font-semibold transition-all ${
            activeTab === "history"
              ? "border-b-orange100 hover:border-b-orange200 text-orange100 hover:text-orange200"
              : "text-slate250 border-b-slate500 hover:text-slate750 hover:dark:text-slate150 hover:border-b-slate400 hover:dark:border-b-slate200"
          }`}
        >
          <AiOutlineFileSearch /> History
        </button>
        <button
          onClick={() => handleActiveTabChange("gift")}
          className={` flex-1 pb-4 border-b-2 cursor-pointer flex items-center justify-center gap-2 font-semibold transition-all ${
            activeTab === "gift"
              ? "border-b-orange100 hover:border-b-orange200 text-orange100 hover:text-orange200"
              : "text-slate250 border-b-slate500 hover:text-slate750 hover:dark:text-slate150 hover:border-b-slate400 hover:dark:border-b-slate200"
          }`}
        >
          <FiGift /> Gift Stats
        </button>
      </menu>

      {activeTab === "coins" && <CoinsSection />}
      {activeTab === "history" && <HistoryTab />}
      {activeTab === "gift" && <GiftTab />}
    </div>
  );
}

export default CoinTabSection;
