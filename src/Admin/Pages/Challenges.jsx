import { useState } from "react";
import Header from "../components/Challenges/Header";
import Stats from "../components/SuspendedAcoount/Stats";
import Menu from "../components/Challenges/Menu";
import ChallengeTable from "../components/Challenges/ChallengeTable";
import ChallengeModal from "../components/Challenges/ChallengeModal";

const stats = [
  {
    title: "Total Challenges",
    value: "128",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Active Challenges",
    value: "32",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Total Participants",
    value: "245.6K",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Total Submissions",
    value: "512.3K",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Total Rewards",
    value: "24.8M",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
];

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

const challengesData = Array(10)
  .fill({
    id: "1234567890",
    startedAt: "May 26, 2024 (08:30 PM)",
    challengeTitle: "#DeyMakeDanceChallenge",
    challengeId: "ID: CHL-2024-0001",
  })
  .map((v, i) => ({
    ...v,
    id: v.id.slice(0, -1) + i,
    status: status[i % status.length],
    category: categories[i % categories.length],
    participant: "45.2K",
    period: "May 26, 2024",
    submission: "98.3K",
  }));

function Challenges() {
  const [activeTab, setActiveTab] = useState("All Challenges");
  const [openModal, setOpenModal] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredData = challengesData.filter((user) => {
    // Tab filter
    // if (activeTab === "Pending Review" && user.status !== "Pending Review")
    //   return false;
    // if (activeTab === "Approved" && user.status !== "Approved")
    //   return false;
    // if (activeTab === "Rejected" && user.status !== "Rejected")
    //   return false;
    if (activeTab !== "All Challenges" && user.status !== activeTab) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();

      if (
        !user.name.toLowerCase().includes(q) &&
        !user.username.toLowerCase().includes(q) &&
        !user.id.includes(q)
      ) {
        return false;
      }
    }

    // status Type
    if (currentStatus && user.status !== currentStatus) return false;

    // category
    if (category && user.category !== category) return false;

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
      <ChallengeTable
        filteredData={filteredData}
        modalId={openModal}
        handleOpenModal={handleOpenModal}
        handleCloseModal={handleCloseModal}
      />
      {openModal && <ChallengeModal handleCloseModal={handleCloseModal} />}
    </div>
  );
}

export default Challenges;
