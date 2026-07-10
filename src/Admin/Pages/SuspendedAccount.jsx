import { useState } from "react";
import Header from "../components/SuspendedAcoount/Header";
import Menu from "../components/SuspendedAcoount/Menu";
import Stats from "../components/SuspendedAcoount/Stats";
import SuspendedTable from "../components/SuspendedAcoount/SuspendedTable";
import SuspendedModal from "../components/SuspendedAcoount/SuspendedModal";

const stats = [
  { title: "Total Suspended", value: "320", sub: "All time", hasArrow: false },
  {
    title: "Suspended This Month ",
    value: "45",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Banned Permanently",
    value: "210",
    sub: "12.5% of total",
    hasArrow: true,
  },
  {
    title: "Temporary Suspensions",
    value: "110",
    sub: "12.5% of total",
    hasArrow: true,
  },
  {
    title: "Appeals Received",
    value: "28",
    sub: "This month",
    hasArrow: false,
  },
];

const tabs = [
  "All Suspended",
  "Banned Permanently",
  "Temporary Suspensions",
  "Appeal in Progress",
];
const reasons = [
  "Hate Speech",
  "Spam content",
  "Nudity or sexual content",
  "Harassment & bullying",
  "Violent content",
  "Fake account",
  "Excessive posting",
  "Scam of fraud",
];
const suspensionTypes = ["Banned Permanently", "Temporary", "Appeal"];

const reasonTitle = [
  "Community Guidelines",
  "Spam & Misleading",
  "Inappropriate Content",
  "Harassment",
  "Community Guidelines",
  "Impersonation",
  "Spam & Misleading",
  "Fraud & Scams",
];

const verificationData = Array(10)
  .fill({
    name: "Aisha Doe",
    username: "@aishadoe",
    id: "1234567890",
    suspendedDate: "May 26, 2026",
  })
  .map((v, i) => ({
    ...v,
    id: v.id.slice(0, -1) + i,
    status: i % 3 === 0 ? "Banned" : i % 3 === 1 ? "Active" : "Expired",
    suspensionTypes: suspensionTypes[i % suspensionTypes.length],
    reason: reasons[i % reasons.length],
    reasonTitle : reasonTitle[i % reasonTitle.length],
    duration: i % 3 === 0 ? "Permanent" : i % 3 === 1 ? "7 days" : "Ended",
  }));

function SuspendedAccount() {
  const [activeTab, setActiveTab] = useState("All Suspended");
  const [openModal, setOpenModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suspendedType, setSuspendedType] = useState("");
  const [reasonType, setReasonType] = useState("");

  function handleReasonTypeChange(type) {
    setReasonType(type);
  }

  function handleSuspendedTypeChange(type) {
    setSuspendedType(type);
  }

  function handleSearchQueryChange(query) {
    setSearchQuery(query);
  }

  function handleActiveTabChange(tab) {
    setActiveTab(tab);
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

  const filteredData = verificationData.filter((user) => {
    // Tab filter
    // if (activeTab === "Pending Review" && user.status !== "Pending Review")
    //   return false;
    // if (activeTab === "Approved" && user.status !== "Approved")
    //   return false;
    // if (activeTab === "Rejected" && user.status !== "Rejected")
    //   return false;
    if (activeTab !== "All" && user.status !== activeTab) {
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

    // Suspended Type
    if (suspendedType && user.suspensionType !== suspendedType) return false;

    // Reason
    if (reasonType && user.reason !== reasonType) return false;

    return true;
  });

  return (
    <div className="space-y-7 w-full">
      {openModal && <SuspendedModal handleCloseModal={handleCloseModal} />}
      <Header />
      <Stats stats={stats} />
      <Menu
        tabs={tabs}
        activeTab={activeTab}
        handleActiveTabChange={handleActiveTabChange}
      />
      <SuspendedTable
        modalId={openModal}
        handleOpenModal={handleOpenModal}
        handleCloseModal={handleCloseModal}
      />
    </div>
  );
}

export default SuspendedAccount;
