import { motion } from "motion/react"
import { useLanguage } from "../../context/LanguageContext";
import { fadeUp } from "../../utils/animation";

export default function CreativesBanner({ onSignUp }) {
  const { t } = useLanguage();

  return (
    <section
      className="md:px-12 py-10
                 bg-white100 dark:bg-slate100"
    >
      <div className="md:max-w-5xl mx-auto">
        <div
          className="flex flex-col md:flex-row md:items-center justify-center
                     md:justify-between gap-10 md:rounded-3xl
                     px-4 md:px-14 py-12 bg-linear-to-b from-orange200 to-orange100 relative min-h-100 md:h-150 overflow-hidden"
          
        >
          {/* Left */}
          <div className="max-w-50 flex flex-col gap-4 md:max-w-sm md:flex-1">
            <h2
              className="font-semibold font-bricolage text-slate100 leading-tight"
              style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
            >
              {t("landing.banner.titleLineOne")}
              <br />
              {t("landing.banner.titleLineTwo")}
            </h2>
            <motion.p variants={fadeUp}
              className="text-base font-inter text-slate100 leading-relaxed max-w-sm"
              
            >
              {t("landing.banner.description")}
            </motion.p>
            <button
              onClick={onSignUp}
              className="font-semibold text-base px-6 md:px-16 py-3.5 rounded-xl
                         cursor-pointer border-none transition-colors
                         bg-white hover:bg-gray-50 text-slate100"
            >
              {t("landing.banner.joinWaitlist")}
            </button>
          </div>

          {/* Phone — always light since it's on yellow bg */}
          <motion.img initial={{ opacity: 0, scale: 0.9 }}
  whileInView={{ opacity: 1, scale: 1 }}
  animate={{ y: [0, -8, 0] }}
  transition={{
    duration: 0.7, // for entrance
    ease: "easeOut",
    y: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }}
   src="/creative.png" alt="" className="w-50 h-80 md:w-110 md:h-150 object-fill absolute -right-10 md:-right-10 -bottom-3 md:-bottom-20" />
        </div>
      </div>
    </section>
  );
}