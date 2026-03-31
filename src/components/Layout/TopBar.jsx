import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiSearch, HiPlus } from "react-icons/hi";
import { IoNotificationsOutline } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { api, firstError } from "../../services/api";
import { formatSubscriberLabel, getProfileAvatar, getProfileName, getVideoTitle } from "../../utils/content";
import { buildSearchPath, normalizeSearchQuery } from "../../utils/search";
import { CreateDropdown } from "./CreateDropdown";

export default function TopBar() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const lookupRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [lookup, setLookup] = useState({ videos: [], creators: [], categories: [] });
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const normalizedQuery = useMemo(() => normalizeSearchQuery(query), [query]);
  const hasLookupResults = lookup.videos.length || lookup.creators.length || lookup.categories.length;

  function toggleVisiblity() {
    setIsVisible((prev) => !prev);
  }

  function closeLookup() {
    setIsLookupOpen(false);
  }

  function submitSearch(nextQuery = query) {
    navigate(buildSearchPath(nextQuery));
    closeLookup();
  }

  function selectSuggestion(nextQuery, tab) {
    navigate(buildSearchPath(nextQuery, tab));
    closeLookup();
  }

  function selectVideo(videoId) {
    navigate(`/video/${videoId}`);
    closeLookup();
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    if (location.pathname.startsWith("/search")) {
      setQuery(searchParams.get("q") || "");
    }

    closeLookup();
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setLookup({ videos: [], creators: [], categories: [] });
      setLoadingLookup(false);
      setLookupError("");
      closeLookup();
      return undefined;
    }

    let ignore = false;
    const timeoutId = window.setTimeout(async () => {
      setLoadingLookup(true);
      setLookupError("");

      try {
        const response = await api.searchSuggestions(normalizedQuery);

        if (ignore) return;

        const nextLookup = {
          videos: response?.data?.videos || [],
          creators: response?.data?.creators || [],
          categories: response?.data?.categories || [],
        };

        setLookup(nextLookup);
        setIsLookupOpen(true);
      } catch (nextError) {
        if (!ignore) {
          setLookup({ videos: [], creators: [], categories: [] });
          setLookupError(firstError(nextError.errors, nextError.message || t("topbar.unableToLoadSuggestions")));
          setIsLookupOpen(true);
        }
      } finally {
        if (!ignore) setLoadingLookup(false);
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [normalizedQuery, t]);

  useEffect(() => {
    if (!isLookupOpen) return undefined;

    function handlePointerDown(event) {
      if (!lookupRef.current?.contains(event.target)) {
        closeLookup();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isLookupOpen]);

  const showLookup = isLookupOpen && normalizedQuery.length >= 2;

  function handleSubmit(event) {
    event.preventDefault();
    submitSearch();
  }

  function handleInputKeyDown(event) {
    if (event.key === "Escape") {
      closeLookup();
      event.currentTarget.blur();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
    }
  }

  return (
    <header className="flex items-center justify-between pl-30 pr-6 pb-3 pt-10
                       bg-white dark:bg-slate100
                       sticky top-0 z-10 ">

      {/* Search */}
      <div ref={lookupRef} className="relative w-70">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-full border-[0.15px] border-slate700 bg-white300 px-4 py-2 dark:bg-black100"
        >
          <button type="submit" className="shrink-0 border-none bg-transparent p-0" aria-label={t("topbar.submitSearch")}>
            <HiSearch className="h-4 w-4 text-black dark:text-slate200" />
          </button>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => {
              if (normalizedQuery.length >= 2) setIsLookupOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={t("topbar.searchPlaceholder")}
            aria-label={t("topbar.searchAriaLabel")}
            className="w-full border-none bg-transparent text-sm font-inter text-black outline-none placeholder-black dark:text-slate200 dark:placeholder-slate200"
          />
        </form>

        {showLookup ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-30 rounded-[1.5rem] border border-black/5 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#1B1B1B]">
            {loadingLookup ? (
              <p className="text-sm text-slate500 dark:text-slate200">{t("topbar.lookingUpMatches")}</p>
            ) : lookupError ? (
              <p className="text-sm text-red-600">{lookupError}</p>
            ) : hasLookupResults ? (
              <div className="space-y-4">
                {lookup.videos.length ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate400">{t("common.videos")}</p>
                    <div className="space-y-1.5">
                      {lookup.videos.map((video) => (
                        <button
                          key={video.id}
                          type="button"
                          onClick={() => selectVideo(video.id)}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-[#F5F5F5] dark:hover:bg-white/5"
                        >
                          <img src={getProfileAvatar(video.author || video.creator)} alt="" className="h-10 w-10 rounded-2xl object-cover" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-black dark:text-white">{getVideoTitle(video)}</p>
                            <p className="truncate text-xs text-slate500 dark:text-slate200">{getProfileName(video.author || video.creator)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {lookup.creators.length ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate400">{t("common.creators")}</p>
                    <div className="space-y-1.5">
                      {lookup.creators.map((creator) => (
                        <button
                          key={creator.id}
                          type="button"
                          onClick={() => selectSuggestion(getProfileName(creator), "creators")}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-[#F5F5F5] dark:hover:bg-white/5"
                        >
                          <img src={getProfileAvatar(creator)} alt="" className="h-10 w-10 rounded-full object-cover" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-black dark:text-white">{getProfileName(creator)}</p>
                            <p className="truncate text-xs text-slate500 dark:text-slate200">{formatSubscriberLabel(creator.subscriberCount || 0)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {lookup.categories.length ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate400">{t("common.categories")}</p>
                    <div className="flex flex-wrap gap-2">
                      {lookup.categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => selectSuggestion(category.label || category.name, "categories")}
                          className="rounded-full bg-[#F5F5F5] px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-[#ECECEC] dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                        >
                          {category.label || category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => submitSearch()}
                  className="w-full rounded-full bg-orange100 px-4 py-2.5 text-sm font-semibold text-black"
                >
                  {t("topbar.viewAllResultsFor", { query: normalizedQuery })}
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate500 dark:text-slate200">{t("topbar.noQuickMatches")}</p>
            )}
          </div>
        ) : null}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 relative">
        {isAuthenticated ? (
          <>
            {/* Create */}
            <button onClick={toggleVisiblity}
              className="flex items-center gap-1.5
                         bg-orange100 font-inter hover:bg-[#e09510]
                         text-black font-semibold text-sm
                         px-6 py-2.5 rounded-full
                         border-none cursor-pointer
                         transition-colors"
            >
              <HiPlus className="w-4 h-4" />
              {t("common.create")}
            </button>
            <CreateDropdown isVisible={isVisible}/>

            {/* Bell */}
            <button aria-label={t("common.notifications")} className="w-9 h-9 flex items-center justify-center
                               rounded-full border-none cursor-pointer
                               bg-transparent
                               hover:bg-gray-100 dark:hover:bg-[#2d2d2d]
                               transition-colors">
              <IoNotificationsOutline  className="w-5 h-5 text-black dark:text-white"/>
            </button>

            {/* Avatar */}
            <Link to="/profile">
              <img
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&q=80"}
                alt={user?.fullName || t("common.profile")}
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
              />
            </Link>
          </>
        ) : null}
      </div>
    </header>
  );
}