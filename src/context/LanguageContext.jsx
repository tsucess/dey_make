import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  createTranslator,
  DEFAULT_LOCALE,
  LANGUAGE_STORAGE_KEY,
  resolveLocale,
  setActiveLocale,
  SUPPORTED_LOCALES,
} from "../locales/translations";

const LanguageContext = createContext(null);

function getStoredLocale() {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  return resolveLocale(window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LOCALE);
}

export function LanguageProvider({ children }) {
  const { user } = useAuth();
  const preferredLocale = user?.preferences?.language;
  const [locale, setLocaleState] = useState(() => resolveLocale(preferredLocale || getStoredLocale()));

  useEffect(() => {
    if (!preferredLocale) return;
    setLocaleState(resolveLocale(preferredLocale));
  }, [preferredLocale]);

  useEffect(() => {
    setActiveLocale(locale);
    document.documentElement.lang = locale;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    setLocale(nextLocale) {
      setLocaleState(resolveLocale(nextLocale));
    },
    t: createTranslator(locale),
    supportedLocales: SUPPORTED_LOCALES,
  }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider.");
  return context;
}