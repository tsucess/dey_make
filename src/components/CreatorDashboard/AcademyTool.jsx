import { div } from "motion/react-client";
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

const courses = [
  {
    category: "Growth",
    level: "Intermediate",
    lesson: "12 lessons · 2h 40m",
    time: 60,
    title: "Grow to 100K Followers Fast",
  },
  {
    category: "Content",
    level: "Beginner",
    lesson: "12 lessons · 2h 40m",
    time: 0,
    title: "Hook Writing Masterclass",
  },
  {
    category: "Revenue",
    level: "Advanced",
    lesson: "12 lessons · 2h 40m",
    time: 60,
    title: "Monetize Your DeyMake Channel",
  },
  {
    category: "Editing",
    level: "Intermediate",
    lesson: "12 lessons · 2h 40m",
    time: 60,
    title: "Phone Cinematography Pro",
  },
];

function AcademyTool() {
  const [activeCourse, setActiveCourse] = useState("All");

  function handleActiveCourseChange(value) {
    setActiveCourse(value);
  }
  return (
    <section className="flex flex-col gap-7">
      <div className="flex p-5 flex-col gap-6 border border-black300 dark:border-white rounded-3xl">
        <h3 className="text-black300 dark:text-white font-bold text-lg md:text-xl">
          Quick Tips For You
        </h3>
        <div className="flex flex-col gap-4">
          {tips.map(({ title, desc }, i) => (
            <div
              key={title}
              className="border border-black/30 dark:border-white/30 rounded-3xl p-4 md:p-5 flex items-center justify-between gap-3 bg-slate150 dark:bg-black400"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-10 md:w-12 h-10 md:h-12 rounded-sm flex items-center justify-center border border-white/20 bg-black500/5 dark:bg-black500 shrink-0 `}
                >
                  <PiCameraPlus className={`w-5 md:w-6 h-5 md:h-6 text-red100`} />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-inter font-medium text-sm md:text-base text-black dark:text-white">
                    {title}
                  </p>
                  <span className="text-slate700 text-[10px] font-inter">
                    {desc}
                  </span>
                </div>
              </div>
              <button>
                <IoIosArrowForward className="w-4 md:w-5 w-4 md:h-5 text-black dark:text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4.75 font-inter">
        <h3 className="text-black dark:text-white text-base font-semibold">
          Courses
        </h3>
        <div className="overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <div className="flex items-center gap-3 w-140">
          {courseTab.map((tab) => (
            <button
              key={tab}
              onClick={() => handleActiveCourseChange(tab)}
              className={`transition-all text-sm py-3 px-5 rounded-xl font-semibold flex items-center gap-3 ${
                activeCourse === tab
                  ? "bg-orange100 text-black hover:bg-orange200"
                  : "text-black dark:text-white hover:bg-slate150 hover:dark:bg-black500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {courses.map((course) => (
          <CourseCard key={course.title} {...course} />
        ))}
      </div>
    </section>
  );
}

function CourseCard({ category, level, lesson, time, title }) {
  return (
    <div className="bg-white300 dark:bg-slate250 rounded-4xl p-6 flex flex-col gap-10">
      <div className="flex flex-col items-end gap-1.25">
        {time > 0 && (
          <div className="bg-slate350 dark:bg-slate150 h-1 w-full flex">
            <div
              className={` bg-red100 h-full`}
              style={{ width: `${time}%` }}
            ></div>
          </div>
        )}
        <span className="font-inter text-xs text-black300 dark:text-white">
          {lesson}
        </span>
      </div>
      <div className="flex flex-col gap-4 font-inter">
        <div className="flex items-center gap-3 ">
          <div
            className={`px-2 py-1 rounded text-[11px] ${
              level === "Intermediate"
                ? "bg-orange600/10 text-orange600"
                : level === "Beginner"
                  ? "bg-green300/20 text-green300"
                  : "bg-red600/10 text-red600"
            }`}
          >
            {level}
          </div>
          <span className="text-xs text-black300 dark:text-white">
            {category}
          </span>
        </div>
        <h5 className="text-base text-black300 dark:text-white font-bold">
          {title}
        </h5>
        <div className="flex items-center gap-2">
          <div className="bg-slate350 dark:bg-slate150 h-1 w-full flex">
            <div
              className={` bg-red100 h-full`}
              style={{ width: `${time}%` }}
            ></div>
          </div>
          <span className="text-xs text-black300 dark:text-white shrink-0">
            {time > 0 && time}
            {time ? "%" : "Not started"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AcademyTool;
