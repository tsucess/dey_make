import { useEffect, useMemo, useState } from "react";
import Stats from "../components/Dashboard/Stats";
import Header from "../components/Verification/Header";
import Menu from "../components/Verification/Menu";
import VerificationTable from "../components/Verification/VerificationTable";
import VerificationModal from "../components/Verification/VerificationModal";
import { api } from "../../services/api";

const tabs = ["All", "Pending Review", "Approved", "Rejected"];
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
const verificationTypes = ["Blue Check", "Identity", "Business", "Organization"];

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function formatCount(value) {
  const num = Number(value) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

function displayStatus(status) {
  if (status === "pending" || status === "submitted") return "Pending Review";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending Review";
}

function normalizeRequest(r) {
  const user = r.user || {};
  return {
    id: r.id,
    name: r.legalName || user.fullName || user.username,
    username: user.username ? `@${user.username}` : "",
    verified: Boolean(user.isVerifiedCreator),
    followers: formatCount(user.stats?.subscribersCount),
    requestedDate: formatDate(r.submittedAt || r.createdAt),
    status: displayStatus(r.status),
    verificationType: r.documentType || "Identity",
    category: user.creatorCategory?.name || "—",
    country: r.country,
    about: r.about,
  };
}

function VerificationRequest() {
  const [activeTab, setActiveTab] = useState("All");
  const [openModal, setOpenModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyType, setVerifyType] = useState("");
  const [categoryType, setCategoryType] = useState("");
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const statusParam = useMemo(() => {
    if (activeTab === "Pending Review") return "pending";
    if (activeTab === "Approved") return "approved";
    if (activeTab === "Rejected") return "rejected";
    return "";
  }, [activeTab]);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setErrorMessage("");
    api.getAdminCreatorVerificationRequests({ status: statusParam, perPage: 50 })
      .then((response) => {
        if (cancelled) return;
        const raw = response?.data?.requests || [];
        setRequests(raw.map(normalizeRequest));
      })
      .catch((err) => { if (!cancelled) setErrorMessage(err?.message || "Failed to load verification requests"); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [statusParam, refreshKey]);

  async function handleVerificationAction(id, payload) {
    await api.updateAdminCreatorVerificationRequest(id, payload);
    setRefreshKey((k) => k + 1);
  }

  const totalRequests = requests.length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const pendingCount = requests.filter((r) => r.status === "Pending Review").length;

  const stats = [
    { title: "Total Requests", value: `${totalRequests}`, date: "current view" },
    { title: "Verified Creators", value: `${approvedCount}`, date: "current view", color: "#00C0E8" },
    { title: "Pending Review", value: `${pendingCount}`, date: "current view", color: "#34C759" },
    { title: "Rejected", value: `${requests.filter((r) => r.status === "Rejected").length}`, date: "current view" },
    { title: "Top Creator Earnings", value: "—", date: "N/A", color: "#FF8D28" },
  ];

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

  const filteredData = requests.filter((user) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const idStr = String(user.id ?? "");
      if (
        !(user.name || "").toLowerCase().includes(q) &&
        !(user.username || "").toLowerCase().includes(q) &&
        !idStr.includes(q)
      ) {
        return false;
      }
    }
    if (verifyType && user.verificationType !== verifyType) return false;
    if (categoryType && user.category !== categoryType) return false;
    return true;
  });

  return (
    <div className="space-y-7">
      {openModal && (
        <VerificationModal
          handleCloseModal={handleCloseModal}
          requestId={openModal}
          onAction={handleVerificationAction}
        />
      )}
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
      {isLoading && (
        <div className="p-6 text-center text-sm text-white/70">Loading verification requests…</div>
      )}
      {!isLoading && errorMessage && (
        <div className="p-6 text-center text-sm text-red100">{errorMessage}</div>
      )}
      {!isLoading && !errorMessage && (
        <VerificationTable
          filteredData={filteredData}
          modalId={openModal}
          handleOpenModal={handleOpenModal}
          handleCloseModal={handleCloseModal}
        />
      )}
    </div>
  );
}

export default VerificationRequest;
