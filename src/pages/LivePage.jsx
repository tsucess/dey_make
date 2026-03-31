import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoCard from "../components/VideoCard";
import { useLanguage } from "../context/LanguageContext";
import { api, firstError } from "../services/api";
import { filterActiveLiveVideos, mapVideoToCardProps } from "../utils/content";

function StateCard({ title, body, actionLabel, onAction }) {
  return (
    <div className="rounded-[2rem] bg-white300 px-6 py-10 text-center dark:bg-black200">
      <h2 className="text-xl font-semibold text-black dark:text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate600 dark:text-slate200">{body}</p>
      {onAction ? (
        <button type="button" onClick={onAction} className="mt-5 rounded-full bg-orange100 px-5 py-2 text-sm font-medium text-black">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export default function LivePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [liveVideos, setLiveVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadLiveVideos() {
      setLoading(true);
      setError("");

      try {
        const response = await api.getLiveVideos();

        if (!ignore) setLiveVideos(filterActiveLiveVideos(response?.data?.videos || []));
      } catch (nextError) {
        if (!ignore) setError(firstError(nextError.errors, nextError.message || t("livePage.unableToLoad")));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadLiveVideos();

    return () => {
      ignore = true;
    };
  }, [t]);

  return (
    <div className="min-h-full w-full bg-white px-4 pb-24 pt-4 dark:bg-slate100 md:px-6 md:py-5">
      <section className="rounded-[2rem] bg-gradient-to-r from-[#151515] via-[#1f2937] to-[#111827] px-6 py-8 text-white">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/70">{t("common.live")}</p>
        <h1 className="mt-3 text-3xl font-semibold font-bricolage">{t("livePage.title")}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/80 md:text-base">{t("livePage.description")}</p>
        {!loading ? <p className="mt-4 text-sm font-medium text-orange-200">{t("livePage.activeStreams", { count: liveVideos.length })}</p> : null}
      </section>

      {error ? <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="mt-6">
        {loading ? (
          <StateCard title={t("common.live")} body={t("livePage.loading")} />
        ) : liveVideos.length ? (
          <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {liveVideos.map((video) => (
              <VideoCard key={video.id} {...mapVideoToCardProps(video)} />
            ))}
          </div>
        ) : (
          <StateCard
            title={t("livePage.noLiveTitle")}
            body={t("livePage.noLiveBody")}
            actionLabel={t("livePage.goHome")}
            onAction={() => navigate("/home")}
          />
        )}
      </section>
    </div>
  );
}