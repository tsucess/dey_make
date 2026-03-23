import { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

const settingsItems = [
  { id: "notifications", label: "Notifications", description: "Control push alerts, email updates, and creator engagement reminders." },
  { id: "language", label: "Language", description: "Choose the language used across the DeyMake interface and notifications." },
  { id: "display", label: "Display", description: "Adjust theme, contrast, and viewing preferences for your account." },
  { id: "accessibility", label: "Accessibility", description: "Set motion, readability, and assistive options that improve usability." },
  { id: "help", label: "Help center", description: "Find support resources, FAQs, and ways to contact the DeyMake team." },
  { id: "privacy", label: "Privacy policies", description: "Review how your information is used and manage privacy related settings." },
  { id: "terms", label: "Terms of service", description: "Read the platform rules, community guidelines, and usage terms." },
];

export default function Settings() {
  const [openItem, setOpenItem] = useState(null);

  function toggleItem(id) {
    setOpenItem((current) => (current === id ? null : id));
  }

  return (
    <div className="min-h-full bg-white px-4 py-6 dark:bg-slate100 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-6 text-3xl font-medium font-inter text-slate100 dark:text-white">Settings</h1>

        <div className="rounded-[2rem] bg-white300 px-6 py-6 dark:bg-black100 md:px-10 md:py-8">
          {settingsItems.map((item, index) => {
            const isOpen = openItem === item.id;

            return (
              <div key={item.id} className={`${index !== settingsItems.length - 1 ? "border-b border-slate200 dark:border-slate300" : ""}`}>
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="flex w-full items-center justify-between gap-4 py-7 text-left"
                >
                  <span className="text-2xl font-medium font-inter text-slate100 dark:text-white">{item.label}</span>
                  <MdKeyboardArrowDown className={`h-6 w-6 text-slate600 transition-transform dark:text-slate200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && <p className="pb-6 pr-10 text-base leading-7 text-slate300 dark:text-slate200">{item.description}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}