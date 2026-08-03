import { useState } from "react";
import Header from "../components/Create Challenge/Header";
import Menu from "../components/Create Challenge/Menu";
import StepOneForm from "../components/Create Challenge/StepOneForm";
import RewardsAndPrizes from "../components/Create Challenge/RewardsAndPrizes";

function CreateChallenge() {
  const [activeMenu, setActiveMenu] = useState(2);

  function handleActiveMenuChange(num) {
    setActiveMenu(num);
  }

  return (
    <div className="flex flex-col gap-7">
      <Header />
      <Menu activeMenu={activeMenu} />
      {activeMenu === 1 && <StepOneForm />}
      {activeMenu === 2 && <RewardsAndPrizes />}
    </div>
  );
}

export default CreateChallenge;
