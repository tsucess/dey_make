import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";

function MoreOptions({ toggleShowMoreOptions }) {
  const [settings, setSetting] = useState({
    allowComments: true,
    allowReuseContent: true,
    aIeneratedContent: false,
    allowVisualSearch: true,
    saveToDevice: false,
    savePostWithWatermark: false,
    audienceControls: true,
  });

  function toggleSettings(setting) {
    setSetting((prev) => ({ ...prev, [setting]: !prev[setting] }));
  }

  return (
    <div className="flex flex-col gap-10 p-5 font-inter fixed inset-0 z-30 bg-white dark:bg-black overflow-y-auto pb-20">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={toggleShowMoreOptions}
          className="w-7.5 h-7.5 flex items-center justify-center border border-black/10 dark:border-white/10 rounded-md hover:bg-slate150 transition-all"
        >
          <FaArrowLeft className="text-black dark:text-white w-4 h-4 " />
        </button>
        <h2 className="text-sm font-medium text-black/65 dark:text-white/65">
          More options
        </h2>
        <FiInfo className="w-5 h-5 text-black dark:text-white" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <h3 className="text-xs text-zinc500 font-medium">Privacy settings</h3>
          <div className="flex flex-col gap-2.5 p-5 rounded-xl bg-white300 dark:bg-slate100">
            <div className="flex items-center gap-3 justify-between">
              <h4 className="text-sm font-bold text-black dark:text-white">
                Allow comments
              </h4>
              <button
                onClick={() => toggleSettings("allowComments")}
                className={`${
                  settings["allowComments"]
                    ? "border-cyan bg-cyan justify-end"
                    : "justify-start bg-transparent border-slate250"
                } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
              >
                <span
                  className={`w-2 h-1.75 rounded-full ${
                    settings["allowComments"] ? "bg-slate100" : "bg-slate250"
                  }`}
                ></span>
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 p-5 rounded-xl bg-white300 dark:bg-slate100">
            <div className="flex items-center gap-3 justify-between">
              <h4 className="text-sm font-bold text-black dark:text-white">
                Allow reuse of content
              </h4>
              <button
                onClick={() => toggleSettings("allowReuseContent")}
                className={`${
                  settings["allowReuseContent"]
                    ? "border-cyan bg-cyan justify-end"
                    : "justify-start bg-transparent border-slate250"
                } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
              >
                <span
                  className={`w-2 h-1.75 rounded-full ${
                    settings["allowReuseContent"] ? "bg-slate100" : "bg-slate250"
                  }`}
                ></span>
              </button>
            </div>
            <p className="text-xs text-black dark:text-white">
              Duet, Stitch, stickers and add to story
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs text-zinc500 font-medium">Privacy settings</h3>
          <div className="flex flex-col gap-2.5 p-5 rounded-xl bg-white300 dark:bg-slate100">
            <div className="flex items-center gap-3 justify-between">
              <h4 className="text-sm font-bold text-black dark:text-white">
                Add alternative text
              </h4>
              <button
                onClick={() => toggleSettings("sponsorshipAuthorization")}
                className={`${
                  settings["sponsorshipAuthorization"]
                    ? "border-cyan bg-cyan justify-end"
                    : "justify-start bg-transparent border-slate250"
                } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
              >
                <span
                  className={`w-2 h-1.75 rounded-full ${
                    settings["sponsorshipAuthorization"]
                      ? "bg-slate100"
                      : "bg-slate250"
                  }`}
                ></span>
              </button>
            </div>
            <p className="text-xs text-black dark:text-white">
              Provide a brief description of an image for creators using screen
              reader technology.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 p-5 rounded-xl bg-white300 dark:bg-slate100">
            <div className="flex items-center gap-3 justify-between">
              <h4 className="text-sm font-bold text-black dark:text-white">
                AI-generated content
              </h4>
              <button
                onClick={() => toggleSettings("aIeneratedContent")}
                className={`${
                  settings["aIeneratedContent"]
                    ? "border-cyan bg-cyan justify-end"
                    : "justify-start bg-transparent border-slate250"
                } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
              >
                <span
                  className={`w-2 h-1.75 rounded-full ${
                    settings["aIeneratedContent"]
                      ? "bg-slate100"
                      : "bg-slate250"
                  }`}
                ></span>
              </button>
            </div>
            <p className="text-xs text-black dark:text-white">
              Add this label to tell creators your content was generated or
              edited with AI.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 p-5 rounded-xl bg-white300 dark:bg-slate100">
            <div className="flex items-center gap-3 justify-between">
              <h4 className="text-sm font-bold text-black dark:text-white">
                Allow visual search
              </h4>
              <button
                onClick={() => toggleSettings("allowVisualSearch")}
                className={`${
                  settings["allowVisualSearch"]
                    ? "border-cyan bg-cyan justify-end"
                    : "justify-start bg-transparent border-slate250"
                } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
              >
                <span
                  className={`w-2 h-1.75 rounded-full ${
                    settings["allowVisualSearch"]
                      ? "bg-slate100"
                      : "bg-slate250"
                  }`}
                ></span>
              </button>
            </div>
            <p className="text-xs text-black dark:text-white">
              Your content will be eligible for visual search so other creators
              can find matching content or products.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 p-5 rounded-xl bg-white300 dark:bg-slate100">
            <div className="flex items-center gap-3 justify-between">
              <h4 className="text-sm font-bold text-black dark:text-white">
                Save to device
              </h4>
              <button
                onClick={() => toggleSettings("saveToDevice")}
                className={`${
                  settings["saveToDevice"]
                    ? "border-cyan bg-cyan justify-end"
                    : "justify-start bg-transparent border-slate250"
                } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
              >
                <span
                  className={`w-2 h-1.75 rounded-full ${
                    settings["saveToDevice"]
                      ? "bg-slate100"
                      : "bg-slate250"
                  }`}
                ></span>
              </button>
            </div>
            <p className="text-xs text-black dark:text-white">
              Your post will be saved to device, unless a violation of Community
              Guideline is found.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 p-5 rounded-xl bg-white300 dark:bg-slate100">
            <div className="flex items-center gap-3 justify-between">
              <h4 className="text-sm font-bold text-black dark:text-white">
                Save post with watermark
              </h4>
              <button
                onClick={() => toggleSettings("savePostWithWatermark")}
                className={`${
                  settings["savePostWithWatermark"]
                    ? "border-cyan bg-cyan justify-end"
                    : "justify-start bg-transparent border-slate250"
                } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
              >
                <span
                  className={`w-2 h-1.75 rounded-full ${
                    settings["savePostWithWatermark"]
                      ? "bg-slate100"
                      : "bg-slate250"
                  }`}
                ></span>
              </button>
            </div>
            <p className="text-xs text-black dark:text-white">
              This only affects videos or photos posted by you.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 p-5 rounded-xl bg-white300 dark:bg-slate100">
            <div className="flex items-center gap-3 justify-between">
              <h4 className="text-sm font-bold text-black dark:text-white">
                Audience controls
              </h4>
              <button
                onClick={() => toggleSettings("audienceControls")}
                className={`${
                  settings["audienceControls"]
                    ? "border-cyan bg-cyan justify-end"
                    : "justify-start bg-transparent border-slate250"
                } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
              >
                <span
                  className={`w-2 h-1.75 rounded-full ${
                    settings["audienceControls"]
                      ? "bg-slate100"
                      : "bg-slate250"
                  }`}
                ></span>
              </button>
            </div>
            <p className="text-xs text-black dark:text-white">
              This video is limited to those aged 18 years and above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoreOptions;
