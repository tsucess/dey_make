import { FaEye, FaRegEye } from "react-icons/fa6";
import { FiCheck, FiDownload } from "react-icons/fi";
import { MdClose, MdKeyboardArrowDown } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { TbDownload, TbFileDownloadFilled } from "react-icons/tb";

const accountInfo = [
  { title: "User ID", value: "1234567890" },
  { title: "Email Address", value: "zara@gmail.com" },
  { title: "Joined", value: "Feb 14, 2024 08:00 AM" },
  { title: "Followers", value: "12.6K" },
  { title: "Total Posts", value: "36" },
  { title: "Account Status", value: "Banned" },
];

const banInfo = [
  { title: "Reason", value: "Community Guidelines" },
  { title: "Violation", value: "Hate speech" },
  { title: "Suspended On", value: "Feb 14, 2024 08:00 AM" },
  { title: "Duration", value: "Permanent" },
  { title: "Suspended By", value: "Admin Sarah" },
  { title: "Note", value: "User posted hate speech and encouraged violence." },
];

const appeal = [
  { title: "Status", value: "No appeal made" },
  { title: "Appeal Count", value: "0" },
  { title: "Last Appeal", value: "-----" },
];

const content = [
  { title: "Hate speech detected", value: "May 25, 2024" },
  { title: "Harassment reported", value: "May 10, 2024" },
  { title: "Inappropriate content", value: "April 28, 2024" },
];

function SuspendedModal({ handleCloseModal }) {
  return (
    <section className="w-full max-w-150 absolute top-0 right-0 p-7.5 flex flex-col bg-black900 z-100 gap-7.5 h-screen overflow-y-auto">
      <div className="flex flex-col space-y-3 font-roboto">
        <button onClick={() => handleCloseModal(null)} className="self-end">
          <MdClose className="w-6 h-6 text-white" />
        </button>
        <div className="flex flex-col items-center gap-4 font-inter">
          <div className="w-31 h-31 relative">
            <img
              src="/aisha.png"
              alt=""
              className="w-full h-full rounded-full"
            />
            <div className="w-6 h-6 bg-blue400 rounded-full flex justify-center items-center absolute bottom-2 right-2">
              <RiVerifiedBadgeFill className="w-4 h-4 text-blue300" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white">Aisha Doe</h3>
          <span className="text-xs text-white">@zaravibes</span>
          <div className="px-3 py-1 bg-red100/24 rounded-md text-red100 text-xs font-light">
            Banned Permanently
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-7.5 p-6 rounded-2xl bg-blue300">
          <h4 className="text-lg font-roboto text-white">
            Account Information
          </h4>
          <div className="flex flex-col gap-6">
            {accountInfo.map(({ title, value }, i) => (
              <div
                key={title - i}
                className="flex items-center justify-between font-roboto"
              >
                <h6 className="text-white font-medium text-xs">{title}</h6>
                <span
                  className={`font-medium text-xs ${
                    i === accountInfo.length - 1 ? "text-red100" : "text-white "
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-7.5 p-6 rounded-2xl bg-blue300">
          <h4 className="text-lg font-roboto text-white">
            Account Information
          </h4>
          <div className="flex flex-col gap-6">
            {banInfo.map(({ title, value }, i) => (
              <div
                key={title - i}
                className="flex items-center justify-between font-roboto"
              >
                <h6 className="text-white font-medium text-xs">{title}</h6>
                <span className="text-white font-medium text-xs">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-7.5 p-6 rounded-2xl bg-blue300">
          <h4 className="text-lg font-roboto text-white">Appeal Status</h4>
          <div className="flex flex-col gap-6">
            {appeal.map(({ title, value }, i) => (
              <div
                key={title - i}
                className="flex items-center justify-between font-roboto"
              >
                <h6 className="text-white font-medium text-xs">{title}</h6>
                <span className="text-white font-medium text-xs">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-7.5 p-6 rounded-2xl bg-blue300">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-lg font-roboto text-white">
             Content Moderation
            </h4>
            <button className="text-orange100 text-base font-semibold">
              View all
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {content.map(({ title, value }, i) => (
              <div
                key={title - i}
                className="flex items-center justify-between font-roboto"
              >
                <h6 className="text-white font-medium text-xs">{title}</h6>
                <span className="text-white font-medium text-xs">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 p-6 rounded-2xl bg-blue300">
          <button className="w-full h-12 rounded-md text-white text-xs border border-white flex items-center justify-center gap-3">
            <FaEye className="w-4 h-4 text-white" /> View Profile
          </button>
          <button className="w-full h-12 rounded-md text-green100 text-xs border border-green100 flex items-center justify-center gap-3">
            <FiDownload className="w-4 h-4 text-green100" /> Unban User
          </button>
          <button className="w-full h-12 rounded-md text-white text-xs border border-white flex items-center justify-center gap-3">
            More Actions{" "}
            <MdKeyboardArrowDown className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default SuspendedModal;
