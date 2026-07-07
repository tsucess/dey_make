import { useState } from "react";
import Header from "../components/SuspendedAcoount/Header";
import Menu from "../components/SuspendedAcoount/Menu";

function SuspendedAccount() {
    const [activeTab, setActiveTab] = useState("All Suspended");
    
      function handleActiveTabChange(tab) {
        setActiveTab(tab);
      }
  return (
    <div className="space-y-7">
      <Header />
      <Menu activeTab={activeTab}
        handleActiveTabChange={handleActiveTabChange}/>
    </div>
  );
}

export default SuspendedAccount;
