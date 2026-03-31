import { useEffect, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoIosArrowBack } from "react-icons/io";
import { MdArrowCircleLeft } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { api, firstError } from "../services/api";

const notificationOptions = ["messages", "comments", "likes", "subscriptions"];
const displayOptions = ["autoplay"];
const accessibilityOptions = ["captions", "reducedMotion"];
const billingPeriods = ["weekly", "monthly", "yearly"];

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

const defaultDeveloperWorkspace = {
  loaded: false,
  loading: false,
  availableEvents: [],
  apiKeys: [],
  webhooks: [],
  summary: {
    apiKeysCount: 0,
    webhooksCount: 0,
    activeWebhooksCount: 0,
  },
  plainTextToken: "",
  webhookSecret: "",
};

const defaultMembershipWorkspace = {
  loaded: false,
  loading: false,
  plans: [],
  creatorMemberships: [],
  myMemberships: [],
};

const defaultWebhookForm = {
  name: "",
  targetUrl: "",
  events: [],
  isActive: true,
};

const defaultPlanForm = {
  name: "",
  description: "",
  priceAmount: "",
  currency: "USD",
  billingPeriod: "monthly",
  benefits: "",
  isActive: true,
  sortOrder: "0",
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

function parseList(value) {
  return `${value || ""}`
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildDeveloperSummary(apiKeys = [], webhooks = []) {
  return {
    apiKeysCount: apiKeys.length,
    webhooksCount: webhooks.length,
    activeWebhooksCount: webhooks.filter((webhook) => webhook.isActive).length,
  };
}

function normalizeWebhook(webhook = {}) {
  return {
    ...webhook,
    events: Array.isArray(webhook.events) ? webhook.events : [],
    isActive: Boolean(webhook.isActive),
  };
}

function normalizePlan(plan = {}) {
  const benefits = Array.isArray(plan.benefits) ? plan.benefits : parseList(plan.benefits);

  return {
    ...plan,
    benefits,
    benefitsText: benefits.join("\n"),
    isActive: Boolean(plan.isActive),
    sortOrder: plan.sortOrder ?? 0,
    priceAmount: plan.priceAmount ?? 0,
  };
}

function buildPlanPayload(plan = {}) {
  return {
    name: `${plan.name || ""}`.trim(),
    description: `${plan.description || ""}`.trim() || null,
    price_amount: Number(plan.priceAmount) || 0,
    currency: `${plan.currency || "USD"}`.trim().toUpperCase() || "USD",
    billing_period: plan.billingPeriod || "monthly",
    benefits: parseList(plan.benefitsText ?? plan.benefits),
    is_active: Boolean(plan.isActive),
    sort_order: Number(plan.sortOrder) || 0,
  };
}

function formatDateTime(value, fallback = "—") {
  if (!value) return fallback;

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format((Number(amount) || 0) / 100);
  } catch {
    return `${currency || "USD"} ${amount || 0}`;
  }
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

function TextField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate100 dark:text-white">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full rounded-2xl border border-black/12 bg-white px-4 py-3 text-sm text-slate100 outline-none transition-colors focus:border-orange100 dark:border-white/12 dark:bg-[#1D1D1D] dark:text-white"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder, hint, rows = 3 }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate100 dark:text-white">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        rows={rows}
        className="w-full rounded-2xl border border-black/12 bg-white px-4 py-3 text-sm text-slate100 outline-none transition-colors focus:border-orange100 dark:border-white/12 dark:bg-[#1D1D1D] dark:text-white"
      />
      {hint ? <span className="block text-xs text-slate500 dark:text-slate200">{hint}</span> : null}
    </label>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-4 dark:bg-[#1D1D1D]">
      <p className="text-xs font-medium uppercase tracking-wide text-slate500 dark:text-slate200">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate100 dark:text-white">{value}</p>
    </div>
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
    developer: false,
    memberships: false,
  });
  const [values, setValues] = useState(defaultPreferences);
  const [developerWorkspace, setDeveloperWorkspace] = useState(defaultDeveloperWorkspace);
  const [membershipWorkspace, setMembershipWorkspace] = useState(defaultMembershipWorkspace);
  const [apiKeyForm, setApiKeyForm] = useState({ name: "", abilities: "" });
  const [webhookForm, setWebhookForm] = useState({ ...defaultWebhookForm });
  const [planForm, setPlanForm] = useState({ ...defaultPlanForm });
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const navigate = useNavigate();
  const developerBusy = savingSection === "developer";
  const membershipsBusy = savingSection === "memberships";

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
  }, [setLocale, setThemePreference, syncUser, t, user]);

  async function loadDeveloperWorkspace(extras = {}) {
    setDeveloperWorkspace((current) => ({
      ...current,
      loading: true,
      plainTextToken: extras.plainTextToken || "",
      webhookSecret: extras.webhookSecret || "",
    }));

    try {
      const response = await api.getDeveloperOverview();
      const developer = response?.data?.developer || {};
      const apiKeys = developer.apiKeys || [];
      const webhooks = (developer.webhooks || []).map(normalizeWebhook);

      setDeveloperWorkspace({
        loaded: true,
        loading: false,
        availableEvents: developer.availableEvents || [],
        apiKeys,
        webhooks,
        summary: developer.summary || buildDeveloperSummary(apiKeys, webhooks),
        plainTextToken: extras.plainTextToken || "",
        webhookSecret: extras.webhookSecret || "",
      });
    } catch (nextError) {
      setDeveloperWorkspace((current) => ({ ...current, loading: false }));
      setError(firstError(nextError.errors, nextError.message || t("settings.unableToLoad")));
    }
  }

  async function loadMembershipWorkspace() {
    if (!user?.id) return;

    setMembershipWorkspace((current) => ({ ...current, loading: true }));

    try {
      const [plansResponse, creatorMembershipsResponse, myMembershipsResponse] = await Promise.all([
        api.getCreatorPlans(user.id),
        api.getCreatorMemberships(),
        api.getMyMemberships(),
      ]);

      setMembershipWorkspace({
        loaded: true,
        loading: false,
        plans: (plansResponse?.data?.plans || []).map(normalizePlan),
        creatorMemberships: creatorMembershipsResponse?.data?.memberships || [],
        myMemberships: myMembershipsResponse?.data?.memberships || [],
      });
    } catch (nextError) {
      setMembershipWorkspace((current) => ({ ...current, loading: false }));
      setError(firstError(nextError.errors, nextError.message || t("settings.unableToLoad")));
    }
  }

  function toggleSection(key) {
    const shouldOpen = !openSections[key];
    setOpenSections((current) => ({ ...current, [key]: shouldOpen }));

    if (shouldOpen && key === "developer" && !developerWorkspace.loaded && !developerWorkspace.loading) {
      loadDeveloperWorkspace();
    }

    if (shouldOpen && key === "memberships" && !membershipWorkspace.loaded && !membershipWorkspace.loading) {
      loadMembershipWorkspace();
    }
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

  function updateWebhookDraft(id, changes) {
    setDeveloperWorkspace((current) => ({
      ...current,
      webhooks: current.webhooks.map((webhook) => (webhook.id === id ? { ...webhook, ...changes } : webhook)),
    }));
  }

  function toggleWebhookDraftEvent(id, eventName) {
    setDeveloperWorkspace((current) => ({
      ...current,
      webhooks: current.webhooks.map((webhook) => {
        if (webhook.id !== id) return webhook;

        const events = webhook.events.includes(eventName)
          ? webhook.events.filter((value) => value !== eventName)
          : [...webhook.events, eventName];

        return { ...webhook, events };
      }),
    }));
  }

  function updatePlanDraft(id, changes) {
    setMembershipWorkspace((current) => ({
      ...current,
      plans: current.plans.map((plan) => (plan.id === id ? { ...plan, ...changes } : plan)),
    }));
  }

  async function handleCreateApiKey() {
    if (!apiKeyForm.name.trim()) {
      setError(t("settings.unableToUpdate"));
      return;
    }

    setSavingSection("developer");
    setError("");
    setFeedback("");

    try {
      const response = await api.createDeveloperApiKey({
        name: apiKeyForm.name.trim(),
        abilities: parseList(apiKeyForm.abilities),
      });

      setApiKeyForm({ name: "", abilities: "" });
      await loadDeveloperWorkspace({ plainTextToken: response?.data?.plainTextToken || "" });
      setFeedback(response?.message || t("settings.updated", { section: t("settings.sections.developer") }));
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("settings.unableToUpdate")));
    } finally {
      setSavingSection("");
    }
  }

  async function handleDeleteApiKey(id) {
    setSavingSection("developer");
    setError("");
    setFeedback("");

    try {
      const response = await api.deleteDeveloperApiKey(id);
      await loadDeveloperWorkspace();
      setFeedback(response?.message || t("settings.updated", { section: t("settings.sections.developer") }));
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("settings.unableToUpdate")));
    } finally {
      setSavingSection("");
    }
  }

  async function handleCreateWebhook() {
    setSavingSection("developer");
    setError("");
    setFeedback("");

    try {
      const response = await api.createDeveloperWebhook({
        name: webhookForm.name.trim(),
        targetUrl: webhookForm.targetUrl.trim(),
        events: webhookForm.events,
        isActive: webhookForm.isActive,
      });

      setWebhookForm({ ...defaultWebhookForm });
      await loadDeveloperWorkspace({ webhookSecret: response?.data?.secret || "" });
      setFeedback(response?.message || t("settings.updated", { section: t("settings.sections.developer") }));
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("settings.unableToUpdate")));
    } finally {
      setSavingSection("");
    }
  }

  async function handleSaveWebhook(webhook) {
    setSavingSection("developer");
    setError("");
    setFeedback("");

    try {
      const response = await api.updateDeveloperWebhook(webhook.id, {
        name: webhook.name.trim(),
        targetUrl: webhook.targetUrl.trim(),
        events: webhook.events,
        isActive: webhook.isActive,
      });

      await loadDeveloperWorkspace();
      setFeedback(response?.message || t("settings.updated", { section: t("settings.sections.developer") }));
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("settings.unableToUpdate")));
    } finally {
      setSavingSection("");
    }
  }

  async function handleRotateWebhookSecret(id) {
    setSavingSection("developer");
    setError("");
    setFeedback("");

    try {
      const response = await api.rotateDeveloperWebhookSecret(id);
      await loadDeveloperWorkspace({ webhookSecret: response?.data?.secret || "" });
      setFeedback(response?.message || t("settings.updated", { section: t("settings.sections.developer") }));
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("settings.unableToUpdate")));
    } finally {
      setSavingSection("");
    }
  }

  async function handleDeleteWebhook(id) {
    setSavingSection("developer");
    setError("");
    setFeedback("");

    try {
      const response = await api.deleteDeveloperWebhook(id);
      await loadDeveloperWorkspace();
      setFeedback(response?.message || t("settings.updated", { section: t("settings.sections.developer") }));
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("settings.unableToUpdate")));
    } finally {
      setSavingSection("");
    }
  }

  async function handleCreatePlan() {
    setSavingSection("memberships");
    setError("");
    setFeedback("");

    try {
      const response = await api.createCreatorPlan(buildPlanPayload(planForm));
      setPlanForm({ ...defaultPlanForm });
      await loadMembershipWorkspace();
      setFeedback(response?.message || t("settings.updated", { section: t("settings.sections.memberships") }));
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("settings.unableToUpdate")));
    } finally {
      setSavingSection("");
    }
  }

  async function handleSavePlan(plan) {
    setSavingSection("memberships");
    setError("");
    setFeedback("");

    try {
      const response = await api.updateCreatorPlan(plan.id, buildPlanPayload(plan));
      await loadMembershipWorkspace();
      setFeedback(response?.message || t("settings.updated", { section: t("settings.sections.memberships") }));
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("settings.unableToUpdate")));
    } finally {
      setSavingSection("");
    }
  }

  async function handleDeletePlan(id) {
    setSavingSection("memberships");
    setError("");
    setFeedback("");

    try {
      const response = await api.deleteCreatorPlan(id);
      await loadMembershipWorkspace();
      setFeedback(response?.message || t("settings.updated", { section: t("settings.sections.memberships") }));
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("settings.unableToUpdate")));
    } finally {
      setSavingSection("");
    }
  }

  async function handleCancelMembership(id) {
    setSavingSection("memberships");
    setError("");
    setFeedback("");

    try {
      const response = await api.cancelMembership(id);
      await loadMembershipWorkspace();
      setFeedback(response?.message || t("settings.updated", { section: t("settings.sections.memberships") }));
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("settings.unableToUpdate")));
    } finally {
      setSavingSection("");
    }
  }

  return (
    <div className="min-h-full bg-white px-4 pb-24 pt-2 dark:bg-slate100 md:px-10 md:py-8">
      <button type="button" onClick={goBack} className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white300 md:hidden">
        <IoIosArrowBack className="h-5 w-5 text-slate900" />
      </button>
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

            <section>
              <SectionHeader title={t("settings.sections.developer")} isOpen={openSections.developer} onClick={() => toggleSection("developer")} />
              {openSections.developer ? (
                developerWorkspace.loading ? (
                  <div className="pb-4 text-sm text-slate600 dark:text-slate200">{t("settings.developer.loading")}</div>
                ) : (
                  <div className="space-y-6 pb-4 md:pb-5">
                    <div>
                      <p className="text-sm text-slate600 dark:text-slate200">{t("settings.developer.description")}</p>
                    </div>

                    <div>
                      <h3 className="mb-3 text-base font-semibold text-slate100 dark:text-white">{t("settings.developer.summaryTitle")}</h3>
                      <div className="grid gap-3 md:grid-cols-3">
                        <SummaryCard label={t("settings.developer.apiKeysCount")} value={developerWorkspace.summary.apiKeysCount} />
                        <SummaryCard label={t("settings.developer.webhooksCount")} value={developerWorkspace.summary.webhooksCount} />
                        <SummaryCard label={t("settings.developer.activeWebhooksCount")} value={developerWorkspace.summary.activeWebhooksCount} />
                      </div>
                    </div>

                    <div className="rounded-3xl bg-white px-4 py-4 dark:bg-[#1D1D1D]">
                      <h3 className="text-base font-semibold text-slate100 dark:text-white">{t("settings.developer.apiKeysHeading")}</h3>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <TextField
                          label={t("settings.developer.apiKeyName")}
                          value={apiKeyForm.name}
                          onChange={(event) => setApiKeyForm((current) => ({ ...current, name: event.target.value }))}
                        />
                        <TextAreaField
                          label={t("settings.developer.apiKeyAbilities")}
                          value={apiKeyForm.abilities}
                          onChange={(event) => setApiKeyForm((current) => ({ ...current, abilities: event.target.value }))}
                          hint={t("settings.developer.apiKeyAbilitiesHint")}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateApiKey}
                        disabled={developerBusy}
                        className="mt-4 rounded-full bg-orange100 px-6 py-3 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {t("settings.developer.createApiKey")}
                      </button>

                      {developerWorkspace.plainTextToken ? (
                        <div className="mt-4 rounded-2xl bg-black px-4 py-3 text-sm text-white">
                          <p className="mb-2 font-medium">{t("settings.developer.plainTextToken")}</p>
                          <p className="break-all">{developerWorkspace.plainTextToken}</p>
                        </div>
                      ) : null}

                      <div className="mt-5 space-y-3">
                        {developerWorkspace.apiKeys.length ? developerWorkspace.apiKeys.map((apiKey) => (
                          <div key={apiKey.id} className="rounded-2xl border border-black/8 px-4 py-4 dark:border-white/10">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-1">
                                <p className="text-base font-medium text-slate100 dark:text-white">{apiKey.name}</p>
                                <p className="text-sm text-slate600 dark:text-slate200">{apiKey.abilities?.join(", ") || "*"}</p>
                                <p className="text-xs text-slate500 dark:text-slate300">{t("settings.developer.createdAt")}: {formatDateTime(apiKey.createdAt)}</p>
                                <p className="text-xs text-slate500 dark:text-slate300">{t("settings.developer.lastUsedAt")}: {formatDateTime(apiKey.lastUsedAt)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteApiKey(apiKey.id)}
                                disabled={developerBusy}
                                className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {t("settings.developer.deleteApiKey")}
                              </button>
                            </div>
                          </div>
                        )) : <p className="text-sm text-slate600 dark:text-slate200">{t("settings.developer.apiKeysEmpty")}</p>}
                      </div>
                    </div>

                    <div className="rounded-3xl bg-white px-4 py-4 dark:bg-[#1D1D1D]">
                      <h3 className="text-base font-semibold text-slate100 dark:text-white">{t("settings.developer.webhooksHeading")}</h3>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <TextField
                          label={t("settings.developer.webhookName")}
                          value={webhookForm.name}
                          onChange={(event) => setWebhookForm((current) => ({ ...current, name: event.target.value }))}
                        />
                        <TextField
                          label={t("settings.developer.webhookTargetUrl")}
                          type="url"
                          value={webhookForm.targetUrl}
                          onChange={(event) => setWebhookForm((current) => ({ ...current, targetUrl: event.target.value }))}
                        />
                      </div>
                      <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-slate100 dark:text-white">{t("settings.developer.webhookEvents")}</p>
                        <div className="flex flex-wrap gap-2">
                          {developerWorkspace.availableEvents.map((eventName) => {
                            const selected = webhookForm.events.includes(eventName);

                            return (
                              <label key={eventName} className={`rounded-full border px-3 py-2 text-xs font-medium ${selected ? "border-orange100 bg-orange100 text-black" : "border-black/10 text-slate600 dark:border-white/10 dark:text-slate200"}`}>
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => setWebhookForm((current) => ({
                                    ...current,
                                    events: current.events.includes(eventName)
                                      ? current.events.filter((value) => value !== eventName)
                                      : [...current.events, eventName],
                                  }))}
                                  className="sr-only"
                                />
                                {eventName}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-black/8 px-4 py-3 dark:border-white/10">
                        <div>
                          <p className="text-sm font-medium text-slate100 dark:text-white">{t("settings.developer.webhookActive")}</p>
                        </div>
                        <ToggleSwitch
                          enabled={webhookForm.isActive}
                          onToggle={() => setWebhookForm((current) => ({ ...current, isActive: !current.isActive }))}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateWebhook}
                        disabled={developerBusy}
                        className="mt-4 rounded-full bg-orange100 px-6 py-3 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {t("settings.developer.createWebhook")}
                      </button>

                      {developerWorkspace.webhookSecret ? (
                        <div className="mt-4 rounded-2xl bg-black px-4 py-3 text-sm text-white">
                          <p className="mb-2 font-medium">{t("settings.developer.webhookSecret")}</p>
                          <p className="break-all">{developerWorkspace.webhookSecret}</p>
                        </div>
                      ) : null}

                      <div className="mt-5 space-y-4">
                        {developerWorkspace.webhooks.length ? developerWorkspace.webhooks.map((webhook) => (
                          <div key={webhook.id} className="rounded-2xl border border-black/8 px-4 py-4 dark:border-white/10">
                            <div className="grid gap-4 md:grid-cols-2">
                              <TextField
                                label={t("settings.developer.webhookName")}
                                value={webhook.name}
                                onChange={(event) => updateWebhookDraft(webhook.id, { name: event.target.value })}
                              />
                              <TextField
                                label={t("settings.developer.webhookTargetUrl")}
                                type="url"
                                value={webhook.targetUrl}
                                onChange={(event) => updateWebhookDraft(webhook.id, { targetUrl: event.target.value })}
                              />
                            </div>
                            <div className="mt-4">
                              <p className="mb-2 text-sm font-medium text-slate100 dark:text-white">{t("settings.developer.webhookEvents")}</p>
                              <div className="flex flex-wrap gap-2">
                                {developerWorkspace.availableEvents.map((eventName) => {
                                  const selected = webhook.events.includes(eventName);

                                  return (
                                    <label key={eventName} className={`rounded-full border px-3 py-2 text-xs font-medium ${selected ? "border-orange100 bg-orange100 text-black" : "border-black/10 text-slate600 dark:border-white/10 dark:text-slate200"}`}>
                                      <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={() => toggleWebhookDraftEvent(webhook.id, eventName)}
                                        className="sr-only"
                                      />
                                      {eventName}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-black/8 px-4 py-3 dark:border-white/10">
                              <div>
                                <p className="text-sm font-medium text-slate100 dark:text-white">{t("settings.developer.webhookActive")}</p>
                                <p className="text-xs text-slate500 dark:text-slate300">{t("settings.developer.lastTriggeredAt")}: {formatDateTime(webhook.lastTriggeredAt, t("settings.developer.neverTriggered"))}</p>
                                <p className="text-xs text-slate500 dark:text-slate300">{t("settings.developer.lastStatusCode")}: {webhook.lastStatusCode || "—"}</p>
                              </div>
                              <ToggleSwitch enabled={webhook.isActive} onToggle={() => updateWebhookDraft(webhook.id, { isActive: !webhook.isActive })} />
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => handleSaveWebhook(webhook)}
                                disabled={developerBusy}
                                className="rounded-full bg-orange100 px-5 py-2.5 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {t("settings.developer.saveWebhook")}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRotateWebhookSecret(webhook.id)}
                                disabled={developerBusy}
                                className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-slate100 dark:border-white/10 dark:text-white disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {t("settings.developer.rotateSecret")}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteWebhook(webhook.id)}
                                disabled={developerBusy}
                                className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {t("settings.developer.deleteWebhook")}
                              </button>
                            </div>
                          </div>
                        )) : <p className="text-sm text-slate600 dark:text-slate200">{t("settings.developer.webhooksEmpty")}</p>}
                      </div>
                    </div>
                  </div>
                )
              ) : null}
            </section>

            <section>
              <SectionHeader title={t("settings.sections.memberships")} isOpen={openSections.memberships} onClick={() => toggleSection("memberships")} />
              {openSections.memberships ? (
                membershipWorkspace.loading ? (
                  <div className="pb-4 text-sm text-slate600 dark:text-slate200">{t("settings.memberships.loading")}</div>
                ) : (
                  <div className="space-y-6 pb-4 md:pb-5">
                    <p className="text-sm text-slate600 dark:text-slate200">{t("settings.memberships.description")}</p>

                    <div className="rounded-3xl bg-white px-4 py-4 dark:bg-[#1D1D1D]">
                      <h3 className="text-base font-semibold text-slate100 dark:text-white">{t("settings.memberships.plansHeading")}</h3>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <TextField
                          label={t("settings.memberships.planName")}
                          value={planForm.name}
                          onChange={(event) => setPlanForm((current) => ({ ...current, name: event.target.value }))}
                        />
                        <TextField
                          label={t("settings.memberships.planCurrency")}
                          value={planForm.currency}
                          onChange={(event) => setPlanForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))}
                        />
                        <TextAreaField
                          label={t("settings.memberships.planDescription")}
                          value={planForm.description}
                          onChange={(event) => setPlanForm((current) => ({ ...current, description: event.target.value }))}
                        />
                        <TextAreaField
                          label={t("settings.memberships.planBenefits")}
                          value={planForm.benefitsText || planForm.benefits}
                          onChange={(event) => setPlanForm((current) => ({ ...current, benefitsText: event.target.value, benefits: event.target.value }))}
                          hint={t("settings.memberships.planBenefitsHint")}
                        />
                        <TextField
                          label={t("settings.memberships.planPrice")}
                          type="number"
                          value={planForm.priceAmount}
                          onChange={(event) => setPlanForm((current) => ({ ...current, priceAmount: event.target.value }))}
                        />
                        <TextField
                          label={t("settings.memberships.planSortOrder")}
                          type="number"
                          value={planForm.sortOrder}
                          onChange={(event) => setPlanForm((current) => ({ ...current, sortOrder: event.target.value }))}
                        />
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                        <SelectField
                          label={t("settings.memberships.planBillingPeriod")}
                          value={planForm.billingPeriod}
                          onChange={(event) => setPlanForm((current) => ({ ...current, billingPeriod: event.target.value }))}
                          options={billingPeriods.map((period) => [period, t(`settings.memberships.billingPeriods.${period}`)])}
                        />
                        <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/8 px-4 py-3 dark:border-white/10">
                          <span className="text-sm font-medium text-slate100 dark:text-white">{t("settings.memberships.planActive")}</span>
                          <ToggleSwitch enabled={planForm.isActive} onToggle={() => setPlanForm((current) => ({ ...current, isActive: !current.isActive }))} />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCreatePlan}
                        disabled={membershipsBusy}
                        className="mt-4 rounded-full bg-orange100 px-6 py-3 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {t("settings.memberships.createPlan")}
                      </button>

                      <div className="mt-5 space-y-4">
                        {membershipWorkspace.plans.length ? membershipWorkspace.plans.map((plan) => (
                          <div key={plan.id} className="rounded-2xl border border-black/8 px-4 py-4 dark:border-white/10">
                            <div className="grid gap-4 md:grid-cols-2">
                              <TextField
                                label={t("settings.memberships.planName")}
                                value={plan.name}
                                onChange={(event) => updatePlanDraft(plan.id, { name: event.target.value })}
                              />
                              <TextField
                                label={t("settings.memberships.planCurrency")}
                                value={plan.currency}
                                onChange={(event) => updatePlanDraft(plan.id, { currency: event.target.value.toUpperCase() })}
                              />
                              <TextAreaField
                                label={t("settings.memberships.planDescription")}
                                value={plan.description || ""}
                                onChange={(event) => updatePlanDraft(plan.id, { description: event.target.value })}
                              />
                              <TextAreaField
                                label={t("settings.memberships.planBenefits")}
                                value={plan.benefitsText}
                                onChange={(event) => updatePlanDraft(plan.id, { benefitsText: event.target.value, benefits: parseList(event.target.value) })}
                                hint={t("settings.memberships.planBenefitsHint")}
                              />
                              <TextField
                                label={t("settings.memberships.planPrice")}
                                type="number"
                                value={plan.priceAmount}
                                onChange={(event) => updatePlanDraft(plan.id, { priceAmount: event.target.value })}
                              />
                              <TextField
                                label={t("settings.memberships.planSortOrder")}
                                type="number"
                                value={plan.sortOrder}
                                onChange={(event) => updatePlanDraft(plan.id, { sortOrder: event.target.value })}
                              />
                            </div>
                            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                              <SelectField
                                label={t("settings.memberships.planBillingPeriod")}
                                value={plan.billingPeriod}
                                onChange={(event) => updatePlanDraft(plan.id, { billingPeriod: event.target.value })}
                                options={billingPeriods.map((period) => [period, t(`settings.memberships.billingPeriods.${period}`)])}
                              />
                              <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/8 px-4 py-3 dark:border-white/10">
                                <div>
                                  <p className="text-sm font-medium text-slate100 dark:text-white">{t("settings.memberships.planActive")}</p>
                                  <p className="text-xs text-slate500 dark:text-slate300">{t("settings.memberships.activeMembers")}: {plan.activeMemberCount} · {t("settings.memberships.totalMembers")}: {plan.memberCount}</p>
                                </div>
                                <ToggleSwitch enabled={plan.isActive} onToggle={() => updatePlanDraft(plan.id, { isActive: !plan.isActive })} />
                              </div>
                            </div>
                            <p className="mt-3 text-sm text-slate600 dark:text-slate200">{t("settings.memberships.priceLabel", { amount: formatMoney(plan.priceAmount, plan.currency), period: t(`settings.memberships.billingPeriods.${plan.billingPeriod}`) })}</p>
                            <div className="mt-4 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => handleSavePlan(plan)}
                                disabled={membershipsBusy}
                                className="rounded-full bg-orange100 px-5 py-2.5 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {t("settings.memberships.savePlan")}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePlan(plan.id)}
                                disabled={membershipsBusy}
                                className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {t("settings.memberships.deletePlan")}
                              </button>
                            </div>
                          </div>
                        )) : <p className="text-sm text-slate600 dark:text-slate200">{t("settings.memberships.plansEmpty")}</p>}
                      </div>
                    </div>

                    <div className="rounded-3xl bg-white px-4 py-4 dark:bg-[#1D1D1D]">
                      <h3 className="text-base font-semibold text-slate100 dark:text-white">{t("settings.memberships.creatorMembershipsHeading")}</h3>
                      <div className="mt-4 space-y-3">
                        {membershipWorkspace.creatorMemberships.length ? membershipWorkspace.creatorMemberships.map((membership) => (
                          <div key={membership.id} className="rounded-2xl border border-black/8 px-4 py-4 dark:border-white/10">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-1">
                                <p className="text-base font-medium text-slate100 dark:text-white">{membership.member?.fullName || t("settings.memberships.member")}</p>
                                <p className="text-sm text-slate600 dark:text-slate200">{membership.plan?.name || "—"}</p>
                                <p className="text-xs text-slate500 dark:text-slate300">{t(`settings.memberships.statuses.${membership.status}`)}</p>
                                <p className="text-xs text-slate500 dark:text-slate300">{t("settings.memberships.joinedAt")}: {formatDateTime(membership.startedAt)}</p>
                                <p className="text-xs text-slate500 dark:text-slate300">{t("settings.memberships.endsAt")}: {formatDateTime(membership.endsAt)}</p>
                              </div>
                              {membership.status === "active" ? (
                                <button
                                  type="button"
                                  onClick={() => handleCancelMembership(membership.id)}
                                  disabled={membershipsBusy}
                                  className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {t("settings.memberships.cancelMembership")}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        )) : <p className="text-sm text-slate600 dark:text-slate200">{t("settings.memberships.creatorMembershipsEmpty")}</p>}
                      </div>
                    </div>

                    <div className="rounded-3xl bg-white px-4 py-4 dark:bg-[#1D1D1D]">
                      <h3 className="text-base font-semibold text-slate100 dark:text-white">{t("settings.memberships.myMembershipsHeading")}</h3>
                      <div className="mt-4 space-y-3">
                        {membershipWorkspace.myMemberships.length ? membershipWorkspace.myMemberships.map((membership) => (
                          <div key={membership.id} className="rounded-2xl border border-black/8 px-4 py-4 dark:border-white/10">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-1">
                                <p className="text-base font-medium text-slate100 dark:text-white">{membership.creator?.fullName || t("settings.memberships.creator")}</p>
                                <p className="text-sm text-slate600 dark:text-slate200">{membership.plan?.name || "—"}</p>
                                <p className="text-sm text-slate600 dark:text-slate200">{t("settings.memberships.priceLabel", { amount: formatMoney(membership.priceAmount, membership.currency), period: t(`settings.memberships.billingPeriods.${membership.billingPeriod}`) })}</p>
                                <p className="text-xs text-slate500 dark:text-slate300">{t(`settings.memberships.statuses.${membership.status}`)}</p>
                                <p className="text-xs text-slate500 dark:text-slate300">{t("settings.memberships.joinedAt")}: {formatDateTime(membership.startedAt)}</p>
                              </div>
                              {membership.status === "active" ? (
                                <button
                                  type="button"
                                  onClick={() => handleCancelMembership(membership.id)}
                                  disabled={membershipsBusy}
                                  className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {t("settings.memberships.cancelMembership")}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        )) : <p className="text-sm text-slate600 dark:text-slate200">{t("settings.memberships.myMembershipsEmpty")}</p>}
                      </div>
                    </div>
                  </div>
                )
              ) : null}
            </section>
          </div>
        )}
      </div>
      <button type="button" onClick={logout} className="mt-5 flex items-center gap-1 text-sm font-inter text-red300 md:hidden">
        <MdArrowCircleLeft className="h-4 w-4" /> {t("common.logout")}
      </button>

    </div>
  );
}