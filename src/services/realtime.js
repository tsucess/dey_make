import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getBackendBaseUrl, getStoredToken } from "./api";

let realtimeClient = null;
let realtimeClientToken = null;

function toPortNumber(value, fallback) {
  const parsed = Number.parseInt(`${value ?? ""}`.trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveHost(value, fallbackUrl, scheme) {
  const candidate = `${value || ""}`.trim();
  if (!candidate) return fallbackUrl.hostname;

  try {
    return new URL(candidate.includes("://") ? candidate : `${scheme}://${candidate}`).hostname;
  } catch {
    return candidate;
  }
}

function resolveRealtimeConfig() {
  if (typeof window === "undefined") return null;

  const appKey = `${import.meta.env.VITE_REVERB_APP_KEY || ""}`.trim();
  if (!appKey) return null;

  const backendBaseUrl = getBackendBaseUrl();
  const backendUrl = new URL(backendBaseUrl);
  const scheme = `${import.meta.env.VITE_REVERB_SCHEME || backendUrl.protocol.replace(":", "") || "https"}`.trim() || "https";
  const forceTLS = scheme === "https";

  return {
    appKey,
    authEndpoint: `${backendBaseUrl}/api/broadcasting/auth`,
    wsHost: resolveHost(import.meta.env.VITE_REVERB_HOST, backendUrl, scheme),
    wsPort: toPortNumber(import.meta.env.VITE_REVERB_PORT, forceTLS ? 443 : 80),
    wssPort: toPortNumber(import.meta.env.VITE_REVERB_PORT, forceTLS ? 443 : 80),
    forceTLS,
  };
}

export function getRealtimeClient() {
  const token = getStoredToken();
  const config = resolveRealtimeConfig();

  if (!config || !token || typeof window === "undefined") {
    return null;
  }

  if (realtimeClient && realtimeClientToken === token) {
    return realtimeClient;
  }

  realtimeClient?.disconnect();

  window.Pusher = Pusher;
  realtimeClientToken = token;
  realtimeClient = new Echo({
    broadcaster: "reverb",
    key: config.appKey,
    wsHost: config.wsHost,
    wsPort: config.wsPort,
    wssPort: config.wssPort,
    forceTLS: config.forceTLS,
    enabledTransports: ["ws", "wss"],
    authEndpoint: config.authEndpoint,
    auth: {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  });

  return realtimeClient;
}

export function subscribeToPrivateChannel(channelName, listeners = {}) {
  const client = getRealtimeClient();
  if (!client || !channelName) return () => {};

  const channel = client.private(channelName);
  Object.entries(listeners).forEach(([eventName, handler]) => {
    if (typeof handler === "function") {
      channel.listen(eventName, handler);
    }
  });

  return () => {
    Object.entries(listeners).forEach(([eventName, handler]) => {
      if (typeof handler === "function") {
        channel.stopListening(eventName, handler);
      }
    });

    client.leave(channelName);
  };
}

export function joinPresenceChannel(channelName, { here, joining, leaving, listeners = {}, whispers = {} } = {}) {
  const client = getRealtimeClient();
  if (!client || !channelName) {
    return {
      whisper: () => {},
      unsubscribe: () => {},
    };
  }

  const channel = client.join(channelName);

  if (typeof here === "function") channel.here(here);
  if (typeof joining === "function") channel.joining(joining);
  if (typeof leaving === "function") channel.leaving(leaving);

  Object.entries(listeners).forEach(([eventName, handler]) => {
    if (typeof handler === "function") {
      channel.listen(eventName, handler);
    }
  });

  Object.entries(whispers).forEach(([eventName, handler]) => {
    if (typeof handler === "function") {
      channel.listenForWhisper(eventName, handler);
    }
  });

  return {
    whisper(eventName, payload) {
      if (!eventName) return;
      channel.whisper(eventName, payload);
    },
    unsubscribe() {
      Object.entries(listeners).forEach(([eventName, handler]) => {
        if (typeof handler === "function") {
          channel.stopListening(eventName, handler);
        }
      });

      client.leave(channelName);
    },
  };
}