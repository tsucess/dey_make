import { useNavigate } from "react-router-dom";
import { useState } from "react";
import VideoCard from "../components/VideoCard";
import CategoryCard from "../components/CategoryCard";
import { FaEye } from "react-icons/fa";

const videos = [
  {
    id: 1,
    title: "GRWM to code",
    author: "Jason Eton",
    tags: ["English", "Yoruba"],
    live: false,
    thumb:
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&q=80",
  },
  {
    id: 2,
    title: "GRWM to code",
    author: "Jason Eton",
    tags: ["English", "Yoruba"],
    live: false,
    thumb:
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&q=80",
  },
  {
    id: 3,
    title: "GRWM to code",
    author: "Jason Eton",
    tags: ["English", "Yoruba"],
    live: false,
    thumb:
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&q=80",
  },
  {
    id: 4,
    title: "GRWM to code",
    author: "Jason Eton",
    tags: ["English", "Yoruba"],
    live: false,
    thumb:
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&q=80",
  },
  {
    id: 5,
    title: "GRWM to code",
    author: "Jason Eton",
    tags: ["English", "Yoruba"],
    live: false,
    thumb:
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&q=80",
  },
  {
    id: 6,
    title: "GRWM to code",
    author: "Jason Eton",
    tags: ["English", "Yoruba"],
    live: false,
    thumb:
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&q=80",
  },
];

const categories = [
  {
    id: 1,
    label: "Popular",
    subs: "22k Subscribers",
    thumb:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&q=80",
  },
  {
    id: 2,
    label: "Design",
    subs: "22k Subscribers",
    thumb:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&q=80",
  },
  {
    id: 3,
    label: "AI",
    subs: "22k Subscribers",
    thumb:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=300&q=80",
  },
  {
    id: 4,
    label: "LLM",
    subs: "22k Subscribers",
    thumb:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&q=80",
  },
  {
    id: 5,
    label: "Web3",
    subs: "22k Subscribers",
    thumb:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300&q=80",
  },
  {
    id: 6,
    label: "Coding",
    subs: "22k Subscribers",
    thumb:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&q=80",
  },
  {
    id: 7,
    label: "Blockchain",
    subs: "22k Subscribers",
    thumb:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300&q=80",
  },
];

/* ── Show More Divider ── */
function ShowMoreDivider() {
  return (
    <div className="flex items-center gap-3 mt-4 w-full">
      <div className="flex-1 h-[0.88px] bg-slate500 dark:bg-gray-700" />
      <button
        className="flex items-center gap-1 text-sm
                         text-black font-inter font-medium dark:text-gray-400
                         bg-transparent border-none cursor-pointer
                         whitespace-nowrap px-1"
      >
        Show more
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div className="flex-1 h-[0.88px] bg-slate500 dark:bg-gray-700" />
    </div>
  );
}

/* ── Mobile Video Card ── */
function MobileVideoCard({
  id,
  thumb,
  title,
  author,
  live,
  horizontal,
  cardWidth,
}) {
  const navigate = useNavigate();
  const avatar =
    "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&q=80";

  if (horizontal) {
    return (
      <div
        onClick={() => navigate(`/video/${id}`)}
        className="flex flex-col gap-3 cursor-pointer w-full"
      >
        {/* Thumbnail */}
        <div
          className="relative shrink-0 w-full h-50
                        rounded-xl overflow-hidden
                        bg-gray-200 dark:bg-[#2d2d2d]"
        >
          <img src={thumb} alt={title} className="w-full h-full object-cover" />
          {/* {live && (
            <span
              className="absolute top-1 left-1 bg-red-500 text-white
                             text-[0.55rem] font-bold px-1.5 py-0.5 rounded"
            >
              LIVE
            </span>
          )} */}
        </div>

        {/* Info */}
        <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center ">
          {/* <p
            className="text-sm font-semibold line-clamp-2 leading-snug
                        text-gray-900 dark:text-white"
          >
            {title}
          </p> */}
          <img src={avatar} alt="" className="w-8 h-8 rounded-full"/>
          <div>
            <p className="text-xs mt-1 text-black200 font-inter dark:text-gray-400">
            {author}
          </p>
          <p className="text-[10px] font-inter text-slate50 dark:text-gray-500">
            22k Subscribers
          </p>
          </div>
          
        </div>

        {/* More button */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-black dark:text-gray-500
                     shrink-0 self-start mt-1
                     bg-transparent border-none cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/video/${id}`)}
      className="flex flex-col cursor-pointer shrink-0"
      style={{ width: cardWidth || "200px" }}
    >
      {/* Thumbnail */}
      <div
        className="relative w-35 aspect-video h-38 rounded-xl overflow-hidden
                      bg-gray-200 dark:bg-[#2d2d2d]"
      >
        <img src={thumb} alt={title} className="w-full h-full object-cover" />
        {live && (
          <span
            className="absolute top-2 right-2 bg-white/40 backdrop-blur-xs backdrop-brightness-50 text-black200
                           text-[0.6rem] font-bold px-2 py-0.5 rounded flex gap-1 items-center"
          >
            <FaEye className="text-black200 text-5 h-5"/> 2.5k
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex gap-2 mt-2 flex-col">
         <p
            className="text-sm font-medium line-clamp-2 leading-snug
                        text-black font-inter dark:text-white"
          >
            {title}
          </p>
        <div className="min-w-0 flex-1 flex justify-between items-center">
         <div className="flex gap-1 items-center">
          <img
          src={avatar}
          alt={author}
          className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
        />
        <div className="flex flex-1 flex-col">
          <p className="text-xs mt-0.5 text-black font-inter font-medium dark:text-gray-400">
            {author}
          </p>
          {live ? (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[0.65rem] text-red-500 font-medium">
                Live
              </span>
            </div>
          ) : <p className="text-[10px] font-inter text-slate50 dark:text-gray-500">
            22k Subscribers
          </p>}
          </div>
</div>
          <button
          onClick={(e) => e.stopPropagation()}
          className="text-black dark:text-gray-500
                     shrink-0 self-start mt-1
                     bg-transparent border-none cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function Homepage() {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="w-full min-h-screen bg-white dark:bg-slate100">
      {/* ══════════════════════════════
          MOBILE LAYOUT
      ══════════════════════════════ */}
      <div className="flex flex-col md:hidden px-4 py-4">
        {/* Trending header */}
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-base font-bricolage font-medium
                         text-black dark:text-white"
          >
            Trending
          </h2>
          <button
            className="flex items-center gap-0.5 text-xs
                             text-black font-inter font-medium dark:text-gray-400
                             bg-transparent border-none cursor-pointer"
          >
            View more
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Trending scroll */}
        <div
          className="flex gap-3 overflow-x-auto pb-2
                        -mx-4 px-4 scrollbar-hide"
        >
          {videos.slice(0, 4).map((v) => (
            <MobileVideoCard key={v.id} {...v} cardWidth="140px" />
          ))}
        </div>

        {/* Categories header */}
        <div className="flex items-center justify-between mt-5 mb-3">
          <h2
            className="text-base font-medium
                         text-slate100 font-inter dark:text-white"
          >
            Categories you'd like
          </h2>
          <button
            className="flex items-center gap-0.5 text-xs
                             text-slate100 font-inter font-medium dark:text-gray-400
                             bg-transparent border-none cursor-pointer"
          >
            View more
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Category pills */}
        <div
          className="flex gap-2 overflow-x-auto pb-2
                        -mx-4 px-4 scrollbar-hide"
        >
          {categories.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(i)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm
                          font-semibold  cursor-pointer
                          transition-all duration-150
                          ${
                            activeCategory === i
                              ? "bg-orange100 text-slate100 border-[#f5a623]"
                              : "bg-white300 dark:bg-[#1e1e1e] text-slate100 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                          }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Featured card */}
        {/* <div
          className="mt-4 rounded-2xl overflow-hidden cursor-pointer
                        bg-white dark:bg-[#1e1e1e]
                        shadow-sm dark:shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
        >
          <div className="relative w-full aspect-video">
            <img
              src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=80"
              alt="featured"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&q=80"
                alt="author"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p
                  className="text-sm font-semibold
                              text-gray-900 dark:text-white"
                >
                  Jason Eton
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  22k Subscribers
                </p>
              </div>
            </div>
            <button
              className="text-gray-400 dark:text-gray-500
                               bg-transparent border-none cursor-pointer"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </div>
        </div> */}

        {/* More videos list */}
        <div className="mt-5 flex flex-col gap-4">
          {videos.slice(0, 4).map((v) => (
            <MobileVideoCard key={v.id} {...v} horizontal />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════
          DESKTOP LAYOUT
      ══════════════════════════════ */}
      <div className="hidden md:block px-6 py-5 w-full">
        {/* Trending */}
        <section className="mb-8">
          <h2
            className="text-lg font-bricolage font-bold mb-4
                         text-black dark:text-white"
          >
            Trending
          </h2>
          <div
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                          gap-4 w-full"
          >
            {videos.map((v) => (
              <VideoCard key={v.id} {...v} />
            ))}
          </div>
          <ShowMoreDivider />
        </section>

        {/* Categories */}
        <section className="mb-8">
          <h2
            className="text-lg font-bold mb-4
                         text-black font-bricolage dark:text-white"
          >
            Categories we think you'll like
          </h2>
          <div
            className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6
                          gap-3 w-full"
          >
            {categories.map((c) => (
              <CategoryCard key={c.id} {...c} />
            ))}
          </div>
          <ShowMoreDivider />
        </section>

        {/* Live streams */}
        <section className="mb-8">
          <h2
            className="text-lg font-bold mb-4
                         text-black font-bricolage dark:text-white"
          >
            Live streams
          </h2>
          <div
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                          gap-4 w-full"
          >
            {videos.map((v) => (
              <VideoCard key={v.id} {...v} live />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
