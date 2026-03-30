import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
      search: vi.fn(),
      searchVideos: vi.fn(),
      searchCreators: vi.fn(),
      searchCategories: vi.fn(),
    },
  };
});

import { api } from '../services/api';
import SearchResults from './SearchResults';

function renderPage(initialEntry = '/search?q=jazz') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/search" element={<SearchResults />} />
        <Route path="/video/:id" element={<div>Video page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SearchResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads grouped results and switches to the videos tab', async () => {
    const user = userEvent.setup();

    api.search.mockResolvedValue({
      data: {
        videos: [{ id: 7, title: 'Jazz Nights', thumbnailUrl: '', creator: { fullName: 'Blue Note' }, category: { label: 'Jazz' } }],
        creators: [{ id: 3, fullName: 'Miles Creator', subscriberCount: 1500, bio: 'Late-night sessions' }],
        categories: [{ id: 5, label: 'Jazz', slug: 'jazz', subscriberCount: 800 }],
      },
      meta: {
        videos: { total: 1 },
        creators: { total: 1 },
        categories: { total: 1 },
      },
    });
    api.searchVideos.mockResolvedValue({
      data: {
        videos: [{ id: 7, title: 'Jazz Nights', thumbnailUrl: '', creator: { fullName: 'Blue Note' }, category: { label: 'Jazz' } }],
      },
      meta: {
        videos: { total: 1 },
      },
    });

    renderPage();

    await waitFor(() => expect(api.search).toHaveBeenCalledWith('jazz'));

    expect(await screen.findByText(/results for “jazz”/i)).toBeInTheDocument();
    expect(screen.getByText('Jazz Nights')).toBeInTheDocument();
    expect(screen.getByText('Miles Creator')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Jazz' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Videos' }));

    await waitFor(() => expect(api.searchVideos).toHaveBeenCalledWith('jazz'));
    expect(screen.getAllByText('Jazz Nights').length).toBeGreaterThan(0);
  });

  it('does not call the API for a blank query until the user submits one', async () => {
    const user = userEvent.setup();

    api.search.mockResolvedValue({
      data: { videos: [], creators: [], categories: [] },
      meta: { videos: { total: 0 }, creators: { total: 0 }, categories: { total: 0 } },
    });

    renderPage('/search');

    expect(screen.getByText(/start typing to search videos, creators, and categories/i)).toBeInTheDocument();
    expect(api.search).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText(/search deymake/i), 'Ambient');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(api.search).toHaveBeenCalledWith('Ambient'));
  });
});