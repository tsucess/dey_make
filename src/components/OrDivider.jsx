export default function OrDivider({ label = "OR" }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <span className="text-[0.78rem] tracking-wider whitespace-nowrap
                       text-gray-400 dark:text-gray-500">
        {label}
      </span>
      <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}