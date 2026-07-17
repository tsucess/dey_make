import React, { useState } from "react";
import { FaGlobeAfrica, FaPlus } from "react-icons/fa";
import { GrLocationPin } from "react-icons/gr";
import { IoMdClipboard } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { MdKeyboardArrowRight, MdLiveTv, MdLocationPin } from "react-icons/md";
import { PiTelevisionSimpleBold } from "react-icons/pi";
import DisclosureSetting from "./DisclosureSetting";
import PostViewOption from "./PostViewOption";
import MoreOptions from "./MoreOptions";

function MobilePostDetailsForm() {
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [showPostView, setShowPostView] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  function toggleShowMoreOptions() {
    setShowMoreOptions((prev) => !prev);
  }

  function toggleShowDisclosure() {
    setShowDisclosure((prev) => !prev);
  }

  function toggleShowPostView() {
    setShowPostView((prev) => !prev);
  }

  return (
    <>
      {showDisclosure && (
        <DisclosureSetting toggleShowDisclosure={toggleShowDisclosure} />
      )}
      {showPostView && (
        <PostViewOption toggleShowPostView={toggleShowPostView} />
      )}
      {showMoreOptions && (
        <MoreOptions toggleShowMoreOptions={toggleShowMoreOptions} />
      )}
      <section className="p-5 space-y-7 font-inter">
        <div className="flex items-center gap-3.5">
          <img
            src="/friend.jpg"
            alt=""
            className="w-25 h-25 rounded-md object-cover"
          />
          <div className="w-25 h-25 bg-slate150 dark:bg-slate100 rounded-md flex items-center justify-center ">
            <FaPlus className="w-8 h-8 text-black dark:text-white" />
          </div>
        </div>

        <div className="flex flex-col gap-3 border border-black/50 dark:border-white/50 rounded-xl p-3">
          <textarea
            name=""
            id=""
            placeholder="Tell us about your video..."
            className="resize-none h-35 font-medium text-brown400 text-sm"
          ></textarea>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <p className="text-brown400 text-base font-medium"># Hashtags</p>
              <p className="text-brown400 text-base font-medium">@ Mention</p>
            </div>
            <p className="text-brown400 text-base font-medium">0/1000</p>
          </div>
        </div>

        <div className="flex flex-col gap-4.5">
          <div className="space-y-5">
            <h4 className="text-base font-semibold text-black dark:text-white flex items-center gap-1">
              <GrLocationPin /> Location
            </h4>
            <select
              name=""
              id=""
              className="border border-black/30 dark:border-white/30 rounded-xl p-4"
            >
              <option value="">Search location</option>
            </select>
          </div>
          <div
            className="flex items-center gap-3 overflow-x-auto "
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {[
              "Nigeria",
              "Victoria Island",
              "Isolo",
              "Lagos Island",
              "Mushin",
              "Lekki Centre",
            ].map((location) => (
              <button
                key={location}
                className="border border-black/30 dark:border-white/30 rounded-md py-3 whitespace-nowrap text-black dark:text-white px-4 text-xs font-semibold"
              >
                {location}
              </button>
            ))}
            <button className="border border-black/30 dark:border-white/30 rounded-md py-3 px-4 text-black dark:text-white">
              <MdLocationPin />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IoMdClipboard className="w-5 h-5 text-black dark:text-white" />
              <h3 className="text-slate100 dark:text-slate650 text-base font-medium">
                Content disclosure and sponsorship
              </h3>
            </div>
            <button onClick={toggleShowDisclosure}>
              <MdKeyboardArrowRight className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdLiveTv className="w-5 h-5 text-black dark:text-white" />
              <h3 className="text-slate100 dark:text-slate650 text-base font-medium">
                LIVE Events (Post a link to your LIVE)
              </h3>
            </div>
            <button>
              <MdKeyboardArrowRight className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaGlobeAfrica className="w-5 h-5 text-black dark:text-white" />
              <h3 className="text-slate100 dark:text-slate650 text-base font-medium">
                Everyone can view this post
              </h3>
            </div>
            <button onClick={toggleShowPostView}>
              <MdKeyboardArrowRight className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IoSettingsOutline className="w-5 h-5 text-black dark:text-white" />
              <h3 className="text-slate100 dark:text-slate650 text-base font-medium">
                More options
              </h3>
            </div>
            <button onClick={toggleShowMoreOptions}>
              <MdKeyboardArrowRight className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-orange100 text-slate100 text-sm font-medium hover:bg-orange500 transition-all rounded-md w-25 py-2">
            Post
          </button>
          <button className="bg-zinc400 text-white text-sm font-medium hover:bg-orange500 transition-all rounded-md w-25 py-2">
            Save draft
          </button>
          <button className="bg-zinc400 text-white text-sm font-medium hover:bg-orange500 transition-all rounded-md w-25 py-2">
            Discard
          </button>
        </div>
      </section>
    </>
  );
}

export default MobilePostDetailsForm;
