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
      <div className="relative w-full h-60.5 aspect-video rounded-xl overflow-hidden
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
      <div className="flex items-start gap-3 mt-2.5 px-0.5">
        <img src={avatar} alt={author}
          className="w-11 h-11 rounded-full object-cover shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <p className="text-base font-medium font-inter text-black dark:text-white
                        leading-snug line-clamp-2">
            {title}
          </p>
          <p className="text-xs text-black font-medium font-inter dark:text-white mt-1">
            {author}
          </p>
          {tags.length > 0 && (
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {tags.map((t) => (
                <span key={t}
                  className="text-xs bg-white300 font-inter
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