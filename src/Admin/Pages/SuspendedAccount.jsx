import { useState } from "react";
import Header from "../components/SuspendedAcoount/Header";
import Menu from "../components/SuspendedAcoount/Menu";
import Stats from "../components/SuspendedAcoount/Stats";
import SuspendedTable from "../components/SuspendedAcoount/SuspendedTable";
import SuspendedModal from "../components/SuspendedAcoount/SuspendedModal";

const stats = [
    {title : 'Total Suspended', value : '320', sub: 'All time', hasArrow: false},
    {title : 'Suspended This Month ', value : '45', sub: '12.5% vs last 7 days', hasArrow: true},
    {title : 'Banned Permanently', value : '210', sub: '12.5% of total', hasArrow: true},
    {title : 'Temporary Suspensions', value : '110', sub: '12.5% of total', hasArrow: true},
    {title : 'Appeals Received', value : '28', sub: 'This month', hasArrow: false},
]

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
    <div className="space-y-7 w-full">
      {openModal && <SuspendedModal handleCloseModal={handleCloseModal} />}
      <Header />
      <Stats stats={stats}/>
      <Menu
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
