import React from "react";
import { FiX, FiEye, FiDownload, FiXCircle } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";

export default function CommentDetailsSidebar({ comment, onClose }) {
  if (!comment) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[450px] bg-blue400 border-l border-black300 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 shrink-0 border-b border-black300/50">
          <h2 className="text-white text-base font-semibold">Comment Details</h2>
          <button onClick={onClose} className="text-slate400 hover:text-white transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-6 font-inter" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          
          {/* Profile Overview */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-3">
              <img src={comment.user.avatar || "/story3.jpg"} alt={comment.user.name} className="w-20 h-20 rounded-full object-cover" />
              {comment.user.verified && (
                <div className="absolute bottom-0 right-0 bg-blue400 rounded-full p-0.5">
                  <MdVerified className="w-5 h-5 text-cyan200" />
                </div>
              )}
            </div>
            <h2 className="text-lg font-semibold text-white">{comment.user.name}</h2>
            <p className="text-xs text-slate400 mt-1">{comment.user.userType || "Creator"}</p>
            <p className="text-xs text-slate400 mt-1">{comment.user.followers || "24M followers"}</p>
            
            <div className="mt-4 bg-[#3b1212] text-red500 px-4 py-1.5 rounded-md text-xs font-medium border border-red500/20">
              Hate Speech
            </div>
            
            <p className="text-white text-sm mt-5 text-center px-4">
              {comment.commentText}
            </p>
          </div>

          {/* On Video */}
          <div className="bg-blue300 rounded-xl p-5 mb-5 border border-black300/50">
            <h3 className="text-sm font-medium text-white mb-4">On Video</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-black300 rounded-lg shrink-0 overflow-hidden">
                <img src="/story3.jpg" alt="Video thumbnail" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-white font-medium">{comment.video?.title || "Weekend Vibe"}</span>
                <span className="text-xs text-slate400">{comment.video?.id || "UXX-2224-839423"}</span>
                <button className="text-orange100 text-xs font-medium mt-1 text-left hover:underline">View Video</button>
              </div>
            </div>
          </div>

          {/* Comment Info */}
          <div className="bg-blue300 rounded-xl p-5 mb-5 border border-black300/50">
            <h3 className="text-sm font-medium text-white mb-4">Comment Info</h3>
            <div className="flex flex-col">
              <div className="flex justify-between items-center py-3.5 border-b border-black300">
                <span className="text-slate400 text-xs font-medium">Comment ID</span>
                <span className="text-white text-xs font-medium">{comment.id}</span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b border-black300">
                <span className="text-slate400 text-xs font-medium">Posted On</span>
                <span className="text-white text-xs font-medium">{comment.date} 09:41 AM</span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b border-black300">
                <span className="text-slate400 text-xs font-medium">Status</span>
                <span className={`text-xs font-medium ${
                  comment.status === 'Approved' ? 'text-green500' :
                  comment.status === 'Pending Review' ? 'text-orange500' :
                  'text-red500'
                }`}>
                  {comment.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b border-black300">
                <span className="text-slate400 text-xs font-medium">Reported By</span>
                <span className="text-white text-xs font-medium">{comment.reportedBy}</span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b border-black300">
                <span className="text-slate400 text-xs font-medium">Device</span>
                <span className="text-white text-xs font-medium">{comment.device || "Android, Lagos, Nigeria"}</span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b border-black300">
                <span className="text-slate400 text-xs font-medium">IP Address</span>
                <span className="text-white text-xs font-medium">{comment.ipAddress || "197.210.13.0"}</span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b border-black300">
                <span className="text-slate400 text-xs font-medium">Likes</span>
                <span className="text-white text-xs font-medium">{comment.likes || 2}</span>
              </div>
              <div className="flex justify-between items-center py-3.5">
                <span className="text-slate400 text-xs font-medium">Replies</span>
                <span className="text-white text-xs font-medium">{comment.replies || 0}</span>
              </div>
            </div>
          </div>

          {/* Reported Reasons */}
          <div className="bg-blue300 rounded-xl p-5 mb-6 border border-black300/50">
            <h3 className="text-sm font-medium text-white mb-4">Reported Reasons ({comment.reportedReasons?.reduce((acc, curr) => acc + curr.count, 0) || 5})</h3>
            <div className="flex flex-col gap-4">
              {comment.reportedReasons?.map((reason, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className={`text-xs font-medium ${
                    reason.reason === 'Hate Speech' ? 'text-red500' :
                    reason.reason === 'Harassment' ? 'text-purple' :
                    'text-cyan'
                  }`}>{reason.reason}</span>
                  <span className="text-white text-xs font-medium">{reason.count}</span>
                </div>
              ))}
              {!comment.reportedReasons && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-red500 text-xs font-medium">Hate Speech</span>
                    <span className="text-white text-xs font-medium">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple text-xs font-medium">Harassment</span>
                    <span className="text-white text-xs font-medium">1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cyan text-xs font-medium">Bullying</span>
                    <span className="text-white text-xs font-medium">1</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pb-6">
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-transparent border border-slate700 rounded-md text-slate300 text-sm font-medium hover:bg-black300 transition-colors">
              <FiEye className="w-4 h-4" /> Approve Comment
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-transparent border border-red500/30 rounded-md text-red500 text-sm font-medium hover:bg-red500/10 transition-colors">
              <FiDownload className="w-4 h-4" /> Remove Comment
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-transparent border border-slate700 rounded-md text-slate300 text-sm font-medium hover:bg-black300 transition-colors">
              <FiDownload className="w-4 h-4 rotate-180" /> Hide Comment
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-transparent border border-slate700 rounded-md text-slate300 text-sm font-medium hover:bg-black300 transition-colors">
              <FiXCircle className="w-4 h-4" /> Ban User {comment.user.username}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
