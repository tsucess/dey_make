import { IoIosArrowBack } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { useLanguage } from "../context/LanguageContext";
import { formatRelativeTime } from "../utils/content";

export default function Notification({
  isVisible,
  closeNotification,
  notifications = [],
  loading = false,
  error = "",
  unreadCount = 0,
  markingAllRead = false,
  busyNotificationId = null,
  onRetry,
  onSelectNotification,
  onMarkNotificationRead,
  onMarkAllRead,
}) {
  const { t } = useLanguage();

  if (!isVisible) return null;

  return (
    <section
      className="absolute inset-0 z-100 flex justify-end bg-black/15 backdrop-blur-xs backdrop-brightness-75"
      onClick={closeNotification}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("common.notifications")}
        className="flex h-full w-full flex-col gap-6 bg-white px-6 py-8 dark:bg-slate100 md:w-1/2"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xl font-medium font-bricolage text-black dark:text-white">
            <IoIosArrowBack className="h-5 w-5" />
            <div>
              <p>{t("topbar.notificationsTitle")}</p>
              <p className="text-sm font-inter font-normal text-slate700 dark:text-slate200">
                {unreadCount
                  ? t("topbar.unreadNotifications", { count: unreadCount })
                  : t("topbar.allCaughtUp")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length ? (
              <button
                type="button"
                onClick={onMarkAllRead}
                disabled={!unreadCount || markingAllRead}
                className="rounded-full bg-orange100 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {markingAllRead ? t("topbar.markingAllRead") : t("topbar.markAllAsRead")}
              </button>
            ) : null}
            <button
              type="button"
              onClick={closeNotification}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white300 dark:bg-black100"
            >
              <IoMdClose className="h-5 w-5 text-slate900 dark:text-white" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate700 dark:text-slate200">
            {t("topbar.loadingNotifications")}
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full bg-orange100 px-4 py-2 text-sm font-semibold text-black"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <img src="/notification icon.png" alt="" className="h-24 w-24 object-contain" />
            <div className="space-y-2">
              <h2 className="text-xl font-medium font-inter text-black dark:text-white">{t("topbar.noNotificationsTitle")}</h2>
              <p className="text-sm font-medium font-inter text-slate700 dark:text-slate200">
                {t("topbar.noNotificationsBody")}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
            {notifications.map((notification) => {
              const isRead = Boolean(notification.readAt);
              const isBusy = busyNotificationId === notification.id;

              return (
                <article
                  key={notification.id}
                  className={`flex items-start justify-between gap-3 rounded-[1.5rem] border px-4 py-4 transition-colors ${
                    isRead
                      ? "border-black/5 bg-[#F6F6F6] dark:border-white/10 dark:bg-black100"
                      : "border-orange100/30 bg-orange100/10 dark:border-orange100/20 dark:bg-orange100/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectNotification?.(notification)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      {!isRead ? <span className="h-2.5 w-2.5 rounded-full bg-orange100" aria-hidden="true" /> : null}
                      <p className="truncate text-sm text-slate500 dark:text-slate200">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                    <h3 className="mt-2 text-base font-semibold font-inter text-black dark:text-white">{notification.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate700 dark:text-slate200">{notification.body}</p>
                  </button>

                  {!isRead ? (
                    <button
                      type="button"
                      onClick={() => onMarkNotificationRead?.(notification.id)}
                      disabled={isBusy}
                      className="shrink-0 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-white"
                    >
                      {isBusy ? t("topbar.markingRead") : t("topbar.markRead")}
                    </button>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </aside>
    </section>
  );
}