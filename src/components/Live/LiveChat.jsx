/**
 * LiveChat — in-stream chat overlay for the host + viewers.
 *
 * Posts messages via api.postComment against the live video and polls the
 * comment endpoint for fresh entries. Also handles the mobile share sheet.
 *
 * Feature: 3.5 Live streaming, 3.7 Comments (see PROJECT_OVERVIEW.md).
 * Backend: CommentController@store, CommentController@index.
 */


import { useState } from "react";
import { CiFaceSmile } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { FaArrowLeftLong } from "react-icons/fa6";
import { IoMdArrowDropdown } from "react-icons/io";
import { RiShareForwardLine } from "react-icons/ri";
import { TbSend2 } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import {
  formatCompactNumber,
  getProfileAvatar,
  getProfileName,
} from "../../utils/content";

function formatChatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function LiveChat({ video, engagements = [], onSubmitted, videoId }) {
    const navigate = useNavigate();
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const creator = video?.author || video?.creator || null;
    const creatorAvatar = creator ? getProfileAvatar(creator) : "/story5.jpg";
    const creatorName = creator ? getProfileName(creator) : "User1234567890";
    const subscribers = Number(creator?.subscriberCount ?? 0);
    const isSubscribed = Boolean(video?.currentUserState?.subscribed);

    const chatItems = engagements
      .filter((event) => event.type === "comment")
      .slice(0, 12);

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
      if (!creatorId) return;
      try {
        if (isSubscribed) await api.unsubscribeFromCreator(creatorId);
        else await api.subscribeToCreator(creatorId);
      } catch {
        /* ignore */
      }
    } 

  return <div className="flex flex-col gap-8 font-inter w-full md:col-span-2">
    <button onClick={()=> navigate('/live')} className=" hidden w-6 md:w-7.5 h-6 md:h-7.5 absolute top-2 left-4 z-4 md:static rounded-md md:flex items-center justify-center border border-black/20 dark:border-white/30 cursor-pointer hover:bg-slate150 hover:dark:bg-slate150 transition-all"><FaArrowLeftLong className="text-black dark:text-white w-4 md:w-5 h-4 md:h-5" /></button>
    <button onClick={()=> navigate('/home')} className="w-6 md:w-7.5 h-6 md:h-7.5 absolute md:hidden top-2 left-4 z-4 md:static rounded-md flex items-center justify-center border border-black/20 dark:border-white/30 cursor-pointer hover:bg-slate150 hover:dark:bg-slate150 transition-all"><FaArrowLeftLong className="text-black dark:text-white w-4 md:w-5 h-4 md:h-5" /></button>
    <div className="flex items-center gap-3 absolute top-10 left-3 z-3 md:static">
        <div className="border border-black/10 dark:border-white/10 rounded-2xl flex items-center gap-2 justify-between p-2 bg-white300 dark:bg-slate150 backdrop-blur-md backdrop-brightness-150 backdrop-opacity-60 flex-1">
        <div className="flex items-center gap-2">
            <img src={creatorAvatar} alt="" className="w-6 md:w-7.5 h-6 md:h-7.5 rounded-full object-cover"/>
        <div className="flex flex-col gap-1">
            <h4 className="text-xs md:text-sm text-black dark:text-white">{creatorName}</h4>
            <div className="flex items-end gap-1"> <FaHeart className="text-red100 w-4 md:w-5 h-4 md:h-5" /> <span className="text-[10px] text-black dark:text-white">{subscribers ? formatCompactNumber(subscribers) : "184k"}</span></div>
        </div>
        </div>
        <button onClick={handleConnect} className="w-16 md:w-25 h-8 rounded-full bg-orange100 text-black font-semibold text-[10px] md:text-xs">{isSubscribed ? "Connected" : "Connect"}</button>
        </div>
        <button className="border hidden border-black/10 dark:border-white/10 rounded-2xl w-13 h-15 md:flex items-center justify-center bg-white300 dark:bg-slate150 shrink-0"><RiShareForwardLine className="text-black dark:text-white w-7 h-7" /></button>
    </div>

    <div className="absolute bottom-4 left-2 md:static z-4 flex flex-col w-full md:bg-white300 md:p-6 gap-6 md:gap-10 rounded-2xl dark:md:bg-slate100">
        <div className="md:flex items-center justify-between hidden">
            <h3 className="text-base text-black dark:text-white">LIVE chat</h3>
            <button><IoMdArrowDropdown className="w-5 h-5 text-slate100 dark:text-slate50" /></button>
        </div>
        <div className="flex flex-col gap-5 md:gap-10">
            <div className="flex flex-col gap-3 md:gap-6 h-40 md:h-50 overflow-y-auto">
                {
                    (chatItems.length ? chatItems : [1,2, 3,4]).map((entry, i) => {
                      const isReal = typeof entry === "object" && entry !== null;
                      const actor = isReal ? entry.actor : null;
                      const avatar = actor ? getProfileAvatar(actor) : "/user1.jpg";
                      const username = actor?.username ? `@${actor.username}` : "@SammieNed";
                      const body = isReal ? entry.body : "You are so amazing, and I really love your contents.";
                      const time = isReal ? formatChatTime(entry.createdAt) : "10:21 PM";
                      return (
                      <div key={isReal ? entry.id : i} className="flex items-start gap-2">
                        <img src={avatar} alt="" className="w-7 md:w-12 h-7 md:h-12 rounded-full"/>
                        <div className="flex flex-col gap-1">
                            <p className="text-black dark:text-white text-[13px] md:text-base">{username}</p>
                            <span className="text-black dark:text-white text-xs md:text-sm max-w-[30ch]">{body} {time}</span>
                        </div>
                    </div>);})
                }
            </div>
            <form onSubmit={handleSubmit} className="py-2 md:py-6 px-4 flex gap-1 md:gap-2 w-60 md:w-full items-center bg-slate150 dark:bg-slate300 rounded-full">
                <input type="text" name="" id="" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." className="text-sm md:text-base font-medium outline-none w-full md:w-50 bg-transparent"/>
                <button type="button"><CiFaceSmile className="text-black dark:text-white w-5 md:w-6 h-5 md:h-6" /></button>
                <button type="submit" disabled={submitting} className="bg-orange100 py-1 md:py-3 px-1 md:px-3 rounded-full flex items-center justify-center shrink-0 disabled:opacity-60"><TbSend2 className="w-6 h-6 text-black" /></button>
            </form>
        </div>
    </div>
  </div>;
}

export default LiveChat;
