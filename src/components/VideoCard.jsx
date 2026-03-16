import { useNavigate } from "react-router-dom";

export default function VideoCard({ id, thumb, title, author, tags = [], live }) {
  const navigate = useNavigate();
  const avatar =
    "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&q=80";

  return (
    <div
      className="flex flex-col cursor-pointer group w-full"
      onClick={() => navigate(`/video/${id}`)}
    >
      <div className="relative w-full aspect-video rounded-xl overflow-hidden
                      bg-gray-200 dark:bg-gray-700">
        <img src={thumb} alt={title}
          className="w-full h-full object-cover group-hover:scale-105
                     transition-transform duration-300" />
        {live && (
          <span className="absolute top-2 left-2 bg-red-500 text-white
                           text-[0.6rem] font-bold px-2 py-0.5 rounded">
            LIVE
          </span>
        )}
      </div>
      <div className="flex items-start gap-2 mt-2.5 px-0.5">
        <img src={avatar} alt={author}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white
                        leading-snug line-clamp-2">
            {title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {author}
          </p>
          {tags.length > 0 && (
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {tags.map((t) => (
                <span key={t}
                  className="text-[0.65rem] border border-gray-300
                             dark:border-gray-600 text-gray-500
                             dark:text-gray-400 px-2 py-0.5 rounded-full">
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