import { useNavigate } from "react-router-dom";
import { FALLBACK_AVATAR, FALLBACK_THUMBNAIL } from "../utils/content";

export default function VideoCard({ id, thumb, title, author, avatarUrl, tags = [], live }) {
  const navigate = useNavigate();
  return (
    <div
      className="flex flex-col cursor-pointer group w-full"
      onClick={() => navigate(`/video/${id}`)}
    >
      <div className="relative w-full h-60.5 aspect-video rounded-xl overflow-hidden
                      bg-gray-200 dark:bg-gray-700">
        <img src={thumb || FALLBACK_THUMBNAIL} alt={title}
          className="w-full h-full object-cover group-hover:scale-105
                     transition-transform duration-300" />
        {live && (
          <div className="absolute top-2 left-2 bg-red-500 text-white
                           text-[10px] font-bold px-2 py-0.5 flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            LIVE
          </div>
        )}
      </div>
      <div className="flex items-start gap-3 mt-2.5 px-0.5">
        <img src={avatarUrl || FALLBACK_AVATAR} alt={author}
          className="w-11 h-11 rounded-full object-cover shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <p className="text-base md:text-lg font-medium font-inter text-black dark:text-white
                        leading-snug line-clamp-2">
            {title}
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