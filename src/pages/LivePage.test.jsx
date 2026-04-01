import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
      getLiveVideos: vi.fn(),
    },
  };
});

import { api } from '../services/api';
import LivePage from './LivePage';

function buildVideo(overrides = {}) {
  return {
    id: 10,
    title: 'Live Set',
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
    <MemoryRouter initialEntries={['/live']}>
      <Routes>
        <Route path="/live" element={<LivePage />} />
        <Route path="/live/:id" element={<div>Live room</div>} />
        <Route path="/home" element={<div>Home page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LivePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders active live streams from the API', async () => {
    const user = userEvent.setup();

    api.getLiveVideos.mockResolvedValue({
      data: {
        videos: [
          buildVideo({ id: 10, title: 'Live Set', isLive: 'true' }),
          buildVideo({ id: 11, title: 'Ended Set', isLive: 'false' }),
        ],
      },
    });

    renderPage();

    await waitFor(() => expect(api.getLiveVideos).toHaveBeenCalledTimes(1));

    expect(await screen.findByRole('heading', { name: 'Watch creators live' })).toBeInTheDocument();
    expect(screen.getByText('1 active streams')).toBeInTheDocument();
    expect(screen.getByText('Live Set')).toBeInTheDocument();
    expect(screen.queryByText('Ended Set')).not.toBeInTheDocument();
    expect(screen.getAllByText('Creator Uno')).toHaveLength(1);

    await user.click(screen.getByText('Live Set'));

    expect(await screen.findByText('Live room')).toBeInTheDocument();
  });

  it('offers a way back home when no live streams are active', async () => {
    const user = userEvent.setup();
    api.getLiveVideos.mockResolvedValue({ data: { videos: [] } });

    renderPage();

    expect(await screen.findByText('No one is live right now')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to home' }));

    expect(await screen.findByText('Home page')).toBeInTheDocument();
  });
});