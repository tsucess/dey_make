import { FaEdit } from "react-icons/fa";
import { FaEye, FaRegEye } from "react-icons/fa6";
import { FiCheck, FiDownload } from "react-icons/fi";
import { MdClose, MdDeleteForever, MdKeyboardArrowDown } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { TbDownload, TbFileDownloadFilled } from "react-icons/tb";

const videoInfo = [
  { title: "Visibility", value: "Public" },
  { title: "Status", value: "Published" },
  { title: "Duration", value: "00:32" },
  { title: "File Size", value: "24.6 MB" },
  { title: "Resolution", value: "1080 x 1920" },
  { title: "Location", value: "Lagos, Nigeria" },
];


const profileStats= [
    {title : 'Videos', value : '1.2M'},
    {title : 'Likes', value : '96.4K'},
    {title : 'Comments', value : '23'},
    {title : 'Shares', value : '1.1K'},
]

function VideoModal({ handleCloseModal }) {
  return (
    <section className="w-full max-w-150 absolute top-0 right-0 p-7.5 flex flex-col bg-black900 z-100 gap-7.5 h-screen overflow-y-auto">
      <div className="flex flex-col space-y-3 font-roboto">
        <button onClick={() => handleCloseModal(null)} className="self-end">
          <MdClose className="w-6 h-6 text-white" />
        </button>
        <div className="flex flex-col items-center gap-4 font-inter max-w-80 w-full mx-auto">
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
          <span className="text-xs text-white">12.4K followers</span>
          <div className="flex items-center justify-between gap-2 w-full">
            {
                profileStats.map(({title, value}, i) => <div key={title-i} className="flex flex-col items-center font-inter">
                <p className="text-white font-bold text-base">{value}</p>
                <span className="text-[11px] font-extralight text-white">{title}</span>
            </div>)
            }
            
          </div>
          <button className="w-full flex items-center justify-center py-3 bg-black100 rounded-md text-white text-sm">View Profile</button>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
            <div className="w-full h-52.5 relative">
                <img src="/video-img-admin.png" alt="" />
                <div className="absolute bottom-4 right-4 bg-black/60 rounded-md text-white text-sm font-medium px-5 py-1.5">00:32</div>
            </div>
            <div className="flex flex-col gap-2 font-lexend">
                <p className="text-base text-white font-light">Weekend Dance Vibes</p>
                <p className="text-sm text-white font-light">ID: VID-2026-00132</p>
                <p className="text-sm text-white font-light">Uploaded: May 26, 2025 - 10:30 AM</p>
            </div>
        </div>
        <div className="flex flex-col gap-7.5 p-6 rounded-2xl bg-blue300">
          <div className="flex flex-col gap-6">
            {videoInfo.map(({ title, value }, i) => (
              <div
                key={title - i}
                className="flex items-center justify-between font-roboto"
              >
                <h6 className="text-white font-medium text-xs">{title}</h6>
                <span
                  className={`font-medium text-xs ${
                    i === 1 ? "text-green100" : "text-white "
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-7.5 p-6 rounded-2xl bg-blue300">
          <h4 className="text-lg font-roboto text-white">Description</h4>
          <div className="px-3.5 py-2.5 text-white text-xs font-medium font-roboto">Just having fun with this trending dance! #DeyMake #DanceChallenge #Vibes</div>
          </div>

        <div className="flex flex-col gap-5 p-6 rounded-2xl bg-blue300">
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

export default VideoModal;
