import React, { useEffect, useMemo, useState } from "react";
import ExploreCategoryTabs from "../components/Explore/ExploreCategoryTabs";
import ExploreHero from "../components/Explore/ExploreHero";
import TrendingList from "../components/Explore/TrendingList";
import RisingCreators from "../components/Explore/RisingCreators";
import TopVideosGrid from "../components/Explore/TopVideosGrid";
import { api } from "../services/api";

const TRENDING_TAB = { slug: "trending", label: "Trending" };

export default function ExplorePage() {
  const [activeSlug, setActiveSlug] = useState(TRENDING_TAB.slug);
  const [data, setData] = useState(null);
  const [videosPage, setVideosPage] = useState({ items: [], page: 1, hasMore: false, loading: false });

  const categoryParam = activeSlug === TRENDING_TAB.slug ? undefined : activeSlug;

  useEffect(() => {
    let cancelled = false;
    api.getExploreData({ category: categoryParam })
      .then((response) => {
        if (cancelled) return;
        const payload = response?.data ?? {};
        setData(payload);
        setVideosPage({ items: payload.topVideos ?? [], page: 1, hasMore: true, loading: false });
      })
      .catch(() => { if (!cancelled) setData({}); });
    return () => { cancelled = true; };
  }, [categoryParam]);

  const tabs = useMemo(() => {
    const backendCategories = data?.categories ?? [];
    return [TRENDING_TAB, ...backendCategories.map((c) => ({ slug: c.slug, label: c.label ?? c.name }))];
  }, [data]);

  const loadMoreVideos = async () => {
    if (videosPage.loading) return;
    setVideosPage((s) => ({ ...s, loading: true }));
    try {
      const nextPage = videosPage.page + 1;
      const response = await api.getExploreVideos({ category: categoryParam, page: nextPage, perPage: 12 });
      const items = response?.data?.videos ?? [];
      setVideosPage((s) => ({
        items: [...s.items, ...items],
        page: nextPage,
        hasMore: items.length > 0,
        loading: false,
      }));
    } catch {
      setVideosPage((s) => ({ ...s, loading: false, hasMore: false }));
    }
  };

  return (
    <div className="min-h-full bg-white dark:bg-black300">
      <div className="px-6 md:px-10 pt-4">
        <ExploreCategoryTabs
          tabs={tabs}
          activeSlug={activeSlug}
          onSelectCategory={setActiveSlug}
        />
      </div>

      <div className="px-6 md:px-10 pb-10">
        <ExploreHero video={data?.hero} activeCategory={data?.activeCategory} />
        <TrendingList topics={data?.trendingHashtags} />
        <RisingCreators creators={data?.risingCreators} />
        <TopVideosGrid
          videos={videosPage.items}
          onLoadMore={loadMoreVideos}
          canLoadMore={videosPage.hasMore}
          loading={videosPage.loading}
        />
      </div>
    </div>
  );
}
