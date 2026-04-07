import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Logo from "../components/Logo";
import NetworkIllustration from "../components/NetworkIllustration";
import { useLanguage } from "../context/LanguageContext";
import { ApiError, api, firstError } from "../services/api";
import { setPendingPasswordReset } from "../utils/authFlowStorage";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setEmail(event.target.value);
    setErrors({});
    setSubmitError("");
  };

  const validate = () => {
    if (!email.trim()) {
      return { email: t("auth.validation.emailRequired") };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return { email: t("auth.validation.validEmail") };
    }

    return {};
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
      const response = await api.forgotPassword({ email: email.trim() });

      setPendingPasswordReset({
        email: response?.data?.email || email.trim(),
        token: response?.data?.resetToken || "",
        expiresInMinutes: response?.data?.expiresInMinutes ?? 60,
      });

      navigate("/reset-password", { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({ email: error.errors?.email?.[0] || "" });
        setSubmitError(firstError(error.errors, error.message));
      } else {
        setSubmitError(t("auth.unableToRequestPasswordReset"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Logo />
      <NetworkIllustration />

      <div className="pt-8">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-orange100">
          {t("auth.forgotPasswordEyebrow")}
        </p>
        <h1 className="text-3xl font-semibold text-black200 md:text-[2.5rem] dark:text-white">
          {t("auth.forgotPasswordTitle")}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate400 dark:text-slate200">
          {t("auth.forgotPasswordDescription")}
        </p>

        <form onSubmit={handleSubmit} noValidate className="pt-8 pb-3">
          {submitError ? (
            <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
              {submitError}
            </p>
          ) : null}

          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder={t("auth.email")}
              value={email}
              onChange={handleChange}
              className={`w-full rounded-md px-4 py-3 text-sm outline-none transition-colors placeholder-slate500 dark:placeholder-slate500 ${errors.email
                ? "border border-red-400 bg-red-50 text-slate500 dark:bg-red-900/20 dark:text-slate500"
                : "bg-white300 text-slate500 dark:bg-black100 dark:text-slate500 focus:bg-[#ebebeb] dark:focus:bg-[#3a3a3a]"
                }`}
            />
            {errors.email ? <p className="ml-1 mt-1 text-[0.75rem] text-red-500">{errors.email}</p> : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-orange100 py-3 text-sm font-semibold text-slate100 transition-colors hover:bg-[#e09510] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t("auth.requestingResetToken") : t("auth.requestResetToken")}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate400 dark:text-slate200">
          {t("auth.rememberPassword")}{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="bg-transparent font-semibold text-orange100 underline"
          >
            {t("auth.backToLogin")}
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}