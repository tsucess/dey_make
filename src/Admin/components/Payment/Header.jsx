import { PiExport } from "react-icons/pi";

function Header() {
  return (
    <header className="flex items-center gap-3 justify-between">
      <div className="flex flex-col gap-1 font-inter">
        <h1 className="text-lg font-medium text-white">Payments</h1>
        <p className="text-sm text-white">
          Track payments, settlements and payout activities.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-base bg-blue300/30 border border-zinc300 rounded-sm flex items-center py-2 px-8 text-zinc300 gap-3">
          <PiExport /> Export
        </button>
        {/* <button className="bg-orange100 text-base text-slate100 rounded-sm py-2 px-8 hover:bg-orange500 transition-all cursor-pointer">Create Discount</button> */}
      </div>
    </header>
  );
}

export default Header;
