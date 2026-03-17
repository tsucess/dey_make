import { HiSparkles } from "react-icons/hi2";
import { BsEmojiSmile } from "react-icons/bs";
import { TbStack2 } from "react-icons/tb";
import { useTheme } from "../../context/ThemeContext";

export default function WhySection() {
  const { isDark } = useTheme();

  const features = [
    {
      icon: <img src='./visibilty-icon.png' />,
      title: "Better Visibility",
      desc: "Your content gets a fair chance to be seen by the right people.",
    },
    {
      icon: <img src='./connection-icon.png' />,
      title: "More connection",
      desc: "Real engagement that leads to community, not just numbers.",
    },
    {
      icon: <img src="./noise-icon.png" />,
      title: "Less Noise",
      desc: "No more cluttered feeds or forced virality.",
    },
  ];

  return (
    <section
      id="why-deymake"
      className="px-6 md:px-12 py-10 md:py-20 text-center
                 bg-white100 dark:bg-slate100"
    >
      <h2
        className="font-medium text-slate100 font-bricolage dark:text-white mb-4"
        style={{ fontSize: "clamp(28px, 4vw, 34px)" }}
      >
        Why creators choose Dey Make
      </h2>
      <p className="text-sm text-slate100 font-inter dark:text-white
                    max-w-lg mx-auto mb-16 leading-relaxed">
        DeyMake amplifies real creativity and real voices, helping creators
        get discovered, build community and grow without the noise.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10
                      max-w-175 mx-auto">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col items-center font-inter">
            <div
              className="w-28"
            >
              {f.icon}
            </div>
            <h3 className="text-xl font-semibold text-slate100
                           dark:text-white mb-2.5">
              {f.title}
            </h3>
            <p className="text-sm text-slate100 dark:text-white
                          leading-relaxed max-w-80 md:max-w-50">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}