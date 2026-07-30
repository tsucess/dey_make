import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FaCircleCheck, FaCrown } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import { RiSearchEyeLine } from "react-icons/ri";
import { TbRosetteDiscountCheck } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api, ApiError } from "../../services/api";

const checks = [
  { title: "Blue Checkmark", desc: "Appears on all your content", icon: TbRosetteDiscountCheck },
  { title: "Search Priority", desc: "Higher discoverability in search", icon: RiSearchEyeLine },
  { title: "Creator Perks", desc: "Access exclusive creator tools", icon: FaCrown },
  { title: "Impersonation Shield", desc: "Protection against fake accounts", icon: ShieldAlert },
];

function daysSince(dateString) {
  if (!dateString) return 0;
  const start = new Date(dateString);
  if (Number.isNaN(start.getTime())) return 0;
  return Math.floor((Date.now() - start.getTime()) / (24 * 60 * 60 * 1000));
}

function VerificationTool({ analytics }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    api.getCreatorVerification()
      .then((response) => {
        if (ignore) return;
        setVerification(response?.data ?? null);
      })
      .catch((wrapped) => {
        if (ignore) return;
        setError(wrapped instanceof ApiError ? wrapped.message : "Failed to load verification status.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const status = verification?.status ?? "unsubmitted";
  const subscribers = Number(analytics?.overview?.audience?.subscribers ?? 0);
  const publishedVideos = Number(analytics?.overview?.videos?.published ?? 0);
  const accountAgeDays = daysSince(user?.createdAt || user?.created_at);

  const requirements = useMemo(() => ([
    { title: "Account at least 30 days old", completed: accountAgeDays >= 30 },
    { title: "Email address verified", completed: Boolean(user?.emailVerifiedAt || user?.email_verified_at) },
    { title: "Phone number verified", completed: Boolean(user?.phoneVerifiedAt || user?.phone_verified_at || user?.phone) },
    { title: "At least 1,000 followers", completed: subscribers >= 1000 },
    { title: "No recent policy violations", completed: true },
    { title: "Complete profile (avatar + bio)", completed: Boolean((user?.avatarUrl || user?.avatar_url) && (user?.bio || user?.description)) },
    { title: "Original content (no reposts)", completed: publishedVideos > 0 },
    { title: "At least 10 published videos", completed: publishedVideos >= 10 },
  ]), [accountAgeDays, publishedVideos, subscribers, user]);

  const completedRequirement = requirements.filter((requirement) => requirement.completed).length;
  const canApply = status === "unsubmitted" || status === "rejected";

  const statusHeadline = status === "approved"
    ? "You're verified. Nice work!"
    : status === "pending"
      ? "Your application is under review."
      : status === "rejected"
        ? "Your last application was rejected. You can re-apply."
        : completedRequirement === requirements.length
          ? "You meet all requirements! Apply now for your verified badge."
          : `${completedRequirement}/${requirements.length} requirements met. Keep going.`;

  const buttonLabel = status === "approved"
    ? "Verified"
    : status === "pending"
      ? "Application Pending"
      : "Apply for Verification";

  function handleApply() {
    if (!canApply) return;
    navigate("/settings");
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="bg-white300 dark:bg-black400 px-4 md:px-8 py-10 md:py-15 rounded-3xl flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded flex items-center justify-center bg-red500/10 shrink-0">
            <ShieldCheck className="w-6 h-6 text-red500" />
          </div>
          <div className="flex flex-col gap-0.5 font-inter">
            <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white">
              Verification
            </h2>
            <p className="text-sm md:text-base text-black dark:text-white">
              {loading ? "Loading verification status…" : statusHeadline}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:gap-6">
          <span className="text-xs">
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

      {error && <div className="text-red100 text-sm font-inter">{error}</div>}

      {/* requirements */}
      <div className="flex flex-col gap-7 font-inter">
        <h3 className="text-lg md:text-xl font-semibold text-black dark:text-white">
          Requirements
        </h3>
        <div className="flex flex-col gap-2 md:gap-5 border border-black/30 dark:border-white/30 rounded-xl px-3 md:px-7.5 py-5">
          {requirements.map(({ title, completed }) => (
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
            checks.map(({title, desc,icon: Icon}) => <div key={title} className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white300 dark:bg-black400">
                <Icon className="w-6 h-6 text-red500" />
                <div className=" flex flex-col gap-2 font-inter">
                    <h5 className="text-sm font-bold text-black dark:text-white">{title}</h5>
                    <span className="text-[10px] text-black dark:text-white">{desc}</span>
                </div>
            </div>)
            }</div>
        <button
          onClick={handleApply}
          disabled={!canApply}
          className="bg-orange100 text-slate100 text-sm px-4 py-3 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}

export default VerificationTool;
