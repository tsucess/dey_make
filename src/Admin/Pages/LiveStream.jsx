import { useState } from "react";
import Header from "../components/LiveStream/Header";
import Stats from "../components/SuspendedAcoount/Stats";
import Menu from "../components/LiveStream/Menu";
import LivestreamTable from "../components/LiveStream/LivestreamTable";
import LivestreamModal from "../components/LiveStream/LivestreamModal";

const stats = [
    {title : 'Live Now', value : '72', sub: '12.5% vs yesterday', hasArrow: true},
    {title : 'Active Viewers', value : '28.4K', sub: '12.5% vs yesterday', hasArrow: true},
    {title : 'Total Likes', value : '18.6K', sub: '12.5% vs yesterday', hasArrow: true},
    {title : 'Gift Received', value : '2.45M', sub: '12.5% vs yesterday', hasArrow: true},
    {title : 'Avg. Watch Time', value : '24m 18s', sub: '12.5% vs yesterday', hasArrow: true},
]

function LiveStream() {
    const [activeTab, setActiveTab] = useState("All Live Streams");
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

  return <div className="space-y-7">
    <Header/>
    <Stats stats={stats}/>
    <Menu
        activeTab={activeTab}
        handleActiveTabChange={handleActiveTabChange}
      />
      <LivestreamTable modalId={openModal}
        handleOpenModal={handleOpenModal}/>
        {openModal && <LivestreamModal handleCloseModal={handleCloseModal}/>}
  </div>;
}

export default LiveStream;
