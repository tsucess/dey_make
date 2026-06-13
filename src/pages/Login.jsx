import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Logo from "../components/Logo";
import OrDivider from "../components/OrDivider";
import NetworkIllustration from "../components/NetworkIllustration";
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

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-black200">
      <path d="M16.365 14.384c-.015-3.392 2.775-5.011 2.903-5.093-1.572-2.3-4.004-2.613-4.888-2.651-2.072-.21-4.048 1.221-5.105 1.221-1.056 0-2.684-1.189-4.408-1.157-2.257.032-4.34 1.31-5.5 3.32-2.35 4.077-.6 10.104 1.687 13.407 1.114 1.61 2.43 3.42 4.144 3.354 1.65-.065 2.278-1.07 4.275-1.07 1.996 0 2.562 1.07 4.276 1.037 1.777-.031 2.91-1.642 4.024-3.255 1.286-1.878 1.815-3.696 1.846-3.79-.04-.015-3.551-1.363-3.566-5.323zm-2.482-7.514c.905-1.096 1.515-2.62 1.348-4.14-1.31.053-2.903.873-3.84 1.97-1.843 2.148-1.56 3.633-1.428 3.737 1.4-.047 2.825-.63 3.92-1.567z" />
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

function QrCodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-black200">
      <path d="M3 3h8v8H3zM5 5v4h4V5zM13 3h8v8h-8zM15 5v4h4V5zM3 13h8v8H3zM5 15v4h4v-4zM13 13h2v2h-2zM15 13h2v2h-2zM17 13h2v2h-2zM19 13h2v2h-2zM13 15h2v2h-2zM17 15h2v2h-2zM15 17h2v2h-2zM19 17h2v2h-2zM13 19h2v2h-2zM17 19h2v2h-2z" />
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

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#de1b1b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
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

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#de1b1b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function ShieldCheckOutlineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#de1b1b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function BigQrCodePlaceholder() {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className="w-40 h-40 text-black200 dark:text-white">
      <path d="M30 20 H20 V30" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M70 20 H80 V30" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 80 H20 V70" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M70 80 H80 V70" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      
      <path d="M35 35 h12 v12 h-12 z M39 39 h4 v4 h-4 z" fillRule="evenodd" />
      <path d="M53 35 h12 v12 h-12 z M57 39 h4 v4 h-4 z" fillRule="evenodd" />
      <path d="M35 53 h12 v12 h-12 z M39 57 h4 v4 h-4 z" fillRule="evenodd" />

      <rect x="35" y="49" width="4" height="2" />
      <rect x="50" y="35" width="2" height="6" />
      <rect x="49" y="49" width="4" height="4" />
      <rect x="55" y="49" width="2" height="6" />
      <rect x="59" y="49" width="6" height="4" />
      <rect x="53" y="55" width="6" height="4" />
      <rect x="61" y="55" width="4" height="10" />
      <rect x="49" y="55" width="2" height="10" />
      <rect x="53" y="61" width="6" height="4" />
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

export default function Login({ onNavigateToSignUp, onSuccess }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // "default", "phone", "email", "password", "qrcode"
  const [authMode, setAuthMode] = useState("default");

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
      await login({
        ...form,
        identifier: form.identifier.trim(),
      });

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

  if (authMode === "phone" || authMode === "email") {
    return (
      <AuthLayout>
        <div className="flex flex-col w-full z-10 relative">
          <div className="flex justify-center w-full mb-6">
            <Logo />
          </div>
          <h2 className="text-[28px] font-bricolage font-bold text-black200 dark:text-white text-center mb-2">Log in</h2>
          <p className="text-slate500 dark:text-slate400 text-sm text-center mb-8">Welcome back! Please enter your details to continue.</p>

          {authMode === "phone" ? (
            <>
              <div className="flex justify-between items-end mb-2">
                 <span className="text-sm text-slate-500 dark:text-slate-300 font-inter">Phone number</span>
                 <button onClick={() => setAuthMode("email")} className="text-sm text-orange100 hover:text-orange200 bg-transparent border-none cursor-pointer p-0">Log in with email or username</button>
              </div>

              <div className="flex w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1c1c1c] mb-4">
                 <div className="flex items-center gap-2 px-3 py-3 border-r border-gray-300 dark:border-gray-700 cursor-pointer">
                    <span className="text-black200 dark:text-white text-sm font-inter">NG +234</span>
                    <span className="text-slate-400 text-xs">▼</span>
                 </div>
                 <input type="text" placeholder="Phone number" className="flex-1 bg-transparent border-none outline-none px-3 text-black200 dark:text-white text-sm font-inter placeholder-gray-400 dark:placeholder-gray-500" />
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-end mb-2">
                 <span className="text-sm text-slate-500 dark:text-slate-300 font-inter">Email or username</span>
                 <button onClick={() => setAuthMode("phone")} className="text-sm text-orange100 hover:text-orange200 bg-transparent border-none cursor-pointer p-0">Log in with phone number</button>
              </div>

              <div className="flex w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1c1c1c] mb-4">
                 <input type="text" placeholder="Email or username" className="w-full bg-transparent border-none outline-none px-4 py-3 text-black200 dark:text-white text-sm font-inter placeholder-gray-400 dark:placeholder-gray-500" />
              </div>
            </>
          )}

          <div className="flex w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1c1c1c] mb-6">
             <input type="text" placeholder="Enter 4-digit code" className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-black200 dark:text-white text-sm font-inter placeholder-gray-400 dark:placeholder-gray-500" />
             <button className="px-4 py-3 border-l border-gray-300 dark:border-gray-700 text-orange100 hover:text-orange200 bg-transparent cursor-pointer font-medium text-sm">Send Code</button>
          </div>

          <OrDivider label="OR" />

          <button onClick={() => setAuthMode("password")} className="w-full flex items-center p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white300 dark:bg-[#1c1c1c] hover:bg-white200 dark:hover:bg-[#2c2c2c] transition-colors cursor-pointer text-black200 dark:text-white mt-4 mb-6">
             <div className="bg-[#e6e6e6] w-9 h-9 rounded-md flex items-center justify-center shrink-0">
               <LockIcon />
             </div>
             <span className="flex-1 text-left pl-4 font-medium text-[15px] font-inter">Login with password</span>
             <ChevronRight className="shrink-0 text-black200 dark:text-white mr-3" />
          </button>

          <button disabled className="w-full py-3 bg-[#a4916a] text-black200 font-inter font-semibold text-sm rounded-md mb-6 disabled:cursor-not-allowed">
             Log in
          </button>

          <button onClick={() => setAuthMode("default")} className="w-full text-center text-sm text-black200 dark:text-white hover:text-slate-500 dark:hover:text-gray-300 bg-transparent border-none cursor-pointer flex items-center justify-center gap-2 mb-10">
             <span className="text-lg leading-none mt-[-2px]">&lsaquo;</span> Go Back
          </button>

          <div className="w-full text-center mt-6 mb-2">
            <span className="text-[15px] text-slate-500 dark:text-slate400 font-inter">
              Don't have an account?{" "}
            </span>
            <button
              type="button"
              onClick={navigateToSignUp}
              className="text-[15px] text-orange100 underline hover:text-orange200 font-medium cursor-pointer bg-transparent border-none transition-colors p-0"
            >
              Create one &gt;
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (authMode === "qrcode") {
    return (
      <AuthLayout>
        <div className="flex flex-col w-full z-10 relative">
          <div className="flex justify-center w-full mb-6">
            <Logo />
          </div>
          <h2 className="text-[28px] font-bricolage font-bold text-black200 dark:text-white text-center mb-2">Log in with QR code</h2>
          <p className="text-slate500 dark:text-slate400 text-[13px] text-center mb-8">Scan the QR code with your mobile device to log in or sign up securely.</p>

          <div className="w-full flex justify-center items-center py-10 mb-6 border border-gray-300 dark:border-gray-700 rounded-lg">
            <BigQrCodePlaceholder />
          </div>

          <div className="w-full flex flex-col gap-4 p-5 rounded-xl bg-[#fff0f0] mb-8">
            <div className="flex items-center gap-4">
               <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">1</span>
               </div>
               <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <CameraIcon />
               </div>
               <span className="text-black font-inter text-[13px] font-medium">Scan with your mobile device's camera</span>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">2</span>
               </div>
               <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <ShieldCheckOutlineIcon />
               </div>
               <span className="text-black font-inter text-[13px] font-medium">Confirm login or sign up</span>
            </div>
          </div>

          <button type="button" onClick={() => setAuthMode("default")} className="w-full text-center text-sm text-black200 dark:text-white hover:text-slate-500 dark:hover:text-gray-300 bg-transparent border-none cursor-pointer flex items-center justify-center gap-2 mb-10">
             <span className="text-lg leading-none mt-[-2px]">&lsaquo;</span> Go Back
          </button>

          <div className="w-full text-center mb-2">
            <span className="text-[15px] text-slate-500 dark:text-slate400 font-inter">
              Don't have an account?{" "}
            </span>
            <button
              type="button"
              onClick={navigateToSignUp}
              className="text-[15px] text-orange100 underline hover:text-orange200 font-medium cursor-pointer bg-transparent border-none transition-colors p-0"
            >
              Create one &gt;
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (authMode === "password") {
    return (
      <AuthLayout>
        <div className="flex flex-col w-full z-10 relative">
          <div className="flex justify-center w-full mb-6">
            <Logo />
          </div>
          <h2 className="text-[28px] font-bricolage font-bold text-black200 dark:text-white text-center mb-2">Log in</h2>
          <p className="text-slate500 dark:text-slate400 text-sm text-center mb-8">Welcome back! Please enter your details to continue.</p>
          
          <form onSubmit={handleSubmit} noValidate className="pb-5">
            {submitError && (
              <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
                {submitError}
              </p>
            )}

            <div className="flex justify-between items-end mb-2">
               <span className="text-sm text-slate-500 dark:text-slate-300 font-inter">Email or username</span>
               <button type="button" onClick={() => setAuthMode("phone")} className="text-sm text-orange100 hover:text-orange200 bg-transparent border-none cursor-pointer p-0 font-medium">Log in with phone number</button>
            </div>

            {/* Identifier */}
            <div className="flex w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1c1c1c] mb-4">
              <input
                type="text"
                name="identifier"
                placeholder="Email or username"
                value={form.identifier}
                onChange={handleChange}
                autoCapitalize="none"
                autoCorrect="off"
                className={`w-full bg-transparent border-none outline-none px-4 py-3 text-black200 dark:text-white text-sm font-inter placeholder-gray-400 dark:placeholder-gray-500
                            ${errors.identifier ? "border border-red-400" : ""}`}
              />
            </div>
            {errors.identifier && (
              <p className="text-red-500 text-[0.75rem] mt-[-10px] mb-3 ml-1">
                {errors.identifier}
              </p>
            )}

            {/* Password */}
            <div className="flex w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1c1c1c] mb-2 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className={`w-full bg-transparent border-none outline-none px-4 py-3 pr-12 text-black200 dark:text-white text-sm font-inter placeholder-gray-400 dark:placeholder-gray-500
                            ${errors.password ? "border border-red-400" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 bg-transparent border-none cursor-pointer p-0"
                aria-label={t("auth.togglePassword")}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-[0.75rem] mt-0 mb-3 ml-1">
                {errors.password}
              </p>
            )}

            {/* Forgot password */}
            <div className="flex justify-start mb-6">
              <button
                type="button"
                onClick={navigateToForgotPassword}
                className="text-[13px] font-inter font-medium text-orange100 hover:text-orange200 bg-transparent border-none cursor-pointer p-0"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-orange100 hover:bg-[#e09510] text-black200 font-inter font-bold text-sm rounded-md transition-colors cursor-pointer border-none disabled:cursor-not-allowed disabled:opacity-60 mb-8"
            >
              Log in
            </button>

            <button type="button" onClick={() => setAuthMode("phone")} className="w-full text-center text-sm text-black200 dark:text-white hover:text-slate-500 dark:hover:text-gray-300 bg-transparent border-none cursor-pointer flex items-center justify-center gap-2 mb-10">
               <span className="text-lg leading-none mt-[-2px]">&lsaquo;</span> Go Back
            </button>
          </form>

          <div className="w-full text-center mb-2">
            <span className="text-[15px] text-slate-500 dark:text-slate400 font-inter">
              Don't have an account?{" "}
            </span>
            <button
              type="button"
              onClick={navigateToSignUp}
              className="text-[15px] text-orange100 underline hover:text-orange200 font-medium cursor-pointer bg-transparent border-none transition-colors p-0"
            >
              Create one &gt;
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
        <h2 className="text-[28px] font-bricolage font-bold text-black200 dark:text-white mb-1">Welcome back</h2>
        <p className="text-slate500 dark:text-slate400 text-sm mb-8">Log in to continue</p>

        {/* Primary Button */}
        <button 
          onClick={() => setAuthMode("phone")}
          className="w-full flex items-center bg-orange100 hover:bg-[#e09510] transition-colors rounded-lg p-1.5 mb-2 cursor-pointer border-none"
        >
          <div className="bg-[#ffd266] w-9 h-9 rounded-md flex items-center justify-center shrink-0">
             <UserIcon />
          </div>
          <span className="flex-1 text-left pl-4 font-medium text-black200 text-[15px] font-inter">
            Continue with phone number / email / username
          </span>
          <ChevronRight className="shrink-0 text-black200 mr-3" />
        </button>

        <OrDivider label="OR CONTINUE WITH" />

        {/* Social Buttons */}
        <div className="w-full flex flex-col gap-3">
          <SocialOptionBtn provider="google" icon={<GoogleIcon />} label="Continue with Google" />
          <SocialOptionBtn provider="facebook" icon={<FacebookIcon />} label="Continue with Facebook" />
          <SocialOptionBtn provider="apple" icon={<AppleIcon />} label="Continue with Apple" />
          <SocialOptionBtn provider="qrcode" icon={<QrCodeIcon />} label="Login with QR code" onClick={() => setAuthMode("qrcode")} />
        </div>

        {/* Terms Disclaimer */}
        <div className="w-full flex items-start gap-4 mt-8 bg-transparent">
           <div className="bg-[#e4cece] dark:bg-[#3d2a2a] w-10 h-10 rounded-md flex items-center justify-center shrink-0">
             <ShieldCheckIcon />
           </div>
           <p className="text-xs text-slate400 leading-relaxed pt-0.5">
             By continuing, you agree to our <a href="#terms" className="text-orange100 hover:text-orange200 underline">Terms of Service</a> and acknowledge that you have read our <a href="#privacy" className="text-orange100 hover:text-orange200 underline">Privacy Policy</a>.
           </p>
        </div>

        {/* Create Account Link */}
        <div className="w-full text-center mt-6 mb-2">
          <span className="text-[15px] text-slate-500 dark:text-slate400 font-inter">
            Don't have an account?{" "}
          </span>
          <button
            type="button"
            onClick={navigateToSignUp}
            className="text-[15px] text-orange100 underline hover:text-orange200 font-medium cursor-pointer bg-transparent border-none transition-colors p-0"
          >
            Create one &gt;
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}