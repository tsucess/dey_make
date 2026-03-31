import { useLanguage } from "../../context/LanguageContext";

export default function LandingFooter({ onSignUp }) {
  const { t } = useLanguage();

  return (
    <footer
      className="px-6 md:px-12 pb-7 pt-12
                 bg-white100 dark:bg-slate100 flex flex-col md:flex-row items-center
                   justify-between gap-4 md:mx-auto"
    >
    
        <div className="flex justify-between items-center w-full md:w-auto gap-2 md:gap-10">
        {/* Logo */}
        <img src="./logo-footer.png" alt="DeyMake" className="w-25 h-7 md:w-30"/>

        {/* Copyright */}
        <p className="text-xs md:text-sm text-black font-inter font-medium dark:text-white">
          {t("landing.footer.copyright")}
        </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-5">
          <button
            onClick={onSignUp}
            className="text-xs md:text-sm text-black font-inter font-medium dark:text-white
                       hover:text-[#f5a623] transition-colors
                       bg-transparent border-none cursor-pointer"
          >
            {t("landing.footer.joinWaitlist")}
          </button>
          <a
            href="#"
            className="text-xs md:text-sm text-black font-inter font-medium dark:text-white
                       hover:text-[#f5a623] transition-colors"
            style={{ textDecoration: "none" }}
          >
            {t("landing.footer.terms")}
          </a>
          <a
            href="#"
            className="text-xs md:text-sm text-black font-inter font-medium dark:text-white
                       hover:text-[#f5a623] transition-colors"
            style={{ textDecoration: "none" }}
          >
            {t("landing.footer.privacy")}
          </a>
        </div>
    </footer>
  );
}