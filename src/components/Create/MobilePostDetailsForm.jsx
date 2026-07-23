import { useState } from "react";
import { FaGlobeAfrica, FaPlus } from "react-icons/fa";
import { GrLocationPin } from "react-icons/gr";
import { IoMdClipboard } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { MdKeyboardArrowRight, MdLiveTv, MdLocationPin } from "react-icons/md";
import DisclosureSetting from "./DisclosureSetting";
import PostViewOption from "./PostViewOption";
import MoreOptions from "./MoreOptions";
import CoverPicker from "./CoverPicker";

const LOCATION_CHIPS = [
  "Nigeria",
  "Victoria Island",
  "Isolo",
  "Lagos Island",
  "Mushin",
  "Lekki Centre",
];

function MobilePostDetailsForm({
  file,
  filePreviewUrl,
  uploadType = "video",
  description = "",
  setDescription,
  locationText = "",
  setLocationText,
  categories = [],
  categoryId = null,
  setCategoryId,
  coverFrame = null,
  onCoverSelect,
  status = "idle",
  progress = 0,
  errorMessage = "",
  maxDescription = 1000,
  onPost,
  onSaveDraft,
  onDiscard,
}) {
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [showPostView, setShowPostView] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);

  function toggleShowMoreOptions() {
    setShowMoreOptions((prev) => !prev);
  }

  function toggleShowDisclosure() {
    setShowDisclosure((prev) => !prev);
  }

  function toggleShowPostView() {
    setShowPostView((prev) => !prev);
  }

  const isBusy = status === "preparing" || status === "uploading" || status === "processing" || status === "publishing";
  const statusLabel = status === "preparing" ? "Preparing…"
    : status === "uploading" ? `Uploading… ${progress || 0}%`
    : status === "processing" ? "Processing…"
    : status === "publishing" ? "Publishing…"
    : status === "done" ? "Posted"
    : "";

  return (
    <div className="md:hidden">
      {showDisclosure && (
        <DisclosureSetting toggleShowDisclosure={toggleShowDisclosure} />
      )}
      {showPostView && (
        <PostViewOption toggleShowPostView={toggleShowPostView} />
      )}
      {showMoreOptions && (
        <MoreOptions toggleShowMoreOptions={toggleShowMoreOptions} />
      )}
      <section className="p-5 space-y-7 font-inter ">
        <div className="flex items-center gap-3.5">
          {coverFrame?.previewUrl ? (
            <img src={coverFrame.previewUrl} alt="Selected cover" className="w-25 h-25 rounded-md object-cover" />
          ) : filePreviewUrl && uploadType === "video" ? (
            <video
              src={filePreviewUrl}
              className="w-25 h-25 rounded-md object-cover bg-black"
              muted
              playsInline
            />
          ) : filePreviewUrl ? (
            <img src={filePreviewUrl} alt="" className="w-25 h-25 rounded-md object-cover" />
          ) : (
            <img src="/friend.jpg" alt="" className="w-25 h-25 rounded-md object-cover" />
          )}
          <button
            type="button"
            onClick={() => setIsCoverPickerOpen(true)}
            disabled={!file}
            className="w-25 h-25 bg-slate150 dark:bg-slate100 rounded-md flex flex-col items-center justify-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FaPlus className="w-6 h-6 text-black dark:text-white" />
            <span className="text-xs text-black dark:text-white">
              {coverFrame ? "Change" : "Cover"}
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-3 border border-black/50 dark:border-white/50 rounded-xl p-3">
          <textarea
            value={description}
            onChange={(e) => setDescription?.(e.target.value.slice(0, maxDescription))}
            placeholder="Tell us about your video..."
            className="resize-none h-35 font-medium text-brown400 text-sm outline-none bg-transparent"
          ></textarea>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <p className="text-brown400 text-base font-medium"># Hashtags</p>
              <p className="text-brown400 text-base font-medium">@ Mention</p>
            </div>
            <p className="text-brown400 text-base font-medium">{description.length}/{maxDescription}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="mobile-category-picker" className="text-base font-semibold text-black dark:text-white">
            Category
          </label>
          <select
            id="mobile-category-picker"
            value={categoryId ?? ""}
            onChange={(event) => setCategoryId?.(event.target.value ? Number(event.target.value) : null)}
            className="border border-black/30 dark:border-white/30 rounded-xl p-4 bg-transparent text-black dark:text-white"
          >
            <option value="">Auto-detect from hashtags</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-4.5">
          <div className="space-y-5">
            <h4 className="text-base font-semibold text-black dark:text-white flex items-center gap-1">
              <GrLocationPin /> Location
            </h4>
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText?.(e.target.value)}
              placeholder="Search location"
              className="border border-black/30 dark:border-white/30 rounded-xl p-4 outline-none bg-transparent text-black dark:text-white"
            />
          </div>
          <div
            className="flex items-center gap-3 overflow-x-auto "
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {LOCATION_CHIPS.map((chip) => {
              const active = locationText === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setLocationText?.(active ? "" : chip)}
                  className={`border rounded-md py-3 whitespace-nowrap px-4 text-xs font-semibold ${
                    active
                      ? "border-orange100 text-orange100"
                      : "border-black/30 dark:border-white/30 text-black dark:text-white"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
            <button type="button" className="border border-black/30 dark:border-white/30 rounded-md py-3 px-4 text-black dark:text-white">
              <MdLocationPin />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IoMdClipboard className="w-5 h-5 text-black dark:text-white" />
              <h3 className="text-slate100 dark:text-slate650 text-sm font-medium">
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
              <h3 className="text-slate100 dark:text-slate650 text-sm font-medium">
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
              <h3 className="text-slate100 dark:text-slate650 text-sm font-medium">
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
              <h3 className="text-slate100 dark:text-slate650 text-sm font-medium">
                More options
              </h3>
            </div>
            <button onClick={toggleShowMoreOptions}>
              <MdKeyboardArrowRight className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 text-red-500 text-sm px-4 py-3">
            {errorMessage}
          </div>
        ) : null}
        {statusLabel ? (
          <div className="text-sm text-black/70 dark:text-white/70">{statusLabel}</div>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPost}
            disabled={isBusy || !file}
            className="bg-orange100 text-slate100 text-sm font-medium hover:bg-orange500 transition-all rounded-md w-25 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isBusy ? "…" : "Post"}
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isBusy || !file}
            className="bg-zinc400 text-white text-sm font-medium hover:bg-orange500 transition-all rounded-md w-25 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={isBusy}
            className="bg-zinc400 text-white text-sm font-medium hover:bg-orange500 transition-all rounded-md w-25 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Discard
          </button>
        </div>
      </section>

      <CoverPicker
        file={file}
        type={uploadType}
        isOpen={isCoverPickerOpen}
        onClose={() => setIsCoverPickerOpen(false)}
        onSelect={onCoverSelect}
        currentSelectionId={coverFrame?.id ?? null}
      />
    </div>
  );
}

export default MobilePostDetailsForm;
