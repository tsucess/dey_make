import { getActiveLocale, translate } from "../locales/translations";
import { getBackendBaseUrl } from "../services/api";

export const FALLBACK_AVATAR = "/default avatar.jpg";
export const FALLBACK_THUMBNAIL = "/Trending image.png";

const LOCAL_NETWORK_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127(?:\.[0-9]+){0,3}$/,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^10(?:\.[0-9]+){3}$/,
  /^192\.168(?:\.[0-9]+){2}$/,
  /^172\.(1[6-9]|2[0-9]|3[0-1])(?:\.[0-9]+){2}$/,
];

function isLocalNetworkHostname(hostname = "") {
  const normalizedHostname = `${hostname}`.trim().toLowerCase();

  if (!normalizedHostname) return false;

  return LOCAL_NETWORK_HOSTNAME_PATTERNS.some((pattern) => pattern.test(normalizedHostname));
}

function resolveBackendOrigin(backendBaseUrl = getBackendBaseUrl()) {
  try {
    return new URL(backendBaseUrl).origin;
  } catch {
    return "";
  }
}

export function normalizeAssetUrl(value, options = {}) {
  if (typeof value !== "string") return "";

  const trimmedValue = value.trim();

  if (!trimmedValue) return "";
  if (!/^https?:\/\//i.test(trimmedValue)) return trimmedValue;

  let assetUrl;

  try {
    assetUrl = new URL(trimmedValue);
  } catch {
    return trimmedValue;
  }

  const currentHostname = options.currentHostname
    ?? (typeof window === "undefined" ? "" : window.location.hostname);
  const currentProtocol = options.currentProtocol
    ?? (typeof window === "undefined" ? "" : window.location.protocol);

  if (isLocalNetworkHostname(currentHostname)) {
    return trimmedValue;
  }

  const backendOrigin = resolveBackendOrigin(options.backendBaseUrl);

  if (!backendOrigin) {
    return trimmedValue;
  }

  let backendUrl;

  try {
    backendUrl = new URL(backendOrigin);
  } catch {
    return trimmedValue;
  }

  const shouldReplaceOrigin = isLocalNetworkHostname(assetUrl.hostname)
    || (currentProtocol === "https:" && assetUrl.protocol === "http:" && assetUrl.hostname === backendUrl.hostname);

  if (!shouldReplaceOrigin) {
    return trimmedValue;
  }

  return `${backendOrigin}${assetUrl.pathname}${assetUrl.search}${assetUrl.hash}`;
}

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

export function getProfileAvatar(profile, options = {}) {
  return normalizeAssetUrl(profile?.avatarUrl, options) || FALLBACK_AVATAR;
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

export function getVideoRouteId(videoOrId) {
  const routeId = videoOrId?.publicId ?? videoOrId?.public_id ?? videoOrId?.id ?? videoOrId;

  if (routeId === null || routeId === undefined || routeId === "") {
    return "";
  }

  return `${routeId}`;
}

function resolveVideoRouteOptions(videoOrId, options = {}) {
  if (typeof options === "boolean") {
    return { id: getVideoRouteId(videoOrId), isLive: normalizeBooleanFlag(options) };
  }

  return {
    id: getVideoRouteId(videoOrId),
    isLive: options.isLive ?? isActiveLiveVideo(videoOrId),
  };
}

export function buildVideoLink(videoOrId, options = {}) {
  const { id, isLive } = resolveVideoRouteOptions(videoOrId, options);
  return `${isLive ? "/live" : "/video"}/${id}`;
}

export function buildVideoAnalyticsLink(videoOrId) {
  const id = getVideoRouteId(videoOrId);
  return `/video/${id}/analytics`;
}

export function hasPostLiveAnalytics(video) {
  return Boolean(
    !isActiveLiveVideo(video) && (
      video?.liveEndedAt
      || video?.liveStartedAt
      || video?.liveAnalytics?.peakViewers
      || video?.liveLikes
      || video?.liveComments
    )
  );
}

export function buildShareUrl(videoOrId, options = {}) {
  const path = buildVideoLink(videoOrId, options);
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function getVideoThumbnail(video, options = {}) {
  if (!video) return FALLBACK_THUMBNAIL;
  if (video.thumbnailUrl) return normalizeAssetUrl(video.thumbnailUrl, options) || FALLBACK_THUMBNAIL;
  if (["image", "gif"].includes(video.type) && video.mediaUrl) return normalizeAssetUrl(video.mediaUrl, options) || FALLBACK_THUMBNAIL;

  return FALLBACK_THUMBNAIL;
}

export function getVideoMediaUrl(video, options = {}) {
  return normalizeAssetUrl(video?.mediaUrl, options);
}

export function getVideoStreamUrl(video, options = {}) {
  return normalizeAssetUrl(video?.streamUrl, options);
}

export function getCategoryThumbnail(category, options = {}) {
  return normalizeAssetUrl(category?.thumbnailUrl, options) || FALLBACK_THUMBNAIL;
}

export function getVideoProcessingStatus(video) {
  const rawStatus = video?.processingStatus || video?.upload?.processingStatus;

  if (typeof rawStatus !== "string") return "completed";

  const normalizedStatus = rawStatus.trim().toLowerCase();

  return normalizedStatus || "completed";
}

export function mapVideoToCardProps(video) {
  return {
    id: getVideoRouteId(video),
    thumb: getVideoThumbnail(video),
    title: getVideoTitle(video),
    author: getProfileName(video?.author || video?.creator),
    avatarUrl: getProfileAvatar(video?.author || video?.creator),
    tags: getVideoTags(video),
    live: isActiveLiveVideo(video),
    processingStatus: getVideoProcessingStatus(video),
    creatorId: video?.author?.id || video?.creator?.id || null,
    hasAnalytics: hasPostLiveAnalytics(video),
    analyticsHref: hasPostLiveAnalytics(video) ? buildVideoAnalyticsLink(video) : null,
  };
}
