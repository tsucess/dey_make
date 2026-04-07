import { api } from "../services/api";

const THUMBNAIL_MIME_TYPE = "image/jpeg";
const THUMBNAIL_TIMEOUT_MS = 10000;

function buildThumbnailName(sourceName = "thumbnail") {
  const baseName = `${sourceName}`
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "thumbnail";

  return `${baseName}-thumbnail.jpg`;
}

function waitForVideoFrame(videoElement) {
  if (videoElement.readyState >= 2 && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let timeoutId = null;

    const cleanup = () => {
      videoElement.removeEventListener("loadeddata", handleReady);
      videoElement.removeEventListener("canplay", handleReady);
      videoElement.removeEventListener("error", handleError);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };

    const handleReady = () => {
      if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        cleanup();
        resolve();
      }
    };

    const handleError = () => {
      cleanup();
      reject(new Error("Unable to capture a video frame."));
    };

    timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timed out while waiting for a video frame."));
    }, THUMBNAIL_TIMEOUT_MS);

    videoElement.addEventListener("loadeddata", handleReady);
    videoElement.addEventListener("canplay", handleReady);
    videoElement.addEventListener("error", handleError);
  });
}

function canvasToThumbnailFile(canvas, sourceName) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to create a thumbnail image."));
        return;
      }

      resolve(new File([blob], buildThumbnailName(sourceName), {
        type: THUMBNAIL_MIME_TYPE,
        lastModified: Date.now(),
      }));
    }, THUMBNAIL_MIME_TYPE, 0.92);
  });
}

export async function captureThumbnailFromVideoElement(videoElement, sourceName = "thumbnail") {
  if (!videoElement) throw new Error("Video preview is unavailable.");

  await waitForVideoFrame(videoElement);

  const canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth || 1280;
  canvas.height = videoElement.videoHeight || 720;

  const context = canvas.getContext("2d");

  if (!context) throw new Error("Canvas is unavailable.");

  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  return canvasToThumbnailFile(canvas, sourceName);
}

export async function captureThumbnailFromVideoFile(file) {
  if (!file) throw new Error("Video file is unavailable.");

  const objectUrl = URL.createObjectURL(file);
  const videoElement = document.createElement("video");
  videoElement.preload = "metadata";
  videoElement.muted = true;
  videoElement.playsInline = true;
  videoElement.src = objectUrl;

  try {
    return await captureThumbnailFromVideoElement(videoElement, file.name || "video");
  } finally {
    videoElement.pause?.();
    videoElement.removeAttribute("src");
    videoElement.load?.();
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadThumbnailFile(file) {
  const presignResponse = await api.presignUpload({
    type: "image",
    originalName: file.name,
  });
  const uploadStrategy = presignResponse?.data || {};

  if (uploadStrategy.strategy === "client-direct-upload") {
    const directUpload = await api.uploadFileDirect(file, uploadStrategy);
    const secureUrl = directUpload?.secure_url;

    if (!secureUrl) throw new Error("Thumbnail upload did not return a file URL.");

    const uploadResponse = await api.uploadFile({
      type: "image",
      path: secureUrl,
      originalName: file.name,
      mimeType: file.type || THUMBNAIL_MIME_TYPE,
      size: directUpload?.bytes ?? file.size ?? 0,
      width: directUpload?.width ?? null,
      height: directUpload?.height ?? null,
    });

    return uploadResponse?.data?.upload || null;
  }

  const uploadFormData = new FormData();
  uploadFormData.append("file", file);

  const uploadResponse = await api.uploadFile(uploadFormData);

  return uploadResponse?.data?.upload || null;
}