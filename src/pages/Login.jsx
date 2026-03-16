import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import Logo from "../components/Logo";
import SocialButtonRow from "../components/SocialButton";
import OrDivider from "../components/OrDivider";
import NetworkIllustration from "../components/NetworkIllustration";

export default function Login({ onNavigateToSignUp, onSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSuccess();
  };

  return (
    <AuthLayout>
      <Logo />
      <NetworkIllustration />

      <h2 className="text-lg font-semibold mb-3
                     text-gray-800 dark:text-white">
        Login
      </h2>

      <form onSubmit={handleSubmit} noValidate>

        {/* Email */}
        <div className="mb-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-md text-sm
                        outline-none transition-colors
                        placeholder-gray-400 dark:placeholder-gray-500
                        ${errors.email
                          ? "border border-red-400 bg-red-50 dark:bg-red-900/20 text-gray-700 dark:text-gray-200"
                          : "bg-[#f5f5f5] dark:bg-[#2d2d2d] text-gray-700 dark:text-gray-200 focus:bg-[#ebebeb] dark:focus:bg-[#3a3a3a]"
                        }`}
          />
          {errors.email && (
            <p className="text-red-500 text-[0.75rem] mt-1 ml-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-1">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-md text-sm
                          outline-none transition-colors
                          placeholder-gray-400 dark:placeholder-gray-500
                          ${errors.password
                            ? "border border-red-400 bg-red-50 dark:bg-red-900/20 text-gray-700 dark:text-gray-200"
                            : "bg-[#f5f5f5] dark:bg-[#2d2d2d] text-gray-700 dark:text-gray-200 focus:bg-[#ebebeb] dark:focus:bg-[#3a3a3a]"
                          }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2
                         text-gray-400 dark:text-gray-500
                         bg-transparent border-none cursor-pointer"
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
        <div className="flex justify-end mb-3 mt-1">
          <a href="#forgot"
            className="text-[0.78rem] text-gray-400 dark:text-gray-500
                       hover:underline">
            Forgot Password?
          </a>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-[#f5a623] hover:bg-[#e09510]
                     text-white font-bold text-sm rounded-md
                     transition-colors cursor-pointer border-none"
        >
          Sign In
        </button>
      </form>

      <OrDivider />
      <SocialButtonRow />

      <p className="text-center mt-4 text-[0.82rem]
                    text-gray-500 dark:text-gray-400">
        Are you new here?{" "}
        <button
          type="button"
          onClick={onNavigateToSignUp}
          className="text-gray-800 dark:text-white
                     underline font-medium cursor-pointer
                     bg-transparent border-none
                     hover:text-[#f5a623] transition-colors"
        >
          Sign Up
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