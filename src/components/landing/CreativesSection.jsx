import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

export default function CreativesSection() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <section
      id="about"
      className="px-6 md:px-12 py-8 md:py-14 bg-white100 dark:bg-slate100"
    >
      <div className="max-w-5xl mx-auto">

        <h2
          className="font-semibold font-bricolage text-slate100 dark:text-white mb-3"
          style={{ fontSize: "clamp(36px, 4vw, 38px)" }}
        >
          {t("landing.creatives.titlePrefix")}{" "}
          <span className="text-orange100 italic font-inter">{t("landing.creatives.titleAccent")}</span>
        </h2>

        <p className="text-[15px] text-slate100 dark:text-white
                      max-w-md leading-relaxed mb-12">
          {t("landing.creatives.description")}
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
              {t("landing.creatives.creatorToolsTitle")}
            </h3>
            <p className="text-sm text-slate100 font-inter dark:text-white
                          leading-relaxed">
              {t("landing.creatives.creatorToolsDescription")}
            </p>
          </div>

          {/* Phone mockup desktop */}
          <img src={isDark ? "./phone-dark.png" : "./phone-light.png"} alt="" className="w-101 h-220" />

          {/* Right */}
          <div className="flex flex-col gap-60">
            <div>
              <h3
                className="font-medium text-slate100 font-inter dark:text-white mb-2"
                style={{ fontSize: "clamp(18px, 2.5vw, 22px)" }}
              >
                {t("landing.creatives.createWithoutLimitsTitle")}
              </h3>
              <p className="text-sm text-slate100 font-inter dark:text-white
                            leading-relaxed">
                {t("landing.creatives.createWithoutLimitsDescription")}
              </p>
            </div>
            <div>
              <h3
                className="font-medium text-slate100 font-inter dark:text-white mb-2"
                style={{ fontSize: "clamp(18px, 2.5vw, 22px)" }}
              >
                {t("landing.creatives.builtForAfricaTitle")}
              </h3>
              <p className="text-sm text-slate100 font-inter dark:text-white
                            leading-relaxed">
                {t("landing.creatives.builtForAfricaDescription")}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile stacked */}
        <div className="md:hidden">
        <img src={isDark ? "./phone-dark.png" : "./phone-light.png"} alt="" className="w-101 h-150"/>

          <div className="flex flex-col gap-4 ">
            <div className="space-y-2 font-inter"><h3 className="text-xl font-medium text-slate100
                           dark:text-white">
              {t("landing.creatives.createWithoutLimitsTitle")}
            </h3>
            <p className="text-sm text-slate100  dark:text-white
                          leading-relaxed">
              {t("landing.creatives.createWithoutLimitsDescription")}
            </p></div>
            <div className="space-y-2 font-inter">
              <h3 className="text-xl font-medium text-slate100
                           dark:text-white">
              {t("landing.creatives.builtForAfricaTitle")}
            </h3>
            <p className="text-sm text-slate100 dark:text-white
                          leading-relaxed">
              {t("landing.creatives.builtForAfricaDescription")}
            </p>
            </div>
            <div className="space-y-2 font-inter">
              <h3 className="text-xl font-medium text-slate100
                           dark:text-white">
              {t("landing.creatives.creatorToolsTitle")}
            </h3>
            <p className="text-sm text-slate100 dark:text-white
                          leading-relaxed">
              {t("landing.creatives.creatorToolsDescription")}
            </p>
            </div>
            
          </div>
          </div>
        </div>

      
    </section>
  );
}