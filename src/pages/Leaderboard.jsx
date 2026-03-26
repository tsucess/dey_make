import { useEffect, useMemo, useState } from "react";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";
import { IoMdArrowDropright } from "react-icons/io";
import { api, firstError } from "../services/api";
import { formatCompactNumber, getProfileAvatar, getProfileName } from "../utils/content";

const tabs = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

function ViewsBadge({ views }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#8C8C8C] px-3 py-1 text-[11px] font-medium font-inter text-white md:text-sm dark:bg-[#555555]">
      <IoMdArrowDropright className="h-6 w-6 text-white" />
      <span>{formatCompactNumber(views)} views</span>
    </div>
  );
}

function TrendIndicator({ trend }) {
  if (trend === "steady") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate300 bg-white text-xs font-bold text-slate500 md:h-7 md:w-7 dark:border-slate500 dark:bg-[#343434] dark:text-slate200">
        •
      </span>
    );
  }

  const isUp = trend === "up";

  return (
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white md:h-7 md:w-7 ${
        isUp ? "border-green100 text-green100" : "border-red100 text-red100"
      }`}
      aria-label={isUp ? "Trending up" : "Trending down"}
    >
      {isUp ? <MdArrowDropUp className="h-5 w-5" /> : <MdArrowDropDown className="h-5 w-5" />}
    </span>
  );
}

function podiumAsset(rank) {
  if (rank === 1) {
    return { image: "/podium1.png", alt: "First place podium", widthClass: "w-[170px] sm:w-[210px] md:w-[245px]" };
  }

  if (rank === 2) {
    return { image: "/podium2.svg", alt: "Second place podium", widthClass: "w-[150px] sm:w-[185px] md:w-[215px]" };
  }

  return { image: "/podium3.svg", alt: "Third place podium", widthClass: "w-[150px] sm:w-[185px] md:w-[215px]" };
}

function PodiumCard({ item }) {
  const isWinner = item.rank === 1;
  const asset = podiumAsset(item.rank);

  return (
    <div className="flex flex-col items-center">
      <img
        src={getProfileAvatar(item.user)}
        alt={getProfileName(item.user)}
        className={`rounded-full object-cover shadow-md ${isWinner ? "h-14 w-14 md:h-18 md:w-18" : "h-12 w-12 md:h-16 md:w-16"}`}
      />
      <p className="mt-2 text-center text-base font-medium font-inter text-slate100 dark:text-white md:text-lg">
        {getProfileName(item.user)}
      </p>
      <div className="mt-1">
        <ViewsBadge views={item.score} />
      </div>
      <img src={asset.image} alt={asset.alt} className={`mt-3 h-auto max-w-full ${asset.widthClass}`} />
    </div>
  );
}

function StandingRow({ item, isLast }) {
  return (
    <div
      className={`flex items-center justify-between rounded-3xl bg-[#F3F3F3] px-4 py-4 dark:bg-[#343434] md:rounded-none md:bg-transparent md:px-0 ${
        isLast ? "" : "md:border-b md:border-black/6 md:dark:border-white/8"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <img src={getProfileAvatar(item.user)} alt={getProfileName(item.user)} className="h-10 w-10 rounded-full object-cover" />
        <div className="min-w-0">
          <span className="block truncate text-base font-medium font-inter text-slate100 dark:text-white md:text-[1.05rem]">
            {getProfileName(item.user)}
          </span>
          <span className="text-xs text-slate400 dark:text-slate200">{item.videosCount} videos</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-base font-medium font-inter text-slate100 dark:text-white">#{item.rank}</span>
        <TrendIndicator trend={item.trend} />
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [tab, setTab] = useState(tabs[0]);
  const [board, setBoard] = useState({ podium: [], standings: [], currentUserRank: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadBoard() {
      setLoading(true);
      setError("");

      try {
        const response = await api.getLeaderboard(tab.value);

        if (!ignore) {
          setBoard(response?.data || { podium: [], standings: [], currentUserRank: null });
        }
      } catch (nextError) {
        if (!ignore) {
          setError(firstError(nextError.errors, nextError.message || "Unable to load leaderboard."));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadBoard();

    return () => {
      ignore = true;
    };
  }, [tab]);

  const currentRank = useMemo(() => board.currentUserRank?.rank ?? "—", [board.currentUserRank]);

  return (
    <div className="min-h-full bg-white px-4 pb-20 pt-4 dark:bg-[#1A1A1A] md:px-8 md:pb-10 md:pt-6">
      <div className="mx-auto flex w-full max-w-245 flex-col items-center">
        <div className="w-full max-w-155 rounded-full bg-[#F2F2F2] p-2 dark:bg-[#343434]">
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((item) => {
              const isActive = tab.value === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`rounded-full px-3 py-3 text-sm font-medium font-inter transition-colors md:px-4 md:text-[1.05rem] ${
                    isActive
                      ? "bg-orange100 text-black"
                      : "text-slate100 hover:bg-white/70 dark:text-white dark:hover:bg-white/8"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? <div className="mt-6 w-full rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {loading ? (
          <div className="mt-8 w-full rounded-3xl bg-[#F3F3F3] px-6 py-12 text-center text-sm text-slate100 dark:bg-[#343434] dark:text-white">
            Loading leaderboard...
          </div>
        ) : (
          <>
            <div className="mt-8 flex w-full items-end justify-center gap-2 md:mt-10">
              {(board.podium.length ? board.podium : board.standings.slice(0, 3)).map((item) => (
                <PodiumCard key={item.userId} item={item} />
              ))}
            </div>

            <section className="mt-8 w-full overflow-hidden rounded-4xl md:rounded-2xl">
              <div className="flex items-center justify-between bg-orange100 px-6 py-5 md:px-10">
                <span className="text-base font-medium font-inter text-black md:text-lg">You Currently Rank</span>
                <div className="flex items-center gap-4">
                  <span className="text-base font-medium font-inter text-black md:text-lg">{currentRank}</span>
                  <TrendIndicator trend={board.currentUserRank?.trend || "steady"} />
                </div>
              </div>

              <div className="space-y-3 md:space-y-0 md:bg-[#F3F3F3] md:px-10 md:py-6 md:dark:bg-[#343434]">
                {board.standings.length ? (
                  board.standings.map((item, index) => (
                    <StandingRow key={item.userId} item={item} isLast={index === board.standings.length - 1} />
                  ))
                ) : (
                  <div className="rounded-3xl bg-[#F3F3F3] px-4 py-6 text-center text-sm text-slate100 dark:bg-[#343434] dark:text-white">
                    No leaderboard entries yet.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}