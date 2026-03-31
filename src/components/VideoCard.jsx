import { useNavigate } from "react-router-dom";
import { buildVideoLink, FALLBACK_AVATAR, FALLBACK_THUMBNAIL } from "../utils/content";
import { useLanguage } from "../context/LanguageContext";

export default function VideoCard({ id, thumb, title, author, avatarUrl, tags = [], live, processingStatus = "completed" }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const showProcessingBadge = processingStatus !== "completed";
  const processingLabel = processingStatus === "failed" ? t("content.processingFailedBadge") : t("content.processingBadge");

  return (
    <div
      className="flex flex-col cursor-pointer group w-full"
      onClick={() => navigate(buildVideoLink(id, live))}
    >
      <div className="relative w-full h-60.5 aspect-video rounded-xl overflow-hidden
                      bg-gray-200 dark:bg-gray-700">
        <img src={thumb || FALLBACK_THUMBNAIL} alt={title}
          className="w-full h-full object-cover group-hover:scale-105
                     transition-transform duration-300" />
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {live && (
            <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 flex gap-1 items-center rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              {t("content.liveBadge")}
            </div>
          )}
          {showProcessingBadge ? (
            <div className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-black">
              {processingLabel}
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex items-start gap-3 mt-2.5 px-0.5">
        <img src={avatarUrl || FALLBACK_AVATAR} alt={author}
          className="w-11 h-11 rounded-full object-cover shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <p className="text-base md:text-lg font-medium font-inter text-black dark:text-white
                        leading-snug line-clamp-2">
            {title.length > 15 ? title.slice(0,15)+'...': title}
          </p>
          <p className="text-xs text-black font-medium font-inter capitalize dark:text-white">
            {author}
          </p>
          {tags.length > 0 && (
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {tags.map((t) => (
                <span key={t}
                  className="text-xs bg-white300 font-inter capitalize
                             dark:bg-black100 text-black font-medium
                             dark:text-white px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}