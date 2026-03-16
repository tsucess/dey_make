import { useState } from "react";

export default function WaitlistForm() {
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    phone: "",
    country: "",
    describes: "",
    loveToSee: "",
    agreed: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim())
      newErrors.firstName = "First name is required.";
    if (!form.email.trim())
      newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Please enter a valid email.";
    if (!form.country.trim())
      newErrors.country = "Country is required.";
    if (!form.describes.trim())
      newErrors.describes = "Please tell us what describes you.";
    if (!form.agreed)
      newErrors.agreed = "You must agree to be contacted.";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    }
  };

  const inputClass = (hasError) =>
    `w-full px-3.5 py-2.5 rounded-lg text-sm outline-none
     transition-colors
     text-gray-900 dark:text-gray-200
     placeholder-gray-300 dark:placeholder-gray-600
     bg-white dark:bg-[#2d2d2d]
     ${hasError
       ? "border border-red-400 dark:border-red-500"
       : "border border-gray-200 dark:border-gray-700 focus:border-[#f5a623] dark:focus:border-[#f5a623]"
     }`;

  return (
    <section
      id="waitlist"
      className="px-6 md:px-12 py-16 text-center
                 bg-[#f5f5f0] dark:bg-[#121212]"
    >
      <h2
        className="font-extrabold text-gray-900 dark:text-white mb-3"
        style={{ fontSize: "clamp(22px, 4vw, 32px)" }}
      >
        Be the first in line
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400
                    max-w-sm mx-auto mb-8 leading-relaxed">
        Join the DeyMake waitlist. Early creators get invited in batches
        and get a real say in shaping the platform.
      </p>

      {/* Form card */}
      <div
        className="bg-white dark:bg-[#1e1e1e] rounded-2xl
                   border border-gray-200 dark:border-gray-700
                   max-w-lg mx-auto text-left"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      >
        <form
          onSubmit={handleSubmit}
          noValidate
          className="p-7 flex flex-col gap-5"
        >
          {/* First Name */}
          <div>
            <label className="text-sm font-semibold text-gray-900
                               dark:text-white block mb-1.5">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="First name + Last name"
              value={form.firstName}
              onChange={handleChange}
              className={inputClass(errors.firstName)}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-900
                               dark:text-white block mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="joedoe@email.com"
              value={form.email}
              onChange={handleChange}
              className={inputClass(errors.email)}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-semibold text-gray-900
                               dark:text-white block mb-1.5">
              Phone Number (optional)
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={inputClass(false)}
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-sm font-semibold text-gray-900
                               dark:text-white block mb-1.5">
              Country of Residence
            </label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className={inputClass(errors.country)}
            >
              <option value="">Select country</option>
              <option>Nigeria</option>
              <option>Ghana</option>
              <option>Kenya</option>
              <option>South Africa</option>
              <option>United Kingdom</option>
              <option>United States</option>
              <option>Canada</option>
              <option>Other</option>
            </select>
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">{errors.country}</p>
            )}
          </div>

          {/* Describes */}
          <div>
            <label className="text-sm font-semibold text-gray-900
                               dark:text-white block mb-1.5">
              What best describes what you do?
            </label>
            <input
              type="text"
              name="describes"
              value={form.describes}
              onChange={handleChange}
              className={inputClass(errors.describes)}
            />
            {errors.describes && (
              <p className="text-red-500 text-xs mt-1">{errors.describes}</p>
            )}
          </div>

          {/* Love to see */}
          <div>
            <label className="text-sm font-semibold text-gray-900
                               dark:text-white block mb-1.5">
              What would you love to see in DeyMake
            </label>
            <textarea
              name="loveToSee"
              value={form.loveToSee}
              onChange={handleChange}
              rows={4}
              className={inputClass(false) + " resize-none"}
            />
          </div>

          {/* Checkbox */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="agreed"
                checked={form.agreed}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 flex-shrink-0
                           accent-[#f5a623] cursor-pointer"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400
                               leading-relaxed">
                I agree to be contacted about the beta and understand my
                data will be handled under the{" "}
                <a
                  href="#"
                  className="text-gray-900 dark:text-white underline
                             hover:text-[#f5a623] transition-colors"
                >
                  Privacy Notice
                </a>.
              </span>
            </label>
            {errors.agreed && (
              <p className="text-red-500 text-xs mt-1">{errors.agreed}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 bg-[#f5a623] hover:bg-[#e09510]
                       text-white font-bold text-[15px] rounded-xl
                       border-none cursor-pointer transition-colors"
          >
            Join the waitlist
          </button>
        </form>
      </div>
    </section>
  );
}