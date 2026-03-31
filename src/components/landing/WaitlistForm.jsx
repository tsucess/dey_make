import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { ApiError, api, firstError } from "../../services/api";
import { motion } from "motion/react";

export default function WaitlistForm() {
  const { t } = useLanguage();
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
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
    setSubmitMessage("");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim())
      newErrors.firstName = t("landing.waitlist.validation.firstNameRequired");
    if (!form.email.trim())
      newErrors.email = t("landing.waitlist.validation.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = t("landing.waitlist.validation.validEmail");
    if (!form.country.trim())
      newErrors.country = t("landing.waitlist.validation.countryRequired");
    if (!form.describes.trim())
      newErrors.describes = t("landing.waitlist.validation.describesRequired");
    if (!form.agreed)
      newErrors.agreed = t("landing.waitlist.validation.agreedRequired");
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    try {
      await api.joinWaitlist(form);
      setSubmitMessage(t("landing.waitlist.success"));
      setForm({
        firstName: "",
        email: "",
        phone: "",
        country: "",
        describes: "",
        loveToSee: "",
        agreed: false,
      });
      setErrors({});
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({
          firstName: error.errors?.firstName?.[0] || "",
          email: error.errors?.email?.[0] || "",
          phone: error.errors?.phone?.[0] || "",
          country: error.errors?.country?.[0] || "",
          describes: error.errors?.describes?.[0] || "",
          loveToSee: error.errors?.loveToSee?.[0] || "",
          agreed: error.errors?.agreed?.[0] || "",
        });
        setSubmitError(firstError(error.errors, error.message));
      } else {
        setSubmitError(t("landing.waitlist.unableToJoin"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const countries = [
    { value: "Nigeria", label: t("landing.waitlist.countries.nigeria") },
    { value: "Ghana", label: t("landing.waitlist.countries.ghana") },
    { value: "Kenya", label: t("landing.waitlist.countries.kenya") },
    { value: "South Africa", label: t("landing.waitlist.countries.southAfrica") },
    { value: "United Kingdom", label: t("landing.waitlist.countries.unitedKingdom") },
    { value: "United States", label: t("landing.waitlist.countries.unitedStates") },
    { value: "Canada", label: t("landing.waitlist.countries.canada") },
    { value: "Other", label: t("landing.waitlist.countries.other") },
  ];

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
        {t("landing.waitlist.title")}
      </h2>
      <p className="text-sm text-slate100 font-inter dark:text-white
                    max-w-sm mx-auto mb-8 leading-relaxed">
        {t("landing.waitlist.description")}
      </p>

      {/* Form card */}
      <div
        className="bg-white dark:bg-slate100 rounded-2xl
                   border-[0.25px] border-gray-200 dark:border-gray-700
                   max-w-3xl mx-auto text-left shadow-waitlist dark:shadow-waitlist-dark md:px-16 py-10"
      >
        <motion.form  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
          onSubmit={handleSubmit}
          noValidate
          className=" p-4 md:p-7 flex flex-col gap-5 "
        >
          {submitMessage && (
            <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
              {submitMessage}
            </p>
          )}
          {submitError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {submitError}
            </p>
          )}

          {/* First Name */}
          <div>
            <label className="text-sm font-semibold text-slate100 font-inter
                               dark:text-white block mb-1.5">
              {t("landing.waitlist.firstNameLabel")}
            </label>
            <motion.input whileFocus={{ scale: 1.02 }}
              type="text"
              name="firstName"
              placeholder={t("landing.waitlist.firstNamePlaceholder")}
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
              {t("landing.waitlist.emailLabel")}
            </label>
            <motion.input whileFocus={{ scale: 1.02 }}
              type="email"
              name="email"
              placeholder={t("landing.waitlist.emailPlaceholder")}
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
              {t("landing.waitlist.phoneLabel")}
            </label>
            <motion.input whileFocus={{ scale: 1.02 }}
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
              {t("landing.waitlist.countryLabel")}
            </label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className={inputClass(errors.country)}
            >
              <option value="">{t("landing.waitlist.countryPlaceholder")}</option>
              {countries.map((country) => (
                <option key={country.value} value={country.value}>{country.label}</option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">{errors.country}</p>
            )}
          </div>

          {/* Describes */}
          <div>
            <label className="text-sm font-semibold text-slate100 font-inter
                               dark:text-white block mb-1.5">
              {t("landing.waitlist.describesLabel")}
            </label>
            <motion.input whileFocus={{ scale: 1.02 }}
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
              {t("landing.waitlist.loveToSeeLabel")}
            </label>
            <motion.textarea whileFocus={{ scale: 1.02 }}
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
                {t("landing.waitlist.agreementIntro")}{" "}
                <a
                  href="#"
                  className="text-slate400 dark:text-slate200 underline
                             hover:text-orange100 transition-colors"
                >
                  {t("landing.waitlist.privacyNotice")}
                </a>
                {t("landing.waitlist.agreementEnding")}
              </span>
            </label>
            {errors.agreed && (
              <p className="text-red-500 text-xs mt-1">{errors.agreed}</p>
            )}
          </div>

          {/* Submit */}
          <motion.button whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 font-inter bg-orange100 hover:bg-[#e09510]
                       text-slate100 font-semibold text-[15px] rounded-xl
                       border-none cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t("landing.waitlist.submitting") : t("landing.waitlist.submit")}
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
}