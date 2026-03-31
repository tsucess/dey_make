import { useLanguage } from "../../context/LanguageContext";
import { motion } from "motion/react";

export default function WhySection() {
  const { t } = useLanguage();
  const features = [
    {
      icon: <img src="/visibilty-icon.png" alt="" />,
      title: t("landing.why.betterVisibilityTitle"),
      desc: t("landing.why.betterVisibilityDescription"),
    },
    {
      icon: <img src="/connection-icon.png" alt="" />,
      title: t("landing.why.moreConnectionTitle"),
      desc: t("landing.why.moreConnectionDescription"),
    },
    {
      icon: <img src="/noise-icon.png" alt="" />,
      title: t("landing.why.lessNoiseTitle"),
      desc: t("landing.why.lessNoiseDescription"),
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
        {t("landing.why.title")}
      </h2>
      <p className="text-sm text-slate100 font-inter dark:text-white
                    max-w-lg mx-auto mb-16 leading-relaxed">
        {t("landing.why.description")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10
                      max-w-175 mx-auto">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col items-center font-inter">
            <motion.div whileHover={{ scale: 1.2 }}
              className="w-28"
            >
              {f.icon}
            </motion.div>
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