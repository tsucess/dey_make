import { CiSearch } from "react-icons/ci";
import { PiExport } from "react-icons/pi";

function Menu({ activeTab, handleActiveTabChange }) {
  return (
    <div className="flex flex-col gap-5  w-full">
      <menu className="flex items-center font-roboto max-w-210 w-full">
        <button
          onClick={() => handleActiveTabChange("All Suspended")}
          className={`py-3 px-3 border-b-2 flex-1 text-sm ${
            activeTab === "All Suspended"
              ? "border-b-red100 text-white"
              : "border-b-zinc300 text-zinc300"
          }`}
        >
          All Suspended
        </button>
        <button
          onClick={() => handleActiveTabChange("Banned Permanently")}
          className={`py-3 px-3 border-b-2 flex-1 text-sm ${
            activeTab === "Banned Permanently"
              ? "border-b-red100 text-white"
              : "border-b-zinc300 text-zinc300"
          }`}
        >
          Banned Permanently
        </button>
        <button
          onClick={() => handleActiveTabChange("Temporary Suspensions")}
          className={`py-3 px-3 border-b-2 flex-1 text-sm ${
            activeTab === "Temporary Suspensions"
              ? "border-b-red100 text-white"
              : "border-b-zinc300 text-zinc300"
          }`}
        >
          Temporary Suspensions
        </button>
        <button
          onClick={() => handleActiveTabChange("Appeal in Progress")}
          className={`py-3 px-3 border-b-2 flex-1 text-sm ${
            activeTab === "Appeal in Progress"
              ? "border-b-red100 text-white"
              : "border-b-zinc300 text-zinc300"
          }`}
        >
          Appeal in Progress
        </button>
      </menu>
      <div className="flex items-end gap-2">
        <div className="flex-1 p-2.5 rounded-xl border border-zinc50 gap-4 flex items-center">
          <CiSearch className="w-5 h-5 text-blue100" />
          <input
            type="search"
            name=""
            id=""
            placeholder="Search by username, ID or email"
            className="text-xs text-blue100 font-medium flex-1 py-1 outline-none"
          />
        </div>
        <div className="flex-1 flex flex-col gap-1.5 font-roboto">
            <h3 className="text-blue100 text-base ">Suspension Type</h3>
            <select
          name=""
          id=""
          className="px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
        >
          <option value="">All type</option>
        </select>

        </div>
        <div className="flex-1 flex flex-col gap-1.5 font-roboto">
            <h3 className="text-blue100 text-base ">Reason</h3>
            <select
          name=""
          id=""
          className="px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
        >
          <option value="">Reason type</option>
        </select>

        </div>
        <div className="flex-1 flex flex-col gap-1.5 font-roboto">
            <h3 className="text-blue100 text-base ">Date Range</h3>
            <input type="date" name="" id=""  placeholder="Select data range"  className="px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"/>
            

        </div>
        <button className="text-base flex-1 bg-blue300/30 border border-zinc300 rounded-sm flex items-center py-2.5 px-2 justify-center text-zinc300 gap-3">
                <PiExport /> Export</button>
      </div>
    </div>
  );
}

export default Menu;
