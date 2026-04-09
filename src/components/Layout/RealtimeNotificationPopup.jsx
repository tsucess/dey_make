import { useLanguage } from "../../context/LanguageContext";

export default function RealtimeNotificationPopup({ notification, onSelectNotification, onDismiss }) {
  const { t } = useLanguage();

  if (!notification) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-24 z-120 w-[min(24rem,calc(100vw-2rem))] md:right-6" role="status" aria-live="polite">
      <div className="pointer-events-auto rounded-[1.75rem] border border-orange100/30 bg-white p-4 shadow-2xl dark:border-orange100/20 dark:bg-[#171717]">
        <div className="flex items-start gap-3">
          <button type="button" onClick={() => onSelectNotification?.(notification)} className="min-w-0 flex-1 rounded-[1.25rem] text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500 dark:text-orange-300">{t("topbar.realtimeNotification")}</p>
            <p className="mt-2 truncate text-sm font-semibold text-black dark:text-white">{notification.title}</p>
            {notification.body ? (
              <p className="mt-1 line-clamp-2 text-sm text-slate600 dark:text-slate200">{notification.body}</p>
            ) : null}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={t("topbar.dismissRealtimeNotification")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] text-slate700 transition-colors hover:bg-[#ECECEC] dark:bg-black100 dark:text-slate200 dark:hover:bg-[#2A2A2A]"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}