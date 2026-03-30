import { useEffect, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { api, firstError } from "../services/api";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { MdArrowCircleLeft } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const notificationOptions = [
  "messages",
  "comments",
  "likes",
  "subscriptions",
];

const displayOptions = ["autoplay"];

const accessibilityOptions = [
  "captions",
  "reducedMotion",
];

const languageOptions = ["en", "en-GB", "fr", "es"];

const defaultPreferences = {
  notificationSettings: {
    messages: true,
    comments: true,
    likes: true,
    subscriptions: true,
  },
  language: "en",
  displayPreferences: {
    theme: "system",
    autoplay: true,
  },
  accessibilityPreferences: {
    captions: false,
    reducedMotion: false,
  },
};

function normalizePreferences(preferences = {}) {
  return {
    notificationSettings: {
      ...defaultPreferences.notificationSettings,
      ...(preferences.notificationSettings || {}),
    },
    language: preferences.language || defaultPreferences.language,
    displayPreferences: {
      ...defaultPreferences.displayPreferences,
      ...(preferences.displayPreferences || {}),
    },
    accessibilityPreferences: {
      ...defaultPreferences.accessibilityPreferences,
      ...(preferences.accessibilityPreferences || {}),
    },
  };
}

function ToggleSwitch({ enabled, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-4.5 w-7.5 items-center rounded-full transition-colors ${
        enabled ? "bg-orange100" : "bg-[#CFCFCF] dark:bg-[#C9C9C9]"
      }`}
    >
      <span
        className={`inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}


function SectionHeader({ title, isOpen, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between gap-4 py-4 text-left md:py-5">
      <span className="text-base font-medium font-inter text-slate100 dark:text-white md:text-lg">
        {title}
      </span>
      <MdKeyboardArrowDown className={`h-5 w-5 text-slate600 transition-transform dark:text-white ${isOpen ? "rotate-180" : ""}`} />
    </button>
  );
}

function SettingRow({ label, description, control }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 md:py-[0.95rem]">
      <div className="min-w-0 pr-4">
        <p className="text-[0.96rem] font-medium font-inter text-slate100 dark:text-white md:text-[1.02rem]">{label}</p>
        <p className="mt-1 text-[0.78rem] leading-[1.35] text-slate300 dark:text-slate200 md:text-[0.84rem]">{description}</p>
      </div>
      <div className="shrink-0 pt-0.5">{control}</div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="py-3 md:py-[0.95rem]">
      <label className="mb-2 block text-[0.96rem] font-medium font-inter text-slate100 dark:text-white md:text-base">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-md border border-black/12 bg-[#F3F3F3] px-4 py-[0.72rem] pr-10 text-[0.85rem] text-slate100 outline-none transition-colors focus:border-orange100 dark:border-white/12 dark:bg-[#4A4747] dark:text-white"
        >
          {options.map(([optionValue, optionLabel]) => (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          ))}
        </select>
        <MdKeyboardArrowDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate600 dark:text-slate200" />
      </div>
    </div>
  );
}

function ThemePill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium font-inter transition-colors ${
        active
          ? "bg-orange100 text-black"
          : "bg-slate150 text-slate100 dark:bg-black100 dark:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function Settings() {
  const { theme, setThemePreference } = useTheme();
  const { logout, user, syncUser } = useAuth();
  const { setLocale, t, supportedLocales } = useLanguage();
  const [openSections, setOpenSections] = useState({
    notifications: true,
    language: true,
    display: true,
    accessibility: true,
  });
  const [values, setValues] = useState(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const navigate = useNavigate();

  function goBack() {
    navigate(-1);
  }

  useEffect(() => {
    let ignore = false;

    async function loadPreferences() {
      setLoading(true);
      setError("");

      try {
        const response = await api.getPreferences();
        const nextValues = normalizePreferences(response?.data?.preferences);

        if (!ignore) {
          setValues(nextValues);
          setThemePreference(nextValues.displayPreferences.theme);
          setLocale(nextValues.language);
          if (user) {
            syncUser({
              ...user,
              preferences: nextValues,
            });
          }
        }
      } catch (nextError) {
        if (!ignore) {
          setError(firstError(nextError.errors, nextError.message || t("settings.unableToLoad")));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadPreferences();

    return () => {
      ignore = true;
    };
  }, [setThemePreference]);

  function toggleSection(key) {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  }

  async function persistChanges(nextValues, payload, sectionKey) {
    const previousValues = values;
    const previousUser = user;
    setValues(nextValues);
    setSavingSection(sectionKey);
    setError("");
    setFeedback("");
    setThemePreference(nextValues.displayPreferences.theme);
    setLocale(nextValues.language);

    if (user) {
      syncUser({
        ...user,
        preferences: nextValues,
      });
    }

    try {
      const response = await api.updatePreferences(payload);
      const normalized = normalizePreferences(response?.data?.preferences);
      setValues(normalized);
      setThemePreference(normalized.displayPreferences.theme);
      setLocale(normalized.language);
      if (previousUser) {
        syncUser({
          ...previousUser,
          preferences: normalized,
        });
      }
      setFeedback(t("settings.updated", { section: t(`settings.sections.${sectionKey}`) }));
    } catch (nextError) {
      setValues(previousValues);
      setThemePreference(previousValues.displayPreferences.theme);
      setLocale(previousValues.language);
      if (previousUser) syncUser(previousUser);
      setError(firstError(nextError.errors, nextError.message || t("settings.unableToUpdate")));
    } finally {
      setSavingSection("");
    }
  }

  function toggleNotification(key) {
    const nextValues = {
      ...values,
      notificationSettings: {
        ...values.notificationSettings,
        [key]: !values.notificationSettings[key],
      },
    };

    persistChanges(nextValues, { notificationSettings: nextValues.notificationSettings }, "notifications");
  }

  function changeLanguage(event) {
    const nextValues = {
      ...values,
      language: event.target.value,
    };

    persistChanges(nextValues, { language: nextValues.language }, "language");
  }

  function toggleDisplay(key) {
    const nextValues = {
      ...values,
      displayPreferences: {
        ...values.displayPreferences,
        [key]: !values.displayPreferences[key],
      },
    };

    persistChanges(nextValues, { displayPreferences: nextValues.displayPreferences }, "display");
  }

  function changeTheme(nextTheme) {
    const nextValues = {
      ...values,
      displayPreferences: {
        ...values.displayPreferences,
        theme: nextTheme,
      },
    };

    persistChanges(nextValues, { displayPreferences: nextValues.displayPreferences }, "display");
  }

  function toggleAccessibility(key) {
    const nextValues = {
      ...values,
      accessibilityPreferences: {
        ...values.accessibilityPreferences,
        [key]: !values.accessibilityPreferences[key],
      },
    };

    persistChanges(nextValues, { accessibilityPreferences: nextValues.accessibilityPreferences }, "accessibility");
  }

  return (
    <div className="min-h-full bg-white px-4 pb-24 pt-2 dark:bg-slate100 md:px-10 md:py-8">
<button type="button" onClick={goBack} className="bg-white300 w-10 h-10 rounded-full flex items-center justify-center mb-6 md:hidden"><IoIosArrowBack className="text-slate900 w-5 h-5"/></button>
      <div className="mx-auto w-full">
        <h1 className="mb-6 hidden md:text-3xl font-medium font-bricolage text-slate100 dark:text-white md:block">{t("settings.title")}</h1>

        {error ? <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {feedback ? <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</div> : null}
        {savingSection ? <p className="mb-4 text-sm text-slate500 dark:text-slate200">{t("settings.saving", { section: t(`settings.sections.${savingSection}`) })}</p> : null}

        {loading ? (
          <div className="rounded-3xl bg-white300 px-6 py-10 text-center text-sm text-slate600 dark:bg-black100 dark:text-slate200">
            {t("settings.loadingPreferences")}
          </div>
        ) : (
          <div className="divide-y divide-black/12 dark:divide-white/12 bg-white300 dark:bg-black100 rounded-2xl p-6">
            <section>
              <SectionHeader title={t("settings.sections.notifications")} isOpen={openSections.notifications} onClick={() => toggleSection("notifications")} />
              {openSections.notifications ? (
                <div className="pb-4 md:pb-5">
                  {notificationOptions.map((key) => (
                    <SettingRow
                      key={key}
                      label={t(`settings.notifications.${key}.label`)}
                      description={t(`settings.notifications.${key}.description`)}
                      control={<ToggleSwitch enabled={values.notificationSettings[key]} onToggle={() => toggleNotification(key)} />}
                    />
                  ))}
                </div>
              ) : null}
            </section>

            <section>
              <SectionHeader title={t("settings.sections.language")} isOpen={openSections.language} onClick={() => toggleSection("language")} />
              {openSections.language ? (
                <div className="pb-4 md:pb-5">
                  <SelectField
                    label={t("settings.appLanguage")}
                    value={values.language}
                    onChange={changeLanguage}
                    options={supportedLocales.map((optionValue) => [optionValue, t(`settings.languageNames.${optionValue}`)])}
                  />
                </div>
              ) : null}
            </section>

            <section>
              <SectionHeader title={t("settings.sections.display")} isOpen={openSections.display} onClick={() => toggleSection("display")} />
              {openSections.display ? (
                <div className="space-y-3 pb-4 md:pb-5">
                  <div className="py-3">
                    <p className="text-[0.96rem] font-medium font-inter text-slate100 dark:text-white md:text-[1.02rem]">{t("settings.themePreference")}</p>
                    <p className="mt-1 text-[0.78rem] leading-[1.35] text-slate300 dark:text-slate200 md:text-[0.84rem]">
                      {t("settings.themeDescription")}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <ThemePill label={t("common.light")} active={theme === "light"} onClick={() => changeTheme("light")} />
                      <ThemePill label={t("common.dark")} active={theme === "dark"} onClick={() => changeTheme("dark")} />
                      <ThemePill label={t("common.system")} active={theme === "system"} onClick={() => changeTheme("system")} />
                    </div>
                  </div>

                  {displayOptions.map((key) => (
                    <SettingRow
                      key={key}
                      label={t(`settings.display.${key}.label`)}
                      description={t(`settings.display.${key}.description`)}
                      control={<ToggleSwitch enabled={values.displayPreferences[key]} onToggle={() => toggleDisplay(key)} />}
                    />
                  ))}
                </div>
              ) : null}
            </section>

            <section>
              <SectionHeader title={t("settings.sections.accessibility")} isOpen={openSections.accessibility} onClick={() => toggleSection("accessibility")} />
              {openSections.accessibility ? (
                <div className="pb-4 md:pb-5">
                  {accessibilityOptions.map((key) => (
                    <SettingRow
                      key={key}
                      label={t(`settings.accessibility.${key}.label`)}
                      description={t(`settings.accessibility.${key}.description`)}
                      control={<ToggleSwitch enabled={values.accessibilityPreferences[key]} onToggle={() => toggleAccessibility(key)} />}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        )}
      </div>
       <button type="button" onClick={logout} className="text-red300 font-inter text-sm flex gap-1 mt-5 items-center-safe md:hidden"><MdArrowCircleLeft className="w-4 h-4"/> {t("common.logout")}</button>

    </div>
  );
}