import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../../context/LanguageContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { fullName: 'Test Creator', avatarUrl: '' },
  }),
}));

vi.mock('../../services/api', async () => {
  const actual = await vi.importActual('../../services/api');

  return {
    ...actual,
    api: {
      searchSuggestions: vi.fn(),
    },
  };
});

import { api } from '../../services/api';
import TopBar from './TopBar';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
}

function renderTopBar(initialEntry = '/home') {
  return render(
    <LanguageProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="*" element={<><TopBar /><LocationDisplay /></>} />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>,
  );
}

describe('TopBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads lookup suggestions and navigates to search results', async () => {
    api.searchSuggestions.mockResolvedValue({
      data: {
        videos: [{ id: 9, title: 'Moonlight Session', author: { fullName: 'DJ Aurora' } }],
        creators: [{ id: 4, fullName: 'Ada Lovelace', subscriberCount: 12 }],
        categories: [{ id: 2, label: 'Jazz' }],
      },
    });

    renderTopBar();

    fireEvent.change(screen.getByLabelText(/search deymake/i), { target: { value: '  Jazz  ' } });

    await waitFor(() => expect(api.searchSuggestions).toHaveBeenCalledWith('Jazz'));

    expect(await screen.findByText('Moonlight Session')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view all results for “jazz”/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /view all results for “jazz”/i }));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/search?q=Jazz');
    });
  });
});