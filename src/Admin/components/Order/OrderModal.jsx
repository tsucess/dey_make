import { LuView } from "react-icons/lu";
import { MdClose } from "react-icons/md";

const orderSummary = [
  { title: "Item (3)", value: "25,000" },
  { title: "Shipping Fee", value: "2,500" },
  { title: "Tax (5%)", value: "1,000" },
  { title: "Total Amount", value: "28,500" },
];

const paymentInfo = [
  { title: "Method", value: "Visa ****** 4343" },
  { title: "Transaction ID", value: "TXN-489422567654BG" },
  { title: "Paid At", value: "May 26, 2025 12:00 AM" },
  { title: "Payment Status", value: "Paid" },
];

const shippingInfo = [
  {
    title: "Address",
    value: "12 Admiralty way, Lekki Phase 1, Lagos State, Nigeria.",
  },
  { title: "Shipping Method", value: "Express Shipping" },
  { title: "Tracking Number", value: "SHP123456789NG" },
];

const btns = [{ icon: LuView, title: "View Product Page" }];

function OrderModal({ handleCloseModal }) {
  return (
    <section className="w-full max-w-150 absolute top-0 right-0 p-7.5 flex flex-col bg-black900 z-100 gap-7.5 h-screen overflow-y-auto">
      <button onClick={handleCloseModal} className="self-end cursor-pointer">
        <MdClose className="w-6 h-6 text-white" />
      </button>
      <h5 className=" text-lg text-white font-roboto">Order Details</h5>
      <div className="flex flex-col gap-2 font-lexend text-white font-light">
        <div className="flex flex-col gap-1">
          <span className="text-xl">ORD-2026-001234</span>
          <span className="text-[10px] text-green500">Delivered</span>
        </div>
        <span className="text-sm">May 26, 2026 at 10:34 AM</span>
      </div>
      <div className="bg-blue300 rounded-2xl flex flex-col gap-7.5 p-6 font-roboto">
        <h5 className=" text-lg text-white">Customer</h5>
        <div className="flex items-center gap-5">
          <div className="w-17.5 h-17.5 rounded-full bg-white"></div>
          <div className="flex flex-col gap-2 font-lexend text-white font-light">
            <div className="flex flex-col gap-1">
              <span className="text-sm">Gloria James</span>
              <span className="text-[10px]">ID: VID-2024-1234511</span>
            </div>
            <span className="text-xs font-medium text-orange100 font-roboto">
              View Profile
            </span>
          </div>
        </div>
      </div>
      <div className="bg-blue300 rounded-2xl flex flex-col gap-7.5 p-6 font-roboto">
        <h5 className=" text-lg text-white">Order Summary</h5>
        <div className="flex flex-col gap-4">
          {orderSummary.map(({ title, value }, i) => (
            <div key={title} className="flex items-center justify-between">
              <span
                className={`text-xs font-medium text-white ${i === orderSummary.length - 1 ? "text-sm font-bold" : ""}`}
              >
                {title}
              </span>
              <span
                className={`text-xs font-medium text-white ${i === orderSummary.length - 1 ? "text-sm font-bold" : ""}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-blue300 rounded-2xl flex flex-col gap-7.5 p-6 font-roboto">
        <h5 className=" text-lg text-white">Payment Information</h5>
        <div className="flex flex-col gap-4">
          {paymentInfo.map(({ title, value }, i) => (
            <div key={title} className="flex items-center justify-between">
              <span className="text-xs font-medium text-white">{title}</span>
              <span
                className={`text-xs font-medium ${i === 3 ? "text-green100" : "text-white"}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue300 rounded-2xl flex flex-col gap-7.5 p-6 font-roboto">
        <h5 className=" text-lg text-white">Shipping Information</h5>
        <div className="flex flex-col gap-4">
          {shippingInfo.map(({ title, value }, i) => (
            <div key={title} className="flex items-center justify-between">
              <span className="text-xs font-medium text-white">{title}</span>
              <span className={`text-xs font-medium text-white`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-blue300 rounded-2xl flex flex-col gap-7.5 p-6 font-roboto">
        <h5 className=" text-lg text-white">Checkout Information</h5>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7.5 h-7.5 bg-white"></div>
                <div className="flex flex-col gap-1 font-lexend font-light text-white">
                  <span className="text-sm">DeyMake Cap</span>
                  <span className="text-[10px]">ID-PRO-0001</span>
                </div>
              </div>
              <div className="flex items-center gap-2 font-roboto text-white font-medium text-xs">
                <span>8,500</span>
                <span>x1</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 bg-blue300 p-6 rounded-2xl">
        {btns.map(({ title, icon: Icon }, i) => (
          <button
            key={title}
            className={`border rounded-md flex items-center gap-3 h-12 justify-center text-xs border-white text-white cursor-pointer`}
          >
            <Icon className="w-4 h-4" />
            {title}
          </button>
        ))}
      </div>
    </section>
  );
}

export default OrderModal;
