import { BiTransferAlt } from "react-icons/bi";
import { BsScissors } from "react-icons/bs";
import { FaRegClosedCaptioning } from "react-icons/fa";
import { GiMouthWatering } from "react-icons/gi";
import { ImLeaf } from "react-icons/im";
import { IoIosInfinite, IoMdArrowDroprightCircle } from "react-icons/io";
import { LuLockKeyhole, LuScissorsLineDashed } from "react-icons/lu";
import { MdCyclone } from "react-icons/md";
import { PiImagesSquareFill } from "react-icons/pi";

const toolKits = [
  {
    name: "Auto Captions",
    desc: "Generate accurate captions in 40+ languages",
    icon: FaRegClosedCaptioning,
    level: "Free",
    price: "",
    isLocked: false,
  },
  {
    name: "Background Remove",
    desc: "One-tap background removal & replacement",
    icon: BsScissors,
    level: "Pro",
    price: "60/mo",
    isLocked: false,
  },
  {
    name: "AI Script Writter",
    desc: "Generate video scripts from a single prompt",
    icon: ImLeaf,
    level: "Pro",
    price: "30/mo",
    isLocked: true,
  },
  {
    name: "Smart Trim",
    desc: "Auto detect and remove silent pauses",
    icon: LuScissorsLineDashed,
    level: "Free",
    price: "",
    isLocked: false,
  },
  {
    name: "Style Transfer",
    desc: "Apply cinematic styles to your footage",
    icon: BiTransferAlt,
    level: "Elite",
    price: "14/mo",
    isLocked: true,
  },
  {
    name: "Lip Sync Fix",
    desc: "Auto-sync audio with video",
    icon: GiMouthWatering,
    level: "Pro",
    price: "30/mo",
    isLocked: true,
  },
  {
    name: "Thumbnail AI",
    desc: "Generate click-worthy thumbnails instantly",
    icon: PiImagesSquareFill,
    level: "Free",
    price: "",
    isLocked: false,
  },
  {
    name: "Video Clone",
    desc: "Clone your voice for voiceovers",
    icon: MdCyclone,
    level: "Elite",
    price: "30/mo",
    isLocked: true,
  },
];

function AiStudioTool() {
  return (
    <section className="flex flex-col gap-8 ">
      <div className="studio-bg py-10 rounded-2xl px-8 h-44 flex items-center justify-between">
        <div className="flex flex-col gap-3 font-inter">
          <h2 className="text-white text-2xl font-bold">AI Studio Pro</h2>
          <span className="text-white text-xs">
            Unlock all tools · 200 AI credits/mo
          </span>
        </div>
        <button className="bg-orange100 text-slate100 text-base px-6 py-3 rounded-md">
          Upgrade
        </button>
      </div>
      <div className="flex flex-col gap-6">
        <h3 className="text-black dark:text-white text-xl font-semibold">
          Your AI Toolkit
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {toolKits.map(
            ({ name, desc, icon: Icon, level, price, isLocked }, i) => (
              <div
                key={name - i}
                className="flex flex-col gap-12.5 px-7.5 py-12.5 rounded-2xl border border-black/20 dark:border-white/20 bg-white300 dark:bg-black400"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex flex-col gap-6">
                    <div
                      className={`w-12 h-12 rounded-md flex items-center justify-center border border-black/20 dark:border-white/20 ${
                        i === 0
                          ? "bg-black500/5 dark:bg-black500 text-red700"
                          : i === 1
                            ? "bg-black500/5 dark:bg-black500 text-red700"
                            : i === 2
                              ? "bg-orange100/10 text-orange100"
                              : i === 3
                                ? "bg-green300/10 text-green300"
                                : i === 4
                                  ? "bg-blue/10 text-blue"
                                  : i === 5
                                    ? "bg-black500/5 dark:bg-black500 text-red700"
                                    : i === 6
                                      ? "bg-orange400/10 text-orange400"
                                      : "bg-black500/5 dark:bg-black500 text-red700"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-1 font-inter">
                      <h6 className="text-base font-bold text-black dark:text-white">
                        {name}
                      </h6>
                      <span className="text-xs text-black dark:text-white">
                        {desc}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      level === "Free"
                        ? "bg-green100/10 dark:bg-green400 text-green300"
                        : level === "Pro"
                          ? "bg-red700/10 text-red700"
                          : "bg-orange100/10 text-orange100"
                    }`}
                  >
                    {level}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    {level === "Free" && (
                      <IoIosInfinite className="w-6 h-6 text-black dark:text-white" />
                    )}
                    <span className="text-black dark:text-white text-xs">
                      {price}
                    </span>
                  </div>
                  <div>
                    {!isLocked && (
                      <IoMdArrowDroprightCircle className="text-red600 w-6 h-6" />
                    )}
                    {isLocked && (
                      <LuLockKeyhole className="w-6 h-6 text-slate50 dark:text-slate700" />
                    )}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export default AiStudioTool;
