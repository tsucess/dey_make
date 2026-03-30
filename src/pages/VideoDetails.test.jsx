import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../context/LanguageContext', async () => {
  const actual = await vi.importActual('../locales/translations');
  const t = actual.createTranslator('es');

  return {
    useLanguage: () => ({ locale: 'es', setLocale: vi.fn(), t }),
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 99, fullName: 'Viewer Example', avatarUrl: '' },
  }),
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
    },
  };
});

import { api } from '../services/api';
import VideoDetails from './VideoDetails';

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
  });

  it('renders translated video actions and empty states', async () => {
    api.getVideo.mockResolvedValue({
      data: {
        video: {
          id: 10,
          type: 'video',
          title: 'Alpha Session',
          mediaUrl: 'https://cdn.example.com/alpha.mp4',
          views: 12,
          author: { id: 5, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
          creator: { id: 5, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
          currentUserState: { liked: false, disliked: false, saved: false, subscribed: false },
          commentsCount: 0,
        },
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
});