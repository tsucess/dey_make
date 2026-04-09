import { useLanguage } from "../../context/LanguageContext";

export default function LandingFooter({ onSignUp }) {
  const { t } = useLanguage();

  return (
    <footer
      className=" pt-12
                 bg-white100 dark:bg-slate100 flex flex-col  gap-8 overflow-hidden"
    >
    
        <div className="flex justify-between items-end md:items-center w-full md:w-auto gap-2 md:gap-10 px-6 md:px-12">
        
       

        {/* Copyright */}
        <p className="text-xs md:text-sm text-black font-inter font-medium dark:text-white">
          {t("landing.footer.copyright")}
        </p>
        

        {/* Links */}
        <div className="flex flex-col items-end gap-3 md:items-center md:flex-row md:gap-5">
          <button
            onClick={onSignUp}
            className="text-xs md:text-sm text-black font-inter font-medium dark:text-white
                       hover:text-orange100 transition-colors
                       bg-transparent border-none cursor-pointer text-right md:text-left"
          >
            {t("landing.footer.joinWaitlist")}
          </button>
          <a
            href="#"
            className="text-xs md:text-sm text-black font-inter font-medium dark:text-white
                       hover:text-orange100 transition-colors"
            style={{ textDecoration: "none" }}
          >
            {t("landing.footer.terms")}
          </a>
          <a
            href="#"
            className="text-xs md:text-sm text-black font-inter font-medium dark:text-white
                       hover:text-orange100 transition-colors"
            style={{ textDecoration: "none" }}
          >
            {t("landing.footer.privacy")}
          </a>
        </div>
        </div>
        {/* Logo */}
         <img src="./DEYMAKE LOGO Yellow.svg" alt="DeyMake" className="w-full h-auto -mb-3 md:-mb-10"/>
    </footer>
  );
}