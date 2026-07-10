import { useState } from "react";
import Stats from "../components/SuspendedAcoount/Stats";
import Header from "../components/Video/Header";
import Menu from "../components/Video/Menu";
import VideoTable from "../components/Video/VideoTable";
import VideoModal from "../components/Video/VideoModal";

const stats = [
  {
    title: "Total Videos",
    value: "125,430",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Uploaded Today",
    value: "1,248",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Total Views",
    value: "245.6M",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Total Likes",
    value: "18.6M",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Reported Videos",
    value: "842",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
];

const tabs = ["All Videos", "Published", "Under Review", "Reported", "Removed"];
const status = ["Published", "Under Review", "Reported", "Removed"];
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

const videoData = Array(15)
  .fill({
    name: "Aisha Doe",
    username: "@aishadoe",
    id: "1234567890",
    uploadedDate: "May 26, 2026",
    videoTitle: "Weekend Vibe",
    videoId: "VID-2024-1234511",
  })
  .map((v, i) => ({
    ...v,
    id: v.id.slice(0, -1) + i,
    status: status[i % status.length],
    view: "1.2M",
    likes: "96.4K",
    comments: "2.3K",
    category: categories[i % categories.length],
  }));

function Video() {
  const [activeTab, setActiveTab] = useState("All Videos");
  const [openModal, setOpenModal] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  function handleStatusChange(status) {
    setCurrentStatus(status);
  }

  function handleCategoryChange(category) {
    setCategory(category);
  }

  function handleSearchQueryChange(query) {
    setSearchQuery(query);
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

  const filteredData = videoData.filter((user) => {
    // Tab filter
    // if (activeTab === "Pending Review" && user.status !== "Pending Review")
    //   return false;
    // if (activeTab === "Approved" && user.status !== "Approved")
    //   return false;
    // if (activeTab === "Rejected" && user.status !== "Rejected")
    //   return false;
    if (activeTab !== "All Videos" && user.status !== activeTab) {
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

    // category Type
    if (category && user.category !== category) return false;

    // status
    if (currentStatus && user.status !== currentStatus) return false;

    return true;
  });
  return (
    <div className="space-y-7">
      <Header />
      <Stats stats={stats} />
      <Menu
        tabs={tabs}
        activeTab={activeTab}
        handleActiveTabChange={handleActiveTabChange}
        categories={categories}
        category={category}
        handleCategoryChange={handleCategoryChange}
        status={status}
        currentStatus={currentStatus}
        handleStatusChange={handleStatusChange}
        searchQuery={searchQuery}
        handleSearchQueryChange={handleSearchQueryChange}
      />
      <VideoTable
        filteredData={filteredData}
        modalId={openModal}
        handleOpenModal={handleOpenModal}
        handleCloseModal={handleCloseModal}
      />
      {openModal && <VideoModal handleCloseModal={handleCloseModal} />}
    </div>
  );
}

export default Video;
