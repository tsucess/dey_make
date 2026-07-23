import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";

const VARIANTS = {
  error: {
    container: "bg-red-600 text-white",
    icon: "text-white",
  },
  success: {
    container: "bg-emerald-600 text-white",
    icon: "text-white",
  },
  info: {
    container: "bg-black100 text-white",
    icon: "text-white",
  },
};

export default function Toast({
  message,
  variant = "info",
  onDismiss,
  autoDismissMs = 5000,
  role,
}) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!message || !autoDismissMs || !onDismiss) return undefined;
    const handle = setTimeout(() => onDismiss(), autoDismissMs);
    return () => clearTimeout(handle);
  }, [message, autoDismissMs, onDismiss]);

  if (!message) return null;

  const styles = VARIANTS[variant] || VARIANTS.info;
  const ariaRole = role || (variant === "error" ? "alert" : "status");

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div
        role={ariaRole}
        aria-live={variant === "error" ? "assertive" : "polite"}
        className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl px-4 py-3 shadow-lg ${styles.container}`}
      >
        <span className="flex-1 text-sm font-medium leading-snug">{message}</span>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={t("profile.dismissToast")}
            className={`shrink-0 rounded-full p-1 transition-opacity hover:opacity-80 ${styles.icon}`}
          >
            <FiX className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
