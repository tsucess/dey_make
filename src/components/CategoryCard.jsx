import { FALLBACK_THUMBNAIL } from "../utils/content";

export default function CategoryCard({ thumb, label, subs, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer flex-col text-left group ${active ? "rounded-2xl ring-2 ring-orange100 ring-offset-2 ring-offset-white dark:ring-offset-slate100" : ""}`}
    >
      <div className="w-full aspect-video h-50 rounded-xl overflow-hidden
                      bg-gray-200 dark:bg-gray-700">
        <img src={thumb || FALLBACK_THUMBNAIL} alt={label}
          className="w-full h-full object-cover group-hover:scale-105
                     transition-transform duration-300" />
      </div>
      <div className="mt-2 px-0.5 flex flex-col gap-1">
        <p className="text-sm font-medium
                      text-black font-inter dark:text-white">
          {label}
        </p>
        <p className="text-xs text-slate800 font-inter">
          {subs}
        </p>
      </div>
    </button>
  );
}