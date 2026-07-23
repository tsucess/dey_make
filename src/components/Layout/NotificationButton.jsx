/**
 * NotificationButton — bell icon + unread-count badge in the TopBar.
 *
 * Uses the shared useNotifications hook to reflect live unread counts.
 *
 * Feature: 3.22 Notifications (see PROJECT_OVERVIEW.md).
 * Backend: NotificationController@unreadCount.
 */


import { IoNotificationsOutline } from "react-icons/io5";

export default function NotificationButton({
  onClick,
  ariaLabel,
  unreadCount = 0,
  className = "",
  iconClassName = "h-3 w-3 text-black dark:text-white",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${className} relative`}
    >
      <IoNotificationsOutline className={iconClassName} />
      {unreadCount ? (
        <span className="absolute right-1 top-1 flex min-h-3 min-w-3 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-semibold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </button>
  );
}