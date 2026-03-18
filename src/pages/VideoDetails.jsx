import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { BsCcSquare } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineFullscreen } from "react-icons/md";
import { FaRegThumbsDown } from "react-icons/fa";
import { FaRegThumbsUp } from "react-icons/fa";
import { LuArrowRightFromLine } from "react-icons/lu";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoMdMenu } from "react-icons/io";
import Logo from '../components/Logo';
import {  HiSearch, HiPlus } from "react-icons/hi";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import Sidebar from "../components/Layout/Sidebar";

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




export default function VideoDetails() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(true);
  const [showMenu, setShowMenu] = useState(false)

  function handleToggleMenu(){
    setShowMenu(prev => !prev)
  }


  return (
    <div 
      className="flex flex-col w-full min-h-screen">

      {/* ══════════════════════════════
          MOBILE LAYOUT
      ══════════════════════════════ */}
      <div className="flex flex-col md:hidden w-full">

        {/* Mobile topbar */}
        <div
          className="flex items-center justify-between px-4 py-3
                     sticky top-0 z-10 border-b"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center"
            
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
            
            <button className="w-8 h-8 flex items-center justify-center">
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
              <IoSettingsSharp />
            </button>
          </div>
          <div className="absolute bottom-3 right-3">
            <button className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center">
              <MdOutlineFullscreen className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content below video */}
        <div className="px-4 py-4 flex flex-col gap-4">

          {/* Title + Subscribe */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <h2 className="text-xl font-inter text-black200 font-semibold">
                GRWM to code
              </h2>
              <p className="text-sm text-slate50 font-inter font-medium">
                164.3M views
              </p>
            </div>
            <button
              onClick={() => setSubscribed((s) => !s)}
              className="shrink-0 px-4 py-3 rounded-full font-medium
                         text-sm transition-colors bg-orange100 text-black200 font-inter"
            >
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mb-6">
                    <div className="bg-white300 rounded-full flex items-center gap-4 px-5 py-3">
              <button
                onClick={() => setLiked((l) => !l)}
                className="flex items-center gap-1.5
                           font-inter text-sm font-medium transition-colors"
              >
                <FaRegThumbsUp className="text-slate100 w-4 h-4"/> 344
              </button>
              <button
                className=" rounded-full"
              >
                <FaRegThumbsDown className="text-slate100 w-4 h-4"/>
              </button>
              </div>
              {["Share", "Save", "Report"].map((label) => (
                <button
                  key={label}
                  className="flex items-center gap-1.5 px-4 py-3 font-inter rounded-full
                             bg-white300 text-sm text-slate100 font-medium transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>

          {/* Comment input */}
          <div className="px-4 py-3" >
              <div
                className="flex items-center gap-2 rounded-full px-5 py-4 bg-white300 text-slate50"
                
              >
                <img src={avatar} alt="me"
                  className="w-6 h-6 rounded-full object-cover shrink-0" />
                <input
                  type="text"
                  placeholder="Tell the creator what you think!"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="bg-transparent outline-none text-sm font-medium flex-1 text-slate50 font-inter "
                  
                />
              </div>
            </div>

          {/* Comments toggle */}
          <button
            onClick={() => setShowComments((s) => !s)}
            className="flex items-center gap-1.5 text-base font-semibold text-black200 font-inter"
          >
            Comments (37)
            <MdKeyboardArrowDown className="w-4 h-4"/>
          </button>

          {/* Comments list */}
          {showComments && (
            <div className="flex flex-col gap-3">
              {comments.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="flex gap-2.5 p-4 items-start bg-white300 rounded-xl"
                >
                  <img src={avatar} alt={c.user}
                    className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold font-inter text-black200">
                        {c.user}
                      </span>
                      <span className="text-[0.65rem] font-inter text-black200">
                        {c.time}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed font-inter text-black200">
                      {c.text}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <button className="flex items-center gap-1">
                        <FaRegThumbsUp className="text-black200 w-4 h-4"/>
                        {c.likes && (
                          <span className="text-[0.65rem] font-inter text-black200">{c.likes}</span>
                        )}
                      </button>
                      <button >
                       <FaRegThumbsDown className="text-black200 w-4 h-4"/>
                      </button>
                      <button className="text-[0.68rem] font-medium font-inter text-black200">
                        Reply
                      </button>
                    </div>
                    {c.replies && (
                      <button className="text-[0.68rem] font-semibold mt-1 flex items-center font-inter">
                      <MdKeyboardArrowDown className="w-3 h-3 text-black200"/> {c.replies} Replies
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
            <div className="flex items-center gap-3">
              <p className="text-base font-medium font-inter text-black200">
                Jason Eton
              </p>
              <p className="text-xs text-slate50 font-inter">
                22k Subscribers
              </p>
            </div>
          </div>

          {/* More videos */}
          <div>
            <h3 className="text-lg font-inter text-black200 font-semibold mb-3">
              More videos from Jason
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {moreVideos.map((v) => (
                <div
                  key={v.id}
                  onClick={() => navigate(`/video/${v.id}`)}
                  className="shrink-0 w-30 cursor-pointer"
                >
                  <div className="relative w-full aspect-video h-30 rounded-xl
                                  overflow-hidden">
                    <img src={v.thumb} alt="video"
                      className="w-full h-full object-cover" />
                    <div className="absolute bottom-1.5 right-1.5 flex items-center
                                    gap-1 bg-white/50 backdrop-blur-xs backdrop-brightness-80 border-y-2 border-white text-white rounded-full
                                    px-1.5 py-1">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                      <span className="text-[0.6rem] font-medium font-inter text-white">{v.views}</span>
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
      <div className="flex gap-3">
         {showMenu && <Sidebar/>}
      
      <div className="hidden md:flex-1 md:flex flex-col w-full min-h-screen">
 
        {/* Desktop topbar */}
         <header className="flex items-center justify-between pl-15 pr-10 pb-3 pt-10
                               bg-white dark:bg-slate100
                               sticky top-0 z-10 gap-16">
                                <div className="flex items-center gap-3">
                                 <button onClick={handleToggleMenu} className="z-50 absolute top-10 left-5"><IoMdMenu className="w-6 h-6 text-black200"/></button> 
                                  <Logo />

                                </div>
                                <div className="flex items-center flex-1 justify-between">
        
              {/* Search */}
              <div className="flex items-center gap-2 w-70
                              bg-white300 dark:bg-black100
                              rounded-full px-4 py-2 border-[0.15px] border-slate700 ">
                <HiSearch className="w-4 h-4 shrink-0
                                     text-black dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-transparent outline-none border-none
                             w-full text-sm font-inter
                             text-black dark:text-slate200
                             placeholder-black dark:placeholder-slate200"
                />
              </div>
        
              {/* Right side */}
              <div className="flex items-center gap-3">
        
                {/* Create */}
                <button className="flex items-center gap-1.5
                                   bg-orange100 font-inter hover:bg-[#e09510]
                                   text-black font-semibold text-sm
                                   px-6 py-2.5 rounded-full
                                   border-none cursor-pointer
                                   transition-colors">
                  <HiPlus className="w-4 h-4" />
                  Create
                </button>
        
        
                {/* Bell */}
                <button className="w-9 h-9 flex items-center justify-center
                                   rounded-full border-none cursor-pointer
                                   bg-transparent
                                   hover:bg-gray-100 dark:hover:bg-[#2d2d2d]
                                   transition-colors">
                  <IoNotificationsOutline  className="w-5 h-5 text-black dark:text-white"/>
                </button>
        
                {/* Avatar */}
                <img
                  src="https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&q=80"
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover cursor-pointer"
                />
              </div>
              </div>
            </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left: video content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* Video player */}
            <div className="relative w-full aspect-video
                            overflow-hidden bg-black mb-4">
              <img
                src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1200&q=80"
                alt="video"
                className="w-full h-full object-cover"
              />
              <div className="absolute bg-white/80 rounded-full py-2 px-3 bottom-4 right-4 flex items-center gap-2">
                {[
                  <BsCcSquare className="w-5 h-5 text-slate100"/>,
                  <IoSettingsOutline className="w-5 h-5 text-slate100"/>,
                  <MdOutlineFullscreen className="w-5 h-5 text-slate100"/>,
                ].map((icon, i) => (
                  <button key={i}
                    className="w-9 h-9 rounded-lg flex items-center
                               justify-center hover:bg-white transition-colors">
                    
                      {icon}
                    
                  </button>
                ))}
              </div>
            </div>

            {/* Title + Subscribe */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-4">
                <img src={avatar} alt="author"
                  className="w-18 h-18 rounded-full object-cover shrink-0" />
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-inter font-semibold text-black200">
                    My life as a creator in Lagos Nigeria
                  </h2>
                  <p className="text-base font-inter text-black200 font-medium">
                    Jason Eton
                  </p>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="bg-white300 rounded-full flex items-center gap-4 px-5 py-3">
              <button
                onClick={() => setLiked((l) => !l)}
                className="flex items-center gap-1.5
                           font-inter text-sm font-medium transition-colors"
              >
                <FaRegThumbsUp className="text-slate100 w-4 h-4"/> 344
              </button>
              <button
                className=" rounded-full"
              >
                <FaRegThumbsDown className="text-slate100 w-4 h-4"/>
              </button>
              </div>
              {["Share", "Save", "Report"].map((label) => (
                <button
                  key={label}
                  className="flex items-center gap-1.5 px-4 py-3 font-inter rounded-full
                             bg-white300 text-sm text-slate100 font-medium transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
                </div>
              </div>
              <button
                onClick={() => setSubscribed((s) => !s)}
                className="shrink-0 px-8 py-3.5 rounded-full font-semibold
                           text-sm transition-colors bg-orange100 text-slate100 font-inter"
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>

            {/* About */}
            <div className="flex flex-col gap-3">
            <h3 className="text-lg font-medium font-inter text-black200 mb-3">
              About Jason
            </h3>
            <div className="rounded-xl p-4 bg-white300" >
              <p className="text-sm font-inter text-black200 mb-2">
                22k Subscribers
              </p>
              <p className="text-sm font-inter text-black200 leading-relaxed" >
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
          </div>

          {/* Right: comments panel */}
          <div
            className="w-80 lg:w-105 shrink-0 flex flex-col overflow-hidden"
            
          >
            {/* Header */}
            <div
              className="flex items-center gap-5 px-4 py-4 border-b border-t border-black200"
              
            >
              <button
                onClick={() => navigate(-1)}
                
              >
                <LuArrowRightFromLine className="text-black200 w-5 h-5"/>
              </button>
              <h3 className="font-semibold text-base font-inter text-black200">
                90 Comments
              </h3>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-6">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <img src={avatar} alt={c.user}
                    className="w-11 h-11 rounded-full object-cover shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium font-inter text-black200"
                        >
                        {c.user}
                      </span>
                      <span className="text-sm font-inter text-black200"
                        >
                        {c.time}
                      </span>
                    </div>
                    <p className="text-base font-inter text-black200 leading-relaxed"
                      >
                      {c.text}
                    </p>
                    <div className="flex items-center gap-10 mt-1.5">
                      <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1"
                        >
                        <FaRegThumbsUp className="text-black200 w-3 h-3"/>
                        {c.likes && (
                          <span className="text-sm text-black200"> {c.likes}</span>
                        )}
                      </button>
                      <button >
                        <FaRegThumbsDown className="text-black200 w-3 h-3"/>
                      </button>
                      </div>
                      <button className="text-xs font-medium font-inter text-black200"
                        >
                        Reply
                      </button>
                    </div>
                    {c.replies && (
                      <button className="text-xs font-inter text-orange100 font-semibold mt-1 flex items-center"
                        >
                       <MdKeyboardArrowDown className="text-orange100 w-4 h-4"/> {c.replies} Replies
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Comment input */}
            <div className="px-4 py-3" >
              <div
                className="flex items-center gap-2 rounded-full px-5 py-4 bg-white300 text-slate50"
                
              >
                <img src={avatar} alt="me"
                  className="w-6 h-6 rounded-full object-cover shrink-0" />
                <input
                  type="text"
                  placeholder="Tell the creator what you think!"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="bg-transparent outline-none text-sm font-medium flex-1 text-slate50 font-inter "
                  
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}