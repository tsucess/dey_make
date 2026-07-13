import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Logo from "../components/Logo";
import OrDivider from "../components/OrDivider";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { ApiError, firstError, api } from "../services/api";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-black200">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRight({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 ${className}`}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#de1b1b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fdb300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function GrayLockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

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

function SocialOptionBtn({ provider, icon, label, onClick }) {
  const [isStarting, setIsStarting] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    setIsStarting(true);
    window.location.assign(api.getOAuthRedirectUrl(provider));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isStarting}
      className="w-full flex items-center p-1.5 rounded-lg border border-gray-700 bg-[#1c1c1c] hover:bg-[#2c2c2c] transition-colors cursor-pointer text-white disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div className="bg-[#e6e6e6] w-9 h-9 rounded-md flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="flex-1 text-left pl-4 font-medium text-[15px] font-inter">
        {isStarting ? "Connecting..." : label}
      </span>
      <ChevronRight className="shrink-0 text-white mr-3" />
    </button>
  );
}

function buildDateOfBirth({ dobMonth, dobDay, dobYear }) {
  if (!dobMonth || !dobDay || !dobYear) return null;
  const month = String(dobMonth).padStart(2, "0");
  const day = String(dobDay).padStart(2, "0");
  return `${dobYear}-${month}-${day}`;
}

function deriveUsernameFromEmail(email) {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9._]/g, "");
  return base.length >= 3 ? base.slice(0, 30) : `${base}${Math.floor(Math.random() * 1000)}`;
}

function deriveUsernameFromPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return `u${digits.slice(-8) || Math.floor(Math.random() * 1_000_000)}`;
}

export default function SignUp({ onNavigateToLogin, onSuccess }) {
  const navigate = useNavigate();
  const { register, sendPhoneCode, registerWithPhone } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
    phone: "",
    fullName: "",
    code: "",
    dobMonth: "",
    dobDay: "",
    dobYear: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countryCode] = useState("+234");

  // "default", "phone", "email"
  const [authMode, setAuthMode] = useState("default");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const validateEmail = () => {
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

  const validatePhone = () => {
    const newErrors = {};
    if (!form.phone.trim()) {
      newErrors.phone = t("auth.validation.identifierRequired");
    }
    if (!form.password) {
      newErrors.password = t("auth.validation.passwordRequired");
    } else if (form.password.length < 8) {
      newErrors.password = t("auth.validation.passwordMin");
    }
    if (!form.code.trim() || form.code.trim().length !== 4) {
      newErrors.code = t("auth.validation.identifierRequired");
    }
    return newErrors;
  };

  const navigateToLogin = onNavigateToLogin ?? (() => navigate("/login"));

  const handleSendCode = async () => {
    if (!form.phone.trim()) {
      setErrors((prev) => ({ ...prev, phone: t("auth.validation.identifierRequired") }));
      return;
    }
    setIsSendingCode(true);
    setSubmitError("");
    try {
      await sendPhoneCode({ phone: form.phone.trim(), countryCode });
      setCodeSent(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors((prev) => ({ ...prev, phone: error.errors?.phone?.[0] || "" }));
        setSubmitError(firstError(error.errors, error.message));
      } else {
        setSubmitError(t("auth.unableToCreateAccount"));
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = authMode === "email" ? validateEmail() : validatePhone();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const dateOfBirth = buildDateOfBirth(form);
    const fullName = form.fullName.trim() || "New User";

    try {
      let result;
      if (authMode === "email") {
        const identifier = form.identifier.trim();
        result = await register({
          email: identifier,
          password: form.password,
          fullName,
          username: deriveUsernameFromEmail(identifier),
          dateOfBirth,
        });
      } else {
        result = await registerWithPhone({
          phone: form.phone.trim(),
          countryCode,
          code: form.code.trim(),
          password: form.password,
          fullName,
          username: deriveUsernameFromPhone(form.phone),
          dateOfBirth,
        });
      }

      if (result?.verification?.required) {
        navigate("/verify-email", { replace: true });
        return;
      }

      onSuccess?.();
      navigate("/home", { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({
          identifier: error.errors?.email?.[0] || error.errors?.username?.[0] || "",
          password: error.errors?.password?.[0] || "",
          phone: error.errors?.phone?.[0] || "",
          code: error.errors?.code?.[0] || "",
        });
        setSubmitError(firstError(error.errors, error.message));
      } else {
        setSubmitError(t("auth.unableToCreateAccount"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authMode === "phone" || authMode === "email") {
    return (
      <AuthLayout>
        <div className="flex flex-col w-full z-10 relative">
          <div className="flex justify-center w-full mb-6">
            <Logo />
          </div>
          <h2 className="text-[28px] font-bricolage font-bold text-black200 dark:text-white text-center mb-1">Sign up for DeyMake</h2>
          <p className="text-slate500 dark:text-slate400 text-sm text-center mb-8">Create your personal account to get started.</p>

          <form onSubmit={handleSubmit} noValidate className="pb-5">
            {submitError && (
              <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
                {submitError}
              </p>
            )}

            {/* Full name */}
            <div className="mb-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full name"
                value={form.fullName}
                onChange={handleChange}
                className="w-full bg-white dark:bg-[#1c1c1c] border border-gray-300 dark:border-gray-700 rounded-md outline-none px-4 py-3 text-black200 dark:text-white text-sm font-inter placeholder-gray-400 dark:placeholder-gray-600"
              />
            </div>

            {/* Date of Birth Selection */}
            <div className="mb-2">
              <span className="text-[15px] text-slate-500 dark:text-slate-300 font-inter mb-2 block">Enter your date of birth</span>
              <div className="flex gap-4">
                 <div className="flex-1 relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1c1c1c] cursor-pointer">
                    <div className="absolute left-3 pointer-events-none">
                       <CalendarIcon />
                    </div>
                    <select name="dobMonth" value={form.dobMonth} onChange={handleChange} className="w-full bg-transparent outline-none appearance-none pl-9 pr-8 py-3 text-slate-500 text-sm font-inter cursor-pointer">
                      <option value="" disabled>Month</option>
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                    <span className="absolute right-3 text-slate-500 text-xs pointer-events-none">▼</span>
                 </div>
                 <div className="flex-[0.8] relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1c1c1c] cursor-pointer">
                    <div className="absolute left-3 pointer-events-none">
                       <CalendarIcon />
                    </div>
                    <select name="dobDay" value={form.dobDay} onChange={handleChange} className="w-full bg-transparent outline-none appearance-none pl-9 pr-8 py-3 text-slate-500 text-sm font-inter cursor-pointer">
                      <option value="" disabled>Day</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 text-slate-500 text-xs pointer-events-none">▼</span>
                 </div>
                 <div className="flex-1 relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1c1c1c] cursor-pointer">
                    <div className="absolute left-3 pointer-events-none">
                       <CalendarIcon />
                    </div>
                    <select name="dobYear" value={form.dobYear} onChange={handleChange} className="w-full bg-transparent outline-none appearance-none pl-9 pr-8 py-3 text-slate-500 text-sm font-inter cursor-pointer">
                      <option value="" disabled>Year</option>
                      {Array.from({ length: 100 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                    <span className="absolute right-3 text-slate-500 text-xs pointer-events-none">▼</span>
                 </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-8 mt-4 text-slate-500">
               <GrayLockIcon />
               <span className="text-sm font-inter">Your birthday won't be shown publicly.</span>
            </div>

            {authMode === "phone" ? (
              <>
                <div className="flex justify-between items-end mb-2">
                   <span className="text-[13px] text-slate-500 dark:text-slate-300 font-inter font-medium">Phone number</span>
                   <button type="button" onClick={() => setAuthMode("email")} className="text-[13px] text-orange100 hover:text-orange200 bg-transparent border-none cursor-pointer p-0 font-medium">Sign up with email</button>
                </div>

                <div className="flex w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1c1c1c] mb-4">
                   <div className="flex items-center gap-2 px-3 py-3 border-r border-gray-300 dark:border-gray-700 cursor-pointer">
                      <span className="text-black200 dark:text-white text-sm font-inter">NG {countryCode}</span>
                      <span className="text-slate-400 text-xs">▼</span>
                   </div>
                   <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Phone number"
                      className={`flex-1 bg-transparent border-none outline-none px-3 text-black200 dark:text-white text-sm font-inter placeholder-gray-400 dark:placeholder-gray-600
                                  ${errors.phone ? "border border-red-400" : ""}`} />
                </div>
                {errors.phone && <p className="text-red-500 text-[0.75rem] mt-[-10px] mb-3 ml-1">{errors.phone}</p>}

                <div className="flex w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1c1c1c] mb-4 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full bg-transparent border-none outline-none px-4 py-3 pr-12 text-black200 dark:text-white text-sm font-inter placeholder-gray-400 dark:placeholder-gray-600
                                ${errors.password ? "border border-red-400" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 bg-transparent border-none cursor-pointer p-0"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-[0.75rem] mt-[-10px] mb-3 ml-1">{errors.password}</p>}
              </>
            ) : (
              <>
                <div className="flex justify-between items-end mb-2">
                   <span className="text-[13px] text-slate-500 dark:text-slate-300 font-inter font-medium">Email or username</span>
                   <button type="button" onClick={() => setAuthMode("phone")} className="text-[13px] text-orange100 hover:text-orange200 bg-transparent border-none cursor-pointer p-0 font-medium">Log in with phone number</button>
                </div>

                <div className="flex w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1c1c1c] mb-4">
                  <input
                    type="text"
                    name="identifier"
                    placeholder="Email or username"
                    value={form.identifier}
                    onChange={handleChange}
                    autoCapitalize="none"
                    autoCorrect="off"
                    className={`w-full bg-transparent border-none outline-none px-4 py-3 text-black200 dark:text-white text-sm font-inter placeholder-gray-400 dark:placeholder-gray-600
                                ${errors.identifier ? "border border-red-400" : ""}`}
                  />
                </div>
                {errors.identifier && <p className="text-red-500 text-[0.75rem] mt-[-10px] mb-3 ml-1">{errors.identifier}</p>}

                <div className="flex w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1c1c1c] mb-4 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full bg-transparent border-none outline-none px-4 py-3 pr-12 text-black200 dark:text-white text-sm font-inter placeholder-gray-400 dark:placeholder-gray-600
                                ${errors.password ? "border border-red-400" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 bg-transparent border-none cursor-pointer p-0"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-[0.75rem] mt-[-10px] mb-3 ml-1">{errors.password}</p>}
              </>
            )}

            {authMode === "phone" && (
              <>
                <div className={`flex w-full border rounded-md bg-white dark:bg-[#1c1c1c] mb-2 ${errors.code ? "border-red-400" : "border-gray-300 dark:border-gray-700"}`}>
                   <input
                     type="text"
                     name="code"
                     inputMode="numeric"
                     maxLength={4}
                     value={form.code}
                     onChange={handleChange}
                     placeholder="Enter 4-digit code"
                     className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-black200 dark:text-white text-sm font-inter placeholder-gray-400 dark:placeholder-gray-600"
                   />
                   <button
                     type="button"
                     onClick={handleSendCode}
                     disabled={isSendingCode}
                     className="px-4 py-3 border-l border-gray-300 dark:border-gray-700 text-orange100 hover:text-orange200 bg-transparent cursor-pointer font-medium text-sm disabled:opacity-60"
                   >
                     {isSendingCode ? "Sending..." : codeSent ? "Resend Code" : "Send Code"}
                   </button>
                </div>
                {errors.code && <p className="text-red-500 text-[0.75rem] mb-3 ml-1">{errors.code}</p>}
                {codeSent && !errors.code && (
                  <p className="text-slate-500 text-[0.75rem] mb-3 ml-1">A 4-digit code has been sent to your phone.</p>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#a4916a] text-black200 font-inter font-bold text-[15px] rounded-md transition-colors cursor-pointer border-none disabled:cursor-not-allowed mb-8 mt-4"
            >
              {isSubmitting ? "Creating account..." : "Sign up"}
            </button>

            <button type="button" onClick={() => setAuthMode("default")} className="w-full text-center text-[15px] font-medium text-black200 dark:text-white hover:text-slate-500 dark:hover:text-gray-300 bg-transparent border-none cursor-pointer flex items-center justify-center gap-2 mb-10">
               <span className="text-lg leading-none mt-[-2px]">&lsaquo;</span> Go Back
            </button>
          </form>

          <div className="w-full text-center mb-2">
            <span className="text-[15px] text-slate-500 dark:text-slate300 font-inter">
              Already have an account?{" "}
            </span>
            <button
              type="button"
              onClick={navigateToLogin}
              className="text-[15px] text-orange100 underline hover:text-orange200 font-medium cursor-pointer bg-transparent border-none transition-colors p-0"
            >
              Login &gt;
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // default mode
  return (
    <AuthLayout>
      <div className="flex flex-col items-center w-full z-10 relative">
        <Logo className="mb-2" />
        <h2 className="text-[28px] font-bricolage font-bold text-black200 dark:text-white mb-2">Sign up for DeyMake</h2>
        <p className="text-slate500 dark:text-slate300 text-sm mb-10 text-center">Create a profile, follow other creators, create your own videos and more.</p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-4">
          <button 
            onClick={() => setAuthMode("phone")}
            className="w-full flex items-center p-2 rounded-lg border border-gray-700 bg-[#1c1c1c] hover:bg-[#2c2c2c] transition-colors cursor-pointer text-white"
          >
            <div className="bg-[#e6e6e6] w-10 h-10 rounded-md flex items-center justify-center shrink-0">
               <UserIcon />
            </div>
            <span className="flex-1 text-left pl-4 font-medium text-[15px] font-inter">
              Use phone number or email address
            </span>
            <ChevronRight className="shrink-0 text-white mr-3" />
          </button>

          <SocialOptionBtn provider="google" icon={<GoogleIcon />} label="Continue with Google" />
          <SocialOptionBtn provider="facebook" icon={<FacebookIcon />} label="Continue with Facebook" />
        </div>

        {/* Terms Disclaimer */}
        <div className="w-full flex items-start gap-4 mt-10 bg-transparent">
           <div className="bg-[#e4cece] dark:bg-[#3d2a2a] w-10 h-10 rounded-md flex items-center justify-center shrink-0">
             <ShieldCheckIcon />
           </div>
           <p className="text-[13px] text-slate300 font-inter leading-relaxed pt-0.5">
             By continuing, you agree to our <a href="#terms" className="text-orange100 hover:text-orange200 underline decoration-1">Terms of Service</a> and acknowledge that you have read our <a href="#privacy" className="text-orange100 hover:text-orange200 underline decoration-1">Privacy Policy</a>.
           </p>
        </div>

        {/* Login Link */}
        <div className="w-full text-center mt-16 mb-2">
          <span className="text-[15px] text-slate-500 dark:text-slate300 font-inter">
            Already have an account?{" "}
          </span>
          <button
            type="button"
            onClick={navigateToLogin}
            className="text-[15px] text-orange100 underline hover:text-orange200 font-medium cursor-pointer bg-transparent border-none transition-colors p-0"
          >
            Login &gt;
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}