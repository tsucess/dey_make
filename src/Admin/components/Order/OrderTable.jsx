import { FaEllipsisVertical } from "react-icons/fa6"


function OrderTable({ filteredData, modalId, handleOpenModal, handleCloseModal }) {
  return (
     <section className="bg-blue300 p-6 rounded-3xl flex flex-col gap-7.5 font-lexend">
          <div className="overflow-x-auto w-full">
            <table className="min-w-290 whitespace-nowrap w-full">
              <thead>
                <tr>
                  <th className="p-5 ">
                    <div className="border border-white rounded w-5 h-5"></div>
                  </th>
                  <th className="p-4 text-sm text-white">Order ID</th>
                  <th className="p-4 text-sm text-white">Creator</th>
    
                  <th className="p-4 text-sm text-white">Items</th>
                  <th className="p-4 text-sm text-white">Amount</th>
                  <th className="p-4 text-sm text-white">Payment</th>
                  <th className="p-4 text-sm text-white">Status</th>
                  <th className="p-4 text-sm text-white">Created At</th>
                  <th className="p-4 text-sm text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((data) => (
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
                      <h5 className="text-sm text-white font-light">
                            {data.orderId}
                          </h5>
                    </td>
                    <td className="p-4 ">
                       <div className="flex items-center gap-1">
                    <img
                      src={data.creatorImg}
                      alt=""
                      className="w-10 h-10 rounded-full object-contain"
                    />
                    <div className="flex flex-col gap-1">
                      <h5 className="text-sm text-white font-light">
                        {data.creatorName}
                      </h5>
                      <p className="text-[10px] text-white font-light">
                        {data.creatorEmail}
                      </p>
                    </div>
                  </div>
                    </td>
                    <td className="p-4 text-sm font-light text-white">
                      {data.item}
                    </td>
                    <td className="text-sm font-light text-white p-4">
                      {data.amount}
                    </td>
                    <td className="text-sm font-light text-white p-4">
                      {data.payment}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          data.status === "Delivered"
                            ? " text-green100"
                            : data.status === "Cancelled"
                              ? " text-red100"
                              : data.status === "Processing"
                                ? " text-orange500"
                                : data.status === "Shipped"
                                ? " text-purple"
                                : data.status === "Refunded"
                                ? " text-pink"
                                : " text-blue"
                        }`}
                      >
                        {data.status}
                      </span>
                    </td>
                    <td className="text-sm font-light text-white p-4">
                      {data.createdAt}
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
            <span className="text-white text-xs">Step 1 of 5</span>
            <button className="bg-orange100 text-slate100 text-sm px-5 py-1.5 rounded-md">
              Next
            </button>
          </div>
        </section>
  )
}

export default OrderTable