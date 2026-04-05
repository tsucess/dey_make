import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = { isAuthenticated: true, user: { id: 99, fullName: "Viewer Example", avatarUrl: "" } };
const agoraMockState = vi.hoisted(() => ({ lastClient: null, lastLocalTracks: [] }));

function createMockAgoraTrack(kind) {
  const mediaStreamTrack = { kind, stop: vi.fn() };
  return {
    stop: vi.fn(),
    close: vi.fn(),
    getMediaStreamTrack: vi.fn(() => mediaStreamTrack),
  };
}

vi.mock("agora-rtc-sdk-ng", () => ({
  default: {
    createClient: vi.fn(() => {
      const handlers = {};
      const client = {
        remoteUsers: [],
        on: vi.fn((event, handler) => { handlers[event] = handler; }),
        join: vi.fn().mockResolvedValue("joined"),
        setClientRole: vi.fn().mockResolvedValue(undefined),
        publish: vi.fn().mockResolvedValue(undefined),
        subscribe: vi.fn().mockResolvedValue(undefined),
        leave: vi.fn().mockResolvedValue(undefined),
        removeAllListeners: vi.fn(),
        __handlers: handlers,
      };
      agoraMockState.lastClient = client;
      return client;
    }),
    createMicrophoneAndCameraTracks: vi.fn(async () => {
      const tracks = [createMockAgoraTrack("audio"), createMockAgoraTrack("video")];
      agoraMockState.lastLocalTracks = tracks;
      return tracks;
    }),
  },
}));

vi.mock("../context/LanguageContext", async () => {
  const actual = await vi.importActual("../locales/translations");
  const t = actual.createTranslator("en");
  return { useLanguage: () => ({ locale: "en", setLocale: vi.fn(), t }) };
});

vi.mock("../context/AuthContext", () => ({ useAuth: () => authState }));
vi.mock("../live/liveSessionStore", () => ({ clearLiveCreationSession: vi.fn() }));

vi.mock("../services/api", () => ({
  DIRECT_UPLOAD_LARGE_FILE_THRESHOLD: 5 * 1024 * 1024,
  firstError: (errors, fallback) => errors?.[0] || fallback || "Something went wrong.",
  api: {
    getVideo: vi.fn(),
    getVideoComments: vi.fn(),
    getLiveAgoraSession: vi.fn(),
    startVideoLive: vi.fn(),
    stopVideoLive: vi.fn(),
    presignUpload: vi.fn(),
    uploadFileDirect: vi.fn(),
    uploadFile: vi.fn(),
    updateVideo: vi.fn(),
    postComment: vi.fn(),
  },
}));

import { api } from "../services/api";
import LiveRoom from "./LiveRoom";

class MockMediaStream {
  constructor(tracks = []) { this._tracks = tracks; }
  getTracks() { return this._tracks; }
}

class MockMediaRecorder {
  static isTypeSupported() { return true; }
  constructor(stream, options = {}) { this.stream = stream; this.mimeType = options.mimeType || "video/webm"; this.state = "inactive"; this.listeners = {}; this.ondataavailable = null; }
  addEventListener(name, handler) { this.listeners[name] ??= []; this.listeners[name].push(handler); }
  start() { this.state = "recording"; }
  requestData() { this.ondataavailable?.({ data: new Blob(["chunk"], { type: this.mimeType }) }); }
  stop() { if (this.state === "inactive") return; this.requestData(); this.state = "inactive"; (this.listeners.stop || []).forEach((handler) => handler()); }
}

function buildVideo(overrides = {}) {
  return {
    id: 10,
    type: "video",
    title: "Alpha Live",
    description: "Streaming now",
    mediaUrl: "https://cdn.example.com/alpha.mp4",
    thumbnailUrl: "https://cdn.example.com/thumb.jpg",
    createdAt: "2026-04-04T12:00:00Z",
    views: 10,
    isLive: true,
    liveStartedAt: "2026-04-04T12:00:00Z",
    author: { id: 5, fullName: "Creator Example", avatarUrl: "", subscriberCount: 12 },
    category: { label: "Music" },
    ...overrides,
  };
}

function renderRoom() {
  return render(
    <MemoryRouter initialEntries={["/live/10"]}>
      <Routes>
        <Route path="/live/:id" element={<LiveRoom />} />
        <Route path="/video/:id" element={<div>Recorded page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function emitRemoteParticipant(uid = "remote-1") {
  const remoteUser = { uid, videoTrack: createMockAgoraTrack("video"), audioTrack: createMockAgoraTrack("audio") };
  agoraMockState.lastClient.remoteUsers = [remoteUser];
  await agoraMockState.lastClient.__handlers["user-published"]?.(remoteUser, "video");
  await agoraMockState.lastClient.__handlers["user-published"]?.(remoteUser, "audio");
}

describe("LiveRoom", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = true;
    authState.user = { id: 99, fullName: "Viewer Example", avatarUrl: "" };
    globalThis.MediaStream = MockMediaStream;
    globalThis.MediaRecorder = MockMediaRecorder;
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.getLiveAgoraSession.mockResolvedValue({ data: { session: { appId: "test-agora", channelName: "live-video-10", token: "token", uid: "user-99", role: "audience" } } });
  });

  it("joins the room as a host for the creator", async () => {
    authState.user = { id: 5, fullName: "Creator Example", avatarUrl: "" };
    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });
    api.getLiveAgoraSession.mockResolvedValue({ data: { session: { appId: "test-agora", channelName: "live-video-10", token: "token", uid: "user-5", role: "host" } } });

    renderRoom();

    await screen.findByRole("heading", { name: "Alpha Live" });
    await screen.findByLabelText("Live camera preview");
    expect(api.getLiveAgoraSession).toHaveBeenCalledWith("10", { role: "host" });
  });

  it("plays remote stage media for viewers and lets them join the stage", async () => {
    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });

    renderRoom();

    await screen.findByRole("heading", { name: "Alpha Live" });
    await emitRemoteParticipant();
    await screen.findByLabelText("Live stream playback");

    await userEvent.click(screen.getByRole("button", { name: "Join stage" }));

    await waitFor(() => expect(api.getLiveAgoraSession).toHaveBeenLastCalledWith("10", { role: "host" }));
    await screen.findByRole("button", { name: "Leave stage" });
  });

  it("stops the live stream, uploads the recording, and redirects to the video page", async () => {
    authState.user = { id: 5, fullName: "Creator Example", avatarUrl: "" };
    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });
    api.getLiveAgoraSession.mockResolvedValue({ data: { session: { appId: "test-agora", channelName: "live-video-10", token: "token", uid: "user-5", role: "host" } } });
    api.stopVideoLive.mockResolvedValue({ data: { video: buildVideo({ isLive: false, liveStartedAt: null }) }, message: "Stopped" });
    api.presignUpload.mockResolvedValue({ data: { strategy: "client-direct-upload" } });
    api.uploadFileDirect.mockResolvedValue({ secure_url: "https://cdn.example.com/live.webm", bytes: 4 });
    api.uploadFile.mockResolvedValue({ data: { upload: { id: 88 } } });
    api.updateVideo.mockResolvedValue({ data: { video: buildVideo({ isLive: false, liveStartedAt: null, mediaUrl: "https://cdn.example.com/live.webm" }) } });

    renderRoom();

    await screen.findByLabelText("Live camera preview");
    await userEvent.click(screen.getByRole("button", { name: "Stop live" }));

    await waitFor(() => expect(api.stopVideoLive).toHaveBeenCalledWith(10));
    await waitFor(() => expect(api.updateVideo).toHaveBeenCalled());
    await screen.findByText("Recorded page");
  });
});