import { IoCellular, IoWifi, IoBatteryHalf } from "react-icons/io5";
import { HiOutlineSun, HiOutlineSearch, HiOutlineBell } from "react-icons/hi";
import {
  HiOutlineHome,
  HiOutlineChartBar,
  HiOutlineChatAlt2,
  HiOutlineCog,
  HiOutlineUser,
} from "react-icons/hi";

const vrImage =
  "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=80";
const avatarM =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80";

function PhoneMockup() {
  return (
    <div
      className="flex-shrink-0 bg-white overflow-hidden"
      style={{
        width: "190px",
        borderRadius: "36px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
      }}
    >
      {/* Status bar */}
      <div className="flex items-center px-3.5 pt-2.5 pb-1 bg-white">
        <div className="flex-1">
          <span className="text-[10px] font-bold text-gray-900">9:41</span>
        </div>
        <div className="flex justify-center">
          <div className="w-12 h-3.5 bg-black rounded-full" />
        </div>
        <div className="flex-1 flex items-center justify-end gap-[3px]">
          <IoWifi size={11} color="#1a1a1a" />
          <IoCellular size={11} color="#1a1a1a" />
          <IoBatteryHalf size={13} color="#1a1a1a" />
        </div>
      </div>

      {/* App header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-white">
        <div
          className="text-[15px] font-extrabold text-[#f5a623]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <span style={{ fontStyle: "italic" }}>D</span>eyMake
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineSun size={14} color="#1a1a1a" />
          <HiOutlineSearch size={14} color="#1a1a1a" />
          <HiOutlineBell size={14} color="#1a1a1a" />
        </div>
      </div>

      {/* Trending */}
      <div className="flex items-center justify-between px-3.5 py-1 bg-white">
        <span className="text-[10px] font-bold text-gray-900">Trending</span>
        <span className="text-[9px] text-gray-400">View more ›</span>
      </div>
      <div className="flex gap-1.5 px-3.5 bg-white">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 rounded-lg overflow-hidden relative"
            style={{ height: "65px" }}
          >
            <img
              src={vrImage}
              alt="thumb"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute bottom-1 left-1 text-white rounded-sm px-0.5"
              style={{
                fontSize: "6px",
                fontWeight: "600",
                background: "rgba(0,0,0,0.4)",
              }}
            >
              GRWM to code
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="flex items-center justify-between px-3.5 py-1 mt-1 bg-white">
        <span className="text-[10px] font-bold text-gray-900">
          Categories you'd like
        </span>
        <span className="text-[9px] text-gray-400">View more ›</span>
      </div>
      <div className="flex gap-1 px-3.5 overflow-hidden bg-white">
        {["Popular", "Design", "AI", "LLM", "Web"].map((c, i) => (
          <span
            key={c}
            className="text-[8px] font-semibold px-2 py-0.5 rounded-full
                       whitespace-nowrap"
            style={{
              background: i === 0 ? "#f5a623" : "#f0f0f0",
              color: i === 0 ? "white" : "#555",
            }}
          >
            {c}
          </span>
        ))}
      </div>

      {/* Big thumbnail */}
      <div
        className="mx-3.5 mt-1.5 rounded-xl overflow-hidden"
        style={{ height: "110px" }}
      >
        <img
          src={vrImage}
          alt="featured"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white">
        <img
          src={avatarM}
          alt="Jason"
          className="w-5 h-5 rounded-full object-cover"
        />
        <span className="text-[8px] font-semibold text-gray-900">
          Jason Eton
        </span>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-around px-3.5 pb-3 pt-2
                      border-t border-gray-100 bg-white">
        <HiOutlineHome size={16} color="#f5a623" />
        <HiOutlineChartBar size={16} color="#bbb" />
        <HiOutlineChatAlt2 size={16} color="#bbb" />
        <HiOutlineCog size={16} color="#bbb" />
        <HiOutlineUser size={16} color="#bbb" />
      </div>
    </div>
  );
}

export default function CreativesBanner({ onSignUp }) {
  return (
    <section
      className="px-6 md:px-12 py-10
                 bg-[#f5f5f0] dark:bg-[#121212]"
    >
      <div className="max-w-5xl mx-auto">
        <div
          className="flex flex-col md:flex-row items-center
                     justify-between gap-10 rounded-3xl
                     px-8 md:px-14 py-12"
          style={{ background: "#f5a623" }}
        >
          {/* Left */}
          <div className="flex-1">
            <h2
              className="font-black text-gray-900 leading-tight mb-4"
              style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
            >
              For creatives,
              <br />
              By creatives.
            </h2>
            <p
              className="text-[15px] leading-relaxed mb-7 max-w-sm"
              style={{ color: "#3a2a00" }}
            >
              Built by people who have been there and are building
              something with care.
            </p>
            <button
              onClick={onSignUp}
              className="font-bold text-[15px] px-9 py-3.5 rounded-xl
                         cursor-pointer border-none transition-colors
                         bg-white hover:bg-gray-50 text-gray-900"
            >
              Join the waitlist
            </button>
          </div>

          {/* Phone — always light since it's on yellow bg */}
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}