import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { formatCompactNumber, getProfileAvatar } from "../../utils/content";

const FALLBACK_PLACEHOLDER = "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&h=300&fit=crop";

export default function RisingCreators({ creators }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(Array.isArray(creators) ? creators : []);
  }, [creators]);

  const toggleSubscribe = useCallback(async (creatorId, subscribed) => {
    if (!isAuthenticated) { navigate("/login"); return; }
    setItems((prev) => prev.map((item) => (
      item.profile?.id === creatorId
        ? { ...item, profile: {
            ...item.profile,
            subscriberCount: Math.max(0, (item.profile.subscriberCount || 0) + (subscribed ? -1 : 1)),
            currentUserState: { ...(item.profile.currentUserState || {}), subscribed: !subscribed },
          } }
        : item
    )));
    try {
      if (subscribed) await api.unsubscribeFromCreator(creatorId);
      else await api.subscribeToCreator(creatorId);
    } catch {
      setItems((prev) => prev.map((item) => (
        item.profile?.id === creatorId
          ? { ...item, profile: {
              ...item.profile,
              subscriberCount: Math.max(0, (item.profile.subscriberCount || 0) + (subscribed ? 1 : -1)),
              currentUserState: { ...(item.profile.currentUserState || {}), subscribed },
            } }
          : item
      )));
    }
  }, [isAuthenticated, navigate]);

  if (!items.length) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-black dark:text-white text-lg font-bricolage font-semibold">Rising Creators</h3>
        <button className="text-orange100 text-sm font-medium hover:underline cursor-pointer bg-transparent border-none">
          See all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const profile = item.profile || {};
          const thumbs = (item.recentVideos || []).map((v) => v.thumbnailUrl || FALLBACK_PLACEHOLDER);
          while (thumbs.length < 3) thumbs.push(FALLBACK_PLACEHOLDER);
          const subscribed = Boolean(profile.currentUserState?.subscribed);

          return (
            <div key={profile.id} className="bg-white100 dark:bg-slate100 rounded-2xl overflow-hidden border border-[#333] flex flex-col">
              <div className="h-32 flex w-full relative">
                <div className="flex-1 overflow-hidden"><img src={thumbs[0]} className="w-full h-full object-cover" alt="" /></div>
                <div className="flex-1 overflow-hidden"><img src={thumbs[1]} className="w-full h-full object-cover grayscale brightness-75" alt="" /></div>
                <div className="flex-1 overflow-hidden"><img src={thumbs[2]} className="w-full h-full object-cover" alt="" /></div>
                <div className="absolute inset-0 bg-linear-to-t from-slate100 via-transparent to-transparent"></div>
              </div>

              <div className="px-6 pb-6 pt-0 flex flex-col items-center text-center relative flex-1">
                <div className="relative -mt-10 mb-3">
                  <img
                    src={getProfileAvatar(profile)}
                    alt={profile.fullName || profile.username || ""}
                    className="w-20 h-20 rounded-full border-4 border-slate100 object-cover"
                  />
                  {profile.isOnline && (
                    <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-red-500 border-2 border-slate100 rounded-full"></span>
                  )}
                </div>

                <h4 className="text-black dark:text-white font-semibold text-lg">{profile.fullName || profile.username}</h4>
                <p className="text-slate-400 text-xs mb-3">{item.role || "Creator"}</p>

                <p className="text-black dark:text-white font-bold text-sm mb-2">
                  {formatCompactNumber(profile.subscriberCount)} <span className="font-normal text-slate-400 text-xs">followers</span>
                </p>

                <p className="text-slate-400 text-[11px] mb-6 whitespace-pre-line leading-relaxed line-clamp-3">
                  {profile.bio || ""}
                </p>

                <button
                  onClick={() => toggleSubscribe(profile.id, subscribed)}
                  className={`w-full mt-auto py-2.5 rounded-full font-semibold text-sm transition-colors ${
                    subscribed
                      ? "bg-transparent border border-orange100 text-orange100 hover:bg-orange100/10"
                      : "bg-orange100 text-black hover:bg-orange200"
                  }`}
                >
                  {subscribed ? "Connected" : "Connect"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
