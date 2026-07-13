import { useState } from "react";
import Header from "../components/LiveStream/Header";
import Stats from "../components/SuspendedAcoount/Stats";
import Menu from "../components/LiveStream/Menu";
import LivestreamTable from "../components/LiveStream/LivestreamTable";
import LivestreamModal from "../components/LiveStream/LivestreamModal";

const stats = [
  { title: "Live Now", value: "72", sub: "12.5% vs yesterday", hasArrow: true },
  {
    title: "Active Viewers",
    value: "28.4K",
    sub: "12.5% vs yesterday",
    hasArrow: true,
  },
  {
    title: "Total Likes",
    value: "18.6K",
    sub: "12.5% vs yesterday",
    hasArrow: true,
  },
  {
    title: "Gift Received",
    value: "2.45M",
    sub: "12.5% vs yesterday",
    hasArrow: true,
  },
  {
    title: "Avg. Watch Time",
    value: "24m 18s",
    sub: "12.5% vs yesterday",
    hasArrow: true,
  },
];

const tabs = ["All Live Streams", "Live Now", "Upcoming", "Ended", "Flagged"];
const status = ["Live Now", "Upcoming", "Ended", "Flagged"];
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

const livestreamData = Array(10)
  .fill({
    name: "Aisha Doe",
    username: "@aishadoe",
    id: "1234567890",
    startedAt: "May 26, 2024 (08:30 PM)",
    streamTitle : 'Weekend Vibe',
    streamId : 'LIVE-2024-123511'
  })
  .map((v, i) => ({
    ...v,
    id: v.id.slice(0, -1) + i,
    status: status[i % status.length],
    category: categories[i % categories.length],
    view: '96.4K',
    duration: '01:23:45',
  }));

function LiveStream() {
  const [activeTab, setActiveTab] = useState("All Live Streams");
  const [openModal, setOpenModal] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('')
  const [category, setCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  function handleStatusChange(status){
    setCurrentStatus(status)
  }

  function handleCategoryChange(category){
    setCategory(category)
  }

  function handleSearchQueryChange(value){
    setSearchQuery(value.trim())
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

  const filteredData = livestreamData.filter((user) => {
    // Tab filter
    // if (activeTab === "Pending Review" && user.status !== "Pending Review")
    //   return false;
    // if (activeTab === "Approved" && user.status !== "Approved")
    //   return false;
    // if (activeTab === "Rejected" && user.status !== "Rejected")
    //   return false;
    if (activeTab !== "All Live Streams" && user.status !== activeTab) {
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
        status={status}
        categories={categories}
        currentStatus={currentStatus}
        category={category}
        searchQuery={searchQuery}
        handleCategoryChange={handleCategoryChange}
        handleStatusChange={handleStatusChange}
        handleSearchQueryChange={handleSearchQueryChange}
      />
      <LivestreamTable filteredData={filteredData} modalId={openModal} handleOpenModal={handleOpenModal} />
      {openModal && <LivestreamModal handleCloseModal={handleCloseModal} />}
    </div>
  );
}

export default LiveStream;
