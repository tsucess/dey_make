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

function Challenges() {
  const [activeTab, setActiveTab] = useState("All Challenges");
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
      <ChallengeTable
        modalId={openModal}
        handleOpenModal={handleOpenModal}
        handleCloseModal={handleCloseModal}
      />
      {openModal && <ChallengeModal handleCloseModal={handleCloseModal}/>}
    </div>
  );
}

export default Challenges;
