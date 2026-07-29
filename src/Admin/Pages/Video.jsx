import { useEffect, useState } from "react";
import Stats from "../components/SuspendedAcoount/Stats";
import Header from "../components/Video/Header";
import Menu from "../components/Video/Menu";
import VideoTable from "../components/Video/VideoTable";
import VideoModal from "../components/Video/VideoModal";
import { api } from "../../services/api";

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

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function displayVideoStatus(v) {
  const modStatus = v.moderation?.status;
  if (modStatus === "removed") return "Removed";
  if (v.isDraft) return "Under Review";
  if (modStatus === "pending") return "Under Review";
  return "Published";
}

function normalizeVideo(v) {
  const author = v.author || {};
  return {
    id: v.id,
    name: author.fullName || author.username || `User #${author.id ?? "—"}`,
    username: author.username ? `@${author.username}` : "",
    uploadedDate: formatDate(v.createdAt),
    videoTitle: v.title || v.caption || "Untitled",
    videoId: `VID-${v.id}`,
    status: displayVideoStatus(v),
    view: `${v.views || 0}`,
    likes: `${v.likes || 0}`,
    comments: `${v.commentsCount || 0}`,
    category: v.category?.name || "—",
  };
}

const tabToStatus = {
  "All Videos": "",
  "Published": "published",
  "Under Review": "draft",
  "Reported": "",
  "Removed": "removed",
};

function Video() {
  const [activeTab, setActiveTab] = useState("All Videos");
  const [openModal, setOpenModal] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setErrorMessage("");
    const statusParam = tabToStatus[activeTab] || "";
    api.getAdminVideos({ q: searchQuery || undefined, status: statusParam || undefined, perPage: 50 })
      .then((response) => {
        if (cancelled) return;
        const raw = response?.data?.videos || [];
        setVideos(raw.map(normalizeVideo));
      })
      .catch((err) => { if (!cancelled) setErrorMessage(err?.message || "Failed to load videos"); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab, searchQuery]);

  const totalVideos = videos.length;
  const reportedVideos = videos.filter((v) => v.status === "Reported").length;
  const stats = [
    { title: "Total Videos", value: `${totalVideos}`, sub: "current view", hasArrow: true },
    { title: "Under Review", value: `${videos.filter((v) => v.status === "Under Review").length}`, sub: "current view", hasArrow: true },
    { title: "Published", value: `${videos.filter((v) => v.status === "Published").length}`, sub: "current view", hasArrow: true },
    { title: "Removed", value: `${videos.filter((v) => v.status === "Removed").length}`, sub: "current view", hasArrow: true },
    { title: "Reported Videos", value: `${reportedVideos}`, sub: "current view", hasArrow: true },
  ];

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

  const filteredData = videos.filter((user) => {
    if (activeTab !== "All Videos" && user.status !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const idStr = String(user.id ?? "");
      if (
        !(user.name || "").toLowerCase().includes(q) &&
        !(user.username || "").toLowerCase().includes(q) &&
        !(user.videoTitle || "").toLowerCase().includes(q) &&
        !idStr.includes(q)
      ) {
        return false;
      }
    }
    if (category && user.category !== category) return false;
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
      {isLoading && (
        <div className="p-6 text-center text-sm text-white/70">Loading videos…</div>
      )}
      {!isLoading && errorMessage && (
        <div className="p-6 text-center text-sm text-red100">{errorMessage}</div>
      )}
      {!isLoading && !errorMessage && (
        <VideoTable
          filteredData={filteredData}
          modalId={openModal}
          handleOpenModal={handleOpenModal}
          handleCloseModal={handleCloseModal}
        />
      )}
      {openModal && <VideoModal handleCloseModal={handleCloseModal} />}
    </div>
  );
}

export default Video;
