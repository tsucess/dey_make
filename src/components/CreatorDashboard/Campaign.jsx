import { BsDot } from "react-icons/bs";
import { FiPlay } from "react-icons/fi";
import { MdArrowForwardIos } from "react-icons/md";

function Campaign({ campaign }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-5 py-5 px-7.5 items-center border border-black/30 dark:border-white/30 rounded-2xl hover:bg-slate150/50 dark:hover:bg-slate350/20 transition-all">
        <div className="w-50 h-50 rounded-md bg-slate150 dark:bg-white shrink-0"></div>
        <div className="flex flex-col gap-6 flex-1">
          <div className="flex items-start justify-between">
            {" "}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3.5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-black dark:text-white text-lg font-bold">
                    {campaign.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-black dark:text-white">
                      {campaign.company}
                    </span>
                    <BsDot className="w-4 h-4 text-black dark:text-white" />
                    <span className="text-xs text-black dark:text-white">
                      {campaign.category}
                    </span>
                  </div>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-sm text-sm font-medium ${
                    campaign.tab === "Active"
                      ? "bg-green100/24 text-green100"
                      : "bg-blue/24 text-blue"
                  }`}
                >
                  {campaign.tab}
                </div>
              </div>
              <div className="flex items-center gap-4.75">
                <span className="text-sm text-orange100">
                  ₦{campaign.budget} budget
                </span>
                <span className="text-sm text-slate250">
                  {campaign.gottenCreator}/{campaign.needCreator} creator
                </span>
                <span className="text-sm text-blue">
                  {campaign.appliedCreator} applied &gt;
                </span>
              </div>
            </div>
            
          </div>
          {campaign.raised && (
            <div className="flex flex-col gap-3">
              <span className="text-xs text-black dark:text-white">
                ₦{campaign.raised}
              </span>
              <div className="flex items-center gap-3">
                {" "}
                <div className="flex-1 h-1 bg-slate500 w-full flex">
                  <span
                    style={{
                      width: `${Math.floor((campaign.raised / campaign.budget) * 100)}%`,
                    }}
                    className="bg-red100 h-full "
                  ></span>{" "}
                </div>{" "}
                <span className="text-xs text-black dark:text-white">
                  {Math.floor((campaign.raised / campaign.budget) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {
            [1,2,3,4,5,6].map(i => <div key={i} className="relative h-100">
                <img src="/entry1.png" alt="" className="w-full h-full"/>
                <div className="absolute bottom-5 left-5 text-xs text-white font-semibold flex items-center gap-1">
                    <FiPlay className="w-4 h-4" />
                  8.2M
                </div>
            </div>)
        }
      </div>
    </div>
  );
}

export default Campaign;
