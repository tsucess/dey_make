import { HiSparkles } from "react-icons/hi2";
import { BsEmojiSmile } from "react-icons/bs";
import { TbStack2 } from "react-icons/tb";
import { useTheme } from "../../context/ThemeContext";

export default function WhySection() {
  const { isDark } = useTheme();
  const iconColor = isDark ? "#1A1A1A" : "#1A1A1A";

  const features = [
    {
      icon: <HiSparkles size={28} color={iconColor} />,
      title: "Better Visibility",
      desc: "Your content gets a fair chance to be seen by the right people.",
    },
    {
      icon: <BsEmojiSmile size={28} color={iconColor} />,
      title: "More connection",
      desc: "Real engagement that leads to community, not just numbers.",
    },
    {
      icon: <TbStack2 size={28} color={iconColor} />,
      title: "Less Noise",
      desc: "No more cluttered feeds or forced virality.",
    },
  ];

  return (
    <section
      id="why-deymake"
      className="px-6 md:px-12 py-20 text-center
                 bg-white100 dark:bg-[#121212]"
    >
      <h2
        className="font-medium text-slate100 font-bricolage dark:text-white mb-4"
        style={{ fontSize: "clamp(22px, 4vw, 34px)" }}
      >
        Why creators choose Dey Make
      </h2>
      <p className="text-sm text-slate100 font-inter dark:text-gray-400
                    max-w-lg mx-auto mb-16 leading-relaxed">
        DeyMake amplifies real creativity and real voices, helping creators
        get discovered, build community and grow without the noise.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10
                      max-w-175 mx-auto">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col items-center font-inter">
            <div
              className="w-22.5 h-22.5 rounded-full flex items-center
                         justify-center mb-5"
              style={{
                background:
                  "radial-gradient(circle, rgba(245,166,35,0.9) 0%, rgba(245,166,35,0.2) 60%, transparent 100%)",
              }}
            >
              {f.icon}
            </div>
            <h3 className="text-lg font-semibold text-slate100
                           dark:text-white mb-2.5">
              {f.title}
            </h3>
            <p className="text-sm text-slate100 dark:text-gray-400
                          leading-relaxed max-w-45">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}