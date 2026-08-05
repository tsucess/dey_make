import { GrEdit } from "react-icons/gr";
import { IoDuplicateOutline } from "react-icons/io5";
import { LuView } from "react-icons/lu";
import { MdClose, MdOutlineDelete } from "react-icons/md";

const stats = [
  { title: "Sales", value: "1,245" },
  { title: "Views", value: "2.4K" },
  { title: "Revenue", value: "10.6M" },
  { title: "Rating", value: "4.8" },
];

const productInfo = [
  { title: "Category", value: "Merchandise" },
  { title: "Type", value: "Physical" },
  { title: "Status", value: "Active" },
  { title: "Created At", value: "May 26, 2025 12:00 AM" },
  { title: "Updated At", value: "May 28, 2025 12:00 AM" },
];

const btns = [
  { icon: GrEdit, title: "Edit Product" },
  { icon: IoDuplicateOutline, title: "Duplicate Product" },
  { icon: LuView, title: "View Product Page" },
  { icon: MdOutlineDelete, title: "Delete Product" },
];

function ProductModal({ handleCloseModal }) {
  return (
    <section className="w-full max-w-150 absolute top-0 right-0 p-7.5 flex flex-col bg-black900 z-100 gap-7.5 h-screen overflow-y-auto">
      <button onClick={handleCloseModal} className="self-end cursor-pointer">
        <MdClose className="w-6 h-6 text-white" />
      </button>
      <div className="relative">
        <img src="/video-img-admin.png" alt="" className="w-full h-55" />
        <div className="absolute top-4 left-4 bg-black/60 rounded-md text-white py-1.5 px-3 font-roboto text-xs font-medium">
          245 in stock
        </div>
        <div className="absolute bottom-4 right-4 bg-black/60 rounded-md text-white py-1.5 px-3 font-roboto text-base font-medium">
          8,500
        </div>
      </div>
      <div className="flex flex-col gap-2 font-lexend text-white font-light">
        <h3 className="text-base">DeyMake Cap</h3>
        <span className="text-sm">by @king_man</span>
        <span className="text-sm">ID: PROD-0001</span>
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
      <div className="bg-blue300 p-6 flex flex-col gap-3 rounded-2xl font-roboto">
        <h5 className=" text-lg text-white">Description</h5>
        <p className="text-xs font-medium text-white">
          Premium DeyMake cap made with high-quality materials. Adjustable strap
          for a perfect fit.
        </p>
      </div>
      <div className="bg-blue300 rounded-2xl flex flex-col gap-7.5 p-6 font-roboto">
        <h5 className=" text-lg text-white">Product Information</h5>
        <div className="flex flex-col gap-4">
          {productInfo.map(({ title, value }, i) => (
            <div key={title} className="flex items-center justify-between">
              <span className="text-xs font-medium text-white">{title}</span>
              <span
                className={`text-xs font-medium ${i === 2 ? "text-green100" : "text-white"}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">{btns.map(({ title, icon: Icon }, i) => (
        <button
          key={title}
          className={`border rounded-md flex items-center gap-3 h-12 justify-center text-xs ${i === btns.length - 1 ? "border-red100 text-red100" : "border-white text-white"}`}
        >
          <Icon className="w-4 h-4" />
          {title}
        </button>
      ))}</div>
    </section>
  );
}

export default ProductModal;
