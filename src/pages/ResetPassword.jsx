import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Logo from "../components/Logo";
import NetworkIllustration from "../components/NetworkIllustration";
import { useLanguage } from "../context/LanguageContext";
import { ApiError, api, firstError } from "../services/api";
import { clearPendingPasswordReset, getPendingPasswordReset } from "../utils/authFlowStorage";

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const pendingReset = useMemo(() => getPendingPasswordReset(), []);
  const [form, setForm] = useState(() => ({
    email: pendingReset?.email || "",
    token: pendingReset?.token || "",
    password: "",
    confirmPassword: "",
  }));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSubmitError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = t("auth.validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = t("auth.validation.validEmail");
    }

    if (!form.token.trim()) {
      nextErrors.token = t("auth.validation.resetTokenRequired");
    }

    if (!form.password) {
      nextErrors.password = t("auth.validation.passwordRequired");
    } else if (form.password.length < 8) {
      nextErrors.password = t("auth.validation.passwordMin");
    } else if (!/[A-Z]/.test(form.password)) {
      nextErrors.password = t("auth.validation.passwordUpper");
    } else if (!/[0-9]/.test(form.password)) {
      nextErrors.password = t("auth.validation.passwordNumber");
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = t("auth.validation.confirmPasswordRequired");
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = t("auth.validation.confirmPasswordMatch");
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await api.resetPassword({
        email: form.email.trim(),
        token: form.token.trim(),
        password: form.password,
      });

      clearPendingPasswordReset();
      setIsComplete(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({
          email: error.errors?.email?.[0] || "",
          token: error.errors?.token?.[0] || "",
          password: error.errors?.password?.[0] || "",
          confirmPassword: "",
        });
        setSubmitError(firstError(error.errors, error.message));
      } else {
        setSubmitError(t("auth.unableToResetPassword"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <AuthLayout>
        <Logo />
        <NetworkIllustration />

        <div className="pt-8">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-orange100">
            {t("auth.resetPasswordEyebrow")}
          </p>
          <h1 className="text-3xl font-semibold text-black200 md:text-[2.5rem] dark:text-white">
            {t("auth.passwordResetSuccessTitle")}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate400 dark:text-slate200">
            {t("auth.passwordResetSuccessDescription")}
          </p>

          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="mt-8 w-full rounded-md bg-orange100 py-3 text-sm font-semibold text-slate100 transition-colors hover:bg-[#e09510]"
          >
            {t("auth.passwordResetContinueToLogin")}
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Logo />
      <NetworkIllustration />

      <div className="pt-8">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-orange100">
          {t("auth.resetPasswordEyebrow")}
        </p>
        <h1 className="text-3xl font-semibold text-black200 md:text-[2.5rem] dark:text-white">
          {t("auth.resetPasswordTitle")}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate400 dark:text-slate200">
          {t("auth.resetPasswordDescription", { minutes: pendingReset?.expiresInMinutes ?? 60 })}
        </p>

        <form onSubmit={handleSubmit} noValidate className="pt-8 pb-3">
          {submitError ? (
            <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
              {submitError}
            </p>
          ) : null}

          <div className="mb-3">
            <input
              type="email"
              name="email"
              placeholder={t("auth.email")}
              value={form.email}
              onChange={handleChange}
              className={`w-full rounded-md px-4 py-3 text-sm outline-none transition-colors placeholder-slate500 dark:placeholder-slate500 ${errors.email
                ? "border border-red-400 bg-red-50 text-slate500 dark:bg-red-900/20 dark:text-slate500"
                : "bg-white300 text-slate500 dark:bg-black100 dark:text-slate500 focus:bg-[#ebebeb] dark:focus:bg-[#3a3a3a]"
                }`}
            />
            {errors.email ? <p className="ml-1 mt-1 text-[0.75rem] text-red-500">{errors.email}</p> : null}
          </div>

          <div className="mb-1">
            <input
              type="text"
              name="token"
              placeholder={t("auth.resetToken")}
              value={form.token}
              onChange={handleChange}
              className={`w-full rounded-md px-4 py-3 text-sm outline-none transition-colors placeholder-slate500 dark:placeholder-slate500 ${errors.token
                ? "border border-red-400 bg-red-50 text-slate500 dark:bg-red-900/20 dark:text-slate500"
                : "bg-white300 text-slate500 dark:bg-black100 dark:text-slate500 focus:bg-[#ebebeb] dark:focus:bg-[#3a3a3a]"
                }`}
            />
            {errors.token ? <p className="ml-1 mt-1 text-[0.75rem] text-red-500">{errors.token}</p> : null}
          </div>

          <p className="mb-3 mt-1 text-[0.75rem] text-slate400 dark:text-slate200">
            {t("auth.resetTokenHint")}
          </p>

          <div className="mb-3">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t("auth.newPassword")}
                value={form.password}
                onChange={handleChange}
                className={`w-full rounded-md px-4 py-3 pr-12 text-sm outline-none transition-colors placeholder-slate500 dark:placeholder-slate500 ${errors.password
                  ? "border border-red-400 bg-red-50 text-slate500 dark:bg-red-900/20 dark:text-slate500"
                  : "bg-white300 text-slate500 dark:bg-black100 dark:text-slate500 focus:bg-[#ebebeb] dark:focus:bg-[#3a3a3a]"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent text-slate500"
                aria-label={t("auth.togglePassword")}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password ? <p className="ml-1 mt-1 text-[0.75rem] text-red-500">{errors.password}</p> : null}
          </div>

          <div className="mb-4">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder={t("auth.confirmPassword")}
              value={form.confirmPassword}
              onChange={handleChange}
              className={`w-full rounded-md px-4 py-3 text-sm outline-none transition-colors placeholder-slate500 dark:placeholder-slate500 ${errors.confirmPassword
                ? "border border-red-400 bg-red-50 text-slate500 dark:bg-red-900/20 dark:text-slate500"
                : "bg-white300 text-slate500 dark:bg-black100 dark:text-slate500 focus:bg-[#ebebeb] dark:focus:bg-[#3a3a3a]"
                }`}
            />
            {errors.confirmPassword ? <p className="ml-1 mt-1 text-[0.75rem] text-red-500">{errors.confirmPassword}</p> : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-orange100 py-3 text-sm font-semibold text-slate100 transition-colors hover:bg-[#e09510] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t("auth.resettingPassword") : t("auth.resetPasswordAction")}
          </button>
        </form>

        <div className="mt-5 flex flex-col gap-3 text-center text-sm md:flex-row md:items-center md:justify-between md:text-left">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="bg-transparent font-semibold text-orange100 underline"
          >
            {t("auth.requestAnotherResetToken")}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="bg-transparent text-sm font-medium text-black200 underline transition-colors hover:text-orange100 dark:text-slate200"
          >
            {t("auth.backToLogin")}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}