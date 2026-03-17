import { useState } from "react";
import { HiChevronDown } from "react-icons/hi";
import { useTheme } from "../../context/ThemeContext";

const faqs = [
  {
    q: "When is DeyMake launching?",
    a: "We're launching soon. Access will be rolled out in phases, starting with people on the waitlist.",
  },
  {
    q: "Who can join DeyMake?",
    a: "Anyone can join the waitlist! DeyMake is built for creators of all kinds — video creators, podcasters, writers, and more.",
  },
  {
    q: "How do I get early access?",
    a: "Fill out the waitlist form above and you will be among the first to know when we launch.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const {isDark} = useTheme()

  return (
    <section
      id="faq"
      className="px-6 md:px-12 py-8 md:py-16 md:text-center
                 bg-white100 dark:bg-slate100"
    >
      <h2
        className="font-semibold font-bricolage text-slate100 dark:text-white mb-10"
        style={{ fontSize: "clamp(28px, 4vw, 32px)" }}
      >
        <span className="hidden md:inline">Frequently asked questions</span> <span className="md:hidden">FAQ</span>
      </h2>

      <div className="max-w-2xl mx-auto text-left flex flex-col gap-4">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="bg-white rounded-lg py-4 px-4 md:px-6 dark:bg-black100"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between
                         py-5 bg-transparent border-none cursor-pointer
                         text-left"
            >
              <span className="text-base md:text-lg font-inter font-medium text-slate100
                               dark:text-white">
                {faq.q}
              </span>
              <HiChevronDown
                size={20}
                color={isDark ? '#fff' : '#1a1a1a'}
                style={{
                  flexShrink: 0,
                  marginLeft: "12px",
                  transition: "transform 0.2s",
                  transform:
                    openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {openIndex === i && (
              <p className="text-sm md:text-base text-slate100 font-inter dark:text-white
                            leading-relaxed pb-5 max-w-lg">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}