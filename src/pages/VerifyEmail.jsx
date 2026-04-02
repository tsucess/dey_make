import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Logo from "../components/Logo";
import NetworkIllustration from "../components/NetworkIllustration";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { ApiError, firstError } from "../services/api";

const CODE_LENGTH = 4;

function sanitizeCode(value) {
  return `${value}`.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH);
}

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { pendingVerification, verifyEmailCode, resendVerificationCode, clearPendingVerification } = useAuth();
  const { t } = useLanguage();
  const [digits, setDigits] = useState(() => Array(CODE_LENGTH).fill(""));
  const [submitError, setSubmitError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const code = digits.join("");

  const updateDigits = (nextDigits) => {
    setDigits(nextDigits);
    setSubmitError("");
    setInfoMessage("");
  };

  const handleChange = (index, value) => {
    const sanitizedValue = sanitizeCode(value);
    const nextDigits = [...digits];

    if (!sanitizedValue) {
      nextDigits[index] = "";
      updateDigits(nextDigits);
      return;
    }

    sanitizedValue.split("").forEach((digit, offset) => {
      if (index + offset < CODE_LENGTH) {
        nextDigits[index + offset] = digit;
      }
    });

    updateDigits(nextDigits);

    const nextIndex = Math.min(index + sanitizedValue.length, CODE_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
    inputRefs.current[nextIndex]?.select?.();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const clipboardText = typeof event.clipboardData?.getData === "function"
      ? event.clipboardData.getData("text")
      : "";
    const pastedCode = sanitizeCode(clipboardText);

    if (!pastedCode) return;

    const nextDigits = Array(CODE_LENGTH).fill("");

    pastedCode.split("").forEach((digit, index) => {
      nextDigits[index] = digit;
    });

    updateDigits(nextDigits);
    const focusIndex = Math.min(pastedCode.length, CODE_LENGTH) - 1;
    inputRefs.current[Math.max(focusIndex, 0)]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (code.length !== CODE_LENGTH) {
      setSubmitError(t("auth.validation.verificationCodeLength"));
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setInfoMessage("");

    try {
      await verifyEmailCode({ code });
      navigate("/home", { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(firstError(error.errors, error.message));
      } else {
        setSubmitError(t("auth.unableToVerifyEmail"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setSubmitError("");
    setInfoMessage("");

    try {
      await resendVerificationCode();
      setDigits(Array(CODE_LENGTH).fill(""));
      setInfoMessage(t("auth.verificationCodeResent"));
      inputRefs.current[0]?.focus();
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(firstError(error.errors, error.message));
      } else {
        setSubmitError(t("auth.unableToResendCode"));
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    clearPendingVerification();
    navigate("/login", { replace: true });
  };

  return (
    <AuthLayout>
      <Logo />
      <NetworkIllustration />

      <div className="pt-8">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-orange100">
          {t("auth.verifyEmailEyebrow")}
        </p>
        <h1 className="text-3xl font-semibold text-black200 md:text-[2.5rem] dark:text-white">
          {t("auth.verifyEmailTitle")}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate400 dark:text-slate200">
          {t("auth.verifyEmailDescription", {
            email: pendingVerification?.email || t("auth.email"),
            minutes: pendingVerification?.expiresInMinutes ?? 10,
          })}
        </p>

        <form onSubmit={handleSubmit} noValidate className="pt-8">
          {submitError ? (
            <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
              {submitError}
            </p>
          ) : null}
          {infoMessage ? (
            <p className="mb-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
              {infoMessage}
            </p>
          ) : null}

          <fieldset>
            <legend className="mb-4 text-sm font-medium text-black200 dark:text-white">
              {t("auth.verificationCodeLabel")}
            </legend>
            <div className="flex items-center gap-3">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  pattern="[0-9]*"
                  maxLength={CODE_LENGTH}
                  value={digit}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onFocus={(event) => event.target.select()}
                  onPaste={handlePaste}
                  aria-label={t("auth.verificationDigitLabel", { index: index + 1 })}
                  className="h-15 w-15 rounded-2xl border border-slate600 bg-white300 text-center text-2xl font-semibold text-black200 outline-none transition focus:border-orange100 focus:bg-white dark:border-[#4a4a4a] dark:bg-black100 dark:text-white dark:focus:bg-[#2f2f2f]"
                />
              ))}
            </div>
          </fieldset>

          <p className="mt-4 text-sm text-slate400 dark:text-slate200">
            {t("auth.verificationHint")}
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full rounded-md bg-orange100 py-3 text-sm font-semibold text-slate100 transition-colors hover:bg-[#e09510] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t("auth.verifyingCode") : t("auth.verifyCode")}
          </button>
        </form>

        <div className="mt-5 flex flex-col gap-3 text-center text-sm md:flex-row md:items-center md:justify-between md:text-left">
          <p className="text-slate400 dark:text-slate200">
            {t("auth.didNotReceiveCode")} {" "}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="bg-transparent font-semibold text-orange100 underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResending ? t("auth.resendingCode") : t("auth.resendCode")}
            </button>
          </p>

          <button
            type="button"
            onClick={handleBackToLogin}
            className="bg-transparent text-sm font-medium text-black200 underline transition-colors hover:text-orange100 dark:text-slate200"
          >
            {t("auth.backToLogin")}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}