import { IoWifi, IoBatteryHalf, IoCellular } from "react-icons/io5";
import { useTheme } from "../../context/ThemeContext";

// const StatusBar = ({ notchW = "w-12", notchH = "h-3.5" }) => {
//   const { isDark } = useTheme();
//   const iconColor = isDark ? "#ffffff" : "#1a1a1a";

//   return (
//     <div className="flex items-center px-4 pt-2.5 pb-1.5
//                     bg-white dark:bg-[#2d2d2d]">
//       <div className="flex-1">
//         <span className="text-[10px] font-bold text-gray-900 dark:text-white">
//           9:41
//         </span>
//       </div>
//       <div className="flex justify-center">
//         <div className={"rounded-full bg-black " + notchW + " " + notchH} />
//       </div>
//       <div className="flex-1 flex items-center justify-end gap-0.5">
//         <IoCellular size={12} color={iconColor} />
//         <IoWifi size={12} color={iconColor} />
//         <IoBatteryHalf size={14} color={iconColor} />
//       </div>
//     </div>
//   );
// };

export default function CreativesSection() {
  const { isDark } = useTheme();
  return (
    <section
      id="about"
      className="px-6 md:px-12 py-14 bg-white100 dark:bg-[#1e1e1e]"
    >
      <div className="max-w-5xl mx-auto">

        <h2
          className="font-semibold font-bricolage text-slate100 dark:text-white mb-3"
          style={{ fontSize: "clamp(22px, 4vw, 32px)" }}
        >
          A new home{" "}
          <span className="text-orange100 italic font-inter">for creatives</span>
        </h2>

        <p className="text-[15px] text-gray-500 dark:text-gray-400
                      max-w-md leading-relaxed mb-12">
          Creators are tired of fighting algorithms and juggling platforms. Dey
          Make brings content, audience, and growth together.
        </p>

        {/* Desktop 3 column */}
        <div
          className="hidden md:grid gap-10 items-center"
          style={{ gridTemplateColumns: "1fr auto 1fr" }}
        >
          {/* Left */}
          <div>
            <h3
              className="font-medium text-slate100 font-inter dark:text-white
                         mb-3 leading-snug"
              style={{ fontSize: "clamp(18px, 2.5vw, 22px)" }}
            >
              Creator tools from day one
            </h3>
            <p className="text-sm text-slate100 font-inter dark:text-gray-400
                          leading-relaxed">
              DeyMake puts creator tools in your hands from the start, so
              you can focus on creating and growing at your own pace.
            </p>
          </div>

          {/* Phone mockup desktop */}
          <img src={isDark ? './phone-dark.png' : './phone-light.png'} className="w-101 h-220"/>

          {/* Right */}
          <div className="flex flex-col gap-60">
            <div>
              <h3
                className="font-medium text-slate100 font-inter dark:text-white mb-2"
                style={{ fontSize: "clamp(18px, 2.5vw, 22px)" }}
              >
                Create without limits.
              </h3>
              <p className="text-sm text-slate100 font-inter dark:text-gray-400
                            leading-relaxed">
                Post quick clips or full-length videos and let them live
                side by side in one feed. If it's your content, it belongs
                here.
              </p>
            </div>
            <div>
              <h3
                className="font-mediumn text-slate100 font-inter dark:text-white mb-2"
                style={{ fontSize: "clamp(18px, 2.5vw, 22px)" }}
              >
                Built for Africa
              </h3>
              <p className="text-sm text-slate100 font-inter dark:text-gray-400
                            leading-relaxed">
                DeyMake is built with African creators in mind, fast,
                accessible and designed for how we really connect, create
                and consume content.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile stacked */}
        <div className="md:hidden">
        <img src={isDark ? './phone-dark.png' : './phone-light.png'} className="w-101 h-150"/>

          <div>
            <h3 className="text-xl font-extrabold text-gray-900
                           dark:text-white mb-2">
              Create without limits.
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400
                          leading-relaxed mb-6">
              Post quick clips or full-length videos and let them live
              side by side in one feed. If it's your content, it belongs
              here.
            </p>
            <h3 className="text-xl font-extrabold text-gray-900
                           dark:text-white mb-2">
              Built for Africa
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400
                          leading-relaxed">
              DeyMake is built with African creators in mind, fast,
              accessible and designed for how we really connect, create
              and consume content.
            </p>
          </div>
          </div>
        </div>

      
    </section>
  );
}