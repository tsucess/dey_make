import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: 1, fullName: 'Viewer Example' } }),
}));

vi.mock('../context/LanguageContext', async () => {
  const actual = await vi.importActual('../locales/translations');
  const t = actual.createTranslator('en');

  return {
    useLanguage: () => ({ locale: 'en', setLocale: vi.fn(), t }),
  };
});

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');

  return {
    ...actual,
    api: {
      ...actual.api,
      getHome: vi.fn(),
      getTrendingVideos: vi.fn(),
      getLiveVideos: vi.fn(),
      getVideos: vi.fn(),
    },
  };
});

import { api } from '../services/api';
import Homepage from './Homepage';

function buildVideo(overrides = {}) {
  return {
    id: 10,
    title: 'Live Go',
    thumbnailUrl: 'https://cdn.example.com/live.jpg',
    isLive: true,
    processingStatus: 'completed',
    author: { fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
    creator: { fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
    ...overrides,
  };
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/home']}>
      <Routes>
        <Route path="/home" element={<Homepage />} />
        <Route path="/live" element={<div>Live page</div>} />
        <Route path="/video/:id" element={<div>Video page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Homepage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters out ended live streams from the homepage live sections', async () => {
    api.getHome.mockResolvedValue({ data: { categories: [], trending: [], liveStreams: [] } });
    api.getTrendingVideos.mockResolvedValue({ data: { videos: [] } });
    api.getLiveVideos.mockResolvedValue({
      data: {
        videos: [
          buildVideo({ id: 1, title: 'Live Go', isLive: 'true' }),
          buildVideo({ id: 2, title: 'Ended Cut', isLive: 'false' }),
        ],
      },
    });
    api.getVideos.mockResolvedValue({ data: { videos: [] } });

    renderPage();

    await waitFor(() => expect(api.getLiveVideos).toHaveBeenCalledTimes(1));

    expect(await screen.findAllByText('Live Go')).not.toHaveLength(0);
    expect(screen.queryByText('Ended Cut')).not.toBeInTheDocument();
  });
});