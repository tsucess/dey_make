import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import { MdArrowForwardIos } from "react-icons/md";
import CategoryCard from "../components/CategoryCard";
import VideoCard from "../components/VideoCard";
import { useLanguage } from "../context/LanguageContext";
import { api, firstError } from "../services/api";
import {
  buildVideoLink,
  filterActiveLiveVideos,
  formatCompactNumber,
  formatSubscriberLabel,
  getCategoryThumbnail,
  getProfileAvatar,
  getProfileName,
  getVideoThumbnail,
  getVideoTitle,
  mapVideoToCardProps,
} from "../utils/content";
import SectionState from "../components/Layout/SectionState";

const ALL_CATEGORY_ID = "all";

function ViewMoreBtn({ label }) {
  return <button type="button" className="flex items-center font-medium text-sm text-black200 dark:text-white font-inter gap-1.5">
    {label} <MdArrowForwardIos />
  </button>
}

function ShowMoreDivider({ label }) {
  return (
    <div className="mt-4 flex w-full items-center gap-3">
      <div className="h-px flex-1 bg-slate500" />
      <div className="flex items-center gap-1">
      <span className="px-1 text-sm font-medium font-inter text-black dark:text-white">
        {label}
      </span>
      <MdKeyboardArrowDown  className="text-black dark:text-white w-4 h-4"/>
      </div>
      <div className="h-px flex-1 bg-slate500" />
    </div>
  );
}

function MobileSectionHeader({ title }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-2xl font-semibold font-bricolage text-slate100 dark:text-white">
          {title}
        </h2>
      </div>
    </div>
  );
}

function MoreButton({ ariaLabel }) {
  return (
    <button
      type="button"
      onClick={(event) => event.stopPropagation()}
      className="cursor-pointer border-none bg-transparent text-black dark:text-gray-400"
      aria-label={ariaLabel}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    </button>
  );
}

function MobileTrendingCard({ video, showViews }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const creator = video.author || video.creator;
  const title = getVideoTitle(video);

  return (
    <div onClick={() => navigate(buildVideoLink(video))} className="flex w-42 shrink-0 cursor-pointer flex-col">
      <div className="relative aspect-[0.88] w-full overflow-hidden rounded-[1.75rem] bg-gray-200 dark:bg-[#2d2d2d]">
        <img src={getVideoThumbnail(video)} alt={getVideoTitle(video)} className="h-full w-full object-cover" />
        {showViews ? (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/45 backdrop-blur-xl px-2.5 py-1 text-xs font-inter font-medium text-black200">
            <FaEye className="h-3.5 w-3.5" />
            {formatCompactNumber(video.views || 0)}
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-col gap-2">
        <p className="line-clamp-2 text-base font-medium leading-snug font-inter text-black dark:text-white">
          {title.length > 15 ? title.slice(0,15)+'...' : title}
        </p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <img src={getProfileAvatar(creator)} alt={getProfileName(creator)} className="h-8 w-8 shrink-0 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium font-inter text-black capitalize dark:text-white">
                {getProfileName(creator)}
              </p>
              <p className="text-xs font-inter text-slate400 dark:slate700">
                {formatSubscriberLabel(creator?.subscriberCount || 0)}
              </p>
            </div>
          </div>
          <MoreButton ariaLabel={t("homepage.moreOptions")} />
        </div>
      </div>
    </div>
  );
}

function MobileFeaturedCard({ video }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const creator = video.author || video.creator;

  return (
    <article className="cursor-pointer" onClick={() => navigate(buildVideoLink(video))}>
      <div className=" h-60 w-full overflow-hidden rounded-4xl bg-gray-200 dark:bg-[#2d2d2d]">
        <img src={getVideoThumbnail(video)} alt={getVideoTitle(video)} className="h-full w-full " />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img src={getProfileAvatar(creator)} alt={getProfileName(creator)} className="h-10 w-10 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="truncate text-[1.05rem] font-medium font-inter text-black capitalize dark:text-white">
              {getProfileName(creator)}
            </p>
            <p className="text-sm font-inter text-slate400 dark:text-slate700">
              {formatSubscriberLabel(creator?.subscriberCount || 0)}
            </p>
          </div>
        </div>
        <MoreButton ariaLabel={t("homepage.moreOptions")} />
      </div>
    </article>
  );
}

export default function Homepage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const allCategory = useMemo(() => ({ id: ALL_CATEGORY_ID, slug: ALL_CATEGORY_ID, label: t("homepage.allCategory") }), [t]);
  const [categories, setCategories] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [liveVideos, setLiveVideos] = useState([]);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY_ID);
  const [loading, setLoading] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [error, setError] = useState("");
  const categoryOptions = useMemo(() => [allCategory, ...categories], [allCategory, categories]);

  const selectedCategory = useMemo(
    () => categoryOptions.find((category) => category.slug === activeCategory) || allCategory,
    [activeCategory, allCategory, categoryOptions],
  );

  function openLivePage() {
    navigate("/live");
  }


  useEffect(() => {
    let ignore = false;

    async function loadHomepage() {
      setLoading(true);
      setError("");

      try {
        const [homeResponse, trendingResponse, liveResponse] = await Promise.all([
          api.getHome(),
          api.getTrendingVideos(),
          api.getLiveVideos(),
        ]);

        if (ignore) return;

        const homeData = homeResponse?.data || {};
        setCategories(homeData.categories || []);
        setTrendingVideos(trendingResponse?.data?.videos || homeData.trending || []);
        setLiveVideos(filterActiveLiveVideos(liveResponse?.data?.videos ?? homeData.liveStreams ?? []));
      } catch (nextError) {
        if (!ignore) {
          setError(firstError(nextError.errors, nextError.message || t("homepage.unableToLoad")));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadHomepage();

    return () => {
      ignore = true;
    };
  }, [t]);

  useEffect(() => {
    let ignore = false;

    async function loadCategoryFeed() {
      setLoadingFeed(true);

      try {
        const response = await api.getVideos(activeCategory === ALL_CATEGORY_ID ? undefined : activeCategory);

        if (!ignore) {
          setFeaturedVideos(response?.data?.videos || []);
        }
      } catch (nextError) {
        if (!ignore) {
          setError(firstError(nextError.errors, nextError.message || t("homepage.unableToLoadCategory")));
        }
      } finally {
        if (!ignore) setLoadingFeed(false);
      }
    }

    loadCategoryFeed();

    return () => {
      ignore = true;
    };
  }, [activeCategory, t]);

  return (
    <div className="min-h-full w-full bg-white dark:bg-slate100">
      <div className="flex flex-col px-4 pb-24 pt-2 md:hidden">
        {error ? <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

<div className="flex justify-between items-center mb-6">
  <MobileSectionHeader title={t("homepage.trending")} />
  <ViewMoreBtn label={t("homepage.viewMore")} />
</div>
        
        {loading ? (
          <SectionState message={t("homepage.loadingTrendingVideos")} loading />
        ) : trendingVideos.length ? (
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {trendingVideos.slice(0, 6).map((video, index) => (
              <MobileTrendingCard key={video.id} video={video} showViews={index < 2} />
            ))}
          </div>
        ) : (
          <SectionState message={t("homepage.noTrendingVideos")} />
        )}

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
  <MobileSectionHeader title={t("homepage.categoriesYouWouldLike")} />
  <ViewMoreBtn label={t("homepage.viewMore")} />
</div>
          
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {categoryOptions.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.slug)}
                className={`shrink-0 rounded-full px-5 py-3 text-sm font-medium font-inter transition-colors ${
                  activeCategory === category.slug
                    ? "bg-orange100 text-black200"
                    : "bg-white300 text-slate100 dark:bg-black100 dark:text-slate200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-7">
          {loadingFeed ? (
            <SectionState message={t("homepage.loadingCategoryVideos")} loading />
          ) : featuredVideos.length ? (
            featuredVideos.slice(0, 3).map((video) => <MobileFeaturedCard key={video.id} video={video} />)
          ) : (
            <SectionState message={t("homepage.noVideosInCategory", { category: selectedCategory.label.toLowerCase() })} />
          )}
        </div>

        <div className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <MobileSectionHeader title={t("homepage.liveStreams")} />
            <button
              type="button"
              onClick={openLivePage}
              className="flex items-center gap-1.5 text-sm font-medium text-black200 dark:text-white"
            >
              {t("livePage.browseLive")} <MdArrowForwardIos />
            </button>
          </div>

          {loading ? (
            <SectionState message={t("homepage.loadingLiveStreams")} loading />
          ) : liveVideos.length ? (
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {liveVideos.slice(0, 6).map((video) => (
                <MobileTrendingCard key={video.id} video={video} showViews={false} />
              ))}
            </div>
          ) : (
            <SectionState message={t("homepage.noLiveStreamsActive")} />
          )}
        </div>
      </div>

      <div className="hidden w-full px-6 py-5 md:block">
        {error ? <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <section className="mb-8 space-y-4">
          <h2 className="text-lg md:text-2xl font-medium font-bricolage text-black dark:text-white">{t("homepage.trending")}</h2>
          {loading ? (
            <SectionState message={t("homepage.loadingTrendingVideos")} loading />
          ) : trendingVideos.length ? (
            <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {trendingVideos.slice(0, 12).map((video) => (
                <VideoCard key={video.id} {...mapVideoToCardProps(video)} />
              ))}
            </div>
          ) : (
            <SectionState message={t("homepage.noTrendingVideosAvailable")} />
          )}
          <ShowMoreDivider label={t("common.showMore")} />
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-lg font-medium font-bricolage text-black dark:text-white md:text-2xl">
            {t("homepage.categoriesWeThinkYouWillLike")}
          </h2>
          <div className="grid w-full grid-cols-3 gap-3 lg:grid-cols-4 xl:grid-cols-6">
            { categoryOptions
              .filter((category) => category.slug !== ALL_CATEGORY_ID)
              .slice(0, 6)
              .map((category) => (
                <CategoryCard
                  key={category.id}
                  thumb={getCategoryThumbnail(category)}
                  label={category.label}
                  subs={formatSubscriberLabel(category.subscriberCount || 0)}
                  active={activeCategory === category.slug}
                  onClick={() => setActiveCategory(category.slug)}
                />
              ))}
          </div>
          <ShowMoreDivider label={t("common.showMore")} />
        </section>

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-2xl font-medium font-bricolage text-black dark:text-white">{t("homepage.selectedCategoryVideos", { category: selectedCategory.label })}</h2>
            </div>
          </div>
          {loadingFeed ? (
            <SectionState message={t("homepage.loadingCategoryVideos")} loading />
          ) : featuredVideos.length ? (
            <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {featuredVideos.slice(0, 8).map((video) => (
                <VideoCard key={video.id} {...mapVideoToCardProps(video)} />
              ))}
            </div>
          ) : (
            <SectionState message={t("homepage.noVideosInCategory", { category: selectedCategory.label.toLowerCase() })} />
          )}
          <ShowMoreDivider label={t("common.showMore")} />
        </section>

        <section className="mb-8 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium font-bricolage text-black dark:text-white md:text-2xl">{t("homepage.liveStreams")}</h2>
            <button
              type="button"
              onClick={openLivePage}
              className="flex items-center gap-1.5 text-sm font-medium text-black200 dark:text-white"
            >
              {t("livePage.browseLive")} <MdArrowForwardIos />
            </button>
          </div>
          {loading ? (
            <SectionState message={t("homepage.loadingLiveStreams")} loading />
          ) : liveVideos.length ? (
            <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {liveVideos.slice(0, 8).map((video) => (
                <VideoCard key={video.id} {...mapVideoToCardProps(video)} />
              ))}
            </div>
          ) : (
            <SectionState message={t("homepage.noLiveStreamsActive")} />
          )}
        </section>
      </div>
    </div>
  );
}
