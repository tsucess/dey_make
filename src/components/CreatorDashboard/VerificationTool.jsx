import { ShieldAlert, ShieldCheck } from "lucide-react";
import { FaCircleCheck, FaCrown } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import { RiSearchEyeLine } from "react-icons/ri";
import { TbRosetteDiscountCheck } from "react-icons/tb";

const requirements = [
  { title: "Account at least 30 days old", completed: true },
  { title: "Email address verified", completed: true },
  { title: "Phone number verified", completed: true },
  { title: "At least 1,000 followers", completed: true },
  { title: "No recent policy violations", completed: true },
  { title: "Complete profile (avatar + bio)", completed: true },
  { title: "Original content (no reposts)", completed: false },
  { title: "At least 10 published videos", completed: true },
];

const checks = [
  {
    title: "Blue Checkmark",
    desc: "Appear on all your content",
    icon: TbRosetteDiscountCheck,
  },
  {
    title: "Blue Checkmark",
    desc: "Appear on all your content",
    icon: RiSearchEyeLine,
  },
  {
    title: "Blue Checkmark",
    desc: "Appear on all your content",
    icon: FaCrown,
  },
  {
    title: "Blue Checkmark",
    desc: "Appear on all your content",
    icon: ShieldAlert,
  },
];

function VerificationTool() {
  let completedRequirement = requirements.filter(
    (require) => require.completed,
  ).length;
  return (
    <section className="flex flex-col gap-8">
      <div className="bg-white300 dark:bg-black400 px-8 py-15 rounded-3xl flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded flex items-center justify-center bg-red500/10">
            <ShieldCheck className="w-6 h-6 text-red500" />
          </div>
          <div className="flex flex-col gap-0.5 font-inter">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Verification
            </h2>
            <p className="text-base text-black dark:text-white">
              You meet almost all requirements! Apply now for your verified
              badge.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <span>
            {completedRequirement} of {requirements.length} requirements met
          </span>
          <div className="flex items-center gap-2">
            <div className="bg-slate350 dark:bg-slate150 h-1 w-full flex">
              <div
                className={` bg-red100 h-full`}
                style={{
                  width: `${(completedRequirement / requirements.length) * 100}%`,
                }}
              ></div>
            </div>
            <span className="text-xs text-black300 dark:text-white shrink-0">
              {Math.round((completedRequirement / requirements.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* requirements */}
      <div className="flex flex-col gap-7 font-inter">
        <h3 className="text-xl font-semibold text-black dark:text-white">
          Requirements
        </h3>
        <div className="flex flex-col gap-5 border border-black/30 dark:border-white/30 rounded-xl px-7.5 py-5">
          {requirements.map(({ title, completed }, i) => (
            <div
              key={title}
              className="px-2.5 py-3 font-inter flex items-center gap-2.5"
            >
              {completed ? (
                <FaCircleCheck className="w-5 h-5 text-green100" />
              ) : (
                <MdCancel className="w-5 h-5 text-red100" />
              )}
              <span className="text-black font-semibold text-sm dark:text-white">
                {title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* blue check */}
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{
            checks.map(({title, desc,icon: Icon}, i) => <div key={title-i} className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white300 dark:bg-black400">
                <Icon className="w-6 h-6 text-red500" />
                <div className=" flex flex-col gap-2 font-inter">
                    <h5 className="text-sm font-bold text-black dark:text-white">{title}</h5>
                    <span className="text-[10px] text-black dark:text-white">{desc}</span>
                </div>
            </div>)
            }</div>
        <button className="bg-orange100 text-slate100 text-sm px-4 py-3 rounded-lg">
          Apply for Verification
        </button>
      </div>
    </section>
  );
}

export default VerificationTool;
