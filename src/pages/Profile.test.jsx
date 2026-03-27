import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    syncUser: vi.fn(),
  }),
}));

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');

  return {
    ...actual,
    api: {
      getProfile: vi.fn(),
      getProfileFeed: vi.fn(),
      updateProfile: vi.fn(),
      uploadFile: vi.fn(),
    },
  };
});

import { api } from '../services/api';
import Profile from './Profile';

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

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
  });
});