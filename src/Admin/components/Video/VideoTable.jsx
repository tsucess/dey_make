import { FaEllipsisVertical } from "react-icons/fa6";
import { RiVerifiedBadgeFill } from "react-icons/ri";

function VideoTable({ modalId, handleOpenModal, handleCloseModal }) {
  return (
    <section className="bg-blue300 p-6 rounded-3xl flex flex-col gap-7.5 font-lexend">
      <div className="overflow-x-auto w-full">
        <table className="min-w-220 whitespace-nowrap">
          <thead>
            <tr>
              <th className="p-4">
                {" "}
                <span className="w-4 h-4 border block border-zinc50 rounded-sm"></span>
              </th>
              <th className="p-4 text-sm text-white">Video</th>

              <th className="p-4 text-sm text-white">Creator</th>
              <th className="p-4 text-sm text-white">Views</th>
              <th className="p-4 text-sm text-white">Likes</th>
              <th className="p-4 text-sm text-white">Comments</th>

              <th className="p-4 text-sm text-white">Status</th>
              <th className="p-4 text-sm text-white">Uploaded</th>
              <th className="p-4 text-sm text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <tr
                key={i}
                onClick={() => handleOpenModal(i)}
                className={` px-2 py-2 ${
                  modalId === i ? "border border-blue400 rounded-xl" : ""
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    name=""
                    id=""
                    onChange={() =>
                      modalId === i ? handleCloseModal() : handleOpenModal(i)
                    }
                    checked={modalId === i}
                  />
                </td>
                <td className="p-4 ">
                  <div className="flex items-center gap-1">
                    <div className="w-7.5 h-7.5 bg-white"></div>
                    <div className="flex flex-col gap-1">
                      <h5 className="text-sm text-white font-light">
                        Weekend Vibe
                      </h5>
                      <p className="text-[10px] text-white font-light">
                        ID: VID-2024-1234511
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 ">
                  <div className="flex items-center gap-1">
                    <img
                      src="/aisha.png"
                      alt=""
                      className="w-10 h-10 rounded-full object-contain"
                    />
                    <div className="flex flex-col gap-1">
                      <h5 className="text-sm text-white font-light">
                        Aisha Doe
                      </h5>
                      <p className="text-[10px] text-white font-light">
                        @aishadoe
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm font-light text-white">1.2M</td>
                <td className="text-sm font-light text-white p-4">96.4K</td>
                <td className="text-sm font-light text-white p-4">2.3K</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-red100/24 rounded-md text-red100 text-xs font-light">
                    Reported
                  </span>
                </td>
                <td className="text-sm font-light text-white p-4">
                  May 26, 2024
                </td>

                <td className="p-4">
                  <button>
                    <FaEllipsisVertical className="w-4 h-4 text-white" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center gap-4 font-roboto">
        <button className="border border-orange100 rounded-md text-sm px-5 py-1.5 text-white">
          Prev
        </button>
        <span className="text-white text-xs">Step 2 of 5</span>
        <button className="bg-orange100 text-slate100 text-sm px-5 py-1.5 rounded-md">
          Next
        </button>
      </div>
    </section>
  );
}

export default VideoTable;
