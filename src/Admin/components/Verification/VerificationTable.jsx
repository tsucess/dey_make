import { FaEllipsisVertical } from "react-icons/fa6";
import { RiVerifiedBadgeFill } from "react-icons/ri";

function VerificationTable({ modalId, handleOpenModal }) {
  return (
    <section className="bg-blue300 p-6 rounded-3xl flex flex-col gap-7.5 font-lexend">
      <div className="flex flex-col gap-5 max-w-400 w-full overflow-x-auto">
        <div className="grid grid-cols-12 gap-4">
          <div className="border w-5 h-5 border-zinc50 rounded-sm col-span-1"></div>
          <h4 className="text-sm text-white col-span-3">Creator</h4>
          <h4 className="text-sm text-white col-span-2">Type</h4>
          <h4 className="text-sm text-white col-span-1">Category</h4>
          <h4 className="text-sm text-white col-span-1">Followers</h4>
          <h4 className="text-sm text-white col-span-2">Requested</h4>
          <h4 className="text-sm text-white col-span-1">Status</h4>
          <h4 className="text-sm text-white col-span-1">Actions</h4>
        </div>
        <div className="flex flex-col gap-3.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              onClick={() => handleOpenModal(i)}
              key={i}
              className={`grid grid-cols-12 gap-4 px-2 py-2 ${
                modalId === i ? "border border-blue400 rounded-xl" : ""
              }`}
            >
              <div className="col-span-1 flex items-center">
                <input type="checkbox" name="" id="" className="" onChange={()=> handleOpenModal(i)} checked={modalId === i} />
              </div>

              <div className="flex items-center gap-1 col-span-3">
                <img
                  src="/aisha.png"
                  alt=""
                  className="w-10 h-10 rounded-full object-contain"
                />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <h5 className="text-sm text-white font-light">Aisha Doe</h5>
                    <RiVerifiedBadgeFill className="w-4 h-4 text-blue400" />
                  </div>
                  <p className="text-[10px] text-white font-light">@aishadoe</p>
                </div>
              </div>
              <div className="col-span-2 flex justify-start items-center">
                <div className="px-2 py-1 bg-blue400/24 rounded-md text-blue400 text-xs font-light">
                  Blue Check
                </div>
              </div>
              <div className="col-span-1 flex items-center">
                <p className="text-sm font-light text-white">Lifestyle</p>
              </div>
              <div className="col-span-1 flex items-center">
                <p className="text-sm font-light text-white">2.4M</p>
              </div>
              <div className="col-span-2 flex items-center">
                <p className="text-sm font-light text-white">2 hours ago</p>
              </div>
              <div className="col-span- flex justify-start items-center">
                <div className="px-2 py-1 bg-orange500/24 rounded-md text-orange500 text-xs font-light">
                  Pending
                </div>
              </div>
              <button className="col-span-1">
                <FaEllipsisVertical className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
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
