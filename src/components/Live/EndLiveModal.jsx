import { FaUserPlus } from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import { LuEye } from "react-icons/lu";

function EndLiveModal({ handleEndLive }) {
  return (
    <div className="absolute bg-black/20 backdrop-blur-sm inset-0 h-full flex items-center justify-center font-inter z-40">
      <section className="rounded-2xl p-12.5 border border-black/40 dark:border-white/40 flex flex-col gap-10 bg-white300 dark:bg-black400 max-w-111 w-full">
        <div className="flex flex-col gap-6 items-center">
          <div className="flex flex-col gap-1 items-center">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              End Your Stream?
            </h2>
            <p className="text-sm text-black dark:text-white">
              Your viewers will be notified the stream ended.
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex flex-col gap-3 items-center">
              <FiClock className="w-6 h-6 text-cyan200" />
              <div className="flex flex-col items-center">
                <h4 className="text-base font-bold text-black dark:text-white">
                  19:45
                </h4>
                <span className="text-[11px] font-extralight text-black dark:text-white">
                  Duration
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 items-center">
              <LuEye className="w-6 h-6 text-red100" />
              <div className="flex flex-col items-center">
                <h4 className="text-base font-bold text-black dark:text-white">
                  1,632
                </h4>
                <span className="text-[11px] font-extralight text-black dark:text-white">
                  Peak Viewers
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 items-center">
              <FaUserPlus className="w-6 h-6 text-green300" />
              <div className="flex flex-col items-center">
                <h4 className="text-base font-bold text-black dark:text-white">
                  +132
                </h4>
                <span className="text-[11px] font-extralight text-black dark:text-white">
                  New Follows
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={handleEndLive}
            className="px-6 py-3 rounded-sm bg-black100 border border-white/12 text-white text-sm "
          >
            Keep Going
          </button>
          <button
            onClick={handleEndLive}
            className="px-6 py-3 rounded-sm bg-orange100 text-slate100 text-sm "
          >
            End Stream
          </button>
        </div>
      </section>
    </div>
  );
}

export default EndLiveModal;
