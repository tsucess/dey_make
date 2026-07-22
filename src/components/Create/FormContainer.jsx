import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostDetailsForm from "./PostDetailsForm";
import MobilePostDetailsForm from "./MobilePostDetailsForm";
import { api, ApiError } from "../../services/api";
import { detectUploadType, uploadSelectedFile } from "../../utils/upload";
import { releaseCoverFrames } from "../../utils/coverImage";

const MAX_DESCRIPTION = 1000;

function initialSettings() {
  return {
    highQuality: true,
    postContentDisclosure: false,
    aiGeneratedContent: false,
    musicCopyrightCheck: false,
    contentCheckLite: false,
    scheduleForLater: false,
    audience: "everyone",
  };
}

function FormContainer() {
  const navigate = useNavigate();
  const location = useLocation();
  const file = location.state?.file ?? null;
  const draftId = useMemo(() => new URLSearchParams(location.search).get("id"), [location.search]);
  const isEditingDraft = Boolean(draftId);

  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [settings, setSettings] = useState(initialSettings);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [coverFrame, setCoverFrame] = useState(null);
  const [draftVideo, setDraftVideo] = useState(null);
  const [loadingDraft, setLoadingDraft] = useState(false);

  useEffect(() => {
    if (!file && !isEditingDraft) navigate("/create", { replace: true });
  }, [file, isEditingDraft, navigate]);

  useEffect(() => {
    let cancelled = false;
    api.getCategories()
      .then((response) => {
        if (cancelled) return;
        setCategories(response?.data?.categories ?? []);
      })
      .catch(() => setCategories([]));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!draftId) return undefined;

    let ignore = false;
    setLoadingDraft(true);
    setErrorMessage("");

    api.getVideo(draftId)
      .then((response) => {
        const nextVideo = response?.data?.video;
        if (ignore) return;
        if (!nextVideo?.id) {
          setErrorMessage("Draft not found.");
          return;
        }
        setDraftVideo(nextVideo);
        setDescription(nextVideo.description || nextVideo.caption || "");
        setLocationText(nextVideo.location || "");
        setCategoryId(nextVideo.categoryId ?? nextVideo.category?.id ?? null);
      })
      .catch((error) => {
        if (ignore) return;
        const message = error instanceof ApiError ? error.message : error?.message || "Unable to load draft.";
        setErrorMessage(message);
      })
      .finally(() => {
        if (!ignore) setLoadingDraft(false);
      });

    return () => { ignore = true; };
  }, [draftId]);

  const filePreviewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    if (draftVideo?.mediaUrl) return draftVideo.mediaUrl;
    return null;
  }, [file, draftVideo]);

  useEffect(() => {
    return () => {
      if (file && filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [file, filePreviewUrl]);

  useEffect(() => {
    return () => {
      if (coverFrame) releaseCoverFrames([coverFrame]);
    };
  }, [coverFrame]);

  const handleCoverSelect = (frame) => {
    setCoverFrame((prev) => {
      if (prev && prev.previewUrl !== frame?.previewUrl) releaseCoverFrames([prev]);
      return frame;
    });
  };

  const updateSetting = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: typeof value === "function" ? value(prev[key]) : value }));

  const submit = async (asDraft) => {
    if (status === "uploading" || status === "processing" || status === "publishing") return;

    setErrorMessage("");
    setProgress(0);

    try {
      if (isEditingDraft) {
        if (!draftVideo?.id) return;
        setStatus("publishing");

        let thumbnailUrl = draftVideo.thumbnailUrl ?? null;
        if (coverFrame?.blob) {
          setStatus("processing");
          const coverFile = coverFrame.blob instanceof File
            ? coverFrame.blob
            : new File([coverFrame.blob], "cover.jpg", { type: coverFrame.blob.type || "image/jpeg" });
          const coverUpload = await uploadSelectedFile(coverFile, "image");
          thumbnailUrl = coverUpload?.processedUrl || coverUpload?.url || thumbnailUrl;
          setStatus("publishing");
        }

        const updatePayload = {
          categoryId: categoryId || null,
          description: description.trim() || null,
          caption: description.trim() || null,
          location: locationText.trim() || null,
          thumbnailUrl,
          isDraft: asDraft,
        };

        const response = await api.updateVideo(draftVideo.id, updatePayload);
        let nextVideo = response?.data?.video ?? null;

        if (!asDraft && nextVideo?.isDraft) {
          const publishResponse = await api.publishVideo(draftVideo.id);
          nextVideo = publishResponse?.data?.video ?? nextVideo;
        }

        setStatus("done");
        navigate("/home", { replace: true, state: asDraft ? undefined : { newVideo: nextVideo } });
        return;
      }

      if (!file) return;

      const type = detectUploadType(file);
      const upload = await uploadSelectedFile(file, type, {
        onProgress: (event) => {
          if (event?.total) setProgress(Math.round((event.loaded / event.total) * 100));
        },
        onStatusChange: (nextStatus) => setStatus(nextStatus),
      });

      if (!upload?.id) throw new Error("Upload did not return a reference.");

      let thumbnailUrl = null;
      if (coverFrame?.blob) {
        setStatus("processing");
        const coverFile = coverFrame.blob instanceof File
          ? coverFrame.blob
          : new File([coverFrame.blob], "cover.jpg", { type: coverFrame.blob.type || "image/jpeg" });
        const coverUpload = await uploadSelectedFile(coverFile, "image");
        thumbnailUrl = coverUpload?.processedUrl || coverUpload?.url || null;
      }

      setStatus("publishing");

      const createPayload = {
        type,
        uploadId: upload.id,
        categoryId: categoryId || null,
        description: description.trim() || null,
        caption: description.trim() || null,
        location: locationText.trim() || null,
        mediaUrl: upload.processedUrl || upload.url || null,
        thumbnailUrl,
        isDraft: asDraft,
      };

      const response = await api.createVideo(createPayload);
      const createdVideo = response?.data?.video ?? null;

      setStatus("done");

      if (asDraft) {
        navigate("/home", { replace: true });
      } else {
        navigate("/home", { replace: true, state: { newVideo: createdVideo } });
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : error?.message || "Something went wrong.";
      setErrorMessage(message);
      setStatus("error");
    }
  };

  const discard = () => {
    if (status === "uploading" || status === "processing" || status === "publishing") return;
    navigate(isEditingDraft ? -1 : "/create", { replace: !isEditingDraft });
  };

  const draftFileShim = useMemo(() => {
    if (file || !draftVideo) return null;
    const inferredType = draftVideo.type === "image" || draftVideo.type === "gif"
      ? `image/${draftVideo.type === "gif" ? "gif" : "jpeg"}`
      : "video/mp4";
    return { name: draftVideo.title || draftVideo.caption || `draft.${draftVideo.type || "mp4"}`, type: inferredType };
  }, [file, draftVideo]);

  const effectiveFile = file || draftFileShim;
  const uploadType = file ? detectUploadType(file) : (draftVideo?.type || "video");

  const sharedProps = {
    file: effectiveFile,
    filePreviewUrl,
    uploadType,
    description,
    setDescription,
    locationText,
    setLocationText,
    settings,
    updateSetting,
    categories,
    categoryId,
    setCategoryId,
    coverFrame,
    onCoverSelect: handleCoverSelect,
    status,
    progress,
    errorMessage,
    maxDescription: MAX_DESCRIPTION,
    onPost: () => submit(false),
    onSaveDraft: () => submit(true),
    onDiscard: discard,
    isEditingDraft,
  };

  if (isEditingDraft && loadingDraft && !draftVideo) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate500 dark:text-slate200">
        Loading draft...
      </div>
    );
  }

  return (
    <>
      <PostDetailsForm {...sharedProps} />
      <MobilePostDetailsForm {...sharedProps} />
    </>
  );
}

export default FormContainer;
