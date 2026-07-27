import React, { useEffect, useMemo, useState } from "react";
import { FiUpload, FiSearch, FiMoreVertical, FiArrowUp } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineCalendarToday } from "react-icons/md";
import ReportDetailsSidebar from "../components/Reports/ReportDetailsSidebar";
import { api } from "../../services/api";

const filterOptions = {
  "Types": ["All Types", "Video", "Live Stream"],
  "Reasons": ["All Reasons", "Nudity", "Harassment", "Spam", "Violence", "Other"],
  "Status": ["All Statuses", "Pending Review", "Resolved", "Dismissed"],
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
  if (status === "resolved") return "Resolved";
  if (status === "dismissed") return "Dismissed";
  return status || "Pending Review";
}

function normalizeReport(r) {
  const video = r.video || {};
  const reporter = r.reporter || {};
  return {
    id: `RPT-${r.id}`,
    rawId: r.id,
    contentTitle: video.title || video.caption || "Untitled",
    contentId: `ID: VID-${video.id ?? "—"}`,
    type: video.isLive ? "Live Stream" : "Video",
    reason: r.reason || "Other",
    reporterName: reporter.fullName || reporter.username || "Unknown",
    reporterHandle: reporter.username ? `@${reporter.username}` : "",
    status: displayStatus(r.status),
    reportedAt: formatDate(r.createdAt),
    details: r.details,
    resolutionNotes: r.resolutionNotes,
  };
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [filters, setFilters] = useState({
    "Types": "All Types",
    "Reasons": "All Reasons",
    "Status": "All Statuses",
  });
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const statusParam = useMemo(() => {
    if (activeTab === "pending") return "pending";
    if (activeTab === "resolved") return "resolved";
    if (activeTab === "dismissed") return "dismissed";
    if (filters["Status"] === "Pending Review") return "pending";
    if (filters["Status"] === "Resolved") return "resolved";
    if (filters["Status"] === "Dismissed") return "dismissed";
    return "";
  }, [activeTab, filters]);

  useEffect(() => { setPage(1); }, [activeTab, filters]);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setErrorMessage("");
    api.getAdminVideoReports({ status: statusParam, page, perPage: 12 })
      .then((response) => {
        if (cancelled) return;
        const raw = response?.data?.reports || [];
        setReports(raw.map(normalizeReport));
        setPageMeta(response?.meta?.reports || { currentPage: 1, lastPage: 1, total: raw.length });
      })
      .catch((err) => { if (!cancelled) setErrorMessage(err?.message || "Failed to load reports"); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [statusParam, page, refreshKey]);

  async function handleReportAction(id, payload) {
    await api.updateAdminVideoReport(id, payload);
    setRefreshKey((k) => k + 1);
  }

  const totalReports = pageMeta.total || 0;
  const stats = [
    { title: "Total Reports", value: `${totalReports}`, trend: "+12.5%", trendUp: true, vs: "last 7 days" },
    { title: "Pending Review", value: statusParam === "pending" ? `${totalReports}` : "—", trend: "+12.5%", trendUp: true, vs: "yesterday" },
    { title: "Resolved", value: statusParam === "resolved" ? `${totalReports}` : "—", trend: "+12.5%", trendUp: true, vs: "last 7 days" },
    { title: "Dismissed", value: statusParam === "dismissed" ? `${totalReports}` : "—", trend: "+12.5%", trendUp: true, vs: "last 7 days" },
    { title: "Appeals", value: "0", trend: "+0%", trendUp: true, vs: "last 7 days" },
  ];

  const tabs = [
    { name: "All Reports", id: "all" },
    { name: `Pending${statusParam === "pending" ? ` (${totalReports})` : ""}`, id: "pending" },
    { name: "Resolved", id: "resolved" },
    { name: "Dismissed", id: "dismissed" },
    { name: "Appeals", id: "appeals" },
  ];

  const filteredReports = reports.filter((report) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!report.reporterName.toLowerCase().includes(q) &&
          !report.reporterHandle.toLowerCase().includes(q) &&
          !report.id.toLowerCase().includes(q) &&
          !report.contentTitle.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filters["Types"] !== "All Types" && report.type !== filters["Types"]) return false;
    if (filters["Reasons"] !== "All Reasons" && report.reason?.toLowerCase() !== filters["Reasons"].toLowerCase()) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 text-white font-inter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-slate400 mt-1">Review and take action on content and user reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-slate700 rounded-md text-sm font-medium hover:bg-black300 transition-colors">
            <FiUpload /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-col-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 overflow-x-auto pb-2 gap-4 hide-scrollbar">
        {stats.map((stat, i) => (
          <div key={i} className="bg-black700 border border-black300 rounded-xl p-5 flex flex-col gap-3 min-w-[200px] flex-1">
            <h3 className="text-xs text-slate400 font-semibold">{stat.title}</h3>
            <span className="text-3xl font-semibold">{stat.value}</span>
            <div className={`flex items-center gap-1 text-[11px] font-medium ${stat.trendUp ? 'text-green500' : 'text-red500'}`}>
              <FiArrowUp className="w-3 h-3" />
              <span>{stat.trend} vs {stat.vs}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-black300 pb-[1px] overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-sm pb-3 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.id ? "text-white" : "text-slate400 hover:text-slate300"
            }`}
          >
            {tab.name}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red600 rounded-t-sm" />
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-black300 rounded-lg flex-1 min-w-[250px] h-[42px]">
          <FiSearch className="text-slate500 w-4 h-4 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username, ID or email"
            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-slate500"
          />
        </div>

        {Object.keys(filterOptions).map((filter) => (
          <div key={filter} className="relative flex flex-col gap-1.5">
            <span className="text-xs text-slate400 ml-1">{filter}</span>
            <button 
              onClick={() => setOpenDropdown(openDropdown === filter ? null : filter)}
              className="flex items-center justify-between gap-3 px-4 py-2 bg-transparent border border-black300 rounded-lg text-sm text-slate300 min-w-[160px] h-[42px]"
            >
              <span className="truncate">{filters[filter]}</span>
              <IoIosArrowDown className={`text-slate400 w-4 h-4 shrink-0 transition-transform ${openDropdown === filter ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === filter && (
              <div className="absolute top-full left-0 mt-2 w-full bg-black600 border border-black300 rounded-lg shadow-xl z-20 py-1 max-h-60 overflow-y-auto">
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
        
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-slate400 ml-1">Date</span>
          <button className="flex items-center justify-between gap-3 px-4 py-2 bg-transparent border border-black300 rounded-lg text-sm text-slate400 min-w-[180px] h-[42px]">
            <span className="truncate">Select date range</span>
            <MdOutlineCalendarToday className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-black700 border border-black300 rounded-xl overflow-x-auto mt-2 pb-2">
        {/* Desktop Table */}
        <table className="hidden md:table w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-black300 bg-transparent">
              <th className="p-4 pl-6 w-12"><input type="checkbox" className="w-4 h-4 rounded border-slate600 bg-transparent accent-orange100" /></th>
              <th className="p-4 text-xs font-medium text-slate300">Report ID</th>
              <th className="p-4 text-xs font-medium text-slate300">Content</th>
              <th className="p-4 text-xs font-medium text-slate300">Type</th>
              <th className="p-4 text-xs font-medium text-slate300">Reason</th>
              <th className="p-4 text-xs font-medium text-slate300">Reporter</th>
              <th className="p-4 text-xs font-medium text-slate300">Status</th>
              <th className="p-4 text-xs font-medium text-slate300">Reported At</th>
              <th className="p-4 text-xs font-medium text-slate300 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report, i) => (
              <tr 
                key={i} 
                onClick={() => setSelectedReport(report)}
                className={`border-b border-black300 hover:bg-black300/30 transition-colors cursor-pointer ${selectedReport === report ? 'bg-black300/20 border-l-2 border-l-cyan200' : 'border-l-2 border-l-transparent'}`}
              >
                <td className="p-4 pl-6" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="w-4 h-4 rounded border-slate600 bg-transparent accent-orange100 cursor-pointer" />
                </td>
                <td className="p-4 text-sm text-slate300">{report.id}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate700 rounded flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{report.contentTitle}</span>
                      <span className="text-[10px] text-slate500">{report.contentId}</span>
                    </div>
                  </div>
                </td>
                <td className={`p-4 text-sm font-medium ${report.type === 'Video' ? 'text-[#CB3CFF]' : 'text-red500'}`}>
                  {report.type}
                </td>
                <td className="p-4 text-sm text-slate300">{report.reason}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <img src="/story3.jpg" alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex flex-col">
                      <span className="text-sm text-white">{report.reporterName}</span>
                      <span className="text-[10px] text-slate500">{report.reporterHandle}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                    report.status === 'Resolved' ? 'bg-[#0ea759]/10 text-[#0ea759] border-[#0ea759]/20' :
                    report.status === 'Pending Review' ? 'bg-[#ff8d28]/10 text-[#ff8d28] border-[#ff8d28]/20' :
                    'bg-slate-500/10 text-slate400 border-slate-500/20'
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate300">{report.reportedAt}</td>
                <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <button className="text-slate400 hover:text-white transition-colors cursor-pointer">
                    <FiMoreVertical className="w-5 h-5 mx-auto" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Mobile View */}
        <div className="flex md:hidden flex-col gap-3 p-4">
          {filteredReports.map((report, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedReport(report)}
              className="bg-black600 border border-black300 rounded-xl p-4 flex flex-col gap-4 cursor-pointer hover:bg-black300/30 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate700 rounded flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{report.contentTitle}</span>
                    <span className="text-[10px] text-slate500">{report.contentId}</span>
                  </div>
                </div>
                <button className="text-slate400 hover:text-white transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <FiMoreVertical className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-black300">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate500 font-semibold uppercase tracking-wider">Type</span>
                  <span className={`text-xs font-medium ${report.type === 'Video' ? 'text-[#CB3CFF]' : 'text-red500'}`}>{report.type}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate500 font-semibold uppercase tracking-wider">Reason</span>
                  <span className="text-xs text-slate300">{report.reason}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate500 font-semibold uppercase tracking-wider">Reporter</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <img src="/story3.jpg" alt="" className="w-4 h-4 rounded-full object-cover" />
                    <span className="text-xs text-slate300">{report.reporterName}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate500 font-semibold uppercase tracking-wider">Status</span>
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${
                      report.status === 'Resolved' ? 'bg-[#0ea759]/10 text-[#0ea759] border-[#0ea759]/20' :
                      report.status === 'Pending Review' ? 'bg-[#ff8d28]/10 text-[#ff8d28] border-[#ff8d28]/20' :
                      'bg-slate-500/10 text-slate400 border-slate-500/20'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {isLoading && (
          <div className="p-6 text-center text-sm text-slate400">Loading reports…</div>
        )}
        {!isLoading && errorMessage && (
          <div className="p-6 text-center text-sm text-red500">{errorMessage}</div>
        )}
        {!isLoading && !errorMessage && filteredReports.length === 0 && (
          <div className="p-6 text-center text-sm text-slate400">No reports found.</div>
        )}

        {/* Pagination */}
        <div className="p-4 px-6 flex items-center justify-between border-t border-black300 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="px-6 py-2 bg-transparent border border-orange100 rounded-md text-sm font-medium text-white hover:bg-orange100/10 transition-colors disabled:opacity-50"
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
      {selectedReport && (
        <ReportDetailsSidebar
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onAction={handleReportAction}
        />
      )}
    </div>
  );
}
