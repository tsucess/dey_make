import { useState } from "react";

const avatar =
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&q=80";

const rankList = [
  { rank: 4,  name: "Jason Robertson"  },
  { rank: 5,  name: "Jason Eton"       },
  { rank: 6,  name: "Jason Eton Michel"},
  { rank: 7,  name: "Jason Gamis"      },
  { rank: 8,  name: "Jason Eton"       },
  { rank: 9,  name: "Jason Eton"       },
  { rank: 10, name: "Jason Eton"       },
];

const BLOCK_W = "w-[150px]";

/* ── Podium person (avatar + name + views badge) ── */
function PodiumPerson({ name, views, avatarSize }) {
  return (
    <div className="flex flex-col items-center w-[150px]">
      <img
        src={avatar}
        alt={name}
        className={`${avatarSize} rounded-full object-cover
                    border-[3px] border-white shadow-md mb-2`}
      />
      <p className="text-[0.9rem] font-bold text-center mb-1
                    text-gray-900 dark:text-white">
        {name}
      </p>
      <div className="flex items-center gap-1 px-3 py-0.5 rounded-full
                      mb-2.5 bg-gray-700 dark:bg-gray-600 text-white
                      text-[0.72rem] font-semibold">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
          <polygon points="5,3 19,12 5,21" />
        </svg>
        {views}
      </div>
    </div>
  );
}

/* ── Podium block ── */
function PodiumBlock({ rank, blockHeight }) {
  return (
    <div
      className={`${BLOCK_W} rounded-t-xl flex items-end
                  justify-center pb-3 flex-shrink-0`}
      style={{
        height: `${blockHeight}px`,
        background: "linear-gradient(160deg, #FFD84D 0%, #F5A623 55%, #D4880A 100%)",
      }}
    >
      <span
        className="text-[4.5rem] font-black leading-none"
        style={{
          fontFamily: "Georgia, serif",
          color: "#FFD000",
          WebkitTextStroke: "3.5px #1a1a1a",
        }}
      >
        {rank}
      </span>
    </div>
  );
}

export default function Leaderboard() {
  const [tab, setTab] = useState("Daily");

  return (
    <div className="w-full min-h-screen pb-20 md:pb-0
                    bg-gray-50 dark:bg-[#121212]">
      <div className="px-6 py-5 w-full">

        {/* ── Tabs mobile ── */}
        <div className="flex gap-2 md:hidden mb-6">
          {["Daily", "Weekly", "Monthly"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-[18px] py-1.5 rounded-full text-[0.85rem]
                          font-semibold border-[1.5px] cursor-pointer
                          transition-all duration-200
                          ${tab === t
                            ? "bg-[#f5a623] text-white border-[#f5a623]"
                            : "bg-white dark:bg-[#1e1e1e] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                          }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Tabs desktop ── */}
        <div className="hidden md:flex justify-center mb-10">
          <div className="inline-flex bg-gray-100 dark:bg-[#1e1e1e]
                          rounded-full p-1">
            {["Daily", "Weekly", "Monthly"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-7 py-2 rounded-full text-[0.9rem]
                            font-semibold border-none cursor-pointer
                            transition-all duration-200
                            ${tab === t
                              ? "bg-[#f5a623] text-white"
                              : "bg-transparent text-gray-500 dark:text-gray-400"
                            }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Podium ── */}
        <div className="flex justify-center mb-10">
          <div className="flex items-end gap-2">

            {/* 2nd */}
            <div className="flex flex-col items-center">
              <PodiumPerson name="Jason Eton" views="164.3M" avatarSize="w-[72px] h-[72px]" />
              <PodiumBlock rank={2} blockHeight={160} />
            </div>

            {/* 1st */}
            <div className="flex flex-col items-center">
              <PodiumPerson name="Jason Eton" views="164.3M" avatarSize="w-[88px] h-[88px]" />
              <PodiumBlock rank={1} blockHeight={220} />
            </div>

            {/* 3rd */}
            <div className="flex flex-col items-center">
              <PodiumPerson name="Jason Eton" views="164.3M" avatarSize="w-[64px] h-[64px]" />
              <PodiumBlock rank={3} blockHeight={120} />
            </div>

          </div>
        </div>

        {/* ── You currently rank ── */}
        <div className="flex justify-center mb-3">
          <div className="flex items-center justify-between
                          bg-[#f5a623] rounded-xl px-7 py-3.5
                          w-4/5 max-w-full">
            <span className="font-bold text-[0.95rem] text-gray-900">
              You Currently Rank
            </span>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-[1.1rem] text-gray-900">
                23
              </span>
              <button className="w-[26px] h-[26px] rounded-full
                                 border-2 border-gray-900 bg-transparent
                                 flex items-center justify-center
                                 cursor-pointer text-[0.55rem] text-gray-900">
                ▶
              </button>
            </div>
          </div>
        </div>

        {/* ── Rank list ── */}
        <div className="flex flex-col items-center gap-2 w-full">
          {rankList.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between
                         bg-white dark:bg-[#1e1e1e]
                         rounded-xl px-7 py-3
                         w-4/5 max-w-full cursor-pointer
                         shadow-sm dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)]
                         hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <img
                  src={avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-semibold text-[0.9rem]
                                 text-gray-900 dark:text-white">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-[0.9rem]
                                 text-gray-700 dark:text-gray-300">
                  {item.rank}
                </span>
                <button className="w-[26px] h-[26px] rounded-full
                                   border border-gray-300 dark:border-gray-600
                                   bg-transparent flex items-center
                                   justify-center cursor-pointer
                                   text-[0.5rem]
                                   text-gray-400 dark:text-gray-500
                                   hover:border-[#f5a623] hover:text-[#f5a623]
                                   transition-colors">
                  ▶
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}