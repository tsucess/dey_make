import { useState } from "react";
import { BiDislike, BiLike } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import {
  FALLBACK_AVATAR,
  formatRelativeTime,
  getProfileAvatar,
  getProfileName,
} from "../../utils/content";
import { CiFaceSmile } from "react-icons/ci";
import { TbSend2 } from "react-icons/tb";

const STATIC_COMMENTS = [
  { img: "/user1.jpg", name: "@SammieNed", time: "10 days ago", desc: "You are so amazing, and I really love your contents.", likes: 344, dislikes: 44, replies: 5 },
  { img: "/user1.jpg", name: "@SammieNed", time: "10 days ago", desc: "You are so amazing, and I really love your contents.", likes: 0, dislikes: 0, replies: 0 },
  { img: "/user1.jpg", name: "@SammieNed", time: "10 days ago", desc: "You are so amazing, and I really love your contents.", likes: 344, dislikes: 0, replies: 5 },
  { img: "/user1.jpg", name: "@SammieNed", time: "10 days ago", desc: "You are so amazing, and I really love your contents.", likes: 344, dislikes: 44, replies: 0 },
];

function normalize(comment) {
  if (!comment) return null;
  if (comment.__static) return comment;

  const author = comment.user || comment.author || null;
  const displayName = getProfileName(author);
  return {
    id: comment.id,
    img: getProfileAvatar(author) || FALLBACK_AVATAR,
    name: displayName?.startsWith("@") ? displayName : `@${displayName}`,
    time: formatRelativeTime(comment.createdAt),
    desc: comment.body || comment.text || "",
    likes: Number(comment.likes || 0),
    dislikes: Number(comment.dislikes || 0),
    replies: Number(comment.repliesCount || 0),
  };
}

function Comment({
  comments,
  commentsCount,
  currentUserAvatar,
  onClose,
  onPost,
  placeholder = "Tell the creator what you think!",
}) {
  const isDynamic = Array.isArray(comments);
  const list = isDynamic
    ? comments.map(normalize).filter(Boolean)
    : STATIC_COMMENTS.map((entry) => ({ ...entry, __static: true }));
  const headerCount = typeof commentsCount === "number" ? commentsCount : (isDynamic ? list.length : 90);
  const composerAvatar = currentUserAvatar || "/user1.jpg";
  const [draft, setDraft] = useState("");

  function submit(event) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || !onPost) return;
    onPost(trimmed);
    setDraft("");
  }

  return (
    <div className="hidden md:flex flex-col gap-4 w-full md:w-1/3 ">
      <div className="border-y border-black dark:border-white py-4 flex items-center justify-between px-4">
        <h3 className="text-xl font-inter text-black dark:text-white">
          {headerCount} Comments
        </h3>
        <button onClick={onClose}>
          <IoClose className="w-6 h-6 text-black dark:text-white" />
        </button>
      </div>
      <div className="h-full flex flex-col gap-8">
        <div className="flex flex-col gap-6 overflow-y-auto max-h-120">
          {list.map(
            ({ id, img, name, time, desc, likes, dislikes, replies }, i) => (
              <div key={id ?? i} className="flex gap-4 items-start">
                <img
                  src={img}
                  alt={name}
                  className="w-12.5 h-12.5 rounded-full"
                />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-black dark:text-white text-base font-inter">
                      {name}
                    </span>
                    <span className="text-black dark:text-white text-base font-inter">
                      {time}
                    </span>
                  </div>
                  <p className="text-black dark:text-white text-lg font-inter">
                    {desc}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <BiLike className="w-4 h-4 text-black dark:text-white" />
                      {likes > 0 && (
                        <span className="text-black dark:text-white text-sm font-inter">
                          {likes}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <BiDislike className="w-4 h-4 text-black dark:text-white" />
                      {dislikes > 0 && (
                        <span className="text-black dark:text-white text-sm font-inter">
                          {dislikes}
                        </span>
                      )}
                    </div>
                    <button className="text-black dark:text-white text-sm font-inter">
                      Reply
                    </button>
                  </div>
                  {replies > 0 && (
                    <div className="flex items-center gap-2 text-orange100 text-sm">
                      {" "}
                      <MdOutlineKeyboardArrowDown className="w-5 h-5" /> Replies
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
        <form onSubmit={submit} className="mt-auto flex items-center py-3 px-4 rounded-full w-full gap-3 bg-slate150 dark:bg-black100 max-h-17.5 h-full">
          <img
            src={composerAvatar}
            alt=""
            className="w-7 h-7 rounded-full shrink-0"
          />
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="text-sm font-inter text-black dark:text-white flex-1 bg-transparent outline-none"
            placeholder={placeholder}
          />
          <button><CiFaceSmile className="text-black dark:text-white w-6 h-6" /></button>
                <button className="bg-orange100 py-3 px-3 rounded-full flex items-center justify-center shrink-0"><TbSend2 className="w-6 h-6 text-black" /></button>
        </form>
      </div>
    </div>
  );
}

export default Comment;
