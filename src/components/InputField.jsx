import { useState } from "react";

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#aaa" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#aaa" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function InputField({
  type = "text",
  placeholder,
  value,
  onChange,
  name,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative w-full mb-4">
      <input
        type={inputType}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-5 py-[18px] rounded-md text-[0.95rem]
                   bg-[#f5f5f5] text-gray-700 placeholder-gray-400
                   outline-none focus:bg-[#ebebeb]
                   transition-colors duration-200"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          className="absolute right-4 top-1/2 -translate-y-1/2
                     flex items-center bg-transparent
                     border-none cursor-pointer"
          aria-label="Toggle password"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}
    </div>
  );
}