import { useState } from "react";
import ThemeToggle from "../ThemeToggle";
import Logo from "../Logo";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Why DeyMake", href: "#why-deymake" },
  { label: "Creators", href: "#creators" },
  { label: "FAQ", href: "#faq" },
];

export default function LandingNavbar({ onSignUp }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-slate100 sticky top-0 z-50
                    border-b-[0.5px] border-slate200 dark:border-slate300">
      <div className="flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <Logo/>

        {/* Desktop nav links */}
        <div className="hidden font-inter md:flex items-center gap-10">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate100
                         dark:text-gray-300 md:text-xl hover:text-orange100
                         transition-colors"
              style={{ textDecoration: "none" }}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <button
            onClick={onSignUp}
            className="bg-orange100 hover:bg-[#e09510] text-white
                       font-bold text-[13px] px-[18px] py-[9px]
                       rounded-lg border-none cursor-pointer
                       transition-colors"
          >
            Join waitlist
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden flex flex-col gap-[5px] p-1
                       bg-transparent border-none cursor-pointer"
          >
            <span className="w-5 h-0.5 bg-gray-500 block" />
            <span className="w-5 h-0.5 bg-gray-500 block" />
            <span className="w-5 h-0.5 bg-gray-500 block" />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden flex flex-col gap-4 px-6 pb-4 pt-3
                     border-t border-gray-100 dark:border-gray-800
                     bg-white dark:bg-[#121212]"
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-gray-500
                         dark:text-gray-300 hover:text-[#f5a623]
                         transition-colors"
              style={{ textDecoration: "none" }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}