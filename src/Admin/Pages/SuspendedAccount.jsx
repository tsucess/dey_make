import { useEffect, useState } from "react";
import Header from "../components/SuspendedAcoount/Header";
import Menu from "../components/SuspendedAcoount/Menu";
import Stats from "../components/SuspendedAcoount/Stats";
import SuspendedTable from "../components/SuspendedAcoount/SuspendedTable";
import SuspendedModal from "../components/SuspendedAcoount/SuspendedModal";
import { api } from "../../services/api";

const tabs = ["All Suspended", "Banned Permanently", "Temporary", "Appeal"];
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

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function normalizeSuspended(u) {
  const note = u.accountStatusNotes || "";
  return {
    id: u.id,
    name: u.fullName || u.username,
    username: u.username ? `@${u.username}` : "",
    suspendedDate: formatDate(u.updatedAt || u.createdAt),
    status: u.accountStatus === "suspended" ? "Banned" : "Active",
    suspensionType: "Temporary",
    reason: note || "Policy violation",
    reasonTitle: "Community Guidelines",
    duration: "—",
  };
}

function SuspendedAccount() {
  const [activeTab, setActiveTab] = useState("All Suspended");
  const [openModal, setOpenModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suspendedType, setSuspendedType] = useState("");
  const [reasonType, setReasonType] = useState("");
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ suspendedUsers: 0, totalUsers: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setErrorMessage("");
    api.getAdminUsers({ q: searchQuery, accountStatus: "suspended", perPage: 50 })
      .then((response) => {
        if (cancelled) return;
        const raw = response?.data?.users || [];
        setUsers(raw.map(normalizeSuspended));
        setSummary(response?.meta?.summary || { suspendedUsers: raw.length, totalUsers: raw.length });
      })
      .catch((err) => { if (!cancelled) setErrorMessage(err?.message || "Failed to load suspended users"); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [searchQuery]);

  const stats = [
    { title: "Total Suspended", value: `${summary.suspendedUsers || 0}`, sub: "All time", hasArrow: false },
    { title: "Suspended This Month ", value: `${summary.suspendedUsers || 0}`, sub: "12.5% vs last 7 days", hasArrow: true },
    { title: "Banned Permanently", value: `${summary.suspendedUsers || 0}`, sub: "of total", hasArrow: true },
    { title: "Temporary Suspensions", value: "0", sub: "of total", hasArrow: true },
    { title: "Appeals Received", value: "0", sub: "This month", hasArrow: false },
  ];

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

  const filteredData = users.filter((user) => {
    if (activeTab !== "All Suspended" && user.suspensionType !== activeTab) {
      return false;
    }
    if (suspendedType && user.suspensionType !== suspendedType) return false;
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
        searchQuery={searchQuery}
        suspensionTypes={suspensionTypes}
        reasonTypes={reasons}
        reasonType={reasonType}
        suspendedType={suspendedType}
        handleSearchQueryChange={handleSearchQueryChange}
        handleReasonTypeChange={handleReasonTypeChange}
        handleSuspendedTypeChange={handleSuspendedTypeChange}
      />
      {isLoading && (
        <div className="p-6 text-center text-sm text-white/70">Loading suspended users…</div>
      )}
      {!isLoading && errorMessage && (
        <div className="p-6 text-center text-sm text-red100">{errorMessage}</div>
      )}
      {!isLoading && !errorMessage && (
        <SuspendedTable
          filteredData={filteredData}
          modalId={openModal}
          handleOpenModal={handleOpenModal}
          handleCloseModal={handleCloseModal}
        />
      )}
    </div>
  );
}

export default SuspendedAccount;
