import { CiSearch } from "react-icons/ci";
import { PiExport } from "react-icons/pi";

function Menu({
  activeTab,
  handleActiveTabChange,
  tabs,
  searchQuery,
  handleSearchQueryChange,
  handleReasonTypeChange,
  handleSuspendedTypeChange,
  suspensionTypes,
  reasonTypes,
  reasonType,
  suspendedType,
}) {
  return (
    <div className="flex flex-col gap-5  w-full">
      <menu className="flex items-center font-roboto max-w-210 w-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleActiveTabChange(tab)}
            className={`py-3 px-3 border-b-2 flex-1 text-sm ${
              activeTab === tab
                ? "border-b-red100 text-white"
                : "border-b-zinc300 text-zinc300"
            }`}
          >
            {tab}
          </button>
        ))}
      </menu>
      <div className="flex items-end gap-2">
        <div className="flex-1 p-2.5 rounded-xl border border-zinc50 gap-4 flex items-center">
          <CiSearch className="w-5 h-5 text-blue100" />
          <input
            value={searchQuery}
            onChange={(e) => handleSearchQueryChange(e.target.value)}
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
            value={suspendedType}
            onChange={(e) => handleSuspendedTypeChange(e.target.value)}
            className="px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
          >
            <option value="">All type</option>
            {suspensionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 font-roboto">
          <h3 className="text-blue100 text-base ">Reason</h3>
          <select
            name=""
            id=""
            value={reasonType}
            onChange={(e) => handleReasonTypeChange(e.target.value)}
            className="px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
          >
            <option value="">All reason</option>
            {reasonTypes.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 font-roboto">
          <h3 className="text-blue100 text-base ">Date Range</h3>
          <input
            type="date"
            name=""
            id=""
            placeholder="Select data range"
            className="px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
          />
        </div>
        <button className="text-base flex-1 bg-blue300/30 border border-zinc300 rounded-sm flex items-center py-2.5 px-2 justify-center text-zinc300 gap-3">
          <PiExport /> Export
        </button>
      </div>
    </div>
  );
}

export default Menu;
