import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { fullName: 'Test Creator' },
  }),
}));

vi.mock('../context/LanguageContext', async () => {
  const actual = await vi.importActual('../locales/translations');
  const t = actual.createTranslator('en');

  return {
    useLanguage: () => ({
      locale: 'en',
      setLocale: vi.fn(),
      t,
    }),
  };
});

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');

  return {
    ...actual,
    api: {
      getCategories: vi.fn(),
      uploadFile: vi.fn(),
      createVideo: vi.fn(),
      updateVideo: vi.fn(),
      publishVideo: vi.fn(),
      getVideo: vi.fn(),
    },
  };
});

import { api } from '../services/api';
import CreateUpload from './CreateUpload';

function buildMediaStream() {
  return {
    getTracks: () => [{ stop: vi.fn() }, { stop: vi.fn() }],
  };
}

function renderPage(initialEntry = '/create') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/create" element={<CreateUpload />} />
        <Route path="/video/:id" element={<div>Video page</div>} />
        <Route path="/live/:id" element={<div>Live page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CreateUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview');
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
  });

  it('disables category selection when categories are unavailable', async () => {
    api.getCategories.mockResolvedValue({ data: { categories: [] } });

    renderPage();

    await screen.findByText(/Signed in as Test Creator/i);

    await waitFor(() => expect(screen.getByRole('combobox')).toBeDisabled());

    expect(screen.getByText(/Categories are unavailable right now/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /No categories available/i })).toBeInTheDocument();
  });

  it('submits a numeric categoryId when saving a draft', async () => {
    const user = userEvent.setup();

    api.getCategories.mockResolvedValue({
      data: {
        categories: [{ id: 2, label: 'Music' }],
      },
    });
    api.uploadFile.mockResolvedValue({ data: { upload: { id: 99 } } });
    api.createVideo.mockResolvedValue({
      data: {
        video: { id: 42, isDraft: true, mediaUrl: 'https://cdn.example/upload.png' },
      },
    });

    const { container } = renderPage();

    const categorySelect = await screen.findByRole('combobox');

    await waitFor(() => expect(categorySelect).not.toBeDisabled());

    expect(screen.queryByRole('option', { name: 'Technology' })).not.toBeInTheDocument();

    await user.selectOptions(categorySelect, '2');

    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(['image'], 'cover.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await user.click(screen.getByRole('button', { name: /Save draft/i }));

    await waitFor(() => expect(api.createVideo).toHaveBeenCalledTimes(1));

    expect(api.uploadFile).toHaveBeenCalledTimes(1);
    expect(api.createVideo).toHaveBeenCalledWith(expect.objectContaining({
      type: 'image',
      categoryId: 2,
      uploadId: 99,
      isDraft: true,
      isLive: false,
    }));
  });

  it('prepares the live flow from the live intent route and submits a live payload', async () => {
    const user = userEvent.setup();

    api.getCategories.mockResolvedValue({
      data: {
        categories: [{ id: 2, label: 'Music' }],
      },
    });
    api.createVideo.mockResolvedValue({
      data: {
        video: { id: 88, isDraft: false, isLive: true, mediaUrl: null },
      },
    });

    const { container } = renderPage('/create?intent=live');

    await screen.findByText(/Signed in as Test Creator/i);
    expect(screen.getByRole('heading', { name: /Set up your live stream/i })).toBeInTheDocument();
    expect(screen.getByText(/Turn on your camera/i)).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeNull();
    await waitFor(() => expect(globalThis.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true, audio: true }));
    expect(await screen.findByLabelText(/Live camera preview/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Save draft/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Upload$/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Go live/i }));

    await waitFor(() => expect(api.createVideo).toHaveBeenCalledTimes(1));

    expect(api.uploadFile).not.toHaveBeenCalled();
    expect(api.createVideo).toHaveBeenCalledWith(expect.objectContaining({
      type: 'video',
      isDraft: false,
      isLive: true,
    }));
  });
});