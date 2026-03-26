const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");
const TOKEN_STORAGE_KEY = "deymake.auth.token";

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

async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    token = getStoredToken(),
  } = options;
  const isFormData = body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData && body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
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
}

export const api = {
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  me: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),
  joinWaitlist: (payload) => request("/waitlist", { method: "POST", body: payload }),
  getHome: () => request("/home"),
  getCategories: () => request("/categories"),
  getVideos: (category) => request(category ? `/videos?category=${encodeURIComponent(category)}` : "/videos"),
  getTrendingVideos: () => request("/videos/trending"),
  getLiveVideos: () => request("/videos/live"),
  uploadFile: (formData) => request("/uploads", { method: "POST", body: formData }),
  createVideo: (payload) => request("/videos", { method: "POST", body: payload }),
  updateVideo: (id, payload) => request(`/videos/${id}`, { method: "PATCH", body: payload }),
  publishVideo: (id) => request(`/videos/${id}/publish`, { method: "POST" }),
  getProfile: () => request("/me/profile"),
  updateProfile: (payload) => request("/me/profile", { method: "PATCH", body: payload }),
  getProfileFeed: (feed) => request(`/me/${feed}`),
  getUser: (id) => request(`/users/${id}`),
  getUserPosts: (id) => request(`/users/${id}/posts`),
  searchUsers: (query) => request(`/users/search?q=${encodeURIComponent(query)}`),
  getPreferences: () => request("/me/preferences"),
  updatePreferences: (payload) => request("/me/preferences", { method: "PATCH", body: payload }),
  getLeaderboard: (period) => request(`/leaderboard?period=${period}`),
  getConversations: () => request("/conversations"),
  getSuggestedUsers: () => request("/conversations/suggested"),
  createConversation: (payload) => request("/conversations", { method: "POST", body: payload }),
  getConversationMessages: (id) => request(`/conversations/${id}/messages`),
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