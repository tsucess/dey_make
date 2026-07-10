import { FaEllipsisVertical } from "react-icons/fa6";
import { RiVerifiedBadgeFill } from "react-icons/ri";

function VerificationTable({
  modalId,
  handleOpenModal,
  handleCloseModal,
  filteredData,
}) {

  return (
    <section className="bg-blue300 p-6 rounded-3xl flex flex-col gap-7.5 font-lexend">
      <div className="overflow-x-auto w-full">
        <table className="min-w-220">
          <thead>
            <tr>
              <th className="p-4">
                {" "}
                <span className="w-4 h-4 border block border-zinc50 rounded-sm"></span>
              </th>
              <th className="p-4 text-sm text-white">Creator</th>
              <th className="p-4 text-sm text-white">Type</th>
              <th className="p-4 text-sm text-white">Category</th>
              <th className="p-4 text-sm text-white">Followers</th>
              <th className="p-4 text-sm text-white">Requested</th>
              <th className="p-4 text-sm text-white">Status</th>
              <th className="p-4 text-sm text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((data) => (
              <tr
                key={data.id}
                onClick={() => handleOpenModal(data.id)}
                className={` px-2 py-2 ${
                  modalId === data.id ? "border border-blue400 rounded-xl" : ""
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    name=""
                    id=""
                    onChange={() =>
                      modalId === data.id
                        ? handleCloseModal()
                        : handleOpenModal(data.id)
                    }
                    checked={modalId === data.id}
                  />
                </td>
                <td className="p-4 flex items-center gap-1">
                  <img
                    src="/aisha.png"
                    alt=""
                    className="w-10 h-10 rounded-full object-contain"
                  />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h5 className="text-sm text-white font-light">
                        {data.name}
                      </h5>
                      {data.verified && (
                        <RiVerifiedBadgeFill className="w-4 h-4 text-blue400" />
                      )}
                    </div>
                    <p className="text-[10px] text-white font-light">
                      {data.username}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue/24 rounded-md text-blue text-xs font-light">
                    {data.verificationType}
                  </span>
                </td>
                <td className="text-sm font-light text-white p-4">
                  {data.category}
                </td>
                <td className="text-sm font-light text-white p-4">
                  {data.followers}
                </td>
                <td className="text-sm font-light text-white p-4">
                  {data.requestedDate}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1  rounded-md  text-xs font-light ${
                    data.status === 'Pending Review' ? 'bg-orange500/24 text-orange500' : 
                    data.status === 'Rejected' ? 'bg-red100/24 text-red100' : 'bg-green300/24 text-green300'
                  }`}>
                    {data.status}
                  </span>
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

export default VerificationTable;
