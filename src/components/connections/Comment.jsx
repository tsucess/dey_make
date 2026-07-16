import { useRef, useState } from "react";
import { BiDislike, BiLike, BiSolidDislike, BiSolidLike } from "react-icons/bi";
import { CiFaceSmile } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from "react-icons/md";
import { TbSend2 } from "react-icons/tb";
import {
  FALLBACK_AVATAR,
  formatRelativeTime,
  getProfileAvatar,
  getProfileName,
} from "../../utils/content";

const STATIC_COMMENTS = [
  { img: "/user1.jpg", name: "@SammieNed", time: "10 days ago", desc: "You are so amazing, and I really love your contents.", likes: 344, dislikes: 44, replies: 5 },
  { img: "/user1.jpg", name: "@SammieNed", time: "10 days ago", desc: "You are so amazing, and I really love your contents.", likes: 0, dislikes: 0, replies: 0 },
  { img: "/user1.jpg", name: "@SammieNed", time: "10 days ago", desc: "You are so amazing, and I really love your contents.", likes: 344, dislikes: 0, replies: 5 },
  { img: "/user1.jpg", name: "@SammieNed", time: "10 days ago", desc: "You are so amazing, and I really love your contents.", likes: 344, dislikes: 44, replies: 0 },
];

const EMOJI_SET = ["😀", "😂", "😍", "😎", "😭", "😡", "👍", "👎", "🙏", "🔥", "❤️", "💯", "🎉", "👏", "💀", "😴"];

function normalize(comment) {
  if (!comment) return null;
  if (comment.__static) return comment;
  const author = comment.user || comment.author || null;
  const displayName = getProfileName(author);
  const state = comment.currentUserState || {};
  return {
    id: comment.id,
    parentId: comment.parentId ?? null,
    img: getProfileAvatar(author) || FALLBACK_AVATAR,
    name: displayName?.startsWith("@") ? displayName : `@${displayName}`,
    time: formatRelativeTime(comment.createdAt),
    desc: comment.body || comment.text || "",
    likes: Number(comment.likes || 0),
    dislikes: Number(comment.dislikes || 0),
    replies: Number(comment.repliesCount || 0),
    liked: Boolean(state.liked),
    disliked: Boolean(state.disliked),
  };
}

function Comment({
  comments,
  commentsCount,
  currentUserAvatar,
  onClose,
  onPost,
  onToggleLike,
  onToggleDislike,
  onLoadReplies,
  onPostReply,
  repliesByComment,
  placeholder = "Tell the creator what you think!",
}) {
  const isDynamic = Array.isArray(comments);
  const list = isDynamic
    ? comments.map(normalize).filter(Boolean)
    : STATIC_COMMENTS.map((entry) => ({ ...entry, __static: true }));
  const headerCount = typeof commentsCount === "number" ? commentsCount : (isDynamic ? list.length : 90);
  const composerAvatar = currentUserAvatar || "/user1.jpg";
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [replyOpen, setReplyOpen] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const inputRef = useRef(null);

  function submit(event) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || !onPost) return;
    onPost(trimmed);
    setDraft("");
    setEmojiOpen(false);
  }

  function insertEmoji(emoji) {
    const input = inputRef.current;
    if (!input) { setDraft((prev) => prev + emoji); return; }
    const start = input.selectionStart ?? draft.length;
    const end = input.selectionEnd ?? draft.length;
    const next = draft.slice(0, start) + emoji + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      input.focus();
      const cursor = start + emoji.length;
      input.setSelectionRange(cursor, cursor);
    });
  }

  function toggleReplies(commentId) {
    setExpanded((prev) => {
      const next = { ...prev, [commentId]: !prev[commentId] };
      if (next[commentId] && onLoadReplies) onLoadReplies(commentId);
      return next;
    });
  }

  function toggleReplyComposer(commentId) {
    setReplyOpen((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  }

  function submitReply(event, commentId) {
    event.preventDefault();
    const body = (replyDrafts[commentId] || "").trim();
    if (!body || !onPostReply) return;
    onPostReply(commentId, body);
    setReplyDrafts((prev) => ({ ...prev, [commentId]: "" }));
    setReplyOpen((prev) => ({ ...prev, [commentId]: false }));
    setExpanded((prev) => ({ ...prev, [commentId]: true }));
  }

  return (
    <div className="flex flex-col gap-4 w-full md:w-1/3 font-inter">
        <div className="border-y border-black dark:border-white py-4 flex items-center justify-between px-4">
            <h3 className="text-xl font-inter text-black dark:text-white">{headerCount} Comments</h3>
            <button onClick={onClose}><IoClose className="w-6 h-6 text-black dark:text-white"/></button>
        </div>
        <div className="h-full flex flex-col gap-8">
            <div className="flex flex-col gap-6 overflow-y-auto max-h-120" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {
                    list.map(({ id, img, name, time, desc, likes, dislikes, replies, liked, disliked }, i) => {
                        const isStatic = !id;
                        const isExpanded = Boolean(expanded[id]);
                        const isReplyOpen = Boolean(replyOpen[id]);
                        const replyList = (repliesByComment && id ? repliesByComment[id] : null) || null;
                        return (
                        <div key={id ?? i} className="flex gap-4 items-start">
                            <img src={img} alt={name} className="w-12.5 h-12.5 rounded-full" />
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-black dark:text-white text-sm font-inter">{name}</span>
                                    <span className="text-black dark:text-white text-sm font-inter">{time}</span>
                                </div>
                                <p className="text-black dark:text-white text-lg font-inter">{desc}</p>
                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={() => !isStatic && onToggleLike && onToggleLike(id, liked)} className="flex items-center gap-2">
                                        {liked
                                          ? <BiSolidLike className="w-4 h-4 text-orange100"/>
                                          : <BiLike className="w-4 h-4 text-black dark:text-white"/>}
                                        {likes > 0 && <span className="text-black dark:text-white text-sm font-inter">{likes}</span>}
                                    </button>
                                    <button type="button" onClick={() => !isStatic && onToggleDislike && onToggleDislike(id, disliked)} className="flex items-center gap-2">
                                        {disliked
                                          ? <BiSolidDislike className="w-4 h-4 text-orange100"/>
                                          : <BiDislike className="w-4 h-4 text-black dark:text-white"/>}
                                        {dislikes > 0 && <span className="text-black dark:text-white text-sm font-inter">{dislikes}</span>}
                                    </button>
                                    <button type="button" onClick={() => !isStatic && toggleReplyComposer(id)} className="text-black dark:text-white text-sm font-inter">Reply</button>
                                </div>
                                {isReplyOpen && (
                                  <form onSubmit={(event) => submitReply(event, id)} className="flex items-center py-2 px-3 rounded-full w-full gap-2 bg-slate150 dark:bg-black100">
                                    <img src={composerAvatar} alt="" className="w-6 h-6 rounded-full shrink-0" />
                                    <input type="text" value={replyDrafts[id] || ""} onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [id]: event.target.value }))} placeholder={`Reply to ${name}`} className="text-sm font-inter text-black dark:text-white flex-1 bg-transparent outline-none" />
                                    <button type="submit" className="bg-orange100 py-1.5 px-2 rounded-full flex items-center justify-center shrink-0"><TbSend2 className="w-4 h-4 text-black" /></button>
                                  </form>
                                )}
                                {replies > 0 && (
                                  <button type="button" onClick={() => !isStatic && toggleReplies(id)} className="flex items-center gap-2 text-orange100 text-sm">
                                    {isExpanded ? <MdOutlineKeyboardArrowUp className="w-5 h-5" /> : <MdOutlineKeyboardArrowDown className="w-5 h-5" />}
                                    {isExpanded ? "Hide replies" : `Replies (${replies})`}
                                  </button>
                                )}
                                {isExpanded && Array.isArray(replyList) && replyList.length > 0 && (
                                  <div className="flex flex-col gap-4 pl-2">
                                    {replyList.map(normalize).filter(Boolean).map((reply) => (
                                      <div key={reply.id} className="flex gap-3 items-start">
                                        <img src={reply.img} alt={reply.name} className="w-8 h-8 rounded-full" />
                                        <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-black dark:text-white text-sm font-inter">{reply.name}</span>
                                            <span className="text-black dark:text-white text-xs font-inter">{reply.time}</span>
                                          </div>
                                          <p className="text-black dark:text-white text-sm font-inter">{reply.desc}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>
                        </div>
                        );
                    })
                }
            </div>
            <div className="mt-auto relative">
              {emojiOpen && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-black100 rounded-2xl border border-slate150 p-3 grid grid-cols-8 gap-2 z-10">
                  {EMOJI_SET.map((emoji) => (
                    <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} className="text-xl hover:bg-slate150 dark:hover:bg-black rounded">{emoji}</button>
                  ))}
                </div>
              )}
              <form onSubmit={submit} className="flex items-center py-3 px-4 rounded-full w-full gap-2 bg-slate150 dark:bg-black100 max-h-17.5 h-full">
                  <img src={composerAvatar} alt="" className="w-6 h-6 rounded-full shrink-0" />
                  <input ref={inputRef} type="text" value={draft} onChange={(event) => setDraft(event.target.value)} className="text-sm font-inter text-black dark:text-white w-40 bg-transparent outline-none" placeholder={placeholder} />
                  <button type="button" onClick={() => setEmojiOpen((prev) => !prev)}><CiFaceSmile className="text-black dark:text-white w-5 h-5" /></button>
                  <button type="submit" className="bg-orange100 py-2 px-2 rounded-full flex items-center justify-center shrink-0"><TbSend2 className="w-5 h-5 text-black" /></button>
              </form>
            </div>
        </div>
    </div>
  )
}

export default Comment