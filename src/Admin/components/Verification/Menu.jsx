import { CiSearch } from "react-icons/ci";

function Menu({
  tabs,
  activeTab,
  handleActiveTabChange,
  searchQuery,
  handleSearchQueryChange,
  verificationTypes,
  handleVerifyTypeChange,
  categories,
  handleCategoryTypeChange,
}) {
  return (
    <div className="flex flex-col gap-5 max-w-210 w-full">
      <menu className="flex items-center font-roboto">
        {tabs.map((tab) => (
          <button
          key={tab}
            onClick={() => handleActiveTabChange(tab)}
            className={`py-3 px-3 border-b-2 flex-1 text-sm cursor-pointer ${
              activeTab === tab
                ? "border-b-red100 text-white"
                : "border-b-zinc300 text-zinc300"
            }`}
          >
            {tab}
          </button>
        ))}
      </menu>
      <div className="flex items-center gap-2">
        <div className="flex-1 p-2.5 rounded-xl border border-zinc50 gap-4 flex items-center">
          <CiSearch className="w-5 h-5 text-blue100" />
          <input
            value={searchQuery}
            onChange={(e) => handleSearchQueryChange(e.target.value.trim())}
            type="search"
            name=""
            id=""
            placeholder="Search by username, ID or email"
            className="text-xs text-blue100 font-medium flex-1 py-1 outline-none"
          />
        </div>
        <select
          name=""
          id=""
          className="flex-1 px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
          onChange={(e) => handleVerifyTypeChange(e.target.value)}
        >
          <option value="">All</option>
          {verificationTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          name=""
          id=""
          className="flex-1 px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
          onChange={(e) => handleCategoryTypeChange(e.target.value)}
        >
          <option value="">All</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Menu;
