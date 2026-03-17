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
    `w-full px-3.5 py-3 rounded-lg text-sm outline-none
     transition-colors
     text-slate200 dark:text-slate200
     placeholder-slate200 dark:placeholder-slate200
     bg-white dark:bg-black100
     ${hasError
       ? "border border-red-400 dark:border-red-500"
       : "border border-white200 dark:border-slate300 focus:border-[#f5a623] dark:focus:border-[#f5a623]"
     }`;

  return (
    <section
      id="waitlist"
      className="px-6 md:px-12 py-16 text-left md:text-center
                 bg-white100 dark:bg-slate100"
    >
      <h2
        className="font-semibold font-bricolage text-slate100 dark:text-white mb-3"
        style={{ fontSize: "clamp(28px, 4vw, 32px)" }}
      >
        Be the first in line
      </h2>
      <p className="text-sm text-slate100 font-inter dark:text-white
                    max-w-sm mx-auto mb-8 leading-relaxed">
        Join the DeyMake waitlist. Early creators get invited in batches
        and get a real say in shaping the platform.
      </p>

      {/* Form card */}
      <div
        className="bg-white dark:bg-slate100 rounded-2xl
                   border-[0.25px] border-gray-200 dark:border-gray-700
                   max-w-3xl mx-auto text-left shadow-waitlist dark:shadow-waitlist-dark md:px-16 py-10"
      >
        <form
          onSubmit={handleSubmit}
          noValidate
          className=" p-4 md:p-7 flex flex-col gap-5 "
        >
          {/* First Name */}
          <div>
            <label className="text-sm font-semibold text-slate100 font-inter
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
            <label className="text-sm font-semibold text-slate100 font-inter
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
            <label className="text-sm font-semibold text-slate100 font-inter
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
            <label className="text-sm font-semibold text-slate100 font-inter
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
            <label className="text-sm font-semibold text-slate100 font-inter
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
            <label className="text-sm font-semibold text-slate100 font-inter
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
                className="w-4 h-4 mt-0.5 shrink-0
                           accent-[#f5a623] cursor-pointer dark:bg-black100 border-2 dark:border-slate300"
              />
              <span className="text-xs font-inter text-slate400 dark:text-slate200
                               leading-relaxed">
                I agree to be contacted about the beta and understand my
                data will be handled under the{" "}
                <a
                  href="#"
                  className="text-slate400 dark:text-slate200 underline
                             hover:text-orange100 transition-colors"
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
            className="w-full py-4 font-inter bg-orange100 hover:bg-[#e09510]
                       text-slate100 font-semibold text-[15px] rounded-xl
                       border-none cursor-pointer transition-colors"
          >
            Join the waitlist
          </button>
        </form>
      </div>
    </section>
  );
}