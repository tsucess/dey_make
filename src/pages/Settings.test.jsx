import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { setThemePreferenceSpy, setLocaleSpy, syncUserSpy } = vi.hoisted(() => ({
  setThemePreferenceSpy: vi.fn(),
  setLocaleSpy: vi.fn(),
  syncUserSpy: vi.fn(),
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'system',
    setThemePreference: setThemePreferenceSpy,
  }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    logout: vi.fn(),
    user: { id: 1, fullName: 'Ada', preferences: {} },
    syncUser: syncUserSpy,
  }),
}));

vi.mock('../context/LanguageContext', async () => {
  const actual = await vi.importActual('../locales/translations');
  const t = actual.createTranslator('en');

  return {
    useLanguage: () => ({
      locale: 'en',
      setLocale: setLocaleSpy,
      supportedLocales: actual.SUPPORTED_LOCALES,
      t,
    }),
  };
});

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

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('fr'));
    expect(setThemePreferenceSpy).toHaveBeenCalledWith('dark');
    expect(setLocaleSpy).toHaveBeenCalledWith('fr');

    const likesLabel = screen.getByText('Likes');
    const likesRow = likesLabel.closest('div.flex');

    await user.click(within(likesRow).getByRole('switch'));

    await waitFor(() => expect(api.updatePreferences).toHaveBeenCalledTimes(1));

    expect(api.updatePreferences).toHaveBeenCalledWith({
      notificationSettings: expect.objectContaining({ likes: true }),
    });
    await screen.findByText('Notifications updated successfully.');
  });

  it('shows the expanded language list and persists a language change', async () => {
    const user = userEvent.setup();

    api.getPreferences.mockResolvedValue({
      data: {
        preferences: {
          notificationSettings: { messages: true, comments: true, likes: true, subscriptions: true },
          language: 'en',
          displayPreferences: { theme: 'system', autoplay: true },
          accessibilityPreferences: { captions: false, reducedMotion: false },
        },
      },
    });
    api.updatePreferences.mockResolvedValue({
      data: {
        preferences: {
          notificationSettings: { messages: true, comments: true, likes: true, subscriptions: true },
          language: 'yo',
          displayPreferences: { theme: 'system', autoplay: true },
          accessibilityPreferences: { captions: false, reducedMotion: false },
        },
      },
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    const languageSelect = await screen.findByRole('combobox');

    expect(within(languageSelect).getByRole('option', { name: '🇳🇬 Yorùbá' })).toBeInTheDocument();
    expect(within(languageSelect).getByRole('option', { name: '🇳🇬 Hausa' })).toBeInTheDocument();
    expect(within(languageSelect).getByRole('option', { name: '🇳🇬 Igbo' })).toBeInTheDocument();

    await user.selectOptions(languageSelect, 'yo');

    await waitFor(() => expect(api.updatePreferences).toHaveBeenCalledWith({ language: 'yo' }));
    expect(setLocaleSpy).toHaveBeenCalledWith('yo');
    await screen.findByText('Language updated successfully.');
  });
});