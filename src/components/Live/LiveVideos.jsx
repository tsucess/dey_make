/**
 * LiveVideos — public live-feed loader.
 *
 * Fetches api.getLiveVideos, filters to active streams, and splits them
 * between TopVideo (featured) and OtherLive (grid). Used by LivePage.
 *
 * Feature: 3.5 Live streaming (see PROJECT_OVERVIEW.md).
 * Backend: VideoController@liveIndex.
 */


import { useEffect, useState } from "react";
import { api, firstError } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { filterActiveLiveVideos } from "../../utils/content";
import OtherLive from "./OtherLive";
import TopVideo from "./TopVideo";

function LiveVideos() {
  const { t } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    let initial = true;

    async function load() {
      if (initial) setLoading(true);

      try {
        const response = await api.getLiveVideos();
        if (ignore) return;
        setVideos(filterActiveLiveVideos(response?.data?.videos || []));
        setError("");
      } catch (nextError) {
        if (ignore) return;
        setError(
          firstError(
            nextError.errors,
            nextError.message || t("livePage.unableToLoad"),
          ),
        );
      } finally {
        if (!ignore && initial) {
          setLoading(false);
          initial = false;
        }
      }
    }

    load();
    const interval = setInterval(load, 15000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [t]);

  const featured = videos[0] || null;
  const rest = videos.slice(1);
  const isEmpty = !loading && !error && videos.length === 0;
 
  return (
    <div className="flex flex-col gap-5 pb-20">
      <TopVideo video={featured} loading={loading} error={error} isEmpty={isEmpty} />
      <OtherLive videos={rest} loading={loading} isEmpty={isEmpty} />
    </div>
  );
}

export default LiveVideos;
