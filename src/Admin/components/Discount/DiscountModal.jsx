import { GrEdit } from "react-icons/gr";
import { IoDuplicateOutline } from "react-icons/io5";
import { LuView } from "react-icons/lu";
import { MdClose, MdOutlineDelete } from "react-icons/md";

const stats = [
  { title: "Used", value: "1,234" },
  { title: "Usage Limit", value: "5,000" },
  { title: "Usage Rate", value: "25%" },
  { title: "Discount Given", value: "2.4M" },
];

const discountInfo = [
  { title: "Type", value: "Percentage" },
  { title: "Value", value: "20% Off" },
  { title: "Applies To", value: "All Products" },
  { title: "Minimum Order", value: "0" },
  { title: "Maximum Discount", value: "10,000" },
  { title: "Usage Limit", value: "5,000 times per discount" },
  { title: "Per User Limit", value: "3 times per user" },
];

const btns = [
  { icon: GrEdit, title: "Edit Discount" },
  { icon: IoDuplicateOutline, title: "Duplicate Discount" },
  { icon: LuView, title: "View Useage History" },
  { icon: MdOutlineDelete, title: "Delete Discount" },
];

function DiscountModal({ handleCloseModal }) {
  return (
    <section className="w-full max-w-150 absolute top-0 right-0 p-7.5 flex flex-col bg-black900 z-100 gap-7.5 h-screen overflow-y-auto">
      <button onClick={handleCloseModal} className="self-end cursor-pointer">
        <MdClose className="w-6 h-6 text-white" />
      </button>
      <h5 className=" text-lg text-white font-roboto">Discount Details</h5>
      <div className="flex flex-col gap-2 font-lexend text-white font-light">
        <div className="flex flex-col gap-1">
          <span className="text-xl">20% Off Everything</span>
          <span className="text-[10px]">Code: SAVEBIG</span>
        </div>
        <span className="text-sm font-lexend text-green500 font-light">Active</span>
      </div>
      <div className="flex items-center justify-between">
        {stats.map(({ title, value }) => (
          <div key={title} className="flex flex-col gap-1 items-center">
            <span className="text-base font-bold text-white">{value}</span>
            <span className="text-[11px] font-extralight text-white">
              {title}
            </span>
          </div>
        ))}
      </div>
      <div className="bg-blue300 rounded-2xl flex flex-col gap-7.5 p-6 font-roboto">
        <h5 className=" text-lg text-white">Discount Information</h5>
        <div className="flex flex-col gap-4">
          {discountInfo.map(({ title, value }, i) => (
            <div key={title} className="flex items-center justify-between">
              <span className="text-xs font-medium text-white">{title}</span>
              <span
                className={`text-xs font-medium text-white`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-blue300 rounded-2xl flex flex-col gap-7.5 p-6 font-roboto">
        <h5 className=" text-lg text-white">Validity Period</h5>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-medium text-white">May 20, 2024 12:00 AM</span>
          <span className="text-xs font-medium text-white">to</span>
          <span className="text-xs font-medium text-white">Jun 20, 2024 11:59 PM</span>
        </div>
      </div>
      <div className="bg-blue300 rounded-2xl flex flex-col gap-7.5 p-6 font-roboto">
        <h5 className=" text-lg text-white">Created By</h5>
        <div className="flex items-center gap-5">
          <div className="w-17.5 h-17.5 rounded-full bg-white"></div>
          <div className="flex flex-col gap-2 font-lexend text-white font-light">
            <div className="flex flex-col gap-1">
              <span className="text-sm">Admin</span>
              <span className="text-[10px]">Super Admin</span>
            </div>
            <span className="text-xs font-medium text-white font-roboto">
              May 15, 2024 09:30 AM
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5">{btns.map(({ title, icon: Icon }, i) => (
        <button
          key={title}
          className={`border rounded-md flex items-center gap-3 h-12 justify-center text-xs cursor-pointer ${i === btns.length - 1 ? "border-red100 text-red100" : "border-white text-white"}`}
        >
          <Icon className="w-4 h-4" />
          {title}
        </button>
      ))}</div>
    </section>
  );
}

export default DiscountModal;
