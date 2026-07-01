import { useEffect, useState } from "react";
import { FaGraduationCap, FaHeart, FaRegHeart } from "react-icons/fa";
import { GiInterstellarPath, GiRose, GiSpaceShuttle } from "react-icons/gi";
import { GoVerified } from "react-icons/go";
import { LuDot, LuWallet } from "react-icons/lu";
import { PiCoinFill } from "react-icons/pi";

const filters = [
  { title: "All", icon: FaGraduationCap },
  { title: "Purchases", icon: LuWallet },
  { title: "Received", icon: FaRegHeart },
  { title: "Sent", icon: GoVerified },
];

const histories = [
  {
    category: "Purchases",
    title: "Purchased 1,000 Coins",
    location: "Apple Pay",
    time: "Today, 2:34 PM",
    quantity: "-N20,000",
    amount: "+2,500 coins",
    icon: PiCoinFill,
  },
  {
    category: "Sent",
    title: "Sent Rose to @sarah_dance",
    location: "Live stream ",
    time: "Today, 2:34 PM",
    quantity: "-50 coins",
    icon: GiRose,
  },
  {
    category: "Sent",
    title: "Sent Galaxy to @jim_Nig",
    location: "Video comment",
    time: "Yesterday",
    quantity: "-500 coins",
    icon: GiSpaceShuttle,
  },
  {
    category: "Received",
    title: "Received 12 Rose",
    location: "From @maya_beauty",
    time: "Yesterday",
    quantity: "+5 coins",
    icon: GiRose,
  },
  {
    category: "Purchases",
    title: "Purchased 500 coins",
    location: "Credit Card",
    time: "May 28",
    amount: "+2,500 coins",
    quantity: "-N20,000",
    icon: PiCoinFill,
  },
  {
    category: "Received",
    title: "Received Galaxy x2",
    location: "From @mimi_mimi",
    time: "Apri 20",
    quantity: "+1,000 coins",
    icon: GiSpaceShuttle,
  },
  {
    category: "Sent",
    title: "Sent Interstellar to @lim",
    location: "Livestream",
    time: "Mar 26",
    quantity: "-1,000 coins",
    icon: GiInterstellarPath,
  },
  {
    category: "Purchases",
    title: "Purchased 2,500 Coins",
    location: "PayPal",
    time: "Mar 8",
    quantity: "-N20,000",
    amount: "+2,500 coins",
    icon: PiCoinFill,
  },
  {
    category: "Received",
    title: "Received 5 Roses",
    location: "Livestream",
    time: "Feb 26",
    quantity: "+5 coins",
    icon: GiRose,
  },
  {
    category: "Sent",
    title: "Sent Rose to @tina_gl",
    location: "Video comment",
    time: "Jan 30",
    quantity: "-1 coins",
    icon: GiRose,
  },
];

function HistoryTab() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedHistories, setSelectedHistories] = useState(histories);

  function handleActiveFilterChange(value) {
    setActiveFilter(value);
  }

  useEffect(() => {
    let updated = [];
    if (activeFilter === "All") {
      updated = [...histories];
    } else {
      updated = histories.filter(
        (history) => history.category === activeFilter,
      );
    }

    setSelectedHistories(updated);
  }, [activeFilter]);

  return (
    <div className="flex flex-col gap-7">
      <menu className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {filters.map(({ title, icon: Icon }, i) => (
          <button
            onClick={() => handleActiveFilterChange(title)}
            key={title}
            className={`transition-all text-sm py-2 md:py-3 px-5 rounded-xl font-semibold flex items-center gap-3 ${
              activeFilter === title
                ? "bg-orange100 text-black hover:bg-orange200"
                : "text-black dark:text-white hover:bg-slate150 hover:dark:bg-black500"
            }`}
          >
            {" "}
            <Icon className="w-5 h-5" /> {title}
          </button>
        ))}
      </menu>

      <div className="flex flex-col gap-5">
        {selectedHistories.map(
          (
            { icon: Icon, category, title, time, location, quantity, amount },
            i,
          ) => (
            <div
              key={`${title} - ${i}`}
              className="flex items-center justify-between border border-black/20 dark:border-white/20 rounded-2xl p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 flex items-center justify-center border rounded-xl ${
                    category === "Purchases"
                      ? "border-orange100 bg-orange100/10 text-orange100"
                      : "border-red700 bg-red700/10 text-red700"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-semibold text-black dark:text-white">
                    {title}
                  </h4>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-thin text-black dark:text-white">
                      {location}
                    </span>
                    <LuDot className="w-3 h-3 text-black dark:text-white" />
                    <span className="text-[11px] font-thin text-black dark:text-white">
                      {time}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <span
                  className={`text-sm font-bold ${
                    category === "Purchases"
                      ? "text-orange100"
                      : category === "Sent"
                        ? "text-red700"
                        : "text-green300"
                  }`}
                >
                  {quantity}
                </span>
                <span className="text-[11px] font-thin text-black dark:text-white">
                  {amount}
                </span>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export default HistoryTab;
