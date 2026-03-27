export const SEARCH_TABS = [
  { value: "all", label: "All" },
  { value: "videos", label: "Videos" },
  { value: "creators", label: "Creators" },
  { value: "categories", label: "Categories" },
];

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