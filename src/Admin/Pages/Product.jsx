import { useState } from "react";
import Header from "../components/Products/Header";
import Menu from "../components/Products/Menu";
import Stats from "../components/SuspendedAcoount/Stats";
import ProductsTable from "../components/Products/ProductsTable";
import ProductModal from "../components/Products/ProductModal";

const stats = [
  {
    title: "Total Products",
    value: "1,268",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Active Products",
    value: "1,102",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Total Sales",
    value: "18.6K",
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
    title: "Out of Stock",
    value: "166",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
];

const tabs = ["All Products", "Active", "Inactive", "Out of Stock", "Drafts"];
const categories = ["Merchandise", "Digital"];
const statuses = tabs.slice(1);

const productData = [...new Array(15)].map((_, i) => {
  return {
    id: i + 1,
    productName: "DeyMake Cap",
    productId: "ID-PRO-0001",
    creatorImg: "/aisha.png",
    creatorName: "KIng_Midi",
    price: "8,500",
    stock: 245,
    createdAt: "May 25, 2025 04:00 PM",
    category: categories[i % categories.length],
    status: statuses[i % statuses.length],
  };
});

function Product() {
  const [activeTab, setActiveTab] = useState("All Products");
  const [openModal, setOpenModal] = useState(null);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const filteredData = productData.filter((data) => {
    if (activeTab !== "All Products" && data.status !== activeTab) return false;
    if (status && data.status !== status) return false;
    if (category && data.category !== category) return false;
    return true;
  });

  function handleOpenModal(id) {
    setOpenModal(id);
  }
  function handleCloseModal() {
    setOpenModal(null);
  }

  function handleStatusChange(value) {
    setStatus(value);
  }

  function handleCategoryChange(value) {
    setCategory(value);
  }

  function handleActiveTabChange(tab) {
    setActiveTab(tab);
  }

  return (
    <>
      {openModal && <ProductModal handleCloseModal={handleCloseModal} />}
      <div className="space-y-7">
        <Header />
        <Stats stats={stats} />
        <Menu
          tabs={tabs}
          activeTab={activeTab}
          categories={categories}
          statuses={statuses}
          category={category}
          handleCategoryChange={handleCategoryChange}
          status={status}
          handleStatusChange={handleStatusChange}
          handleActiveTabChange={handleActiveTabChange}
        />
        <ProductsTable
          filteredData={filteredData}
          modalId={openModal}
          handleOpenModal={handleOpenModal}
          handleCloseModal={handleCloseModal}
        />
      </div>
    </>
  );
}

export default Product;
