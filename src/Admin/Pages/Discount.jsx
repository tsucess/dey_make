import { useState } from "react";
import DiscountTable from "../components/Discount/DiscountTable";
import Header from "../components/Discount/Header";
import Menu from "../components/Discount/Menu";
import Stats from "../components/SuspendedAcoount/Stats";
import DiscountModal from "../components/Discount/DiscountModal";

const stats = [
  {
    title: "Total Discounts",
    value: "156",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Active Discounts",
    value: "124.8M",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Total Discount Given",
    value: "24.8M",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Orders with Discount",
    value: "4,612",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Total Usage",
    value: "12,842",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
];

const tabs = ["All Discounts", "Active", "Scheduled", "Expired"];

const statuses = tabs.slice(1);

const types = ["Percentage", "Free Shipping"];
const discount = [
  "20% Off Everything",
  "Free Shipping",
  "15% Off for New Users",
];

const discountData = [...new Array(15)].map((_, i) => {
  return {
    id: i + 1,
    discount: discount[i % discount.length],
    discountType: types[i % types.length],
    discountValue: "20% off",
    discountCode: "SAVEBIG",
    useage: "1,234 times",
    useageLimit: "5,000 times",
    status: statuses[i % statuses.length],
  };
});

function Discount() {
  const [activeTab, setActiveTab] = useState("All Discounts");
  const [currentStatus, setCurrentStatus] = useState("");
  const [currentType, setCurrentType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openModal, setOpenModal] = useState(null);

  const filteredData = discountData.filter((data) => {
    if (activeTab !== "All Discounts" && data.status !== activeTab)
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!(data.discount || "").toLowerCase().includes(q)) {
        return false;
      }
    }
    if (currentStatus && data.status !== currentStatus) return false;
    if (currentType && data.discountType !== currentType) return false;
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

  return (
    <>
    {openModal && <DiscountModal handleCloseModal={handleCloseModal}/>}
    <div className="space-y-7">
      <Header />
      <Stats stats={stats} />
      <Menu
        activeTab={activeTab}
        tabs={tabs}
        statuses={statuses}
        types={types}
        status={currentStatus}
        currentType={currentType}
        searchQuery={searchQuery}
        handleSearchQueryChange={handleSearchQueryChange}
        handleActiveTabChange={handleActiveTabChange}
        handleStatusChange={handleStatusChange}
        handleTypeChange={handleTypeChange}
      />
      <DiscountTable
        filteredData={filteredData}
        modalId={openModal}
        handleOpenModal={handleOpenModal}
        handleCloseModal={handleCloseModal}
      />
    </div>
    </>
  );
}

export default Discount;
