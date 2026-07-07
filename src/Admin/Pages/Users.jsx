import React, { useState } from "react";
import { FiUpload, FiSearch, FiCalendar, FiMoreVertical, FiArrowUp } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import UserDetailsSidebar from "../components/Users/UserDetailsSidebar";

const stats = [
  { title: "Total Users", value: "125.6M", trend: "+12.5%", trendUp: true },
  { title: "Active Users", value: "7.23M", trend: "+12.5%", trendUp: true },
  { title: "New Users (Today)", value: "8.64M", trend: "+12.5%", trendUp: true },
  { title: "Suspended Users", value: "1,100", trend: "+12.5%", trendUp: true },
];

const tabs = [
  { name: "All Users", count: "10.2M", active: true },
  { name: "Active Users", count: "8.7M", active: false },
  { name: "Suspended Users", count: "45.3K", active: false },
  { name: "Banned Users", count: "23.1K", active: false },
  { name: "Pending Verification", count: "12.5K", active: false },
  { name: "Appeals", count: "8.7M", active: false },
];

const filterOptions = {
  "User Type": ["All", "Creator", "Viewer", "Admin"],
  "Account Status": ["All", "Active", "Suspended", "Banned"],
  "Country": ["All", "US", "UK", "Canada", "Nigeria"]
};

const userTypes = ["Creator", "Viewer", "Admin"];
const countries = ["US", "UK", "Canada", "Nigeria"];

const usersData = Array(10).fill({
  name: "Aisha Doe",
  username: "@aishadoe",
  verified: true,
  id: "1234567890",
  followers: "2.4M",
  joinedDate: "May 26, 2026",
  lastActive: "2 min ago",
}).map((u, i) => ({
  ...u,
  id: u.id.slice(0, -1) + i,
  status: i % 3 === 0 ? "Active" : i % 3 === 1 ? "Suspended" : "Banned",
  userType: userTypes[i % 3],
  country: countries[i % 4],
}));

export default function Users() {
  const [activeTab, setActiveTab] = useState("All Users");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    "User Type": "All",
    "Account Status": "All",
    "Country": "All"
  });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = usersData.filter((user) => {
    // Tab filter
    if (activeTab === "Active Users" && user.status !== "Active") return false;
    if (activeTab === "Suspended Users" && user.status !== "Suspended") return false;
    if (activeTab === "Banned Users" && user.status !== "Banned") return false;
    if (activeTab === "Pending Verification" && user.status !== "Pending") return false;
    if (activeTab === "Appeals" && user.status !== "Appealed") return false;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!user.name.toLowerCase().includes(q) && 
          !user.username.toLowerCase().includes(q) && 
          !user.id.includes(q)) {
        return false;
      }
    }

    // Dropdown filters
    if (filters["User Type"] !== "All" && user.userType !== filters["User Type"]) return false;
    if (filters["Account Status"] !== "All" && user.status !== filters["Account Status"]) return false;
    if (filters["Country"] !== "All" && user.country !== filters["Country"]) return false;

    return true;
  });

  return (
    <div className="flex flex-col gap-6 text-white font-inter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and monitor platform users</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-zinc-700 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors">
            <FiUpload /> Export
          </button>
          <button className="bg-orange100 text-black px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-500 transition-colors">
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-blue200 rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="text-xs text-slate-400 font-semibold">{stat.title}</h3>
            <span className="text-3xl font-semibold">{stat.value}</span>
            <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
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
                ? "bg-[#251010] border-[#5a2121] text-white"
                : "bg-transparent border-zinc-700 text-slate-400 hover:bg-zinc-800"
            }`}
          >
            {tab.name}
            <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
              activeTab === tab.name ? "border-[#5a2121] bg-transparent text-slate-300" : "border-zinc-700 bg-transparent text-slate-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-zinc-800 rounded-lg flex-1 min-w-[250px]">
          <FiSearch className="text-zinc-500 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username, ID or email"
            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-zinc-500"
          />
        </div>
        
        {Object.keys(filterOptions).map((filter) => (
          <div key={filter} className="relative">
            <button 
              onClick={() => setOpenDropdown(openDropdown === filter ? null : filter)}
              className="flex items-center justify-between gap-3 px-4 py-2.5 bg-transparent border border-zinc-800 rounded-lg text-sm text-slate-400 min-w-[150px]"
            >
              <span className="text-zinc-500">{filter}</span>
              <span className="text-white flex items-center gap-1">
                {filters[filter]} <IoIosArrowDown className={`text-zinc-400 w-3 h-3 transition-transform ${openDropdown === filter ? 'rotate-180' : ''}`} />
              </span>
            </button>
            {openDropdown === filter && (
              <div className="absolute top-full left-0 mt-2 w-full bg-[#131313] border border-zinc-800 rounded-lg shadow-xl z-10 py-1">
                {filterOptions[filter].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, [filter]: opt }));
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-800 transition-colors ${filters[filter] === opt ? 'text-white bg-zinc-800/50' : 'text-slate-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <button className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-zinc-800 rounded-lg text-sm text-slate-400">
          Join Date <FiCalendar className="w-4 h-4" />
        </button>
      </div>

      {/* Table & Mobile View */}
      <div className="bg-blue200 rounded-2xl overflow-x-auto mt-2">
        {/* Desktop Table */}
        <table className="hidden md:table w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-zinc-800 bg-transparent">
              <th className="p-4 pl-6 w-12"><input type="checkbox" className="w-4 h-4 rounded border-zinc-600 bg-transparent accent-orange100" /></th>
              <th className="p-4 text-xs font-medium text-slate-300">User</th>
              <th className="p-4 text-xs font-medium text-slate-300">User ID</th>
              <th className="p-4 text-xs font-medium text-slate-300">Status</th>
              <th className="p-4 text-xs font-medium text-slate-300">Followers</th>
              <th className="p-4 text-xs font-medium text-slate-300">Joined Date</th>
              <th className="p-4 text-xs font-medium text-slate-300">Last Active</th>
              <th className="p-4 text-xs font-medium text-slate-300 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, i) => (
              <tr 
                key={i} 
                onClick={() => setSelectedUser(user)}
                className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors cursor-pointer"
              >
                <td className="p-4 pl-6" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="w-4 h-4 rounded border-zinc-600 bg-transparent accent-orange100 cursor-pointer" />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src="/story3.jpg" alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-white">{user.name}</span>
                        {user.verified && <MdVerified className="text-blue-500 w-4 h-4" />}
                      </div>
                      <span className="text-xs text-slate-400">{user.username}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-300">{user.id}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    user.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    user.status === 'Suspended' ? 'bg-[#3b210e] text-orange-500 border-orange-500/20' :
                    'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-300">{user.followers}</td>
                <td className="p-4 text-sm text-slate-300">{user.joinedDate}</td>
                <td className="p-4 text-sm text-green-500">{user.lastActive}</td>
                <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <button className="text-slate-400 hover:text-white transition-colors cursor-pointer">
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
              className="bg-[#131313] border border-zinc-800 rounded-xl p-4 flex flex-col gap-4 cursor-pointer hover:bg-zinc-800/30 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img src="/story3.jpg" alt="" className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-white">{user.name}</span>
                      {user.verified && <MdVerified className="text-blue-500 w-4 h-4" />}
                    </div>
                    <span className="text-xs text-slate-400">{user.username}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    user.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    user.status === 'Suspended' ? 'bg-[#3b210e] text-orange-500 border-orange-500/20' :
                    'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {user.status}
                  </span>
                  <button className="text-slate-400 hover:text-white transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <FiMoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-zinc-800">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">User ID</span>
                  <span className="text-xs text-slate-300">{user.id}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Followers</span>
                  <span className="text-xs text-slate-300">{user.followers}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Joined Date</span>
                  <span className="text-xs text-slate-300">{user.joinedDate}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Last Active</span>
                  <span className="text-xs text-green-500">{user.lastActive}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="p-4 px-6 flex items-center justify-between border-t border-zinc-800 bg-blue200">
          <button className="px-6 py-2 border border-zinc-700 rounded-md text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
            Back
          </button>
          <span className="text-sm text-slate-400">Step 2 of 5</span>
          <button className="px-6 py-2 bg-orange100 rounded-md text-sm font-medium text-black hover:bg-orange-400 transition-colors">
            Next
          </button>
        </div>
      </div>
      
      {/* Sidebar */}
      <UserDetailsSidebar user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
