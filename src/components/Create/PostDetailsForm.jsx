import { useState } from "react";
import { MdLocationPin } from "react-icons/md";
import CoverPicker from "./CoverPicker";

const LOCATION_CHIPS = [
  "Nigeria",
  "Victoria Island",
  "Isolo",
  "Lagos Island",
  "Mushin",
  "Lekki Centre",
];

function PostDetailsForm({
  file,
  filePreviewUrl,
  uploadType = "video",
  description = "",
  setDescription,
  locationText = "",
  setLocationText,
  settings = {},
  updateSetting,
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
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const {
    highQuality = true,
    postContentDisclosure = false,
    aiGeneratedContent = false,
    musicCopyrightCheck = false,
    contentCheckLite = false,
    scheduleForLater = false,
  } = settings;

  const isBusy = status === "preparing" || status === "uploading" || status === "processing" || status === "publishing";
  const statusLabel = status === "preparing" ? "Preparing…"
    : status === "uploading" ? `Uploading… ${progress || 0}%`
    : status === "processing" ? "Processing…"
    : status === "publishing" ? "Publishing…"
    : status === "done" ? "Posted"
    : "";

  return (
    <section className="p-5 md:flex flex-col gap-6 font-inter hidden">
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
                  value={description}
                  onChange={(e) => setDescription?.(e.target.value.slice(0, maxDescription))}
                  placeholder="Tell us about your video..."
                  className="resize-none h-35 font-medium text-brown400 text-sm outline-none bg-transparent"
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
                  <p className="text-brown400 text-lg font-medium">{description.length}/{maxDescription}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label htmlFor="category-picker" className="text-base font-semibold text-black dark:text-white">
                Category
              </label>
              <select
                id="category-picker"
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

            <div className="flex flex-col gap-5">
              <h4 className="text-base font-semibold text-black dark:text-white">
                Cover
              </h4>
              <div className="w-60 h-65 rounded-xl border border-black dark:border-white relative overflow-x-hidden bg-black">
                {coverFrame?.previewUrl ? (
                  <img src={coverFrame.previewUrl} alt="Selected cover" className="w-full h-full rounded-xl object-cover" />
                ) : filePreviewUrl && uploadType === "video" ? (
                  <video
                    src={filePreviewUrl}
                    className="w-full h-full rounded-xl object-cover"
                    muted
                    playsInline
                  />
                ) : filePreviewUrl ? (
                  <img src={filePreviewUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <img src="/live-img.jpg" alt="" className="w-full h-full rounded-xl object-cover" />
                )}
                <div className="bg-black/30 inset-0 absolute w-full h-full "></div>
                <button
                  type="button"
                  onClick={() => setIsCoverPickerOpen(true)}
                  disabled={!file}
                  className="absolute bottom-5 left-5 right-5 border-white border rounded-xl py-3 text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {coverFrame ? "Change Cover" : "Edit Cover"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4.5">
              <div className="space-y-5">
                <h4 className="text-base font-semibold text-black dark:text-white">
                  Location
                </h4>
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText?.(e.target.value)}
                  placeholder="Search location"
                  className="border border-black/30 dark:border-white/30 rounded-xl p-4 outline-none bg-transparent text-black dark:text-white"
                />
              </div>
              <div className="flex items-center gap-3">
                {LOCATION_CHIPS.map((chip) => {
                  const active = locationText === chip;
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setLocationText?.(active ? "" : chip)}
                      className={`border rounded-md py-3 px-2.5 text-xs font-semibold ${
                        active
                          ? "border-orange100 text-orange100"
                          : "border-black/30 dark:border-white/30 text-black dark:text-white"
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
                <button type="button" className="border border-black/30 dark:border-white/30 rounded-md py-3 px-2.5 text-black dark:text-white">
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
                <label className="text-base font-semibold text-black dark:text-white">
                  When to post
                </label>
                <div className="flex gap-5 items-center">
                  <label className="border border-black/30 dark:border-white/30 flex items-center gap-3.5 px-5 py-4 rounded-md flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="whenToPost"
                      checked={!scheduleForLater}
                      onChange={() => updateSetting?.("scheduleForLater", false)}
                    />
                    <span className="text-black dark:text-white text-sm">Now</span>
                  </label>
                  <label className="border border-black/30 dark:border-white/30 flex items-center gap-3.5 px-5 py-4 rounded-md flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="whenToPost"
                      checked={scheduleForLater}
                      onChange={() => updateSetting?.("scheduleForLater", true)}
                    />
                    <span className="text-black dark:text-white text-sm">Schedule</span>
                  </label>
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="text-base font-semibold text-black dark:text-white">
                  Who can see this post
                </h4>
                <select
                  value={settings.audience || "everyone"}
                  onChange={(e) => updateSetting?.("audience", e.target.value)}
                  className="border border-black/30 dark:border-white/30 rounded-xl p-4 bg-transparent text-black dark:text-white"
                >
                  <option value="everyone">Everyone</option>
                  <option value="followers">Followers</option>
                  <option value="friends">Friends</option>
                  <option value="only-me">Only me</option>
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-black dark:text-white">
                    High-quality uploads
                  </h4>
                  <button
                    type="button"
                    onClick={() => updateSetting?.("highQuality", (prev) => !prev)}
                    className={`${
                      highQuality
                        ? "border-cyan bg-cyan justify-end"
                        : "justify-start bg-transparent border-slate250"
                    } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
                  >
                    <span
                      className={`w-2 h-1.75 rounded-full ${
                        highQuality ? "bg-slate100" : "bg-slate250"
                      }`}
                    ></span>
                  </button>
                </div>
                <p className="text-sm text-black dark:text-white">
                  HD by default when you post from web app
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-black dark:text-white">
                    Disclose post content
                  </h4>
                  <button
                    type="button"
                    onClick={() => updateSetting?.("postContentDisclosure", (prev) => !prev)}
                    className={`${
                      postContentDisclosure
                        ? "border-cyan bg-cyan justify-end"
                        : "justify-start bg-transparent border-slate250"
                    } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
                  >
                    <span
                      className={`w-2 h-1.75 rounded-full ${
                        postContentDisclosure ? "bg-slate100" : "bg-slate250"
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
                    type="button"
                    onClick={() => updateSetting?.("aiGeneratedContent", (prev) => !prev)}
                    className={`${
                      aiGeneratedContent
                        ? "border-cyan bg-cyan justify-end"
                        : "justify-start bg-transparent border-slate250"
                    } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
                  >
                    <span
                      className={`w-2 h-1.75 rounded-full ${
                        aiGeneratedContent ? "bg-slate100" : "bg-slate250"
                      }`}
                    ></span>
                  </button>
                </div>
                <p className="text-sm text-black dark:text-white">
                  Add this label to tell others your content was generated or
                  edited with AI.
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
                    type="button"
                    onClick={() => updateSetting?.("musicCopyrightCheck", (prev) => !prev)}
                    className={`${
                      musicCopyrightCheck
                        ? "border-cyan bg-cyan justify-end"
                        : "justify-start bg-transparent border-slate250"
                    } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
                  >
                    <span
                      className={`w-2 h-1.75 rounded-full ${
                        musicCopyrightCheck ? "bg-slate100" : "bg-slate250"
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
                    type="button"
                    onClick={() => updateSetting?.("contentCheckLite", (prev) => !prev)}
                    className={`${
                      contentCheckLite
                        ? "border-cyan bg-cyan justify-end"
                        : "justify-start bg-transparent border-slate250"
                    } w-5.5 h-3 rounded-full p-0.5 border-2 flex items-center`}
                  >
                    <span
                      className={`w-2 h-1.75 rounded-full ${
                        contentCheckLite ? "bg-slate100" : "bg-slate250"
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

          {errorMessage ? (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 text-red-500 text-sm px-4 py-3">
              {errorMessage}
            </div>
          ) : null}
          {statusLabel ? (
            <div className="text-sm text-black/70 dark:text-white/70">{statusLabel}</div>
          ) : null}

          <div className="flex items-center gap-7">
            <button
              type="button"
              onClick={onPost}
              disabled={isBusy || !file}
              className="bg-orange100 text-slate100 text-sm font-medium hover:bg-orange500 transition-all rounded-md w-45 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isBusy ? "Posting…" : "Post"}
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isBusy || !file}
              className="bg-zinc400 text-white text-sm font-medium hover:bg-orange500 transition-all rounded-md w-45 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Save draft
            </button>
            <button
              type="button"
              onClick={onDiscard}
              disabled={isBusy}
              className="bg-zinc400 text-white text-sm font-medium hover:bg-orange500 transition-all rounded-md w-45 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Discard
            </button>
          </div>
        </div>
        <div className="col-span-1 flex flex-col bg-white300 dark:bg-slate100 overflow-hidden rounded-t-4xl rounded-b-2xl">
          {filePreviewUrl ? (
            <video src={filePreviewUrl} className="rounded-t-4xl w-full object-cover" muted playsInline />
          ) : (
            <img src="/live-img.jpg" alt="" className="rounded-t-4xl" />
          )}
          <div className="flex flex-col gap-6 py-5 px-4 rounded-b-2xl border border-t-0 border-black/10 dark:border-white/30">
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <h4 className="text-base font-medium text-black dark:text-white">
                  Video link
                </h4>
                <p className="text-sm text-black dark:text-white break-all">
                  {status === "done" ? "Uploaded" : "Available after posting"}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-base font-medium text-black dark:text-white">
                Filename
              </h4>
              <p className="text-sm text-black dark:text-white break-all">
                {file?.name || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <CoverPicker
        file={file}
        type={uploadType}
        isOpen={isCoverPickerOpen}
        onClose={() => setIsCoverPickerOpen(false)}
        onSelect={onCoverSelect}
        currentSelectionId={coverFrame?.id ?? null}
      />
    </section>
  );
}

export default PostDetailsForm;
