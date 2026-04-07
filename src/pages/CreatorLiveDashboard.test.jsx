import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = { isAuthenticated: true, user: { id: 1, fullName: "Ada Lovelace", avatarUrl: "" } };

vi.mock("../context/AuthContext", () => ({ useAuth: () => authState }));

vi.mock("../context/LanguageContext", async () => {
  const actual = await vi.importActual("../locales/translations");
  return { useLanguage: () => ({ locale: "en", setLocale: vi.fn(), t: actual.createTranslator("en") }) };
});

vi.mock("../services/api", () => ({
  firstError: (errors, fallback) => errors?.[0] || fallback || "Something went wrong.",
  api: {
    getProfile: vi.fn(),
    getProfileFeed: vi.fn(),
  },
}));

import { api } from "../services/api";
import CreatorLiveDashboard from "./CreatorLiveDashboard";

function renderPage(initialEntry = "/analytics/live") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/analytics/live" element={<CreatorLiveDashboard />} />
        <Route path="/profile" element={<div>Profile page</div>} />
        <Route path="/video/:id/analytics" element={<div>Session analytics</div>} />
        <Route path="/video/:id" element={<div>Recorded video</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CreatorLiveDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getProfile.mockResolvedValue({ data: { profile: { id: 1, fullName: "Ada Lovelace", avatarUrl: "", subscriberCount: 2500 } } });
    api.getProfileFeed.mockResolvedValue({
      data: {
        videos: [
          { id: 8, title: "Analytical Engine Live", thumbnailUrl: "https://cdn.example.com/live-1.jpg", views: 220, liveLikes: 14, liveComments: 6, liveStartedAt: "2026-04-04T12:00:00Z", liveEndedAt: "2026-04-04T12:22:00Z", liveAnalytics: { peakViewers: 47, liveLikes: 14, liveComments: 6 } },
          { id: 9, title: "Math Notes Live", thumbnailUrl: "https://cdn.example.com/live-2.jpg", views: 180, liveLikes: 9, liveComments: 4, liveStartedAt: "2026-04-06T10:00:00Z", liveEndedAt: "2026-04-06T10:15:00Z", liveAnalytics: { peakViewers: 32, liveLikes: 9, liveComments: 4 } },
          { id: 12, title: "Recorded tutorial", thumbnailUrl: "https://cdn.example.com/video.jpg", views: 88, liveAnalytics: { peakViewers: 0 } },
        ],
      },
    });
  });

  it("shows aggregate creator live metrics and opens a session analytics page", async () => {
    const user = userEvent.setup();

    renderPage();

    expect(await screen.findByRole("heading", { name: "Live dashboard" })).toBeInTheDocument();
    expect(screen.getByText("ended live sessions")).toBeInTheDocument();
    expect(screen.getByText("live views")).toBeInTheDocument();
    expect(screen.getByText("Recent live sessions")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Live dashboard" })).toBeInTheDocument();

    await user.click(screen.getAllByRole("link", { name: "Open analytics" })[0]);

    expect(await screen.findByText("Session analytics")).toBeInTheDocument();
  });
});