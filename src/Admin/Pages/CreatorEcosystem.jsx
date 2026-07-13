import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { FaArrowUp } from "react-icons/fa";
import OverviewTab from "../components/CreatorEcosystem/OverviewTab";
import CreatorsTab from "../components/CreatorEcosystem/CreatorsTab";

const stats = [
  { title: "Total Creators", value: "12,543", diff: "11.2% vs last 7 days" },
  { title: "Verified Creators", value: "2,845", diff: "10.1% vs last 7 days" },
  { title: "Total Views (All)", value: "245.6M", diff: "12.5% vs last 7 days" },
  { title: "Total engagement", value: "18.6M", diff: "11.2% vs last 7 days" },
  { title: "Total Earnings", value: "124.8M", diff: "10.5% vs last 7 days" },
];

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "creators", label: "Creators" },
  { id: "performance", label: "Performance" },
  { id: "monetization", label: "Monetization" },
  { id: "programs", label: "Programs" },
  { id: "collabs", label: "Collabs" },
  { id: "resources", label: "Resources" },
];

function CreatorEcosystem() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col gap-6 text-white font-inter">
      {/* Header section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium mb-1">Creator Ecosystem</h1>
          <p className="text-sm text-slate500">
            Discover creators, Track performance & fee growth
          </p>
        </div>
        <button className="flex items-center gap-2 border border-slate600 text-sm px-4 py-2 rounded-lg hover:bg-slate850 transition-colors">
          <FiDownload className="text-lg" />
          Export
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 bg-blue200 p-5 rounded-xl border border-transparent hover:border-slate850 transition-colors"
          >
            <h5 className="text-slate400 text-xs font-medium">{stat.title}</h5>
            <p className="text-2xl font-semibold">{stat.value}</p>
            <div className="flex items-center gap-1 text-green500 text-[11px] font-medium mt-1">
              <FaArrowUp className="w-3 h-3" />
              <span>{stat.diff}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate860">
        <div className="flex items-center gap-8 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 flex-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-red700 text-white"
                  : "border-transparent text-slate500 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="mt-2">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "creators" && <CreatorsTab />}
        {activeTab === "performance" && (
          <div className="text-center text-slate500 py-10">Performance Data</div>
        )}
        {activeTab === "monetization" && (
          <div className="text-center text-slate500 py-10">Monetization Data</div>
        )}
        {activeTab === "programs" && (
          <div className="text-center text-slate500 py-10">Programs Data</div>
        )}
        {activeTab === "policies" && (
          <div className="text-center text-slate500 py-10">Policies Data</div>
        )}
        {activeTab === "resources" && (
          <div className="text-center text-slate500 py-10">Resources Data</div>
        )}
      </div>
    </div>
  );
}

export default CreatorEcosystem;
