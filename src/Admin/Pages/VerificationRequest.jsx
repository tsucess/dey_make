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

const tabs = ['All',"Pending Review", "Approved", "Rejected"];
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
const verificationTypes = [
  "Blue Check",
  "Identity",
  "Business",
  "Organization",
];

const verificationData = Array(10)
  .fill({
    name: "Aisha Doe",
    username: "@aishadoe",
    verified: true,
    id: "1234567890",
    followers: "2.4M",
    requestedDate: "May 26, 2026",
  })
  .map((v, i) => ({
    ...v,
    id: v.id.slice(0, -1) + i,
    status: i % 3 === 0 ? 'Pending Review' : i % 3 === 1 ? 'Approved' : 'Rejected' ,
    verificationType: verificationTypes[i % verificationTypes.length],
    category: categories[i % categories.length],
  }));

function VerificationRequest() {
  const [activeTab, setActiveTab] = useState("All");
  const [openModal, setOpenModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyType, setVerifyType] = useState("");
  const [categoryType, setCategoryType] = useState("");

  function handleCategoryTypeChange(type) {
    setCategoryType(type);
  }

  function handleVerifyTypeChange(type) {
    setVerifyType(type);
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

  // Verification Type
  if (verifyType && user.verificationType !== verifyType)
  return false;

  // Category
  if (categoryType && user.category !== categoryType)
    return false;

  return true;
});

  return (
    <div className="space-y-7">
      {openModal && <VerificationModal handleCloseModal={handleCloseModal} />}
      <Header />
      <Stats stats={stats} large />
      <Menu
        tabs={tabs}
        activeTab={activeTab}
        handleActiveTabChange={handleActiveTabChange}
        searchQuery={searchQuery}
        handleSearchQueryChange={handleSearchQueryChange}
        verificationTypes={verificationTypes}
        handleVerifyTypeChange={handleVerifyTypeChange}
        categories={categories}
        handleCategoryTypeChange={handleCategoryTypeChange}
      />
      <VerificationTable
        filteredData={filteredData}
        modalId={openModal}
        handleOpenModal={handleOpenModal}
        handleCloseModal={handleCloseModal}
      />
    </div>
  );
}

export default VerificationRequest;
