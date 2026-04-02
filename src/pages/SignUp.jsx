import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Logo from "../components/Logo";
import SocialButtonRow from "../components/SocialButton";
import OrDivider from "../components/OrDivider";
import NetworkIllustration from "../components/NetworkIllustration";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { ApiError, firstError } from "../services/api";

const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/;

export default function SignUp({ onNavigateToLogin, onSuccess }) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) {
      newErrors.fullName = t("auth.validation.fullNameRequired");
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = t("auth.validation.nameMin");
    }
    if (!form.username.trim()) {
      newErrors.username = t("auth.validation.usernameRequired");
    } else if (!USERNAME_PATTERN.test(form.username.trim())) {
      newErrors.username = t("auth.validation.usernameInvalid");
    }
    if (!form.email.trim()) {
      newErrors.email = t("auth.validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t("auth.validation.validEmail");
    }
    if (!form.password) {
      newErrors.password = t("auth.validation.passwordRequired");
    } else if (form.password.length < 8) {
      newErrors.password = t("auth.validation.passwordMin");
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = t("auth.validation.passwordUpper");
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = t("auth.validation.passwordNumber");
    }
    if (!agreed) {
      newErrors.agreed = t("auth.validation.agreeRequired");
    }
    return newErrors;
  };

  const navigateToLogin = onNavigateToLogin ?? (() => navigate("/login"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await register({
        ...form,
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
      });

      if (result?.verification?.required) {
        navigate("/verify-email", { replace: true });
        return;
      }

      onSuccess?.();
      navigate("/home", { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({
          fullName: error.errors?.fullName?.[0] || "",
          username: error.errors?.username?.[0] || "",
          email: error.errors?.email?.[0] || "",
          password: error.errors?.password?.[0] || "",
          agreed: "",
        });
        setSubmitError(firstError(error.errors, error.message));
      } else {
        setSubmitError(t("auth.unableToCreateAccount"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Logo />
      <NetworkIllustration />

      <h2 className="text-lg font-semibold mb-3
                     text-gray-800 dark:text-white md:hidden">
        {t("auth.signUp")}
      </h2>

      <form onSubmit={handleSubmit} noValidate className="pt-8 pb-2">
        {submitError && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
            {submitError}
          </p>
        )}

        {/* Full Name */}
        <div className="mb-3">
          <input
            type="text"
            name="fullName"
            placeholder={t("auth.fullName")}
            value={form.fullName}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-md text-sm
                        outline-none transition-colors
                        placeholder-slate500 dark:placeholder-slate500
                        ${errors.fullName
                          ? "border border-red-400 bg-red-50 dark:bg-red-900/20 text-slate500 dark:text-slate500"
                          : "bg-white300 dark:bg-black100 text-slate500 dark:text-slate500 focus:bg-[#ebebeb] dark:focus:bg-[#3a3a3a]"
                        }`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-[0.75rem] mt-1 ml-1">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Username */}
        <div className="mb-3">
          <input
            type="text"
            name="username"
            placeholder={t("auth.username")}
            value={form.username}
            onChange={handleChange}
            autoCapitalize="none"
            autoCorrect="off"
            className={`w-full px-4 py-3 rounded-md text-sm
                        outline-none transition-colors
                        placeholder-slate500 dark:placeholder-slate500
                        ${errors.username
                          ? "border border-red-400 bg-red-50 dark:bg-red-900/20 text-slate500 dark:text-slate500"
                          : "bg-white300 dark:bg-black100 text-slate500 dark:text-slate500 focus:bg-[#ebebeb] dark:focus:bg-[#3a3a3a]"
                        }`}
          />
          {errors.username && (
            <p className="text-red-500 text-[0.75rem] mt-1 ml-1">
              {errors.username}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="mb-3">
          <input
            type="email"
            name="email"
            placeholder={t("auth.email")}
            value={form.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-md text-sm
                        outline-none transition-colors
                        placeholder-slate500 dark:placeholder-slate500
                        ${errors.email
                          ? "border border-red-400 bg-red-50 dark:bg-red-900/20 text-slate500 dark:text-slate500"
                          : "bg-white300 dark:bg-black100 text-slate500 dark:text-slate500 focus:bg-[#ebebeb] dark:focus:bg-[#3a3a3a]"
                        }`}
          />
          {errors.email && (
            <p className="text-red-500 text-[0.75rem] mt-1 ml-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-3">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={t("auth.password")}
              value={form.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-md text-sm
                          outline-none transition-colors
                          placeholder-slate500 dark:placeholder-slate500
                          ${errors.password
                            ? "border border-red-400 bg-red-50 dark:bg-red-900/20 text-slate500 dark:text-slate500"
                            : "bg-white300 dark:bg-[#2d2d2d] text-slate500 dark:text-slate500 focus:bg-[#ebebeb] dark:focus:bg-[#3a3a3a]"
                          }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2
                         text-slate500 dark:text-slate500
                         bg-transparent border-none cursor-pointer"
              aria-label={t("auth.togglePassword")}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-[0.75rem] mt-1 ml-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* Checkbox */}
        <div className="mb-3">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                setErrors((prev) => ({ ...prev, agreed: "" }));
              }}
              className="w-4 h-4 mt-0.75 shrink-0
                         accent-orange100 cursor-pointer"
            />
            <span className="text-[0.78rem] leading-relaxed
                             text-slate400 dark:text-slate200">
              {t("auth.agreeIntro")}{" "}
              <a href="#terms"
                className="text-orange100 underline hover:opacity-80">
                {t("auth.termsAndConditions")}
              </a>
              {" "}{t("auth.and")}{" "}
              <a href="#privacy"
                className="text-orange100 underline hover:opacity-80">
                {t("auth.privacyPolicies")}
              </a>
            </span>
          </label>
          {errors.agreed && (
            <p className="text-red-500 text-[0.75rem] mt-1 ml-1">
              {errors.agreed}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-orange100 hover:bg-[#e09510]
                     text-slate100 font-semibold text-sm rounded-md
                     transition-colors cursor-pointer border-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t("auth.creatingAccount") : t("auth.signUp")}
        </button>
      </form>

      <OrDivider />
      <SocialButtonRow />

      <p className="text-center mt-4 text-sm
                    text-black200 dark:text-slate200">
        {t("auth.alreadyHaveAccount")}{" "}
        <button
          type="button"
          onClick={navigateToLogin}
          className="text-black200 dark:text-slate200
                     underline font-semibold cursor-pointer
                     bg-transparent border-none
                     hover:text-orange100 transition-colors"
        >
          {t("auth.logIn")}
        </button>
      </p>
    </AuthLayout>
  );
}

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}