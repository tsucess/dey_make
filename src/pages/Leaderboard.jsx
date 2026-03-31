import { useEffect, useMemo, useState } from "react";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";
import { IoMdArrowDropright } from "react-icons/io";
import { useLanguage } from "../context/LanguageContext";
import { api, firstError } from "../services/api";
import { formatCountLabel, getProfileAvatar, getProfileName } from "../utils/content";

function getTabs(t) {
  return [
    { label: t("leaderboard.tabs.daily"), value: "daily" },
    { label: t("leaderboard.tabs.weekly"), value: "weekly" },
    { label: t("leaderboard.tabs.monthly"), value: "monthly" },
  ];
}

function ViewsBadge({ views }) {
  const { t } = useLanguage();

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-black/52 backdrop-blur-xs backdrop-brightness-90 border-y border-y-white px-3 py-1 text-[11px] font-medium font-inter text-white md:text-sm dark:bg-[#555555]">
      <IoMdArrowDropright className="h-6 w-6 text-white" />
      <span>{formatCountLabel(views, t("content.views"))}</span>
    </div>
  );
}

function TrendIndicator({ trend }) {
  const { t } = useLanguage();

  if (trend === "steady") {
    return (
      <span aria-label={t("leaderboard.steady")} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate300 bg-white text-xs font-bold text-slate500 md:h-7 md:w-7 dark:border-slate500 dark:bg-[#343434] dark:text-slate200">
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
      aria-label={isUp ? t("leaderboard.trendingUp") : t("leaderboard.trendingDown")}
    >
      {isUp ? <MdArrowDropUp className="h-5 w-5" /> : <MdArrowDropDown className="h-5 w-5" />}
    </span>
  );
}

function podiumAsset(rank) {
  if (rank === 1) {
    return { image: "/podium1.png", widthClass: "w-[170px] sm:w-[210px] md:w-[245px]" };
  }

  if (rank === 2) {
    return { image: "/podium2.svg", widthClass: "w-[150px] sm:w-[185px] md:w-[215px]" };
  }

  return { image: "/podium3.svg", widthClass: "w-[150px] sm:w-[185px] md:w-[215px]" };
}

function PodiumCard({ item }) {
  const { t } = useLanguage();
  const isWinner = item.rank === 1;
  const asset = podiumAsset(item.rank);
  const alt = {
    1: t("leaderboard.podium.first"),
    2: t("leaderboard.podium.second"),
    3: t("leaderboard.podium.third"),
  }[item.rank] || t("leaderboard.podium.third");

  return (
    <div className={`flex flex-col items-center ${item.rank === 1 ? 'order-2' : item.rank === 2 ? 'order-1' : 'order-3'}`}>
      <img
        src={getProfileAvatar(item.user)}
        alt={getProfileName(item.user)}
        className={`rounded-full object-cover shadow-md ${isWinner ? "h-12 w-12 md:h-16 md:w-16" : "h-11 w-11 md:h-15 md:w-15"}`}
      />
      <p className="mt-2 text-center text-base font-medium font-inter text-slate100 dark:text-white md:text-lg">
        {getProfileName(item.user)}
      </p>
      <div className="mt-1">
        <ViewsBadge views={item.score} />
      </div>
      <img src={asset.image} alt={alt} className={`mt-3 h-auto max-w-full ${asset.widthClass}`} />
    </div>
  );
}

function StandingRow({ item, isLast }) {
  const { t } = useLanguage();

  return (
    <div
      className={`flex items-center justify-between rounded-3xl px-4 py-4 dark:md:bg-[#343434] md:rounded-none md:bg-transparent md:px-0 ${
        isLast ? "" : "md:border-b md:border-black/6 md:dark:border-white/8"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <img src={getProfileAvatar(item.user)} alt={getProfileName(item.user)} className="h-10 w-10 rounded-full object-cover" />
        <div className="min-w-0">
          <span className="block truncate text-base font-medium font-inter text-slate100 dark:text-white md:text-[1.05rem]">
            {getProfileName(item.user)}
          </span>
          <span className="text-xs text-slate400 dark:text-slate200">{t("leaderboard.videosCount", { count: item.videosCount })}</span>
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
  const { t } = useLanguage();
  const tabs = useMemo(() => getTabs(t), [t]);
  const [tab, setTab] = useState("daily");
  const [board, setBoard] = useState({ podium: [], standings: [], currentUserRank: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadBoard() {
      setLoading(true);
      setError("");

      try {
        const response = await api.getLeaderboard(tab);

        if (!ignore) {
          setBoard(response?.data || { podium: [], standings: [], currentUserRank: null });
        }
      } catch (nextError) {
        if (!ignore) {
          setError(firstError(nextError.errors, nextError.message || t("leaderboard.unableToLoad")));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadBoard();

    return () => {
      ignore = true;
    };
  }, [t, tab]);

  const currentRank = useMemo(() => board.currentUserRank?.rank ?? "—", [board.currentUserRank]);

  return (
    <div className="min-h-full bg-white px-4 pb-20 pt-4 dark:bg-slate100 md:px-8 md:pb-10 md:pt-6">
      <div className="mx-auto flex w-full max-w-245 flex-col items-center">
        <div className="w-full max-w-155 rounded-full bg-white200 p-2 dark:bg-black100">
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((item) => {
              const isActive = tab === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTab(item.value)}
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
            {t("leaderboard.loading")}
          </div>
        ) : (
          <>
            <div className="mt-8 flex w-full items-end justify-center gap-2 md:mt-10">
              {(board.podium.length ? board.podium : board.standings.slice(0, 3)).map((item) => (
                <PodiumCard key={item.userId} item={item} />
              ))}
            </div>

            <section className="mt-6 md:mt-0 w-full md:overflow-hidden md:rounded-4xl">
              <div className="flex items-center justify-between bg-orange100 rounded-full md:rounded-none px-6 py-5 md:px-10">
                <span className="text-base font-medium font-inter text-black md:text-lg">{t("leaderboard.currentRank")}</span>
                <div className="flex items-center gap-4">
                  <span className="text-base font-medium font-inter text-black md:text-lg">{currentRank}</span>
                  <TrendIndicator trend={board.currentUserRank?.trend || "steady"} />
                </div>
              </div>

              <div className=" bg-white dark:bg-transparent md:bg-[#F3F3F3] md:px-10 md:py-6 md:dark:bg-[#343434]">
                {board.standings.length ? (
                  board.standings.map((item, index) => (
                    <StandingRow key={item.userId} item={item} isLast={index === board.standings.length - 1} />
                  ))
                ) : (
                  <div className="rounded-3xl bg-[#F3F3F3] px-4 py-6 text-center text-sm text-slate100 dark:bg-[#343434] dark:text-white">
                    {t("leaderboard.noEntries")}
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