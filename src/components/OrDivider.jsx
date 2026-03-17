export default function OrDivider({ label = "OR" }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <span className="flex-1 h-px bg-slate600" />
      <span className="text-sm tracking-wider whitespace-nowrap
                       text-slate600">
        {label}
      </span>
      <span className="flex-1 h-px bg-slate600" />
    </div>
  );
}