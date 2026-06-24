import { useState } from "react";
import ProductSection from "./ProductSection";
import SetupSection from "./SetupSection";

function MerchTool() {
  const [isLive, setIsLive] = useState(false);

  function handleToggleIsLive() {
    setIsLive((prev) => !prev);
  }

  return (
    <div className="flex flex-col gap-9">
      <div className="px-5 py-7.5 bg-white300 rounded-2xl dark:bg-black600 flex items-center justify-between gap-2">
        <div className="flex gap-5.5 divide-x divide-black dark:divide-white items-center">
          <div className="flex flex-col gap-1.25 pr-5">
            <span className="text-[10px] text-black dark:text-white">
              Total Sales
            </span>
            <h2 className="text-base font-bold text-black dark:text-white">
              $9,702
            </h2>
          </div>
          <div className="flex flex-col gap-1.25">
            <span className="text-[10px] text-black dark:text-white">
              Products
            </span>
            <h2 className="text-base font-bold text-black dark:text-white">
              2
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={handleToggleIsLive}
            className={`w-16 h-7 p-0.5 rounded-full flex items-center ${isLive ? "bg-red100 justify-end" : "bg-slate850/10 dark:bg-slate850/30 justify-start"}`}
          >
            <span className="w-10 h-6 rounded-full bg-white200"></span>
          </button>
          <span className="text-[10px] text-black dark:text-white">Live</span>
        </div>
      </div>

      <ProductSection />

      <SetupSection />
    </div>
  );
}

export default MerchTool;
