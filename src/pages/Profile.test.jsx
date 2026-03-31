import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authState, syncUserSpy } = vi.hoisted(() => ({
  authState: {
    user: { id: 1, fullName: 'Ada Lovelace', avatarUrl: '' },
    isAuthenticated: true,
  },
  syncUserSpy: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    ...authState,
    syncUser: syncUserSpy,
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
      getProfile: vi.fn(),
      getProfileFeed: vi.fn(),
      getUser: vi.fn(),
      getUserPosts: vi.fn(),
      updateProfile: vi.fn(),
      uploadFile: vi.fn(),
      subscribeToCreator: vi.fn(),
      unsubscribeFromCreator: vi.fn(),
    },
  };
});

import { api } from '../services/api';
import Profile from './Profile';

function renderPage(initialEntry = '/profile') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/users/:id" element={<Profile />} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { id: 1, fullName: 'Ada Lovelace', avatarUrl: '' };
    authState.isAuthenticated = true;
  });

  it('loads the profile and saves edited details', async () => {
    const user = userEvent.setup();

    api.getProfile.mockResolvedValue({
      data: {
        profile: {
          id: 1,
          fullName: 'Ada Lovelace',
          bio: 'First programmer',
          subscriberCount: 2500,
          avatarUrl: '',
        },
      },
    });
    api.getProfileFeed.mockResolvedValue({
      data: {
        videos: [{ id: 5, title: 'Analytical Engine demo', thumbnailUrl: 'https://cdn.example/demo.jpg', views: 120 }],
      },
    });
    api.updateProfile.mockResolvedValue({
      data: {
        profile: {
          id: 1,
          fullName: 'Ada Byron',
          bio: 'Computing pioneer',
          subscriberCount: 2500,
          avatarUrl: '',
        },
      },
    });

    renderPage();

    await screen.findByText('Ada Lovelace');
    await screen.findByText('Analytical Engine demo');

    await user.click(screen.getByRole('button', { name: /Edit profile/i }));
    await user.clear(screen.getByPlaceholderText('Full name'));
    await user.type(screen.getByPlaceholderText('Full name'), 'Ada Byron');
    await user.clear(screen.getByPlaceholderText('Bio'));
    await user.type(screen.getByPlaceholderText('Bio'), 'Computing pioneer');
    await user.click(screen.getByRole('button', { name: /Save profile/i }));

    await waitFor(() => expect(api.updateProfile).toHaveBeenCalledTimes(1));

    expect(api.updateProfile).toHaveBeenCalledWith({
      fullName: 'Ada Byron',
      bio: 'Computing pioneer',
      avatarUrl: null,
    });

    await screen.findByText('Profile updated successfully.');
    expect(screen.getByText('Ada Byron')).toBeInTheDocument();
    expect(syncUserSpy).toHaveBeenCalledWith(expect.objectContaining({ fullName: 'Ada Byron' }));
  });

  it('loads a public creator profile and toggles subscription state', async () => {
    const user = userEvent.setup();

    api.getUser.mockResolvedValue({
      data: {
        user: {
          id: 5,
          fullName: 'Grace Hopper',
          bio: 'Compiler trailblazer',
          subscriberCount: 4100,
          avatarUrl: '',
          currentUserState: { subscribed: false },
        },
      },
    });
    api.getUserPosts.mockResolvedValue({
      data: {
        videos: [{ id: 7, title: 'COBOL for creators', thumbnailUrl: 'https://cdn.example/cobol.jpg', views: 88 }],
      },
    });
    api.subscribeToCreator.mockResolvedValue({
      data: {
        creator: {
          id: 5,
          subscriberCount: 4101,
          subscribed: true,
        },
      },
    });

    renderPage('/users/5');

    await waitFor(() => expect(api.getUser).toHaveBeenCalledWith('5'));
    await waitFor(() => expect(api.getUserPosts).toHaveBeenCalledWith('5'));

    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('COBOL for creators')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Edit profile/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Subscribe/i }));

    await waitFor(() => expect(api.subscribeToCreator).toHaveBeenCalledWith(5));
    expect(screen.getByRole('button', { name: /Subscribed/i })).toBeInTheDocument();
  });
});