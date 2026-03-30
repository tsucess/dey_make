import { useState } from "react";
import ThemeToggle from "../ThemeToggle";
import Logo from "../Logo";
import { IoClose } from "react-icons/io5";
import { useLanguage } from "../../context/LanguageContext";

export default function LandingNavbar({ onSignUp }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();
  const navItems = [
    { label: t("landing.navbar.about"), href: "#about" },
    { label: t("landing.navbar.whyDeyMake"), href: "#why-deymake" },
    { label: t("landing.navbar.creators"), href: "#creators" },
    { label: t("landing.navbar.faq"), href: "#faq" },
  ];

  return (
    <nav className="bg-white100/20 dark:bg-slate100 
                    md:border-b-[0.5px] border-slate200 dark:border-slate300">
      <div className="flex items-center justify-between px-6 py-4 md:px-14 md:py-7">

        {/* Logo */}
        <Logo/>

<div className="hidden md:block"><ThemeToggle/></div>
        {/* Desktop nav links */}
        <div className="hidden font-inter md:flex items-center gap-10">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate100
                         dark:text-gray-300 md:text-base hover:text-orange100
                         transition-colors"
              style={{ textDecoration: "none" }}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          
          <button
            onClick={onSignUp}
            className="bg-orange100 hover:bg-[#e09510] text-slate100
                       font-semibold text-sm px-6 py-4 md:px-8 md:py-3 md:text-base
                       rounded-lg border-none cursor-pointer
                       transition-colors hidden md:block"
          >
            {t("landing.navbar.joinWaitlist")}
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden flex flex-col gap-1.25 p-1
                       bg-transparent border-none cursor-pointer"
            aria-label={t("landing.navbar.openMenu")}
          >
            <span className="w-5 h-0.75 bg-slate100 block dark:bg-white" />
            <span className="w-5 h-0.75 bg-slate100 block dark:bg-white" />
            <span className="w-5 h-0.75 bg-slate100 block dark:bg-white" />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className={`md:hidden flex flex-col gap-12 px-6 pb-4 pt-12
    border-t border-gray-100 dark:border-gray-800
    bg-white/85 backdrop-blur-xs backdrop-brightness-90
    z-20 absolute h-screen top-0 left-0 w-full
    dark:bg-slate100/50 
    transition-all duration-300 ease-in-out ${menuOpen ?  "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
        >
          <div className="flex justify-between items-center">
            <button onClick={() => setMenuOpen(false)} aria-label={t("landing.navbar.closeMenu")}><IoClose className="text-slate100 dark:text-white w-8 h-8"/>
</button>
            <div ><ThemeToggle/></div>
          </div>
          <div className="flex flex-col gap-6">{navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              
              className="text-sm font-medium font-inter text-slate100 
                         dark:text-white hover:text-[#f5a623]
                         transition-colors"
              style={{ textDecoration: "none" }}
            >
              {item.label}
            </a>
          ))}</div>
          <button
            onClick={onSignUp}
            className="bg-orange100 hover:bg-[#e09510] text-slate100
                       font-semibold text-base px-10 py-3 md:text-base
                       rounded-lg border-none cursor-pointer
                       transition-colors self-start"
          >
            {t("landing.navbar.joinWaitlist")}
          </button>
        </div>
      )}
    </nav>
  );
}