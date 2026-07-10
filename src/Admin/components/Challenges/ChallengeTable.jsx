import { FaEllipsisVertical } from "react-icons/fa6";
import { RiVerifiedBadgeFill } from "react-icons/ri";

function ChallengeTable({ modalId, handleOpenModal, handleCloseModal, filteredData }) {
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
              <th className="p-4 text-sm text-white">Challenge</th>
              <th className="p-4 text-sm text-white">Category</th>
              <th className="p-4 text-sm text-white">Participants</th>
              <th className="p-4 text-sm text-white">Submissions</th>

              <th className="p-4 text-sm text-white">Status</th>
              <th className="p-4 text-sm text-white">Period </th>
              <th className="p-4 text-sm text-white">Actions</th>
            </tr>
          </thead> 
          <tbody>
            {filteredData.map((data, i) => (
              <tr
                key={data.id}
                onClick={() => handleOpenModal(data.id)}
                className={` px-2 py-2 ${
                  modalId === data.id ? "border border-blue rounded-xl" : ""
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    name=""
                    id=""
                    onChange={() =>
                      modalId === data.id ? handleCloseModal() : handleOpenModal(data.id)
                    }
                    checked={modalId === data.id}
                  />
                </td>
                <td className="p-4 ">
                  <div className="flex items-center gap-2">
                    <div className="w-7.5 h-7.5 bg-white"></div>
                    <div className="flex flex-col gap-1">
                      <h5 className="text-sm text-white font-light">
                        {data.challengeTitle}
                      </h5>
                      <p className="text-[10px] text-white font-light">
                        ID: {data.challengeId}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={`text-sm font-light  p-4 ${i % 2 === 0 ? 'text-orange500' : 'text-purple'}`}>{data.category}</td>
                <td className="p-4 text-sm font-light text-white">{data.participant}</td>
                <td className="text-sm font-light text-white p-4">{data.submission}</td>
                
                <td className="p-4">
                  <span className={`px-2 py-1  rounded-md  text-xs font-light ${
                    data.status === 'Active' ? 'bg-green100/24 text-green100' :
                    data.status === 'Upcoming' ? 'bg-blue/24 text-blue' : 
                    data.status === 'Draft' ? 'bg-purple/24 text-purple' : 'bg-slate50 text-slate150'
                  }`}>
                    {data.status}
                  </span>
                </td>
                <td className="text-sm font-light text-white p-4">
                 {data.period}
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

export default ChallengeTable;
