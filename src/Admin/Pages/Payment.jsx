import { useState } from "react";
import Header from "../components/Payment/Header";
import Menu from "../components/Payment/Menu";
import PaymentTable from "../components/Payment/PaymentTable";
import Stats from "../components/SuspendedAcoount/Stats";
import PaymentModal from "../components/Payment/PaymentModal";

const stats = [
  {
    title: "Total Payments",
    value: "124.8M",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Successful Payments",
    value: "4,382",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Total Payouts",
    value: "98.2M",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Pending Payouts",
    value: "12.5M",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Failed Payments",
    value: "66",
    sub: "5.2% vs last 7 days",
    hasArrow: true,
  },
];

const tabs = ["All Transactions", "Payments", "Payouts", "Refunds", "Disputes"];
const types = tabs.slice(1);
const status = ["Completed", "Processing", "Pending", "Failed"];
const methods = ["Visa ******4242", "Bank Transfer"];

function getRandomNumber(length) {
  return Math.floor(Math.random() * length);
}

const paymentData = [...new Array(15)].map((_, i) => {
  return {
    id: i + 1,
    transactionId: "TXN-1234567890",
    transactionType: types[getRandomNumber(types.length)],
    description: "Payout to Creator",
    transactionAmount: "5,000",
    transactionMethod: methods[getRandomNumber(methods.length)],
    creatorName: "Aisha Doe",
    creatorEmail: "@aishadoe",
    creatorImg: "/aisha.png",
    status: status[getRandomNumber(status.length)],
  };
});

function Payment() {
  const [activeTab, setActiveTab] = useState("All Transactions");
  const [currentStatus, setCurrentStatus] = useState("");
  const [currentType, setCurrentType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openModal, setOpenModal] = useState(null);
  const [currentMethod, setCurrentMethod] = useState("");

  const filteredData = paymentData.filter((data) => {
    if (activeTab !== "All Transactions" && data.transactionType !== activeTab)
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!(data.transactionId || "").toLowerCase().includes(q)) {
        return false;
      }
    }
    if (currentStatus && data.status !== currentStatus) return false;
    if (currentType && data.transactionType !== currentType) return false;
    if (currentMethod && data.transactionMethod !== currentMethod) return false;
    return true;
  });

  function handleSearchQueryChange(value) {
    setSearchQuery(value);
  }

  function handleOpenModal(id) {
    setOpenModal(id);
  }
  function handleCloseModal() {
    setOpenModal(null);
  }

  function handleStatusChange(value) {
    setCurrentStatus(value);
  }

  function handleActiveTabChange(tab) {
    setActiveTab(tab);
  }

  function handleTypeChange(value) {
    setCurrentType(value);
  }

  function handleMethodChange(value) {
    setCurrentMethod(value);
  }

  return (
    <>
      {openModal && <PaymentModal handleCloseModal={handleCloseModal} />}
      <div className="space-y-8">
        <Header />
        <Stats stats={stats} />
        <Menu
          activeTab={activeTab}
          tabs={tabs}
          statuses={status}
          types={types}
          methods={methods}
          status={currentStatus}
          currentType={currentType}
          currentMethod={currentMethod}
          searchQuery={searchQuery}
          handleMethodChange={handleMethodChange}
          handleSearchQueryChange={handleSearchQueryChange}
          handleActiveTabChange={handleActiveTabChange}
          handleStatusChange={handleStatusChange}
          handleTypeChange={handleTypeChange}
        />
        <PaymentTable
          filteredData={filteredData}
          modalId={openModal}
          handleOpenModal={handleOpenModal}
          handleCloseModal={handleCloseModal}
        />
      </div>
    </>
  );
}

export default Payment;
