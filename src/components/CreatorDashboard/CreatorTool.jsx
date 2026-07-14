import { useState } from "react";
import { FaGraduationCap, FaHandHoldingUsd } from "react-icons/fa";
import { FaNairaSign } from "react-icons/fa6";
import { GoVerified } from "react-icons/go";
import { LiaTshirtSolid } from "react-icons/lia";
import { LuWallet } from "react-icons/lu";
import { VscRobot } from "react-icons/vsc";
import AcademyTool from "./AcademyTool";
import WalletTool from "./WalletTool";
import AiStudioTool from "./AiStudioTool";
import VerificationTool from "./VerificationTool";
import RevenueTool from "./RevenueTool";
import MerchTool from "./MerchTool";
import SponsorHub from "./SponsorHub";

const tools = [
  { title: "Academy", icon: FaGraduationCap },
  { title: "Wallet", icon: LuWallet },
  { title: "AI Studio", icon: VscRobot },
  { title: "Verify", icon: GoVerified },
  { title: "Revenue", icon: FaNairaSign },
  { title: "Merch", icon: LiaTshirtSolid },
  { title: "Sponsor Hub", icon: FaHandHoldingUsd },
];

function CreatorTool() {
  const [activeTool, setActiveTool] = useState("Academy");

  function handleActiveToolChange(value) {
    setActiveTool(value);
  }
  return (
    <div className="flex flex-col gap-8">
      <div
        className="overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex items-center gap-3 min-w-200 w-full">
          {tools.map(({ title, icon: Icon }, i) => (
            <button
              onClick={() => handleActiveToolChange(title)}
              key={title}
              className={`transition-all text-sm py-2 md:py-3 px-4 md:px-5 rounded-xl font-semibold flex items-center gap-3 ${
                activeTool === title
                  ? "bg-orange100 text-black hover:bg-orange200"
                  : "text-black dark:text-white hover:bg-slate150 hover:dark:bg-black500"
              }`}
            >
              {" "}
              <Icon className="w-5 h-5" /> {title}
            </button>
          ))}
        </div>
      </div>
      {activeTool === "Academy" && <AcademyTool />}
      {activeTool === "Wallet" && <WalletTool />}
      {activeTool === "AI Studio" && <AiStudioTool />}
      {activeTool === "Verify" && <VerificationTool />}
      {activeTool === "Revenue" && <RevenueTool />}
      {activeTool === "Merch" && <MerchTool />}
      {activeTool === "Sponsor Hub" && <SponsorHub />}
    </div>
  );
}

export default CreatorTool;
