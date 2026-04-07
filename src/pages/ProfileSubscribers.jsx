import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../components/Layout/Spinner";
import { useLanguage } from "../context/LanguageContext";
import { api, firstError } from "../services/api";
import { getProfileAvatar, getProfileName } from "../utils/content";

export default function ProfileSubscribers() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadSubscribers() {
      setLoading(true);
      setError("");

      try {
        const response = await api.getProfileSubscribers();
        if (!ignore) setSubscribers(response?.data?.subscribers || []);
      } catch (nextError) {
        if (!ignore) setError(firstError(nextError?.errors, nextError?.message || t("profile.unableToLoadSubscribers")));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSubscribers();

    return () => {
      ignore = true;
    };
  }, [t]);

  return (
    <div className="min-h-full bg-white px-4 py-6 dark:bg-slate100 md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="rounded-full bg-white300 px-5 py-3 text-sm font-medium text-black dark:bg-black100 dark:text-white"
        >
          {t("profile.backToProfile")}
        </button>

        <section className="rounded-[2rem] bg-white300 p-6 dark:bg-black100 md:p-8">
          <h1 className="text-2xl font-semibold text-black dark:text-white">{t("content.subscribers")}</h1>
          <p className="mt-2 text-sm text-slate600 dark:text-slate200">{t("profile.subscribersDescription")}</p>

          {error ? <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          {loading ? (
            <div className="mt-8 space-y-3 text-sm text-slate600 dark:text-slate200">
              <Spinner />
              <p className="text-center">{t("profile.loadingSubscribers")}</p>
            </div>
          ) : subscribers.length ? (
            <div className="mt-6 grid gap-4">
              {subscribers.map((subscriber) => (
                <Link
                  key={subscriber.id}
                  to={`/users/${subscriber.id}`}
                  className="flex items-center gap-4 rounded-3xl bg-white px-5 py-4 transition hover:bg-white/80 dark:bg-[#1D1D1D] dark:hover:bg-[#252525]"
                >
                  <img src={getProfileAvatar(subscriber)} alt={getProfileName(subscriber)} className="h-14 w-14 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-black dark:text-white">{getProfileName(subscriber)}</p>
                    {subscriber.username ? <p className="truncate text-sm text-slate500 dark:text-slate200">@{subscriber.username}</p> : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl bg-white px-6 py-10 text-center text-sm text-slate600 dark:bg-[#1D1D1D] dark:text-slate200">
              {t("profile.noSubscribers")}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}