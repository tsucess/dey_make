import { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useTheme } from "../context/ThemeContext";

const notifications = [
  ["pushNotifications", "Push notifications", "Get real-time alerts on your device"],
  ["emailNotifications", "Email notifications", "Receive updates in your inbox"],
  ["mentionsReplies", "Mentions & replies", "When someone interacts with your content"],
  ["newFollowers", "New followers", "Be notified when someone follows you"],
  ["contentRecommendations", "Content recommendations", "Discover content tailored to you"],
  ["marketingPromotions", "Marketing & promotions", "Offers, updates, and announcements"],
];

const displayOptions = [
  ["reduceMotion", "Reduce motion", "Limit animations for smoother experience"],
  ["darkTheme", "Dark theme", "Select dark theme as app default"],
];

const accessibilityOptions = [
  ["screenReaderSupport", "Screen reader support", "Optimized for assistive technologies"],
  ["enableCaptions", "Enable captions", "Show captions on video content"],
  ["keyboardNavigation", "Keyboard navigation", "Navigate using keyboard shortcuts"],
  ["colorAdjustment", "Color adjustment", "Enhance color visibility"],
];

const languageOptions = ["🇺🇸 English (US)", "🇬🇧 English (UK)", "🇫🇷 French", "🇪🇸 Spanish"];
const closedSections = ["Help center", "Privacy policies", "Terms of service"];

function ToggleSwitch({ enabled, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-[18px] w-[30px] items-center rounded-full transition-colors ${
        enabled ? "bg-orange100" : "bg-[#CFCFCF] dark:bg-[#C9C9C9]"
      }`}
    >
      <span
        className={`inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-[16px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

function SectionHeader({ title, isOpen, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between gap-4 py-4 text-left md:py-5">
      <span className="text-[1.12rem] font-medium font-inter text-slate100 dark:text-white md:text-[1.4rem]">
        {title}
      </span>
      <MdKeyboardArrowDown className={`h-5 w-5 text-slate600 transition-transform dark:text-slate200 ${isOpen ? "rotate-180" : ""}`} />
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

function SelectField({ label, value, onChange }) {
  return (
    <div className="py-3 md:py-[0.95rem]">
      <label className="mb-2 block text-[0.96rem] font-medium font-inter text-slate100 dark:text-white md:text-[1.02rem]">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-md border border-black/12 bg-[#F3F3F3] px-4 py-[0.72rem] pr-10 text-[0.85rem] text-slate100 outline-none transition-colors focus:border-orange100 dark:border-white/12 dark:bg-[#4A4747] dark:text-white"
        >
          {languageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <MdKeyboardArrowDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate600 dark:text-slate200" />
      </div>
    </div>
  );
}

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const [openSections, setOpenSections] = useState({
    notifications: true,
    language: true,
    display: true,
    accessibility: true,
  });
  const [values, setValues] = useState({
    pushNotifications: true,
    emailNotifications: false,
    mentionsReplies: true,
    newFollowers: true,
    contentRecommendations: true,
    marketingPromotions: false,
    reduceMotion: true,
    screenReaderSupport: true,
    enableCaptions: false,
    keyboardNavigation: true,
    colorAdjustment: true,
    region: true,
    appLanguage: languageOptions[0],
    contentLanguage: languageOptions[0],
  });

  function toggleSection(key) {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  }

  function toggleValue(key) {
    setValues((current) => ({ ...current, [key]: !current[key] }));
  }

  function updateSelect(key, event) {
    setValues((current) => ({ ...current, [key]: event.target.value }));
  }

  return (
    <div className="min-h-full bg-white px-4 pb-24 pt-2 dark:bg-[#343232] md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-[740px]">
        <h1 className="mb-6 hidden text-3xl font-medium font-inter text-slate100 dark:text-white md:block">Settings</h1>

        <div className="divide-y divide-black/12 dark:divide-white/12">
          <section>
            <SectionHeader title="Notifications" isOpen={openSections.notifications} onClick={() => toggleSection("notifications")} />
            {openSections.notifications ? (
              <div className="pb-4 md:pb-5">
                {notifications.map(([key, label, description]) => (
                  <SettingRow
                    key={key}
                    label={label}
                    description={description}
                    control={<ToggleSwitch enabled={values[key]} onToggle={() => toggleValue(key)} />}
                  />
                ))}
              </div>
            ) : null}
          </section>

          <section>
            <SectionHeader title="Language" isOpen={openSections.language} onClick={() => toggleSection("language")} />
            {openSections.language ? (
              <div className="pb-4 md:pb-5">
                <SelectField label="App language" value={values.appLanguage} onChange={(event) => updateSelect("appLanguage", event)} />
                <SelectField label="Content language" value={values.contentLanguage} onChange={(event) => updateSelect("contentLanguage", event)} />
                <SettingRow
                  label="Region"
                  description="Helps personalize content and trends"
                  control={<ToggleSwitch enabled={values.region} onToggle={() => toggleValue("region")} />}
                />
              </div>
            ) : null}
          </section>

          <section>
            <SectionHeader title="Display" isOpen={openSections.display} onClick={() => toggleSection("display")} />
            {openSections.display ? (
              <div className="pb-4 md:pb-5">
                {displayOptions.map(([key, label, description]) => (
                  <SettingRow
                    key={key}
                    label={label}
                    description={description}
                    control={
                      <ToggleSwitch
                        enabled={key === "darkTheme" ? isDark : values[key]}
                        onToggle={key === "darkTheme" ? toggleTheme : () => toggleValue(key)}
                      />
                    }
                  />
                ))}
              </div>
            ) : null}
          </section>

          <section>
            <SectionHeader title="Accessibility" isOpen={openSections.accessibility} onClick={() => toggleSection("accessibility")} />
            {openSections.accessibility ? (
              <div className="pb-4 md:pb-5">
                {accessibilityOptions.map(([key, label, description]) => (
                  <SettingRow
                    key={key}
                    label={label}
                    description={description}
                    control={<ToggleSwitch enabled={values[key]} onToggle={() => toggleValue(key)} />}
                  />
                ))}
              </div>
            ) : null}
          </section>

          {closedSections.map((title) => (
            <section key={title}>
              <SectionHeader title={title} isOpen={false} onClick={() => {}} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}