import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";

function DisclosureSetting({ toggleShowDisclosure }) {
  const [settings, setSetting] = useState({
    discloseContent: true,
    sponsorshipAuthorization: true,
    sponsorshipAd: true,
  });

  function toggleSettings(setting) {
    setSetting((prev) => ({ ...prev, [setting]: !prev[setting] }));
  }

  return (
    <div className="flex flex-col gap-10 p-5 font-inter fixed inset-0 z-30 bg-white dark:bg-black overflow-y-auto pb-20">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={toggleShowDisclosure}
          className="w-7.5 h-7.5 flex items-center justify-center border border-black/10 dark:border-white/10 rounded-md hover:bg-slate150 transition-all"
        >
          <FaArrowLeft className="text-black dark:text-white w-4 h-4 " />
        </button>
        <h2 className="text-sm font-medium text-black/65 dark:text-white/65">
          Disclosure and Sponsorship setting
        </h2>
        <FiInfo className="w-5 h-5 text-black dark:text-white" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <h3 className="text-xs text-zinc500 font-medium">
            Content disclosure settings
          </h3>
          <div className="flex flex-col gap-2.5 p-5 rounded-xl bg-white300 dark:bg-slate100">
            <div className="flex items-center gap-3 justify-between">
              <h4 className="text-sm font-bold text-black dark:text-white">
                Disclose commercial content
              </h4>
              <button
                onClick={() => toggleSettings("discloseContent")}
                className={`${
                  settings["discloseContent"]
                    ? "border-cyan bg-cyan justify-end"
                    : "justify-start bg-transparent border-slate250"
                } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
              >
                <span
                  className={`w-2 h-1.75 rounded-full ${
                    settings["discloseContent"] ? "bg-slate100" : "bg-slate250"
                  }`}
                ></span>
              </button>
            </div>
            <p className="text-xs text-black dark:text-white">
              Let other know this post promotes a brand
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs text-zinc500 font-medium">
            Sponsorship authorization
          </h3>
          <div className="flex flex-col gap-2.5 p-5 rounded-xl bg-white300 dark:bg-slate100">
            <div className="flex items-center gap-3 justify-between">
              <h4 className="text-sm font-bold text-black dark:text-white">
                Sponsorship authorization
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
              By enabling sponsorship authorization, you permit the authorized
              party to use this video as sponsorship creative.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs text-zinc500 font-medium">Display settings</h3>
          <div className="flex flex-col gap-2.5 p-5 rounded-xl bg-white300 dark:bg-slate100">
            <div className="flex items-center gap-3 justify-between">
              <h4 className="text-sm font-bold text-black dark:text-white">
                Only show as sponsorship ad
              </h4>
              <button
                onClick={() => toggleSettings("sponsorshipAd")}
                className={`${
                  settings["sponsorshipAd"]
                    ? "border-cyan bg-cyan justify-end"
                    : "justify-start bg-transparent border-slate250"
                } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
              >
                <span
                  className={`w-2 h-1.75 rounded-full ${
                    settings["sponsorshipAd"] ? "bg-slate100" : "bg-slate250"
                  }`}
                ></span>
              </button>
            </div>
            <p className="text-xs text-black dark:text-white">
              Video will be shown as an sponsorship ad only and will not be
              publicly displayed your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisclosureSetting;
