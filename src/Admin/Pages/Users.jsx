import React, { useEffect, useMemo, useState } from "react";
import { FiUpload, FiSearch, FiCalendar, FiMoreVertical, FiArrowUp } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import UserDetailsSidebar from "../components/Users/UserDetailsSidebar";
import { api } from "../../services/api";

const filterOptions = {
  "User Type": ["All", "Creator", "Admin", "Member"],
  "Account Status": ["All", "Active", "Suspended"],
};

function formatCount(value) {
  const num = Number(value) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

function formatJoinedDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function formatLastActive(iso, isOnline) {
  if (isOnline) return "Online";
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function displayStatus(accountStatus) {
  if (accountStatus === "suspended") return "Suspended";
  return "Active";
}

function normalizeUser(u) {
  return {
    id: u.id,
    name: u.fullName || u.username,
    username: u.username ? `@${u.username}` : "",
    verified: Boolean(u.isVerifiedCreator),
    followers: formatCount(u.stats?.subscribersCount),
    joinedDate: formatJoinedDate(u.createdAt),
    lastActive: formatLastActive(u.lastActiveAt, u.isOnline),
    status: displayStatus(u.accountStatus),
    userType: u.isAdmin ? "Admin" : (u.stats?.videosCount ?? 0) > 0 ? "Creator" : "Member",
    avatarUrl: u.avatarUrl,
    email: u.email,
    accountStatus: u.accountStatus,
    accountStatusNotes: u.accountStatusNotes,
    isAdmin: u.isAdmin,
    stats: u.stats,
  };
}

export default function Users() {
  const [activeTab, setActiveTab] = useState("All Users");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    "User Type": "All",
    "Account Status": "All",
  });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ totalUsers: 0, adminUsers: 0, suspendedUsers: 0, creatorUsers: 0 });
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const accountStatusParam = useMemo(() => {
    if (activeTab === "Suspended Users") return "suspended";
    if (activeTab === "Active Users") return "active";
    if (filters["Account Status"] === "Suspended") return "suspended";
    if (filters["Account Status"] === "Active") return "active";
    return "";
  }, [activeTab, filters]);

  const roleParam = useMemo(() => {
    const type = filters["User Type"];
    if (type === "Admin") return "admin";
    if (type === "Creator") return "creator";
    if (type === "Member") return "member";
    return "";
  }, [filters]);

  useEffect(() => { setPage(1); }, [activeTab, filters, searchQuery]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setErrorMessage("");
    api.getAdminUsers({ q: searchQuery, accountStatus: accountStatusParam, role: roleParam, page, perPage: 12 })
      .then((response) => {
        if (cancelled) return;
        const payload = response?.data || {};
        const rawUsers = payload.users || [];
        setUsers(rawUsers.map(normalizeUser));
        setSummary(response?.meta?.summary || summary);
        setPageMeta(response?.meta?.users || { currentPage: 1, lastPage: 1, total: rawUsers.length });
      })
      .catch((err) => { if (!cancelled) setErrorMessage(err?.message || "Failed to load users"); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, accountStatusParam, roleParam, page]);

  const stats = [
    { title: "Total Users", value: formatCount(summary.totalUsers), trend: "+12.5%", trendUp: true },
    { title: "Active Users", value: formatCount((summary.totalUsers || 0) - (summary.suspendedUsers || 0)), trend: "+12.5%", trendUp: true },
    { title: "Creators", value: formatCount(summary.creatorUsers), trend: "+12.5%", trendUp: true },
    { title: "Suspended Users", value: formatCount(summary.suspendedUsers), trend: "+12.5%", trendUp: true },
  ];

  const tabs = [
    { name: "All Users", count: formatCount(summary.totalUsers) },
    { name: "Active Users", count: formatCount((summary.totalUsers || 0) - (summary.suspendedUsers || 0)) },
    { name: "Suspended Users", count: formatCount(summary.suspendedUsers) },
    { name: "Banned Users", count: "0" },
    { name: "Pending Verification", count: "0" },
    { name: "Appeals", count: "0" },
  ];

  const filteredUsers = users;

  return (
    <div className="flex flex-col gap-6 text-white font-inter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-slate400 mt-1">Manage and monitor platform users</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-slate700 rounded-md text-sm font-medium hover:bg-black300 transition-colors">
            <FiUpload /> Export
          </button>
          <button className="bg-orange100 text-black px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange500 transition-colors">
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-blue200 rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="text-xs text-slate400 font-semibold">{stat.title}</h3>
            <span className="text-3xl font-semibold">{stat.value}</span>
            <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-green500' : 'text-red500'}`}>
              <FiArrowUp className="w-3 h-3" />
              <span>{stat.trend} vs last 7 days</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-3 pb-2">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              activeTab === tab.name
                ? "bg-[#251010] border-brown300 text-white"
                : "bg-transparent border-slate700 text-slate400 hover:bg-black300"
            }`}
          >
            {tab.name}
            <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
              activeTab === tab.name ? "border-brown300 bg-transparent text-slate300" : "border-slate700 bg-transparent text-slate500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-black300 rounded-lg flex-1 min-w-[250px]">
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
          <div key={filter} className="relative">
            <button 
              onClick={() => setOpenDropdown(openDropdown === filter ? null : filter)}
              className="flex items-center justify-between gap-3 px-4 py-2.5 bg-transparent border border-black300 rounded-lg text-sm text-slate400 min-w-[150px]"
            >
              <span className="text-slate500">{filter}</span>
              <span className="text-white flex items-center gap-1">
                {filters[filter]} <IoIosArrowDown className={`text-slate400 w-3 h-3 transition-transform ${openDropdown === filter ? 'rotate-180' : ''}`} />
              </span>
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
        
        <button className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-black300 rounded-lg text-sm text-slate400">
          Join Date <FiCalendar className="w-4 h-4" />
        </button>
      </div>

      {/* Table & Mobile View */}
      <div className="bg-blue200 rounded-2xl overflow-x-auto mt-2">
        {/* Desktop Table */}
        <table className="hidden md:table w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-black300 bg-transparent">
              <th className="p-4 pl-6 w-12"><input type="checkbox" className="w-4 h-4 rounded border-slate600 bg-transparent accent-orange100" /></th>
              <th className="p-4 text-xs font-medium text-slate300">User</th>
              <th className="p-4 text-xs font-medium text-slate300">User ID</th>
              <th className="p-4 text-xs font-medium text-slate300">Status</th>
              <th className="p-4 text-xs font-medium text-slate300">Followers</th>
              <th className="p-4 text-xs font-medium text-slate300">Joined Date</th>
              <th className="p-4 text-xs font-medium text-slate300">Last Active</th>
              <th className="p-4 text-xs font-medium text-slate300 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, i) => (
              <tr 
                key={i} 
                onClick={() => setSelectedUser(user)}
                className="border-b border-black300 hover:bg-black300/30 transition-colors cursor-pointer"
              >
                <td className="p-4 pl-6" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="w-4 h-4 rounded border-slate600 bg-transparent accent-orange100 cursor-pointer" />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src="/story3.jpg" alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-white">{user.name}</span>
                        {user.verified && <MdVerified className="text-cyan200 w-4 h-4" />}
                      </div>
                      <span className="text-xs text-slate400">{user.username}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate300">{user.id}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    user.status === 'Active' ? 'bg-green500/10 text-green500 border-green500/20' :
                    user.status === 'Suspended' ? 'bg-brown100 text-orange500 border-orange500/20' :
                    'bg-red500/10 text-red500 border-red500/20'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate300">{user.followers}</td>
                <td className="p-4 text-sm text-slate300">{user.joinedDate}</td>
                <td className="p-4 text-sm text-green500">{user.lastActive}</td>
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
          {filteredUsers.map((user, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedUser(user)}
              className="bg-black600 border border-black300 rounded-xl p-4 flex flex-col gap-4 cursor-pointer hover:bg-black300/30 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img src="/story3.jpg" alt="" className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-white">{user.name}</span>
                      {user.verified && <MdVerified className="text-cyan200 w-4 h-4" />}
                    </div>
                    <span className="text-xs text-slate400">{user.username}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    user.status === 'Active' ? 'bg-green500/10 text-green500 border-green500/20' :
                    user.status === 'Suspended' ? 'bg-brown100 text-orange500 border-orange500/20' :
                    'bg-red500/10 text-red500 border-red500/20'
                  }`}>
                    {user.status}
                  </span>
                  <button className="text-slate400 hover:text-white transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <FiMoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-black300">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate500 font-semibold uppercase tracking-wider">User ID</span>
                  <span className="text-xs text-slate300">{user.id}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate500 font-semibold uppercase tracking-wider">Followers</span>
                  <span className="text-xs text-slate300">{user.followers}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate500 font-semibold uppercase tracking-wider">Joined Date</span>
                  <span className="text-xs text-slate300">{user.joinedDate}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate500 font-semibold uppercase tracking-wider">Last Active</span>
                  <span className="text-xs text-green500">{user.lastActive}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {isLoading && (
          <div className="p-6 text-center text-sm text-slate400">Loading users…</div>
        )}
        {!isLoading && errorMessage && (
          <div className="p-6 text-center text-sm text-red500">{errorMessage}</div>
        )}
        {!isLoading && !errorMessage && filteredUsers.length === 0 && (
          <div className="p-6 text-center text-sm text-slate400">No users found.</div>
        )}

        {/* Pagination */}
        <div className="p-4 px-6 flex items-center justify-between border-t border-black300 bg-blue200">
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
      <UserDetailsSidebar user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
