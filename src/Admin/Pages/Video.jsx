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

function Video() {
  const [activeTab, setActiveTab] = useState("All Videos");
  const [openModal, setOpenModal] = useState(null);

  function handleOpenModal(id) {
    setOpenModal(id);
  }

  function handleCloseModal() {
    setOpenModal(null);
  }

  function handleActiveTabChange(tab) {
    setActiveTab(tab);
  }
  return (
    <div className="space-y-7">
      <Header />
      <Stats stats={stats} />
      <Menu
        activeTab={activeTab}
        handleActiveTabChange={handleActiveTabChange}
      />
      <VideoTable
        modalId={openModal}
        handleOpenModal={handleOpenModal}
        handleCloseModal={handleCloseModal}
      />
      {openModal && <VideoModal handleCloseModal={handleCloseModal}/>}
    </div>
  );
}

export default Video;
