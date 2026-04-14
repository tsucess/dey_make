import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authState = { user: { id: 1, isAdmin: true } };

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('../context/LanguageContext', async () => {
  const actual = await vi.importActual('../locales/translations');
  const t = actual.createTranslator('en');
  return { useLanguage: () => ({ locale: 'en', setLocale: vi.fn(), t }) };
});

vi.mock('../services/api', () => ({
  firstError: (errors, fallback) => errors?.[0] || fallback || 'Something went wrong.',
  api: {
    getAdminUsers: vi.fn(),
    getManagedUser: vi.fn(),
    updateManagedUser: vi.fn(),
  },
}));

import { api } from '../services/api';
import AdminUsers from './AdminUsers';

const managedUser = {
  id: 77,
  fullName: 'Stream Creator',
  username: 'stream.creator',
  email: 'stream-creator@example.com',
  avatarUrl: '',
  bio: 'Creator bio',
  isAdmin: false,
  accountStatus: 'active',
  isSuspended: false,
  isVerifiedCreator: true,
  isOnline: true,
  createdAt: '2026-04-01T12:00:00Z',
  lastActiveAt: '2026-04-14T12:00:00Z',
  stats: {
    videosCount: 3,
    publishedVideosCount: 2,
    liveVideosCount: 1,
    subscribersCount: 24,
    reportsSubmittedCount: 2,
    challengeSubmissionsCount: 4,
  },
};

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminUsers />
    </MemoryRouter>,
  );
}

describe('AdminUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { id: 1, isAdmin: true };
    api.getAdminUsers.mockResolvedValue({
      data: { users: [managedUser] },
      meta: {
        users: { currentPage: 1, lastPage: 1, total: 1 },
        summary: { totalUsers: 10, adminUsers: 2, suspendedUsers: 1, creatorUsers: 4 },
      },
    });
    api.getManagedUser.mockResolvedValue({ data: { user: managedUser } });
    api.updateManagedUser.mockResolvedValue({
      message: 'User updated successfully.',
      data: { user: { ...managedUser, accountStatus: 'suspended', isSuspended: true, accountStatusNotes: 'Repeated impersonation reports.' } },
    });
  });

  it('loads users, reviews details, and suspends a managed user', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Admin user management' })).toBeInTheDocument();
    expect(api.getAdminUsers).toHaveBeenCalledWith({ q: '', page: 1, accountStatus: '', role: '', sort: 'latest' });
    expect(screen.getByText('Stream Creator')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Review details' }));

    await waitFor(() => expect(api.getManagedUser).toHaveBeenCalledWith(77));
    expect(screen.getByText('Creator bio')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Moderation note'));
    await user.type(screen.getByLabelText('Moderation note'), 'Repeated impersonation reports.');
    await user.click(screen.getByRole('button', { name: 'Suspend user' }));

    await waitFor(() => expect(api.updateManagedUser).toHaveBeenCalledWith(77, {
      accountStatus: 'suspended',
      accountStatusNotes: 'Repeated impersonation reports.',
      clearSessions: true,
    }));

    expect(screen.getByText('User updated successfully.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reactivate user' })).toBeInTheDocument();
  });

  it('submits search filters and resets them', async () => {
    renderPage();
    await screen.findByText('Stream Creator');

    fireEvent.change(screen.getByPlaceholderText('Search by name, username, or email'), { target: { value: 'stream' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search users' }));

    await waitFor(() => expect(api.getAdminUsers).toHaveBeenLastCalledWith({ q: 'stream', page: 1, accountStatus: '', role: '', sort: 'latest' }));

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    await waitFor(() => expect(api.getAdminUsers).toHaveBeenLastCalledWith({ q: '', page: 1, accountStatus: '', role: '', sort: 'latest' }));
  });

  it('redirects non-admin users away from the page', () => {
    authState.user = { id: 2, isAdmin: false };
    renderPage();

    expect(screen.queryByRole('heading', { name: 'Admin user management' })).not.toBeInTheDocument();
  });
});