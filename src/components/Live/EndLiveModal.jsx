/**
 * EndLiveModal — host-side confirm dialog before stopping the stream.
 *
 * Confirms the End-Live action from LiveNew; on confirm, the parent calls
 * api.stopVideoLive and navigates to the post-live analytics screen.
 *
 * Feature: 3.5 Live streaming (see PROJECT_OVERVIEW.md).
 * Backend (via parent): VideoController@stopLive.
 */


import { FaUserPlus } from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import { LuEye } from "react-icons/lu";
import { formatCompactNumber } from "../../utils/content";

function formatDuration(startedAt) {
  if (!startedAt) return "19:45";
  const startMs = new Date(startedAt).getTime();
  if (Number.isNaN(startMs)) return "19:45";
  const seconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  const pad = (n) => `${n}`.padStart(2, "0");
  return `${pad(mm)}:${pad(ss)}`;
}

function EndLiveModal({ handleEndLive, onDismiss, video, summary, ending }) {
  const duration = formatDuration(video?.liveStartedAt);
  const peakViewers = Number(video?.liveAnalytics?.peakViewers ?? summary?.peakViewers ?? 1632);
  const newFollows = Number(summary?.newFollows ?? 132);
  const dismiss = onDismiss || handleEndLive;

  return (
    <div className="absolute bg-black/20 backdrop-blur-sm inset-0 h-full flex items-center justify-center font-inter z-100 p-6">
      <section className="rounded-2xl p-6 md:p-12.5 border border-black/40 dark:border-white/40 flex flex-col gap-10 bg-white300 dark:bg-black400 max-w-111 w-full">
        <div className="flex flex-col gap-6 items-center">
          <div className="flex flex-col gap-1 md:items-center">
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
                  {duration}
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
                  {formatCompactNumber(peakViewers)}
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
                  +{formatCompactNumber(newFollows)}
                </h4>
                <span className="text-[11px] font-extralight text-black dark:text-white">
                  New Follows
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <button
            onClick={dismiss}
            className="px-3 md:px-6 py-3 w-full rounded-sm bg-black100 border border-white/12 text-white text-sm "
          >
            Keep Going
          </button>
          <button
            onClick={handleEndLive}
            disabled={ending}
            className="px-3 md:px-6 py-3 w-full rounded-sm bg-orange100 text-slate100 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {ending ? "Ending..." : "End Stream"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default EndLiveModal;
