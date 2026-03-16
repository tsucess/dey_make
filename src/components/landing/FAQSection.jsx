import { useState } from "react";
import { HiChevronDown } from "react-icons/hi";

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

  return (
    <section
      id="faq"
      className="px-6 md:px-12 py-16 text-center
                 bg-white100 dark:bg-[#121212]"
    >
      <h2
        className="font-extrabold text-gray-900 dark:text-white mb-10"
        style={{ fontSize: "clamp(22px, 4vw, 32px)" }}
      >
        Frequently asked questions
      </h2>

      <div className="max-w-[580px] mx-auto text-left flex flex-col">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border-b border-gray-200 dark:border-gray-700"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between
                         py-5 bg-transparent border-none cursor-pointer
                         text-left"
            >
              <span className="text-[15px] font-semibold text-gray-900
                               dark:text-white">
                {faq.q}
              </span>
              <HiChevronDown
                size={20}
                color="#aaa"
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
              <p className="text-sm text-gray-500 dark:text-gray-400
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