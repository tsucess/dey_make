import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { setThemePreferenceSpy } = vi.hoisted(() => ({
  setThemePreferenceSpy: vi.fn(),
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'system',
    setThemePreference: setThemePreferenceSpy,
  }),
}));

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');

  return {
    ...actual,
    api: {
      getPreferences: vi.fn(),
      updatePreferences: vi.fn(),
    },
  };
});

import { api } from '../services/api';
import Settings from './Settings';

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads preferences and persists notification changes', async () => {
    const user = userEvent.setup();

    api.getPreferences.mockResolvedValue({
      data: {
        preferences: {
          notificationSettings: { messages: true, comments: true, likes: false, subscriptions: true },
          language: 'fr',
          displayPreferences: { theme: 'dark', autoplay: true },
          accessibilityPreferences: { captions: false, reducedMotion: true },
        },
      },
    });
    api.updatePreferences.mockResolvedValue({
      data: {
        preferences: {
          notificationSettings: { messages: true, comments: true, likes: true, subscriptions: true },
          language: 'fr',
          displayPreferences: { theme: 'dark', autoplay: true },
          accessibilityPreferences: { captions: false, reducedMotion: true },
        },
      },
    });

    render(<Settings />);

    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('fr'));
    expect(setThemePreferenceSpy).toHaveBeenCalledWith('dark');

    const likesLabel = screen.getByText('Likes');
    const likesRow = likesLabel.closest('div.flex');

    await user.click(within(likesRow).getByRole('switch'));

    await waitFor(() => expect(api.updatePreferences).toHaveBeenCalledTimes(1));

    expect(api.updatePreferences).toHaveBeenCalledWith({
      notificationSettings: expect.objectContaining({ likes: true }),
    });
    await screen.findByText('Notifications updated successfully.');
  });
});