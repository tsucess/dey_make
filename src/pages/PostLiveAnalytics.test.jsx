import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = { user: { id: 5, fullName: "Creator Example", avatarUrl: "" } };

vi.mock("../context/AuthContext", () => ({ useAuth: () => authState }));

vi.mock("../context/LanguageContext", async () => {
  const actual = await vi.importActual("../locales/translations");
  return { useLanguage: () => ({ locale: "en", setLocale: vi.fn(), t: actual.createTranslator("en") }) };
});

vi.mock("../services/api", () => ({
  firstError: (errors, fallback) => errors?.[0] || fallback || "Something went wrong.",
  api: {
    getVideo: vi.fn(),
    getLiveEngagements: vi.fn(),
  },
}));

import { api } from "../services/api";
import PostLiveAnalytics from "./PostLiveAnalytics";

function buildVideo(overrides = {}) {
  return {
    id: 10,
    type: "video",
    title: "Alpha Live",
    description: "Streaming now",
    thumbnailUrl: "https://cdn.example.com/thumb.jpg",
    createdAt: "2026-04-04T12:00:00Z",
    views: 120,
    likes: 24,
    liveLikes: 24,
    liveComments: 7,
    isLive: false,
    liveStartedAt: "2026-04-04T12:00:00Z",
    liveEndedAt: "2026-04-04T12:12:30Z",
    liveAnalytics: { currentViewers: 0, peakViewers: 47, liveLikes: 24, liveComments: 7 },
    author: { id: 5, fullName: "Creator Example", avatarUrl: "", subscriberCount: 12 },
    ...overrides,
  };
}

function renderPage(initialEntry = "/video/10/analytics") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/video/:id/analytics" element={<PostLiveAnalytics />} />
        <Route path="/analytics/live" element={<div>Live dashboard page</div>} />
        <Route path="/video/:id" element={<div>Recorded page</div>} />
        <Route path="/live/:id" element={<div>Live page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PostLiveAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { id: 5, fullName: "Creator Example", avatarUrl: "" };
    api.getVideo.mockResolvedValue({ data: { video: buildVideo() } });
    api.getLiveEngagements.mockResolvedValue({ data: { engagements: [{ id: "comment-1", type: "comment", body: "We loved this", createdAt: "2026-04-04T12:05:00Z", actor: { id: 8, fullName: "Fan One", avatarUrl: "", username: "fan.one" } }], summary: { totals: { likes: 5, comments: 3, engagements: 8, uniqueFans: 2 }, topFans: [{ actor: { id: 8, fullName: "Fan One", avatarUrl: "", username: "fan.one" }, likesCount: 4, commentsCount: 1, engagementCount: 5 }, { actor: { id: 12, fullName: "Fan Two", avatarUrl: "", username: "fan.two" }, likesCount: 2, commentsCount: 1, engagementCount: 3 }, { actor: { id: 13, fullName: "Fan Three", avatarUrl: "", username: "fan.three" }, likesCount: 1, commentsCount: 1, engagementCount: 2 }], topCommenters: [{ actor: { id: 9, fullName: "Comment Pro", avatarUrl: "", username: "comment.pro" }, commentsCount: 3, lastCommentedAt: "2026-04-04T12:08:00Z" }], topLikers: [{ actor: { id: 8, fullName: "Fan One", avatarUrl: "", username: "fan.one" }, likesCount: 4, lastLikedAt: "2026-04-04T12:06:00Z" }], timeline: [{ label: "0s", startedAt: "2026-04-04T12:00:00Z", endedAt: "2026-04-04T12:03:00Z", midpointAt: "2026-04-04T12:01:30Z", likesCount: 2, commentsCount: 1, engagementCount: 3, viewersCount: 12 }, { label: "3m", startedAt: "2026-04-04T12:03:00Z", endedAt: "2026-04-04T12:06:00Z", midpointAt: "2026-04-04T12:04:30Z", likesCount: 3, commentsCount: 2, engagementCount: 5, viewersCount: 18 }], viewerTrend: [{ label: "0s", timestamp: "2026-04-04T12:01:30Z", viewersCount: 12 }, { label: "3m", timestamp: "2026-04-04T12:04:30Z", viewersCount: 18 }], peakMoments: [{ label: "3m", startedAt: "2026-04-04T12:03:00Z", likesCount: 3, commentsCount: 2, engagementCount: 5, viewersCount: 18 }], retention: { startViewers: 12, endViewers: 18, averageViewers: 15, peakViewers: 18, retentionRate: 100 } } } });
  });

  it("shows creator-facing post-live analytics and recent engagement", async () => {
    renderPage();

    expect(await screen.findByRole("heading", { name: "Alpha Live" })).toBeInTheDocument();
    expect(screen.getByText("Post-live analytics")).toBeInTheDocument();
    expect(screen.getByText("47")).toBeInTheDocument();
    expect(screen.getByText("Top supporters")).toBeInTheDocument();
    expect(screen.getAllByText("Top fans").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Fan One").length).toBeGreaterThan(0);
    expect(screen.getByText("Comment Pro")).toBeInTheDocument();
    expect(screen.getByText("Top likers")).toBeInTheDocument();
    expect(screen.getByText("Peak moments")).toBeInTheDocument();
    expect(screen.getByText("Engagement timeline")).toBeInTheDocument();
    expect(screen.getByText("Audience retention")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Engagement timeline" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Viewer trend" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Live dashboard" })).toHaveAttribute("href", "/analytics/live");
    expect(screen.getAllByText("engagement actions").length).toBeGreaterThan(0);
    expect(screen.getByText("We loved this")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View recorded video" })).toHaveAttribute("href", "/video/10");
    expect(api.getLiveEngagements).toHaveBeenCalledWith("10", { limit: 24, includeSummary: true });
  });

  it("redirects non-creators back to the recorded video page", async () => {
    authState.user = { id: 99, fullName: "Other User", avatarUrl: "" };

    renderPage();

    expect(await screen.findByText("Recorded page")).toBeInTheDocument();
  });
});