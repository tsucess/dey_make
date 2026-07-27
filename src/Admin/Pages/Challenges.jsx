import { useEffect, useState } from "react";
import Header from "../components/Challenges/Header";
import Stats from "../components/SuspendedAcoount/Stats";
import Menu from "../components/Challenges/Menu";
import ChallengeTable from "../components/Challenges/ChallengeTable";
import ChallengeModal from "../components/Challenges/ChallengeModal";
import { api } from "../../services/api";

const tabs = ["All Challenges", "Active", "Upcoming", "Ended", "Draft"];
const status = ["Active", "Upcoming", "Ended", "Draft"];
const categories = [
  "Lifestyle",
  "Fashion",
  "Beauty",
  "Fitness",
  "Health & Wellness",
  "Food & Cooking",
  "Travel",
  "Education",
  "Technology",
];

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) +
      " (" + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) + ")";
  } catch {
    return "—";
  }
}

function displayChallengeStatus(c) {
  if (c.status === "draft") return "Draft";
  if (c.status === "closed") return "Ended";
  const now = Date.now();
  const startsAt = c.submissionStartsAt ? new Date(c.submissionStartsAt).getTime() : null;
  const endsAt = c.submissionEndsAt ? new Date(c.submissionEndsAt).getTime() : null;
  if (startsAt && now < startsAt) return "Upcoming";
  if (endsAt && now > endsAt) return "Ended";
  return "Active";
}

function normalizeChallenge(c) {
  return {
    id: c.id,
    startedAt: formatDateTime(c.submissionStartsAt || c.publishedAt),
    challengeTitle: c.title || "Untitled",
    challengeId: `ID: CHL-${c.id}`,
    status: displayChallengeStatus(c),
    category: c.category?.name || "—",
    participant: `${c.submissionsCount || 0}`,
    period: c.submissionEndsAt ? formatDateTime(c.submissionEndsAt).split(" (")[0] : "—",
    submission: `${c.submissionsCount || 0}`,
  };
}

function Challenges() {
  const [activeTab, setActiveTab] = useState("All Challenges");
  const [openModal, setOpenModal] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setErrorMessage("");
    api.getAdminChallenges({ q: searchQuery || undefined, perPage: 50 })
      .then((response) => {
        if (cancelled) return;
        const raw = response?.data?.challenges || [];
        setChallenges(raw.map(normalizeChallenge));
      })
      .catch((err) => { if (!cancelled) setErrorMessage(err?.message || "Failed to load challenges"); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [searchQuery]);

  const totalChallenges = challenges.length;
  const stats = [
    { title: "Total Challenges", value: `${totalChallenges}`, sub: "current view", hasArrow: true },
    { title: "Active Challenges", value: `${challenges.filter((c) => c.status === "Active").length}`, sub: "current view", hasArrow: true },
    { title: "Upcoming", value: `${challenges.filter((c) => c.status === "Upcoming").length}`, sub: "current view", hasArrow: true },
    { title: "Ended", value: `${challenges.filter((c) => c.status === "Ended").length}`, sub: "current view", hasArrow: true },
    { title: "Total Submissions", value: `${challenges.reduce((acc, c) => acc + (Number(c.submission) || 0), 0)}`, sub: "current view", hasArrow: true },
  ];

  function handleSearchQueryChange(query) {
    setSearchQuery(query.trim());
  }

  function handleStatusChange(status) {
    setCurrentStatus(status);
  }

  function handleCategoryChange(category) {
    setCategory(category);
  }

  function handleOpenModal(id) {
    setOpenModal(id);
  }

  function handleCloseModal() {
    setOpenModal(null);
  }

  function handleActiveTabChange(tab) {
    setActiveTab(tab);
  }

  const filteredData = challenges.filter((c) => {
    if (activeTab !== "All Challenges" && c.status !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const idStr = String(c.id ?? "");
      if (
        !(c.challengeTitle || "").toLowerCase().includes(q) &&
        !idStr.includes(q)
      ) {
        return false;
      }
    }
    if (currentStatus && c.status !== currentStatus) return false;
    if (category && c.category !== category) return false;
    return true;
  });

  return (
    <div className="space-y-7">
      <Header />
      <Stats stats={stats} />
      <Menu
        activeTab={activeTab}
        handleActiveTabChange={handleActiveTabChange}
        tabs={tabs}
        searchQuery={searchQuery}
        currentStatus={currentStatus}
        category={category}
        categories={categories}
        status={status}
        handleSearchQueryChange={handleSearchQueryChange}
        handleCategoryChange={handleCategoryChange}
        handleStatusChange={handleStatusChange}
      />
      {isLoading && (
        <div className="p-6 text-center text-sm text-white/70">Loading challenges…</div>
      )}
      {!isLoading && errorMessage && (
        <div className="p-6 text-center text-sm text-red100">{errorMessage}</div>
      )}
      {!isLoading && !errorMessage && (
        <ChallengeTable
          filteredData={filteredData}
          modalId={openModal}
          handleOpenModal={handleOpenModal}
          handleCloseModal={handleCloseModal}
        />
      )}
      {openModal && <ChallengeModal handleCloseModal={handleCloseModal} />}
    </div>
  );
}

export default Challenges;
