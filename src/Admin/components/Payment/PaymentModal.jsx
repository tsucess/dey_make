import { MdClose } from "react-icons/md";


const paymentInfo = [
  { title: "Order ID", value: "ORD-2024-001234" },
  { title: "Creator", value: "G" },
  { title: "Payment Method", value: "Visa ****** 4242" },
  { title: "Payment Gateway", value: "Flutterwave" },
  { title: "Reference ID", value: "FLW-67834928374" },
  { title: "Description", value: "Payment for Order #ORD-2024-001234" },
];

const amountBreakdown = [
  { title: "Subtotal", value: "26,000" },
  { title: "Shipping Fee", value: "2,500" },
  { title: "Discount", value: "0" },
  { title: "Platform Fee (5%)", value: "1,308" },
  { title: "Total Amount", value: "28,500" },
];

const btns = [
  { icon: GrEdit, title: "View Order" },
  { icon: IoDuplicateOutline, title: "Issue Refund" },
  { icon: LuView, title: "Download Receipt" },
];

function PaymentModal({handleCloseModal}) {
  return (
    <section className="w-full max-w-150 absolute top-0 right-0 p-7.5 flex flex-col bg-black900 z-100 gap-7.5 h-screen overflow-y-auto">
      <button onClick={handleCloseModal} className="self-end cursor-pointer">
        <MdClose className="w-6 h-6 text-white" />
      </button>
      <h5 className=" text-lg text-white font-roboto">Transaction Details</h5>
      <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2 font-lexend text-white font-light">
        <div className="flex flex-col gap-1">
          <span className="text-xl">TXN-1234567890</span>
          <span className="text-[10px]">May 26, 2024 at 10:30 AM</span>
        </div>
        <span className="text-sm font-lexend text-green500 font-light">
          Payment
        </span>
      </div>
      <span className="font-lexend text-white font-light text-[32px]">28,500</span>
      </div>
      <div className="bg-blue300 rounded-2xl flex flex-col gap-7.5 p-6 font-roboto">
        <h5 className=" text-lg text-white">Payment Information</h5>
        <div className="flex flex-col gap-4">
          {paymentInfo.map(({ title, value }, i) => (
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
        <h5 className=" text-lg text-white">Discount Information</h5>
        <div className="flex flex-col gap-4">
          {amountBreakdown.map(({ title, value }, i) => (
            <div key={title} className="flex items-center justify-between">
              <span
                className={`text-xs font-medium text-white ${i === amountBreakdown.length - 1 ? "text-sm font-bold" : ""}`}
              >
                {title}
              </span>
              <span
                className={`text-xs font-medium text-white ${i === amountBreakdown.length - 1 ? "text-sm font-bold" : ""}`}
              >
                {value}
              </span>
            </div>
          ))}
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

export default PaymentModal;
