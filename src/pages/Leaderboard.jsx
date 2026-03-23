import { useMemo, useState } from "react";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";

const avatar =
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=120&q=80";

const leaderboardData = {
  Daily: {
    currentRank: { position: 23, trend: "up" },
    podium: [
      { rank: 2, name: "Jason Eton", views: "164.3M", image: "/podium2.svg", alt: "Second place podium", widthClass: "w-[150px] sm:w-[185px] md:w-[215px]" },
      { rank: 1, name: "Jason Eton", views: "164.3M", image: "/podium1.svg", alt: "First place podium", widthClass: "w-[170px] sm:w-[210px] md:w-[245px]" },
      { rank: 3, name: "Jason Eton", views: "164.3M", image: "/podium3.svg", alt: "Third place podium", widthClass: "w-[150px] sm:w-[185px] md:w-[215px]" },
    ],
    standings: [
      { rank: 4, name: "Jason Eton", trend: "down" },
      { rank: 5, name: "Jason Eton", trend: "up" },
      { rank: 6, name: "Jason Eton", trend: "up" },
      { rank: 7, name: "Jason Eton", trend: "down" },
      { rank: 7, name: "Jason Eton", trend: "down" },
    ],
  },
  Weekly: {
    currentRank: { position: 18, trend: "up" },
    podium: [
      { rank: 2, name: "Jason Eton", views: "142.8M", image: "/podium2.svg", alt: "Second place podium", widthClass: "w-[150px] sm:w-[185px] md:w-[215px]" },
      { rank: 1, name: "Jason Eton", views: "205.4M", image: "/podium1.svg", alt: "First place podium", widthClass: "w-[170px] sm:w-[210px] md:w-[245px]" },
      { rank: 3, name: "Jason Eton", views: "138.9M", image: "/podium3.svg", alt: "Third place podium", widthClass: "w-[150px] sm:w-[185px] md:w-[215px]" },
    ],
    standings: [
      { rank: 4, name: "Jason Eton", trend: "up" },
      { rank: 5, name: "Jason Eton", trend: "down" },
      { rank: 6, name: "Jason Eton", trend: "up" },
      { rank: 7, name: "Jason Eton", trend: "up" },
      { rank: 8, name: "Jason Eton", trend: "down" },
    ],
  },
  Monthly: {
    currentRank: { position: 12, trend: "up" },
    podium: [
      { rank: 2, name: "Jason Eton", views: "129.7M", image: "/podium2.svg", alt: "Second place podium", widthClass: "w-[150px] sm:w-[185px] md:w-[215px]" },
      { rank: 1, name: "Jason Eton", views: "244.1M", image: "/podium1.png", alt: "First place podium", widthClass: "w-[170px] sm:w-[210px] md:w-[245px]" },
      { rank: 3, name: "Jason Eton", views: "122.4M", image: "/podium3.svg", alt: "Third place podium", widthClass: "w-[150px] sm:w-[185px] md:w-[215px]" },
    ],
    standings: [
      { rank: 4, name: "Jason Eton", trend: "up" },
      { rank: 5, name: "Jason Eton", trend: "up" },
      { rank: 6, name: "Jason Eton", trend: "down" },
      { rank: 7, name: "Jason Eton", trend: "up" },
      { rank: 8, name: "Jason Eton", trend: "down" },
    ],
  },
};

const tabs = Object.keys(leaderboardData);

function ViewsBadge({ views }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#8C8C8C] px-3 py-1 text-[11px] font-medium font-inter text-white md:text-sm dark:bg-[#555555]">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 6v12l10-6-10-6Z" />
      </svg>
      <span>{views}</span>
    </div>
  );
}

function TrendIndicator({ trend }) {
  const isUp = trend === "up";

  return (
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white ${
        isUp ? "border-green100 text-green100" : "border-red100 text-red100"
      }`}
      aria-label={isUp ? "Trending up" : "Trending down"}
    >
      {isUp ? <MdArrowDropUp className="h-5 w-5" /> : <MdArrowDropDown className="h-5 w-5" />}
    </span>
  );
}

function PodiumCard({ item }) {
  const isWinner = item.rank === 1;

  return (
    <div className={`flex flex-col items-center ${isWinner ? "translate-y-0" : "translate-y-4 md:translate-y-6"}`}>
      <img
        src={avatar}
        alt={item.name}
        className={`rounded-full object-cover shadow-md ${isWinner ? "h-14 w-14 md:h-[72px] md:w-[72px]" : "h-12 w-12 md:h-16 md:w-16"}`}
      />
      <p className="mt-2 text-center text-lg font-medium font-inter text-slate100 dark:text-white md:text-[2rem]">
        {item.name}
      </p>
      <div className="mt-1">
        <ViewsBadge views={item.views} />
      </div>
      <img src={item.image} alt={item.alt} className={`mt-3 h-auto ${item.widthClass}`} />
    </div>
  );
}

function StandingRow({ item, isLast }) {
  return (
    <div
      className={`flex items-center justify-between py-4 ${
        isLast ? "" : "border-b border-black/6 dark:border-white/8"
      }`}
    >
      <div className="flex items-center gap-4">
        <img src={avatar} alt={item.name} className="h-10 w-10 rounded-full object-cover" />
        <span className="text-base font-medium font-inter text-slate100 dark:text-white md:text-[1.05rem]">
          {item.name}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xl font-medium font-inter text-slate100 dark:text-white">{item.rank}</span>
        <TrendIndicator trend={item.trend} />
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [tab, setTab] = useState("Daily");
  const currentBoard = useMemo(() => leaderboardData[tab], [tab]);

  return (
    <div className="min-h-full bg-white px-4 pb-20 pt-4 dark:bg-[#1A1A1A] md:px-8 md:pb-10 md:pt-6">
      <div className="mx-auto flex w-full max-w-[980px] flex-col items-center">
        <div className="w-full max-w-[620px] rounded-full bg-[#F2F2F2] p-2 dark:bg-[#343434]">
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((item) => {
              const isActive = tab === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`rounded-full px-4 py-3 text-sm font-medium font-inter transition-colors md:text-[1.05rem] ${
                    isActive
                      ? "bg-orange100 text-black"
                      : "text-slate100 hover:bg-white/70 dark:text-white dark:hover:bg-white/8"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex w-full items-end justify-center gap-1 overflow-x-auto pb-4 sm:gap-2 md:mt-10 md:gap-4">
          <PodiumCard item={currentBoard.podium[0]} />
          <PodiumCard item={currentBoard.podium[1]} />
          <PodiumCard item={currentBoard.podium[2]} />
        </div>

        <section className="w-full overflow-hidden rounded-[2rem] md:rounded-[2.25rem]">
          <div className="flex items-center justify-between bg-orange100 px-6 py-5 md:px-10">
            <span className="text-lg font-medium font-inter text-black md:text-[1.75rem]">
              You Currently Rank
            </span>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-medium font-inter text-black md:text-[2rem]">
                {currentBoard.currentRank.position}
              </span>
              <TrendIndicator trend={currentBoard.currentRank.trend} />
            </div>
          </div>

          <div className="bg-[#F3F3F3] px-6 py-5 dark:bg-[#343434] md:px-10 md:py-6">
            {currentBoard.standings.map((item, index) => (
              <StandingRow
                key={`${item.rank}-${index}`}
                item={item}
                isLast={index === currentBoard.standings.length - 1}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}