import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');
  return { ...actual, api: { ...actual.api, getCategories: vi.fn() } };
});

import { api } from '../services/api';
import CreateLive from './CreateLive';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/create-live']}>
      <Routes>
        <Route path="/create-live" element={<CreateLive />} />
        <Route path="/preview-live" element={<div>Preview page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CreateLive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getCategories.mockResolvedValue({ data: { categories: [] } });
  });

  it('renders translated live flow copy instead of raw locale keys', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Set up your live stream' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Live setup' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Before you preview' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preview live' })).toBeInTheDocument();
    expect(screen.queryByText('upload.liveFlow.setupTitle')).not.toBeInTheDocument();
  });

  it('shows a translated validation error when previewing without a title', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => expect(api.getCategories).toHaveBeenCalledTimes(1));
    await user.click(screen.getByRole('button', { name: 'Preview live' }));

    expect(await screen.findByText('Enter a title before continuing.')).toBeInTheDocument();
  });

  it('lets creators add a thumbnail before opening the live preview', async () => {
    const { container } = renderPage();

    await waitFor(() => expect(api.getCategories).toHaveBeenCalledTimes(1));

    const thumbnailInput = container.querySelector('input[type="file"]');
    fireEvent.change(thumbnailInput, { target: { files: [new File(['thumb'], 'live-cover.jpg', { type: 'image/jpeg' })] } });

    expect(await screen.findByText('Selected thumbnail: live-cover.jpg')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Replace thumbnail' })).toBeInTheDocument();
  });
});