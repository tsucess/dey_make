import { useState } from "react";
import { FaGraduationCap } from "react-icons/fa";
import { FaNairaSign } from "react-icons/fa6";
import { GoVerified } from "react-icons/go";
import { LiaTshirtSolid } from "react-icons/lia";
import { LuWallet } from "react-icons/lu";
import { VscRobot } from "react-icons/vsc";
import AcademyTool from "./AcademyTool";
import WalletTool from "./WalletTool";

const tools = [
  { title: "Academy", icon: FaGraduationCap },
  { title: "Wallet", icon: LuWallet },
  { title: "AI Studio", icon: VscRobot },
  { title: "Verify", icon: GoVerified },
  { title: "Revenue", icon: FaNairaSign },
  { title: "Merch", icon: LiaTshirtSolid },
];

function CreatorTool() {
  const [activeTool, setActiveTool] = useState("Academy");

  function handleActiveToolChange(value) {
    setActiveTool(value);
  }
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        {tools.map(({ title, icon: Icon }, i) => (
          <button
            onClick={() => handleActiveToolChange(title)}
            key={title}
            className={`transition-all text-sm py-3 px-5 rounded-xl font-semibold flex items-center gap-3 ${
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
      {activeTool === "Academy" && <AcademyTool />}
      {activeTool === "Wallet" && <WalletTool />}
    </div>
  );
}

export default CreatorTool;
