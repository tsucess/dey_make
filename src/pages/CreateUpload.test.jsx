import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { fullName: 'Test Creator' },
  }),
}));

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

function renderPage(initialEntry = '/create') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/create" element={<CreateUpload />} />
        <Route path="/video/:id" element={<div>Video page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CreateUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview');
    globalThis.URL.revokeObjectURL = vi.fn();
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
});