/**
 * LiveChat — in-stream chat overlay for the host + viewers.
 *
 * Posts messages via api.postComment against the live video and polls the
 * comment endpoint for fresh entries. Also handles the mobile share sheet.
 *
 * Feature: 3.5 Live streaming, 3.7 Comments (see PROJECT_OVERVIEW.md).
 * Backend: CommentController@store, CommentController@index.
 */


import { useEffect, useMemo, useRef, useState } from "react";
import { CiFaceSmile } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { FaArrowLeftLong } from "react-icons/fa6";
import { IoMdArrowDropdown } from "react-icons/io";
import { RiShareForwardLine } from "react-icons/ri";
import { TbSend2 } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import {
  buildShareUrl,
  formatCompactNumber,
  getProfileAvatar,
  getProfileName,
  getVideoTitle,
} from "../../utils/content";

function formatChatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatCurrencyAmount(amount, currency) {
  const value = Number(amount ?? 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency || "NGN"} ${value}`;
  }
}

function LiveChat({ video, engagements = [], onSubmitted, videoId }) {
    const navigate = useNavigate();
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [localSubscribed, setLocalSubscribed] = useState(null);
    const feedRef = useRef(null);

    const creator = video?.author || video?.creator || null;
    const creatorAvatar = creator ? getProfileAvatar(creator) : "/story5.jpg";
    const creatorName = creator ? getProfileName(creator) : "User1234567890";
    const subscribers = Number(creator?.subscriberCount ?? 0);
    const serverSubscribed = Boolean(video?.currentUserState?.subscribed);
    const isSubscribed = localSubscribed ?? serverSubscribed;

    useEffect(() => {
      setLocalSubscribed(null);
    }, [serverSubscribed]);

    const chatItems = useMemo(() => {
      const sorted = [...engagements].sort(
        (a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime(),
      );
      const collapsed = [];
      for (const entry of sorted) {
        const last = collapsed[collapsed.length - 1];
        const actorKey = entry?.actor?.id ?? entry?.actor?.username ?? null;
        const lastActorKey = last?.actor?.id ?? last?.actor?.username ?? null;
        if (entry?.type === "like" && last?.type === "like" && actorKey && actorKey === lastActorKey) {
          last.likeCount = (last.likeCount || 1) + 1;
          last.createdAt = entry.createdAt || last.createdAt;
          last.id = entry.id || last.id;
          continue;
        }
        collapsed.push(entry?.type === "like" ? { ...entry, likeCount: 1 } : entry);
      }
      return collapsed.slice(-20);
    }, [engagements]);

    useEffect(() => {
      if (feedRef.current) {
        feedRef.current.scrollTop = feedRef.current.scrollHeight;
      }
    }, [chatItems.length]);

    async function handleSubmit(event) {
      event.preventDefault();
      const body = comment.trim();
      if (!videoId || !body || submitting) return;
      setSubmitting(true);
      try {
        await api.postComment(videoId, body);
        setComment("");
        onSubmitted?.();
      } catch {
        /* keep the comment for retry */
      } finally {
        setSubmitting(false);
      }
    }

    async function handleConnect() {
      const creatorId = creator?.id;
      if (!creatorId || connecting) return;
      setConnecting(true);
      const nextSubscribed = !isSubscribed;
      setLocalSubscribed(nextSubscribed);
      try {
        if (isSubscribed) await api.unsubscribeFromCreator(creatorId);
        else await api.subscribeToCreator(creatorId);
      } catch {
        setLocalSubscribed(isSubscribed);
      } finally {
        setConnecting(false);
      }
    }

    async function handleShareStream() {
      if (!videoId) return;
      const shareUrl = buildShareUrl(video || videoId);
      const shareTitle = video ? getVideoTitle(video) : "Watch this live stream";
      const shareText = creator
        ? `${creatorName} is live on DeyMake — tap in!`
        : "Catch this live stream on DeyMake!";
      let sharedNatively = false;
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        try {
          await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
          sharedNatively = true;
        } catch {
          /* dismissed */
        }
      }
      if (!sharedNatively && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        try { await navigator.clipboard.writeText(shareUrl); } catch { /* ignore */ }
      }
      try { await api.shareVideo(videoId); } catch { /* ignore */ }
    }

  return <div className="flex flex-col gap-8 font-inter w-full md:col-span-2">
    <button onClick={()=> navigate('/live')} className=" hidden w-6 md:w-7.5 h-6 md:h-7.5 absolute top-2 left-4 z-4 md:static rounded-md md:flex items-center justify-center border border-black/20 dark:border-white/30 cursor-pointer hover:bg-slate150 hover:dark:bg-slate150 transition-all"><FaArrowLeftLong className="text-black dark:text-white w-4 md:w-5 h-4 md:h-5" /></button>
    <button onClick={()=> navigate('/home')} className="w-6 md:w-7.5 h-6 md:h-7.5 absolute md:hidden top-2 left-4 z-4 md:static rounded-md flex items-center justify-center border border-black/20 dark:border-white/30 cursor-pointer hover:bg-slate150 hover:dark:bg-slate150 transition-all"><FaArrowLeftLong className="text-black dark:text-white w-4 md:w-5 h-4 md:h-5" /></button>
    <div className="flex items-center gap-3 absolute top-10 left-3 z-3 md:static">
        <div className="border border-black/10 dark:border-white/10 rounded-2xl flex items-center gap-2 justify-between p-2 bg-white300 dark:bg-slate100 backdrop-blur-md backdrop-brightness-150 backdrop-opacity-60 flex-1">
        <div className="flex items-center gap-2">
            <img src={creatorAvatar} alt="" className="w-6 md:w-7.5 h-6 md:h-7.5 rounded-full object-cover"/>
        <div className="flex flex-col gap-1">
            <h4 className="text-xs md:text-sm text-black dark:text-white">{creatorName}</h4>
            <div className="flex items-end gap-1"> <FaHeart className="text-red100 w-4 md:w-5 h-4 md:h-5" /> <span className="text-[10px] text-black dark:text-white">{formatCompactNumber(subscribers)}</span></div>
        </div>
        </div>
        <button onClick={handleConnect} type="button" disabled={connecting} className="w-16 md:w-25 h-8 rounded-full bg-orange100 text-black font-semibold text-[10px] md:text-xs disabled:opacity-60">{isSubscribed ? "Connected" : "Connect"}</button>
        </div>
        <button onClick={handleShareStream} type="button" className="border hidden border-black/10 dark:border-white/10 rounded-2xl w-13 h-15 md:flex items-center justify-center bg-white300 dark:bg-slate100 shrink-0"><RiShareForwardLine className="text-black dark:text-white w-7 h-7" /></button>
    </div>

    <div className="absolute bottom-4 left-2 md:static z-4 flex flex-col w-full md:bg-white300 md:p-6 gap-6 md:gap-10 rounded-2xl dark:md:bg-slate100">
        <div className="md:flex items-center justify-between hidden">
            <h3 className="text-base text-black dark:text-white">LIVE chat</h3>
            <button><IoMdArrowDropdown className="w-5 h-5 text-slate100 dark:text-slate50" /></button>
        </div>
        <div className="flex flex-col gap-5 md:gap-10">
            <div ref={feedRef} className="flex flex-col gap-3 md:gap-6 h-40 md:h-50 overflow-y-auto">
                {chatItems.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-black/50 dark:text-white/50 text-xs md:text-sm text-center">Say hi in the chat — this is where the room comes alive.</p>
                  </div>
                ) : (
                  chatItems.map((entry) => {
                    const actor = entry?.actor || null;
                    const avatar = actor ? getProfileAvatar(actor) : "/user1.jpg";
                    const username = actor?.username ? `@${actor.username}` : actor?.fullName || "Someone";
                    const time = formatChatTime(entry?.createdAt);
                    let body = entry?.body || "";
                    let accent = "text-black dark:text-white";
                    if (entry?.type === "like") {
                      body = "tapped a heart ❤️";
                      accent = "text-red100 dark:text-red100 italic";
                    } else if (entry?.type === "tip") {
                      const meta = entry?.metadata || {};
                      const gift = meta.giftName || "a gift";
                      const amount = formatCurrencyAmount(meta.amount, meta.currency);
                      body = entry?.body
                        ? `sent ${gift} · ${amount} — "${entry.body}"`
                        : `sent ${gift} · ${amount}`;
                      accent = "text-orange100 dark:text-orange100 italic";
                    }
                    return (
                      <div key={entry.id} className="flex items-start gap-2">
                        <img src={avatar} alt="" className="w-7 md:w-12 h-7 md:h-12 rounded-full object-cover"/>
                        <div className="flex flex-col gap-1">
                            <p className="text-black dark:text-white text-[13px] md:text-base">{username}</p>
                            <span className={`text-xs md:text-sm max-w-[30ch] ${accent}`}>{body} {time && <span className="text-black/50 dark:text-white/40 text-[10px] ml-1">{time}</span>}</span>
                        </div>
                    </div>);
                  })
                )}
            </div>
            <form onSubmit={handleSubmit} className="py-2 md:py-4 px-4 flex gap-1 md:gap-2 w-60 md:w-full items-center bg-slate150 dark:bg-slate300 rounded-full">
                <input type="text" name="" id="" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." className="text-sm md:text-base font-medium outline-none w-full md:w-auto flex-1 bg-transparent"/>
                <button type="button"><CiFaceSmile className="text-black dark:text-white w-5 md:w-6 h-5 md:h-6" /></button>
                <button type="submit" disabled={submitting} className="bg-orange100 py-1 md:py-3 px-1 md:px-3 rounded-full flex items-center justify-center shrink-0 disabled:opacity-60"><TbSend2 className="w-6 h-6 text-black" /></button>
            </form>
        </div>
    </div>
  </div>;
}

export default LiveChat;
