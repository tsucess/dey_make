import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { formatRelativeTime } from "../utils/content";
import { useNotifications } from "../components/Layout/useNotifications";
import Spinner from "../components/Layout/Spinner";
import { IoNotificationsOffOutline } from "react-icons/io5";

const TABS = ["All notification", "Likes", "Comments", "Connects", "Mentions", "Live alerts"];

const groupNotifications = (notifications) => {
  const groups = {
    Today: [],
    Yesterday: [],
    "This Month": [],
    Older: [],
  };

  const now = new Date();
  
  notifications.forEach((n) => {
    const d = new Date(n.createdAt || Date.now());
    const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (isToday) groups.Today.push(n);
    else if (diffDays <= 1) groups.Yesterday.push(n);
    else if (diffDays <= 30) groups["This Month"].push(n);
    else groups.Older.push(n);
  });

  return Object.entries(groups).filter(([_, items]) => items.length > 0);
};

export default function Notifications() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("All notification");
  const {
    notifications,
    loadingNotifications,
    notificationError,
    unreadNotificationCount,
    markingAllNotificationsRead,
    busyNotificationId,
    onRetry,
    handleSelectNotification,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead,
  } = useNotifications({ enabled: true });

  return (
    <div className="min-h-full bg-white dark:bg-black300 text-black dark:text-white pb-20 md:pb-0">
      <div className="w-full px-4 py-8 md:px-8 md:py-12">
        <div className="mb-6 flex flex-wrap items-center gap-2 md:gap-8 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-orange100 text-black"
                  : "text-black dark:text-white hover:bg-slate150 hover:dark:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loadingNotifications ? (
          <div className="flex items-center justify-center py-20">
            <Spinner big />
          </div>
        ) : notificationError ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-red-50 dark:bg-red-900/10 py-16 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">{notificationError}</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full bg-orange100 px-6 py-2 text-sm font-semibold text-black hover:bg-orange200"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-[20px] bg-black100 min-h-[65vh] text-center px-4 w-full">
            <IoNotificationsOffOutline className="h-28 w-28 text-white mb-2" strokeWidth={1} />
            <div className="space-y-3">
              <h2 className="text-[22px] font-semibold font-inter text-white">
                No Notifications
              </h2>
              <p className="text-[15px] font-medium font-inter text-white/90">
                We'll let you know when there is something to update you.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-[20px] bg-white300 dark:bg-black100 p-4 md:p-8 w-full min-h-[65vh]">
            {groupNotifications(notifications).map(([groupName, groupItems]) => (
              <div key={groupName} className="mb-8 last:mb-0">
                <h3 className="text-[20px] font-medium font-inter text-black dark:text-white mb-4">
                  {groupName}
                </h3>
                <div className="flex flex-col gap-2">
                  {groupItems.map((notification) => {
                    const isRead = Boolean(notification.readAt);
                    const userAvatar = notification.data?.userAvatar || "https://images.unsplash.com/photo-1531123897727-8f129e1b4492?w=80&q=80";
                    const titleLower = notification.title?.toLowerCase() || "";
                    const typeLower = notification.type?.toLowerCase() || "";
                    
                    const hasAction = typeLower === "connect" || titleLower.includes("connect");
                    const hasThumbnail = !hasAction && (typeLower === "comment" || typeLower === "like" || titleLower.includes("comment") || titleLower.includes("like") || titleLower.includes("replied"));

                    return (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleSelectNotification?.(notification)}
                        className="flex items-start gap-3 py-3 text-left w-full hover:bg-white/5 rounded-xl px-2 transition-colors -mx-2"
                      >
                        <div className="flex items-center gap-3 mt-1 shrink-0">
                          <div className="w-2 flex justify-center">
                            {!isRead && <span className="h-2.5 w-2.5 rounded-full bg-orange100 shrink-0" aria-hidden="true" />}
                          </div>
                          <img 
                            src={userAvatar} 
                            alt="" 
                            className="w-12 h-12 rounded-full object-cover shrink-0" 
                          />
                        </div>
                        
                        <div className="flex-1 mt-2.5">
                          <p className="text-[15.5px] font-inter text-black dark:text-white leading-relaxed pr-4">
                            {notification.title}
                            {notification.body && <span className="ml-1">{notification.body}</span>}
                            <span className="text-slate-500 ml-2">{formatRelativeTime(notification.createdAt)}</span>
                          </p>
                        </div>

                        {hasAction && (
                          <div className="shrink-0 flex items-center justify-center pt-2">
                            <div className="bg-orange100 hover:bg-orange200 text-black px-6 py-2 rounded-full text-[14px] font-semibold transition-colors">
                              Connect
                            </div>
                          </div>
                        )}

                        {hasThumbnail && (
                          <div className="shrink-0 pt-1">
                            <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=80&q=80" alt="Thumbnail" className="w-13 h-13 rounded-lg object-cover" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
