import React, { useState } from "react";
import { FiX, FiEye, FiSend, FiDownload, FiXCircle } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";

export default function UserDetailsSidebar({ user, onClose }) {
  const [activeTab, setActiveTab] = useState("All Users");
  
  if (!user) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[450px] bg-blue400 border-l border-zinc-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
        
        {/* Header */}
        <div className="flex justify-end p-4 shrink-0">
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-0 font-inter" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          
          {/* Profile Overview */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img src="/story3.jpg" alt={user.name} className="w-24 h-24 rounded-full object-cover border-2 border-transparent" />
              {user.verified && (
                <div className="absolute bottom-0 right-0 bg-blue200 rounded-full p-0.5">
                  <MdVerified className="w-6 h-6 text-blue-500" />
                </div>
              )}
            </div>
            <h2 className="text-lg font-semibold text-white mt-4">{user.name}</h2>
            <p className="text-sm text-slate-400 mb-6">{user.username}</p>

            <div className="flex items-center gap-8 mb-6">
              <div className="flex flex-col items-center gap-1">
                <span className="text-white font-semibold">134</span>
                <span className="text-slate-400 text-xs">Videos</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-white font-semibold">1.5M</span>
                <span className="text-slate-400 text-xs">Followers</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-white font-semibold">100</span>
                <span className="text-slate-400 text-xs">Following</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#2A2A2A] text-slate-300 px-4 py-2 rounded-md text-xs flex items-center gap-2 font-medium">
                <FaHeart className="text-red-500 w-3.5 h-3.5" /> 2.4M total likes
              </div>
              <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-8 py-2 rounded-md text-xs font-medium">
                Active
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800/50 mb-6">
            {["All Users", "Active Users", "Suspended Users"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                  activeTab === tab 
                    ? "border-red-500 text-white" 
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* User Information */}
          <div className="bg-blue300 rounded-xl p-5 mb-5 border border-zinc-800/50">
            <h3 className="text-sm font-medium text-white mb-2">User Information</h3>
            <div className="flex flex-col">
              <div className="flex justify-between items-center py-4 border-b border-zinc-800">
                <span className="text-slate-300 text-xs font-medium">User ID</span>
                <span className="text-white text-xs font-medium">{user.id}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-zinc-800">
                <span className="text-slate-300 text-xs font-medium">Email Address</span>
                <span className="text-white text-xs font-medium">zara@gmail.com</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-zinc-800">
                <span className="text-slate-300 text-xs font-medium">Phone Number</span>
                <span className="text-white text-xs font-medium">08100000000</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-zinc-800">
                <span className="text-slate-300 text-xs font-medium">Country/Region</span>
                <span className="text-white text-xs font-medium">{user.country || "Nigeria"}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-zinc-800">
                <span className="text-slate-300 text-xs font-medium">Joined Date</span>
                <span className="text-white text-xs font-medium">{user.joinedDate}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-zinc-800">
                <span className="text-slate-300 text-xs font-medium">Last Active</span>
                <span className="text-white text-xs font-medium">{user.lastActive}</span>
              </div>
              <div className="flex justify-between items-center py-4 pt-4">
                <span className="text-slate-300 text-xs font-medium">Device</span>
                <span className="text-white text-xs font-medium">iPhone 13 iOS 27.2</span>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-blue300 rounded-xl p-5 mb-5 border border-zinc-800/50">
            <h3 className="text-sm font-medium text-white mb-2">Account Status</h3>
            <div className="flex flex-col">
              <div className="flex justify-between items-center py-4 border-b border-zinc-800">
                <span className="text-slate-300 text-xs font-medium">Status</span>
                <span className="text-white text-xs font-medium">{user.status}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-zinc-800">
                <span className="text-slate-300 text-xs font-medium">Verification</span>
                <span className="text-[#3b82f6] text-xs font-medium flex items-center gap-1">
                  Verified Creator <MdVerified className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-zinc-800">
                <span className="text-slate-300 text-xs font-medium">Account Health</span>
                <span className="text-green-500 text-xs font-medium">Good</span>
              </div>
              <div className="flex justify-between items-center py-4 pt-4">
                <span className="text-slate-300 text-xs font-medium">Restrictions</span>
                <span className="text-white text-xs font-medium">None</span>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-blue300 rounded-xl p-5 pb-6 border border-zinc-800/50">
            <h3 className="text-sm font-medium text-white mb-4">Account Status</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button className="flex items-center justify-center gap-2 py-2.5 bg-transparent border border-zinc-700 rounded-md text-slate-300 text-xs font-medium hover:bg-zinc-800 transition-colors">
                <FiEye className="w-3.5 h-3.5" /> View Profile
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 bg-transparent border border-zinc-700 rounded-md text-slate-300 text-xs font-medium hover:bg-zinc-800 transition-colors">
                <FiSend className="w-3.5 h-3.5" /> Send Message
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button className="flex items-center justify-center gap-2 py-2.5 bg-transparent border border-orange-500/30 rounded-md text-orange-500 text-xs font-medium hover:bg-orange-500/10 transition-colors">
                <FiDownload className="w-3.5 h-3.5" /> Suspended Account
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 bg-transparent border border-red-500/30 rounded-md text-red-500 text-xs font-medium hover:bg-red-500/10 transition-colors">
                <FiXCircle className="w-3.5 h-3.5" /> Ban Account
              </button>
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-transparent border border-zinc-700 rounded-md text-slate-300 text-xs font-medium hover:bg-zinc-800 transition-colors">
              More Actions <IoIosArrowDown className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
