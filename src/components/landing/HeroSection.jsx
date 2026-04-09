import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { motion, useMotionValue, useTransform } from "motion/react";
import { fadeUp, staggerContainer } from "../../utils/animation";

const MotionSection = motion.section;
const MotionParagraph = motion.p;
const MotionDiv = motion.div;


function scrollToAbout() {
  var el = document.getElementById("about");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}



const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const letter = {
  hidden: {
    y: -120,
    opacity: 0,
    rotate: -8,
    filter: "blur(6px)",
  },
  show: {
    y: [-120, 12, 0],
    opacity: 1,
    rotate: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

 function FallingText({ text, className = "" }) {
  return (
    <motion.h1
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className={`flex flex-wrap leading-tight ${className}`}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          variants={letter}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h1>
  );
}

export default function HeroSection({ onSignUp }) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const x = useMotionValue(0);
const smoothX = useTransform(x, [-20, 20], [-10, 10]);

  return (
    <MotionSection variants={staggerContainer}
  initial="hidden"
  animate="show" className="flex flex-col items-start md:items-center text-center
                        px-6 py-12 md:py-20
                        bg-white100/20 dark:bg-slate100/20">

      {/* Badge */}
      
  <span className="text-xs font-medium mb-1.5 font-inter text-slate100 dark:text-white 
                   bg-slate100/5 dark:bg-black100
                   rounded-full px-4 py-2.5 relative flex justify-center items-center after:content-[''] after:w-[106%] after:h-[110%] after:bg-linear-to-r after:-z-10 after:from-[#FDB30059] after:to-[#00000080] after:absolute after:rounded-full">
    {t("landing.hero.badge")}
  </span>
      

      {/* Headline */}
      <FallingText
  text={t("landing.hero.headline")}
  className="font-medium italic text-slate100 dark:text-white leading-tight font-inter mb-1"
  style={{ fontSize: "clamp(22px, 5vw, 44px)" }}
/>
      <MotionParagraph variants={fadeUp}
      onMouseMove={(e) => {
        const moveX = (e.clientX / window.innerWidth - 0.5) * 20;
        x.set(moveX);
      }}
        className="font-extrabold text-slate100 dark:text-white
                   leading-none font-inter mb-5"
        style={{x: smoothX,  fontSize: "clamp(48px, 10vw, 80px)" }}
      >
        DeyMake.
      </MotionParagraph>

      {/* Subtext */}
      <p
        className="text-slate100 font-inter text-left md:text-center dark:text-white max-w-xl
                   leading-relaxed mb-7"
        style={{ fontSize: "clamp(14px, 2vw, 16px)" }}
      >
        {t("landing.hero.description")}
      </p>

      {/* Buttons */}
      <MotionDiv variants={fadeUp} className="flex justify-start md:justify-center gap-3 mb-12">
        <button
          onClick={onSignUp}
          className="bg-orange100 font-inter hover:bg-orange300 text-slate100
                     font-semibold text-sm md:text-base px-2 md:px-9 py-3.5 rounded-xl
                     border-none cursor-pointer transition-colors
                     md:min-w-45"
        >
          {t("landing.hero.joinWaitlist")}
        </button>
        <button
          onClick={scrollToAbout}
          className="bg-white dark:bg-transparent
                     text-slate100 font-inter dark:text-white
                     font-semibold text-sm md:text-base px-4 md:px-9 py-3.5 rounded-xl
                     cursor-pointer transition-colors md:min-w-45
                     border-2 border-slate100 dark:border-white
                     hover:bg-slate100 hover:text-white
                     dark:hover:bg-white  dark:hover:text-slate100"
        >
          {t("landing.hero.learnMore")}
        </button>
      </MotionDiv>

      {/* Desktop floating cards */}
      <MotionDiv
  animate={{ y: [0, -10, 0] }}
  transition={{ duration: 4, repeat: Infinity }} className="md:hidden flex justify-center w-full"><img src={isDark ? "./home_dark_m.png" : "./home_m.png"} alt="" className="w-80" /></MotionDiv>
      <MotionDiv
  animate={{ y: [0, -10, 0] }}
  transition={{ duration: 4, repeat: Infinity }} className=" hidden md:block"><img src={isDark ? "./home_dark.png" : "./home.png"} alt="" /></MotionDiv>
    </MotionSection>
  );
}