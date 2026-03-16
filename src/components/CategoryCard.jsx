export default function CategoryCard({ thumb, label, subs }) {
  return (
    <div className="flex flex-col cursor-pointer group w-full">
      <div className="w-full aspect-video rounded-xl overflow-hidden
                      bg-gray-200 dark:bg-gray-700">
        <img src={thumb} alt={label}
          className="w-full h-full object-cover group-hover:scale-105
                     transition-transform duration-300" />
      </div>
      <div className="mt-2 px-0.5">
        <p className="text-sm font-semibold
                      text-gray-800 dark:text-white">
          {label}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {subs}
        </p>
      </div>
    </div>
  );
}