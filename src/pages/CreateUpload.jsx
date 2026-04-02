import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { HiX } from "react-icons/hi";
import { IoCloudUploadOutline, IoImageOutline, IoVideocamOutline } from "react-icons/io5";
import { MdOutlineGifBox } from "react-icons/md";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api, firstError } from "../services/api";
import { buildVideoLink } from "../utils/content";

const uploadTypeOptions = [
  { id: "image", icon: IoImageOutline, accept: "image/png,image/jpeg" },
  { id: "gif", icon: MdOutlineGifBox, accept: "image/gif" },
  { id: "video", icon: IoVideocamOutline, accept: "video/mp4,video/quicktime,video/x-msvideo,video/*" },
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

function normalizeCategoryId(value) {
  if (value === "" || value === null || value === undefined) return "";

  const numericValue = Number(value);

  return Number.isInteger(numericValue) && numericValue > 0 ? String(numericValue) : "";
}

function parseCategoryId(value) {
  const numericValue = Number(value);

  return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : null;
}

function stopMediaStream(stream) {
  stream?.getTracks?.().forEach((track) => track.stop());
}

function createUploadStatusState() {
  return {
    phase: "idle",
    progress: 0,
    fileName: "",
    mediaType: "image",
  };
}

function getUploadStatusMessage(t, phase, mediaType) {
  switch (phase) {
    case "preparing":
      return t("upload.status.preparing");
    case "uploading":
      return t("upload.status.uploading");
    case "processing":
      return mediaType === "video" ? t("upload.status.processingVideo") : t("upload.status.processingMedia");
    case "saving":
      return t("upload.status.saving");
    case "publishing":
      return t("upload.status.publishing");
    default:
      return "";
  }
}

async function uploadSelectedFile(file, type, callbacks = {}) {
  const onProgress = callbacks?.onProgress;
  const onStatusChange = callbacks?.onStatusChange;

  onStatusChange?.("preparing");

  const presignResponse = await api.presignUpload({
    type,
    originalName: file.name,
  });
  const uploadStrategy = presignResponse?.data || {};

  if (uploadStrategy.strategy === "client-direct-upload") {
    onStatusChange?.("uploading");

    const directUpload = await api.uploadFileDirect(file, uploadStrategy, {
      onProgress,
    });
    const secureUrl = directUpload?.secure_url;

    if (!secureUrl) {
      throw new Error("Upload provider did not return a file URL.");
    }

    onStatusChange?.("processing");

    const uploadResponse = await api.uploadFile({
      type,
      path: secureUrl,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: directUpload?.bytes ?? file.size ?? 0,
      width: directUpload?.width ?? null,
      height: directUpload?.height ?? null,
      duration: directUpload?.duration ?? null,
    });

    return uploadResponse?.data?.upload || null;
  }

  const uploadFormData = new FormData();
  uploadFormData.append("file", file);

  onStatusChange?.("uploading");

  const uploadResponse = await api.uploadFile(uploadFormData);

  return uploadResponse?.data?.upload || null;
}

export default function CreateUpload() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const livePreviewRef = useRef(null);
  const draftId = searchParams.get("id");
  const intent = searchParams.get("intent");
  const isEditingDraft = Boolean(draftId);
  const isLiveIntent = intent === "live" && !isEditingDraft;
  const [selectedType, setSelectedType] = useState("image");
  const [selectedFile, setSelectedFile] = useState(null);
  const [existingMediaUrl, setExistingMediaUrl] = useState("");
  const [liveCameraStream, setLiveCameraStream] = useState(null);
  const [liveCameraStatus, setLiveCameraStatus] = useState("idle");
  const [liveCameraError, setLiveCameraError] = useState("");
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
  const [uploadStatus, setUploadStatus] = useState(() => createUploadStatusState());

  const uploadTypes = useMemo(() => uploadTypeOptions.map((type) => ({
    ...type,
    label: t(`upload.types.${type.id}.label`),
    helper: t(`upload.types.${type.id}.helper`),
  })), [t]);
  const textFields = useMemo(() => ([
    { key: "title", placeholder: t("upload.fields.title") },
    { key: "caption", placeholder: t("upload.fields.caption") },
    { key: "description", placeholder: t("upload.fields.description") },
    { key: "location", placeholder: t("upload.fields.location") },
    { key: "people", placeholder: t("upload.fields.people") },
  ]), [t]);
  const currentType = uploadTypes.find((type) => type.id === selectedType);
  const selectedFilePreviewUrl = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : ""), [selectedFile]);
  const previewUrl = selectedFilePreviewUrl || existingMediaUrl;
  const isLoading = loadingCategories || loadingDraft;
  const showUploadStatus = uploadStatus.phase !== "idle";
  const uploadStatusMessage = useMemo(
    () => getUploadStatusMessage(t, uploadStatus.phase, uploadStatus.mediaType),
    [t, uploadStatus.phase, uploadStatus.mediaType],
  );
  const uploadStatusProgress = uploadStatus.phase === "idle"
    ? 0
    : uploadStatus.phase === "preparing"
      ? Math.max(uploadStatus.progress, 5)
      : uploadStatus.phase === "uploading"
        ? uploadStatus.progress
        : 100;

  useEffect(() => {
    if (isLiveIntent) setSelectedType("video");
  }, [isLiveIntent]);

  useEffect(() => {
    if (!isLiveIntent) {
      setLiveCameraStream((current) => {
        stopMediaStream(current);
        return null;
      });
      setLiveCameraStatus("idle");
      setLiveCameraError("");
      return;
    }

    let ignore = false;

    async function connectCamera() {
      if (!navigator?.mediaDevices?.getUserMedia) {
        if (!ignore) {
          setLiveCameraStatus("error");
          setLiveCameraError(t("upload.camera.unavailable"));
        }
        return;
      }

      if (!ignore) {
        setLiveCameraStatus("requesting");
        setLiveCameraError("");
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        if (ignore) {
          stopMediaStream(stream);
          return;
        }

        setSelectedType("video");
        setSelectedFile(null);
        setExistingMediaUrl("");
        setLiveCameraStream((current) => {
          stopMediaStream(current);
          return stream;
        });
        setLiveCameraStatus("ready");
      } catch {
        if (!ignore) {
          setLiveCameraStream((current) => {
            stopMediaStream(current);
            return null;
          });
          setLiveCameraStatus("error");
          setLiveCameraError(t("upload.camera.unavailable"));
        }
      }
    }

    connectCamera();

    return () => {
      ignore = true;
    };
  }, [isLiveIntent, t]);

  useEffect(() => {
    if (livePreviewRef.current) {
      livePreviewRef.current.srcObject = liveCameraStream || null;
    }
  }, [liveCameraStream]);

  useEffect(() => () => {
    stopMediaStream(liveCameraStream);
  }, [liveCameraStream]);

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      setLoadingCategories(true);

      try {
        const response = await api.getCategories();
        if (!ignore) setCategories(response?.data?.categories || []);
      } catch (nextError) {
        if (!ignore) setError(firstError(nextError.errors, nextError.message || t("upload.unableToLoadCategories")));
      } finally {
        if (!ignore) setLoadingCategories(false);
      }
    }

    loadCategories();

    return () => {
      ignore = true;
    };
  }, [t]);

  useEffect(() => {
    if (!categories.length) return;

    setForm((current) => {
      if (!current.categoryId) return current;

      const nextCategoryId = normalizeCategoryId(current.categoryId);
      const hasCategory = categories.some((category) => String(category.id) === nextCategoryId);

      if (!hasCategory) {
        return { ...current, categoryId: "" };
      }

      return nextCategoryId === current.categoryId ? current : { ...current, categoryId: nextCategoryId };
    });
  }, [categories]);

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
          throw new Error(t("upload.unavailableDraft"));
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
            categoryId: normalizeCategoryId(nextVideo.category?.id),
          });
        }
      } catch (nextError) {
        if (!ignore) {
          setError(firstError(nextError?.errors, nextError?.message || t("upload.unableToLoadDraft")));
        }
      } finally {
        if (!ignore) setLoadingDraft(false);
      }
    }

    loadDraft();

    return () => {
      ignore = true;
    };
  }, [draftId, t]);

  useEffect(() => () => {
    if (selectedFilePreviewUrl) URL.revokeObjectURL(selectedFilePreviewUrl);
  }, [selectedFilePreviewUrl]);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      setError("");
      setFeedback("");
      setUploadStatus(createUploadStatusState());
      setSelectedFile(file);
      const nextType = detectUploadType(file);
      if (nextType) setSelectedType(nextType);
    }
  }

  async function handleSubmit(action) {
    const detectedType = detectUploadType(selectedFile);
    const categoryId = parseCategoryId(form.categoryId);
    const isLiveCameraFlow = isLiveIntent && action === "live";

    setError("");
    setFeedback("");

    if (isLiveCameraFlow && !liveCameraStream) {
      setError(t("upload.errors.cameraRequired"));
      return;
    }

    if (!isLiveCameraFlow && !selectedFile && !existingMediaUrl) {
      setError(t("upload.errors.chooseFile"));
      return;
    }

    if (selectedFile && detectedType && detectedType !== selectedType) {
      setError(t("upload.errors.fileTypeMismatch", { type: t(`upload.types.${detectedType}.singular`) }));
      return;
    }

    if (action === "live" && selectedType !== "video") {
      setError(t("upload.errors.onlyVideosGoLive"));
      return;
    }

    setSubmitting(action);

    try {
      let upload = null;
      const nextMediaType = detectedType || selectedType;

      if (selectedFile) {
        setUploadStatus({
          phase: "preparing",
          progress: 0,
          fileName: selectedFile.name,
          mediaType: nextMediaType,
        });

        upload = await uploadSelectedFile(selectedFile, selectedType, {
          onProgress: ({ percent }) => {
            setUploadStatus((current) => ({
              ...current,
              phase: "uploading",
              progress: percent ?? current.progress,
            }));
          },
          onStatusChange: (phase) => {
            setUploadStatus((current) => ({
              ...current,
              phase,
              progress: phase === "uploading"
                ? current.progress
                : phase === "preparing"
                  ? 0
                  : 100,
            }));
          },
        });
      }

      if (selectedFile) {
        setUploadStatus((current) => ({
          ...current,
          phase: action === "publish" ? "publishing" : "saving",
          progress: 100,
        }));
      }

      const payload = {
        type: selectedType,
        categoryId,
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

      setUploadStatus(createUploadStatusState());

      setFeedback(
        action === "draft"
          ? t("upload.success.draftSaved")
          : action === "live"
            ? t("upload.success.liveAvailable")
            : t("upload.success.published"),
      );

      if (action === "draft" && nextVideo?.id) {
        navigate(`/create?id=${nextVideo.id}`, { replace: true });
        return;
      }

      navigate(buildVideoLink(nextVideo, action === "live"));
    } catch (nextError) {
      setUploadStatus(createUploadStatusState());
      setError(firstError(nextError.errors, nextError.message || t("upload.errors.unableToComplete")));
    } finally {
      setSubmitting("");
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate100 text-slate100 dark:text-white">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
        <div className="mb-8 flex items-start justify-between gap-4 md:mb-10">
          <Logo className="w-34 h-auto md:w-44 md:h-auto" />
          
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="flex justify-between items-start mb-8">
          <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold font-inter">{isEditingDraft ? t("upload.editDraft") : isLiveIntent ? t("upload.liveTitle") : t("common.upload")}</h1>
          <p className="text-sm font-medium text-slate500 dark:text-slate200">{t("upload.signedInAs", { name: user?.fullName || user?.name || t("upload.creatorFallback") })}</p>
          {isLiveIntent ? <p className="max-w-2xl text-sm text-slate500 dark:text-slate200">{t("upload.liveDescription")}</p> : null}
           </div>
           <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={t("upload.closePage")}
            className=" flex h-10 w-10 items-center justify-center rounded-full bg-white300 text-slate700 transition-colors hover:bg-slate900 dark:bg-black100 dark:text-slate200"
          >
            <HiX className="h-5 w-5" />
          </button>
           </div>
          {error ? <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          {feedback ? <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</div> : null}
          {showUploadStatus ? (
            <div className="mb-6 rounded-3xl border border-orange100/40 bg-orange200/10 px-5 py-4 dark:border-orange100/30 dark:bg-black100" aria-live="polite">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-black dark:text-white">{uploadStatusMessage}</p>
                  <p className="text-xs text-slate500 dark:text-slate200">{t("upload.status.file", { name: uploadStatus.fileName })}</p>
                </div>
                <p className="text-xs font-medium text-slate600 dark:text-slate200">{t("upload.status.progress", { percent: uploadStatusProgress })}</p>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white300 dark:bg-slate800" role="progressbar" aria-label={t("upload.status.progressLabel")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadStatusProgress}>
                <div className={`h-full rounded-full bg-orange100 transition-all duration-300 ${uploadStatus.phase === "processing" || uploadStatus.phase === "saving" || uploadStatus.phase === "publishing" ? "animate-pulse" : ""}`} style={{ width: `${uploadStatusProgress}%` }} />
              </div>
            </div>
          ) : null}

          {isLiveIntent ? (
            <div className="mb-8 overflow-hidden rounded-4xl border-2 border-dashed border-red-300 bg-white md:mb-10 dark:bg-black100">
              <div className="flex h-72 items-center justify-center bg-black md:h-80">
                {liveCameraStream ? (
                  <video
                    ref={livePreviewRef}
                    aria-label={t("upload.camera.previewLabel")}
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <div className="px-6 text-center text-white">
                    <IoVideocamOutline className="mx-auto mb-4 h-16 w-16 text-red-300" />
                    <p className="text-lg font-semibold">{t("upload.camera.sourceTitle")}</p>
                    <p className="mt-2 text-sm text-slate-300">
                      {liveCameraStatus === "requesting" ? t("upload.camera.requesting") : liveCameraError || t("upload.camera.help")}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 px-6 py-5 text-sm text-slate600 dark:text-slate200 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-black dark:text-white">{t("upload.camera.sourceTitle")}</p>
                  <p className="mt-1">{liveCameraStatus === "ready" ? t("upload.camera.ready") : t("upload.camera.help")}</p>
                </div>
                {liveCameraStatus === "error" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLiveCameraStatus("idle");
                      setLiveCameraError("");
                      setError("");
                      setSelectedFile(null);
                      setExistingMediaUrl("");
                      setSelectedType("video");
                      navigator.mediaDevices?.getUserMedia && navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                        .then((stream) => {
                          setLiveCameraStream((current) => {
                            stopMediaStream(current);
                            return stream;
                          });
                          setLiveCameraStatus("ready");
                        })
                        .catch(() => {
                          setLiveCameraStatus("error");
                          setLiveCameraError(t("upload.camera.unavailable"));
                        });
                    }}
                    className="rounded-full bg-red-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-red-600"
                  >
                    {t("upload.camera.retry")}
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 grid gap-4 md:mb-10 md:grid-cols-3 md:gap-6">
                {uploadTypes.map(({ id, label, helper, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedType(id)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                      selectedType === id
                        ? "border-orange100 bg-orange200/10"
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
                className="mb-8 flex h-72 w-full flex-col items-center justify-center rounded-4xl border-2 border-dashed border-orange100 px-6 text-center md:mb-10 md:h-110"
              >
                {previewUrl ? (
                  selectedType === "video" ? (
                    <video src={previewUrl} className="h-full w-full rounded-3xl object-cover" controls />
                  ) : (
                    <img src={previewUrl} alt={t("upload.previewAlt")} className="h-full w-full rounded-3xl object-cover" />
                  )
                ) : (
                  <>
                    <IoCloudUploadOutline className="mb-4 h-20 w-20 text-slate200 dark:text-slate300" />
                    <span className="text-3xl font-medium font-inter md:text-4xl">{t("upload.dropzone.dragAndDrop")}</span>
                    <span className="mt-1 text-sm font-medium text-orange100">{t("upload.dropzone.orBrowse")}</span>
                  </>
                )}
                {selectedFile ? <span className="mt-4 text-sm text-slate400 dark:text-slate200">{t("upload.dropzone.selected", { name: selectedFile.name })}</span> : previewUrl ? <span className="mt-4 text-sm text-slate400 dark:text-slate200">{t("upload.dropzone.currentDraftMediaLoaded")}</span> : null}
              </button>
            </>
          )}

          <div className="space-y-4 md:space-y-5">
            {textFields.map(({ key, placeholder }) => (
              <input
                key={key}
                type="text"
                value={form[key]}
                placeholder={placeholder}
                onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                className="h-18 w-full rounded-full bg-white300 px-7 text-base font-inter text-slate50 outline-none placeholder:text-slate50 dark:bg-black100 dark:text-white dark:placeholder:text-slate200"
              />
            ))}

            <div className="rounded-3xl bg-white300 px-6 py-5 dark:bg-black100">
              <label className="mb-2 block text-sm font-medium text-slate600 dark:text-slate200">{t("upload.category.label")}</label>
              <select
                value={form.categoryId}
                disabled={isLoading || categories.length === 0}
                onChange={(event) => setForm((prev) => ({ ...prev, categoryId: normalizeCategoryId(event.target.value) }))}
                className="w-full rounded-2xl bg-white300 px-4 py-4 text-sm text-slate600 outline-none dark:bg-black100 dark:text-white"
              >
                <option value="">{categories.length ? t("upload.category.choose") : t("upload.category.unavailable")}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label || category.name}
                  </option>
                ))}
              </select>
              {!isLoading && categories.length === 0 ? (
                <p className="mt-2 text-xs text-slate500 dark:text-slate200">{t("upload.category.help")}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-10 flex gap-3 flex-row justify-end">
            {isLiveIntent ? (
              <button
                type="button"
                onClick={() => handleSubmit("live")}
                disabled={Boolean(submitting) || liveCameraStatus !== "ready"}
                className="rounded-full bg-red-500 px-8 py-4 text-sm font-semibold font-inter text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting === "live" ? t("upload.actions.goingLive") : t("upload.actions.goLive")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSubmit("draft")}
                  disabled={Boolean(submitting)}
                  className="rounded-full bg-white300 px-8 py-4 text-sm font-semibold font-inter text-black transition-colors hover:bg-slate150 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-black100 dark:text-white"
                >
                  {submitting === "draft" ? (isEditingDraft ? t("upload.actions.updating") : t("upload.actions.saving")) : (isEditingDraft ? t("upload.actions.updateDraft") : t("upload.actions.saveDraft"))}
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit("live")}
                  disabled={Boolean(submitting) || selectedType !== "video"}
                  className="rounded-full bg-red-500 px-8 py-4 text-sm font-semibold font-inter text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting === "live" ? t("upload.actions.goingLive") : t("upload.actions.goLive")}
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit("publish")}
                  disabled={Boolean(submitting)}
                  className="rounded-full bg-orange100 px-8 py-4 text-sm font-semibold font-inter text-black transition-colors hover:bg-orange200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting === "publish" ? t("upload.actions.uploading") : t("upload.actions.upload")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}