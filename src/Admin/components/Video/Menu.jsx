import { CiSearch } from "react-icons/ci";
import { PiExport } from "react-icons/pi";

function Menu({
  activeTab,
  handleActiveTabChange,
  tabs,
  categories,
  category,
  handleCategoryChange,
  status,
  currentStatus,
  handleStatusChange,
  searchQuery,
  handleSearchQueryChange,
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
          <h3 className="text-blue100 text-base ">Category</h3>
          <select
            name=""
            id=""
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
          >
            <option value="">All Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 font-roboto">
          <h3 className="text-blue100 text-base ">Status</h3>
          <select
            name=""
            id=""
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
          >
            <option value="">Status type</option>
            {status.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 font-roboto">
          <h3 className="text-blue100 text-base ">Visibility</h3>
          <select
            name=""
            id=""
            className="px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
          >
            <option value="">Visibility type</option>
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 font-roboto">
          <h3 className="text-blue100 text-base ">Uploaded Date</h3>
          <input
            type="date"
            name=""
            id=""
            placeholder="Select data range"
            className="px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
          />
        </div>
      </div>
    </div>
  );
}

export default Menu;
