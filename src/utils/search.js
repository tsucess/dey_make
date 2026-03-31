export const SEARCH_TABS = [
  { value: "all", labelKey: "search.tabs.all" },
  { value: "videos", labelKey: "search.tabs.videos" },
  { value: "creators", labelKey: "search.tabs.creators" },
  { value: "categories", labelKey: "search.tabs.categories" },
];

export function getSearchTabs(t) {
  return SEARCH_TABS.map((tab) => ({
    ...tab,
    label: t(tab.labelKey),
  }));
}

export function normalizeSearchQuery(value) {
  return `${value || ""}`.replace(/\s+/g, " ").trim();
}

export function resolveSearchTab(value) {
  return SEARCH_TABS.some((tab) => tab.value === value) ? value : "all";
}

export function buildSearchPath(query = "", tab = "all") {
  const normalizedQuery = normalizeSearchQuery(query);
  const resolvedTab = resolveSearchTab(tab);
  const params = new URLSearchParams();

  if (normalizedQuery) params.set("q", normalizedQuery);
  if (resolvedTab !== "all") params.set("tab", resolvedTab);

  const suffix = params.toString();

  return suffix ? `/search?${suffix}` : "/search";
}