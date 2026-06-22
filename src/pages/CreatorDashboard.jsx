import { useState } from "react";
import { HiMiniSquares2X2 } from "react-icons/hi2";
import Overview from "../components/CreatorDashboard/Overview";
import CreatorTool from "../components/CreatorDashboard/CreatorTool";

function CreatorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  function handleActiveTab(value) {
    setActiveTab(value);
  }

  return (
    <section className="bg-white dark:bg-black300 p-6 flex flex-col gap-9">
      <div className="flex flex-col gap-px font-inter">
        <span className="text-black dark:text-white text-xs">
          Good evening, Steve Stone
        </span>
        <h1 className="text-black dark:text-white font-bold text-xl">
          Creator Dashboard
        </h1>
      </div>
      <menu className="flex items-center overflow-hidden rounded-xl h-12.5 w-full">
        <button
          onClick={() => handleActiveTab("overview")}
          className={`flex-1 h-full flex items-center justify-center gap-2 font-semibold text-[15px] transition-all ${
            activeTab === "overview"
              ? "bg-orange100 hover:bg-orange200 text-black"
              : "bg-slate150 dark:bg-black400 hover:bg-slate200 text-slate250"
          }`}
        >
          {" "}
          <HiMiniSquares2X2 /> Overview
        </button>
        <button
          onClick={() => handleActiveTab("creator-tools")}
          className={`flex-1 h-full flex items-center justify-center gap-2 font-semibold text-[15px] transition-all ${
            activeTab === "creator-tools"
              ? "bg-orange100 hover:bg-orange200 text-black"
              : "bg-slate150 dark:bg-black400 hover:bg-slate200 text-slate250"
          }`}
        >
          {" "}
          <HiMiniSquares2X2 /> Creator Tools
        </button>
      </menu>

      {activeTab === "overview" && <Overview />}
      {activeTab === 'creator-tools' && <CreatorTool/>}
    </section>
  );
}

export default CreatorDashboard;
