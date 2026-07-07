import { CiSearch } from "react-icons/ci";

function Menu({ activeTab, handleActiveTabChange }) {
  return (
    <div className="flex flex-col gap-5 max-w-210 w-full">
      <menu className="flex items-center font-roboto">
        <button
          onClick={() => handleActiveTabChange("Pending Review")}
          className={`py-3 px-3 border-b-2 flex-1 text-sm ${
            activeTab === "Pending Review"
              ? "border-b-red100 text-white"
              : "border-b-zinc300 text-zinc300"
          }`}
        >
          Pending Review (27)
        </button>
        <button
          onClick={() => handleActiveTabChange("Approved")}
          className={`py-3 px-3 border-b-2 flex-1 text-sm ${
            activeTab === "Approved"
              ? "border-b-red100 text-white"
              : "border-b-zinc300 text-zinc300"
          }`}
        >
          Approved (182)
        </button>
        <button
          onClick={() => handleActiveTabChange("Reject")}
          className={`py-3 px-3 border-b-2 flex-1 text-sm ${
            activeTab === "Reject"
              ? "border-b-red100 text-white"
              : "border-b-zinc300 text-zinc300"
          }`}
        >
          Reject (36)
        </button>
      </menu>
      <div className="flex items-center gap-2">
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
        <select
          name=""
          id=""
          className="flex-1 px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
        >
          <option value="">All type</option>
        </select>
        <select
          name=""
          id=""
          className="flex-1 px-2.5 py-3.5 rounded-xl border border-zinc50 text-xs text-blue100"
        >
          <option value="">All Category</option>
        </select>
      </div>
    </div>
  );
}

export default Menu;
