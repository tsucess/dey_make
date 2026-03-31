import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authState = {
  isAuthenticated: true,
  user: { id: 99, fullName: 'Viewer Example', avatarUrl: '' },
};

vi.mock('../context/LanguageContext', async () => {
  const actual = await vi.importActual('../locales/translations');
  const t = actual.createTranslator('es');

  return {
    useLanguage: () => ({ locale: 'es', setLocale: vi.fn(), t }),
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');

  return {
    ...actual,
    api: {
      ...actual.api,
      getVideo: vi.fn(),
      getRelatedVideos: vi.fn(),
      getVideoComments: vi.fn(),
      recordView: vi.fn(),
      subscribeToCreator: vi.fn(),
      unsubscribeFromCreator: vi.fn(),
      startVideoLive: vi.fn(),
      stopVideoLive: vi.fn(),
    },
  };
});

import { api } from '../services/api';
import VideoDetails from './VideoDetails';

function buildVideo(overrides = {}) {
  return {
    id: 10,
    type: 'video',
    title: 'Alpha Session',
    mediaUrl: 'https://cdn.example.com/alpha.mp4',
    views: 12,
    author: { id: 5, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
    creator: { id: 5, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
    currentUserState: { liked: false, disliked: false, saved: false, subscribed: false },
    commentsCount: 0,
    processingStatus: 'completed',
    isLive: false,
    ...overrides,
  };
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/video/10']}>
      <Routes>
        <Route path="/video/:id" element={<VideoDetails />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('VideoDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = true;
    authState.user = { id: 99, fullName: 'Viewer Example', avatarUrl: '' };
  });

  it('renders translated video actions and empty states', async () => {
    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo(),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});

    renderPage();

    await waitFor(() => expect(api.getVideo).toHaveBeenCalledWith('10'));

    expect(await screen.findByRole('button', { name: /Volver/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suscribirse' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compartir/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reportar/i })).toBeInTheDocument();
    expect(screen.getByText('Más videos')).toBeInTheDocument();
    expect(screen.getByText('12 vistas')).toBeInTheDocument();
    expect(screen.getByText('Aún no hay videos relacionados.')).toBeInTheDocument();
    expect(screen.getByText('Comentarios')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('¡Dile al creador lo que piensas!')).toBeInTheDocument();
    expect(screen.getByText('Aún no hay comentarios. Empieza la conversación.')).toBeInTheDocument();
  });

  it('links to the creator profile and lets viewers subscribe', async () => {
    const user = userEvent.setup();

    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo(),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});
    api.subscribeToCreator.mockResolvedValue({
      data: {
        creator: {
          id: 5,
          subscriberCount: 34,
          subscribed: true,
        },
      },
    });

    renderPage();

    const creatorLink = await screen.findByRole('link', { name: /Creator Uno/i });
    expect(creatorLink).toHaveAttribute('href', '/users/5');

    await user.click(screen.getByRole('button', { name: 'Suscribirse' }));

    await waitFor(() => expect(api.subscribeToCreator).toHaveBeenCalledWith(5));
    expect(screen.getByText('34 suscriptores')).toBeInTheDocument();
  });

  it('shows a processing badge when the video is still being compressed', async () => {
    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({ processingStatus: 'processing' }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});

    renderPage();

    expect(await screen.findByText('PROCESANDO')).toBeInTheDocument();
  });

  it('lets the creator start and stop a live session', async () => {
    const user = userEvent.setup();
    authState.user = { id: 99, fullName: 'Creator Uno', avatarUrl: '' };

    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({
          author: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
          creator: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
        }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});
    api.startVideoLive.mockResolvedValue({
      data: {
        video: buildVideo({
          isLive: true,
          author: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
          creator: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
        }),
      },
    });
    api.stopVideoLive.mockResolvedValue({
      data: {
        video: buildVideo({
          isLive: false,
          author: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
          creator: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
        }),
      },
    });

    renderPage();

    const startButton = await screen.findByRole('button', { name: 'Iniciar transmisión' });
    await user.click(startButton);

    await waitFor(() => expect(api.startVideoLive).toHaveBeenCalledWith(10));
    expect(await screen.findByText('Tu transmisión en vivo ha comenzado.')).toBeInTheDocument();
    expect(screen.getByText('EN VIVO AHORA')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Detener transmisión' }));

    await waitFor(() => expect(api.stopVideoLive).toHaveBeenCalledWith(10));
    expect(await screen.findByText('Tu transmisión en vivo ha terminado.')).toBeInTheDocument();
  });
});