import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

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
      getProfileSubscribers: vi.fn(),
    },
  };
});

import { api } from '../services/api';
import ProfileSubscribers from './ProfileSubscribers';

function renderPage(initialEntry = '/profile/subscribers') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/profile" element={<div>Profile page</div>} />
        <Route path="/profile/subscribers" element={<ProfileSubscribers />} />
        <Route path="/users/:id" element={<div>User profile page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProfileSubscribers', () => {
  it('renders subscribers and links to each profile', async () => {
    api.getProfileSubscribers.mockResolvedValue({
      data: {
        subscribers: [
          { id: 7, fullName: 'Grace Hopper', username: 'grace.hopper', avatarUrl: '' },
          { id: 8, fullName: 'Katherine Johnson', username: 'katherine.j', avatarUrl: '' },
        ],
      },
    });

    renderPage();

    await waitFor(() => expect(api.getProfileSubscribers).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('link', { name: /Grace Hopper/i })).toHaveAttribute('href', '/users/7');
    expect(screen.getByRole('link', { name: /Katherine Johnson/i })).toHaveAttribute('href', '/users/8');
  });

  it('navigates back to the profile page', async () => {
    const user = userEvent.setup();

    api.getProfileSubscribers.mockResolvedValue({ data: { subscribers: [] } });

    renderPage();

    await screen.findByText('You do not have any subscribers yet.');
    await user.click(screen.getByRole('button', { name: /back to profile/i }));

    expect(await screen.findByText('Profile page')).toBeInTheDocument();
  });
});