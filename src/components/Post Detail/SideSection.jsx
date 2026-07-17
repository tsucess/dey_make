import { useState } from "react";
import Comments from "./Comments";

const tabs = ["Comments", "Creator videos"];

function SideSection() {
  const [activeTab, setActiveTab] = useState("Comments");

  function handleActiveTabChange(tab) {
    setActiveTab(tab);
  }

  return (
    <div className=" flex flex-col gap-5 w-full">
      <div className="flex items-center">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleActiveTabChange(tab)}
            className={`
                    ${activeTab === tab ? "text-orange100 border-b-orange100" : "border-slate500 text-slate250"}
                    border-b-2 pb-2 flex-1 text-sm font-semibold `}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === 'Comments' && <Comments />}
    </div>
  );
}

export default SideSection;
