import { useEffect, useMemo, useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { PiCameraPlus } from "react-icons/pi";
import { api, ApiError } from "../../services/api";

const tips = [
  { title: "Post at 7PM", desc: "Peak engagement window for your audience" },
  { title: "Use 5-8 Hashtags", desc: "Optimal range for reach without dilution" },
  { title: "Hook in 2s", desc: "First 2 seconds determine 80% of watch time" },
];

const courseTab = ["All", "Beginner", "Intermediate", "Advanced"];

function humanDifficulty(value) {
  if (!value) return "Beginner";
  const normalized = value.toString().toLowerCase();
  if (normalized.includes("advanced")) return "Advanced";
  if (normalized.includes("intermediate")) return "Intermediate";
  return "Beginner";
}

function formatDurationLabel(course, enrollment) {
  const lessonCount = Number(course?.lessonsCount ?? 0);
  const minutes = Number(course?.estimatedMinutes ?? 0);
  const parts = [];
  if (lessonCount > 0) parts.push(`${lessonCount} lesson${lessonCount === 1 ? "" : "s"}`);
  if (minutes > 0) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    parts.push(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
  }
  if (enrollment && enrollment.totalLessons > 0) {
    parts.push(`${enrollment.completedLessons}/${enrollment.totalLessons} done`);
  }
  return parts.join(" \u00b7 ") || "Course";
}

function AcademyTool() {
  const [activeCourse, setActiveCourse] = useState("All");
  const [courses, setCourses] = useState([]);
  const [enrollmentsById, setEnrollmentsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    Promise.all([
      api.getAcademyCourses().catch(() => null),
      api.getMyAcademyLearning().catch(() => null),
    ])
      .then(([coursesResponse, learningResponse]) => {
        if (ignore) return;
        setCourses(coursesResponse?.data?.courses ?? []);
        const list = learningResponse?.data?.enrollments ?? [];
        const map = {};
        list.forEach((enrollment) => {
          const courseId = enrollment?.course?.id;
          if (courseId != null) map[courseId] = enrollment;
        });
        setEnrollmentsById(map);
      })
      .catch((wrapped) => {
        if (ignore) return;
        setError(wrapped instanceof ApiError ? wrapped.message : "Failed to load academy.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const filteredCourses = useMemo(() => {
    if (activeCourse === "All") return courses;
    return courses.filter((course) => humanDifficulty(course?.difficulty) === activeCourse);
  }, [courses, activeCourse]);

  async function handleEnroll(course) {
    if (!course?.id || enrolling === course.id) return;
    setEnrolling(course.id);
    try {
      const response = await api.enrollInAcademyCourse(course.id);
      const enrollment = response?.data?.enrollment;
      if (enrollment) {
        setEnrollmentsById((prev) => ({ ...prev, [course.id]: enrollment }));
      }
    } catch (wrapped) {
      setError(wrapped instanceof ApiError ? wrapped.message : "Failed to enroll.");
    } finally {
      setEnrolling(null);
    }
  }

  return (
    <section className="flex flex-col gap-7">
      <div className="flex p-5 flex-col gap-6 border border-black300 dark:border-white rounded-3xl">
        <h3 className="text-black300 dark:text-white font-bold text-lg md:text-xl">Quick Tips For You</h3>
        <div className="flex flex-col gap-4">
          {tips.map(({ title, desc }) => (
            <div key={title} className="border border-black/30 dark:border-white/30 rounded-3xl p-4 md:p-5 flex items-center justify-between gap-3 bg-slate150 dark:bg-black400">
              <div className="flex items-center gap-2">
                <div className="w-10 md:w-12 h-10 md:h-12 rounded-sm flex items-center justify-center border border-white/20 bg-black500/5 dark:bg-black500 shrink-0">
                  <PiCameraPlus className="w-5 md:w-6 h-5 md:h-6 text-red100" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-inter font-medium text-sm md:text-base text-black dark:text-white">{title}</p>
                  <span className="text-slate700 text-[10px] font-inter">{desc}</span>
                </div>
              </div>
              <button>
                <IoIosArrowForward className="w-4 md:w-5 h-4 md:h-5 text-black dark:text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4.75 font-inter">
        <h3 className="text-black dark:text-white text-base font-semibold">Courses</h3>
        <div className="overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="flex items-center gap-2 md:gap-3 w-140">
            {courseTab.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCourse(tab)}
                className={`transition-all text-sm py-2 md:py-3 px-5 rounded-xl font-semibold flex items-center gap-3 ${
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

      {error ? <div className="text-red100 text-sm font-inter">{error}</div> : null}

      <div className="flex flex-col gap-6">
        {loading && filteredCourses.length === 0 ? (
          <div className="text-sm text-slate700 font-inter">Loading courses…</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-sm text-slate700 font-inter">No courses available.</div>
        ) : (
          filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              enrollment={enrollmentsById[course.id]}
              onEnroll={() => handleEnroll(course)}
              enrolling={enrolling === course.id}
            />
          ))
        )}
      </div>
    </section>
  );
}

function CourseCard({ course, enrollment, onEnroll, enrolling }) {
  const level = humanDifficulty(course?.difficulty);
  const progress = Number(enrollment?.progressPercent ?? 0);
  const isEnrolled = Boolean(enrollment);

  return (
    <div className="bg-white300 dark:bg-slate250 rounded-4xl p-4 md:p-6 flex flex-col gap-6 md:gap-10">
      <div className="flex flex-col items-end gap-1.25">
        {progress > 0 && (
          <div className="bg-slate350 dark:bg-slate150 h-1 w-full flex">
            <div className="bg-red100 h-full" style={{ width: `${progress}%` }}></div>
          </div>
        )}
        <span className="font-inter text-xs text-black300 dark:text-white">{formatDurationLabel(course, enrollment)}</span>
      </div>
      <div className="flex flex-col gap-2 md:gap-4 font-inter">
        <div className="flex items-center gap-3">
          <div className={`px-2 py-0.5 md:py-1 rounded text-[11px] ${
            level === "Intermediate"
              ? "bg-orange600/10 text-orange600"
              : level === "Beginner"
                ? "bg-green300/20 text-green300"
                : "bg-red600/10 text-red600"
          }`}>{level}</div>
          <span className="text-xs text-black300 dark:text-white">{course?.summary?.slice(0, 40) || "Creator Academy"}</span>
        </div>
        <h5 className="text-sm md:text-base text-black300 dark:text-white font-bold">{course?.title}</h5>
        <div className="flex items-center gap-2">
          <div className="bg-slate350 dark:bg-slate150 h-1 w-full flex">
            <div className="bg-red100 h-full" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-xs text-black300 dark:text-white shrink-0">
            {progress > 0 ? `${progress}%` : "Not started"}
          </span>
        </div>
        {!isEnrolled && (
          <button onClick={onEnroll} disabled={enrolling} className="self-start text-xs font-semibold bg-orange100 text-black px-4 py-2 rounded-md disabled:opacity-60">
            {enrolling ? "Enrolling…" : "Enroll"}
          </button>
        )}
      </div>
    </div>
  );
}

export default AcademyTool;
