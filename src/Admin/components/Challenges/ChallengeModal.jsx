import { FaEdit } from "react-icons/fa";
import { FaEye, FaRegEye } from "react-icons/fa6";
import { FiCheck, FiDownload } from "react-icons/fi";
import { MdClose, MdDeleteForever, MdKeyboardArrowDown } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { TbDownload, TbFileDownloadFilled } from "react-icons/tb";

const challengeInfo = [
  { title: "Category", value: "Dance" },
  { title: "Type", value: "Hashtag Challenge" },
  { title: "Status", value: "Active" },
  { title: "Start Date", value: "May 20, 2025 12:00 AM" },
  { title: "End Date", value: "Jun 20, 2025 11:59 PM" },
  { title: "Eligibility", value: "Anyone" },
  { title: "Total Rewards", value: "5,200,000" },
  { title: "Visibility", value: "Public" },
];

const topRewards = [
  { title: "1st Prize", value: "2,000,000" },
  { title: "2nd Prize", value: "1,500,000" },
  { title: "3rd Prize", value: "1,000,000" },
  { title: "10 Consolation Prizes", value: "70,000 each" },
];

const profileStats = [
  { title: "Participants", value: "45.2K" },
  { title: "Submissions", value: "98.3K" },
  { title: "Total Rewards", value: "125k" },
  { title: "Days Left", value: "01" },
];

function ChallengeModal({ handleCloseModal }) {
  return (
    <section className="w-full max-w-150 absolute top-0 right-0 p-7.5 flex flex-col bg-black900 z-100 gap-7.5 h-screen overflow-y-auto">
      <div className="flex flex-col space-y-3 font-roboto">
        <button onClick={() => handleCloseModal(null)} className="self-end">
          <MdClose className="w-6 h-6 text-white" />
        </button>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <div className="w-full h-52.5 relative">
            <img src="/video-img-admin.png" alt="" />
            <div className="absolute bottom-4 right-4 bg-black/60 rounded-md text-white text-sm font-medium px-5 py-1.5">
              01:23:45
            </div>
          </div>
          <div className="flex flex-col gap-2 font-lexend">
            <p className="text-base text-white font-light">
              DeyMakeDanceChallenge
            </p>
            <p className="text-sm text-white font-light">by @king_man</p>
            <p className="text-sm text-white font-light">ID: CHL-2026-0001</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 w-full">
          {profileStats.map(({ title, value }, i) => (
            <div
              key={title - i}
              className="flex flex-col items-center font-inter"
            >
              <p className="text-white font-bold text-base">{value}</p>
              <span className="text-[11px] font-extralight text-white">
                {title}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-7.5 p-6 rounded-2xl bg-blue300">
          <h4 className="text-lg font-roboto text-white">Description</h4>
          <div className="px-3.5 py-2.5 text-white text-xs font-medium font-roboto">
            Show off your best dance moves and use #DeyMakeDanceChallenge to get
            featured! Top creators win amazing prizes.
          </div>
        </div>
        <div className="flex flex-col gap-7.5 p-6 rounded-2xl bg-blue300">
          <h4 className="text-lg font-roboto text-white">
            Challenge Information
          </h4>
          <div className="flex flex-col gap-6">
            {challengeInfo.map(({ title, value }, i) => (
              <div
                key={title - i}
                className="flex items-center justify-between font-roboto"
              >
                <h6 className="text-white font-medium text-xs">{title}</h6>
                <span
                  className={`font-medium text-xs ${
                    i === 2 ? "text-green100" : "text-white "
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-7.5 p-6 rounded-2xl bg-blue300">
          <h4 className="text-lg font-roboto text-white">Top Rewards</h4>
          <div className="flex flex-col gap-6">
            {topRewards.map(({ title, value }, i) => (
              <div
                key={title - i}
                className="flex items-center justify-between font-roboto"
              >
                <h6 className="text-white font-medium text-xs">{title}</h6>
                <span className={`font-medium text-xs text-white`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-7.5 p-6 rounded-2xl bg-blue300">
          <h4 className="text-lg font-roboto text-white">Top Participant</h4>
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between font-roboto"
              >
                <div className="flex items-center gap-1">
                  <img
                    src="/aisha.png"
                    alt=""
                    className="w-10 h-10 rounded-full object-contain"
                  />
                  <div className="flex flex-col gap-1">
                    <h5 className="text-sm text-white font-light">Aisha Doe</h5>
                    <p className="text-[10px] text-white font-light">
                      @aishadoe
                    </p>
                  </div>
                </div>
                <span className={`font-medium text-xs text-white`}>
                  2.5M Likes
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 p-6 rounded-2xl bg-blue300">
          <button className="w-full h-12 rounded-md text-white text-xs border border-white flex items-center justify-center gap-3">
            <FaEdit className="w-4 h-4 text-white" /> Edit Details
          </button>
          <button className="w-full h-12 rounded-md text-white text-xs border border-white flex items-center justify-center gap-3">
            <FaEdit className="w-4 h-4 text-white" /> Edit Details
          </button>
          <button className="w-full h-12 rounded-md text-white text-xs border border-white flex items-center justify-center gap-3">
            <FaEdit className="w-4 h-4 text-white" /> Edit Details
          </button>
          <button className="w-full h-12 rounded-md text-white text-xs border border-white flex items-center justify-center gap-3">
            <FaEdit className="w-4 h-4 text-white" /> Edit Details
          </button>
          <button className="w-full h-12 rounded-md text-red100 text-xs border border-red100 flex items-center justify-center gap-3">
            <MdDeleteForever className="w-4 h-4 text-red100" /> Remove Video
          </button>
        </div>
      </div>
    </section>
  );
}

export default ChallengeModal;
