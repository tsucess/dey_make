import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let notificationPermission = 'default';

class NotificationMock {
  static requestPermission = vi.fn(() => Promise.resolve(notificationPermission));

  static get permission() {
    return notificationPermission;
  }
}

Object.defineProperty(window, 'Notification', {
  configurable: true,
  writable: true,
  value: NotificationMock,
});

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
    notificationPermission = 'default';
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

  it('requests browser permission before enabling browser notifications', async () => {
    const user = userEvent.setup();

    api.getPreferences.mockResolvedValue({
      data: {
        preferences: {
          notificationSettings: {
            messages: true,
            comments: true,
            likes: true,
            subscriptions: true,
            inAppRealtime: true,
            browserRealtime: false,
          },
          language: 'en',
          displayPreferences: { theme: 'system', autoplay: true },
          accessibilityPreferences: { captions: false, reducedMotion: false },
        },
      },
    });
    api.updatePreferences.mockResolvedValue({
      data: {
        preferences: {
          notificationSettings: {
            messages: true,
            comments: true,
            likes: true,
            subscriptions: true,
            inAppRealtime: true,
            browserRealtime: true,
          },
          language: 'en',
          displayPreferences: { theme: 'system', autoplay: true },
          accessibilityPreferences: { captions: false, reducedMotion: false },
        },
      },
    });
    NotificationMock.requestPermission.mockImplementationOnce(async () => {
      notificationPermission = 'granted';
      return 'granted';
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await screen.findByRole('combobox');

    const browserLabel = screen.getByText('Browser notifications');
    const browserRow = browserLabel.closest('div.flex');

    await user.click(within(browserRow).getByRole('switch'));

    await waitFor(() => expect(NotificationMock.requestPermission).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(api.updatePreferences).toHaveBeenCalledWith({
      notificationSettings: expect.objectContaining({ browserRealtime: true }),
    }));
  });

  it('shows an error and does not persist when browser notification permission is denied', async () => {
    const user = userEvent.setup();

    api.getPreferences.mockResolvedValue({
      data: {
        preferences: {
          notificationSettings: {
            messages: true,
            comments: true,
            likes: true,
            subscriptions: true,
            inAppRealtime: true,
            browserRealtime: false,
          },
          language: 'en',
          displayPreferences: { theme: 'system', autoplay: true },
          accessibilityPreferences: { captions: false, reducedMotion: false },
        },
      },
    });
    NotificationMock.requestPermission.mockImplementationOnce(async () => {
      notificationPermission = 'denied';
      return 'denied';
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await screen.findByRole('combobox');

    const browserLabel = screen.getByText('Browser notifications');
    const browserRow = browserLabel.closest('div.flex');

    await user.click(within(browserRow).getByRole('switch'));

    await waitFor(() => expect(NotificationMock.requestPermission).toHaveBeenCalledTimes(1));
    expect(api.updatePreferences).not.toHaveBeenCalled();
    expect(await screen.findByText('Allow browser notifications to enable this setting.')).toBeInTheDocument();
  });

  it('shows an error and does not persist when browser notifications are unsupported', async () => {
    const user = userEvent.setup();
    const originalNotification = window.Notification;

    try {
      window.Notification = undefined;

      api.getPreferences.mockResolvedValue({
        data: {
          preferences: {
            notificationSettings: {
              messages: true,
              comments: true,
              likes: true,
              subscriptions: true,
              inAppRealtime: true,
              browserRealtime: false,
            },
            language: 'en',
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

      await screen.findByRole('combobox');

      const browserLabel = screen.getByText('Browser notifications');
      const browserRow = browserLabel.closest('div.flex');

      await user.click(within(browserRow).getByRole('switch'));

      expect(api.updatePreferences).not.toHaveBeenCalled();
      expect(await screen.findByText('Browser notifications are not supported on this device or browser.')).toBeInTheDocument();
    } finally {
      window.Notification = originalNotification;
    }
  });

  it('persists display theme changes and accessibility toggles', async () => {
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
    api.updatePreferences
      .mockResolvedValueOnce({
        data: {
          preferences: {
            notificationSettings: { messages: true, comments: true, likes: true, subscriptions: true },
            language: 'en',
            displayPreferences: { theme: 'dark', autoplay: true },
            accessibilityPreferences: { captions: false, reducedMotion: false },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          preferences: {
            notificationSettings: { messages: true, comments: true, likes: true, subscriptions: true },
            language: 'en',
            displayPreferences: { theme: 'dark', autoplay: true },
            accessibilityPreferences: { captions: true, reducedMotion: false },
          },
        },
      });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await screen.findByRole('combobox');

    await user.click(screen.getByRole('button', { name: 'Dark' }));

    await waitFor(() => expect(api.updatePreferences).toHaveBeenNthCalledWith(1, {
      displayPreferences: expect.objectContaining({ theme: 'dark' }),
    }));
    expect(setThemePreferenceSpy).toHaveBeenCalledWith('dark');

    const captionsLabel = screen.getByText('Captions');
    const captionsRow = captionsLabel.closest('div.flex');

    await user.click(within(captionsRow).getByRole('switch'));

    await waitFor(() => expect(api.updatePreferences).toHaveBeenNthCalledWith(2, {
      accessibilityPreferences: expect.objectContaining({ captions: true }),
    }));
    await screen.findByText('Accessibility updated successfully.');
  });

  it('loads the memberships workspace and creates a plan', async () => {
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
    api.getCreatorPlans
      .mockResolvedValueOnce({ data: { plans: [] } })
      .mockResolvedValueOnce({
        data: {
          plans: [
            {
              id: 21,
              name: 'Gold Circle',
              description: 'Premium access',
              priceAmount: 1500,
              currency: 'USD',
              billingPeriod: 'monthly',
              benefits: ['Early access', 'Members-only chat'],
              isActive: true,
              sortOrder: 1,
              activeMemberCount: 2,
              memberCount: 3,
            },
          ],
        },
      });
    api.getCreatorMemberships.mockResolvedValue({ data: { memberships: [] } });
    api.getMyMemberships.mockResolvedValue({ data: { memberships: [] } });
    api.createCreatorPlan.mockResolvedValue({ message: 'Plan created successfully.' });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await screen.findByRole('combobox');
    await user.click(screen.getByRole('button', { name: 'Memberships' }));

    expect(await screen.findByText('You have not created any plans yet.')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: 'Plan name' }), 'Gold Circle');
    await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Premium access');
    await user.type(screen.getByRole('textbox', { name: /^Benefits/ }), 'Early access, Members-only chat');
    await user.clear(screen.getByRole('spinbutton', { name: 'Price amount (minor units)' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Price amount (minor units)' }), '1500');
    await user.clear(screen.getByRole('spinbutton', { name: 'Sort order' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Sort order' }), '1');
    await user.click(screen.getByRole('button', { name: 'Create plan' }));

    await waitFor(() => expect(api.createCreatorPlan).toHaveBeenCalledWith({
      name: 'Gold Circle',
      description: 'Premium access',
      price_amount: 1500,
      currency: 'USD',
      billing_period: 'monthly',
      benefits: ['Early access', 'Members-only chat'],
      is_active: true,
      sort_order: 1,
    }));

    expect(await screen.findByDisplayValue('Gold Circle')).toBeInTheDocument();
  });

  it('cancels an active membership from the memberships workspace', async () => {
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
    api.getCreatorPlans.mockResolvedValue({ data: { plans: [] } });
    api.getCreatorMemberships.mockResolvedValue({ data: { memberships: [] } });
    api.getMyMemberships
      .mockResolvedValueOnce({
        data: {
          memberships: [
            {
              id: 44,
              status: 'active',
              startedAt: '2026-04-01T10:00:00Z',
              priceAmount: 1500,
              currency: 'USD',
              billingPeriod: 'monthly',
              creator: { fullName: 'Creator Ada' },
              plan: { name: 'Gold Circle' },
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          memberships: [
            {
              id: 44,
              status: 'cancelled',
              startedAt: '2026-04-01T10:00:00Z',
              priceAmount: 1500,
              currency: 'USD',
              billingPeriod: 'monthly',
              creator: { fullName: 'Creator Ada' },
              plan: { name: 'Gold Circle' },
            },
          ],
        },
      });
    api.cancelMembership.mockResolvedValue({ message: 'Membership cancelled successfully.' });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await screen.findByRole('combobox');
    await user.click(screen.getByRole('button', { name: 'Memberships' }));

    expect(await screen.findByText('Creator Ada')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel membership' }));

    await waitFor(() => expect(api.cancelMembership).toHaveBeenCalledWith(44));
    expect(await screen.findByText('Membership cancelled successfully.')).toBeInTheDocument();
    expect(await screen.findByText('Cancelled')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel membership' })).not.toBeInTheDocument();
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

  it('creates, updates, and deletes developer webhooks', async () => {
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
            availableEvents: ['membership.created', 'membership.cancelled'],
            apiKeys: [],
            webhooks: [
              {
                id: 31,
                name: 'Membership webhook',
                targetUrl: 'https://example.com/webhooks/membership',
                events: ['membership.created'],
                isActive: true,
                lastTriggeredAt: null,
                lastStatusCode: null,
              },
            ],
            summary: { apiKeysCount: 0, webhooksCount: 1, activeWebhooksCount: 1 },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          developer: {
            availableEvents: ['membership.created', 'membership.cancelled'],
            apiKeys: [],
            webhooks: [
              {
                id: 31,
                name: 'Membership webhook',
                targetUrl: 'https://example.com/webhooks/membership',
                events: ['membership.created'],
                isActive: true,
                lastTriggeredAt: null,
                lastStatusCode: null,
              },
              {
                id: 32,
                name: 'Billing webhook',
                targetUrl: 'https://example.com/webhooks/billing',
                events: ['membership.cancelled'],
                isActive: true,
                lastTriggeredAt: null,
                lastStatusCode: null,
              },
            ],
            summary: { apiKeysCount: 0, webhooksCount: 2, activeWebhooksCount: 2 },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          developer: {
            availableEvents: ['membership.created', 'membership.cancelled'],
            apiKeys: [],
            webhooks: [
              {
                id: 31,
                name: 'Membership webhook updated',
                targetUrl: 'https://example.com/webhooks/membership-updated',
                events: ['membership.created', 'membership.cancelled'],
                isActive: false,
                lastTriggeredAt: null,
                lastStatusCode: null,
              },
              {
                id: 32,
                name: 'Billing webhook',
                targetUrl: 'https://example.com/webhooks/billing',
                events: ['membership.cancelled'],
                isActive: true,
                lastTriggeredAt: null,
                lastStatusCode: null,
              },
            ],
            summary: { apiKeysCount: 0, webhooksCount: 2, activeWebhooksCount: 1 },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          developer: {
            availableEvents: ['membership.created', 'membership.cancelled'],
            apiKeys: [],
            webhooks: [
              {
                id: 31,
                name: 'Membership webhook updated',
                targetUrl: 'https://example.com/webhooks/membership-updated',
                events: ['membership.created', 'membership.cancelled'],
                isActive: false,
                lastTriggeredAt: null,
                lastStatusCode: null,
              },
            ],
            summary: { apiKeysCount: 0, webhooksCount: 1, activeWebhooksCount: 0 },
          },
        },
      });
    api.createDeveloperWebhook.mockResolvedValue({
      message: 'Webhook created successfully.',
      data: { secret: 'webhook-secret-value' },
    });
    api.updateDeveloperWebhook.mockResolvedValue({ message: 'Webhook updated successfully.' });
    api.deleteDeveloperWebhook.mockResolvedValue({ message: 'Webhook deleted successfully.' });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    await screen.findByRole('combobox');
    await user.click(screen.getByRole('button', { name: 'Developer portal' }));

    expect(await screen.findByDisplayValue('Membership webhook')).toBeInTheDocument();

    const webhookNameInputs = screen.getAllByRole('textbox', { name: 'Webhook name' });
    const webhookUrlInputs = screen.getAllByRole('textbox', { name: 'Target URL' });
    const membershipCreatedCheckboxes = screen.getAllByLabelText('membership.created');

    await user.type(webhookNameInputs[0], 'Billing webhook');
    await user.type(webhookUrlInputs[0], 'https://example.com/webhooks/billing');
    await user.click(membershipCreatedCheckboxes[0]);
    await user.click(screen.getByRole('button', { name: 'Create webhook' }));

    await waitFor(() => expect(api.createDeveloperWebhook).toHaveBeenCalledWith({
      name: 'Billing webhook',
      targetUrl: 'https://example.com/webhooks/billing',
      events: ['membership.created'],
      isActive: true,
    }));
    expect(await screen.findByText('webhook-secret-value')).toBeInTheDocument();

    const membershipWebhookCard = screen.getByDisplayValue('Membership webhook').closest('div.rounded-2xl');

    await user.clear(within(membershipWebhookCard).getByRole('textbox', { name: 'Webhook name' }));
    await user.type(within(membershipWebhookCard).getByRole('textbox', { name: 'Webhook name' }), 'Membership webhook updated');
    await user.clear(within(membershipWebhookCard).getByRole('textbox', { name: 'Target URL' }));
    await user.type(within(membershipWebhookCard).getByRole('textbox', { name: 'Target URL' }), 'https://example.com/webhooks/membership-updated');
    await user.click(within(membershipWebhookCard).getByLabelText('membership.cancelled'));
    await user.click(within(membershipWebhookCard).getByRole('switch'));
    await user.click(within(membershipWebhookCard).getByRole('button', { name: 'Save webhook' }));

    await waitFor(() => expect(api.updateDeveloperWebhook).toHaveBeenCalledWith(31, {
      name: 'Membership webhook updated',
      targetUrl: 'https://example.com/webhooks/membership-updated',
      events: ['membership.created', 'membership.cancelled'],
      isActive: false,
    }));

    const billingWebhookCard = screen.getByDisplayValue('Billing webhook').closest('div.rounded-2xl');

    await user.click(within(billingWebhookCard).getByRole('button', { name: 'Delete webhook' }));

    await waitFor(() => expect(api.deleteDeveloperWebhook).toHaveBeenCalledWith(32));
    expect(await screen.findByDisplayValue('Membership webhook updated')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Billing webhook')).not.toBeInTheDocument();
  });
});