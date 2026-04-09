import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = { isAuthenticated: true, user: { id: 99, fullName: "Viewer Example", avatarUrl: "" } };
const agoraMockState = vi.hoisted(() => ({ lastClient: null, lastLocalTracks: [] }));
const subscribeToPrivateChannelMock = vi.fn();

function createMockAgoraTrack(kind) {
  const mediaStreamTrack = { kind, stop: vi.fn() };
  return {
    stop: vi.fn(),
    close: vi.fn(),
    getMediaStreamTrack: vi.fn(() => mediaStreamTrack),
  };
}

vi.mock("../utils/loadAgoraRtc", () => ({
  loadAgoraRtc: vi.fn(async () => ({
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
  })),
}));

vi.mock("../context/LanguageContext", async () => {
  const actual = await vi.importActual("../locales/translations");
  const t = actual.createTranslator("en");
  return { useLanguage: () => ({ locale: "en", setLocale: vi.fn(), t }) };
});

vi.mock("../context/AuthContext", () => ({ useAuth: () => authState }));
vi.mock("../live/liveSessionStore", () => ({ clearLiveCreationSession: vi.fn() }));
vi.mock("../services/realtime", () => ({
  subscribeToPrivateChannel: (...args) => subscribeToPrivateChannelMock(...args),
}));

vi.mock("../services/api", () => ({
  DIRECT_UPLOAD_LARGE_FILE_THRESHOLD: 5 * 1024 * 1024,
  firstError: (errors, fallback) => errors?.[0] || fallback || "Something went wrong.",
  api: {
    getVideo: vi.fn(),
    getVideoComments: vi.fn(),
    getLiveAgoraSession: vi.fn(),
    getLiveEngagements: vi.fn(),
    getLiveSignals: vi.fn(),
    getLiveAudience: vi.fn(),
    recordLivePresence: vi.fn(),
    leaveLivePresence: vi.fn(),
    likeLiveVideo: vi.fn(),
    sendLiveSignal: vi.fn(),
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
    likes: 0,
    liveLikes: 0,
    commentsCount: 0,
    liveComments: 0,
    currentViewers: 0,
    liveAnalytics: { currentViewers: 0, peakViewers: 0, liveLikes: 0, liveComments: 0 },
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
        <Route path="/video/:id/analytics" element={<div>Analytics page</div>} />
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
    subscribeToPrivateChannelMock.mockImplementation(() => vi.fn());
    authState.isAuthenticated = true;
    authState.user = { id: 99, fullName: "Viewer Example", avatarUrl: "" };
    globalThis.MediaStream = MockMediaStream;
    globalThis.MediaRecorder = MockMediaRecorder;
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.getLiveAgoraSession.mockResolvedValue({ data: { session: { appId: "test-agora", channelName: "live-video-10", token: "token", uid: "user-99", role: "audience" } } });
    api.getLiveEngagements.mockResolvedValue({ data: { engagements: [] } });
    api.getLiveSignals.mockResolvedValue({ data: { signals: [], latestSignalId: 0 } });
    api.getLiveAudience.mockResolvedValue({ data: { audience: [] } });
    api.recordLivePresence.mockResolvedValue({ data: { analytics: { currentViewers: 3, peakViewers: 7 } } });
    api.leaveLivePresence.mockResolvedValue({ data: { analytics: { currentViewers: 2, peakViewers: 7 } } });
    api.sendLiveSignal.mockResolvedValue({ data: { signal: { id: 1 } } });
    api.likeLiveVideo.mockImplementation(async () => ({ data: { video: buildVideo({ likes: 1, liveLikes: 1, liveAnalytics: { currentViewers: 3, peakViewers: 7, liveLikes: 1, liveComments: 0 } }), engagement: { id: "like-1", type: "like", createdAt: "2026-04-04T12:01:00Z", actor: { id: 99, fullName: "Viewer Example", avatarUrl: "", username: null } } } }));
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

  it("plays remote stage media for viewers and lets them request to join instead of joining directly", async () => {
    const user = userEvent.setup();
    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });

    renderRoom();

    await screen.findByRole("heading", { name: "Alpha Live" });
    await emitRemoteParticipant();
    await screen.findByLabelText("Live stream playback");

    await user.click(screen.getByRole("button", { name: "Request to join" }));

    await waitFor(() => expect(api.sendLiveSignal).toHaveBeenCalledWith(10, { type: "join_request" }));
    expect(api.getLiveAgoraSession).not.toHaveBeenCalledWith("10", { role: "host" });
    await screen.findByRole("button", { name: "Request sent" });
  });

  it("shows the creator a modal notification to accept or reject audience requests", async () => {
    const user = userEvent.setup();
    authState.user = { id: 5, fullName: "Creator Example", avatarUrl: "" };
    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });
    api.getLiveAgoraSession.mockResolvedValue({ data: { session: { appId: "test-agora", channelName: "live-video-10", token: "token", uid: "user-5", role: "host" } } });
    api.getLiveSignals.mockResolvedValue({
      data: {
        latestSignalId: 10,
        signals: [{ id: 10, type: "join_request", senderId: 99, recipientId: 5, sender: { id: 99, fullName: "Viewer Example", avatarUrl: "" }, recipient: { id: 5, fullName: "Creator Example", avatarUrl: "" } }],
      },
    });

    renderRoom();

    expect(await screen.findByRole("dialog", { name: "Join request" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Accept request" }));

    await waitFor(() => expect(api.sendLiveSignal).toHaveBeenCalledWith(10, { recipientId: 99, type: "join_request_accepted" }));
  });

  it("lets invited audience accept the invite from a modal notification and join as co-host", async () => {
    const user = userEvent.setup();
    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });
    api.getLiveSignals.mockResolvedValue({
      data: {
        latestSignalId: 22,
        signals: [{ id: 22, type: "join_invite", senderId: 5, recipientId: 99, sender: { id: 5, fullName: "Creator Example", avatarUrl: "" }, recipient: { id: 99, fullName: "Viewer Example", avatarUrl: "" } }],
      },
    });
    api.getLiveAgoraSession
      .mockResolvedValueOnce({ data: { session: { appId: "test-agora", channelName: "live-video-10", token: "token", uid: "user-99", role: "audience" } } })
      .mockResolvedValueOnce({ data: { session: { appId: "test-agora", channelName: "live-video-10", token: "token-host", uid: "user-99", role: "host" } } });

    renderRoom();

    expect(await screen.findByRole("dialog", { name: "Live invitation" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Accept invite" }));

    await waitFor(() => expect(api.sendLiveSignal).toHaveBeenCalledWith(10, { type: "join_invite_accepted" }));
    await waitFor(() => expect(api.getLiveAgoraSession).toHaveBeenLastCalledWith("10", { role: "host" }));
    await screen.findByRole("button", { name: "Leave live" });
  });

  it("shows live invitations immediately from realtime signal events", async () => {
    let realtimeListeners;

    subscribeToPrivateChannelMock.mockImplementation((channelName, listeners) => {
      if (channelName === "live.videos.10.users.99") {
        realtimeListeners = listeners;
      }

      return vi.fn();
    });

    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });
    api.getLiveSignals.mockResolvedValue({ data: { signals: [], latestSignalId: 0 } });

    renderRoom();

    await screen.findByRole("heading", { name: "Alpha Live" });
    await waitFor(() => expect(subscribeToPrivateChannelMock).toHaveBeenCalledWith(
      "live.videos.10.users.99",
      expect.objectContaining({ ".live.signal.created": expect.any(Function) }),
    ));

    realtimeListeners[".live.signal.created"]({
      videoId: 10,
      signal: {
        id: 44,
        type: "join_invite",
        senderId: 5,
        recipientId: 99,
        sender: { id: 5, fullName: "Creator Example", avatarUrl: "" },
        recipient: { id: 99, fullName: "Viewer Example", avatarUrl: "" },
      },
    });

    expect(await screen.findByRole("dialog", { name: "Live invitation" })).toBeInTheDocument();
    expect(api.getLiveSignals).toHaveBeenCalledTimes(1);
  });

  it("shows live engagement updates immediately from realtime room events", async () => {
    const channelListeners = {};

    subscribeToPrivateChannelMock.mockImplementation((channelName, listeners) => {
      channelListeners[channelName] = listeners;
      return vi.fn();
    });

    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });
    api.getLiveEngagements.mockResolvedValue({ data: { engagements: [] } });

    renderRoom();

    await screen.findByRole("heading", { name: "Alpha Live" });
    await waitFor(() => expect(channelListeners["live.videos.10"]?.[".live.engagement.created"]).toEqual(expect.any(Function)));

    channelListeners["live.videos.10"][".live.engagement.created"]({
      videoId: 10,
      engagement: {
        id: "comment-44",
        type: "comment",
        body: "Realtime comment",
        createdAt: "2026-04-04T12:05:00Z",
        actor: { id: 12, fullName: "Fan One", avatarUrl: "", username: "fan.one" },
      },
      comment: {
        id: 44,
        body: "Realtime comment",
        text: "Realtime comment",
        createdAt: "2026-04-04T12:05:00Z",
        user: { id: 12, fullName: "Fan One", avatarUrl: "", username: "fan.one" },
      },
      analytics: { liveLikes: 0, liveComments: 1 },
    });

    await waitFor(() => expect(screen.getAllByText("Realtime comment")).toHaveLength(2));
    expect(screen.getAllByText("Fan One")).toHaveLength(2);
  });

  it("lets the host invite audience members from live engagement cards", async () => {
    const user = userEvent.setup();
    authState.user = { id: 5, fullName: "Creator Example", avatarUrl: "" };
    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });
    api.getLiveAgoraSession.mockResolvedValue({ data: { session: { appId: "test-agora", channelName: "live-video-10", token: "token", uid: "user-5", role: "host" } } });
    api.getLiveEngagements.mockResolvedValue({ data: { engagements: [{ id: "comment-9", type: "comment", body: "Bring me up", createdAt: "2026-04-04T12:02:00Z", actor: { id: 12, fullName: "Fan One", avatarUrl: "", username: "fan.one" } }] } });

    renderRoom();

    await screen.findByRole("heading", { name: "Alpha Live" });
    await user.click(await screen.findByRole("button", { name: "Invite to join" }));

    await waitFor(() => expect(api.sendLiveSignal).toHaveBeenCalledWith(10, { recipientId: 12, type: "join_invite" }));
  });

  it("shows a current co-hosts panel and lets the creator remove a co-host from it", async () => {
    const user = userEvent.setup();
    authState.user = { id: 5, fullName: "Creator Example", avatarUrl: "" };
    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });
    api.getLiveAgoraSession.mockResolvedValue({ data: { session: { appId: "test-agora", channelName: "live-video-10", token: "token", uid: "user-5", role: "host" } } });
    api.getLiveSignals.mockResolvedValue({
      data: {
        latestSignalId: 31,
        signals: [{ id: 31, type: "join_request_accepted", senderId: 5, recipientId: 12, sender: { id: 5, fullName: "Creator Example", avatarUrl: "" }, recipient: { id: 12, fullName: "Fan One", avatarUrl: "", username: "fan.one" } }],
      },
    });

    renderRoom();

    await screen.findByRole("heading", { name: "Alpha Live" });
    expect(await screen.findByText("Current co-hosts")).toBeInTheDocument();
    expect(screen.getByText("Manage guests who are already live with you right now.")).toBeInTheDocument();
    await waitFor(() => expect(api.getLiveSignals).toHaveBeenCalledWith(10, { after: 0 }));
    expect(await screen.findByText("Fan One")).toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "Remove co-host" }));

    await waitFor(() => expect(api.sendLiveSignal).toHaveBeenCalledWith(10, { recipientId: 12, type: "cohost_left" }));
  });

  it("shows the creator an active audience panel and invites viewers from it", async () => {
    const user = userEvent.setup();
    authState.user = { id: 5, fullName: "Creator Example", avatarUrl: "" };
    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });
    api.getLiveAgoraSession.mockResolvedValue({ data: { session: { appId: "test-agora", channelName: "live-video-10", token: "token", uid: "user-5", role: "host" } } });
    api.getLiveAudience.mockResolvedValue({
      data: {
        audience: [{ sessionId: 91, role: "audience", joinedAt: "2026-04-04T12:00:00Z", lastSeenAt: "2026-04-04T12:02:00Z", actor: { id: 12, fullName: "Fan One", avatarUrl: "", username: "fan.one" } }],
      },
    });

    renderRoom();

    expect(await screen.findByText("Active audience")).toBeInTheDocument();
    expect(screen.getByText("Invite viewers who are currently watching to join you live.")).toBeInTheDocument();
    expect(await screen.findByText("Fan One")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Invite to join" }));

    await waitFor(() => expect(api.sendLiveSignal).toHaveBeenCalledWith(10, { recipientId: 12, type: "join_invite" }));
  });

  it("updates creator audience and viewer metrics from realtime presence events", async () => {
    const channelListeners = {};

    subscribeToPrivateChannelMock.mockImplementation((channelName, listeners) => {
      channelListeners[channelName] = listeners;
      return vi.fn();
    });

    authState.user = { id: 5, fullName: "Creator Example", avatarUrl: "" };
    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });
    api.getLiveAgoraSession.mockResolvedValue({ data: { session: { appId: "test-agora", channelName: "live-video-10", token: "token", uid: "user-5", role: "host" } } });
    api.getLiveAudience.mockResolvedValue({ data: { audience: [] } });

    renderRoom();

    await screen.findByText("Active audience");
    await waitFor(() => expect(channelListeners["live.videos.10"]?.[".live.presence.updated"]).toEqual(expect.any(Function)));
    await waitFor(() => expect(channelListeners["live.videos.10.creator"]?.[".live.audience.updated"]).toEqual(expect.any(Function)));

    channelListeners["live.videos.10"][".live.presence.updated"]({
      videoId: 10,
      analytics: { currentViewers: 9, peakViewers: 12 },
    });

    channelListeners["live.videos.10.creator"][".live.audience.updated"]({
      videoId: 10,
      audience: [{ sessionId: 91, role: "audience", joinedAt: "2026-04-04T12:00:00Z", lastSeenAt: "2026-04-04T12:02:00Z", actor: { id: 12, fullName: "Fan One", avatarUrl: "", username: "fan.one" } }],
    });

    expect(await screen.findByText("Fan One")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("refreshes creator insight panels immediately after realtime live events", async () => {
    const channelListeners = {};

    subscribeToPrivateChannelMock.mockImplementation((channelName, listeners) => {
      channelListeners[channelName] = listeners;
      return vi.fn();
    });

    authState.user = { id: 5, fullName: "Creator Example", avatarUrl: "" };
    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });
    api.getLiveAgoraSession.mockResolvedValue({ data: { session: { appId: "test-agora", channelName: "live-video-10", token: "token", uid: "user-5", role: "host" } } });
    api.getLiveAudience.mockResolvedValue({ data: { audience: [] } });
    api.getLiveEngagements
      .mockResolvedValueOnce({ data: { engagements: [], summary: { totals: { likes: 0, comments: 0, engagements: 0, uniqueFans: 0 }, topFans: [], timeline: [], peakMoments: [], retention: { averageViewers: 0, retentionRate: 0, peakViewers: 0 } } } })
      .mockResolvedValueOnce({ data: { engagements: [], summary: { totals: { likes: 4, comments: 2, engagements: 6, uniqueFans: 1 }, topFans: [{ actor: { id: 12, fullName: "Fan One", avatarUrl: "", username: "fan.one" }, likesCount: 4, commentsCount: 2, engagementCount: 6 }], timeline: [{ label: "0s", midpointAt: "2026-04-04T12:01:00Z", engagementCount: 6, viewersCount: 9 }], peakMoments: [{ label: "0s", startedAt: "2026-04-04T12:00:00Z", likesCount: 4, commentsCount: 2, engagementCount: 6 }], retention: { averageViewers: 9, retentionRate: 100, peakViewers: 9 } } } });

    renderRoom();

    await screen.findByText("Top supporters");
    await waitFor(() => expect(channelListeners["live.videos.10"]?.[".live.engagement.created"]).toEqual(expect.any(Function)));

    channelListeners["live.videos.10"][".live.engagement.created"]({
      videoId: 10,
      engagement: {
        id: "comment-44",
        type: "comment",
        body: "Realtime comment",
        createdAt: "2026-04-04T12:05:00Z",
        actor: { id: 12, fullName: "Fan One", avatarUrl: "", username: "fan.one" },
      },
      analytics: { liveLikes: 4, liveComments: 2 },
    });

    await waitFor(() => expect(api.getLiveEngagements).toHaveBeenCalledTimes(2));
    expect((await screen.findAllByText("Fan One")).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("img", { name: "Engagement timeline" })).toBeInTheDocument();
    expect(screen.getByText("Peak moments")).toBeInTheDocument();
  });

  it("lets viewers send repeated live likes", async () => {
    const user = userEvent.setup();

    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });
    api.likeLiveVideo
      .mockResolvedValueOnce({ data: { video: buildVideo({ likes: 1, liveLikes: 1, liveAnalytics: { currentViewers: 3, peakViewers: 7, liveLikes: 1, liveComments: 0 } }), engagement: { id: "like-1", type: "like", createdAt: "2026-04-04T12:01:00Z", actor: { id: 99, fullName: "Viewer Example", avatarUrl: "", username: null } } } })
      .mockResolvedValueOnce({ data: { video: buildVideo({ likes: 2, liveLikes: 2, liveAnalytics: { currentViewers: 3, peakViewers: 7, liveLikes: 2, liveComments: 0 } }), engagement: { id: "like-2", type: "like", createdAt: "2026-04-04T12:01:02Z", actor: { id: 99, fullName: "Viewer Example", avatarUrl: "", username: null } } } });

    renderRoom();

    await screen.findByRole("heading", { name: "Alpha Live" });

    await user.click(screen.getByRole("button", { name: "Like 0" }));
    await user.click(screen.getByRole("button", { name: "Like 1" }));

    await waitFor(() => expect(api.likeLiveVideo).toHaveBeenCalledTimes(2));
    await screen.findByRole("button", { name: "Like 2" });
    expect(screen.getAllByTestId("floating-heart").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Viewer Example").length).toBeGreaterThan(0);
    expect(screen.getAllByText("sent hearts").length).toBeGreaterThan(0);
  });

  it("shows live engagement activity and analytics from backend polling", async () => {
    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });
    api.getLiveEngagements.mockResolvedValue({ data: { engagements: [{ id: "comment-9", type: "comment", body: "This is fire", createdAt: "2026-04-04T12:02:00Z", actor: { id: 12, fullName: "Fan One", avatarUrl: "", username: "fan.one" } }] } });

    renderRoom();

    await screen.findByRole("heading", { name: "Alpha Live" });
    expect(await screen.findByText("Live analytics")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(await screen.findByText("Fan One")).toBeInTheDocument();
    expect(screen.getByText("This is fire")).toBeInTheDocument();
  });

  it("shows creator-only live momentum alerts when audience spikes", async () => {
    authState.user = { id: 5, fullName: "Creator Example", avatarUrl: "" };
    api.getVideo.mockResolvedValue({ data: { video: buildVideo({ currentViewers: 2, liveAnalytics: { currentViewers: 2, peakViewers: 4, liveLikes: 0, liveComments: 0 } }) } });
    api.getLiveAgoraSession.mockResolvedValue({ data: { session: { appId: "test-agora", channelName: "live-video-10", token: "token", uid: "user-5", role: "host" } } });
    api.getLiveEngagements.mockResolvedValue({ data: { engagements: [], summary: { totals: { likes: 1, comments: 1, engagements: 2 }, retention: { peakViewers: 4 } } } });
    api.recordLivePresence.mockResolvedValue({ data: { analytics: { currentViewers: 9, peakViewers: 12 } } });

    renderRoom();

    expect(await screen.findByText("New viewer peak")).toBeInTheDocument();
    expect(screen.getByText("Audience surge")).toBeInTheDocument();
    expect(screen.getByText("+7 viewers joined this pulse.")).toBeInTheDocument();
  });

  it("stops the live stream, uploads the recording, and redirects to the analytics page", async () => {
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
    await screen.findByText("Analytics page");
  });
});