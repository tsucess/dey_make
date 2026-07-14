import { useState } from "react";
import { BsDot } from "react-icons/bs";
import { MdArrowForwardIos } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const filterTab = ["All", "Active", "Draft", "Review", "Completed"];



function Campaigns({handleSelectedCampaignChange, campaings}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");

  function handleActiveTabChange(tab) {
    setActiveTab(tab);
  }

  const filteredData = campaings.filter((campaign) => {
    if (activeTab !== 'All' && activeTab !== campaign.tab) return false;

    return true;
  });

  return (
    <div className="flex flex-col gap-5 font-inter">
      <button
        onClick={() => navigate("/create-campaign")}
        className="bg-orange100 hover:bg-orange500 transition-all text-slate100 font-medium text-sm py-3"
      >
        Create New Campaigns
      </button>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          {filterTab.map((tab) => (
            <button
              key={tab}
              onClick={() => handleActiveTabChange(tab)}
              className={`flex items-center justify-center text-sm font-semibold px-5 py-2 rounded-md transition-all ${
                activeTab === tab
                  ? "bg-orange100 text-slate100 hover:bg-orange500"
                  : "text-black100 dark:text-white hover:bg-slate150"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Campaigns */}
        <div className="flex flex-col gap-4">
          {filteredData.map((campaign) => (
            <div
              key={campaign.id}
              className="flex gap-5 py-5 px-7.5 border border-black/30 dark:border-white/30 rounded-2xl hover:bg-slate150/50 dark:hover:bg-slate350/20 transition-all"
            >
              <div className="w-16 h-16 rounded-md bg-slate150 dark:bg-white shrink-0"></div>
              <div className="flex flex-col gap-6 flex-1">
                <div className="flex items-start justify-between">
                  {" "}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-black dark:text-white text-lg font-bold">
                          {campaign.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-black dark:text-white">
                            {campaign.company}
                          </span>
                          <BsDot className="w-4 h-4 text-black dark:text-white" />
                          <span className="text-xs text-black dark:text-white">
                            {campaign.category}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-sm text-sm font-medium ${
                          campaign.tab === "Active"
                            ? "bg-green100/24 text-green100"
                            : "bg-blue/24 text-blue"
                        }`}
                      >
                        {campaign.tab}
                      </div>
                    </div>
                    <div className="flex items-center gap-4.75">
                      <span className="text-sm text-orange100">
                        ₦{campaign.budget} budget
                      </span>
                      <span className="text-sm text-slate250">
                        {campaign.gottenCreator}/{campaign.needCreator} creator
                      </span>
                      <span className="text-sm text-blue">
                        {campaign.appliedCreator} applied &gt;
                      </span>
                    </div>
                  </div>
                  <button onClick={()=> handleSelectedCampaignChange(campaign)}  className="cursor-pointer">
                    <MdArrowForwardIos className="w-5 h-5 text-black dark:text-white" />
                  </button>
                </div>
                {campaign.raised && (
                  <div className="flex flex-col gap-3">
                    <span className="text-xs text-black dark:text-white">
                      ₦{campaign.raised}
                    </span>
                    <div className="flex items-center gap-3">
                      {" "}
                      <div className="flex-1 h-1 bg-slate500 w-full flex">
                        <span
                          style={{
                            width: `${Math.floor((campaign.raised / campaign.budget) * 100)}%`,
                          }}
                          className="bg-red100 h-full "
                        ></span>{" "}
                      </div>{" "}
                      <span className="text-xs text-black dark:text-white">
                        {Math.floor((campaign.raised / campaign.budget) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Campaigns;
