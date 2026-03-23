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

function ShowMoreDivider() {
  return (
    <div className="mt-4 flex w-full items-center gap-3">
      <div className="h-[0.88px] flex-1 bg-slate500 dark:bg-gray-700" />
      <button className="flex items-center gap-1 whitespace-nowrap px-1 text-sm font-medium font-inter text-black dark:text-gray-400">
        Show more
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div className="h-[0.88px] flex-1 bg-slate500 dark:bg-gray-700" />
    </div>
  );
}

function MobileSectionHeader({ title }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[1.05rem] font-semibold font-inter text-slate100 dark:text-white">
        {title}
      </h2>
      <button type="button" className="flex items-center gap-1 text-sm font-medium font-inter text-slate100 dark:text-white">
        View more
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

function MoreButton() {
  return (
    <button
      type="button"
      className="cursor-pointer border-none bg-transparent text-black dark:text-gray-400"
      onClick={(e) => e.stopPropagation()}
      aria-label="More options"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    </button>
  );
}

function MobileTrendingCard({ id, thumb, title, author, showViews }) {
  const navigate = useNavigate();
  const avatar =
    "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&q=80";

  return (
    <div
      onClick={() => navigate(`/video/${id}`)}
      className="flex w-[168px] shrink-0 cursor-pointer flex-col"
    >
      <div className="relative aspect-[0.88] w-full overflow-hidden rounded-[1.75rem] bg-gray-200 dark:bg-[#2d2d2d]">
        <img src={thumb} alt={title} className="h-full w-full object-cover" />
        {showViews ? (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-[0.7rem] font-medium text-white backdrop-blur-md">
            <FaEye className="h-3.5 w-3.5" />
            2.5k
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-col gap-2">
        <p className="line-clamp-2 text-[0.95rem] font-medium leading-snug font-inter text-black dark:text-white">
          {title}
        </p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <img src={avatar} alt={author} className="h-8 w-8 shrink-0 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium font-inter text-black dark:text-white">{author}</p>
              <p className="text-[11px] font-inter text-[#8E8E8E]">22k Subscribers</p>
            </div>
          </div>
          <MoreButton />
        </div>
      </div>
    </div>
  );
}

function MobileFeaturedCard({ id, thumb, author }) {
  const navigate = useNavigate();
  const avatar =
    "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&q=80";

  return (
    <article className="cursor-pointer" onClick={() => navigate(`/video/${id}`)}>
      <div className="aspect-[1.18] overflow-hidden rounded-[2rem] bg-gray-200 dark:bg-[#2d2d2d]">
        <img src={thumb} alt={author} className="h-full w-full object-cover" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img src={avatar} alt={author} className="h-10 w-10 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="truncate text-[1.05rem] font-medium font-inter text-black dark:text-white">{author}</p>
            <p className="text-sm font-inter text-[#8E8E8E]">22k Subscribers</p>
          </div>
        </div>
        <MoreButton />
      </div>
    </article>
  );
}

export default function Homepage() {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="min-h-full w-full bg-white dark:bg-slate100">
      <div className="flex flex-col px-4 pb-24 pt-2 md:hidden">
        <MobileSectionHeader title="Trending" />

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {videos.slice(0, 3).map((video, index) => (
            <MobileTrendingCard key={video.id} {...video} showViews={index === 0} />
          ))}
        </div>

        <div className="mt-8">
          <MobileSectionHeader title="Categories you'd like" />
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {categories.map((category, index) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(index)}
                className={`shrink-0 rounded-full px-5 py-3 text-[0.95rem] font-medium font-inter transition-colors ${
                  activeCategory === index
                    ? "bg-orange100 text-black"
                    : "bg-[#F3F3F3] text-slate100 dark:bg-[#2A2A2A] dark:text-white"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-7">
          {videos.slice(0, 2).map((video) => (
            <MobileFeaturedCard key={video.id} id={video.id} thumb={video.thumb} author={video.author} />
          ))}
        </div>
      </div>

      <div className="hidden w-full px-6 py-5 md:block">
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold font-bricolage text-black dark:text-white">
            Trending
          </h2>
          <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video.id} {...video} />
            ))}
          </div>
          <ShowMoreDivider />
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold font-bricolage text-black dark:text-white">
            Categories we think you'll like
          </h2>
          <div className="grid w-full grid-cols-3 gap-3 lg:grid-cols-4 xl:grid-cols-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} {...category} />
            ))}
          </div>
          <ShowMoreDivider />
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold font-bricolage text-black dark:text-white">
            Live streams
          </h2>
          <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video.id} {...video} live />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
