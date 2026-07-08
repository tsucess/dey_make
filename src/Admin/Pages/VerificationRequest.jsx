import { useState } from "react";
import Stats from "../components/Dashboard/Stats";
import Header from "../components/Verification/Header";
import Menu from "../components/Verification/Menu";
import VerificationTable from "../components/Verification/VerificationTable";
import VerificationModal from "../components/Verification/VerificationModal";

const stats = [
  {
    title: "Total Creators",
    value: "125.6M",
    date: "12.5% vs last 7 days",
  },
  {
    title: "Verified Creators",
    value: "328K",
    date: "12.5% vs last 7 days",
    color: "#00C0E8",
  },
  {
    title: "New Creators",
    value: "125K",
    date: "12.5% vs last 7 days",
    color: "#34C759",
  },
  { title: "Active Creators", value: "1.82M", date: "12.5% vs last 7 days" },
  {
    title: "Top Creator Earnings",
    value: "7.62M",
    date: "12.5% vs last 7 days",
    color: "#FF8D28",
  },
];

function VerificationRequest() {
  const [activeTab, setActiveTab] = useState("Pending Review");
  const [openModal, setOpenModal] = useState(null);

  function handleActiveTabChange(tab) {
    setActiveTab(tab);
  }

  function handleOpenModal(id) {
    setOpenModal(id);
  }

  function handleCloseModal() {
    setOpenModal(null);
  }

  return (
    <div className="space-y-7">
     {openModal && <VerificationModal handleCloseModal={handleCloseModal}/>} 
      <Header />
      <Stats stats={stats} large />
      <Menu
        activeTab={activeTab}
        handleActiveTabChange={handleActiveTabChange}
      />
      <VerificationTable modalId={openModal} handleOpenModal={handleOpenModal}  />
    </div>
  );
}

export default VerificationRequest;
