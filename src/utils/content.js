import { getActiveLocale, translate } from "../locales/translations";

export const FALLBACK_AVATAR = "/default avatar.jpg";
export const FALLBACK_THUMBNAIL = "/Trending image.png";

export function formatCompactNumber(value) {
  const numericValue = Number(value ?? 0);
  const locale = getActiveLocale();

  if (!Number.isFinite(numericValue)) return "0";
  if (Math.abs(numericValue) < 1000) return `${numericValue}`;

  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(numericValue);
}

export function formatCountLabel(value, noun = translate(getActiveLocale(), "content.views")) {
  return `${formatCompactNumber(value)} ${noun}`;
}

export function formatSubscriberLabel(value, noun = translate(getActiveLocale(), "content.subscribers")) {
  return `${formatCompactNumber(value)} ${noun}`;
}

export function formatRelativeTime(value) {
  const locale = getActiveLocale();
  if (!value) return translate(locale, "content.justNow");

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return translate(locale, "content.justNow");

  const elapsedSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  let duration = elapsedSeconds;

  for (const [threshold, unit] of units) {
    if (Math.abs(duration) < threshold) {
      return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(Math.round(duration), unit);
    }

    duration /= threshold;
  }

  return translate(locale, "content.justNow");
}

export function getProfileAvatar(profile) {
  return profile?.avatarUrl || FALLBACK_AVATAR;
}

export function getProfileName(profile, fallback = translate(getActiveLocale(), "content.unknownCreator")) {
  if (typeof profile === "string" && profile.trim()) {
    return profile.trim();
  }

  return profile?.fullName?.trim() || profile?.name?.trim() || profile?.username?.trim() || fallback;
}

export function getVideoTitle(video) {
  const untitledVideo = translate(getActiveLocale(), "content.untitledVideo");
  if (!video) return untitledVideo;

  return video.title || video.caption || video.description || (isActiveLiveVideo(video) ? translate(getActiveLocale(), "content.liveStream") : untitledVideo);
}

export function getVideoTags(video) {
  return [video?.category?.label || video?.category?.name].filter(Boolean);
}

function normalizeBooleanFlag(value) {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no", ""].includes(normalized)) return false;
  }

  return Boolean(value);
}

export function isActiveLiveVideo(video) {
  return normalizeBooleanFlag(video?.isLive);
}

export function filterActiveLiveVideos(videos) {
  return Array.isArray(videos) ? videos.filter(isActiveLiveVideo) : [];
}

function resolveVideoRouteOptions(videoOrId, options = {}) {
  if (typeof options === "boolean") {
    return { id: videoOrId?.id ?? videoOrId, isLive: normalizeBooleanFlag(options) };
  }

  return {
    id: videoOrId?.id ?? videoOrId,
    isLive: options.isLive ?? isActiveLiveVideo(videoOrId),
  };
}

export function buildVideoLink(videoOrId, options = {}) {
  const { id, isLive } = resolveVideoRouteOptions(videoOrId, options);
  return `${isLive ? "/live" : "/video"}/${id}`;
}

export function buildShareUrl(videoOrId, options = {}) {
  const path = buildVideoLink(videoOrId, options);
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function getVideoThumbnail(video) {
  if (!video) return FALLBACK_THUMBNAIL;
  if (video.thumbnailUrl) return video.thumbnailUrl;
  if (["image", "gif"].includes(video.type) && video.mediaUrl) return video.mediaUrl;

  return FALLBACK_THUMBNAIL;
}

export function getCategoryThumbnail(category) {
  return category?.thumbnailUrl || FALLBACK_THUMBNAIL;
}

export function getVideoProcessingStatus(video) {
  const rawStatus = video?.processingStatus || video?.upload?.processingStatus;

  if (typeof rawStatus !== "string") return "completed";

  const normalizedStatus = rawStatus.trim().toLowerCase();

  return normalizedStatus || "completed";
}

export function mapVideoToCardProps(video) {
  return {
    id: video?.id,
    thumb: getVideoThumbnail(video),
    title: getVideoTitle(video),
    author: getProfileName(video?.author || video?.creator),
    avatarUrl: getProfileAvatar(video?.author || video?.creator),
    tags: getVideoTags(video),
    live: isActiveLiveVideo(video),
    processingStatus: getVideoProcessingStatus(video),
  };
}
