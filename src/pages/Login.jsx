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

export default function Login({ onNavigateToSignUp, onSuccess }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
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
    if (!form.identifier.trim()) {
      newErrors.identifier = t("auth.validation.identifierRequired");
    }
    if (!form.password) {
      newErrors.password = t("auth.validation.passwordRequired");
    } else if (form.password.length < 8) {
      newErrors.password = t("auth.validation.passwordMin");
    }
    return newErrors;
  };

  const navigateToSignUp = onNavigateToSignUp ?? (() => navigate("/signup"));
  const navigateToForgotPassword = () => navigate("/forgot-password");

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
      const result = await login({
        ...form,
        identifier: form.identifier.trim(),
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
          identifier: error.errors?.identifier?.[0] || "",
          password: error.errors?.password?.[0] || "",
        });
        setSubmitError(firstError(error.errors, error.message));
      } else {
        setSubmitError(t("auth.unableToSignIn"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Logo />
      <NetworkIllustration />

      {/* <h2 className="text-lg font-semibold mb-3
                     text-gray-800 dark:text-white">
        Login
      </h2> */}

      <form onSubmit={handleSubmit} noValidate className="pt-8 pb-5">
        {submitError && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
            {submitError}
          </p>
        )}

        {/* Identifier */}
        <div className="mb-3">
          <input
            type="text"
            name="identifier"
            placeholder={t("auth.identifier")}
            value={form.identifier}
            onChange={handleChange}
            autoCapitalize="none"
            autoCorrect="off"
            className={`w-full px-4 py-3 rounded-md text-sm
                        outline-none transition-colors
                        placeholder-slate500 dark:placeholder-slate500 font-inter
                        ${errors.identifier
                          ? "border border-red-400 bg-red-50 dark:bg-red-900/20 text-slate500 dark:text-slate500"
                          : "bg-white300 dark:bg-black100 text-slate500 dark:text-slate500 focus:bg-[#ebebeb] dark:focus:bg-[#3a3a3a]"
                        }`}
          />
          {errors.identifier && (
            <p className="text-red-500 text-[0.75rem] mt-1 ml-1">
              {errors.identifier}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-1">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={t("auth.password")}
              value={form.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-md text-sm
                          outline-none transition-colors
                          placeholder-gray-400 dark:placeholder-slate500 font-inter
                          ${errors.password
                            ? "border border-red-400 bg-red-50 dark:bg-red-900/20 text-slate500 dark:text-slate500"
                            : "bg-white300 dark:bg-black100 text-slate500 dark:text-slate500 focus:bg-[#ebebeb] dark:focus:bg-[#3a3a3a]"
                          }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2
                         text-gray-400 dark:text-slate500
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

        {/* Forgot password */}
        <div className="flex justify-end mb-4 mt-3">
          <button
            type="button"
            onClick={navigateToForgotPassword}
            className="text-[0.78rem] font-inter text-slate400 dark:text-slate400
                       underline bg-transparent border-none cursor-pointer"
          >
            {t("auth.forgotPassword")}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-orange100 hover:bg-[#e09510]
                     text-slate100 font-inter  font-semibold text-sm rounded-md
                     transition-colors cursor-pointer border-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t("auth.signingIn") : t("auth.signIn")}
        </button>
      </form>

      <OrDivider />
      <SocialButtonRow />

      <p className="text-center mt-4 text-[0.82rem]
                    text-black200 font-inter font-medium dark:text-slate200">
        {t("auth.areYouNewHere")}{" "}
        <button
          type="button"
          onClick={navigateToSignUp}
          className="text-black200 dark:text-slate200
                     underline font-semibold cursor-pointer
                     bg-transparent border-none
                     hover:text-orange100 transition-colors"
        >
          {t("auth.signUp")}
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