import { CiSearch } from "react-icons/ci";
import { PiExport } from "react-icons/pi";

function Menu({
  tabs,
  activeTab,
  statuses,
  status,
  handleStatusChange,
  handleActiveTabChange,
  searchQuery,
  handleSearchQueryChange,
  handleTypeChange,
  types,
  currentType,
}) {
  return (
    <div className="flex flex-col gap-5  w-full">
      <menu className="flex items-center font-roboto w-full">
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
            type="search"
            name=""
            id=""
            value={searchQuery}
            onChange={(e) => handleSearchQueryChange(e.target.value)}
            placeholder="Search by username, ID or email"
            className="text-xs text-blue100 font-medium flex-1 py-1 outline-none"
          />
        </div>
        <div className="flex-1 flex flex-col gap-1.5 font-roboto">
          <h3 className="text-blue100 text-base ">Status</h3>
          <select
            name=""
            id=""
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
          >
            <option value="">All Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 font-roboto">
          <h3 className="text-blue100 text-base ">Type</h3>
          <select
            name=""
            id=""
            value={currentType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
          >
            <option value="">All Type</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 font-roboto">
          <h3 className="text-blue100 text-base ">Creator</h3>
          <select
            name=""
            id=""
            //   value={reasonType}
            onChange={(e) => handleReasonTypeChange(e.target.value)}
            className="px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
          >
            <option value="">All Creator</option>
            {/* {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))} */}
          </select>
        </div>
        
      </div>
    </div>
  );
}

export default Menu;
