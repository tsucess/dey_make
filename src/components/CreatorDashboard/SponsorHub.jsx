import { useEffect, useState } from "react";
import { MdBarChart, MdOutlineCampaign } from "react-icons/md";
import { api, ApiError } from "../../services/api";
import Campaigns from "./Campaigns";
import Campaign from "./Campaign";
import PerformanceSection from "./PerformanceSection";

const hubTab = [
  { title: "Campaign", icon: MdOutlineCampaign },
  { title: "Performance", icon: MdBarChart },
];

function statusToTab(status) {
  const normalized = (status ?? "").toString().toLowerCase();
  if (normalized === "active") return "Active";
  if (normalized === "draft") return "Draft";
  if (normalized === "paused") return "Review";
  if (normalized === "closed") return "Completed";
  return "Draft";
}

function mapCampaign(campaign) {
  const owner = campaign?.owner ?? {};
  const category = Array.isArray(campaign?.targetCategories) && campaign.targetCategories.length > 0
    ? String(campaign.targetCategories[0])
    : campaign?.objective || "General";
  return {
    id: campaign?.id,
    title: campaign?.title ?? "Untitled Campaign",
    company: owner?.fullName || owner?.username || "You",
    category,
    budget: Number(campaign?.budgetAmount ?? 0).toLocaleString(),
    raised: "",
    needCreator: 0,
    gottenCreator: 0,
    appliedCreator: 0,
    tab: statusToTab(campaign?.status),
    currency: campaign?.currency || "NGN",
    summary: campaign?.summary,
    startsAt: campaign?.startsAt,
    endsAt: campaign?.endsAt,
  };
}

function SponsorHub() {
  const [activeTab, setActiveTab] = useState("Campaign");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    api.getBrandCampaigns()
      .then((response) => {
        if (ignore) return;
        const list = (response?.data?.campaigns ?? []).map(mapCampaign);
        setCampaigns(list);
      })
      .catch((wrapped) => {
        if (ignore) return;
        setError(wrapped instanceof ApiError ? wrapped.message : "Failed to load campaigns.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center font-inter">
        {hubTab.map(({ title, icon: Icon }) => (
          <button
            key={title}
            onClick={() => setActiveTab(title)}
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

      {error ? <div className="text-red100 text-sm font-inter">{error}</div> : null}

      {activeTab === "Campaign" && (selectedCampaign ? (
        <Campaign campaign={selectedCampaign} onBack={() => setSelectedCampaign(null)} />
      ) : (
        <Campaigns
          handleSelectedCampaignChange={setSelectedCampaign}
          campaings={campaigns}
          loading={loading}
        />
      ))}
      {activeTab === "Performance" && <PerformanceSection campaigns={campaigns} />}
    </section>
  );
}

export default SponsorHub;
