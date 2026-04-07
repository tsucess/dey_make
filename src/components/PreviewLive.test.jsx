import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { fullName: 'Test Creator' } }),
}));

vi.mock('../context/LanguageContext', async () => {
  const actual = await vi.importActual('../locales/translations');
  return { useLanguage: () => ({ locale: 'en', setLocale: vi.fn(), t: actual.createTranslator('en') }) };
});

vi.mock('../live/liveSessionStore', () => ({
  setLiveCreationSession: vi.fn(),
}));

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');
  return { ...actual, api: { ...actual.api, createVideo: vi.fn() } };
});

vi.mock('../utils/thumbnail', () => ({
  captureThumbnailFromVideoElement: vi.fn(),
  uploadThumbnailFile: vi.fn(),
}));

import { setLiveCreationSession } from '../live/liveSessionStore';
import PreviewLive from './PreviewLive';
import { api } from '../services/api';
import { captureThumbnailFromVideoElement, uploadThumbnailFile } from '../utils/thumbnail';

function buildMediaStream() {
  return {
    getTracks: () => [{ stop: vi.fn() }, { stop: vi.fn() }],
  };
}

function renderPage(liveSetup) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/preview-live', state: { liveSetup } }]}>
      <Routes>
        <Route path="/preview-live" element={<PreviewLive />} />
        <Route path="/live/:id" element={<div>Live page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PreviewLive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:thumbnail');
    globalThis.URL.revokeObjectURL = vi.fn();
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue(buildMediaStream()),
      },
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'srcObject', {
      configurable: true,
      writable: true,
      value: null,
    });
    captureThumbnailFromVideoElement.mockResolvedValue(new File(['thumb'], 'auto-live.jpg', { type: 'image/jpeg' }));
    uploadThumbnailFile.mockResolvedValue({ url: 'https://cdn.example.com/live-thumb.jpg' });
    api.createVideo.mockResolvedValue({ data: { video: { id: 44 } } });
  });

  it('auto-captures and uploads a thumbnail when none was manually selected', async () => {
    const user = userEvent.setup();
    renderPage({ title: 'Night Session', description: 'Warm up the room', categoryId: 3 });

    expect(await screen.findByRole('heading', { name: 'Preview your live stream' })).toBeInTheDocument();
    expect(await screen.findByLabelText('Live camera preview')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Go live' })).toBeEnabled());

    await user.click(screen.getByRole('button', { name: 'Go live' }));

    await waitFor(() => expect(api.createVideo).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Night Session',
      isLive: true,
      thumbnailUrl: 'https://cdn.example.com/live-thumb.jpg',
    })));
    expect(captureThumbnailFromVideoElement).toHaveBeenCalledTimes(1);
    expect(setLiveCreationSession).toHaveBeenCalledWith(expect.objectContaining({ videoId: 44 }));
  });

  it('uses the manually selected thumbnail when returning from create-live', async () => {
    const user = userEvent.setup();
    const thumbnailFile = new File(['thumb'], 'manual-live.jpg', { type: 'image/jpeg' });

    renderPage({ title: 'Morning Session', description: '', categoryId: 5, thumbnailFile });

    expect(await screen.findByAltText('Thumbnail preview')).toBeInTheDocument();
    expect(await screen.findByLabelText('Live camera preview')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Go live' }));

    await waitFor(() => expect(uploadThumbnailFile).toHaveBeenCalledWith(thumbnailFile));
    expect(captureThumbnailFromVideoElement).not.toHaveBeenCalled();
    expect(api.createVideo).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Morning Session',
      thumbnailUrl: 'https://cdn.example.com/live-thumb.jpg',
    }));
  });
});