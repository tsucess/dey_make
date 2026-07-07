import { useState } from "react";
import Header from "../components/SuspendedAcoount/Header";
import Menu from "../components/SuspendedAcoount/Menu";
import Stats from "../components/SuspendedAcoount/Stats";
import SuspendedTable from "../components/SuspendedAcoount/SuspendedTable";

function SuspendedAccount() {
  const [activeTab, setActiveTab] = useState("All Suspended");
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
      <Stats />
      <Menu
        activeTab={activeTab}
        handleActiveTabChange={handleActiveTabChange}
      />
      <SuspendedTable modalId={openModal} handleOpenModal={handleOpenModal} />
    </div>
  );
}

export default SuspendedAccount;
