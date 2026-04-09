import { IoNotificationsOutline } from "react-icons/io5";

export default function NotificationButton({
  onClick,
  ariaLabel,
  unreadCount = 0,
  className = "",
  iconClassName = "h-5 w-5 text-black dark:text-white",
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
        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </button>
  );
}