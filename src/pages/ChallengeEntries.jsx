import { HiMiniSquares2X2 } from "react-icons/hi2";
import HeroSection from "../components/ChallengeEntries/HeroSection";
import StatsSection from "../components/ChallengeEntries/StatsSection";
import { useState } from "react";
import EntriesSection from "../components/ChallengeEntries/EntriesSection";
import LeaderboardSection from "../components/ChallengeEntries/LeaderboardSection";
import ChallengeModal from "../components/ChallengeEntries/ChallengeModal";

function ChallengeEntries() {
  const [activeTab, setActiveTab] = useState("entries");
  const [openJoinChallengeModal, setOpenJoinChallengeModal] = useState(false);

  function handleActiveTabChange(value) {
    setActiveTab(value);
  }

  function handleJoinChallengeModal() {
    setOpenJoinChallengeModal((prev) => !prev);
  }

  return (
    <div className="bg-white dark:bg-black300 flex gap-10 flex-col pb-20 relative">
      {openJoinChallengeModal && (
        <ChallengeModal closeModal={handleJoinChallengeModal} />
      )}
      <HeroSection handleChallengeModal={handleJoinChallengeModal} />
      <StatsSection />
      <div className="px-6 flex">
        <button
          onClick={() => handleActiveTabChange("entries")}
          className={`text-sm font-bold font-inter flex gap-1.25 items-center w-1/2 justify-center cursor-pointer relative after:content-[''] after:absolute after:-bottom-4 after:w-full after:left-0 after:h-0.5 transition-all ${
            activeTab === "entries"
              ? "text-black dark:text-white after:bg-red100 hover:text-slate700 hover:dark:text-slate200 hover:after:bg-red700"
              : "text-slate250 after:bg-slate250 hover:text-slate400 hover:after:bg-slate400"
          }`}
        >
          <HiMiniSquares2X2 /> Entries
        </button>

        <button
          onClick={() => handleActiveTabChange("leaderboard")}
          className={`text-sm font-bold font-inter flex gap-1.25 items-center w-1/2 justify-center relative cursor-pointer after:content-[''] after:absolute after:-bottom-4 after:w-full after:left-0 after:h-0.5 transition-all ${
            activeTab === "leaderboard"
              ? "text-black dark:text-white after:bg-red100 hover:text-slate700 hover:dark:text-slate200 hover:after:bg-red700"
              : "text-slate250 after:bg-slate250 hover:text-slate400 hover:after:bg-slate400"
          }`}
        >
          <HiMiniSquares2X2 /> Leaderboard
        </button>
      </div>
      {activeTab === "entries" ? (
        <EntriesSection />
      ) : (
        <LeaderboardSection handleChallengeModal={handleJoinChallengeModal} />
      )}
    </div>
  );
}

export default ChallengeEntries;
