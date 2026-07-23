import { api, DIRECT_UPLOAD_LARGE_FILE_THRESHOLD } from "../services/api";

export function detectUploadType(file) {
  const mime = file?.type || "";
  const ext = (file?.name || "").split(".").pop()?.toLowerCase() || "";

  if (ext === "gif" || mime === "image/gif") return "gif";
  if (mime.startsWith("image/")) return "image";
  return "video";
}

function requiresDirectUpload(file, type) {
  return type === "video" || (file?.size ?? 0) > DIRECT_UPLOAD_LARGE_FILE_THRESHOLD;
}

export async function uploadSelectedFile(file, type, callbacks = {}) {
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

    const directUpload = await api.uploadFileDirect(file, uploadStrategy, { onProgress });
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

  if (requiresDirectUpload(file, type)) {
    throw new Error("Large files and videos must upload directly.");
  }

  const uploadFormData = new FormData();
  uploadFormData.append("file", file);

  onStatusChange?.("uploading");

  const uploadResponse = await api.uploadFile(uploadFormData);

  return uploadResponse?.data?.upload || null;
}
