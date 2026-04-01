import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authState, logoutSpy, setThemePreferenceSpy, setLocaleSpy, syncUserSpy } = vi.hoisted(() => ({
  authState: {
    user: { id: 1, fullName: 'Ada', preferences: {} },
    mode: 'static',
  },
  logoutSpy: vi.fn(),
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

vi.mock('../context/AuthContext', async () => {
  const React = await vi.importActual('react');

  function resolveNextUser(currentUser, nextUser) {
    return typeof nextUser === 'function' ? nextUser(currentUser) : nextUser;
  }

  return {
    useAuth: () => {
      const [userState, setUserState] = React.useState(authState.user);

      function syncUser(nextUser) {
        if (authState.mode === 'stateful') {
          setUserState((currentUser) => {
            const resolvedUser = resolveNextUser(currentUser, nextUser);
            syncUserSpy(resolvedUser);
            return resolvedUser;
          });
          return;
        }

        const resolvedUser = resolveNextUser(authState.user, nextUser);
        authState.user = resolvedUser;
        syncUserSpy(resolvedUser);
      }

      return {
        logout: logoutSpy,
        user: authState.mode === 'stateful' ? userState : authState.user,
        syncUser,
      };
    },
  };
});

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
      getDeveloperOverview: vi.fn(),
      createDeveloperApiKey: vi.fn(),
      deleteDeveloperApiKey: vi.fn(),
      createDeveloperWebhook: vi.fn(),
      updateDeveloperWebhook: vi.fn(),
      rotateDeveloperWebhookSecret: vi.fn(),
      deleteDeveloperWebhook: vi.fn(),
      getCreatorPlans: vi.fn(),
      getCreatorMemberships: vi.fn(),
      getMyMemberships: vi.fn(),
      createCreatorPlan: vi.fn(),
      updateCreatorPlan: vi.fn(),
      deleteCreatorPlan: vi.fn(),
      cancelMembership: vi.fn(),
    },
  };
});

import { api } from '../services/api';
import Settings from './Settings';

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { id: 1, fullName: 'Ada', preferences: {} };
    authState.mode = 'static';
  });

  it('loads preferences once without getting stuck in a sync loop', async () => {
    authState.mode = 'stateful';

    api.getPreferences.mockResolvedValue({
      data: {
        preferences: {
          notificationSettings: { messages: true, comments: true, likes: true, subscriptions: true },
          language: 'fr',
          displayPreferences: { theme: 'dark', autoplay: true },
          accessibilityPreferences: { captions: false, reducedMotion: false },
        },
      },
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('fr'));
    await new Promise((resolve) => setTimeout(resolve, 25));

    expect(api.getPreferences).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Loading your preferences...')).not.toBeInTheDocument();
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

  it('loads the developer portal and creates an API key', async () => {
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
    api.getDeveloperOverview
      .mockResolvedValueOnce({
        data: {
          developer: {
            availableEvents: ['membership.created'],
            apiKeys: [
              {
                id: 10,
                name: 'Existing key',
                abilities: ['videos.read'],
                createdAt: '2026-03-31T10:00:00Z',
                lastUsedAt: null,
              },
            ],
            webhooks: [],
            summary: { apiKeysCount: 1, webhooksCount: 0, activeWebhooksCount: 0 },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          developer: {
            availableEvents: ['membership.created'],
            apiKeys: [
              {
                id: 10,
                name: 'Existing key',
                abilities: ['videos.read'],
                createdAt: '2026-03-31T10:00:00Z',
                lastUsedAt: null,
              },
              {
                id: 11,
                name: 'Deploy key',
                abilities: ['videos.read', 'webhooks.manage'],
                createdAt: '2026-03-31T11:00:00Z',
                lastUsedAt: null,
              },
            ],
            webhooks: [],
            summary: { apiKeysCount: 2, webhooksCount: 0, activeWebhooksCount: 0 },
          },
        },
      });
    api.createDeveloperApiKey.mockResolvedValue({
      message: 'API key created successfully.',
      data: {
        plainTextToken: 'plain-token-value',
      },
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await screen.findByRole('combobox');
    await user.click(screen.getByRole('button', { name: 'Developer portal' }));

    expect(await screen.findByText('Existing key')).toBeInTheDocument();

    const [keyNameInput, scopesInput] = screen.getAllByRole('textbox');

    await user.type(keyNameInput, 'Deploy key');
    await user.type(scopesInput, 'videos.read, webhooks.manage');
    await user.click(screen.getByRole('button', { name: 'Create API key' }));

    await waitFor(() => expect(api.createDeveloperApiKey).toHaveBeenCalledWith({
      name: 'Deploy key',
      abilities: ['videos.read', 'webhooks.manage'],
    }));

    expect(await screen.findByText('plain-token-value')).toBeInTheDocument();
    expect(await screen.findByText('Deploy key')).toBeInTheDocument();
  });
});