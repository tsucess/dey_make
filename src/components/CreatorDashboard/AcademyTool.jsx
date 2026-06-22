import { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { PiCameraPlus } from "react-icons/pi";

const tips = [
  { title: "Post at 7PM", desc: "Peak engagement window for your audience" },
  {
    title: "Use 5-8 Hashtags",
    desc: "Optimal range for reach without dilution",
  },
  { title: "Hook in 2s", desc: "First 2 seconds determine 80% of watch time" },
];

const courseTab = ["All", "Growth", "Content", "Revenue", "Editing"];

function AcademyTool() {
  const [activeCourse, setActiveCourse] = useState("All");

  function handleActiveCourseChange(value) {
    setActiveCourse(value);
  }
  return (
    <section className="flex flex-col gap-7">
      <div className="flex p-5 flex-col gap-6 border border-black300 dark:border-white rounded-3xl">
        <h3 className="text-black300 dark:text-white font-bold text-xl">
          Quick Tips For You
        </h3>
        <div className="flex flex-col gap-4">
          {tips.map(({ title, desc }, i) => (
            <div
              key={title}
              className="border border-black/30 dark:border-white/30 rounded-3xl p-5 flex items-center justify-between gap-3 bg-slate150 dark:bg-black400"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-sm flex items-center justify-center border border-white/20 bg-black500/5 dark:bg-black500  `}
                >
                  <PiCameraPlus className={`w-6 h-6 text-red100`} />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-inter font-medium text-base text-black dark:text-white">
                    {title}
                  </p>
                  <span className="text-slate700 text-[10px] font-inter">
                    {desc}
                  </span>
                </div>
              </div>
              <button>
                <IoIosArrowForward className="w-5 h-5 text-black dark:text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4.75 font-inter">
        <h3 className="text-black dark:text-white text-base font-semibold">
          Courses
        </h3>
        <div className="flex items-center gap-3 ">
          {courseTab.map((tab) => (
            <button
              key={tab}
              onClick={() => handleActiveCourseChange(tab)}
              className={`transition-all text-sm py-3 px-5 rounded-xl font-semibold flex items-center gap-3 ${
                activeCourse === tab
                  ? "bg-orange100 text-black hover:bg-orange200"
                  : "text-black dark:text-white hover:bg-slate150 hover:dark:bg-black500"
              }`}
            >{tab}</button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AcademyTool;
