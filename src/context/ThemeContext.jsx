import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => setSystemPrefersDark(event.matches);

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
       root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
  }, [isDark, theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  const setThemePreference = (nextTheme) => {
    setTheme(nextTheme === "dark" ? "dark" : nextTheme === "system" ? "system" : "light");
  };

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
