import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import LiveChat from "./LiveChat";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock("../../services/api", () => ({
  api: {
    postComment: vi.fn(),
    subscribeToCreator: vi.fn(),
    unsubscribeFromCreator: vi.fn(),
    shareVideo: vi.fn(),
  },
}));

describe("LiveChat", () => {
  it("renders repeated audience likes as a single notification label", () => {
    render(
      <MemoryRouter>
        <LiveChat
          video={{
            author: {
              id: 1,
              username: "creator",
              fullName: "Creator",
              subscriberCount: 12,
            },
          }}
          engagements={[
            {
              id: "like-1",
              type: "like",
              createdAt: "2026-07-31T10:00:00Z",
              actor: { id: 7, username: "alice", fullName: "Alice" },
            },
            {
              id: "like-2",
              type: "like",
              createdAt: "2026-07-31T10:01:00Z",
              actor: { id: 7, username: "alice", fullName: "Alice" },
            },
          ]}
          videoId={42}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText(/tapped a heart ❤️/i)).toBeInTheDocument();
    expect(screen.queryByText(/×2/i)).not.toBeInTheDocument();
  });
});
