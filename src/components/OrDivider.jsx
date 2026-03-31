import { useLanguage } from "../context/LanguageContext";

export default function OrDivider({ label = "OR" }) {
  const { t } = useLanguage();
  const resolvedLabel = label === "OR" ? t("app.or") : label;

  return (
    <div className="flex items-center gap-3 my-4">
      <span className="flex-1 h-px bg-slate600" />
      <span className="text-sm tracking-wider whitespace-nowrap
                       text-slate600">
        {resolvedLabel}
      </span>
      <span className="flex-1 h-px bg-slate600" />
    </div>
  );
}