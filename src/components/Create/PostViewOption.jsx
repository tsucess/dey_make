import { useState } from "react";
import { FiLock, FiUsers } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import { PiBasketballLight } from "react-icons/pi";
import { TbHearts } from "react-icons/tb";

const settings = [
  {
    title: "Everyone",
    desc: "Anyone on DeyMake",
    icon: PiBasketballLight,
  },
  {
    title: "Followers",
    desc: "Only your followers",
    icon: FiUsers,
  },
  {
    title: "Friends",
    desc: "Mutual follows only",
    icon: TbHearts,
  },
  {
    title: "Only me",
    desc: "Only me",
    icon: FiLock,
  },
];

function PostViewOption({ toggleShowPostView }) {
  const [selectedViewOption, setSelectedViewOption] = useState("Everyone");

  function handleSelectedViewOptionChange(option) {
    setSelectedViewOption(option);
  }
  return (
    <div className="p-5 font-inter fixed bottom-0 left-0 right-0 flex flex-col gap-10 z-100 bg-white dark:bg-slate100">
      <div className="flex items-center justify-between gap-1">
        <h2 className="text-base text-black dark:text-white">
          Privacy Settings
        </h2>
        <button onClick={toggleShowPostView}>
          <MdClose className="w-6 h-6 text-black dark:text-white" />
        </button>
      </div>

      <div className="flex flex-col gap-5 bg-slate150/50 dark:bg-grey rounded-xl p-4">
        <h4 className="text-base font-semibold text-black dark:text-white">
          Who can view this post
        </h4>
      
      <div className="flex flex-col gap-4.5">
        {settings.map(({ title, desc, icon: Icon }, i) => (
          <div className="flex justify-between items-center gap-3 border border-black/30 rounded-2xl dark:border-white/30 p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-md w-8 h-8 border border-black/40 dark:border-white/40 flex items-center justify-center">
                <Icon className="w-5 h-5 text-black dark:text-white" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm text-black dark:text-white font-semibold">
                  {title}
                </h4>
                <span className="text-[11px] text-black dark:text-white font-thin">
                  {desc}
                </span>
              </div>
            </div>

            <div>
              <input
                onChange={() => handleSelectedViewOptionChange(title)}
                checked={selectedViewOption === title}
                type="radio"
                name="setting"
                value={title}
                id=""
                className="accent-orange100 "
              />
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default PostViewOption;
