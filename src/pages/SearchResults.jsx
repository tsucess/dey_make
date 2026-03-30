import { useEffect, useMemo, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { useSearchParams } from "react-router-dom";
import VideoCard from "../components/VideoCard";
import { useLanguage } from "../context/LanguageContext";
import { api, firstError } from "../services/api";
import {
  formatSubscriberLabel,
  getCategoryThumbnail,
  getProfileAvatar,
  getProfileName,
  mapVideoToCardProps,
} from "../utils/content";
import { buildSearchPath, getSearchTabs, normalizeSearchQuery, resolveSearchTab } from "../utils/search";

function createEmptyResults() {
  return {
    data: { videos: [], creators: [], categories: [] },
    meta: {
      videos: { total: 0 },
      creators: { total: 0 },
      categories: { total: 0 },
    },
  };
}

function SectionState({ message }) {
  return (
    <div className="rounded-[2rem] bg-[#F5F5F5] px-5 py-10 text-center text-sm text-slate500 dark:bg-[#1A1A1A] dark:text-slate200">
      {message}
    </div>
  );
}

function ResultSectionHeader({ title, totalLabel, actionLabel, onAction }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-black dark:text-white md:text-xl">{title}</h2>
        <p className="text-sm text-slate500 dark:text-slate200">{totalLabel}</p>
      </div>
      {onAction ? (
        <button type="button" onClick={onAction} className="rounded-full bg-[#F5F5F5] px-4 py-2 text-sm font-medium text-black dark:bg-[#1A1A1A] dark:text-white">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function CreatorCard({ creator, onSearch, actionLabel }) {
  return (
    <article className="rounded-[2rem] bg-[#F5F5F5] p-5 dark:bg-[#1A1A1A]">
      <div className="flex items-center gap-4">
        <img src={getProfileAvatar(creator)} alt={getProfileName(creator)} className="h-14 w-14 rounded-full object-cover" />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-black dark:text-white">{getProfileName(creator)}</h3>
          <p className="text-sm text-slate500 dark:text-slate200">{formatSubscriberLabel(creator?.subscriberCount || 0)}</p>
        </div>
      </div>
      {creator?.bio ? <p className="mt-4 line-clamp-3 text-sm text-slate500 dark:text-slate200">{creator.bio}</p> : null}
      <button
        type="button"
        onClick={() => onSearch(getProfileName(creator))}
        className="mt-4 rounded-full bg-orange100 px-4 py-2 text-sm font-semibold text-black"
      >
        {actionLabel}
      </button>
    </article>
  );
}

function CategoryCard({ category, onSearch, actionLabel }) {
  return (
    <article className="overflow-hidden rounded-[2rem] bg-[#F5F5F5] dark:bg-[#1A1A1A]">
      <img src={getCategoryThumbnail(category)} alt={category.label || category.name} className="h-36 w-full object-cover" />
      <div className="p-5">
        <h3 className="text-base font-semibold text-black dark:text-white">{category.label || category.name}</h3>
        <p className="mt-1 text-sm text-slate500 dark:text-slate200">#{category.slug}</p>
        <p className="mt-1 text-sm text-slate500 dark:text-slate200">{formatSubscriberLabel(category?.subscriberCount || 0)}</p>
        <button
          type="button"
          onClick={() => onSearch(category.label || category.name)}
          className="mt-4 rounded-full bg-orange100 px-4 py-2 text-sm font-semibold text-black"
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

export default function SearchResults() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [draftQuery, setDraftQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(createEmptyResults);

  const query = normalizeSearchQuery(searchParams.get("q") || "");
  const activeTab = resolveSearchTab(searchParams.get("tab"));
  const searchTabs = useMemo(() => getSearchTabs(t), [t]);

  const searchRequest = useMemo(() => {
    return {
      all: api.search,
      videos: api.searchVideos,
      creators: api.searchCreators,
      categories: api.searchCategories,
    }[activeTab];
  }, [activeTab]);

  useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  useEffect(() => {
    if (!query) {
      setResults(createEmptyResults());
      setLoading(false);
      setError("");
      return undefined;
    }

    let ignore = false;

    async function loadResults() {
      setLoading(true);
      setError("");

      try {
        const response = await searchRequest(query);

        if (!ignore) {
          setResults({
            data: response?.data || createEmptyResults().data,
            meta: response?.meta || createEmptyResults().meta,
          });
        }
      } catch (nextError) {
        if (!ignore) {
          setResults(createEmptyResults());
          setError(firstError(nextError.errors, nextError.message || t("search.unableToLoadResults")));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadResults();

    return () => {
      ignore = true;
    };
  }, [query, searchRequest, t]);

  function updateSearch(nextQuery, nextTab = activeTab) {
    const nextPath = buildSearchPath(nextQuery, nextTab);
    const nextSearch = nextPath.replace("/search", "");
    setSearchParams(new URLSearchParams(nextSearch.replace(/^\?/, "")));
  }

  function handleSubmit(event) {
    event.preventDefault();
    updateSearch(draftQuery);
  }

  const videos = results.data.videos || [];
  const creators = results.data.creators || [];
  const categories = results.data.categories || [];
  const meta = results.meta || createEmptyResults().meta;
  const hasAnyResults = videos.length || creators.length || categories.length;
  const activeResultLabel = t(`search.resultLabels.${activeTab}`);

  return (
    <div className="min-h-full bg-white px-4 pb-24 pt-4 dark:bg-slate100 md:px-8 md:pb-10 md:pt-6">
      <div className="mx-auto w-full max-w-6xl">
        <form onSubmit={handleSubmit} className="mb-5 flex items-center gap-3 rounded-full bg-[#F5F5F5] px-4 py-3 dark:bg-[#1A1A1A] md:hidden">
          <HiSearch className="h-5 w-5 text-slate500 dark:text-slate200" />
          <input
            type="text"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder={t("topbar.searchPlaceholder")}
            aria-label={t("topbar.searchAriaLabel")}
            className="w-full border-none bg-transparent text-sm text-black outline-none placeholder:text-slate500 dark:text-white"
          />
        </form>

        <header className="mb-6 rounded-[2rem] bg-[#F5F5F5] px-6 py-6 dark:bg-[#1A1A1A] md:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate400">{t("common.search")}</p>
          <h1 className="mt-2 text-2xl font-semibold text-black dark:text-white md:text-3xl">
            {query ? t("search.resultsFor", { query }) : t("search.emptyHeading")}
          </h1>
          <p className="mt-2 text-sm text-slate500 dark:text-slate200">
            {query ? t("search.refineResults") : t("search.searchHint")}
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {searchTabs.map((tab) => {
            const isActive = tab.value === activeTab;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => updateSearch(query, tab.value)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-orange100 text-black"
                    : "bg-[#F5F5F5] text-slate600 dark:bg-[#1A1A1A] dark:text-slate200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {error ? <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {!query ? (
          <SectionState message={t("search.startTyping")} />
        ) : loading ? (
          <SectionState message={t("search.loadingResults")} />
        ) : !hasAnyResults ? (
          <SectionState message={t("search.noResultsFor", { label: activeResultLabel, query })} />
        ) : activeTab === "all" ? (
          <div className="space-y-10">
            <section>
              <ResultSectionHeader title={t("common.videos")} totalLabel={t("search.resultsCount", { count: meta.videos?.total || videos.length })} actionLabel={t("search.viewAllVideos")} onAction={() => updateSearch(query, "videos")} />
              {videos.length ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {videos.map((video) => <VideoCard key={video.id} {...mapVideoToCardProps(video)} />)}
                </div>
              ) : (
                <SectionState message={t("search.noMatchingVideos")} />
              )}
            </section>

            <section>
              <ResultSectionHeader title={t("common.creators")} totalLabel={t("search.resultsCount", { count: meta.creators?.total || creators.length })} actionLabel={t("search.viewAllCreators")} onAction={() => updateSearch(query, "creators")} />
              {creators.length ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {creators.map((creator) => (
                    <CreatorCard key={creator.id} creator={creator} actionLabel={t("search.searchThisCreator")} onSearch={(nextQuery) => updateSearch(nextQuery, "creators")} />
                  ))}
                </div>
              ) : (
                <SectionState message={t("search.noMatchingCreators")} />
              )}
            </section>

            <section>
              <ResultSectionHeader title={t("common.categories")} totalLabel={t("search.resultsCount", { count: meta.categories?.total || categories.length })} actionLabel={t("search.viewAllCategories")} onAction={() => updateSearch(query, "categories")} />
              {categories.length ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {categories.map((category) => (
                    <CategoryCard key={category.id} category={category} actionLabel={t("search.searchThisCategory")} onSearch={(nextQuery) => updateSearch(nextQuery, "categories")} />
                  ))}
                </div>
              ) : (
                <SectionState message={t("search.noMatchingCategories")} />
              )}
            </section>
          </div>
        ) : activeTab === "videos" ? (
          <section>
            <ResultSectionHeader title={t("common.videos")} totalLabel={t("search.resultsCount", { count: meta.videos?.total || videos.length })} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {videos.map((video) => <VideoCard key={video.id} {...mapVideoToCardProps(video)} />)}
            </div>
          </section>
        ) : activeTab === "creators" ? (
          <section>
            <ResultSectionHeader title={t("common.creators")} totalLabel={t("search.resultsCount", { count: meta.creators?.total || creators.length })} />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} actionLabel={t("search.searchThisCreator")} onSearch={(nextQuery) => updateSearch(nextQuery, "creators")} />
              ))}
            </div>
          </section>
        ) : (
          <section>
            <ResultSectionHeader title={t("common.categories")} totalLabel={t("search.resultsCount", { count: meta.categories?.total || categories.length })} />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} actionLabel={t("search.searchThisCategory")} onSearch={(nextQuery) => updateSearch(nextQuery, "categories")} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}