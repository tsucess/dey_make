import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { BsCcSquare } from "react-icons/bs";

const avatar =
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&q=80";

const comments = [
  { id: 1, user: "@SammieNed", time: "10 days ago", text: "You are so amazing, and I really love your contents.", likes: 344, replies: 5 },
  { id: 2, user: "@SammieNed", time: "10 days ago", text: "You are so amazing, and I really love your contents.", likes: null, replies: null },
  { id: 3, user: "@SammieNed", time: "10 days ago", text: "You are so amazing, and I really love your contents.", likes: 344, replies: 5 },
  { id: 4, user: "@SammieNed", time: "10 days ago", text: "You are so amazing, and I really love your contents.", likes: null, replies: null },
  { id: 5, user: "@SammieNed", time: "10 days ago", text: "You are so amazing, and I really love your contents.", likes: 344, replies: 5 },
  { id: 6, user: "@SammieNed", time: "10 days ago", text: "You are so amazing, and I really love your contents.", likes: null, replies: null },
];

const moreVideos = [
  { id: 10, thumb: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&q=80", views: "164.3M" },
  { id: 11, thumb: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&q=80", views: "164.3M" },
  { id: 12, thumb: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&q=80", views: "164.3M" },
];

function ThumbUpIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  );
}

function ThumbDownIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
    </svg>
  );
}

export default function VideoDetails() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(true);

  // const bg         = isDark ? "#121212" : "#ffffff";
  // const bgSecond   = isDark ? "#1e1e1e" : "#f9fafb";
  // const bgInput    = isDark ? "#2d2d2d" : "#f9fafb";
  // const border     = isDark ? "#2d2d2d" : "#f3f4f6";
  // const borderMid  = isDark ? "#374151" : "#e5e7eb";
  // const textPrim   = isDark ? "#ffffff" : "#111827";
  // const textSecond = isDark ? "#9ca3af" : "#6b7280";
  // const textMuted  = isDark ? "#6b7280" : "#9ca3af";
  // const btnBorder  = isDark ? "#374151" : "#e5e7eb";

  return (
    <div style={{ background: bg }}
      className="flex flex-col w-full min-h-screen">

      {/* ══════════════════════════════
          MOBILE LAYOUT
      ══════════════════════════════ */}
      <div className="flex flex-col md:hidden w-full">

        {/* Mobile topbar */}
        <div
          className="flex items-center justify-between px-4 py-3
                     sticky top-0 z-10 border-b"
          style={{ background: bg, borderColor: border }}
        >
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center"
            style={{ color: textSecond }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <h1 className="text-[1.5rem] font-bold text-[#f5a623] font-serif">
            <span className="italic">D</span>eyMake
          </h1>

          <div className="flex items-center gap-1">
            
            <button className="w-8 h-8 flex items-center justify-center"
              style={{ color: textSecond }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Video player */}
        <div className="relative w-full aspect-video bg-black">
          <img
            src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=80"
            alt="video"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <button className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center">
              <BsCcSquare />
            </button>
            <button className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#374151" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83
                         2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1
                         1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65
                         1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65
                         1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1
                         0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82
                         l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9
                         4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65
                         1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2
                         0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65
                         1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0
                         0 0-1.51 1z"/>
              </svg>
            </button>
          </div>
          <div className="absolute bottom-3 right-3">
            <button className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#374151" strokeWidth="2" strokeLinecap="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3
                         m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content below video */}
        <div className="px-4 py-4 flex flex-col gap-4"
          style={{ background: bg }}>

          {/* Title + Subscribe */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold" style={{ color: textPrim }}>
                GRWM to code
              </h2>
              <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                164.3M views
              </p>
            </div>
            <button
              onClick={() => setSubscribed((s) => !s)}
              className="shrink-0 px-4 py-2 rounded-full font-semibold
                         text-sm transition-colors"
              style={{
                background: subscribed ? (isDark ? "#374151" : "#e5e7eb") : "#f5a623",
                color: subscribed ? (isDark ? "#d1d5db" : "#374151") : "white",
              }}
            >
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setLiked((l) => !l)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                         border text-xs font-medium transition-colors"
              style={{
                borderColor: liked ? "#f5a623" : btnBorder,
                color: liked ? "#f5a623" : textSecond,
              }}
            >
              <ThumbUpIcon size={13} /> 344
            </button>
            <button
              className="flex items-center justify-center w-8 h-8
                         rounded-full border"
              style={{ borderColor: btnBorder, color: textSecond }}
            >
              <ThumbDownIcon size={13} />
            </button>
            {["Share", "Save", "Report"].map((label) => (
              <button
                key={label}
                className="px-3 py-1.5 rounded-full border text-xs font-medium"
                style={{ borderColor: btnBorder, color: textSecond }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Comment input */}
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2.5 border"
            style={{ background: bgInput, borderColor: borderMid }}
          >
            <img src={avatar} alt="me"
              className="w-6 h-6 rounded-full object-cover shrink-0" />
            <input
              type="text"
              placeholder="Tell the creator what you think!"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-transparent outline-none text-xs flex-1"
              style={{
                color: textPrim,
                caretColor: "#f5a623",
              }}
            />
          </div>

          {/* Comments toggle */}
          <button
            onClick={() => setShowComments((s) => !s)}
            className="flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: textPrim }}
          >
            Comments (37)
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              className={`transition-transform ${showComments ? "rotate-180" : ""}`}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {/* Comments list */}
          {showComments && (
            <div className="flex flex-col gap-3">
              {comments.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="flex gap-2.5 rounded-xl p-3"
                  style={{ background: bgSecond }}
                >
                  <img src={avatar} alt={c.user}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold"
                        style={{ color: textPrim }}>
                        {c.user}
                      </span>
                      <span className="text-[0.65rem]"
                        style={{ color: textMuted }}>
                        {c.time}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed"
                      style={{ color: textSecond }}>
                      {c.text}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <button className="flex items-center gap-1"
                        style={{ color: textMuted }}>
                        <ThumbUpIcon size={12} />
                        {c.likes && (
                          <span className="text-[0.65rem]">{c.likes}</span>
                        )}
                      </button>
                      <button style={{ color: textMuted }}>
                        <ThumbDownIcon size={12} />
                      </button>
                      <button className="text-[0.68rem] font-medium"
                        style={{ color: textSecond }}>
                        Reply
                      </button>
                    </div>
                    {c.replies && (
                      <button className="text-[0.68rem] font-semibold mt-1"
                        style={{ color: "#f5a623" }}>
                        ▾ {c.replies} Replies
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Author info */}
          <div className="flex items-center gap-3 py-2">
            <img src={avatar} alt="Jason Eton"
              className="w-11 h-11 rounded-full object-cover" />
            <div>
              <p className="text-sm font-bold" style={{ color: textPrim }}>
                Jason Eton
              </p>
              <p className="text-xs" style={{ color: textMuted }}>
                22k Subscribers
              </p>
            </div>
          </div>

          {/* More videos */}
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: textPrim }}>
              More videos from Jason
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {moreVideos.map((v) => (
                <div
                  key={v.id}
                  onClick={() => navigate(`/video/${v.id}`)}
                  className="shrink-0 w-30 cursor-pointer"
                >
                  <div className="relative w-full aspect-video rounded-xl
                                  overflow-hidden"
                    style={{ background: isDark ? "#2d2d2d" : "#e5e7eb" }}>
                    <img src={v.thumb} alt="video"
                      className="w-full h-full object-cover" />
                    <div className="absolute bottom-1.5 right-1.5 flex items-center
                                    gap-1 bg-black/60 text-white rounded-full
                                    px-1.5 py-0.5">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                      <span className="text-[0.6rem] font-medium">{v.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════
          DESKTOP LAYOUT
      ══════════════════════════════ */}
      <div className="hidden md:flex flex-col w-full min-h-screen"
        style={{ background: bg }}>

        {/* Desktop topbar */}
        <header
          className="flex items-center justify-between px-6 py-3
                     sticky top-0 z-10 border-b"
          style={{ background: bg, borderColor: border }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              style={{ color: textSecond }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              <h1 className="text-[1.7rem] font-bold text-[#f5a623] font-serif
                             leading-none">
                <span className="italic">D</span>eyMake
              </h1>
              <p className="text-[0.58rem] tracking-[0.15em] uppercase
                            text-[#f5a623] font-serif">
                Content By You, Loved By All
              </p>
            </div>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2 w-70"
            style={{ background: bgSecond }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke={textMuted} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search"
              className="bg-transparent outline-none text-sm flex-1"
              style={{ color: textPrim }} />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 bg-[#f5a623] text-white
                                font-semibold text-sm px-4 py-2 rounded-full
                                hover:bg-[#e09510] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create
            </button>

            {/* Dark mode toggle */}
            {/* <ThemeToggle /> */}

            <button className="w-9 h-9 flex items-center justify-center
                                rounded-full transition-colors"
              style={{ color: textSecond }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            <img src={avatar} alt="avatar"
              className="w-9 h-9 rounded-full object-cover cursor-pointer" />
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left: video content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* Video player */}
            <div className="relative w-full aspect-video rounded-2xl
                            overflow-hidden bg-black mb-4">
              <img
                src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1200&q=80"
                alt="video"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                {[
                  <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 15h4"/></>,
                  <><circle cx="12" cy="12" r="3"/></>,
                  <><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></>,
                ].map((icon, i) => (
                  <button key={i}
                    className="w-9 h-9 bg-white/80 rounded-lg flex items-center
                               justify-center hover:bg-white transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#374151" strokeWidth="2" strokeLinecap="round">
                      {icon}
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Title + Subscribe */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <img src={avatar} alt="author"
                  className="w-11 h-11 rounded-full object-cover shrink-0" />
                <div>
                  <h2 className="text-base font-bold" style={{ color: textPrim }}>
                    My life as a creator in Lagos Nigeria
                  </h2>
                  <p className="text-sm" style={{ color: textSecond }}>
                    Jason Eton
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubscribed((s) => !s)}
                className="shrink-0 px-5 py-2 rounded-full font-semibold
                           text-sm transition-colors"
                style={{
                  background: subscribed ? (isDark ? "#374151" : "#e5e7eb") : "#f5a623",
                  color: subscribed ? (isDark ? "#d1d5db" : "#374151") : "white",
                }}
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setLiked((l) => !l)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full
                           border text-sm font-medium transition-colors"
                style={{
                  borderColor: liked ? "#f5a623" : btnBorder,
                  color: liked ? "#f5a623" : textSecond,
                }}
              >
                <ThumbUpIcon /> 344
              </button>
              <button
                className="w-9 h-9 rounded-full border flex items-center
                           justify-center"
                style={{ borderColor: btnBorder, color: textSecond }}
              >
                <ThumbDownIcon />
              </button>
              {["Share", "Save", "Report"].map((label) => (
                <button
                  key={label}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full
                             border text-sm font-medium transition-colors"
                  style={{ borderColor: btnBorder, color: textSecond }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* About */}
            <h3 className="text-base font-bold mb-3" style={{ color: textPrim }}>
              About Jason
            </h3>
            <div className="rounded-xl p-4" style={{ background: bgSecond }}>
              <p className="text-sm font-semibold mb-2" style={{ color: textPrim }}>
                22k Subscribers
              </p>
              <p className="text-sm leading-relaxed" style={{ color: textSecond }}>
                A student of the University of Lagos and a growing content
                creator who enjoys sharing real, relatable moments through
                his work. He creates content that feels easy to connect with,
                mixing creativity with a natural sense of storytelling. Jason
                is constantly learning, experimenting with new ideas, and
                building a personal brand that reflects who he is and the
                experiences he cares about.
              </p>
            </div>
          </div>

          {/* Right: comments panel */}
          <div
            className="w-[320px] shrink-0 border-l flex flex-col overflow-hidden"
            style={{ borderColor: border }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-4 border-b"
              style={{ borderColor: border }}
            >
              <button
                onClick={() => navigate(-1)}
                style={{ color: textSecond }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
              </button>
              <h3 className="font-bold text-base" style={{ color: textPrim }}>
                90 Comments
              </h3>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <img src={avatar} alt={c.user}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold"
                        style={{ color: textPrim }}>
                        {c.user}
                      </span>
                      <span className="text-[0.68rem]"
                        style={{ color: textMuted }}>
                        {c.time}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed"
                      style={{ color: textSecond }}>
                      {c.text}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <button className="flex items-center gap-1"
                        style={{ color: textMuted }}>
                        <ThumbUpIcon size={13} />
                        {c.likes && (
                          <span className="text-[0.68rem]">{c.likes}</span>
                        )}
                      </button>
                      <button style={{ color: textMuted }}>
                        <ThumbDownIcon size={13} />
                      </button>
                      <button className="text-[0.72rem] font-medium"
                        style={{ color: textSecond }}>
                        Reply
                      </button>
                    </div>
                    {c.replies && (
                      <button className="text-[0.72rem] font-semibold mt-1"
                        style={{ color: "#f5a623" }}>
                        ▾ {c.replies} Replies
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Comment input */}
            <div className="px-4 py-3 border-t" style={{ borderColor: border }}>
              <div
                className="flex items-center gap-2 rounded-full px-4 py-2.5 border"
                style={{ background: bgInput, borderColor: borderMid }}
              >
                <img src={avatar} alt="me"
                  className="w-6 h-6 rounded-full object-cover shrink-0" />
                <input
                  type="text"
                  placeholder="Tell the creator what you think!"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="bg-transparent outline-none text-xs flex-1"
                  style={{ color: textPrim }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}