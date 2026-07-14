import { useState } from "react";
import { MdBarChart, MdOutlineCampaign } from "react-icons/md";
import Campaigns from "./Campaigns";
import Campaign from "./Campaign";
import PerformanceSection from "./PerformanceSection";

const hubTab = [
  { title: "Campaign", icon: MdOutlineCampaign },
  { title: "Performance", icon: MdBarChart },
];

const campaings = [
  {
    id: 1,
    title: "Summer Glow Collection",
    company: "LuxeBeauty",
    category: "Beauty",
    budget: "500000",
    raised: "300000",
    needCreator: 6,
    gottenCreator: 4,
    appliedCreator: 24,
    tab: "Active",
  },
  {
    id: 2,
    title: "GameLaunch 2026",
    company: "NexusGames",
    category: "Gaming",
    budget: "1000000",
    raised: "",
    needCreator: 0,
    gottenCreator: 8,
    appliedCreator: 48,
    tab: "Draft",
  },
  {
    id: 3,
    title: "Summer Glow Collection",
    company: "LuxeBeauty",
    category: "Beauty",
    budget: "500000",
    raised: "300000",
    needCreator: 6,
    gottenCreator: 4,
    appliedCreator: 24,
    tab: "Active",
  },
  {
    id: 4,
    title: "GameLaunch 2026",
    company: "NexusGames",
    category: "Gaming",
    budget: "1000000",
    raised: "",
    needCreator: 0,
    gottenCreator: 8,
    appliedCreator: 48,
    tab: "Draft",
  },
  
];

function SponsorHub() {
  const [activeTab, setActiveTab] = useState("Campaign");
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  function handleActiveTabChange(tab) {
    setActiveTab(tab);
  }

  function handleSelectedCampaignChange(id) {
    setSelectedCampaign(id);
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center font-inter">
        {hubTab.map(({ title, icon: Icon }, i) => (
          <button
            key={title}
            onClick={() => handleActiveTabChange(title)}
            className={`flex-1 pb-2 border-b-2 flex items-center justify-center gap-2 text-sm font-bold ${
              activeTab === title
                ? "border-b-orange100 text-orange100"
                : "text-slate250 border-b-slate500"
            }`}
          >
            <Icon className="w-5 h-5" />
            {title}
          </button>
        ))}
      </div>
      {activeTab === "Campaign" && (selectedCampaign ? (
        <Campaign campaign={selectedCampaign} />
      ) : (
        <Campaigns
          handleSelectedCampaignChange={handleSelectedCampaignChange}
          campaings={campaings}
        />
      ))}
      {activeTab === "Performance" && <PerformanceSection />}
    </section>
  );
}

export default SponsorHub;
