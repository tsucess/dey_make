import { useTheme } from "../context/ThemeContext";
import { MdSunny } from "react-icons/md";
import { IoIosMoon } from "react-icons/io";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center gap-2
                  transition-colors md:hidden ${isDark ? 'flex-row': 'flex-row-reverse'}`}
      aria-label="Toggle dark mode"
    >
        <MdSunny className="w-6 h-6 text-black dark:text-white"/>
        
        <IoIosMoon className="text-black/20 w-6 h-6 dark:text-white"/>
    </button>
    <button
    onClick={toggleTheme}
    className=" absolute top-35 right-20 hidden shadow-toggle md:block"
    >
      <div className="w-6 h-25 bg-slate100 dark:bg-white"></div>
      <div className="w-6 h-12.5 bg-white dark:bg-slate100 dark:border dark:border-slate300"></div>
    </button>
    </>
  );
}