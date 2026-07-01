import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { IoTrophy, IoTrophyOutline, IoCheckmarkCircle } from "react-icons/io5";
import { HiOutlineSearch } from "react-icons/hi";
import { FiUsers, FiEye } from "react-icons/fi";
import { FaLightbulb } from "react-icons/fa";
import { Link } from "react-router-dom";

// Mock Data
const HERO_STATS = {
  activeNow: 5,
  prizes: "₦5,000,000",
  joined: 2,
};

const CATEGORIES = [
  "all",
  "dance",
  "food",
  "fitness",
  "music",
  "fashion",
  "photography",
];

const ACTIVE_CHALLENGES = [
  {
    id: 1,
    category: "DANCE",
    title: "Dance Off 2026",
    description:
      "Show us your best original dance moves. Best routine wins ₦1,00...",
    participants: "48.2k",
    views: "1.42M",
    prize: "₦500,000",
    daysLeft: "8 days",
    joined: false,
    image:
      "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 2,
    category: "PHOTOGRAPHY",
    title: "Golden Hour Sunset",
    description: "Capture the most stunning sunset moment. Travel, rooftop...",
    participants: "48.2k",
    views: "1.42M",
    prize: "Camera Kit",
    daysLeft: "11 days",
    joined: true,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 3,
    category: "PHOTOGRAPHY",
    title: "Cook It Up",
    description:
      "Make the most creative dish in under 60 seconds. Surprise us...",
    participants: "48.2k",
    views: "1.42M",
    prize: "₦500,000",
    daysLeft: "14 days",
    joined: false,
    image:
      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 4,
    category: "PHOTOGRAPHY",
    title: "Street Style Vybe",
    description:
      "Flaunt your personal style on the streets. Fashion forward, no...",
    participants: "48.2k",
    views: "1.42M",
    prize: "Brand Collab",
    daysLeft: "3 days left!",
    joined: false,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 5,
    category: "PHOTOGRAPHY",
    title: "Fit For 30",
    description:
      "Document your 30-day fitness transformation journey - daily...",
    participants: "48.2k",
    views: "1.42M",
    prize: "Gym + Pro",
    daysLeft: "22 days",
    joined: true,
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfe09ce1e?auto=format&fit=crop&q=80&w=600",
  },
];

const PAST_CHALLENGES = [
  {
    id: 1,
    tag: "#ComedyHour",
    title: "Comedy Hour",
    entries: "83.2k",
    prize: "₦500,000",
    image:
      "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 2,
    tag: "#MusicMashup",
    title: "Music Mashup",
    entries: "37.2k",
    prize: "Studio Session",
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 3,
    tag: "#TravelDiaries",
    title: "Travel Diaries",
    entries: "44.7k",
    prize: "₦150,000",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 4,
    tag: "#PetTalent",
    title: "Pet Talent Show",
    entries: "91.2k",
    prize: "Pet Bundle",
    image:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
  },
];

export default function Challenges() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="min-h-full bg-white font-inter dark:bg-black300 px-4 pb-24 pt-6 md:px-8 md:py-8 text-black dark:text-white">
      <div className="mx-auto w-full max-w-6xl space-y-5 md:space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-end gap-6 md:justify-between">
          <h1 className="text-2xl md:text-3xl font-bold font-bricolage">
            {t("challenges.title")}
          </h1>
          <button className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
            <IoTrophyOutline className="h-4 w-4" />
            {t("challenges.myChallenges")}
          </button>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-4xl flex items-center challenge-hero-bg h-48 md:h-56">
          {/* <img
            src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=1200"
            alt="Concert Crowd"
            className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
          /> */}
          {/* <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" /> */}

          <div className="flex w-full flex-wrap items-center gap-4 md:gap-16 p-6 md:p-8">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {HERO_STATS.activeNow}
              </p>
              <p className="text-xs md:text-sm text-slate-300 font-medium">
                {t("challenges.activeNow")}
              </p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-yellow-400">
                {HERO_STATS.prizes}
              </p>
              <p className="text-xs md:text-sm text-slate-300 font-medium">
                {t("challenges.inPrizes")}
              </p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {HERO_STATS.joined}
              </p>
              <p className="text-xs md:text-sm text-slate-300 font-medium">
                {t("challenges.joined")}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Categories */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-full bg-[#262626] px-4 py-3.5">
            <HiOutlineSearch className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder={t("challenges.searchPlaceholder")}
              className="bg-transparent text-[15px] text-white placeholder-slate-400 outline-none w-full"
            />
          </div>

          <div style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] hide-scrollbar-mobile">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-orange100 text-black"
                    : "bg-transparent text-black dark:text-white hover:bg-white300 hover:dark:bg-white/10"
                }`}
              >
                {t(`challenges.categories.${category}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Active Challenges */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange100" />
              <h2 className="text-xl font-semibold">
                {t("challenges.activeChallenges")}{" "}
                <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange100 text-xs text-black">
                  5
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-semibold">{t("challenges.swipe")}</p>
          </div>

          <div style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} className="flex gap-2 md:gap-8 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] snap-x">
            {ACTIVE_CHALLENGES.map((challenge) => (
              <div
                key={challenge.id}
                className="relative flex w-70 shrink-0 snap-start flex-col justify-end overflow-hidden rounded-3xl bg-[#1A1A1A] h-95"
              >
                <img
                  src={challenge.image}
                  alt={challenge.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black400/20 dark:from-black400 via-black300/40 dark:via-black400/80 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  {challenge.joined ? (
                    <span className="flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-[10px] font-bold text-white uppercase">
                      <IoCheckmarkCircle className="h-3 w-3" />{" "}
                      {t("challenges.joined")}
                    </span>
                  ) : (
                    <div />
                  )}
                  <span className="rounded bg-orange100 px-2 py-1 text-[10px] font-bold text-black shadow-sm">
                    {challenge.daysLeft}
                  </span>
                </div>

                <div className="relative z-10 p-5 pt-0">
                  <span className="mb-2 inline-block rounded border border-white/20 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
                    {challenge.category}
                  </span>
                  <h3 className="mb-1 text-lg font-bold text-white">
                    {challenge.title}
                  </h3>
                  <p className="mb-4 text-xs text-slate-300 line-clamp-2">
                    {challenge.description}
                  </p>

                  <div className="mb-4 flex items-center gap-4 text-xs font-medium text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <FiUsers className="h-3.5 w-3.5" />{" "}
                      {challenge.participants}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiEye className="h-3.5 w-3.5" /> {challenge.views}
                    </div>
                  </div>

                  <div className="mb-5 flex items-center gap-2 text-sm font-bold text-yellow-400">
                    <IoTrophy className="h-4 w-4" /> {challenge.prize}
                  </div>

                  <button
                    className={`w-full rounded-full py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 ${challenge.joined ? "bg-white/20 text-white backdrop-blur-md" : "bg-orange100 text-black"}`}
                  >
                    {challenge.joined
                      ? t("challenges.viewMyEntry")
                      : t("challenges.joinChallenge")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Bar */}
        <div className="flex items-center justify-between rounded-xl bg-linear-to-r from-[#3B1515] to-[#251010] border border-red-900/30 px-3 md:px-5 py-3.5">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-sm font-bold text-white">
                #DanceOff2026 {t("challenges.trendingPrefix")}
              </p>
              <p className="text-xs text-slate-400">
                1.2M {t("challenges.viewsThisWeek")}
              </p>
            </div>
          </div>
          <Link
            to="/challenge-entries"
            className="rounded bg-orange100 cursor-pointer px-4 py-1.5 text-xs font-bold text-black hover:bg-orange500"
          >
            {t("challenges.viewAction")}
          </Link>
        </div>

        {/* Past Challenges */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {t("challenges.pastChallenges")}
            </h2>
            <p className="text-xs text-slate-400">
              {t("challenges.completedCount", { count: 4 })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PAST_CHALLENGES.map((challenge) => (
              <div
                key={challenge.id}
                className="relative flex h-32 w-full overflow-hidden rounded-2xl bg-slate100 group cursor-pointer"
              >
                <img
                  src={challenge.image}
                  alt={challenge.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity group-hover:opacity-50"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black400 via-black400/60 to-transparent" />

                <div className="absolute right-3 top-3">
                  <span className="rounded border border-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                    {t("challenges.endedBadge")}
                  </span>
                </div>

                <div className="relative z-10 flex h-full flex-col justify-end p-4">
                  <p className="mb-0.5 text-xs font-bold text-red-500">
                    {challenge.tag}
                  </p>
                  <h3 className="mb-2 text-sm font-bold text-white">
                    {challenge.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] font-medium text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <FiUsers className="h-3 w-3" /> {challenge.entries}{" "}
                      {t("challenges.entriesCount")}
                    </div>
                    <div className="flex items-center gap-1.5 text-yellow-400">
                      <IoTrophy className="h-3 w-3" /> {challenge.prize}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center justify-center space-y-3 py-10 text-center">
          <FaLightbulb className="h-6 w-6 text-yellow-400" />
          <h2 className="text-xl font-bold">{t("challenges.ideaTitle")}</h2>
          <p className="text-sm text-slate-400">
            {t("challenges.ideaSubtitle")}
          </p>
          <button className="mt-2 rounded-md bg-orange100 px-6 py-3 text-sm font-semibold text-black hover:bg-orange500">
            {t("challenges.suggestAction")}
          </button>
        </div>
      </div>
    </div>
  );
}
