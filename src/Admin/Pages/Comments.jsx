import React, { useEffect, useMemo, useState } from "react";
import { FiUpload, FiSearch, FiMoreVertical, FiArrowUp } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import CommentDetailsSidebar from "../components/Comments/CommentDetailsSidebar";
import { api } from "../../services/api";

const filterOptions = {
  "Risk Level": ["All Levels", "Low", "Medium", "High", "Critical"],
  "Status": ["All Status", "Pending", "Approved", "Removed", "Escalated"],
  "Date Range": ["Select date range", "Last 7 Days", "Last 30 Days"],
};

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function displayStatus(status) {
  if (status === "pending") return "Pending Review";
  if (status === "approved") return "Approved";
  if (status === "removed") return "Removed";
  if (status === "escalated") return "Escalated";
  return status || "Pending Review";
}

function normalizeCase(c) {
  const subject = c.subject || {};
  return {
    id: `CON-${c.id}`,
    rawId: c.id,
    user: {
      name: `User #${subject.ownerId ?? "—"}`,
      username: subject.ownerId ? `@user${subject.ownerId}` : "",
      avatar: "/story3.jpg",
      followers: `${c.reportCount || 0} reports`,
      verified: false,
    },
    commentText: subject.body || subject.caption || subject.title || "—",
    video: {
      title: subject.type === "comment" ? `Video #${subject.videoId ?? "—"}` : (subject.title || "—"),
      id: subject.videoId ? `UXX-${subject.videoId}` : "",
    },
    reportedBy: c.reportCount > 0 ? `${c.reportCount} report${c.reportCount === 1 ? "" : "s"}` : "",
    date: formatDate(c.lastReportedAt || c.createdAt),
    status: displayStatus(c.status),
    aiRiskLevel: c.aiRiskLevel,
    aiSummary: c.aiSummary,
  };
}

export default function Comments() {
  const [activeTab, setActiveTab] = useState("All Comments");
  const [selectedComment, setSelectedComment] = useState(null);
  const [filters, setFilters] = useState({
    "Risk Level": "All Levels",
    "Status": "All Status",
    "Date Range": "Select date range",
  });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cases, setCases] = useState([]);
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const statusParam = useMemo(() => {
    if (activeTab === "Pending Review") return "pending";
    if (activeTab === "Approved") return "approved";
    if (activeTab === "Removed") return "removed";
    if (filters["Status"] === "Pending") return "pending";
    if (filters["Status"] === "Approved") return "approved";
    if (filters["Status"] === "Removed") return "removed";
    if (filters["Status"] === "Escalated") return "escalated";
    return "";
  }, [activeTab, filters]);

  const riskParam = useMemo(() => {
    const level = filters["Risk Level"];
    if (level === "Low") return "low";
    if (level === "Medium") return "medium";
    if (level === "High") return "high";
    if (level === "Critical") return "critical";
    return "";
  }, [filters]);

  useEffect(() => { setPage(1); }, [activeTab, filters]);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setErrorMessage("");
    api.getAdminModerationCases({ contentType: "comment", status: statusParam, riskLevel: riskParam, page, perPage: 12 })
      .then((response) => {
        if (cancelled) return;
        const raw = response?.data?.cases || [];
        setCases(raw.map(normalizeCase));
        setPageMeta(response?.meta?.cases || { currentPage: 1, lastPage: 1, total: raw.length });
      })
      .catch((err) => { if (!cancelled) setErrorMessage(err?.message || "Failed to load moderation cases"); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [statusParam, riskParam, page, refreshKey]);

  async function handleModerationAction(id, payload) {
    await api.updateAdminModerationCase(id, payload);
    setRefreshKey((k) => k + 1);
  }

  const totalCases = pageMeta.total || 0;
  const stats = [
    { title: "Total Comments", value: `${totalCases}`, trend: "+0%", trendUp: true },
    { title: "Pending Review", value: statusParam === "pending" ? `${totalCases}` : "—", trend: "+0%", trendUp: true },
    { title: "Reported Comments", value: `${cases.filter((c) => c.reportedBy).length}`, trend: "+0%", trendUp: true },
    { title: "Approved", value: statusParam === "approved" ? `${totalCases}` : "—", trend: "+0%", trendUp: true },
    { title: "Removed", value: statusParam === "removed" ? `${totalCases}` : "—", trend: "+0%", trendUp: true },
  ];

  const tabs = [
    { name: "All Comments", count: null },
    { name: "Pending Review", count: statusParam === "pending" ? `${totalCases}` : null },
    { name: "Reported", count: null },
    { name: "Approved", count: null },
    { name: "Removed", count: statusParam === "removed" ? `${totalCases}` : null },
  ];

  const filteredComments = cases.filter((comment) => {
    if (activeTab === "Reported" && !comment.reportedBy) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!comment.user.name.toLowerCase().includes(q) &&
          !comment.user.username.toLowerCase().includes(q) &&
          !comment.id.toLowerCase().includes(q) &&
          !(comment.commentText || "").toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 text-white font-inter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Comments</h1>
          <p className="text-sm text-slate400 mt-1">Review and manage comments across DeyMake.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-slate700 rounded-md text-sm font-medium hover:bg-black300 transition-colors">
            <FiUpload /> Export
          </button>
          <button className="bg-orange100 text-black px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange500 transition-colors">
            Add Creator
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-blue200 rounded-xl p-5 flex flex-col gap-2 border border-black300/50">
            <h3 className="text-xs text-slate400 font-medium">{stat.title}</h3>
            <span className="text-2xl font-semibold mt-1">{stat.value}</span>
            <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-green500' : 'text-red500'}`}>
              <FiArrowUp className={`w-3 h-3 ${!stat.trendUp && 'rotate-180'}`} />
              <span>{stat.trend} vs last 7 days</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center border-b border-black300/50">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab.name
                ? "border-red500 text-white"
                : "border-transparent text-slate400 hover:text-slate-200"
            }`}
          >
            {tab.name} {tab.count && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-black300 rounded-lg flex-1 min-w-[250px] max-w-[350px]">
          <FiSearch className="text-slate500 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username, ID or email"
            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-slate500"
          />
        </div>
        
        {Object.keys(filterOptions).map((filter) => (
          <div key={filter} className="relative flex-1 min-w-[150px] max-w-[200px]">
            <div className="text-xs text-slate400 mb-1.5">{filter}</div>
            <button 
              onClick={() => setOpenDropdown(openDropdown === filter ? null : filter)}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-transparent border border-black300 rounded-lg text-sm text-slate300"
            >
              <span className="truncate">{filters[filter]}</span>
              <IoIosArrowDown className={`text-slate400 w-3 h-3 shrink-0 transition-transform ${openDropdown === filter ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === filter && (
              <div className="absolute top-full left-0 mt-2 w-full bg-black600 border border-black300 rounded-lg shadow-xl z-10 py-1">
                {filterOptions[filter].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, [filter]: opt }));
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-black300 transition-colors ${filters[filter] === opt ? 'text-white bg-black300/50' : 'text-slate300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <div className="flex-1 min-w-[100px] max-w-[120px] self-end">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent border border-black300 rounded-lg text-sm text-slate300 hover:bg-black300 transition-colors">
              <FiUpload /> Export
            </button>
        </div>
      </div>

      {/* Table & Mobile View */}
      <div className="bg-blue400 border border-black300/50 rounded-xl overflow-x-auto mt-2 shadow-sm">
        {/* Desktop Table */}
        <table className="hidden md:table w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-black300 bg-transparent">
              <th className="p-4 pl-6 w-12"><input type="checkbox" className="w-4 h-4 rounded border-slate600 bg-transparent accent-orange100" /></th>
              <th className="p-4 text-xs font-medium text-slate300">Comments</th>
              <th className="p-4 text-xs font-medium text-slate300">User</th>
              <th className="p-4 text-xs font-medium text-slate300">Video / Content</th>
              <th className="p-4 text-xs font-medium text-slate300">Status</th>
              <th className="p-4 text-xs font-medium text-slate300">Reported By</th>
              <th className="p-4 text-xs font-medium text-slate300">Date</th>
              <th className="p-4 text-xs font-medium text-slate300 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComments.map((comment, i) => (
              <tr 
                key={i} 
                onClick={() => setSelectedComment(comment)}
                className="border-b border-black300/50 hover:bg-black300/30 transition-colors cursor-pointer"
              >
                <td className="p-4 pl-6" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="w-4 h-4 rounded border-slate600 bg-transparent accent-orange100 cursor-pointer" />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3 max-w-[200px]">
                    <img src={comment.user.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium text-white truncate">You peo...</span>
                      <span className="text-xs text-slate400 truncate">{comment.user.username}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={comment.user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-white">{comment.user.name}</span>
                        {comment.user.verified && <MdVerified className="text-cyan200 w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs text-slate400">{comment.user.followers}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black300 rounded shrink-0 overflow-hidden">
                        <img src="/story3.jpg" className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{comment.video.title}</span>
                      <span className="text-xs text-slate400">{comment.video.id}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                    comment.status === 'Approved' ? 'bg-green500/10 text-green500 border-green500/20' :
                    comment.status === 'Pending Review' ? 'bg-brown100 text-orange500 border-orange500/20' :
                    'bg-red500/10 text-red500 border-red500/20'
                  }`}>
                    {comment.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate300">{comment.reportedBy}</td>
                <td className="p-4 text-sm text-slate300">{comment.date}</td>
                <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <button className="text-slate400 hover:text-white transition-colors cursor-pointer p-1">
                    <FiMoreVertical className="w-4 h-4 mx-auto" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Mobile View */}
        <div className="flex md:hidden flex-col gap-3 p-4">
          {filteredComments.map((comment, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedComment(comment)}
              className="bg-blue300 border border-black300 rounded-xl p-4 flex flex-col gap-4 cursor-pointer hover:bg-black300/30 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img src={comment.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-white">{comment.user.name}</span>
                      {comment.user.verified && <MdVerified className="text-cyan200 w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs text-slate400">{comment.commentText.substring(0, 20)}...</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    comment.status === 'Approved' ? 'bg-green500/10 text-green500 border-green500/20' :
                    comment.status === 'Pending Review' ? 'bg-brown100 text-orange500 border-orange500/20' :
                    'bg-red500/10 text-red500 border-red500/20'
                  }`}>
                    {comment.status}
                  </span>
                  <button className="text-slate400 hover:text-white transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <FiMoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-black300">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate500 font-semibold uppercase tracking-wider">Video</span>
                  <span className="text-xs text-slate300">{comment.video.title}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate500 font-semibold uppercase tracking-wider">Reported By</span>
                  <span className="text-xs text-slate300">{comment.reportedBy || "None"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate500 font-semibold uppercase tracking-wider">Date</span>
                  <span className="text-xs text-slate300">{comment.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {isLoading && (
          <div className="p-6 text-center text-sm text-slate400">Loading moderation cases…</div>
        )}
        {!isLoading && errorMessage && (
          <div className="p-6 text-center text-sm text-red500">{errorMessage}</div>
        )}
        {!isLoading && !errorMessage && filteredComments.length === 0 && (
          <div className="p-6 text-center text-sm text-slate400">No comments found.</div>
        )}

        {/* Pagination */}
        <div className="p-4 px-6 flex items-center justify-between border-t border-black300/50 bg-transparent">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="px-6 py-2 border border-orange100 rounded-md text-sm font-medium text-white hover:bg-orange100/10 transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <span className="text-sm text-slate400">Page {pageMeta.currentPage || page} of {pageMeta.lastPage || 1}</span>
          <button
            onClick={() => setPage((p) => Math.min(pageMeta.lastPage || 1, p + 1))}
            disabled={(pageMeta.currentPage || page) >= (pageMeta.lastPage || 1) || isLoading}
            className="px-6 py-2 bg-orange100 rounded-md text-sm font-medium text-black hover:bg-orange400 transition-colors disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      
      {/* Sidebar */}
      <CommentDetailsSidebar
        comment={selectedComment}
        onClose={() => setSelectedComment(null)}
        onAction={handleModerationAction}
      />
    </div>
  );
}
