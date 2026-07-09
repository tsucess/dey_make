import React from "react";
import { FiX, FiEye, FiDownload, FiCheck, FiAlertTriangle, FiTrash2, FiUser, FiInfo } from "react-icons/fi";
import { MdOutlineOndemandVideo } from "react-icons/md";

export default function ReportDetailsSidebar({ report, onClose }) {
  if (!report) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-black700 border-l border-black300 z-50 flex flex-col font-inter overflow-y-auto transform transition-transform translate-x-0">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black rounded-full text-white z-10 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Video/Image Preview Header */}
        <div className="relative h-[250px] w-full bg-black900 shrink-0">
          <img 
            src="/story3.jpg" 
            alt="Content preview" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 right-4 bg-black/70 px-2 py-1 rounded text-xs font-medium text-white">
            01:23:45
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1 -mt-2">
            <h2 className="text-xl font-semibold text-white">Weekend Dance Vibes</h2>
            <p className="text-sm text-slate400">by Goria James</p>
            <p className="text-xs text-slate500">ID: LIVE-2026-00132</p>
          </div>

          {/* Report Information */}
          <div className="flex flex-col gap-4 bg-black600 border border-black300 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Report Information</h3>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate400">Report ID</span>
              <span className="text-white font-medium">{report.id}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate400">Type</span>
              <span className="text-white font-medium">{report.type}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate400">Reason</span>
              <span className="text-white font-medium">{report.reason}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate400">Reported At</span>
              <span className="text-white font-medium">{report.reportedAt}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate400">Status</span>
              <span className={`font-medium ${
                report.status === 'Resolved' ? 'text-[#0ea759]' :
                report.status === 'Pending Review' ? 'text-[#ff8d28]' :
                'text-slate400'
              }`}>{report.status}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate400">Total Reports</span>
              <span className="text-white font-medium">5</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate400">Monetization</span>
              <span className="text-white font-medium">Enabled</span>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white">Description</h3>
            <div className="bg-black600 border border-black300 rounded-xl p-4 text-sm text-slate300">
              The streamer is repeatedly insulting and threatening viewers lives in the chat.
            </div>
          </div>

          {/* Evidence */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white">Evidence</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between bg-black600 border border-black300 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FiDownload className="text-slate400 w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">Screenshots</span>
                    <span className="text-xs text-slate500">JPG - 2.6 MB</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-slate400 hover:text-white transition-colors">
                    <FiEye className="w-5 h-5" />
                  </button>
                  <button className="text-slate400 hover:text-white transition-colors">
                    <FiDownload className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-black600 border border-black300 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FiDownload className="text-slate400 w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">Chat logs</span>
                    <span className="text-xs text-slate500">JPG - 2.6 MB</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-slate400 hover:text-white transition-colors">
                    <FiEye className="w-5 h-5" />
                  </button>
                  <button className="text-slate400 hover:text-white transition-colors">
                    <FiDownload className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add Note */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white">Add Note</h3>
            <textarea 
              placeholder="Add a note about this report..."
              className="bg-black600 border border-black300 rounded-xl p-4 text-sm text-white placeholder-slate-500 outline-none resize-none h-24 focus:border-slate600 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-2 pb-6">
            <button className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg border border-[#0ea759]/30 text-[#0ea759] text-sm font-medium hover:bg-[#0ea759]/10 transition-colors">
              <FiCheck className="w-4 h-4" /> Approve Content
            </button>
            <button className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg border border-slate700 text-white text-sm font-medium hover:bg-black300 transition-colors">
              <FiEye className="w-4 h-4" /> Warn Streamer
            </button>
            <button className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg border border-red500/30 text-red500 text-sm font-medium hover:bg-red500/10 transition-colors">
              <FiDownload className="w-4 h-4 rotate-180" /> Remove Content
            </button>
            <button className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg border border-slate700 text-white text-sm font-medium hover:bg-black300 transition-colors">
              <FiEye className="w-4 h-4" /> Dismiss Report
            </button>
            <button className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg border border-slate700 text-white text-sm font-medium hover:bg-black300 transition-colors">
              <FiEye className="w-4 h-4" /> View Reporter Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
