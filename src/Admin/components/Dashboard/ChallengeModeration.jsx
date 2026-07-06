import { AiOutlineCopyright } from "react-icons/ai";
import { CgList } from "react-icons/cg";
import { FaHashtag } from "react-icons/fa";
import { FiAlertTriangle } from "react-icons/fi";
import { GiAlliedStar } from "react-icons/gi";
import { LuOctagonAlert } from "react-icons/lu";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";

const alerts = [
  {
    title: "#Deymake",
    value: "1.2B views",
    isLow: false,
  },
  {
    title: "#AIChallenge",
    value: "800M views",
    isLow: false,
  },
  {
    title: "#DanceTrend",
    value: "650M views",
    isLow: false,
  },
  {
    title: "#FoodTok",
    value: "540M views",
    isLow: true,
  },
  {
    title: "#SummerVibes",
    value: "420M views",
    isLow: false,
  },
];

function ChallengeModeration() {
  return (
    <section className="bg-blue300 flex flex-col gap-7.5 p-6 rounded-2xl">
      <div className="flex items-center justify-between gap-2 font-roboto">
        <h3 className="text-white text-[22px]">Challenge Moderation</h3>
        <button className="text-base text-white font-medium">View all</button>
      </div>
      <div className="flex flex-col gap-6">
        {alerts.map(({ title, value, isLow }, i) => (
          <div
            key={title}
            className="flex items-center justify-between gap-8 border-b border-b-white px-3.5 py-5"
          >
            <div className="flex items-center gap-4">
              <span className="text-white text-sm">{i + 1}</span>
              <FaHashtag
                className={`w-5 h-5 ${
                  i === 0
                    ? "text-orange300"
                    : i === 1
                      ? "text-red100"
                      : i === 2
                        ? "text-orange100"
                        : i === 3
                          ? "text-orange300"
                          : "text-green300"
                }`}
              />
              <h5 className="text-xs font-medium text-white">{title}</h5>
            </div>
            <div className="flex items-center gap-7.5 font-roboto">
              <span className="text-white text-xs font-medium">{value}</span>
              {isLow ? (
                <TiArrowSortedDown className="text-red100 w-4 h-4" />
              ) : (
                <TiArrowSortedUp className="w-4 h-4 text-green300" />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ChallengeModeration;
