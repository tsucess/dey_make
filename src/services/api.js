import { getActiveLocale, LANGUAGE_STORAGE_KEY, resolveLocale } from "../locales/translations";

const DEFAULT_API_BASE_URL = "https://api.deymake.com/api/v1";
const LOCAL_API_FALLBACK = "http://127.0.0.1:8000";

function normalizeApiBaseUrl(value) {
  const trimmedValue = (value || "").trim().replace(/\/$/, "");
  if (!trimmedValue) return DEFAULT_API_BASE_URL;
  return trimmedValue.endsWith("/api/v1") ? trimmedValue : `${trimmedValue}/api/v1`;
}

function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (configuredBaseUrl) return normalizeApiBaseUrl(configuredBaseUrl);

  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return normalizeApiBaseUrl(LOCAL_API_FALLBACK);
  }

  return normalizeApiBaseUrl(DEFAULT_API_BASE_URL);
}

const API_BASE_URL = resolveApiBaseUrl();
const TOKEN_STORAGE_KEY = "deymake.auth.token";
export const DIRECT_UPLOAD_LARGE_FILE_THRESHOLD = 95 * 1024 * 1024;
const DIRECT_UPLOAD_MIN_CHUNK_SIZE = 5 * 1024 * 1024;
const DIRECT_UPLOAD_DEFAULT_CHUNK_SIZE = 20 * 1024 * 1024;
export const DEFAULT_REQUEST_TIMEOUT_MS = 15000;

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    const stringValue = `${value}`.trim();

    if (!stringValue) return;

    searchParams.set(key, stringValue);
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function getPreferredRequestLocale(body, headers = {}) {
  const headerLocale = headers["X-Locale"] || headers["x-locale"] || headers["Accept-Language"] || headers["accept-language"];
  const bodyLocale = body && typeof body === "object" && !(body instanceof FormData) ? body.language : undefined;
  const storedLocale = typeof window === "undefined" ? null : window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  return resolveLocale(headerLocale || bodyLocale || getActiveLocale() || storedLocale);
}

async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    token = getStoredToken(),
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  } = options;
  const isFormData = body instanceof FormData;
  const locale = getPreferredRequestLocale(body, headers);
  const controller = typeof AbortController === "function" && timeoutMs > 0 ? new AbortController() : null;
  const timeoutId = controller
    ? globalThis.setTimeout(() => controller.abort(), timeoutMs)
    : null;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(locale ? { "Accept-Language": locale, "X-Locale": locale } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(!isFormData && body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      ...(controller ? { signal: controller.signal } : {}),
    });
    const text = await response.text();
    let json = null;

    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text ? { message: text } : null;
    }

    if (!response.ok) {
      throw new ApiError(json?.message || "Request failed.", response.status, json?.errors || {});
    }

    return json;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error?.name === "AbortError") {
      throw new ApiError("Request timed out.", 408, { request: ["Request timed out."] });
    }

    throw new ApiError("Unable to reach the server.", 503, { request: ["Unable to reach the server."] });
  } finally {
    if (timeoutId !== null) globalThis.clearTimeout(timeoutId);
  }
}

function buildDirectUploadFormData(filePart, uploadConfig = {}, fileName) {
  const formData = new FormData();

  Object.entries(uploadConfig?.fields || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, `${value}`);
  });

  formData.append("file", filePart, fileName);

  return formData;
}

function parseDirectUploadResponse(xhr) {
  const text = xhr.responseText || "";

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text ? { message: text } : null;
  }
}

function createDirectUploadId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeDirectUploadChunkSize(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return DIRECT_UPLOAD_DEFAULT_CHUNK_SIZE;
  }

  return Math.max(DIRECT_UPLOAD_MIN_CHUNK_SIZE, Math.floor(numericValue));
}

function sendDirectUploadRequest(file, uploadConfig = {}, options = {}) {
  const endpoint = uploadConfig?.endpoint;
  const onProgress = options?.onProgress;

  if (!endpoint) {
    return Promise.reject(new ApiError("Upload endpoint is unavailable.", 500, {
      file: ["Upload endpoint is unavailable."],
    }));
  }

  const total = options?.total ?? file?.size ?? 0;
  const loadedOffset = options?.loadedOffset ?? 0;
  const formData = buildDirectUploadFormData(
    options?.filePart ?? file,
    uploadConfig,
    options?.fileName ?? file?.name ?? "upload.bin",
  );

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(uploadConfig?.method || "POST", endpoint);

    Object.entries({
      ...(uploadConfig?.headers || {}),
      ...(options?.headers || {}),
    }).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      xhr.setRequestHeader(key, `${value}`);
    });

    xhr.upload.addEventListener("progress", (event) => {
      if (!onProgress) return;

      const loaded = Math.min(total, loadedOffset + (event.loaded || 0));
      const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;

      onProgress({
        loaded,
        total,
        percent: Math.max(0, Math.min(100, percent)),
      });
    });

    xhr.addEventListener("load", () => {
      const data = parseDirectUploadResponse(xhr);

      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) {
          const loaded = Math.min(total, options?.completedLoaded ?? total);
          const percent = total > 0 ? Math.round((loaded / total) * 100) : 100;

          onProgress({
            loaded,
            total,
            percent: Math.max(0, Math.min(100, percent)),
          });
        }

        resolve(data || {});
        return;
      }

      const message = data?.error?.message || data?.message || "Unable to upload file.";
      reject(new ApiError(message, xhr.status || 502, { file: [message] }));
    });

    xhr.addEventListener("error", () => {
      const message = "Unable to upload file.";
      reject(new ApiError(message, xhr.status || 502, { file: [message] }));
    });

    xhr.addEventListener("abort", () => {
      const message = "Upload was cancelled.";
      reject(new ApiError(message, xhr.status || 499, { file: [message] }));
    });

    xhr.send(formData);
  });
}

async function uploadFileDirect(file, uploadConfig = {}, options = {}) {
  const fileSize = file?.size ?? 0;

  if (fileSize <= DIRECT_UPLOAD_LARGE_FILE_THRESHOLD || typeof file?.slice !== "function") {
    return sendDirectUploadRequest(file, uploadConfig, options);
  }

  const chunkSize = normalizeDirectUploadChunkSize(uploadConfig?.chunkSize);
  const uploadId = createDirectUploadId();
  let lastResponse = {};

  for (let start = 0; start < fileSize; start += chunkSize) {
    const end = Math.min(start + chunkSize, fileSize);
    const chunk = file.slice(start, end);

    lastResponse = await sendDirectUploadRequest(file, uploadConfig, {
      ...options,
      filePart: chunk,
      fileName: file?.name,
      total: fileSize,
      loadedOffset: start,
      completedLoaded: end,
      headers: {
        "Content-Range": `bytes ${start}-${end - 1}/${fileSize}`,
        "X-Unique-Upload-Id": uploadId,
      },
    });
  }

  return lastResponse;
}

export const api = {
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  verifyEmailCode: (payload) => request("/auth/verify-email-code", { method: "POST", body: payload }),
  resendVerificationCode: (payload) => request("/auth/resend-verification-code", { method: "POST", body: payload }),
  forgotPassword: (payload) => request("/auth/forgot-password", { method: "POST", body: payload }),
  resetPassword: (payload) => request("/auth/reset-password", { method: "POST", body: payload }),
  getOAuthRedirectUrl: (provider) => `${API_BASE_URL}/auth/oauth/${encodeURIComponent(provider)}/redirect`,
  me: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),
  joinWaitlist: (payload) => request("/waitlist", { method: "POST", body: payload }),
  getHome: () => request("/home"),
  getCategories: () => request("/categories"),
  getVideos: (category) => request(category ? `/videos?category=${encodeURIComponent(category)}` : "/videos"),
  getTrendingVideos: () => request("/videos/trending"),
  getLiveVideos: () => request("/videos/live"),
  presignUpload: (payload) => request("/uploads/presign", { method: "POST", body: payload }),
  uploadFileDirect: (file, uploadConfig, options) => uploadFileDirect(file, uploadConfig, options),
  uploadFile: (formData) => request("/uploads", { method: "POST", body: formData }),
  createVideo: (payload) => request("/videos", { method: "POST", body: payload }),
  updateVideo: (id, payload) => request(`/videos/${id}`, { method: "PATCH", body: payload }),
  publishVideo: (id) => request(`/videos/${id}/publish`, { method: "POST" }),
  getLiveAgoraSession: (id, options = {}) => request(`/videos/${id}/live/session${buildQueryString({ role: options.role })}`),
  startVideoLive: (id) => request(`/videos/${id}/live/start`, { method: "POST" }),
  stopVideoLive: (id) => request(`/videos/${id}/live/stop`, { method: "POST" }),
  sendLiveSignal: (id, payload) => request(`/videos/${id}/live/signals`, { method: "POST", body: payload }),
  getLiveSignals: (id, options = {}) => request(`/videos/${id}/live/signals${buildQueryString({ after: options.after })}`),
  getProfile: () => request("/me/profile"),
  updateProfile: (payload) => request("/me/profile", { method: "PATCH", body: payload }),
  getProfileFeed: (feed) => request(`/me/${feed}`),
  getUser: (id) => request(`/users/${id}`),
  getUserPosts: (id) => request(`/users/${id}/posts`),
  searchUsers: (query) => request(`/users/search${buildQueryString({ q: query })}`),
  search: (query) => request(`/search${buildQueryString({ q: query })}`),
  searchSuggestions: (query) => request(`/search/suggestions${buildQueryString({ q: query })}`),
  searchVideos: (query) => request(`/search/videos${buildQueryString({ q: query })}`),
  searchCreators: (query) => request(`/search/creators${buildQueryString({ q: query })}`),
  searchCategories: (query) => request(`/search/categories${buildQueryString({ q: query })}`),
  getNotifications: () => request("/notifications"),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: "POST" }),
  markAllNotificationsRead: () => request("/notifications/read-all", { method: "POST" }),
  getPreferences: () => request("/me/preferences"),
  updatePreferences: (payload) => request("/me/preferences", { method: "PATCH", body: payload }),
  getDeveloperOverview: () => request("/developer"),
  createDeveloperApiKey: (payload) => request("/developer/api-keys", { method: "POST", body: payload }),
  deleteDeveloperApiKey: (id) => request(`/developer/api-keys/${id}`, { method: "DELETE" }),
  createDeveloperWebhook: (payload) => request("/developer/webhooks", { method: "POST", body: payload }),
  updateDeveloperWebhook: (id, payload) => request(`/developer/webhooks/${id}`, { method: "PATCH", body: payload }),
  rotateDeveloperWebhookSecret: (id) => request(`/developer/webhooks/${id}/rotate-secret`, { method: "POST" }),
  deleteDeveloperWebhook: (id) => request(`/developer/webhooks/${id}`, { method: "DELETE" }),
  getLeaderboard: (period) => request(`/leaderboard?period=${period}`),
  getConversations: () => request("/conversations"),
  getSuggestedUsers: () => request("/conversations/suggested"),
  createConversation: (payload) => request("/conversations", { method: "POST", body: payload }),
  getConversationMessages: (id, options = {}) => request(`/conversations/${id}/messages${buildQueryString({ after: options.after })}`),
  sendConversationMessage: (id, body) => request(`/conversations/${id}/messages`, { method: "POST", body: { body } }),
  markConversationRead: (id) => request(`/conversations/${id}/read`, { method: "POST" }),
  getVideo: (id) => request(`/videos/${id}`),
  getRelatedVideos: (id) => request(`/videos/${id}/related`),
  getVideoComments: (id) => request(`/videos/${id}/comments`),
  getCommentReplies: (id) => request(`/comments/${id}/replies`),
  recordView: (id) => request(`/videos/${id}/view`, { method: "POST" }),
  likeVideo: (id) => request(`/videos/${id}/like`, { method: "POST" }),
  unlikeVideo: (id) => request(`/videos/${id}/like`, { method: "DELETE" }),
  dislikeVideo: (id) => request(`/videos/${id}/dislike`, { method: "POST" }),
  undislikeVideo: (id) => request(`/videos/${id}/dislike`, { method: "DELETE" }),
  saveVideo: (id) => request(`/videos/${id}/save`, { method: "POST" }),
  unsaveVideo: (id) => request(`/videos/${id}/save`, { method: "DELETE" }),
  shareVideo: (id) => request(`/videos/${id}/share`, { method: "POST" }),
  reportVideo: (id, payload) => request(`/videos/${id}/report`, { method: "POST", body: payload }),
  subscribeToCreator: (id) => request(`/creators/${id}/subscribe`, { method: "POST" }),
  unsubscribeFromCreator: (id) => request(`/creators/${id}/subscribe`, { method: "DELETE" }),
  getCreatorPlans: (id) => request(`/users/${id}/plans`),
  getCreatorMemberships: () => request("/memberships/creator"),
  getMyMemberships: () => request("/memberships/mine"),
  createCreatorPlan: (payload) => request("/memberships/plans", { method: "POST", body: payload }),
  updateCreatorPlan: (id, payload) => request(`/memberships/plans/${id}`, { method: "PATCH", body: payload }),
  deleteCreatorPlan: (id) => request(`/memberships/plans/${id}`, { method: "DELETE" }),
  subscribeToPlan: (id) => request(`/memberships/plans/${id}/subscribe`, { method: "POST" }),
  cancelMembership: (id) => request(`/memberships/${id}/cancel`, { method: "POST" }),
  postComment: (videoId, body) => request(`/videos/${videoId}/comments`, { method: "POST", body: { body } }),
  replyToComment: (commentId, body) => request(`/comments/${commentId}/replies`, { method: "POST", body: { body } }),
  likeComment: (commentId) => request(`/comments/${commentId}/like`, { method: "POST" }),
  unlikeComment: (commentId) => request(`/comments/${commentId}/like`, { method: "DELETE" }),
  dislikeComment: (commentId) => request(`/comments/${commentId}/dislike`, { method: "POST" }),
  undislikeComment: (commentId) => request(`/comments/${commentId}/dislike`, { method: "DELETE" }),
};

export function firstError(errors, fallback = "Something went wrong.") {
  const firstKey = Object.keys(errors || {})[0];
  return firstKey ? errors[firstKey]?.[0] || fallback : fallback;
}