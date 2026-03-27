import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { HiX } from "react-icons/hi";
import { IoCloudUploadOutline, IoImageOutline, IoVideocamOutline } from "react-icons/io5";
import { MdOutlineGifBox } from "react-icons/md";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { api, firstError } from "../services/api";

const uploadTypes = [
  { id: "image", label: "Images", helper: "PNG, JPG", icon: IoImageOutline, accept: "image/png,image/jpeg" },
  { id: "gif", label: "GIFs", helper: "800×600 or 400×300", icon: MdOutlineGifBox, accept: "image/gif" },
  { id: "video", label: "Videos", helper: "MP4, MOV, AVI", icon: IoVideocamOutline, accept: "video/mp4,video/quicktime,video/x-msvideo,video/*" },
];

function detectUploadType(file) {
  if (!file?.type) return null;
  if (file.type === "image/gif") return "gif";
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

function parseTaggedUsers(value) {
  return value
    .split(",")
    .map((entry) => Number(entry.trim()))
    .filter((entry) => Number.isInteger(entry) && entry > 0);
}

export default function CreateUpload() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const draftId = searchParams.get("id");
  const isEditingDraft = Boolean(draftId);
  const [selectedType, setSelectedType] = useState("image");
  const [selectedFile, setSelectedFile] = useState(null);
  const [existingMediaUrl, setExistingMediaUrl] = useState("");
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    caption: "",
    description: "",
    location: "",
    people: "",
    categoryId: "",
  });
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [submitting, setSubmitting] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const currentType = uploadTypes.find((type) => type.id === selectedType);
  const selectedFilePreviewUrl = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : ""), [selectedFile]);
  const previewUrl = selectedFilePreviewUrl || existingMediaUrl;
  const canGoLive = selectedType === "video";
  const isLoading = loadingCategories || loadingDraft;

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      setLoadingCategories(true);

      try {
        const response = await api.getCategories();
        if (!ignore) setCategories(response?.data?.categories || []);
      } catch (nextError) {
        if (!ignore) setError(firstError(nextError.errors, nextError.message || "Unable to load categories."));
      } finally {
        if (!ignore) setLoadingCategories(false);
      }
    }

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!draftId) return undefined;

    let ignore = false;

    async function loadDraft() {
      setLoadingDraft(true);
      setError("");

      try {
        const response = await api.getVideo(draftId);
        const nextVideo = response?.data?.video;

        if (!nextVideo?.id || !nextVideo.isDraft) {
          throw new Error("This draft is no longer available.");
        }

        if (!ignore) {
          setSelectedType(nextVideo.type || "image");
          setSelectedFile(null);
          setExistingMediaUrl(nextVideo.mediaUrl || nextVideo.thumbnailUrl || "");
          setForm({
            title: nextVideo.title || "",
            caption: nextVideo.caption || "",
            description: nextVideo.description || "",
            location: nextVideo.location || "",
            people: Array.isArray(nextVideo.taggedUsers) ? nextVideo.taggedUsers.join(", ") : "",
            categoryId: nextVideo.category?.id ? String(nextVideo.category.id) : "",
          });
        }
      } catch (nextError) {
        if (!ignore) {
          setError(firstError(nextError?.errors, nextError?.message || "Unable to load draft."));
        }
      } finally {
        if (!ignore) setLoadingDraft(false);
      }
    }

    loadDraft();

    return () => {
      ignore = true;
    };
  }, [draftId]);

  useEffect(() => () => {
    if (selectedFilePreviewUrl) URL.revokeObjectURL(selectedFilePreviewUrl);
  }, [selectedFilePreviewUrl]);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      setError("");
      setSelectedFile(file);
      const nextType = detectUploadType(file);
      if (nextType) setSelectedType(nextType);
    }
  }

  async function handleSubmit(action) {
    const detectedType = detectUploadType(selectedFile);

    setError("");
    setFeedback("");

    if (!selectedFile && !existingMediaUrl) {
      setError("Choose a file before continuing.");
      return;
    }

    if (selectedFile && detectedType && detectedType !== selectedType) {
      setError(`The selected file is a ${detectedType}. Switch the upload type or choose another file.`);
      return;
    }

    if (action === "live" && selectedType !== "video") {
      setError("Only video uploads can go live.");
      return;
    }

    setSubmitting(action);

    try {
      let upload = null;

      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);

        const uploadResponse = await api.uploadFile(uploadFormData);
        upload = uploadResponse?.data?.upload;
      }

      const payload = {
        type: selectedType,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        title: form.title.trim() || null,
        caption: form.caption.trim() || null,
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        taggedUsers: parseTaggedUsers(form.people),
        isDraft: action === "draft",
        isLive: action === "live",
      };

      if (upload?.id) payload.uploadId = upload.id;

      const response = isEditingDraft
        ? await api.updateVideo(draftId, payload)
        : await api.createVideo(payload);

      let nextVideo = response?.data?.video;

      if (action === "publish" && nextVideo?.isDraft) {
        const publishResponse = await api.publishVideo(nextVideo.id);
        nextVideo = publishResponse?.data?.video;
      }

      if (nextVideo?.mediaUrl) {
        setExistingMediaUrl(nextVideo.mediaUrl);
      }

      if (selectedFile) {
        setSelectedFile(null);
      }

      setFeedback(
        action === "draft"
          ? "Draft saved successfully."
          : action === "live"
            ? "Your live video is now available."
            : "Upload published successfully.",
      );

      if (action === "draft" && nextVideo?.id) {
        navigate(`/create?id=${nextVideo.id}`, { replace: true });
        return;
      }

      navigate(`/video/${nextVideo.id}`);
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || "Unable to complete upload."));
    } finally {
      setSubmitting("");
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate100 text-slate100 dark:text-white">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
        <div className="mb-8 flex items-start justify-between gap-4 md:mb-10">
          <Logo className="w-34 h-auto md:w-44 md:h-auto" />
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Close upload page"
            className="mt-3 flex h-10 w-10 items-center justify-center rounded-full bg-white300 text-slate700 transition-colors hover:bg-slate150 dark:bg-black100 dark:text-slate200"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-auto max-w-5xl">
          <h1 className="mb-6 text-2xl font-semibold font-inter md:mb-8">{isEditingDraft ? "Edit draft" : "Upload"}</h1>
          <p className="mb-6 text-sm text-slate500 dark:text-slate200">Signed in as {user?.fullName || user?.name || "creator"}</p>

          {error ? <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          {feedback ? <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</div> : null}

          <div className="mb-8 grid gap-4 md:mb-10 md:grid-cols-3 md:gap-6">
            {uploadTypes.map(({ id, label, helper, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedType(id)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                  selectedType === id
                    ? "border-orange100 bg-orange100/10"
                    : "border-transparent bg-white dark:bg-transparent"
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange100 text-black">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-medium font-inter">{label}</span>
                  <span className="block text-xs text-slate50 dark:text-slate900">{helper}</span>
                </span>
              </button>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={currentType?.accept}
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mb-8 flex h-72 w-full flex-col items-center justify-center rounded-4xl border-2 border-dashed border-orange100 px-6 text-center md:mb-10 md:h-80"
          >
            {previewUrl ? (
              selectedType === "video" ? (
                <video src={previewUrl} className="h-full w-full rounded-3xl object-cover" controls />
              ) : (
                <img src={previewUrl} alt="Upload preview" className="h-full w-full rounded-3xl object-cover" />
              )
            ) : (
              <>
                <IoCloudUploadOutline className="mb-4 h-20 w-20 text-slate200 dark:text-slate300" />
                <span className="text-3xl font-medium font-inter md:text-4xl">Drag & drop to upload</span>
                <span className="mt-1 text-sm font-medium text-orange100">or browse</span>
              </>
            )}
            {selectedFile ? <span className="mt-4 text-sm text-slate400 dark:text-slate200">Selected: {selectedFile.name}</span> : previewUrl ? <span className="mt-4 text-sm text-slate400 dark:text-slate200">Current draft media loaded</span> : null}
          </button>

          <div className="space-y-4 md:space-y-5">
            {[
              { key: "title", placeholder: "Add a title" },
              { key: "caption", placeholder: "Add a caption" },
              { key: "description", placeholder: "Add a description" },
              { key: "location", placeholder: "Location" },
              { key: "people", placeholder: "Tag people (comma-separated user IDs)" },
            ].map(({ key, placeholder }) => (
              <input
                key={key}
                type="text"
                value={form[key]}
                placeholder={placeholder}
                onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                className="h-18 w-full rounded-full bg-white300 px-7 text-base font-inter text-slate100 outline-none placeholder:text-slate600 dark:bg-black100 dark:text-white dark:placeholder:text-slate200"
              />
            ))}

            <div className="rounded-3xl bg-white300 px-6 py-5 dark:bg-black100">
              <label className="mb-2 block text-sm font-medium text-slate600 dark:text-slate200">Category</label>
              <select
                value={form.categoryId}
                disabled={isLoading}
                onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                className="w-full rounded-2xl bg-white px-4 py-4 text-sm text-slate100 outline-none dark:bg-[#1F1F1F] dark:text-white"
              >
                <option value="">Choose a category</option>
                {categories.length > 1 ? categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label || category.name}
                  </option>
                )) : <> 
  <option value="technology">Technology</option>
  <option value="health">Health & Wellness</option>
  <option value="education">Education</option>
  <option value="entertainment">Entertainment</option>
  <option value="business">Business & Finance</option>
  <option value="lifestyle">Lifestyle</option>
  <option value="travel">Travel</option>
  <option value="food">Food & Recipes</option>
  <option value="fashion">Fashion & Beauty</option>
  <option value="sports">Sports</option>
</>}
              </select>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 md:flex-row md:justify-end">
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={Boolean(submitting)}
              className="rounded-full bg-white300 px-8 py-4 text-sm font-semibold text-black transition-colors hover:bg-slate150 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-black100 dark:text-white"
            >
              {submitting === "draft" ? (isEditingDraft ? "Updating..." : "Saving...") : (isEditingDraft ? "Update draft" : "Save draft")}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("publish")}
              disabled={Boolean(submitting)}
              className="rounded-full bg-orange100 px-8 py-4 text-sm font-semibold text-black transition-colors hover:bg-[#e0a000] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting === "publish" ? "Publishing..." : "Publish now"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("live")}
              disabled={Boolean(submitting) || !canGoLive}
              className="rounded-full bg-red-500 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting === "live" ? "Going live..." : "Go live"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}