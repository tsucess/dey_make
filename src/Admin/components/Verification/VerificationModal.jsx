import { FaRegEye } from "react-icons/fa6";
import { FiCheck } from "react-icons/fi";
import { MdClose, MdKeyboardArrowDown } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { TbDownload, TbFileDownloadFilled } from "react-icons/tb";

const about = [
  { title: "Category", value: "Public Figure" },
  { title: "Followers", value: "128K" },
  { title: "Total Likes", value: "2.4M" },
  { title: "Total Videos", value: "312" },
  { title: "Account Created", value: "Jan 12, 2022" },
  { title: "Country", value: "Nigeria" },
];

const info = [
  { title: "Government ID", value: "Community Guidelines" },
  { title: "Profile Picture", value: "Hate speech" },
  { title: "Username", value: "Feb 14, 2024 08:00 AM" },
  { title: "Bio", value: "Permanent" },
];

function VerificationModal({ handleCloseModal }) {
  return (
    <section className="w-full max-w-150 absolute top-0 right-0 p-7.5 flex flex-col bg-black900 z-100 gap-7.5 h-screen overflow-y-auto">
      <div className="flex flex-col space-y-3 font-roboto">
        <button onClick={() => handleCloseModal(null)} className="self-end">
          <MdClose className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-lg text-white">Account Information</h2>
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
          <div className="px-2 py-1 bg-blue400/24 rounded-md text-blue400 text-xs font-light">
            Blue Check
          </div>
          <p className="text-sm font-lexend font-light text-white">
            Requested 2 hours ago
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-7.5 p-6 rounded-2xl bg-blue300">
          <h4 className="text-lg font-roboto text-white">About</h4>
          <div className="flex flex-col gap-6">
            {about.map(({ title, value }, i) => (
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
          <h4 className="text-lg font-roboto text-white">
            Submitted Information
          </h4>
          <div className="flex flex-col gap-6">
            {info.map(({ title, value }, i) => (
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
          <h4 className="text-lg font-roboto text-white">Documents</h4>
          <div className="flex flex-col gap-5">
            {[1, 2].map((i) => (
              <div className="border border-white/20 rounded-md px-2.5 py-3.75 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <TbDownload className="w-10 h-10 text-white" />
                  <div className="flex flex-col gap-0.5 font-lexend">
                    <p className="text-white text-sm font-light">
                      ID_Card_Front.jpg
                    </p>
                    <span className="text-white text-xs font-light">
                      JPG · 2.6 MB
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <button>
                    {" "}
                    <FaRegEye className="w-5 h-5 text-white" />
                  </button>
                  <button>
                    {" "}
                    <TbDownload className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-7.5 p-6 rounded-2xl bg-blue300">
          <h4 className="text-lg font-roboto text-white">Admin Notes</h4>
          <textarea
            name=""
            id=""
            placeholder="Add a note about this request..."
            className="p-4 border border-white/57 font-roboto rounded-md h-42 resize-none text-white text-sm"
          ></textarea>
        </div>

        <div className="flex flex-col gap-5 p-6 rounded-2xl bg-blue300">
          <button className="w-full h-12 rounded-md text-red100 text-xs border border-red100 flex items-center justify-center gap-3">
            <MdClose className="w-4 h-4 text-red100" /> Reject
          </button>
          <button className="w-full h-12 rounded-md text-green100 text-xs border border-green100 flex items-center justify-center gap-3">
            <FiCheck className="w-4 h-4 text-green100" /> Approve
          </button>
          <button className="w-full h-12 rounded-md text-white text-xs border border-white flex items-center justify-center gap-3">
            Request More Info{" "}
            <MdKeyboardArrowDown className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default VerificationModal;
