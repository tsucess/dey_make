import { CiSearch } from "react-icons/ci";
import { PiExport } from "react-icons/pi";

function Menu({
  tabs,
  activeTab,
  categories,
  statuses,
  category,
  handleCategoryChange,
  status,
  handleStatusChange,
  handleActiveTabChange,
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
        <div className="flex-1 flex flex-col gap-1.5 font-roboto">
          <h3 className="text-blue100 text-base ">Category</h3>
          <select
            name=""
            id=""
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
          >
            <option value="">All Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
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
      </div>
    </div>
  );
}

export default Menu;
