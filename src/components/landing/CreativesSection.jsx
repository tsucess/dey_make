import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "motion/react";
import {container, fadeUp} from '../../utils/animation'

export default function CreativesSection() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <section
      id="about"
      className="px-6 md:px-12 py-8 md:py-14 bg-white100 dark:bg-slate100"
    >
      <motion.div 
      variants={container}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, margin: "-100px" }}
   className="max-w-5xl mx-auto">

        <motion.h2 variants={fadeUp}
          className="font-semibold font-bricolage text-slate100 dark:text-white mb-3"
          style={{ fontSize: "clamp(36px, 4vw, 38px)" }}
        >
          {t("landing.creatives.titlePrefix")}{" "}
          <span className="text-orange100 italic font-inter">{t("landing.creatives.titleAccent")}</span>
        </motion.h2>

        <motion.p variants={fadeUp} className="text-[15px] text-slate100 dark:text-white
                      max-w-md leading-relaxed mb-12">
          {t("landing.creatives.description")}
        </motion.p>

        {/* Desktop 3 column */}
        <div
          className="hidden md:grid gap-10 items-center"
          style={{ gridTemplateColumns: "1fr auto 1fr" }}
        >
          {/* Left */}
          <motion.div variants={{
    hidden: { opacity: 0, x: -40 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 }
    }
  }}>
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
          </motion.div>

          {/* Phone mockup desktop */}
          <motion.img src={isDark ? "./phone-dark.png" : "./phone-light.png"} alt="" className="w-101 h-220"
          initial={{ opacity: 0, scale: 0.9 }}
  whileInView={{ opacity: 1, scale: 1 }}
  viewport={{ once: true }}
  animate={{ y: [0, -10, 0] }}
  whileHover={{ rotate: 2, scale: 1.02 }}
  transition={{
    duration: 0.7,
    ease: "easeOut",
    y: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }} />

          {/* Right */}
          <div className="flex flex-col gap-60">
            <motion.div variants={{
    hidden: { opacity: 0, x: 40 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 }
    }
  }}>
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
            </motion.div>
            <motion.div variants={{
    hidden: { opacity: 0, x: 40 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 }
    }
  }}>
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
            </motion.div>
          </div>
        </div>

        {/* Mobile stacked */}
        <motion.div  variants={container}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true }} className="md:hidden">
        <motion.img variants={fadeUp} src={isDark ? "./phone-dark.png" : "./phone-light.png"} alt="" className="w-101 h-150"/>

          <div className="flex flex-col gap-4 ">
            <motion.div variants={fadeUp} className="space-y-2 font-inter"><h3 className="text-xl font-medium text-slate100
                           dark:text-white">
              {t("landing.creatives.createWithoutLimitsTitle")}
            </h3>
            <p className="text-sm text-slate100  dark:text-white
                          leading-relaxed">
              {t("landing.creatives.createWithoutLimitsDescription")}
            </p></motion.div>
            <motion.div variants={fadeUp} className="space-y-2 font-inter">
              <h3 className="text-xl font-medium text-slate100
                           dark:text-white">
              {t("landing.creatives.builtForAfricaTitle")}
            </h3>
            <p className="text-sm text-slate100 dark:text-white
                          leading-relaxed">
              {t("landing.creatives.builtForAfricaDescription")}
            </p>
            </motion.div>
            <motion.div variants={fadeUp} className="space-y-2 font-inter">
              <h3 className="text-xl font-medium text-slate100
                           dark:text-white">
              {t("landing.creatives.creatorToolsTitle")}
            </h3>
            <p className="text-sm text-slate100 dark:text-white
                          leading-relaxed">
              {t("landing.creatives.creatorToolsDescription")}
            </p>
            </motion.div>
            
          </div>
          </motion.div>
        </motion.div>

      
    </section>
  );
}