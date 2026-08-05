import { useState } from "react";
import Header from "../components/Order/Header";
import Menu from "../components/Order/Menu";
import OrderTable from "../components/Order/OrderTable";
import Stats from "../components/SuspendedAcoount/Stats";
import OrderModal from "../components/Order/OrderModal";

const stats = [
  {
    title: "Total Orders",
    value: "4,612",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Total Revenue",
    value: "124.8M",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Orders Shipped",
    value: "3,012",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Returns / Refunds",
    value: "112",
    sub: "6.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Pending Orders",
    value: "186",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
];

const tabs = [
  "All Orders",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Refunded",
];
const statuses = tabs.slice(1);

const orderData = [...new Array(15)].map((_, i) => {
  return {
    id: i + 1,
    orderId: "ORD-2024-001234",
    creatorImg: "/aisha.png",
    creatorName: "Aisha Doe",
    creatorEmail: "@aishadoe",
    item: "10",
    amount: "28,500",
    payment: "VISA **** 4343",
    createdAt: "May 25, 2025 04:00 PM",
    status: statuses[i % statuses.length],
  };
});

function Order() {
  const [activeTab, setActiveTab] = useState("All Orders");
  const [currentStatus, setCurrentStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openModal, setOpenModal] = useState(null);



  const filteredData = orderData.filter((data) => {
    if (activeTab !== "All Orders" && data.status !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!(data.orderId || "").toLowerCase().includes(q)) {
        return false;
      }
    }
    if (currentStatus && data.status !== currentStatus) return false;
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
  return (
    <>
      {openModal && <OrderModal handleCloseModal={handleCloseModal} />}
      <div className="space-y-7">
        <Header />
        <Stats stats={stats} />
        <Menu
          tabs={tabs}
          activeTab={activeTab}
          statuses={statuses}
          status={currentStatus}
          handleStatusChange={handleStatusChange}
          handleActiveTabChange={handleActiveTabChange}
          searchQuery={searchQuery}
          handleSearchQueryChange={handleSearchQueryChange}
        />
        <OrderTable
          filteredData={filteredData}
          modalId={openModal}
          handleOpenModal={handleOpenModal}
          handleCloseModal={handleCloseModal}
        />
      </div>
    </>
  );
}

export default Order;
