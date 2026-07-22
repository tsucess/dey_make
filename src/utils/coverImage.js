const FRAME_SAMPLE_RATIOS = [0.1, 0.3, 0.5, 0.7, 0.9];

const frameCache = typeof WeakMap === "function" ? new WeakMap() : null;

function drawVideoFrame(video, targetWidth) {
  const naturalWidth = video.videoWidth || targetWidth;
  const naturalHeight = video.videoHeight || Math.round(targetWidth * 9 / 16);
  const scale = Math.min(1, targetWidth / naturalWidth);
  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(video, 0, 0, width, height);
  return canvas;
}

function seekVideo(video, time) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", handleError);
    };
    const handleSeeked = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("Video seek failed."));
    };
    video.addEventListener("seeked", handleSeeked, { once: true });
    video.addEventListener("error", handleError, { once: true });
    try {
      video.currentTime = Math.max(0, Math.min(time, (video.duration || 0) - 0.05));
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
}

function canvasToBlob(canvas, quality = 0.82) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

export async function extractVideoCoverFrames(file, { width = 720 } = {}) {
  if (!file || typeof window === "undefined") return [];

  const cached = frameCache?.get(file);
  if (cached && cached.width === width) {
    return cached.frames;
  }

  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = "anonymous";
  video.src = objectUrl;

  try {
    await new Promise((resolve, reject) => {
      const onReady = () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("error", onError);
        resolve();
      };
      const onError = () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("error", onError);
        reject(new Error("Unable to read video metadata."));
      };
      video.addEventListener("loadeddata", onReady, { once: true });
      video.addEventListener("error", onError, { once: true });
    });

    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;

    const frames = [];
    for (const ratio of FRAME_SAMPLE_RATIOS) {
      try {
        await seekVideo(video, duration * ratio);
        const canvas = drawVideoFrame(video, width);
        if (!canvas) continue;
        const blob = await canvasToBlob(canvas);
        if (!blob) continue;
        frames.push({
          id: `frame-${Math.round(ratio * 100)}`,
          blob,
          previewUrl: URL.createObjectURL(blob),
          timestamp: Math.round(duration * ratio * 100) / 100,
          cached: true,
        });
      } catch {
        // best-effort; skip failed frames
      }
    }

    frameCache?.set(file, { width, frames });

    return frames;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function fileToCoverFrame(file) {
  if (!file) return null;

  const cached = frameCache?.get(file);
  if (cached && Array.isArray(cached.frames) && cached.frames[0]) {
    return cached.frames[0];
  }

  const frame = {
    id: "source-image",
    blob: file,
    previewUrl: URL.createObjectURL(file),
    timestamp: null,
    cached: true,
  };

  frameCache?.set(file, { width: null, frames: [frame] });

  return frame;
}

export function releaseCoverFrames(frames = []) {
  frames.forEach((frame) => {
    if (frame?.cached) return;
    if (frame?.previewUrl) URL.revokeObjectURL(frame.previewUrl);
  });
}

export function clearCoverFrameCache(file) {
  if (!frameCache || !file) return;
  const entry = frameCache.get(file);
  if (entry?.frames) {
    entry.frames.forEach((frame) => {
      if (frame?.previewUrl) URL.revokeObjectURL(frame.previewUrl);
    });
  }
  frameCache.delete(file);
}
