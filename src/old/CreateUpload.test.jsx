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
      searchCreators: vi.fn(),
      presignUpload: vi.fn(),
      uploadFileDirect: vi.fn(),
      uploadFile: vi.fn(),
      createVideo: vi.fn(),
      updateVideo: vi.fn(),
      publishVideo: vi.fn(),
      getVideo: vi.fn(),
    },
  };
});

vi.mock('../utils/thumbnail', () => ({
  captureThumbnailFromVideoElement: vi.fn(),
  captureThumbnailFromVideoFile: vi.fn(),
  uploadThumbnailFile: vi.fn(),
}));

import { api, DIRECT_UPLOAD_LARGE_FILE_THRESHOLD } from '../services/api';
import { captureThumbnailFromVideoElement, captureThumbnailFromVideoFile, uploadThumbnailFile } from '../utils/thumbnail';
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
    captureThumbnailFromVideoElement.mockResolvedValue(new File(['thumb'], 'live-thumb.jpg', { type: 'image/jpeg' }));
    captureThumbnailFromVideoFile.mockResolvedValue(new File(['thumb'], 'video-thumb.jpg', { type: 'image/jpeg' }));
    uploadThumbnailFile.mockResolvedValue({ url: 'https://cdn.example.com/thumb.jpg' });
  });

  it('disables category selection when categories are unavailable', async () => {
    api.getCategories.mockResolvedValue({ data: { categories: [] } });

    renderPage();

    await screen.findByText(/Signed in as Test Creator/i);
    expect(screen.getByRole('button', { name: /Upload thumbnail/i })).toBeInTheDocument();
    expect(screen.getAllByText(/@username or #username/i)).toHaveLength(1);
    expect(screen.queryByPlaceholderText(/Tag people/i)).not.toBeInTheDocument();

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
    api.presignUpload.mockResolvedValue({
      data: {
        strategy: 'client-direct-upload',
        method: 'POST',
        endpoint: 'https://api.cloudinary.com/v1_1/demo/image/upload',
        fields: { signature: 'signed' },
      },
    });
    api.uploadFileDirect.mockResolvedValue({
      secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/deymake/uploads/images/user-1/cover.png',
      bytes: 5,
      width: 100,
      height: 100,
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

    const payload = api.createVideo.mock.calls[0][0];

    expect(api.presignUpload).toHaveBeenCalledWith({
      type: 'image',
      originalName: 'cover.png',
    });
    expect(api.uploadFileDirect).toHaveBeenCalledTimes(1);
    expect(api.uploadFile).toHaveBeenCalledTimes(1);
    expect(payload).toEqual(expect.objectContaining({
      type: 'image',
      categoryId: 2,
      uploadId: 99,
      isDraft: true,
      isLive: false,
    }));
    expect(payload).not.toHaveProperty('taggedUsers');
  });

  it('shows upload progress and video processing status during direct upload', async () => {
    const user = userEvent.setup();

    let resolveDirectUpload;
    let resolveFinalizeUpload;

    api.getCategories.mockResolvedValue({
      data: {
        categories: [{ id: 2, label: 'Music' }],
      },
    });
    api.presignUpload.mockResolvedValue({
      data: {
        strategy: 'client-direct-upload',
        method: 'POST',
        endpoint: 'https://api.cloudinary.com/v1_1/demo/video/upload',
        fields: { signature: 'signed' },
      },
    });
    api.uploadFileDirect.mockImplementation((_file, _uploadConfig, options) => new Promise((resolve) => {
      options?.onProgress?.({ loaded: 50, total: 100, percent: 50 });
      resolveDirectUpload = () => resolve({
        secure_url: 'https://res.cloudinary.com/demo/video/upload/v1/deymake/uploads/videos/user-1/clip.mp4',
        bytes: 100,
        duration: 15,
      });
    }));
    api.uploadFile.mockImplementation(() => new Promise((resolve) => {
      resolveFinalizeUpload = () => resolve({ data: { upload: { id: 109 } } });
    }));
    api.createVideo.mockResolvedValue({
      data: {
        video: { id: 55, isDraft: false, mediaUrl: 'https://cdn.example/video.mp4' },
      },
    });

    const { container } = renderPage();

    const fileInput = await waitFor(() => container.querySelector('input[type="file"]'));
    const videoButton = screen.getByRole('button', { name: /Videos\s*MP4,\s*MOV,\s*AVI/i });
    await user.click(videoButton);
    fireEvent.change(fileInput, { target: { files: [new File(['video'], 'clip.mp4', { type: 'video/mp4' })] } });

    await user.click(screen.getByRole('button', { name: /^Upload$/i }));

    expect(await screen.findByText(/Uploading file/i)).toBeInTheDocument();
    expect(screen.getByText(/File: clip.mp4/i)).toBeInTheDocument();
    expect(screen.getByText(/50% uploaded/i)).toBeInTheDocument();

    resolveDirectUpload();

    expect(await screen.findByText(/Processing and optimizing your video/i)).toBeInTheDocument();
    expect(screen.getByText(/100% uploaded/i)).toBeInTheDocument();

    resolveFinalizeUpload();

    await waitFor(() => expect(api.createVideo).toHaveBeenCalledWith(expect.objectContaining({
      type: 'video',
      uploadId: 109,
      thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
      isDraft: false,
      isLive: false,
    })));
    expect(captureThumbnailFromVideoFile).toHaveBeenCalledTimes(1);
  });

  it('uses a manually uploaded thumbnail instead of auto-capturing one for videos', async () => {
    const user = userEvent.setup();

    api.getCategories.mockResolvedValue({
      data: {
        categories: [{ id: 2, label: 'Music' }],
      },
    });
    api.presignUpload.mockResolvedValue({
      data: {
        strategy: 'client-direct-upload',
        method: 'POST',
        endpoint: 'https://api.cloudinary.com/v1_1/demo/video/upload',
        fields: { signature: 'signed' },
      },
    });
    api.uploadFileDirect.mockResolvedValue({
      secure_url: 'https://res.cloudinary.com/demo/video/upload/v1/deymake/uploads/videos/user-1/manual.mp4',
      bytes: 10,
      duration: 3,
    });
    api.uploadFile.mockResolvedValue({ data: { upload: { id: 321 } } });
    api.createVideo.mockResolvedValue({
      data: {
        video: { id: 90, isDraft: false, mediaUrl: 'https://cdn.example.com/manual.mp4', thumbnailUrl: 'https://cdn.example.com/manual-thumb.jpg' },
      },
    });
    uploadThumbnailFile.mockResolvedValue({ url: 'https://cdn.example.com/manual-thumb.jpg' });

    const { container } = renderPage();

    await user.click(screen.getByRole('button', { name: /Videos\s*MP4,\s*MOV,\s*AVI/i }));

    const [mediaInput, thumbnailInput] = await waitFor(() => {
      const inputs = container.querySelectorAll('input[type="file"]');
      return inputs.length === 2 ? inputs : null;
    });

    fireEvent.change(mediaInput, { target: { files: [new File(['video'], 'manual.mp4', { type: 'video/mp4' })] } });
    fireEvent.change(thumbnailInput, { target: { files: [new File(['thumb'], 'manual-cover.jpg', { type: 'image/jpeg' })] } });

    await user.click(screen.getByRole('button', { name: /^Upload$/i }));

    await waitFor(() => expect(api.createVideo).toHaveBeenCalledWith(expect.objectContaining({
      type: 'video',
      uploadId: 321,
      thumbnailUrl: 'https://cdn.example.com/manual-thumb.jpg',
    })));
    expect(uploadThumbnailFile).toHaveBeenCalledWith(expect.objectContaining({ name: 'manual-cover.jpg' }));
    expect(captureThumbnailFromVideoFile).not.toHaveBeenCalled();
  });

  it('shows mention suggestions while typing and inserts the selected username', async () => {
    const user = userEvent.setup();

    api.getCategories.mockResolvedValue({
      data: {
        categories: [{ id: 2, label: 'Music' }],
      },
    });
    api.searchCreators.mockResolvedValue({
      data: {
        creators: [
          { id: 7, fullName: 'Creator Uno', username: 'creator.uno', avatarUrl: '' },
          { id: 8, fullName: 'Creative Two', username: 'creative.two', avatarUrl: '' },
        ],
      },
    });

    renderPage();

    const captionInput = await screen.findByPlaceholderText('Add a caption');

    await user.type(captionInput, 'Collab with @cre');

    await waitFor(() => expect(api.searchCreators).toHaveBeenCalledWith('cre'));

    const creatorOption = await screen.findByRole('option', { name: /Creator Uno\s+@creator\.uno/i });
    await user.click(creatorOption);

    expect(captionInput).toHaveValue('Collab with @creator.uno ');
    expect(screen.queryByRole('listbox', { name: 'Mention suggestions' })).not.toBeInTheDocument();
  });

  it('blocks backend fallback for large videos when direct upload is unavailable', async () => {
    const user = userEvent.setup();

    api.getCategories.mockResolvedValue({ data: { categories: [] } });
    api.presignUpload.mockResolvedValue({ data: { strategy: 'server-upload' } });

    const { container } = renderPage();

    const fileInput = await waitFor(() => container.querySelector('input[type="file"]'));
    const file = new File(['video'], 'huge.mp4', { type: 'video/mp4' });
    Object.defineProperty(file, 'size', {
      configurable: true,
      value: DIRECT_UPLOAD_LARGE_FILE_THRESHOLD + 1,
    });

    await user.click(screen.getByRole('button', { name: /Videos\s*MP4,\s*MOV,\s*AVI/i }));
    fireEvent.change(fileInput, { target: { files: [file] } });

    await user.click(screen.getByRole('button', { name: /^Upload$/i }));

    expect(await screen.findByText('Large files and videos must upload directly. Please try again.')).toBeInTheDocument();
    expect(api.uploadFileDirect).not.toHaveBeenCalled();
    expect(api.uploadFile).not.toHaveBeenCalled();
    expect(api.createVideo).not.toHaveBeenCalled();
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
    expect(screen.getByRole('button', { name: /Upload thumbnail/i })).toBeInTheDocument();
    expect(container.querySelectorAll('input[type="file"]')).toHaveLength(1);
    await waitFor(() => expect(globalThis.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true, audio: true }));
    expect(await screen.findByLabelText(/Live camera preview/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Save draft/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Upload$/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Go live/i }));

    await waitFor(() => expect(api.createVideo).toHaveBeenCalledTimes(1));

    expect(api.uploadFile).not.toHaveBeenCalled();
    expect(api.createVideo).toHaveBeenCalledWith(expect.objectContaining({
      type: 'video',
      thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
      isDraft: false,
      isLive: true,
    }));
    expect(captureThumbnailFromVideoElement).toHaveBeenCalledTimes(1);
  });
});