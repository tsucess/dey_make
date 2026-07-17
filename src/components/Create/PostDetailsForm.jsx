import { useState } from "react";
import { MdLocationPin } from "react-icons/md";

function PostDetailsForm() {
  const [isHighQuality, setIsHighQuality] = useState(true);
  const [isPostContent, setIsPostContent] = useState(false);
  const [isAiContent, setIsAiContent] = useState(false);
  const [isCopyrightCheck, setIsCopyrightCheck] = useState(false);
  const [isContentCheck, setIsContentCheck] = useState(false);

  function toggleIsHighQuality() {
    setIsHighQuality((prev) => !prev);
  }

  function toggleIsPostContent() {
    setIsPostContent((prev) => !prev);
  }

  function toggleIsAiContent() {
    setIsAiContent((prev) => !prev);
  }

  function toggleIsCopyrightCheck() {
    setIsCopyrightCheck((prev) => !prev);
  }

  function toggleIsContentCheck() {
    setIsContentCheck((prev) => !prev);
  }

  return (
    <section className="p-5 flex flex-col gap-6 font-inter">
      <h1 className="text-xl font-bold text-black dark:text-white">
        Post Details
      </h1>
      <div className="grid grid-cols-4 gap-6 items-start">
        <div className="col-span-3 flex flex-col gap-8">
          <div className="p-7.5 flex flex-col gap-10 rounded-2xl border border-black/10 dark:border-white/10">
            <div className="flex flex-col gap-3">
              <label
                htmlFor=""
                className="text-base font-semibold text-black dark:text-white"
              >
                Description
              </label>
              <div className="flex flex-col gap-3 border border-black/50 dark:border-white/50 rounded-xl p-3">
                <textarea
                  name=""
                  id=""
                  placeholder="Tell us about your video..."
                  className="resize-none h-35 font-medium text-brown400 text-sm"
                ></textarea>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <p className="text-brown400 text-lg font-medium">
                      # Hashtags
                    </p>
                    <p className="text-brown400 text-lg font-medium">
                      @ Mention
                    </p>
                  </div>
                  <p className="text-brown400 text-lg font-medium">0/1000</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <h4 className="text-base font-semibold text-black dark:text-white">
                Cover
              </h4>
              <div className="w-60 h-65 rounded-xl border border-black dark:border-white relative overflow-x-hidden">
                <img
                  src="/live-img.jpg"
                  alt=""
                  className="w-full h-full rounded-xl object-cover"
                />
                <div className="bg-black/30 inset-0 absolute w-full h-full "></div>
                <button className="absolute bottom-5 left-5 right-5 border-white border rounded-xl py-3 text-white text-sm font-medium">
                  Edit Cover
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4.5">
              <div className="space-y-5">
                <h4 className="text-base font-semibold text-black dark:text-white">
                  Location
                </h4>
                <select
                  name=""
                  id=""
                  className="border border-black/30 dark:border-white/30 rounded-xl p-4"
                >
                  <option value="">Search location</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
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
                    className="border border-black/30 dark:border-white/30 rounded-md py-3 text-black dark:text-white px-2.5 text-xs font-semibold"
                  >
                    {location}
                  </button>
                ))}
                <button className="border border-black/30 dark:border-white/30 rounded-md py-3 px-2.5 text-black dark:text-white">
                  <MdLocationPin />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-black dark:text-white">
              Settings
            </h3>
            <div className="p-7.5 flex flex-col gap-17 rounded-2xl border border-black/10 dark:border-white/10">
              <div className="flex flex-col gap-5">
                <label
                  htmlFor=""
                  className="text-base font-semibold text-black dark:text-white"
                >
                  When to post
                </label>
                <div className="flex gap-5 items-center">
                  <div className="border border-black/30 dark:border-white/30 flex items-center gap-3.5 px-5 py-4 rounded-md flex-1">
                    <input type="radio" name="" id="" />
                    <label
                      htmlFor=""
                      className="text-black dark:text-white text-sm"
                    >
                      Now
                    </label>
                  </div>
                  <div className="border border-black/30 dark:border-white/30 flex items-center gap-3.5 px-5 py-4 rounded-md flex-1">
                    <input type="radio" name="" id="" />
                    <label
                      htmlFor=""
                      className="text-black dark:text-white text-sm"
                    >
                      Schedule
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="text-base font-semibold text-black dark:text-white">
                  Who can see this post
                </h4>
                <select
                  name=""
                  id=""
                  className="border border-black/30 dark:border-white/30 rounded-xl p-4"
                >
                  <option value="">Everyone</option>
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-black dark:text-white">
                    High-quality uploads
                  </h4>
                  <button
                    onClick={toggleIsHighQuality}
                    className={`${
                      isHighQuality
                        ? "border-cyan bg-cyan justify-end"
                        : "justify-start bg-transparent border-slate250"
                    } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
                  >
                    <span
                      className={`w-2 h-1.75 rounded-full ${
                        isHighQuality ? "bg-slate100" : "bg-slate250"
                      }`}
                    ></span>
                  </button>
                </div>
                <p className="text-sm text-black dark:text-white">
                  HD by default when you post from web aoo
                </p>
              </div>

              <div className="flex flex-col gap-5">
                <label
                  htmlFor=""
                  className="text-base font-semibold text-black dark:text-white"
                >
                  When to post
                </label>
                <div className="flex gap-5 items-center">
                  <div className="border border-black/30 dark:border-white/30 flex items-center gap-3.5 px-5 py-4 rounded-md flex-1">
                    <input type="radio" name="" id="" />
                    <label
                      htmlFor=""
                      className="text-black dark:text-white text-sm"
                    >
                      Comment
                    </label>
                  </div>
                  <div className="border border-black/30 dark:border-white/30 flex items-center gap-3.5 px-5 py-4 rounded-md flex-1">
                    <input type="radio" name="" id="" />
                    <label
                      htmlFor=""
                      className="text-black dark:text-white text-sm"
                    >
                      Reuse of content
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-black dark:text-white">
                    Disclose post content
                  </h4>
                  <button
                    onClick={toggleIsPostContent}
                    className={`${
                      isPostContent
                        ? "border-cyan bg-cyan justify-end"
                        : "justify-start bg-transparent border-slate250"
                    } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
                  >
                    <span
                      className={`w-2 h-1.75 rounded-full ${
                        isPostContent ? "bg-slate100" : "bg-slate250"
                      }`}
                    ></span>
                  </button>
                </div>
                <p className="text-sm text-black dark:text-white">
                  Let others know this post promotes a brand, product or
                  service.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-black dark:text-white">
                    AI-generated content
                  </h4>
                  <button
                    onClick={toggleIsAiContent}
                    className={`${
                      isAiContent
                        ? "border-cyan bg-cyan justify-end"
                        : "justify-start bg-transparent border-slate250"
                    } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
                  >
                    <span
                      className={`w-2 h-1.75 rounded-full ${
                        isAiContent ? "bg-slate100" : "bg-slate250"
                      }`}
                    ></span>
                  </button>
                </div>
                <p className="text-sm text-black dark:text-white">
                  Add this label...
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-black dark:text-white">
              Checks
            </h3>
            <div className="p-7.5 flex flex-col gap-17 rounded-2xl border border-black/10 dark:border-white/10">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-black dark:text-white">
                    Music copyright check
                  </h4>
                  <button
                    onClick={toggleIsCopyrightCheck}
                    className={`${
                      isCopyrightCheck
                        ? "border-cyan bg-cyan justify-end"
                        : "justify-start bg-transparent border-slate250"
                    } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
                  >
                    <span
                      className={`w-2 h-1.75 rounded-full ${
                        isCopyrightCheck ? "bg-slate100" : "bg-slate250"
                      }`}
                    ></span>
                  </button>
                </div>
                <p className="text-sm text-black dark:text-white">
                  We’ll check if your video has any unauthorized music that may
                  cause it to be muted.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-black dark:text-white">
                    Content check lite
                  </h4>
                  <button
                    onClick={toggleIsContentCheck}
                    className={`${
                      isContentCheck
                        ? "border-cyan bg-cyan justify-end"
                        : "justify-start bg-transparent border-slate250"
                    } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
                  >
                    <span
                      className={`w-2 h-1.75 rounded-full ${
                        isContentCheck ? "bg-slate100" : "bg-slate250"
                      }`}
                    ></span>
                  </button>
                </div>
                <p className="text-sm text-black dark:text-white">
                  We’ll check your content for For You Feed eligibility.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-7">
            <button className="bg-orange100 text-slate100 text-sm font-medium hover:bg-orange500 transition-all rounded-md w-45 py-2">
              Post
            </button>
            <button className="bg-zinc400 text-white text-sm font-medium hover:bg-orange500 transition-all rounded-md w-45 py-2">
              Save draft
            </button>
            <button className="bg-zinc400 text-white text-sm font-medium hover:bg-orange500 transition-all rounded-md w-45 py-2">
              Discard
            </button>
          </div>
        </div>
        <div className="col-span-1 flex flex-col bg-white300 dark:bg-slate100 overflow-hidden rounded-t-4xl rounded-b-2xl">
          <img src="/live-img.jpg" alt="" className="rounded-t-4xl" />
          <div className="flex flex-col gap-6 py-5 px-4 rounded-b-2xl border border-t-0 border-black/10 dark:border-white/30">
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <h4 className="text-base font-medium text-black dark:text-white">
                  Video link
                </h4>
                <p className="text-sm text-black dark:text-white">
                  https://deymake.com/vid-1...
                </p>
              </div>
              <div className="w-5.5 h-7.5 bg-black dark:bg-white shrink-0"></div>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-base font-medium text-black dark:text-white">
                Filename
              </h4>
              <p className="text-sm text-black dark:text-white">
                232drt5-4dm3m-dfcme3-3333
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PostDetailsForm;
